import { NextResponse } from "next/server";
import { proxyAuthenticatedPassthrough } from "@/lib/api/proxy";

const ALLOWED = [
  "accounts/account",
  "accounts/me",
  "accounts/network",
  "investments",
  "capital-activities",
  "portfolio",
  "marketplace",
  "transfers",
  "secondary-market-interests",
];

function upstreamPath(segments: string[], request: Request) {
  const joined = segments
    .map((segment) => decodeURIComponent(segment))
    .filter(Boolean)
    .join("/");

  if (!joined || joined.includes("..") || joined.startsWith("admin")) {
    return null;
  }

  const allowed = ALLOWED.some(
    (prefix) => joined === prefix || joined.startsWith(`${prefix}/`),
  );
  if (!allowed) return null;

  const query = new URL(request.url).searchParams.toString();
  const path = `/api/${joined}/`;
  return query ? `${path}?${query}` : path;
}

async function forward(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const path = upstreamPath(segments, request);
  if (!path) {
    return NextResponse.json({ message: "Unknown API path" }, { status: 404 });
  }

  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return proxyAuthenticatedPassthrough(path, { method });
  }

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    return proxyAuthenticatedPassthrough(path, { method, body: form });
  }

  const text = await request.text();
  const init: RequestInit = { method };
  if (text) {
    init.body = text;
    init.headers = { "Content-Type": contentType || "application/json" };
  } else if (method !== "DELETE") {
    init.body = "{}";
  }

  return proxyAuthenticatedPassthrough(path, init);
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;

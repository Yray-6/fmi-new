import { NextResponse } from "next/server";
import {
  authenticatedBackendFetch,
  clearAuthCookies,
  readBackendError,
  setAuthCookies,
} from "./backend";

async function proxyAuthenticated(path: string, init: RequestInit = {}) {
  const result = await authenticatedBackendFetch(path, init);

  if (!result.ok) {
    const response = NextResponse.json(
      { message: result.message },
      { status: result.status },
    );
    if (result.status === 401) {
      clearAuthCookies(response);
    }
    return response;
  }

  if (!result.response.ok) {
    const message = await readBackendError(result.response);
    const response = NextResponse.json(
      { message },
      { status: result.response.status },
    );
    if (result.response.status === 401) {
      clearAuthCookies(response);
    }
    return response;
  }

  const contentType = result.response.headers.get("content-type") || "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await result.response.json() : { ok: true };
  const response = NextResponse.json(data, { status: result.response.status });

  if (result.refreshed) {
    setAuthCookies(response, {
      access: result.access,
      refresh: result.refresh,
    });
  }

  return response;
}

export async function proxyAuthenticatedGet(path: string) {
  return proxyAuthenticated(path);
}

export async function proxyAuthenticatedPost(path: string, body?: unknown) {
  return proxyAuthenticated(path, {
    method: "POST",
    body: body === undefined ? "{}" : JSON.stringify(body),
  });
}

export async function proxyAuthenticatedPatch(path: string, body?: unknown) {
  return proxyAuthenticated(path, {
    method: "PATCH",
    body: body === undefined ? "{}" : JSON.stringify(body),
  });
}

export async function proxyAuthenticatedDelete(path: string) {
  return proxyAuthenticated(path, { method: "DELETE" });
}

export async function proxyAuthenticatedPassthrough(
  path: string,
  init: RequestInit = {},
) {
  const result = await authenticatedBackendFetch(path, init);

  if (!result.ok) {
    const response = NextResponse.json(
      { message: result.message },
      { status: result.status },
    );
    if (result.status === 401) clearAuthCookies(response);
    return response;
  }

  if (!result.response.ok) {
    const message = await readBackendError(result.response);
    const response = NextResponse.json(
      { message },
      { status: result.response.status },
    );
    if (result.response.status === 401) clearAuthCookies(response);
    return response;
  }

  const headers = new Headers();
  const contentType = result.response.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const disposition = result.response.headers.get("content-disposition");
  if (disposition) headers.set("content-disposition", disposition);

  const response = new NextResponse(result.response.body, {
    status: result.response.status,
    headers,
  });

  if (result.refreshed) {
    setAuthCookies(response, {
      access: result.access,
      refresh: result.refresh,
    });
  }

  return response;
}

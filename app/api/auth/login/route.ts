import { NextResponse } from "next/server";
import {
  backendFetch,
  isBackendUnavailableError,
  readBackendError,
  setAuthCookies,
} from "@/lib/api/backend";
import { toSessionUser } from "@/lib/api/session";
import type { ApiLoginResponse } from "@/lib/api/types";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    const upstream = await backendFetch("/api/accounts/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!upstream.ok) {
      const message = await readBackendError(upstream);
      return NextResponse.json({ message }, { status: upstream.status });
    }

    const data = (await upstream.json()) as ApiLoginResponse;
    const response = NextResponse.json({ user: toSessionUser(data.user) });
    setAuthCookies(response, {
      access: data.tokens.access,
      refresh: data.tokens.refresh,
    });
    return response;
  } catch (error) {
    if (isBackendUnavailableError(error)) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }
    console.error("Login proxy failed:", error);
    return NextResponse.json(
      { message: "Sign-in failed. Please try again." },
      { status: 500 },
    );
  }
}

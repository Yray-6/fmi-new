import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = "fmi_access";
export const REFRESH_COOKIE = "fmi_refresh";

const ACCESS_MAX_AGE = 60 * 60; // 1 hour
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getApiUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(
  response: NextResponse,
  tokens: { access: string; refresh: string },
) {
  response.cookies.set(ACCESS_COOKIE, tokens.access, cookieOptions(ACCESS_MAX_AGE));
  response.cookies.set(
    REFRESH_COOKIE,
    tokens.refresh,
    cookieOptions(REFRESH_MAX_AGE),
  );
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export class BackendUnavailableError extends Error {
  constructor(message = "Backend unavailable") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

export function isBackendUnavailableError(
  error: unknown,
): error is BackendUnavailableError {
  return error instanceof BackendUnavailableError;
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
  accessToken?: string | null,
) {
  const headers = new Headers(init.headers);
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!headers.has("Content-Type") && init.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = `${getApiUrl()}${path}`;

  try {
    return await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    const code =
      error instanceof Error && "cause" in error
        ? (error.cause as { code?: string } | undefined)?.code
        : undefined;

    if (
      code === "ECONNREFUSED" ||
      (error instanceof TypeError && error.message === "fetch failed")
    ) {
      throw new BackendUnavailableError(
        `Cannot reach the API at ${getApiUrl()}. Start the backend or set API_URL in .env.local.`,
      );
    }

    throw error;
  }
}

async function refreshAccessToken(refreshToken: string) {
  const response = await backendFetch("/api/accounts/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    access: string;
    refresh?: string;
  };

  return {
    access: data.access,
    refresh: data.refresh || refreshToken,
  };
}

export type AuthenticatedResult =
  | { ok: true; response: Response; access: string; refresh: string; refreshed: boolean }
  | { ok: false; status: number; message: string };

/**
 * Call an authenticated backend endpoint, refreshing the access token once on 401.
 */
export async function authenticatedBackendFetch(
  path: string,
  init: RequestInit = {},
): Promise<AuthenticatedResult> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;

  if (!access && !refresh) {
    return { ok: false, status: 401, message: "Not authenticated" };
  }

  let currentAccess = access || "";
  let currentRefresh = refresh || "";
  let refreshed = false;

  try {
    let response = await backendFetch(path, init, currentAccess || null);

    if (response.status === 401 && currentRefresh) {
      const tokens = await refreshAccessToken(currentRefresh);
      if (!tokens) {
        return { ok: false, status: 401, message: "Session expired" };
      }
      currentAccess = tokens.access;
      currentRefresh = tokens.refresh;
      refreshed = true;
      response = await backendFetch(path, init, currentAccess);
    }

    if (response.status === 401) {
      return { ok: false, status: 401, message: "Not authenticated" };
    }

    return {
      ok: true,
      response,
      access: currentAccess,
      refresh: currentRefresh,
      refreshed,
    };
  } catch (error) {
    if (isBackendUnavailableError(error)) {
      return { ok: false, status: 503, message: error.message };
    }
    throw error;
  }
}

export async function readBackendError(response: Response) {
  try {
    const data = (await response.json()) as {
      detail?: string;
      message?: string;
      non_field_errors?: string[];
      email?: string[];
      password?: string[];
    };
    return (
      data.message ||
      data.detail ||
      data.non_field_errors?.[0] ||
      data.email?.[0] ||
      data.password?.[0] ||
      "Request failed"
    );
  } catch {
    return "Request failed";
  }
}

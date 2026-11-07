import { NextResponse } from "next/server";
import {
  authenticatedBackendFetch,
  clearAuthCookies,
  setAuthCookies,
  readBackendError,
} from "@/lib/api/backend";
import { toSessionUser } from "@/lib/api/session";
import type { ApiUserProfile } from "@/lib/api/types";

export async function GET() {
  const result = await authenticatedBackendFetch(
    "/api/accounts/account/profile/",
  );

  if (!result.ok) {
    const response = NextResponse.json(
      { user: null, message: result.message },
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
      { user: null, message },
      { status: result.response.status },
    );
    if (result.response.status === 401) {
      clearAuthCookies(response);
    }
    return response;
  }

  const profile = (await result.response.json()) as ApiUserProfile;
  const response = NextResponse.json({ user: toSessionUser(profile) });

  if (result.refreshed) {
    setAuthCookies(response, {
      access: result.access,
      refresh: result.refresh,
    });
  }

  return response;
}

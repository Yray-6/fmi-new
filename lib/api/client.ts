import { useSessionStore } from "@/lib/store/use-session-store";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let logoutStarted = false;

/** Clear the session when the BFF says the user is no longer authenticated. */
export function logoutIfUnauthenticated(status: number) {
  if (status !== 401 || logoutStarted || typeof window === "undefined") return;
  const { status: sessionStatus, logout } = useSessionStore.getState();
  if (sessionStatus === "unauthenticated") return;
  logoutStarted = true;
  void logout().finally(() => {
    logoutStarted = false;
  });
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function bffGet<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    logoutIfUnauthenticated(response.status);
    throw new ApiError(await readError(response), response.status);
  }

  return response.json() as Promise<T>;
}

export async function bffRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
  });

  if (!response.ok) {
    logoutIfUnauthenticated(response.status);
    throw new ApiError(await readError(response), response.status);
  }

  if (response.status === 204) return { ok: true } as T;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return { ok: true } as T;
  }

  return response.json() as Promise<T>;
}

export async function bffPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? "{}" : JSON.stringify(body),
  });

  if (!response.ok) {
    logoutIfUnauthenticated(response.status);
    throw new ApiError(await readError(response), response.status);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return { ok: true } as T;
  }

  return response.json() as Promise<T>;
}

export function bffPatch<T>(path: string, body?: unknown) {
  return bffRequest<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

export function bffDelete<T>(path: string) {
  return bffRequest<T>(path, { method: "DELETE" });
}

export async function bffDownload(path: string, filename: string) {
  const response = await fetch(path, { credentials: "same-origin" });
  if (!response.ok) {
    logoutIfUnauthenticated(response.status);
    throw new ApiError(await readError(response), response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

import { bffGet } from "./client";
import type { PaginatedResponse } from "./types";

export async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;

  while (page <= 50) {
    const joiner = path.includes("?") ? "&" : "?";
    const payload = await bffGet<PaginatedResponse<T> | T[]>(
      `${path}${joiner}page=${page}`,
    );
    if (Array.isArray(payload)) return payload;
    const results = payload.results || [];
    items.push(...results);
    if (!payload.next || results.length === 0) break;
    page += 1;
  }

  return items;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function asList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    );
  }
  const record = asRecord(payload);
  if (!record) return [];
  for (const key of ["results", "sessions", "documents", "activities", "data"]) {
    const value = record[key];
    if (Array.isArray(value)) return asList(value);
  }
  return [];
}

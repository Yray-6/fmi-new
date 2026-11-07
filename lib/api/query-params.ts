/** Build URLSearchParams; multi-value keys are repeated (Django-friendly). */
export function buildQueryParams(
  entries: Record<
    string,
    string | number | boolean | Array<string | number> | null | undefined
  >,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined || item === "") continue;
        params.append(key, String(item));
      }
      continue;
    }
    params.set(key, String(value));
  }
  return params;
}

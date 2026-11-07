function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Record<string, unknown> => !!item && typeof item === "object",
    );
  }
  const record = asRecord(payload);
  if (!record) return [];
  for (const key of [
    "history",
    "results",
    "series",
    "performance",
    "data",
    "points",
    "performance_history",
  ]) {
    if (Array.isArray(record[key])) return asRows(record[key]);
  }
  return [];
}

function numberFrom(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export interface PerformancePoint {
  label: string;
  valuation: number;
  invested: number;
}

export function extractPerformancePoints(payload: unknown): PerformancePoint[] {
  return asRows(payload)
    .map((item) => {
      const valuation = numberFrom(item, [
        "valuation",
        "current_value",
        "value",
        "portfolio_value",
        "amount",
      ]);
      if (valuation === null) return null;
      const invested =
        numberFrom(item, ["invested", "total_invested", "cost"]) ?? valuation;
      const label = String(
        item.label || item.date || item.period || item.month || "",
      );
      return { label, valuation, invested };
    })
    .filter((point): point is PerformancePoint => point !== null);
}

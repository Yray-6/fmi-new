import { holdings, type Holding } from "../portfolio/data";

export type RangeId = "1M" | "3M" | "YTD" | "ALL";

export type Point = {
  label: string;
  valuation: number;
  invested: number;
};

export const rangeOptions: {
  id: RangeId;
  pill: string;
  dates: string;
  opening: string;
  movement: string;
}[] = [
  {
    id: "1M",
    pill: "1M",
    dates: "24 Sep 2026 – 24 Oct 2026",
    opening: "24 Sep",
    movement: "1M",
  },
  {
    id: "3M",
    pill: "3M",
    dates: "24 Jul 2026 – 24 Oct 2026",
    opening: "24 Jul",
    movement: "3M",
  },
  {
    id: "YTD",
    pill: "YTD",
    dates: "01 Jan 2026 – 24 Oct 2026",
    opening: "1 Jan",
    movement: "YTD",
  },
  {
    id: "ALL",
    pill: "All time",
    dates: "01 Jan 2025 – 24 Oct 2026",
    opening: "1 Jan 2025",
    movement: "All time",
  },
];

export const portfolioIrr = 11.8;
export const realizedExitGain = 3840;
export const valuationDate = "30 Sep 2026";

export const holdingInsights: Record<string, { ytdDistributions: number; irr: number }> = {
  greenhaven: { ytdDistributions: 1800, irr: 14.2 },
  helix: { ytdDistributions: 2200, irr: 11.4 },
  meridian: { ytdDistributions: 1100, irr: 9.6 },
  northstar: { ytdDistributions: 520, irr: 8.1 },
  fieldwork: { ytdDistributions: 0, irr: 7.2 },
  cedar: { ytdDistributions: 850, irr: 12.8 },
};

const sectorOrder = [
  "Healthcare",
  "Clean energy",
  "Technology",
  "Consumer",
  "Food & agriculture",
] as const;

export const sectorColors: Record<(typeof sectorOrder)[number], string> = {
  Healthcare: "#32A364",
  "Clean energy": "#69AE8D",
  Technology: "#A7CEB2",
  Consumer: "#CCDDBE",
  "Food & agriculture": "#486553",
};

const distributionEvents: { label: string; amount: number; ranges: RangeId[] }[] = [
  { label: "2025", amount: 2150, ranges: ["ALL"] },
  { label: "Jan", amount: 400, ranges: ["YTD", "ALL"] },
  { label: "Feb", amount: 450, ranges: ["YTD", "ALL"] },
  { label: "Mar", amount: 500, ranges: ["YTD", "ALL"] },
  { label: "Apr", amount: 550, ranges: ["YTD", "ALL"] },
  { label: "May", amount: 450, ranges: ["YTD", "ALL"] },
  { label: "Jun", amount: 600, ranges: ["YTD", "ALL"] },
  { label: "Jul", amount: 950, ranges: ["3M", "YTD", "ALL"] },
  { label: "Aug", amount: 720, ranges: ["3M", "YTD", "ALL"] },
  { label: "Sep", amount: 1400, ranges: ["1M", "3M", "YTD", "ALL"] },
  { label: "Oct", amount: 450, ranges: ["1M", "3M", "YTD", "ALL"] },
];

export const valuationSeries: Record<RangeId, Point[]> = {
  "1M": [
    { label: "Sep 24", valuation: 218000, invested: 195000 },
    { label: "Oct 24", valuation: 224680, invested: 200000 },
  ],
  "3M": [
    { label: "Jul 24", valuation: 199850, invested: 185000 },
    { label: "Aug", valuation: 210900, invested: 192000 },
    { label: "Sep", valuation: 218000, invested: 195000 },
    { label: "Oct 24", valuation: 224680, invested: 200000 },
  ],
  YTD: [
    { label: "Jan", valuation: 145000, invested: 135000 },
    { label: "", valuation: 149600, invested: 140000 },
    { label: "Mar", valuation: 159600, invested: 148000 },
    { label: "", valuation: 174700, invested: 160000 },
    { label: "May", valuation: 177700, invested: 165000 },
    { label: "", valuation: 189800, invested: 175000 },
    { label: "Jul", valuation: 199850, invested: 185000 },
    { label: "", valuation: 210900, invested: 192000 },
    { label: "Sep", valuation: 218000, invested: 195000 },
    { label: "Oct 24", valuation: 224680, invested: 200000 },
  ],
  ALL: [
    { label: "Jan 25", valuation: 82000, invested: 80000 },
    { label: "", valuation: 91000, invested: 85000 },
    { label: "Jul 25", valuation: 104000, invested: 95000 },
    { label: "", valuation: 118000, invested: 110000 },
    { label: "Jan", valuation: 145000, invested: 135000 },
    { label: "", valuation: 174700, invested: 160000 },
    { label: "Jul", valuation: 199850, invested: 185000 },
    { label: "Oct 24", valuation: 224680, invested: 200000 },
  ],
};

export function scalePoints(points: Point[], holding: Holding) {
  const last = points[points.length - 1];
  const valueFactor = holding.valuation / last.valuation;
  const investedFactor = holding.invested / last.invested;
  const scaled = points.map((point) => ({
    label: point.label,
    valuation: Math.round(point.valuation * valueFactor),
    invested: Math.round(point.invested * investedFactor),
  }));
  scaled[scaled.length - 1] = {
    ...scaled[scaled.length - 1],
    valuation: holding.valuation,
    invested: holding.invested,
  };
  return scaled;
}

export function bridgeOf(points: Point[]) {
  const opening = points[0].valuation;
  const closing = points[points.length - 1].valuation;
  const capital = points[points.length - 1].invested - points[0].invested;
  return {
    opening,
    closing,
    capital,
    movement: closing - opening - capital,
  };
}

export function allocateAmounts(weights: number[], target: number) {
  if (weights.length === 0 || target === 0) return weights.map(() => 0);
  const sum = weights.reduce((total, value) => total + value, 0);
  if (sum <= 0) return weights.map(() => 0);
  const rounded = weights.map((value) => Math.round((value / sum) * target));
  let drift = target - rounded.reduce((total, value) => total + value, 0);
  const order = weights
    .map((value, index) => ({ value, index }))
    .sort((left, right) => right.value - left.value);
  let cursor = 0;
  while (drift !== 0 && cursor < weights.length * (Math.abs(drift) + 2)) {
    const index = order[cursor % order.length].index;
    if (drift > 0) {
      rounded[index] += 1;
      drift -= 1;
    } else if (rounded[index] > 0) {
      rounded[index] -= 1;
      drift += 1;
    }
    cursor += 1;
  }
  return rounded;
}

export function cashflowFor(rangeId: RangeId, holding?: Holding) {
  const events = distributionEvents.filter((event) => event.ranges.includes(rangeId));
  if (!holding) return events.map((event) => ({ label: event.label, amount: event.amount }));

  const insight = holdingInsights[holding.id];
  if (rangeId === "ALL") {
    const ytdEvents = events.filter((event) => event.label !== "2025");
    const allocated = allocateAmounts(
      ytdEvents.map((event) => event.amount),
      insight.ytdDistributions,
    );
    return [
      { label: "2025", amount: holding.distributions - insight.ytdDistributions },
      ...ytdEvents.map((event, index) => ({ label: event.label, amount: allocated[index] })),
    ];
  }

  const portfolioTotal = events.reduce((total, event) => total + event.amount, 0);
  const ytdTotal = distributionEvents
    .filter((event) => event.ranges.includes("YTD"))
    .reduce((total, event) => total + event.amount, 0);
  const target =
    rangeId === "YTD"
      ? insight.ytdDistributions
      : Math.round(portfolioTotal * (insight.ytdDistributions / ytdTotal));
  const allocated = allocateAmounts(
    events.map((event) => event.amount),
    target,
  );
  return events.map((event, index) => ({ label: event.label, amount: allocated[index] }));
}

export function sectorBreakdown(rows: Holding[]) {
  const grouped = sectorOrder
    .map((name) => ({
      name,
      color: sectorColors[name],
      value: rows
        .filter((holding) => holding.sector === name)
        .reduce((total, holding) => total + holding.valuation, 0),
    }))
    .filter((sector) => sector.value > 0);
  const total = grouped.reduce((sum, sector) => sum + sector.value, 0);
  if (total === 0) return [];

  const exacts = grouped.map((sector) => (sector.value / total) * 1000);
  const tenths = exacts.map((value) => Math.floor(value));
  let remainder = 1000 - tenths.reduce((sum, value) => sum + value, 0);
  const order = exacts
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);
  for (const item of order) {
    if (remainder <= 0) break;
    tenths[item.index] += 1;
    remainder -= 1;
  }

  return grouped.map((sector, index) => ({
    ...sector,
    share: tenths[index] / 10,
  }));
}

export function axisTicks(points: Point[]) {
  const values = points.flatMap((point) => [point.valuation, point.invested]);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min *= 0.9;
    max *= 1.1;
  }
  let step = niceStep((max - min) / 4);
  let axisMin = Math.floor(min / step) * step;
  let axisMax = Math.ceil(max / step) * step;
  let count = Math.round((axisMax - axisMin) / step);
  if (count > 6) {
    step *= 2;
    axisMin = Math.floor(min / step) * step;
    axisMax = Math.ceil(max / step) * step;
    count = Math.round((axisMax - axisMin) / step);
  }
  const ticks = Array.from({ length: count + 1 }, (_, index) =>
    Math.round(axisMax - index * step),
  );
  return { axisMin: ticks[ticks.length - 1], axisMax: ticks[0], ticks };
}

function niceStep(rough: number) {
  if (rough <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(rough));
  const error = rough / power;
  const nice = error <= 1 ? 1 : error <= 2 ? 2 : error <= 2.5 ? 2.5 : error <= 5 ? 5 : 10;
  return nice * power;
}

export function axisMoney(value: number) {
  const thousands = value / 1000;
  if (Math.abs(value) >= 1000) {
    const text = Number.isInteger(thousands) ? thousands.toFixed(0) : thousands.toFixed(1);
    return `₦${text}k`;
  }
  return `₦${Math.round(value)}`;
}

export function cashScale(max: number) {
  if (max <= 0) return 0;
  const step = max <= 500 ? 50 : max <= 2000 ? 100 : 500;
  return Math.ceil(max / step) * step;
}

export function percentText(part: number, whole: number) {
  if (whole === 0) return "0%";
  const hundredths = Math.round((part / whole) * 10000);
  const digits = hundredths % 10 === 0 ? 1 : 2;
  return `${(hundredths / 100).toFixed(digits)}%`;
}

export function reportHoldings() {
  return [...holdings].sort((left, right) => right.valuation - left.valuation);
}

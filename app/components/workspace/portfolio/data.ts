export type Holding = {
  id: string;
  name: string;
  channel: string;
  structure: string;
  sector: string;
  invested: number;
  valuation: number;
  distributions: number;
  code?: string;
  unitsOwned?: number;
  acquired?: string;
  costPerUnit?: number;
  unitValue?: number;
  valuationDate?: string;
  pendingUnits?: number;
  latestDistribution?: { amount: number; date: string };
};

export type PortfolioDocument = {
  id: string;
  holdingId: string;
  title: string;
  sideTitle?: string;
  summary: string;
  detail: string;
  group: "ownership" | "issuer";
  href?: string;
};

export const sectors = [
  "Healthcare",
  "Clean energy",
  "Technology",
  "Consumer",
  "Food & agriculture",
] as const;

export const structures = ["Equity", "Private debt", "Revenue share"] as const;

export const holdings: Holding[] = [
  {
    id: "greenhaven",
    name: "Greenhaven Health",
    channel: "Primary",
    structure: "Equity",
    sector: "Healthcare",
    invested: 50000,
    valuation: 57800,
    distributions: 2400,
  },
  {
    id: "helix",
    name: "Helix Solar",
    channel: "Primary",
    structure: "Private debt",
    sector: "Clean energy",
    invested: 40000,
    valuation: 44800,
    distributions: 3000,
    latestDistribution: { amount: 450, date: "24 Oct 2026" },
  },
  {
    id: "meridian",
    name: "Meridian Foods",
    channel: "Primary",
    structure: "Revenue share",
    sector: "Consumer",
    invested: 35000,
    valuation: 38150,
    distributions: 1500,
  },
  {
    id: "northstar",
    name: "Northstar Logistics",
    channel: "Secondary",
    structure: "Equity",
    sector: "Technology",
    invested: 30000,
    valuation: 32400,
    distributions: 720,
    code: "NSL-EQ-004",
    unitsOwned: 3000,
    acquired: "12 Feb 2026",
    costPerUnit: 10,
    unitValue: 10.8,
    valuationDate: "30 Sep 2026",
    pendingUnits: 500,
  },
  {
    id: "fieldwork",
    name: "Fieldwork Labs",
    channel: "Primary",
    structure: "Equity",
    sector: "Technology",
    invested: 25000,
    valuation: 26800,
    distributions: 0,
  },
  {
    id: "cedar",
    name: "Cedar Agriculture",
    channel: "Secondary",
    structure: "Equity",
    sector: "Food & agriculture",
    invested: 20000,
    valuation: 24730,
    distributions: 1000,
    unitsOwned: 2000,
    acquired: "12 Sep 2026",
    unitValue: 12.365,
    valuationDate: "30 Sep 2026",
  },
];

export const documents: PortfolioDocument[] = [
  {
    id: "greenhaven-cert",
    holdingId: "greenhaven",
    title: "Greenhaven Health · Ownership certificate",
    summary: "Executed · Active holding · Private document",
    detail: "Executed · Active holding · Private document",
    group: "ownership",
  },
  {
    id: "helix-subscription",
    holdingId: "helix",
    title: "Helix Solar · Executed debt subscription",
    summary: "Executed · Active holding · Private document",
    detail: "Executed · Active holding · Private document",
    group: "ownership",
  },
  {
    id: "meridian-cert",
    holdingId: "meridian",
    title: "Meridian Foods · Ownership certificate",
    summary: "Executed · Active holding · Private document",
    detail: "Executed · Active holding · Private document",
    group: "ownership",
  },
  {
    id: "northstar-cert",
    holdingId: "northstar",
    title: "Northstar · Ownership certificate",
    sideTitle: "Northstar · Ownership certificate",
    summary: "3,000 units · Issued 12 Feb 2026",
    detail: "3,000 units · Issued 12 Feb 2026 · Transfer pending for 500 units",
    group: "ownership",
  },
  {
    id: "fieldwork-cert",
    holdingId: "fieldwork",
    title: "Fieldwork Labs · Ownership certificate",
    summary: "Executed · Active holding · Private document",
    detail: "Executed · Active holding · Private document",
    group: "ownership",
  },
  {
    id: "cedar-cert",
    holdingId: "cedar",
    title: "Cedar Agriculture · Ownership certificate",
    sideTitle: "Cedar · Ownership certificate",
    summary: "2,000 units · Reassigned 12 Sep 2026",
    detail: "2,000 units · Reassigned 12 Sep 2026",
    group: "ownership",
  },
  {
    id: "northstar-agreement",
    holdingId: "northstar",
    title: "Northstar · Executed subscription agreement",
    sideTitle: "Executed subscription agreement",
    summary: "Signed · 12 Feb 2026 · PDF",
    detail: "Signed · 12 Feb 2026 · PDF",
    group: "issuer",
  },
  {
    id: "northstar-report",
    holdingId: "northstar",
    title: "Northstar · Q3 2026 shareholder report",
    sideTitle: "Q3 2026 shareholder report",
    summary: "Valuation update · 30 Sep 2026",
    detail: "Valuation update · 30 Sep 2026 · PDF",
    group: "issuer",
  },
];

export const policy =
  "Valuations reflect the latest available issuer or independent reports and may not represent a sale price. Unrealized gains are not cash returns. Secondary liquidity and ownership transfers are subject to terms and approvals.";

export function money(value: number, digits = 0) {
  return value.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function signedMoney(value: number, digits = 0) {
  const formatted = money(Math.abs(value), digits);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function gainOf(holding: Holding) {
  return holding.valuation - holding.invested;
}

export function gainPercent(holding: Holding) {
  const percent = (gainOf(holding) / holding.invested) * 100;
  return `${(Math.round(percent * 10) / 10).toFixed(1)}%`;
}

export function holdingById(id: string) {
  return holdings.find((holding) => holding.id === id);
}

export function downloadText(filename: string, contents: string, type = "text/plain") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

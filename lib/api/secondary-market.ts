import { ApiError, bffGet, bffPost } from "./client";
import { fetchAllPages } from "./pagination";
import { buildQueryParams } from "./query-params";
import type { ApiSecondaryMarketListing, PaginatedResponse } from "./types";
import { formatNaira } from "@/lib/utils/formatters";

export type SecondaryOrdering =
  | "featured"
  | "newest"
  | "asking"
  | "transfer_amount"
  | "name"
  | `-featured`
  | `-newest`
  | `-asking`
  | `-transfer_amount`
  | `-name`;

export type SecondaryListing = {
  id: string;
  name: string;
  code: string;
  sector: string;
  sectorCode: string;
  asking: string;
  askingValue: number | null;
  minimum: string;
  quoted: boolean;
  detail: string;
  seller: string;
  sellerInitials: string;
  status: string;
  statusCode: string;
  transferType: string;
  transferTypeCode: string;
  isPartial: boolean;
  percentage: number | null;
  transferLabel: string;
  termLabel: string;
  feeValue: number | null;
  feeLabel: string;
  netValue: number | null;
  netLabel: string;
  buyerPayableValue: number | null;
  buyerPayableLabel: string;
  reason: string;
  listedAt: string;
  listedAtLabel: string;
  estimatedCompletion: string;
  estimatedCompletionLabel: string;
  opportunityId: string | null;
  opportunityTitle: string | null;
  riskLevel: string;
  investmentTermYears: number | null;
  investmentTermLabel: string;
  targetIrr: string;
  payoutFrequency: string;
  structureLabel: string;
};

export type SecondaryListParams = {
  search?: string;
  sector?: string | string[];
  transfer_type?: "FULL" | "PARTIAL" | Array<"FULL" | "PARTIAL">;
  min_amount?: number;
  max_amount?: number;
  ordering?: SecondaryOrdering;
};

function parseAmount(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function formatListingDate(value: string | null | undefined) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function moneyLabel(value: number | null) {
  return value === null ? "Not provided" : formatNaira(value);
}

export function mapSecondaryListing(
  data: ApiSecondaryMarketListing,
): SecondaryListing {
  const askingValue = parseAmount(data.transfer_amount);
  const feeValue = parseAmount(data.transfer_fee);
  const netValue = parseAmount(data.net_amount);
  const minValue = parseAmount(data.opportunity_min_investment);
  const percentage = parseAmount(data.percentage);
  const years = data.opportunity_investment_term_years;
  const isPartial =
    data.transfer_type === "PARTIAL" ||
    String(data.is_partial).toLowerCase() === "true" ||
    String(data.is_partial).toLowerCase() === "yes";
  const transferType =
    data.transfer_type_display ||
    (isPartial ? "Partial transfer" : "Full transfer");
  const transferLabel =
    isPartial && percentage !== null
      ? `Partial transfer · ${Math.round(percentage)}%`
      : transferType;
  const termLabel =
    years && years > 0
      ? `${years} ${years === 1 ? "year" : "years"}`
      : "Not provided";
  const buyerPayableValue =
    askingValue === null
      ? null
      : feeValue === null
        ? askingValue
        : askingValue + feeValue;
  const seller = data.seller_display_name || "Verified seller";
  const listedAtLabel = formatListingDate(data.listed_at);
  const estimatedCompletionLabel = formatListingDate(
    data.estimated_completion_date,
  );
  const structureLabel =
    data.opportunity_payout_frequency ||
    data.transfer_type_display ||
    "Private investment";

  return {
    id: String(data.id),
    name: data.investment_name || data.opportunity_title || "Listing",
    code: `SM-${data.id}`,
    sector: data.investment_sector_display || data.investment_sector || "Other",
    sectorCode:
      data.investment_sector || data.investment_sector_display || "OTHER",
    asking: askingValue === null ? "Request quote" : formatNaira(askingValue),
    askingValue,
    minimum: minValue === null ? "See terms" : formatNaira(minValue),
    quoted: askingValue !== null,
    detail: `${transferType} · ${termLabel}`,
    seller,
    sellerInitials: initialsFromName(seller),
    status: data.status_display || data.status || "Listed",
    statusCode: data.status || "",
    transferType,
    transferTypeCode: data.transfer_type || "",
    isPartial,
    percentage,
    transferLabel,
    termLabel,
    feeValue,
    feeLabel: moneyLabel(feeValue),
    netValue,
    netLabel: moneyLabel(netValue),
    buyerPayableValue,
    buyerPayableLabel: moneyLabel(buyerPayableValue),
    reason: (data.reason || "").trim(),
    listedAt: data.listed_at || "",
    listedAtLabel: listedAtLabel || "Not provided",
    estimatedCompletion: data.estimated_completion_date || "",
    estimatedCompletionLabel: estimatedCompletionLabel || "Not provided",
    opportunityId:
      data.opportunity_id !== null && data.opportunity_id !== undefined
        ? String(data.opportunity_id)
        : null,
    opportunityTitle: data.opportunity_title || data.investment_name || null,
    riskLevel: data.opportunity_risk_level || "Not provided",
    investmentTermYears: years,
    investmentTermLabel: termLabel,
    targetIrr: data.opportunity_target_irr
      ? `${data.opportunity_target_irr}${String(data.opportunity_target_irr).includes("%") ? "" : "%"}`
      : "Not provided",
    payoutFrequency: data.opportunity_payout_frequency || "Not provided",
    structureLabel,
  };
}

function normalizeList(
  payload:
    | PaginatedResponse<ApiSecondaryMarketListing>
    | ApiSecondaryMarketListing[],
): { results: ApiSecondaryMarketListing[]; count: number } {
  if (Array.isArray(payload)) {
    return { results: payload, count: payload.length };
  }
  const results = Array.isArray(payload.results) ? payload.results : [];
  return {
    results,
    count: typeof payload.count === "number" ? payload.count : results.length,
  };
}

export async function fetchSecondaryListings(
  params?: SecondaryListParams,
): Promise<{ listings: SecondaryListing[]; count: number }> {
  const search = buildQueryParams({
    search: params?.search,
    sector: params?.sector,
    transfer_type: params?.transfer_type,
    min_amount: params?.min_amount,
    max_amount: params?.max_amount,
    ordering: params?.ordering,
  });
  const qs = search.toString();
  const path = qs ? `/api/secondary-market?${qs}` : "/api/secondary-market";

  const pages = await fetchAllPages<ApiSecondaryMarketListing>(path);
  if (pages.length > 0) {
    return {
      listings: pages.map(mapSecondaryListing),
      count: pages.length,
    };
  }

  const payload = await bffGet<
    PaginatedResponse<ApiSecondaryMarketListing> | ApiSecondaryMarketListing[]
  >(path);
  const normalized = normalizeList(payload);
  return {
    listings: normalized.results.map(mapSecondaryListing),
    count: normalized.count,
  };
}

export async function fetchSecondaryListing(
  id: string,
): Promise<SecondaryListing> {
  const data = await bffGet<ApiSecondaryMarketListing>(
    `/api/secondary-market/${id}`,
  );
  return mapSecondaryListing(data);
}

export async function expressSecondaryInterest(id: string) {
  try {
    await bffPost(`/api/secondary-market/${id}/interest`);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Could not express interest", 500);
  }
}

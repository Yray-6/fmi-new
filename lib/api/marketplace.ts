import { ApiError, bffGet, bffPost, logoutIfUnauthenticated } from "./client";
import { fetchAllPages } from "./pagination";
import { buildQueryParams } from "./query-params";
import type {
  ApiMarketplaceOpportunity,
  ApiOpportunityDetail,
  PaginatedResponse,
} from "./types";
import { formatNaira } from "@/lib/utils/formatters";

export type RiskCode = "LOW" | "MEDIUM" | "HIGH";
export type InvestmentTypeCode = "FIXED" | "VARIABLE";
export type OpportunityOrdering =
  | "featured"
  | "closing"
  | "min_investment"
  | "title"
  | "newest"
  | `-featured`
  | `-closing`
  | `-min_investment`
  | `-title`
  | `-newest`;

export type Opportunity = {
  id: string;
  name: string;
  sector: string;
  /** Backend sector enum/code for ?sector= filters. */
  sectorCode: string;
  risk: "Low" | "Medium" | "High";
  riskCode: RiskCode;
  structure: string;
  structureCode: InvestmentTypeCode | "";
  image: string;
  fundedLabel: string;
  fundedPercent: number;
  minimumLabel: string;
  minimumValue: number;
  projected: string;
  status: string;
  term: string;
  featured: boolean;
  illustrative?: boolean;
};

export type OpportunityListParams = {
  search?: string;
  sector?: string | string[];
  risk_level?: RiskCode | RiskCode[];
  investment_type?: InvestmentTypeCode | InvestmentTypeCode[];
  max_min_investment?: number;
  ordering?: OpportunityOrdering;
  status?: string | string[];
};

const PLACEHOLDER_IMAGES = [
  "/marketplace/helix-solar.png",
  "/marketplace/greenhaven-health.png",
  "/marketplace/meridian-foods.png",
  "/marketplace/fieldwork-labs.png",
  "/marketplace/cedar-agriculture.png",
  "/marketplace/northstar-logistics.png",
  "/marketplace/solstice-storage.png",
  "/marketplace/tidal-efficiency.png",
] as const;

function parseAmount(value: string | number | null | undefined) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapRisk(
  riskDisplay?: string,
  riskLevel?: string,
): { risk: Opportunity["risk"]; riskCode: RiskCode } {
  const code = (riskLevel || "").toUpperCase();
  if (code === "HIGH" || `${riskDisplay || ""}`.toLowerCase().includes("high")) {
    return { risk: "High", riskCode: "HIGH" };
  }
  if (code === "LOW" || `${riskDisplay || ""}`.toLowerCase().includes("low")) {
    return { risk: "Low", riskCode: "LOW" };
  }
  return { risk: "Medium", riskCode: "MEDIUM" };
}

function mapStructure(
  type?: string,
  typeDisplay?: string,
): { structure: string; structureCode: InvestmentTypeCode | "" } {
  const code = (type || "").toUpperCase();
  if (code === "FIXED" || code === "VARIABLE") {
    return {
      structure: typeDisplay || (code === "FIXED" ? "Fixed" : "Variable"),
      structureCode: code,
    };
  }
  return {
    structure: typeDisplay || type || "Equity",
    structureCode: "",
  };
}

function compactMoney(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `₦${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    return `₦${Math.round(value / 1_000)}k`;
  }
  return formatNaira(value);
}

export function mapOpportunity(data: ApiMarketplaceOpportunity): Opportunity {
  const target = parseAmount(data.target_raise_amount);
  const raised = parseAmount(data.current_raised_amount);
  const progress = parseAmount(data.funding_progress_percentage);
  const minimum = parseAmount(data.min_investment);
  const irr = data.target_irr ? parseAmount(data.target_irr) : null;
  const image =
    PLACEHOLDER_IMAGES[Math.abs(data.id) % PLACEHOLDER_IMAGES.length];
  const { risk, riskCode } = mapRisk(data.risk_level_display, data.risk_level);
  const { structure, structureCode } = mapStructure(
    data.investment_type,
    data.investment_type_display,
  );

  return {
    id: String(data.id),
    name: data.title,
    sector: data.sector_display || data.sector || "Other",
    sectorCode: data.sector || data.sector_display || "OTHER",
    risk,
    riskCode,
    structure,
    structureCode,
    image,
    fundedLabel: `${compactMoney(raised)} of ${compactMoney(target)} funded`,
    fundedPercent: Math.max(0, Math.min(100, Math.round(progress))),
    minimumLabel: formatNaira(minimum),
    minimumValue: minimum,
    projected:
      irr !== null && irr > 0
        ? `${irr % 1 === 0 ? irr.toFixed(0) : irr.toFixed(1)}% p.a.`
        : "Not provided",
    status: data.status_display || data.status,
    term:
      data.investment_term_years > 0
        ? `${data.investment_term_years} ${data.investment_term_years === 1 ? "year" : "years"}`
        : "Term TBC",
    featured: Boolean(data.is_featured),
    illustrative: false,
  };
}

function normalizeList(
  payload:
    | PaginatedResponse<ApiMarketplaceOpportunity>
    | ApiMarketplaceOpportunity[]
    | {
        opportunities?: ApiMarketplaceOpportunity[];
        watchlist?: ApiMarketplaceOpportunity[];
        total_count?: number;
      },
): ApiMarketplaceOpportunity[] {
  if (Array.isArray(payload)) return payload;
  if ("results" in payload && Array.isArray(payload.results)) {
    return payload.results;
  }
  if ("watchlist" in payload && Array.isArray(payload.watchlist)) {
    return payload.watchlist;
  }
  if ("opportunities" in payload && Array.isArray(payload.opportunities)) {
    return payload.opportunities;
  }
  return [];
}

export async function fetchOpportunities(
  params?: OpportunityListParams,
): Promise<Opportunity[]> {
  const search = buildQueryParams({
    search: params?.search,
    sector: params?.sector,
    risk_level: params?.risk_level,
    investment_type: params?.investment_type,
    max_min_investment: params?.max_min_investment,
    ordering: params?.ordering,
    status: params?.status,
  });
  const qs = search.toString();
  const path = qs
    ? `/api/marketplace/opportunities?${qs}`
    : "/api/marketplace/opportunities";

  const pages = await fetchAllPages<ApiMarketplaceOpportunity>(path);
  if (pages.length > 0) return pages.map(mapOpportunity);

  const payload = await bffGet<
    PaginatedResponse<ApiMarketplaceOpportunity> | ApiMarketplaceOpportunity[]
  >(path);
  return normalizeList(payload).map(mapOpportunity);
}

export async function fetchWatchlist(): Promise<Opportunity[]> {
  const payload = await bffGet<
    | ApiMarketplaceOpportunity[]
    | {
        watchlist?: ApiMarketplaceOpportunity[];
        opportunities?: ApiMarketplaceOpportunity[];
        total_count?: number;
      }
    | PaginatedResponse<ApiMarketplaceOpportunity>
  >("/api/marketplace/watchlist");
  return normalizeList(payload).map(mapOpportunity);
}

export async function addToWatchlist(id: string) {
  const response = await fetch(`/api/marketplace/opportunities/${id}/bookmark`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) {
    let message = "Could not save to watchlist";
    try {
      const data = (await response.json()) as { message?: string };
      message = data.message || message;
    } catch {
      // keep default
    }
    logoutIfUnauthenticated(response.status);
    throw new ApiError(message, response.status);
  }
}

export async function removeFromWatchlist(id: string) {
  const response = await fetch(`/api/marketplace/opportunities/${id}/bookmark`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!response.ok) {
    let message = "Could not remove from watchlist";
    try {
      const data = (await response.json()) as { message?: string };
      message = data.message || message;
    } catch {
      // keep default
    }
    logoutIfUnauthenticated(response.status);
    throw new ApiError(message, response.status);
  }
}

export async function fetchOpportunityDetail(
  id: string,
): Promise<ApiOpportunityDetail> {
  return bffGet(`/api/marketplace/opportunities/${id}`);
}

export async function requestOpportunityInformation(id: string) {
  await bffPost(
    `/api/bff/marketplace/opportunities/${id}/request_information`,
    {},
  );
}

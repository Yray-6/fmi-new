import { ApiError, bffGet, bffPatch, bffPost } from "./client";
import { asList } from "./pagination";
import { buildQueryParams } from "./query-params";
import type {
  ApiInvestorCategory,
  ApiInvestorDirectoryResponse,
  ApiInvestorProfile,
  ApiInvestorProfileResponse,
  ApiNetworkConnection,
  ApiNetworkConnectionStatus,
} from "./types";
import { formatNaira } from "@/lib/utils/formatters";

const BASE = "/api/bff/accounts/network";

export type NetworkConnectionStatus =
  | "none"
  | "pending"
  | "accepted"
  | "rejected"
  | "self";

export type InvestorCategory =
  | "FAMILY_OFFICE"
  | "ANGEL"
  | "VC"
  | "PE"
  | "INSTITUTIONAL"
  | "INDIVIDUAL";

export type NetworkInvestor = {
  id: string;
  displayName: string;
  initials: string;
  investorCategory: string;
  investorCategoryDisplay: string;
  location: string;
  investmentsCount: number;
  totalInvested: number;
  totalInvestedLabel: string;
  currentValue: number;
  currentValueLabel: string;
  preferredSectors: string[];
  bio: string;
  connectionStatus: NetworkConnectionStatus;
};

export type NetworkSectorAllocation = {
  sector: string;
  percent: number;
};

export type NetworkRecentInvestment = {
  name: string;
  sector: string;
  invested: number;
  investedLabel: string;
  currentValue: number;
  performance: number;
  date: string;
};

export type NetworkInvestorDetails = {
  investor: NetworkInvestor;
  investmentsCount: number;
  totalInvested: number;
  totalInvestedLabel: string;
  currentValue: number;
  currentValueLabel: string;
  sectorAllocation: NetworkSectorAllocation[];
  recentInvestments: NetworkRecentInvestment[];
  connectionStatus: NetworkConnectionStatus;
};

export type NetworkConnection = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  investor: NetworkInvestor;
};

export type NetworkDirectoryParams = {
  page?: number;
  search?: string;
  sector?: string;
  location?: string;
};

export type NetworkDirectoryResult = {
  investors: NetworkInvestor[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UpdateMyNetworkProfileInput = {
  displayName?: string;
  investorCategory?: InvestorCategory;
  preferredSectors?: string[];
};

function amount(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function initialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function mapConnectionStatus(
  value: ApiNetworkConnectionStatus | undefined,
): NetworkConnectionStatus {
  if (
    value === "none" ||
    value === "pending" ||
    value === "accepted" ||
    value === "rejected" ||
    value === "self"
  ) {
    return value;
  }
  return "none";
}

export function mapInvestorProfile(
  data: ApiInvestorProfile,
  connectionStatus?: ApiNetworkConnectionStatus,
): NetworkInvestor {
  const displayName = text(data.display_name, "Anonymous Investor");
  const totalInvested = amount(data.total_invested);
  const currentValue = amount(data.current_value);

  return {
    id: String(data.id),
    displayName,
    initials: initialsFromName(displayName),
    investorCategory: text(data.investor_category),
    investorCategoryDisplay:
      text(data.investor_category_display) || "Not specified",
    location: text(data.location) || "Not specified",
    investmentsCount: amount(data.investments_count),
    totalInvested,
    totalInvestedLabel: formatNaira(totalInvested),
    currentValue,
    currentValueLabel: formatNaira(currentValue),
    preferredSectors: Array.isArray(data.preferred_sectors)
      ? data.preferred_sectors.filter((sector) => typeof sector === "string")
      : [],
    bio: text(data.bio),
    connectionStatus: mapConnectionStatus(
      connectionStatus ?? data.connection_status,
    ),
  };
}

function mapSectorAllocation(
  allocation: Record<string, number> | null | undefined,
): NetworkSectorAllocation[] {
  if (!allocation || typeof allocation !== "object") return [];
  return Object.entries(allocation)
    .map(([sector, percent]) => ({
      sector,
      percent: amount(percent),
    }))
    .filter((item) => item.sector)
    .sort((left, right) => right.percent - left.percent);
}

export function mapInvestorDetails(
  data: ApiInvestorProfileResponse,
): NetworkInvestorDetails {
  const status = mapConnectionStatus(data.connection_status);
  const investor = mapInvestorProfile(data.profile, status);
  const overview = data.portfolio_overview;
  const totalInvested = investor.totalInvested;
  const currentValue = amount(overview?.total_value) || investor.currentValue;
  const investmentsCount =
    amount(overview?.investments_count) || investor.investmentsCount;

  return {
    investor,
    investmentsCount,
    totalInvested,
    totalInvestedLabel: formatNaira(totalInvested),
    currentValue,
    currentValueLabel: formatNaira(currentValue),
    sectorAllocation: mapSectorAllocation(overview?.sector_allocation),
    recentInvestments: (data.recent_investments || []).map((item) => {
      const invested = amount(item.invested);
      return {
        name: text(item.name, "Investment"),
        sector: text(item.sector) || "Other",
        invested,
        investedLabel: formatNaira(invested),
        currentValue: amount(item.current_value),
        performance: amount(item.performance),
        date: text(item.date),
      };
    }),
    connectionStatus: status,
  };
}

function mapConnection(data: ApiNetworkConnection): NetworkConnection {
  return {
    id: String(data.id),
    status: data.status,
    createdAt: text(data.created_at),
    investor: mapInvestorProfile(data.investor, data.status),
  };
}

export async function fetchNetworkDirectory(
  params?: NetworkDirectoryParams,
): Promise<NetworkDirectoryResult> {
  const search = buildQueryParams({
    page: params?.page ?? 1,
    search: params?.search,
    sector: params?.sector,
    location: params?.location,
  });
  const qs = search.toString();
  const path = qs ? `${BASE}/directory?${qs}` : `${BASE}/directory`;

  const payload = await bffGet<ApiInvestorDirectoryResponse>(path);
  const investors = Array.isArray(payload.investors) ? payload.investors : [];

  return {
    investors: investors.map((item) => mapInvestorProfile(item)),
    count: amount(payload.total_count) || investors.length,
    page: amount(payload.page) || 1,
    pageSize: amount(payload.page_size) || investors.length,
    totalPages: amount(payload.total_pages) || 1,
  };
}

export async function fetchNetworkInvestor(
  id: string,
): Promise<NetworkInvestorDetails> {
  const data = await bffGet<ApiInvestorProfileResponse>(
    `${BASE}/${id}/profile`,
  );
  return mapInvestorDetails(data);
}

export async function sendNetworkConnection(
  targetId: string,
  message?: string,
) {
  try {
    await bffPost(`${BASE}/connect`, {
      to_investor: Number(targetId),
      ...(message?.trim() ? { message: message.trim() } : {}),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Could not send connection request", 500);
  }
}

export async function fetchNetworkConnections(): Promise<NetworkConnection[]> {
  const payload = await bffGet<ApiNetworkConnection[] | { results?: unknown }>(
    `${BASE}/connections`,
  );

  if (Array.isArray(payload)) {
    return payload.map(mapConnection);
  }

  return asList(payload).map((item) =>
    mapConnection(item as unknown as ApiNetworkConnection),
  );
}

export async function updateNetworkConnection(
  connectionId: string,
  status: "accepted" | "rejected",
) {
  try {
    await bffPatch(`${BASE}/${connectionId}/update_connection`, { status });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Could not update connection", 500);
  }
}

export async function fetchMyNetworkProfile(): Promise<NetworkInvestor> {
  const data = await bffGet<ApiInvestorProfile>(`${BASE}/my_profile`);
  return mapInvestorProfile(data);
}

export async function updateMyNetworkProfile(
  input: UpdateMyNetworkProfileInput,
): Promise<NetworkInvestor> {
  const body: {
    display_name?: string;
    investor_category?: ApiInvestorCategory;
    preferred_sectors?: string[];
  } = {};

  if (input.displayName !== undefined) {
    body.display_name = input.displayName;
  }
  if (input.investorCategory !== undefined) {
    body.investor_category = input.investorCategory;
  }
  if (input.preferredSectors !== undefined) {
    body.preferred_sectors = input.preferredSectors;
  }

  const data = await bffPatch<ApiInvestorProfile>(`${BASE}/my_profile`, body);
  return mapInvestorProfile(data);
}

/** Split connections into Pending vs Connected for My network UI. */
export function partitionNetworkConnections(connections: NetworkConnection[]) {
  const pending = connections.filter((item) => item.status === "pending");
  const connected = connections.filter((item) => item.status === "accepted");
  return {
    pending,
    connected,
    pendingCount: pending.length,
    connectedCount: connected.length,
  };
}

export function sharedPreferredSectors(
  mine: string[],
  theirs: string[],
): string[] {
  const theirsLower = new Set(theirs.map((sector) => sector.toLowerCase()));
  return mine.filter((sector) => theirsLower.has(sector.toLowerCase()));
}

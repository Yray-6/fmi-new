import { bffGet } from "./client";
import { fetchAllPages } from "./pagination";
import type {
  ApiCapitalActivity,
  ApiNetworkPortfolioOverview,
  InvestmentDetail,
  InvestmentListItem,
} from "./types";

export interface PortfolioHolding {
  id: string;
  name: string;
  channel: string;
  structure: string;
  sector: string;
  invested: number;
  valuation: number;
  distributions: number;
  status: string;
  statusCode: string;
  moic: number;
  irr: number | null;
  manager: string;
  investmentDate: string;
  opportunityId: number | null;
  unfunded: number;
  gain: number;
  gainPercent: number;
}

export interface PortfolioBundle {
  overview: ApiNetworkPortfolioOverview | null;
  holdings: PortfolioHolding[];
  activities: ApiCapitalActivity[];
  portfolioValue: number;
  invested: number;
  unrealized: number;
  distributions: number;
  annualizedIrr: number | null;
}

function amount(value: string | number | null | undefined) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function distributionsFor(
  investmentId: number,
  activities: ApiCapitalActivity[],
) {
  return activities
    .filter((activity) => activity.investment?.id === investmentId)
    .filter((activity) => {
      const type = activity.activity_type.toUpperCase();
      return type === "DISTRIBUTION" || type === "PARTIAL_EXIT" || type === "FULL_EXIT";
    })
    .reduce((sum, activity) => sum + Math.abs(amount(activity.amount)), 0);
}

export function mapHolding(
  item: InvestmentListItem | InvestmentDetail,
  activities: ApiCapitalActivity[],
): PortfolioHolding {
  const invested = amount(item.total_invested);
  const valuation = amount(item.current_value);
  const gain = amount(item.unrealized_gain) || valuation - invested;
  const gainPercent = invested
    ? amount(item.unrealized_gain_percentage) || (gain / invested) * 100
    : 0;
  const detail = item as InvestmentDetail;

  return {
    id: String(item.id),
    name: item.name || "Investment",
    channel: item.status_display || item.status || "Holding",
    structure: item.sector_display || item.sector || "Other",
    sector: item.sector_display || item.sector || "Other",
    invested,
    valuation,
    distributions: distributionsFor(item.id, activities),
    status: item.status_display || item.status,
    statusCode: (item.status || "").toUpperCase(),
    moic: amount(item.moic),
    irr:
      typeof detail.calculated_irr === "number" &&
      Number.isFinite(detail.calculated_irr)
        ? detail.calculated_irr
        : null,
    manager: detail.manager || "",
    investmentDate: item.investment_date || "",
    opportunityId: item.opportunity_id ?? null,
    unfunded: amount(detail.unfunded_commitment),
    gain,
    gainPercent,
  };
}

export async function fetchPortfolioBundle(): Promise<PortfolioBundle> {
  const [overview, investments, activities] = await Promise.all([
    bffGet<ApiNetworkPortfolioOverview>("/api/portfolio/overview").catch(
      () => null,
    ),
    fetchAllPages<InvestmentListItem>("/api/investments"),
    fetchAllPages<ApiCapitalActivity>("/api/capital-activities"),
  ]);

  const holdings = investments.map((item) => mapHolding(item, activities));
  const invested = holdings.reduce((sum, holding) => sum + holding.invested, 0);
  const valuation = holdings.reduce((sum, holding) => sum + holding.valuation, 0);
  const distributions = holdings.reduce(
    (sum, holding) => sum + holding.distributions,
    0,
  );

  return {
    overview,
    holdings,
    activities,
    portfolioValue: overview?.key_metrics?.portfolio_value ?? valuation,
    invested,
    unrealized: valuation - invested,
    distributions: overview?.key_metrics?.distributions_received ?? distributions,
    annualizedIrr:
      typeof overview?.key_metrics?.annualized_irr === "number"
        ? overview.key_metrics.annualized_irr
        : null,
  };
}

export function fetchInvestmentDetail(id: string) {
  return bffGet<InvestmentDetail>(`/api/bff/investments/${id}`);
}

export function fetchPerformanceHistory(id: string, days: number) {
  return bffGet<unknown>(
    `/api/bff/investments/${id}/performance_history?days=${days}`,
  );
}

export function fetchPerformanceAnalysis() {
  return bffGet<unknown>("/api/bff/portfolio/performance_analysis");
}

export function fetchRiskMetrics() {
  return bffGet<unknown>("/api/bff/portfolio/risk_metrics");
}

export function fetchAssetAllocation() {
  return bffGet<unknown>("/api/bff/portfolio/asset_allocation");
}

export function isExited(holding: PortfolioHolding) {
  return holding.statusCode === "EXITED";
}

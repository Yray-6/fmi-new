import { bffGet } from "./client";
import { mapOpportunity, type Opportunity } from "./marketplace";
import { fetchAllPages } from "./pagination";
import type {
  ApiCapitalActivity,
  ApiMarketplaceOpportunity,
  ApiNetworkPortfolioOverview,
  InvestmentListItem,
} from "./types";
import { formatNaira } from "@/lib/utils/formatters";

export interface OverviewHolding {
  id: number;
  name: string;
  structure: string;
  invested: number;
  valuation: number;
  unrealizedPct: number;
  status: string;
}

export interface OverviewSector {
  name: string;
  share: number;
  color: string;
}

export interface OverviewActivity {
  id: number;
  title: string;
  meta: string;
}

export interface OverviewPayout {
  id: number;
  date: string;
  name: string;
  detail: string;
  amount: string;
}

export interface OverviewSpotlightOpportunity {
  id: string;
  name: string;
  summary: string;
  minimum: string;
  target: string;
}

export interface OverviewDashboard {
  portfolioValue: number;
  unrealizedAmount: number;
  totalReturnPct: number;
  deployedCapital: number;
  holdingsCount: number;
  sectorCount: number;
  distributionsReceived: number;
  sectors: OverviewSector[];
  holdings: OverviewHolding[];
  activities: OverviewActivity[];
  upcomingPayouts: OverviewPayout[];
  spotlightOpportunities: OverviewSpotlightOpportunity[];
}

const SECTOR_COLORS = [
  "#32A364",
  "#69AE8D",
  "#A7CEB2",
  "#CCDDBE",
  "#486553",
  "#0B2118",
  "#7AE6AA",
];

function parseAmount(value: string | number | null | undefined) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatPayoutDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    .toUpperCase();
}

function formatActivityMeta(activity: ApiCapitalActivity) {
  const date = new Date(activity.date);
  const dateLabel = Number.isNaN(date.getTime())
    ? activity.date
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  return `${dateLabel} · ${activity.activity_type_display}`;
}

function mapUpcomingPayouts(activities: ApiCapitalActivity[]): OverviewPayout[] {
  const today = startOfToday();

  return activities
    .filter((activity) => activity.activity_type.toUpperCase() === "DISTRIBUTION")
    .map((activity) => {
      const date = new Date(activity.date);
      if (Number.isNaN(date.getTime())) return null;
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      if (normalized < today) return null;

      return {
        id: activity.id,
        date: formatPayoutDate(activity.date),
        name: activity.investment.name,
        detail: activity.activity_type_display,
        amount: formatNaira(Math.abs(parseAmount(activity.amount))),
        sortTime: normalized.getTime(),
      };
    })
    .filter(
      (
        payout,
      ): payout is OverviewPayout & { sortTime: number } => payout !== null,
    )
    .sort((a, b) => a.sortTime - b.sortTime)
    .slice(0, 3)
    .map(({ sortTime: _sortTime, ...payout }) => payout);
}

function isOpenOpportunity(opportunity: ApiMarketplaceOpportunity) {
  return opportunity.status.toUpperCase() !== "CLOSED";
}

function targetIrrRank(value: string | null | undefined) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pickSpotlightOpportunities(
  opportunities: ApiMarketplaceOpportunity[],
): OverviewSpotlightOpportunity[] {
  return [...opportunities]
    .filter(isOpenOpportunity)
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) {
        return Number(b.is_featured) - Number(a.is_featured);
      }

      const irrA = targetIrrRank(a.target_irr);
      const irrB = targetIrrRank(b.target_irr);
      if (irrA !== irrB) {
        if (irrA === null) return 1;
        if (irrB === null) return -1;
        return irrB - irrA;
      }

      const progressDiff =
        parseAmount(b.funding_progress_percentage) -
        parseAmount(a.funding_progress_percentage);
      if (progressDiff !== 0) return progressDiff;

      return (b.investors_count || 0) - (a.investors_count || 0);
    })
    .slice(0, 2)
    .map((item) => {
      const mapped: Opportunity = mapOpportunity(item);
      return {
        id: mapped.id,
        name: mapped.name,
        summary: `${mapped.sector} · ${mapped.structure}`,
        minimum: `${mapped.minimumLabel} min.`,
        target: mapped.projected,
      };
    });
}

export function mapOverviewDashboard(input: {
  network: ApiNetworkPortfolioOverview;
  investments: InvestmentListItem[];
  activities: ApiCapitalActivity[];
  opportunities?: ApiMarketplaceOpportunity[];
}): OverviewDashboard {
  const { network, investments, activities, opportunities = [] } = input;
  const km = network.key_metrics;

  const deployedCapital = investments.reduce(
    (sum, inv) => sum + parseAmount(inv.total_invested),
    0,
  );
  const totalValue = investments.reduce(
    (sum, inv) => sum + parseAmount(inv.current_value),
    0,
  );
  const unrealizedAmount = totalValue - deployedCapital;

  const sectors: OverviewSector[] = (network.sector_performance || []).map(
    (sector, index) => ({
      name: sector.sector_display || sector.sector,
      share: sector.percentage,
      color: SECTOR_COLORS[index % SECTOR_COLORS.length],
    }),
  );

  const holdings: OverviewHolding[] = investments.map((inv) => ({
    id: inv.id,
    name: inv.name,
    structure: inv.sector_display || inv.sector,
    invested: parseAmount(inv.total_invested),
    valuation: parseAmount(inv.current_value),
    unrealizedPct: parseAmount(inv.unrealized_gain_percentage),
    status: inv.status_display || inv.status,
  }));

  const mappedActivities: OverviewActivity[] = activities.slice(0, 5).map((activity) => {
    const amount = parseAmount(activity.amount);
    const signed =
      activity.activity_type.toUpperCase() === "DISTRIBUTION" ||
      activity.activity_type.toUpperCase() === "PARTIAL_EXIT"
        ? `+₦${Math.abs(amount).toLocaleString("en-NG")}`
        : `₦${Math.abs(amount).toLocaleString("en-NG")}`;

    return {
      id: activity.id,
      title: `${signed} ${activity.activity_type_display.toLowerCase()} from ${activity.investment.name}`,
      meta: formatActivityMeta(activity),
    };
  });

  return {
    portfolioValue: km?.portfolio_value ?? totalValue,
    unrealizedAmount,
    totalReturnPct: km?.total_portfolio_return ?? 0,
    deployedCapital,
    holdingsCount: investments.length,
    sectorCount: sectors.length,
    distributionsReceived: km?.distributions_received ?? 0,
    sectors,
    holdings,
    activities: mappedActivities,
    upcomingPayouts: mapUpcomingPayouts(activities),
    spotlightOpportunities: pickSpotlightOpportunities(opportunities),
  };
}

export async function fetchOverviewDashboard(): Promise<OverviewDashboard> {
  const [network, investments, activities, opportunities] = await Promise.all([
    bffGet<ApiNetworkPortfolioOverview>("/api/portfolio/overview"),
    fetchAllPages<InvestmentListItem>("/api/investments"),
    fetchAllPages<ApiCapitalActivity>("/api/capital-activities"),
    fetchAllPages<ApiMarketplaceOpportunity>(
      "/api/marketplace/opportunities",
    ).catch(() => [] as ApiMarketplaceOpportunity[]),
  ]);

  return mapOverviewDashboard({
    network,
    investments,
    activities,
    opportunities,
  });
}

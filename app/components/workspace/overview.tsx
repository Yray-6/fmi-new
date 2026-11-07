"use client";

import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "../closing-sections";
// import { AddFundsButton } from "./deposit-dialog";
import { useOverview } from "@/hooks/use-overview";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  formatNaira,
  formatPercent,
  greetingForNow,
} from "@/lib/utils/formatters";
import { OverviewSkeleton } from "./skeletons";

function TimeOfDayGreeting() {
  return greetingForNow();
}

const periods = ["1M", "3M", "YTD", "ALL"] as const;
const months = ["Jan", "Mar", "May", "Jul", "Sep", "Oct 24"] as const;

function PanelLink({
  children,
  href = "#",
  className = "",
}: {
  children: string;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`shrink-0 text-sm leading-[1.35] text-accent ${className}`}
    >
      {children}
    </a>
  );
}

function Panel({
  title,
  action,
  href,
  children,
  className = "",
  mobileMeta,
  desktopOnly = false,
}: {
  title: string;
  action?: string;
  href?: string;
  children: ReactNode;
  className?: string;
  mobileMeta?: string;
  desktopOnly?: boolean;
}) {
  return (
    <section
      className={`${desktopOnly ? "hidden lg:flex" : "flex"} min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 lg:p-[22px] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-base font-normal leading-[1.7] text-[#14271F] lg:text-[19px] lg:leading-snug">
          {title}
        </h2>
        {mobileMeta ? (
          <p className="shrink-0 text-right text-[10px] leading-[1.4] text-[#718078] lg:hidden">
            {mobileMeta}
          </p>
        ) : null}
        {action ? (
          <PanelLink
            href={href}
            className={mobileMeta ? "hidden lg:inline" : undefined}
          >
            {action}
          </PanelLink>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SectorRow({
  name,
  share,
  color,
  compact = false,
}: {
  name: string;
  share: string;
  color: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-[7px] shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span
        className={`min-w-0 text-[#53645B] ${compact ? "text-xs" : "flex-1 text-sm"}`}
      >
        {name}
      </span>
      <span className="text-sm font-semibold leading-[1.35] text-[#14271F]">
        {share}
      </span>
    </div>
  );
}

function valueOrPlaceholder(
  isLoading: boolean,
  hasData: boolean,
  value: string,
) {
  if (isLoading && !hasData) return "…";
  return value;
}

export function Overview() {
  const user = useSessionStore((state) => state.user);
  const { data, isLoading, isError, error, isFetching } = useOverview();

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";
  const hasLiveData = !!data;

  if (isLoading && !hasLiveData) {
    return <OverviewSkeleton />;
  }

  const sectors = data?.sectors ?? [];
  const holdings = data?.holdings ?? [];
  const activities = data?.activities ?? [];
  const upcomingPayouts = data?.upcomingPayouts ?? [];
  const spotlightOpportunities = data?.spotlightOpportunities ?? [];

  const allocationMeta = hasLiveData
    ? `${data.holdingsCount} holdings across ${data.sectorCount} sectors`
    : isLoading
      ? "Loading…"
      : "—";

  const metrics = [
    {
      label: "Portfolio Value",
      value: valueOrPlaceholder(
        isLoading,
        hasLiveData,
        hasLiveData ? formatNaira(data.portfolioValue) : "—",
      ),
      detail: valueOrPlaceholder(
        isLoading,
        hasLiveData,
        hasLiveData
          ? `${formatNaira(data.unrealizedAmount)} unrealized`
          : "—",
      ),
      tone: "dark" as const,
      detailClass: "text-[#2FC382]",
    },
    {
      label: "Invested Capital",
      value: valueOrPlaceholder(
        isLoading,
        hasLiveData,
        hasLiveData ? formatNaira(data.deployedCapital) : "—",
      ),
      detail: valueOrPlaceholder(isLoading, hasLiveData, allocationMeta),
      tone: "light" as const,
      detailClass: "text-[#718078]",
    },
    {
      label: "Realized gains",
      value: valueOrPlaceholder(
        isLoading,
        hasLiveData,
        hasLiveData ? formatNaira(data.distributionsReceived) : "—",
      ),
      detail: valueOrPlaceholder(
        isLoading,
        hasLiveData,
        hasLiveData ? "Lifetime distributions received" : "—",
      ),
      tone: "light" as const,
      detailClass: "text-accent",
    },
    {
      label: "Average ROI",
      value: valueOrPlaceholder(
        isLoading,
        hasLiveData,
        hasLiveData ? formatPercent(data.totalReturnPct) : "—",
      ),
      detail: valueOrPlaceholder(
        isLoading,
        hasLiveData,
        hasLiveData ? "Total portfolio return" : "—",
      ),
      tone: "light" as const,
      detailClass: "text-accent",
    },
  ];

  return (
    <div>
      <div className="flex w-full min-w-0 flex-col gap-2.5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8">
        <div className="flex w-full min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full min-w-0 max-w-[640px] flex-col lg:gap-[5px]">
            <p className="text-[10px] font-semibold leading-[1.7] text-accent lg:text-xs lg:leading-normal">
              YOUR PRIVATE MARKETS, IN PERSPECTIVE
            </p>
            <h1 className="font-[family-name:var(--font-stack-sans)] text-base font-normal leading-[1.7] text-[#14271F] lg:text-[32px] lg:leading-[1.2]">
              <Suspense fallback="Good day">
                <TimeOfDayGreeting />
              </Suspense>
              , {firstName}.
            </h1>
            <p className="text-xs leading-[1.7] text-[#53645B] lg:text-base lg:leading-[1.4]">
              A clearer view of your capital, opportunities and what comes next.
            </p>
            {isError ? (
              <p className="mt-1 text-xs text-[#F43939] lg:text-sm">
                {error instanceof Error
                  ? error.message
                  : "Could not refresh overview data."}
                {isFetching ? " Retrying…" : ""}
              </p>
            ) : null}
          </div>
          <div className="hidden flex-wrap gap-2.5 lg:flex">
            {/* <AddFundsButton /> */}
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-lg border border-accent bg-accent px-[18px] py-2.5 text-base font-semibold leading-6 text-white"
            >
              Explore investments
              <img
                src="/workspace/icon-arrow-up-right.svg"
                alt=""
                width={16}
                height={16}
              />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:gap-4 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`flex min-w-0 flex-col rounded-[14px] border p-4 lg:gap-2 lg:p-5 ${
                metric.tone === "dark"
                  ? "border-[#0B2118] bg-[#0B2118]"
                  : "border-[#D9E5DD] bg-white"
              }`}
            >
              <p
                className={`text-xs leading-[1.8] lg:text-[15px] lg:leading-6 ${
                  metric.tone === "dark" ? "text-[#A8C5B2]" : "text-[#53645B]"
                }`}
              >
                {metric.label}
              </p>
              <p
                className={`font-[family-name:var(--font-stack-sans)] text-xl font-normal leading-[1.8] lg:text-[30px] lg:leading-none ${
                  metric.tone === "dark" ? "text-white" : "text-[#14271F]"
                }`}
              >
                {metric.value}
              </p>
              <p
                className={`break-words text-xs leading-[1.8] lg:text-[13px] lg:leading-5 ${metric.detailClass}`}
              >
                {metric.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-2 lg:hidden">
          {/* <AddFundsButton fullWidth /> */}
          <a
            href="/marketplace"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-4 text-xs font-semibold leading-6 text-white"
          >
            Explore investments
            <img
              src="/workspace/icon-arrow-up-right.svg"
              alt=""
              width={16}
              height={16}
            />
          </a>
        </div>

        <div className="grid gap-2.5 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <Panel
            title="Your portfolio, over time"
            action="View analytics"
            href="/analytics"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-[18px] text-[13px] leading-[1.35]">
                <span className="text-[#14271F]">
                  <span className="text-accent lg:text-[#14271F]">●</span>{" "}
                  Valuation
                </span>
                <span className="hidden text-[#718078] lg:inline">
                  ┄ Invested capital
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-[13px] leading-[1.35] text-[#718078] lg:gap-4">
                {periods.map((period) =>
                  period === "YTD" ? (
                    <span
                      key={period}
                      className="rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] font-medium text-accent"
                    >
                      {period}
                    </span>
                  ) : (
                    <span key={period}>{period}</span>
                  ),
                )}
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2.5">
              <div className="flex min-w-0 gap-2 lg:gap-3.5">
                <div className="flex h-[170px] w-12 shrink-0 flex-col justify-between text-xs text-[#718078]">
                  <span>₦225k</span>
                  <span>₦200k</span>
                  <span>₦175k</span>
                  <span>₦150k</span>
                  <span>₦125k</span>
                </div>
                <img
                  src="/workspace/valuation-chart.svg"
                  alt=""
                  className="h-[170px] w-0 min-w-0 flex-1 object-fill"
                />
              </div>
              <div className="flex justify-between pl-14 text-xs text-[#718078] lg:pl-[62px]">
                {months.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
            <p className="text-xs leading-[1.4] text-[#53645B]">
              Historical, illustrative valuations. Updated from issuer reports,
              not live market prices.
            </p>
          </Panel>

          <Panel
            title="Portfolio allocation"
            action="By sector"
            mobileMeta={allocationMeta}
          >
            <div className="hidden items-center justify-between gap-3 lg:flex">
              <p className="text-sm leading-[1.35] text-[#718078]">
                {allocationMeta}
              </p>
              <span className="rounded-[5px] bg-[#F4F9F6] px-2 py-[3px] text-[13px] font-medium text-[#53645B]">
                Diversified
              </span>
            </div>
            {sectors.length === 0 ? (
              <p className="text-sm text-[#718078]">
                {isLoading ? "Loading allocation…" : "No sector allocation yet."}
              </p>
            ) : (
              <>
                <div className="flex h-4 overflow-hidden rounded" aria-hidden>
                  {sectors.map((sector) => (
                    <div
                      key={sector.name}
                      className="h-full border-r-2 border-white last:border-r-0"
                      style={{
                        width: `${sector.share}%`,
                        backgroundColor: sector.color,
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-x-3 gap-y-4 lg:hidden">
                  {sectors.map((sector) => (
                    <SectorRow
                      key={sector.name}
                      compact
                      name={sector.name}
                      share={`${sector.share.toFixed(1)}%`}
                      color={sector.color}
                    />
                  ))}
                </div>
                <div className="hidden flex-col gap-[13px] lg:flex">
                  {sectors.map((sector) => (
                    <SectorRow
                      key={sector.name}
                      name={sector.name}
                      share={`${sector.share.toFixed(1)}%`}
                      color={sector.color}
                    />
                  ))}
                </div>
              </>
            )}
          </Panel>
        </div>

        <div className="grid gap-2.5 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <Panel title="Your holdings" action="View portfolio →" href="/portfolio">
            {holdings.length === 0 ? (
              <p className="text-sm text-[#718078]">
                {isLoading ? "Loading holdings…" : "No holdings yet."}
              </p>
            ) : (
              <>
                <ul className="flex flex-col gap-3 lg:hidden">
                  {holdings.map((holding) => (
                    <li
                      key={holding.id}
                      className="relative rounded-lg bg-[#F4F9F6] px-3 py-4"
                    >
                      <div className="pr-20 leading-[1.8]">
                        <p className="text-xs text-[#718078]">
                          Business / structure
                        </p>
                        <p className="text-sm font-semibold text-[#14271F]">
                          {holding.name} | {holding.structure}
                        </p>
                        <p className="text-xs text-[#14271F]">
                          Invested: {formatNaira(holding.invested)}
                        </p>
                        <p className="text-xs text-[#14271F]">
                          Valuation: {formatNaira(holding.valuation)}
                        </p>
                        <p className="text-xs text-[#14271F]">
                          Unrealized: {formatPercent(holding.unrealizedPct)}
                        </p>
                      </div>
                      <span className="absolute top-4 right-5 inline-flex h-[22px] items-center justify-center rounded-full bg-[#7AE6AA] px-2 text-[10px] font-medium leading-none text-[#09793B]">
                        {holding.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="hidden min-w-0 overflow-x-auto lg:block">
                  <div className="min-w-[640px]">
                    <div className="flex items-center gap-3 rounded-md bg-[#F4F9F6] px-3 py-3 text-xs font-medium text-[#718078]">
                      <p className="w-[215px] shrink-0">Business / structure</p>
                      <p className="min-w-0 flex-1">Invested</p>
                      <p className="min-w-0 flex-1">Valuation</p>
                      <p className="min-w-0 flex-1">Unrealized</p>
                      <p className="min-w-0 flex-1">Status</p>
                    </div>
                    {holdings.map((holding) => (
                      <div
                        key={holding.id}
                        className="flex items-center gap-3 border-b border-[#D9E5DD] px-3 py-3.5"
                      >
                        <p className="w-[215px] shrink-0 text-sm font-semibold leading-[1.35] text-[#14271F]">
                          {holding.name}
                          <br />
                          {holding.structure}
                        </p>
                        <p className="min-w-0 flex-1 text-sm leading-[1.35] text-[#14271F]">
                          {formatNaira(holding.invested)}
                        </p>
                        <p className="min-w-0 flex-1 text-sm leading-[1.35] text-[#14271F]">
                          {formatNaira(holding.valuation)}
                        </p>
                        <p className="min-w-0 flex-1 text-sm leading-[1.35] text-accent">
                          {formatPercent(holding.unrealizedPct)}
                        </p>
                        <p className="min-w-0 flex-1 text-sm leading-[1.35] text-accent">
                          {holding.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <p className="text-sm leading-[1.6] text-[#53645B] lg:text-[15px]">
                Total lifetime distributions
              </p>
              <p className="text-sm font-semibold leading-[1.6] text-accent lg:text-[15px]">
                {valueOrPlaceholder(
                  isLoading,
                  hasLiveData,
                  hasLiveData ? formatNaira(data.distributionsReceived) : "—",
                )}
              </p>
            </div>
          </Panel>

          <Panel title="Upcoming payouts" action="Schedule →" href="/wallet">
            {upcomingPayouts.length === 0 ? (
              <p className="text-sm text-[#718078]">
                {isLoading ? "Loading payouts…" : "No scheduled payouts."}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {upcomingPayouts.map((payout) => (
                  <div key={payout.id} className="flex items-center gap-3">
                    <div className="flex w-[52px] shrink-0 items-center justify-center rounded-md bg-[#F4F9F6] px-2 py-2 text-center text-xs font-semibold leading-tight text-accent">
                      {payout.date}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-[1.7] text-[#14271F]">
                        {payout.name}
                      </p>
                      <p className="text-[15px] font-semibold leading-[1.7] text-[#718078] lg:text-xs lg:font-normal lg:leading-[1.35]">
                        {payout.detail}
                      </p>
                    </div>
                    <p className="shrink-0 text-base font-semibold leading-[1.35] text-[#14271F]">
                      {payout.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="grid gap-2.5 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <Panel
            title="Worth a closer look"
            action="Marketplace →"
            href="/marketplace"
            desktopOnly
          >
            {spotlightOpportunities.length === 0 ? (
              <p className="text-sm text-[#718078]">
                {isLoading ? "Loading opportunities…" : "No open opportunities."}
              </p>
            ) : (
              <div className="grid gap-[18px] sm:grid-cols-2">
                {spotlightOpportunities.map((opportunity) => (
                  <a
                    key={opportunity.id}
                    href={`/marketplace/${opportunity.id}`}
                    className="flex flex-col gap-[7px] rounded-[10px] bg-[#F4F9F6] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold leading-[1.35] text-[#14271F]">
                        {opportunity.name}
                      </h3>
                      <img
                        src="/workspace/icon-arrow-up-right-accent.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="mt-1 shrink-0"
                      />
                    </div>
                    <p className="text-sm leading-[1.4] text-[#53645B]">
                      {opportunity.summary}
                    </p>
                    <div className="flex items-center justify-between gap-3 text-[13px] leading-[1.35]">
                      <span className="text-[#14271F]">{opportunity.minimum}</span>
                      <span className="text-right text-[#718078]">
                        {opportunity.target}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
            <p className="text-xs leading-[1.4] text-[#53645B]">
              Target returns are not guaranteed. Review each opportunity’s risks
              and terms.
            </p>
          </Panel>

          <Panel title="Recent activity" action="View all →">
            {activities.length === 0 ? (
              <p className="text-sm text-[#718078]">
                {isLoading ? "Loading activity…" : "No recent activity."}
              </p>
            ) : (
              activities.map((event, index) => (
                <div key={event.id} className="flex flex-col gap-4">
                  {index > 0 ? <div className="h-px bg-[#D9E5DD]" /> : null}
                  <div className="flex flex-col lg:gap-[3px]">
                    <p className="text-sm leading-[1.7] text-[#53645B]">
                      {event.title}
                    </p>
                    <p className="text-sm leading-[1.7] text-[#53645B] lg:text-xs lg:leading-[1.4]">
                      {event.meta}
                    </p>
                  </div>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>

      <div className="lg:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}

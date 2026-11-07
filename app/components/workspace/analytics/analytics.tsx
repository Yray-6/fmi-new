"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePortfolio, usePortfolioAnalytics } from "@/hooks/use-portfolio";
import { extractPerformancePoints } from "@/lib/api/series";
import type { ApiCapitalActivity } from "@/lib/api/types";
import {
  downloadText,
  gainOf,
  money,
  signedMoney,
  type Holding,
} from "../portfolio/data";
import {
  axisMoney,
  axisTicks,
  cashScale,
  percentText,
  type Point,
  type RangeId,
} from "./data";

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.25v7.2M5.25 7.1 8 9.85l2.75-2.75M3.25 13.25h9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2.25"
        y="3.25"
        width="11.5"
        height="10.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.25 6.5h11.5M5.25 2.25v2.2M10.75 2.25v2.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Metric({
  label,
  value,
  detail,
  dark = false,
  detailClass = "text-[#718078]",
  mobile,
}: {
  label: string;
  value: string;
  detail: string;
  dark?: boolean;
  detailClass?: string;
  mobile?: { label: string; value: string; detail: string; detailClass?: string };
}) {
  const mobileDetailClass = mobile?.detailClass ?? detailClass;
  return (
    <article
      className={`flex min-w-0 flex-col rounded-[14px] border p-4 md:gap-2 md:p-5 ${
        dark ? "border-[#0B2118] bg-[#0B2118]" : "border-[#D9E5DD] bg-white"
      }`}
    >
      <p className={`text-[15px] leading-[1.8] md:leading-6 ${dark ? "text-[#A8C5B2]" : "text-[#53645B]"}`}>
        {mobile ? (
          <>
            <span className="md:hidden">{mobile.label}</span>
            <span className="hidden md:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </p>
      <p
        className={`font-[family-name:var(--font-stack-sans)] font-normal ${
          dark
            ? "text-xl leading-[1.6] text-white md:text-[30px] md:leading-none"
            : "break-words text-xl leading-[1.6] text-[#14271F] md:text-[30px] md:leading-none"
        }`}
      >
        {mobile ? (
          <>
            <span className="md:hidden">{mobile.value}</span>
            <span className="hidden md:inline">{value}</span>
          </>
        ) : (
          value
        )}
      </p>
      <p className="break-words text-[13px] leading-[1.8] md:leading-5">
        {mobile ? (
          <>
            <span className={`md:hidden ${mobileDetailClass}`}>{mobile.detail}</span>
            <span className={`hidden md:inline ${detailClass}`}>{detail}</span>
          </>
        ) : (
          <span className={detailClass}>{detail}</span>
        )}
      </p>
    </article>
  );
}

function DetailRow({
  label,
  value,
  valueClass = "text-[#14271F]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
      <p className="text-[13px] leading-[1.8] text-[#53645B] md:text-[15px] md:leading-6">{label}</p>
      <p className={`text-[15px] font-semibold leading-[1.8] md:shrink-0 md:leading-6 ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function PanelHeading({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-3">
      <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.7] text-[#14271F] md:leading-snug">
        {title}
      </h2>
      {aside}
    </div>
  );
}

function csv(rows: (string | number)[][]) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function ValuationChart({ points }: { points: { label: string; valuation: number; invested: number }[] }) {
  const { axisMin, axisMax, ticks } = axisTicks(points);
  const width = 1000;
  const height = 180;
  const span = axisMax - axisMin || 1;
  const x = (index: number) =>
    points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
  const y = (value: number) => ((axisMax - value) / span) * height;

  let valuation = `M ${x(0)} ${y(points[0].valuation)}`;
  let invested = `M ${x(0)} ${y(points[0].invested)}`;
  for (let index = 1; index < points.length; index++) {
    valuation += ` H ${x(index)} V ${y(points[index].valuation)}`;
    invested += ` H ${x(index)} V ${y(points[index].invested)}`;
  }
  const area = `${valuation} L ${x(points.length - 1)} ${height} L ${x(0)} ${height} Z`;

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex min-w-0 gap-2 md:gap-3.5">
        <div className="flex h-[180px] w-12 shrink-0 flex-col justify-between text-xs text-[#718078]">
          {ticks.map((tick) => (
            <span key={tick}>{axisMoney(tick)}</span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-[180px] w-0 min-w-0 flex-1"
          role="img"
          aria-label={`Valuation moved from ${money(points[0].valuation)} to ${money(points[points.length - 1].valuation)}`}
        >
          <path d={area} fill="#32A364" fillOpacity="0.06" />
          {ticks.map((tick) => (
            <line
              key={tick}
              x1="0"
              x2={width}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#D9E5DD"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={invested}
            fill="none"
            stroke="#A8C5B2"
            strokeWidth="2"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={valuation}
            fill="none"
            stroke="#32A364"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 pl-4 text-xs text-[#718078] md:hidden">
        {points.map((point, index) =>
          point.label ? <span key={`${point.label}-${index}`}>{point.label}</span> : null,
        )}
      </div>
      <div className="relative ml-[62px] hidden h-4 md:block">
        {points.map((point, index) =>
          point.label ? (
            <span
              key={`${point.label}-${index}`}
              className={`absolute top-0 whitespace-nowrap text-xs text-[#718078] ${
                index === 0 ? "left-0" : index === points.length - 1 ? "right-0" : "-translate-x-1/2"
              }`}
              style={
                index === 0 || index === points.length - 1
                  ? undefined
                  : { left: `${(index / (points.length - 1)) * 100}%` }
              }
            >
              {point.label}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

const RANGE_OPTIONS: { id: RangeId; pill: string; movement: string }[] = [
  { id: "1M", pill: "1M", movement: "1M" },
  { id: "3M", pill: "3M", movement: "3M" },
  { id: "YTD", pill: "YTD", movement: "YTD" },
  { id: "ALL", pill: "All time", movement: "All time" },
];

const SECTOR_COLORS = ["#32A364", "#69AE8D", "#A7CEB2", "#CCDDBE", "#486553", "#0B2118"];

function rangeStart(rangeId: RangeId, now: Date) {
  if (rangeId === "1M") return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  if (rangeId === "3M") return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  if (rangeId === "YTD") return new Date(now.getFullYear(), 0, 1);
  return new Date(0);
}

function cashflows(
  activities: ApiCapitalActivity[],
  rangeId: RangeId,
  holdingId: string,
  now: Date,
) {
  const start = rangeStart(rangeId, now);
  const buckets = new Map<string, number>();
  for (const activity of activities) {
    if (holdingId !== "all" && String(activity.investment?.id) !== holdingId) continue;
    const date = new Date(activity.date);
    if (Number.isNaN(date.getTime()) || date < start) continue;
    const label = date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    const amount = Math.abs(Number(activity.amount) || 0);
    buckets.set(label, (buckets.get(label) || 0) + amount);
  }
  return [...buckets.entries()].map(([label, amount]) => ({ label, amount }));
}

export function Analytics() {
  const portfolio = usePortfolio();
  const analytics = usePortfolioAnalytics();
  const [rangeId, setRangeId] = useState<RangeId>("YTD");
  const [holdingId, setHoldingId] = useState("all");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const holdings = useMemo(
    () =>
      (portfolio.data?.holdings || []).map(
        (holding): Holding => ({
          id: holding.id,
          name: holding.name,
          channel: holding.status,
          structure: holding.sector,
          sector: holding.sector,
          invested: holding.invested,
          valuation: holding.valuation,
          distributions: holding.distributions,
        }),
      ),
    [portfolio.data?.holdings],
  );
  const range = RANGE_OPTIONS.find((option) => option.id === rangeId) ?? RANGE_OPTIONS[2];
  const selected = holdings.find((holding) => holding.id === holdingId);
  const rows = selected ? [selected] : holdings;
  const series = extractPerformancePoints(analytics.data?.performance);
  const points: Point[] = series;
  const bridge = points.length
    ? {
        opening: points[0].valuation,
        closing: points[points.length - 1].valuation,
        capital: points[points.length - 1].invested - points[0].invested,
        movement:
          points[points.length - 1].valuation -
          points[0].valuation -
          (points[points.length - 1].invested - points[0].invested),
      }
    : {
        opening: rows.reduce((total, holding) => total + holding.invested, 0),
        closing: rows.reduce((total, holding) => total + holding.valuation, 0),
        capital: 0,
        movement: rows.reduce((total, holding) => total + gainOf(holding), 0),
      };
  const bars = now
    ? cashflows(portfolio.data?.activities || [], rangeId, holdingId, now)
    : [];

  const periodDistributions = bars.reduce((total, bar) => total + bar.amount, 0);
  const invested = rows.reduce((total, holding) => total + holding.invested, 0);
  const currentValuation = rows.reduce((total, holding) => total + holding.valuation, 0);
  const unrealized = rows.reduce((total, holding) => total + gainOf(holding), 0);
  const lifetimeDistributions = rows.reduce((total, holding) => total + holding.distributions, 0);
  const realized = (portfolio.data?.activities || [])
    .filter((activity) => activity.activity_type === "FULL_EXIT")
    .filter((activity) => holdingId === "all" || String(activity.investment?.id) === holdingId)
    .reduce((total, activity) => total + Math.abs(Number(activity.amount) || 0), 0);
  const generated = unrealized + realized + lifetimeDistributions;
  const selectedSource = portfolio.data?.holdings.find((holding) => holding.id === holdingId);
  const irr = selectedSource?.irr ?? portfolio.data?.annualizedIrr ?? 0;
  const sectorNames = Array.from(new Set(rows.map((holding) => holding.sector)));
  const sectors = sectorNames.map((name, index) => {
    const value = rows
      .filter((holding) => holding.sector === name)
      .reduce((total, holding) => total + holding.valuation, 0);
    return { name, value, color: SECTOR_COLORS[index % SECTOR_COLORS.length], share: 0 };
  });
  const sectorTotal = sectors.reduce((sum, sector) => sum + sector.value, 0);
  for (const sector of sectors) {
    sector.share = sectorTotal ? (sector.value / sectorTotal) * 100 : 0;
  }
  const largest = sectors.reduce<(typeof sectors)[number] | undefined>(
    (best, sector) => (!best || sector.value > best.value ? sector : best),
    undefined,
  );
  const chartBars = bars.length > 6 ? bars.slice(-6) : bars;
  const maxBar = Math.max(0, ...chartBars.map((bar) => bar.amount));
  const scale = cashScale(maxBar);
  const scope = selected ? selected.name : "All investments";
  const exitNote = selected
    ? "No investment exits occurred for this holding."
    : rangeId === "ALL"
      ? "One completed exit is reported as a realized gain and is not part of this closing valuation."
      : "No investment exits occurred in this period.";

  function exportReport() {
    downloadText(
      "fmi-performance-report.csv",
      csv([
        ["Report", "FMI performance"],
        ["Range", range.movement],
        ["Investments", scope],
        ["Unrealized gain", unrealized],
        ["Realized exit gains", realized],
        ["Distributions in range", periodDistributions],
        ["Lifetime distributions", lifetimeDistributions],
        ["Historical net IRR", `${irr.toFixed(1)}%`],
        ["Opening valuation", bridge.opening],
        ["Net capital added", bridge.capital],
        ["Valuation movement", bridge.movement],
        ["Closing valuation", bridge.closing],
        [],
        ["Business", "Invested", "Valuation", "Unrealized gain", "Distributions", "Valuation date"],
        ...rows.map((holding) => [
          holding.name,
          holding.invested,
          holding.valuation,
          gainOf(holding),
          holding.distributions,
          "Latest",
        ]),
      ]),
      "text/csv",
    );
  }

  function downloadAttribution() {
    downloadText(
      "fmi-holding-attribution.csv",
      csv([
        ["Business", "Invested", "Valuation", "Unrealized gain", "Gain percent", "Distributions", "Valuation date"],
        ...rows.map((holding) => [
          holding.name,
          holding.invested,
          holding.valuation,
          gainOf(holding),
          percentText(gainOf(holding), holding.invested),
          holding.distributions,
          "Latest",
        ]),
      ]),
      "text/csv",
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col">
    <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-4 md:gap-[22px] md:px-8 md:py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex max-w-[640px] flex-col md:gap-[5px]">
          <p className="text-xs font-semibold leading-[1.7] text-accent">INSIGHTS / PERFORMANCE</p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.2] text-[#14271F] md:text-[32px]">
            See beyond the balance.
          </h1>
          <p className="text-base leading-[1.4] text-[#53645B]">
            Understand what drives your portfolio, with the context private markets need.
          </p>
        </div>
        <button
          type="button"
          onClick={exportReport}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-base font-semibold text-[#14271F] hover:bg-[#F4F9F6] md:w-fit md:px-[18px] md:py-2.5"
        >
          Export report
          <DownloadIcon />
        </button>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex flex-col gap-5 md:flex-row md:gap-2.5">
          <label className="relative inline-flex w-full md:w-auto">
            <span className="sr-only">Reporting period</span>
            <select
              value={rangeId}
              onChange={(event) => setRangeId(event.target.value as RangeId)}
              className="w-full appearance-none rounded-lg border border-[#D9E5DD] bg-white py-3 pl-4 pr-10 text-sm text-[#53645B] outline-none focus:border-accent md:min-w-[230px] md:py-2.5 md:pl-3"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.pill}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#53645B] md:right-3">
              <CalendarIcon />
            </span>
          </label>
          <label className="relative inline-flex w-full md:w-auto">
            <span className="sr-only">Investments</span>
            <select
              value={holdingId}
              onChange={(event) => setHoldingId(event.target.value)}
              className="w-full appearance-none rounded-lg border border-[#D9E5DD] bg-white py-3 pl-4 pr-10 text-sm text-[#53645B] outline-none focus:border-accent md:min-w-[180px] md:py-2.5 md:pl-3"
            >
              <option value="all">All investments</option>
              {holdings.map((holding) => (
                <option key={holding.id} value={holding.id}>
                  {holding.name}
                </option>
              ))}
            </select>
            <img
              src="/workspace/icon-chevron.svg"
              alt=""
              width={16}
              height={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 md:right-3"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-[18px]" role="group" aria-label="Reporting range">
          {RANGE_OPTIONS.map((option) => {
            const active = option.id === rangeId;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setRangeId(option.id)}
                className={
                  active
                    ? "rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] text-[13px] font-medium leading-[1.35] text-accent"
                    : "text-sm leading-[1.35] text-[#718078] hover:text-[#14271F]"
                }
              >
                {option.pill}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-4 xl:grid-cols-4">
        <Metric
          dark
          label="Unrealized gain · lifetime"
          value={signedMoney(unrealized)}
          detail={`${percentText(unrealized, invested)} on current invested capital`}
          detailClass="text-[#2FC382]"
          mobile={{
            label: "Current valuation",
            value: money(currentValuation),
            detail: `Last issuer updates · ${"Latest"}`,
            detailClass: "text-[#A8C5B2]",
          }}
        />
        <Metric
          label="Realized exit gains · lifetime"
          value={money(realized)}
          detail={
            selected
              ? "No completed exit for this holding"
              : "From one completed investment exit"
          }
          detailClass="text-accent"
        />
        <Metric
          label={`Distributions · ${range.movement}`}
          value={money(periodDistributions)}
          detail={
            rangeId === "ALL"
              ? "Since inception · Jan 2025"
              : `${money(lifetimeDistributions)} since inception`
          }
          detailClass="text-accent"
        />
        <Metric
          label="Historical net IRR¹"
          value={`${irr.toFixed(1)}%`}
          detail={selected ? "This holding" : "Portfolio annualized IRR"}
          detailClass="text-accent"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
          <PanelHeading
            title="Portfolio valuation & contributions"
            aside={
              <p className="text-sm text-accent">
                {range.movement} · {selected ? selected.name : "Monthly reports"}
              </p>
            }
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-3">
            <p className="text-base font-semibold leading-[1.35] text-[#14271F]">
              {money(bridge.closing)} latest reported value
            </p>
            <div className="flex flex-wrap gap-2 text-[13px] leading-[1.35] md:gap-[18px]">
              <span className="text-[#14271F]">● Valuation</span>
              <span className="text-[#718078]">┄ Invested capital</span>
            </div>
          </div>
          {points.length > 1 ? (
            <ValuationChart points={points} />
          ) : (
            <p className="text-sm leading-[1.4] text-[#53645B]">
              No valuation history was returned for this range. Metrics use the latest reported values.
            </p>
          )}
          <p className="text-xs leading-[1.4] text-[#53645B]">
            Step changes reflect contributions and periodic valuations, not daily price discovery.
            Latest reports: {"Latest"}.
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
          <PanelHeading title="Value creation bridge" />
          <DetailRow label={`Opening valuation · ${range.movement}`} value={money(bridge.opening)} />
          <DetailRow label="Net capital added" value={signedMoney(bridge.capital)} />
          <DetailRow
            label={`Valuation movement · ${range.movement}`}
            value={signedMoney(bridge.movement)}
            valueClass={bridge.movement > 0 ? "text-accent" : "text-[#14271F]"}
          />
          <div className="h-px bg-[#D9E5DD]" />
          <DetailRow label="Closing valuation" value={money(bridge.closing)} />
          <p className="text-[13px] leading-[1.4] text-[#53645B]">
            Cash distributions are reported separately and are not added to the closing holding
            valuation. {exitNote}
          </p>
          <p className="w-full rounded-[5px] bg-[#F4F9F6] px-2 py-[3px] text-[13px] font-medium text-[#53645B] md:w-fit">
            Not a live mark-to-market value
          </p>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_420px]">
        <section className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
          <PanelHeading
            title="Sector concentration"
            aside={<p className="text-sm text-accent">By current value</p>}
          />
          <div className="flex flex-col gap-4 md:gap-[13px]">
            <div className="flex h-4 overflow-hidden rounded" aria-hidden>
              {sectors.map((sector) => (
                <div
                  key={sector.name}
                  className="h-full border-r-2 border-white last:border-r-0"
                  style={{ width: `${sector.share}%`, backgroundColor: sector.color }}
                />
              ))}
            </div>
            {sectors.map((sector) => (
              <div key={sector.name} className="flex items-center gap-2 md:gap-[9px]">
                <span
                  className="size-[7px] shrink-0 rounded-[2px]"
                  style={{ backgroundColor: sector.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 text-sm text-[#53645B]">{sector.name}</span>
                <span className="text-sm font-semibold leading-[1.35] text-[#14271F]">
                  {sector.share.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-[1.4] text-[#53645B]">
            {largest
              ? `Largest sector: ${largest.name} · ${largest.share.toFixed(1)}%. `
              : ""}
            Sector weights may drift between valuation updates.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
          <PanelHeading
            title="Cashflow & distributions"
            aside={<p className="text-sm text-accent">₦ · {range.movement}</p>}
          />
          {maxBar === 0 ? (
            <p className="py-6 text-sm leading-[1.4] text-[#53645B]">
              No distributions in this period.
            </p>
          ) : (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-3">
                <p className="text-[13px] leading-[1.7] text-[#14271F] md:leading-[1.35]">
                  Monthly distributions received · ₦
                </p>
                <p className="text-xs leading-[1.35] text-[#718078]">{money(scale)}</p>
              </div>
              <div className="flex h-[156px] items-end justify-between gap-1">
                {chartBars.map((bar) => (
                  <div
                    key={bar.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-[9px]"
                  >
                    <p className="whitespace-nowrap text-center text-[11px] leading-[1.35] text-[#718078]">
                      {money(bar.amount)}
                    </p>
                    <div
                      className="w-6 rounded-[3px] bg-accent"
                      style={{ height: `${scale === 0 ? 0 : (bar.amount / scale) * 100}px` }}
                    />
                    <p className="text-xs leading-[1.35] text-[#718078]">{bar.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DetailRow
            label={`Distributions · ${range.movement}`}
            value={money(periodDistributions)}
            valueClass="text-accent"
          />
          <DetailRow label={`Contributions · ${range.movement}`} value={money(bridge.capital)} />
        </section>

        <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
          <PanelHeading title="Performance composition" />
          <DetailRow
            label="Unrealized holding gains"
            value={money(unrealized)}
            valueClass="text-accent"
          />
          <DetailRow
            label="Realized exit gains"
            value={money(realized)}
            valueClass="text-accent"
          />
          <DetailRow
            label="Lifetime cash distributions"
            value={money(lifetimeDistributions)}
            valueClass="text-accent"
          />
          <div className="h-px bg-[#D9E5DD]" />
          <DetailRow label="Lifetime value generated²" value={money(generated)} />
          <p className="text-[13px] leading-[1.4] text-[#53645B]">
            ² Sum of reported holding gains, exit gains and distributions. This is not a rate of
            return and is not a forecast of future performance.
          </p>
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
        <PanelHeading
          title="Holding-level performance"
          aside={
            <button type="button" onClick={downloadAttribution} className="w-fit text-sm text-accent">
              Download attribution →
            </button>
          }
        />
        <HoldingTable rows={rows} />
      </section>

      <p className="text-xs leading-[1.4] text-[#53645B]">
        ¹ Historical net IRR is a money-weighted annualized estimate based on dated cashflows and
        latest reported valuations, after platform fees. It includes unrealized values and may
        change. Past performance does not predict future results.
      </p>
    </div>
    <div className="flex flex-col gap-1 px-4 py-4 text-xs leading-[1.7] text-[#718078] md:flex-row md:items-center md:justify-between md:px-8 md:py-[18px] md:leading-[1.35]">
      <p>
        FMI · Private investments are illiquid; capital is at risk.
        Returns are not guaranteed.
      </p>
      <p className="shrink-0">All amounts in ₦</p>
    </div>
    </div>
  );
}

function HoldingTable({ rows }: { rows: Holding[] }) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((holding) => {
          const gain = gainOf(holding);
          return (
            <li key={holding.id} className="flex flex-col rounded-lg bg-[#F4F9F6] px-3 py-4 text-sm leading-[1.8] text-[#14271F]">
              <p className="text-[#718078]">Business</p>
              <p className="text-base font-semibold">{holding.name}</p>
              <p>Invested: {money(holding.invested)}</p>
              <p>Valuation: {money(holding.valuation)}</p>
              <p>
                Unrealized gain: {signedMoney(gain)} · {gain >= 0 ? "+" : ""}
                {percentText(gain, holding.invested)}
              </p>
              <p>Distributions: {money(holding.distributions)}</p>
              <p>Valuation date: {"Latest"}</p>
            </li>
          );
        })}
      </ul>
      <div className="hidden min-w-0 overflow-x-auto md:block">
        <div className="min-w-[860px]">
          <div className="flex gap-3 rounded-md bg-[#F4F9F6] px-3 py-3 text-xs font-medium text-[#718078]">
            <p className="w-[250px] shrink-0">Business</p>
            <p className="min-w-0 flex-1">Invested</p>
            <p className="min-w-0 flex-1">Valuation</p>
            <p className="min-w-0 flex-1">Unrealized gain</p>
            <p className="min-w-0 flex-1">Distributions</p>
            <p className="min-w-0 flex-1">Valuation date</p>
          </div>
          {rows.map((holding) => {
            const gain = gainOf(holding);
            return (
              <div
                key={holding.id}
                className="flex items-center gap-3 border-b border-[#D9E5DD] px-3 py-3.5 text-sm leading-[1.35]"
              >
                <p className="w-[250px] shrink-0 font-semibold text-[#14271F]">{holding.name}</p>
                <p className="min-w-0 flex-1 text-[#14271F]">{money(holding.invested)}</p>
                <p className="min-w-0 flex-1 text-[#14271F]">{money(holding.valuation)}</p>
                <p className="min-w-0 flex-1 text-accent">
                  {signedMoney(gain)} · {gain >= 0 ? "+" : ""}
                  {percentText(gain, holding.invested)}
                </p>
                <p className="min-w-0 flex-1 text-[#14271F]">{money(holding.distributions)}</p>
                <p className="min-w-0 flex-1 text-[#14271F]">{"Latest"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

"use client";

import type { ReactNode } from "react";
import { DiscoveryBar, useFilters } from "./filters";
import { WatchlistButton, WatchlistTabs } from "./tabs";
import { useSecondaryListings } from "@/hooks/use-secondary-market";

export function MarketplaceChrome({
  view,
  children,
}: {
  view: "primary" | "secondary" | "watchlist";
  children: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 flex-col lg:gap-[5px]">
            <p className="text-[10px] font-semibold leading-[1.7] text-accent lg:text-xs lg:leading-normal">
              DISCOVER / PRIVATE BUSINESSES
            </p>
            <h1 className="font-[family-name:var(--font-stack-sans)] text-base font-normal leading-[1.7] text-[#14271F] lg:text-[32px] lg:leading-[1.2]">
              Capital meets opportunity.
            </h1>
            <p className="text-xs leading-[1.7] text-[#53645B] lg:text-base lg:leading-[1.4]">
              Explore vetted businesses. Understand the terms. Invest on your
              own terms.
            </p>
          </div>
          <WatchlistButton />
        </div>

        <HeroCounts />

        <WatchlistTabs view={view} />
        <DiscoveryBar view={view} />
        {children}
      </div>

      <div className="flex flex-col gap-2 px-4 py-[18px] text-xs leading-[1.35] text-[#718078] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          FMI · Private investments are illiquid; capital is at risk. Returns
          are not guaranteed.
        </p>
        <p className="shrink-0">All amounts in ₦</p>
      </div>
    </div>
  );
}

function HeroCounts() {
  const { totalCount, isLoading } = useFilters();
  const secondaryQuery = useSecondaryListings();
  const primaryCount = isLoading ? "…" : String(totalCount);
  const secondaryCount = secondaryQuery.isLoading
    ? "…"
    : String(secondaryQuery.data?.count ?? 0);

  return (
    <section className="flex flex-col gap-5 rounded-[14px] bg-[#0B2118] p-4 lg:flex-row lg:items-center lg:gap-10 lg:p-[22px]">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-[family-name:var(--font-stack-sans)] text-xl font-normal leading-[1.7] text-white lg:text-2xl lg:leading-normal">
          Private markets. A clearer starting point.
        </p>
        <p className="text-[13px] leading-[1.4] text-[#A8C5B2] lg:text-[15px]">
          Company details, due diligence and transparent terms, together in one
          place.
        </p>
      </div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-10">
        <Count value={primaryCount} label="Open primary raises" />
        <div className="h-px w-full bg-[#365342] lg:h-12 lg:w-px" aria-hidden />
        <Count value={secondaryCount} label="Verified secondary listings" />
      </div>
    </section>
  );
}

function Count({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-none text-[#2FC382]">
        {value}
      </p>
      <p className="text-[13px] text-[#A8C5B2] lg:text-[15px]">{label}</p>
    </div>
  );
}

export function Footnote() {
  return (
    <p className="max-w-[760px] text-[13px] leading-[1.4] text-[#53645B]">
      ¹ Issuer-provided illustrative projections, not guaranteed. MOIC =
      multiple on invested capital. Equity may have no scheduled payouts.
      Review all risk disclosures before investing.
    </p>
  );
}

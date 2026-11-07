"use client";

import Link from "next/link";
import { useFilters } from "./filters";
import { useWatchlist } from "./watchlist-state";
import { useSecondaryListings } from "@/hooks/use-secondary-market";

export function WatchlistButton() {
  const { saved } = useWatchlist();

  return (
    <Link
      href="/marketplace/watchlist"
      className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-xs font-semibold text-[#14271F] lg:w-fit lg:px-[18px] lg:py-2.5 lg:text-base"
    >
      Watchlist · {saved.length}
      <img src="/marketplace/icon-bookmark.svg" alt="" width={16} height={16} />
    </Link>
  );
}

export function WatchlistTabs({
  view,
}: {
  view: "primary" | "secondary" | "watchlist";
}) {
  const { saved } = useWatchlist();
  const { totalCount, isLoading } = useFilters();
  const secondaryQuery = useSecondaryListings();
  const primaryLabel = isLoading
    ? "Primary investments · …"
    : `Primary investments · ${totalCount}`;
  const secondaryCount = secondaryQuery.data?.count;
  const secondaryLabel = secondaryQuery.isLoading
    ? "Secondary market · …"
    : `Secondary market · ${secondaryCount ?? 0}`;
  const tabs = [
    {
      id: "primary",
      href: "/marketplace",
      label: primaryLabel,
    },
    {
      id: "secondary",
      href: "/marketplace/secondary",
      label: secondaryLabel,
    },
    {
      id: "watchlist",
      href: "/marketplace/watchlist",
      label: `My watchlist · ${saved.length}`,
    },
  ] as const;

  return (
    <div className="flex flex-wrap gap-x-[25px] gap-y-2 border-b border-[#D9E5DD] lg:flex-nowrap lg:gap-6 lg:overflow-x-auto">
      {tabs.map((tab) => {
        const active = tab.id === view;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px shrink-0 border-b-2 py-[11px] text-xs leading-6 lg:text-base ${
              active
                ? "border-accent font-semibold text-accent"
                : "border-transparent font-normal text-[#53645B] hover:text-[#14271F]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function PageControls({
  page,
  pages = [1],
  onPage,
}: {
  page: number;
  pages?: number[];
  onPage: (page: number) => void;
}) {
  if (pages.length <= 1) return null;

  const index = pages.indexOf(page);
  const canGoNext = index >= 0 && index < pages.length - 1;

  function goNext() {
    if (!canGoNext) return;
    onPage(pages[index + 1]);
  }

  return (
    <div className="flex w-full items-center justify-between lg:w-auto lg:gap-2.5">
      <div className="flex items-center gap-5 lg:gap-2.5">
        {pages.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onPage(number)}
            className={
              page === number
                ? "rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] text-[13px] font-medium text-accent"
                : "px-1 text-base text-[#718078]"
            }
            aria-current={page === number ? "page" : undefined}
          >
            {number}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={goNext}
        disabled={!canGoNext}
        className="inline-flex w-[98px] items-center justify-end gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-xs font-semibold text-[#14271F] disabled:cursor-default disabled:bg-[#E4EBE6] disabled:text-[#718078] lg:w-auto lg:justify-start lg:px-[18px] lg:py-2.5 lg:text-base"
      >
        Next
        <img
          src="/marketplace/icon-chevron-right.svg"
          alt=""
          width={16}
          height={16}
        />
      </button>
    </div>
  );
}

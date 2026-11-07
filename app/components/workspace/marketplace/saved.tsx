"use client";

import { useMemo, useState } from "react";
import { Footnote } from "./chrome";
import { useFilters } from "./filters";
import { OpportunityCard } from "./opportunity-card";
import { PageControls } from "./tabs";
import { useWatchlist } from "./watchlist-state";
import { WatchlistGridSkeleton } from "../skeletons";

const PAGE_SIZE = 6;

export function SavedOpportunities() {
  const { saved, items, isLoading } = useWatchlist();
  const { filtering, reset, results } = useFilters();
  const [page, setPage] = useState(1);

  const watchlistItems = items || [];
  // When filters are active, only keep watchlist items that also match
  // the filtered primary-marketplace result set. Otherwise show all saved.
  const ordered = filtering
    ? watchlistItems.filter((item) =>
        results.some((result) => result.id === item.id),
      )
    : watchlistItems;
  const pageCount = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const pages = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount],
  );
  const currentPage = Math.min(page, pageCount);
  const paged = filtering
    ? ordered
    : ordered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isLoading) {
    return <WatchlistGridSkeleton />;
  }

  return (
    <>
      <div className="hidden lg:flex lg:items-center lg:justify-between">
        <p className="text-[15px] font-semibold text-[#14271F]">
          {filtering
            ? `${ordered.length} of ${saved.length} saved`
            : `${ordered.length} saved ${ordered.length === 1 ? "opportunity" : "opportunities"}`}
        </p>
        <p className="text-[13px] leading-[1.4] text-[#718078]">
          Saved businesses · Not committed investments
        </p>
      </div>
      {paged.length === 0 ? (
        <p className="rounded-[14px] border border-[#D9E5DD] px-4 py-8 text-sm text-[#53645B]">
          {saved.length === 0 ? (
            "Nothing is saved yet. Use the bookmark on a primary investment to keep it here."
          ) : (
            <>
              No saved opportunities match these filters.
              <button type="button" onClick={reset} className="ml-2 text-accent">
                Reset filters
              </button>
            </>
          )}
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {paged.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} tall />
          ))}
        </div>
      )}
      {paged.length > 0 && pageCount > 1 ? (
        <div className="lg:hidden">
          <PageControls page={currentPage} pages={pages} onPage={setPage} />
        </div>
      ) : null}
      <div className="hidden lg:block">
        <Footnote />
      </div>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Footnote } from "./chrome";
import { useFilters } from "./filters";
import { OpportunityCard } from "./opportunity-card";
import { PageControls } from "./tabs";
import { MarketplaceGridSkeleton } from "../skeletons";

const PAGE_SIZE = 9;

export function PrimaryInvestments() {
  const {
    filtering,
    results,
    chips,
    reset,
    totalCount,
    isLoading,
    isError,
    errorMessage,
  } = useFilters();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pages = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount],
  );
  const currentPage = Math.min(page, pageCount);
  const pagedResults = filtering
    ? results
    : results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (isLoading) {
    return <MarketplaceGridSkeleton />;
  }

  return (
    <>
      {isError ? (
        <p className="rounded-[10px] bg-[#FCF0EE] px-4 py-4 text-sm leading-[1.45] text-[#53645B]">
          {errorMessage || "Could not refresh marketplace data."} Showing
          available records where possible.
        </p>
      ) : null}

      {filtering && chips.length > 0 ? (
        <p className="rounded-[10px] bg-[#E8F7EC] px-4 py-4 text-sm leading-[1.45] text-[#53645B]">
          Applied:{" "}
          {chips.map((item, index) => (
            <span key={item.label}>
              {index > 0 ? "  ·  " : null}
              <button type="button" onClick={item.clear} className="text-[#14271F]">
                {item.label} ×
              </button>
            </span>
          ))}
          . Reset filters restores all {totalCount} opportunities.
        </p>
      ) : null}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm font-semibold leading-[1.7] text-[#14271F] lg:text-base lg:leading-[1.35]">
          {filtering
            ? `${results.length} of ${totalCount} opportunities · Showing all matching results`
            : `${totalCount} opportunities · Showing ${results.length} ${
                results.every((item) => item.featured) ? "featured" : "open"
              }`}
        </p>
        <p className="text-xs leading-[1.7] text-[#718078] lg:text-[13px] lg:leading-[1.35]">
          Eligibility varies by opportunity
        </p>
      </div>

      {pagedResults.length === 0 ? (
        <p className="rounded-[14px] border border-[#D9E5DD] px-4 py-8 text-sm text-[#53645B]">
          {totalCount === 0
            ? "No marketplace opportunities are available yet."
            : "No opportunities match these filters."}
          {totalCount > 0 ? (
            <button type="button" onClick={reset} className="ml-2 text-accent">
              Reset filters
            </button>
          ) : null}
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-[18px] xl:grid-cols-3">
          {pagedResults.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      )}

      {pagedResults.some((item) => item.illustrative) ? (
        <p className="rounded-[10px] bg-[#FBF3E5] px-4 py-4 text-sm leading-[1.45] text-[#53645B]">
          Additional opportunities shown here are illustrative demo records, not
          real businesses or verified offers. No targets or returns have been
          inferred. Capital is at risk; liquidity, acceptance and returns are
          not guaranteed.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {filtering ? (
          <p className="text-[13px] leading-[1.45] text-[#53645B]">
            Showing {results.length} matching results · 1 page
          </p>
        ) : (
          <Footnote />
        )}
        {filtering || pageCount <= 1 ? null : (
          <PageControls page={currentPage} pages={pages} onPage={setPage} />
        )}
      </div>
      {filtering ? <Footnote /> : null}
    </>
  );
}

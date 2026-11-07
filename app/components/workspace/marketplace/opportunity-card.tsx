"use client";

import Link from "next/link";
import type { Opportunity } from "./data";
import { useWatchlist } from "./watchlist-state";

export function OpportunityCard({
  opportunity,
  tall = false,
}: {
  opportunity: Opportunity;
  tall?: boolean;
}) {
  const { saved, toggle } = useWatchlist();
  const bookmarked = saved.includes(opportunity.id);
  const illustrative = opportunity.status === "Illustrative demo record";

  return (
    <article className="flex min-w-0 flex-col gap-[13px] rounded-[14px] border border-[#D9E5DD] bg-white p-3.5">
      <div className="relative">
        <img
          src={opportunity.image}
          alt=""
          className={`h-[180px] w-full rounded-[9px] object-cover ${
            tall ? "lg:h-[170px]" : "lg:h-[133px]"
          }`}
        />
        <button
          type="button"
          className={`absolute right-2.5 top-2.5 flex items-center justify-center rounded-full ${
            bookmarked ? "size-[34px] bg-[#E8F7EC]" : "size-[30px] bg-white"
          }`}
          aria-pressed={bookmarked}
          aria-label={
            bookmarked
              ? `Remove ${opportunity.name} from watchlist`
              : `Save ${opportunity.name} to watchlist`
          }
          onClick={() => toggle(opportunity.id, opportunity.name)}
        >
          <img
            src={
              bookmarked
                ? "/marketplace/icon-bookmark-saved.svg"
                : "/marketplace/icon-bookmark.svg"
            }
            alt=""
            width={bookmarked ? 17 : 16}
            height={bookmarked ? 17 : 16}
          />
        </button>
      </div>

      <div className="flex flex-col gap-2.5 px-1">
        <div className="flex items-center justify-between gap-3">
          {illustrative ? (
            <h2
              className={`font-[family-name:var(--font-stack-sans)] text-base font-normal leading-tight text-[#14271F] ${
                tall ? "lg:text-[22px]" : "lg:text-[21px]"
              }`}
            >
              {opportunity.name}
            </h2>
          ) : (
            <Link
              href={`/marketplace/${opportunity.id}`}
              className={`font-[family-name:var(--font-stack-sans)] text-base font-normal leading-tight text-[#14271F] hover:text-accent ${
                tall ? "lg:text-[22px]" : "lg:text-[21px]"
              }`}
            >
              {opportunity.name}
            </Link>
          )}
          <img
            src="/marketplace/icon-badge-check.svg"
            alt="Verified"
            width={18}
            height={18}
            className="shrink-0"
          />
        </div>
        <p className="text-xs leading-[1.4] text-[#53645B] lg:text-sm">
          {opportunity.sector} · {opportunity.structure}
        </p>
        <div className="h-[5px] overflow-hidden rounded-[3px] bg-[#E8F7EC]" aria-hidden>
          <div
            className="h-full rounded-[3px] bg-accent"
            style={{ width: `${opportunity.fundedPercent}%` }}
          />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-3">
          <p className="text-xs text-[#53645B] lg:text-[15px]">{opportunity.fundedLabel}</p>
          <p className="text-xs font-semibold text-[#14271F] lg:text-[15px]">
            {opportunity.fundedPercent}%
          </p>
        </div>
        <div className="flex gap-3 lg:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-[1.35] text-[#718078]">
              Minimum investment
            </p>
            <p className="text-base font-semibold leading-[1.35] text-[#14271F]">
              {opportunity.minimumLabel}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-[1.35] text-[#718078]">
              Projected return¹
            </p>
            <p className="text-base font-semibold leading-[1.35] text-[#14271F]">
              {opportunity.projected}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 lg:justify-between">
          {illustrative ? (
            <p className="min-w-0 flex-1 text-xs text-accent lg:flex-none">{opportunity.status}</p>
          ) : bookmarked && tall ? (
            <>
              <p className="hidden rounded-[5px] bg-[#E8F7EC] px-[9px] py-[5px] text-[13px] leading-[1.4] text-accent lg:inline">
                Saved to watchlist
              </p>
              <p className="min-w-0 flex-1 rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] text-xs font-medium text-accent lg:hidden">
                {opportunity.status}
              </p>
            </>
          ) : (
            <p className="min-w-0 flex-1 rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] text-xs font-medium text-accent lg:flex-none lg:text-[13px]">
              {opportunity.status}
            </p>
          )}
          <p className="shrink-0 text-xs leading-[1.35] text-[#718078] lg:text-[13px]">
            {opportunity.term}
          </p>
        </div>
      </div>
    </article>
  );
}

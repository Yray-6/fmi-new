import Link from "next/link";
import type { NetworkInvestor } from "@/lib/api/network";
import { StatusBadge } from "./status-badge";

export function InvestorCard({ investor }: { investor: NetworkInvestor }) {
  return (
    <article className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[#E8F7EC] text-base font-semibold text-[#14271F]">
          {investor.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-[family-name:var(--font-stack-sans)] text-xl font-normal leading-[1.25] tracking-[-0.02em] text-[#14271F]">
            {investor.displayName}
          </h2>
          <p className="truncate text-sm leading-[1.4] text-[#53645B]">
            {investor.investorCategoryDisplay}
          </p>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-sm leading-[1.4] text-[#53645B]">
        <img
          src="/workspace/icon-search.svg"
          alt=""
          width={15}
          height={15}
          className="opacity-60"
        />
        {investor.location}
      </p>

      <div className="flex gap-4 rounded-lg bg-[#F4F9F6] p-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-[1.4] text-[#718078]">Investments</p>
          <p className="font-[family-name:var(--font-stack-sans)] text-[22px] font-normal leading-[1.25] tracking-[-0.018em] text-[#14271F]">
            {investor.investmentsCount}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs leading-[1.4] text-[#718078]">Portfolio value</p>
          <p className="font-[family-name:var(--font-stack-sans)] text-[22px] font-normal leading-[1.25] tracking-[-0.018em] text-[#14271F]">
            {investor.currentValueLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs leading-[1.4] text-[#718078]">Preferred sectors</p>
        <div className="flex flex-wrap gap-1.5">
          {investor.preferredSectors.length > 0 ? (
            investor.preferredSectors.map((sector) => (
              <span
                key={sector}
                className="rounded-[5px] bg-[#F4F9F6] px-2 py-1 text-xs leading-[1.35] text-[#53645B]"
              >
                {sector}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#718078]">No sectors listed</span>
          )}
        </div>
      </div>

      <div className="h-px bg-[#D9E5DD]" />

      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={investor.connectionStatus} />
        <Link
          href={`/network/${investor.id}`}
          className="inline-flex items-center gap-1 text-[15px] font-semibold text-accent"
        >
          View profile
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

export function InvestorCardSkeleton() {
  return (
    <div className="flex h-[356px] flex-col gap-5 rounded-[14px] border border-[#D9E5DD] bg-white p-5">
      <div className="flex gap-3">
        <div className="size-[50px] animate-pulse rounded-full bg-[#E6EDE8]" />
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="h-[18px] w-full animate-pulse rounded bg-[#E6EDE8]" />
          <div className="h-3 w-[110px] animate-pulse rounded bg-[#EDF3EF]" />
        </div>
      </div>
      <div className="h-[13px] w-[140px] animate-pulse rounded bg-[#EDF3EF]" />
      <div className="h-[75px] w-full animate-pulse rounded-lg bg-[#EDF3EF]" />
      <div className="h-6 w-[210px] animate-pulse rounded bg-[#EDF3EF]" />
      <div className="mt-auto flex justify-between">
        <div className="h-[25px] w-[100px] animate-pulse rounded bg-[#EDF3EF]" />
        <div className="h-[25px] w-[94px] animate-pulse rounded bg-[#E6EDE8]" />
      </div>
    </div>
  );
}

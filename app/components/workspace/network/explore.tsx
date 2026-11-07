"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useNetworkDirectory } from "@/hooks/use-network";
import { NetworkChrome } from "./chrome";
import { InvestorCard, InvestorCardSkeleton } from "./investor-card";

const LOCATION_OPTIONS = [
  "Lagos, Nigeria",
  "Abuja, Nigeria",
  "Enugu, Nigeria",
  "Kano, Nigeria",
  "Ibadan, Nigeria",
  "Port Harcourt, Nigeria",
];

const SECTOR_OPTIONS = [
  "Healthcare",
  "Clean energy",
  "Technology",
  "Food & agriculture",
  "Consumer",
  "FinTech",
  "Real Estate",
  "Infrastructure",
  "Energy",
];

export function NetworkExplore() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sector, setSector] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useNetworkDirectory({
    page,
    search: search || undefined,
    location: location || undefined,
    sector: sector || undefined,
  });

  const filtering = Boolean(search || location || sector);
  const investors = query.data?.investors ?? [];
  const count = query.data?.count ?? 0;
  const totalPages = Math.max(1, query.data?.totalPages ?? 1);

  const chips = useMemo(() => {
    const items: Array<{ label: string; clear: () => void }> = [];
    if (search) {
      items.push({
        label: `Name: ${search}`,
        clear: () => {
          setSearchInput("");
          setSearch("");
        },
      });
    }
    if (location) {
      items.push({
        label: `Location: ${location}`,
        clear: () => setLocation(""),
      });
    }
    if (sector) {
      items.push({
        label: `Sector: ${sector}`,
        clear: () => setSector(""),
      });
    }
    return items;
  }, [search, location, sector]);

  function clearAll() {
    setSearchInput("");
    setSearch("");
    setLocation("");
    setSector("");
    setPage(1);
  }

  return (
    <NetworkChrome view="explore">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:gap-2.5">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#D9E5DD] bg-white px-3 py-2.5">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#14271F] outline-none placeholder:text-[#53645B]"
            />
            <img
              src="/workspace/icon-search.svg"
              alt=""
              width={16}
              height={16}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-2.5 text-sm text-[#53645B]"
          >
            <option value="">All locations</option>
            {LOCATION_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={sector}
            onChange={(event) => {
              setSector(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-2.5 text-sm text-[#53645B]"
          >
            <option value="">All sectors</option>
            {SECTOR_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {filtering ? (
            <button
              type="button"
              onClick={clearAll}
              className="px-1 text-sm font-semibold text-accent"
            >
              Clear all filters
            </button>
          ) : null}
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.clear}
                className="rounded-[5px] bg-[#E8F7EC] px-2 py-1 text-xs leading-[1.35] text-accent"
              >
                {chip.label} ×
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-[#14271F]">
          {query.isLoading
            ? "Finding your community…"
            : filtering
              ? `${count} investors match your search`
              : count === 0
                ? "0 investors in the network"
                : `${count} investors`}
        </p>
        <p className="hidden text-[13px] text-[#718078] lg:block">
          Visible to FMI members only
        </p>
      </div>

      {query.isError ? (
        <p className="rounded-[10px] bg-[#FCF0EE] px-4 py-4 text-sm text-[#53645B]">
          {(query.error as Error)?.message ||
            "Could not load the investor network."}
        </p>
      ) : null}

      {query.isLoading ? (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <InvestorCardSkeleton key={index} />
          ))}
        </div>
      ) : investors.length === 0 ? (
        <EmptyState filtering={filtering} onClear={clearAll} />
      ) : (
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {investors.map((investor) => (
            <InvestorCard key={investor.id} investor={investor} />
          ))}
        </div>
      )}

      {!query.isLoading && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-[#53645B]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </NetworkChrome>
  );
}

function EmptyState({
  filtering,
  onClear,
}: {
  filtering: boolean;
  onClear: () => void;
}) {
  if (filtering) {
    return (
      <div className="flex flex-col items-center gap-[18px] rounded-[14px] border border-[#D9E5DD] bg-white px-6 py-12 text-center lg:px-[100px]">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#E8F7EC]">
          <img src="/workspace/icon-search.svg" alt="" width={28} height={28} />
        </div>
        <h2 className="font-[family-name:var(--font-stack-sans)] text-2xl font-normal text-[#14271F]">
          No investors found
        </h2>
        <p className="max-w-md text-[15px] leading-[1.4] text-[#53645B]">
          No investors match your search. Try a different name, location or
          sector, or clear filters to widen your search.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[15px] font-semibold text-white"
        >
          Clear search & filters
        </button>
        <p className="text-[13px] text-[#718078]">
          Your existing connections are still in My network.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-[18px] rounded-[14px] border border-[#D9E5DD] bg-white px-6 py-12 text-center lg:px-[100px]">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#E8F7EC]">
        <img src="/workspace/icon-network.svg" alt="" width={28} height={28} />
      </div>
      <h2 className="font-[family-name:var(--font-stack-sans)] text-2xl font-normal text-[#14271F]">
        A new network. Room to grow.
      </h2>
      <p className="max-w-md text-[15px] leading-[1.4] text-[#53645B]">
        No investors have joined the network yet. Complete your public profile
        so the right people can find you when they do.
      </p>
      <Link
        href="/network/mine"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[15px] font-semibold text-white"
      >
        Complete my profile
      </Link>
      <p className="text-[13px] text-[#718078]">
        You’ll see new investors here as the community grows.
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useMyNetworkProfile,
  useNetworkInvestor,
  useSendNetworkConnection,
} from "@/hooks/use-network";
import { sharedPreferredSectors } from "@/lib/api/network";
import { StatusBadge } from "./status-badge";

const SECTOR_COLORS = ["#32A364", "#6BAF8D", "#A8CFB5", "#7BB894", "#95C4A8"];

export function NetworkProfile({ id }: { id: string }) {
  const profileQuery = useNetworkInvestor(id);
  const myProfileQuery = useMyNetworkProfile();
  const sendConnection = useSendNetworkConnection();
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");

  const details = profileQuery.data;
  const investor = details?.investor;
  const status = details?.connectionStatus ?? "none";

  const shared = sharedPreferredSectors(
    myProfileQuery.data?.preferredSectors ?? [],
    investor?.preferredSectors ?? [],
  );

  async function connect() {
    setNote("");
    try {
      await sendConnection.mutateAsync({
        targetId: id,
        message: message.trim() || undefined,
      });
      setMessage("");
      setNote("Connection request sent.");
    } catch (error) {
      setNote(
        error instanceof Error
          ? error.message
          : "Could not send connection request.",
      );
    }
  }

  if (profileQuery.isLoading) {
    return (
      <div className="flex flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8">
        <div className="h-5 w-48 animate-pulse rounded bg-[#E6EDE8]" />
        <div className="h-48 animate-pulse rounded-[14px] bg-[#E6EDE8]" />
        <div className="h-32 animate-pulse rounded-[14px] bg-[#0B2118]" />
      </div>
    );
  }

  if (profileQuery.isError || !investor || !details) {
    return (
      <div className="flex flex-col gap-5 px-4 py-4 lg:px-8 lg:py-8">
        <Link href="/network" className="text-[15px] font-semibold text-accent">
          ← Back to investor network
        </Link>
        <p className="rounded-[14px] border border-[#D9E5DD] px-4 py-8 text-sm text-[#53645B]">
          {(profileQuery.error as Error)?.message ||
            "This investor profile could not be loaded."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8">
        <Link
          href="/network"
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent"
        >
          ← Back to investor network
        </Link>

        <section className="flex flex-col gap-5 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px] lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-[18px]">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#E8F7EC] text-[20px] font-semibold text-[#14271F] lg:size-20 lg:text-[26px]">
              {investor.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.25] tracking-[-0.014em] text-[#14271F] lg:text-[32px]">
                {investor.displayName}
              </h1>
              <p className="text-base leading-[1.4] text-[#53645B]">
                {investor.investorCategoryDisplay}
              </p>
              <p className="mt-1 text-sm leading-[1.4] text-[#53645B]">
                {investor.location}
              </p>
            </div>
          </div>

          {investor.bio ? (
            <p className="text-base leading-[1.4] text-[#53645B]">{investor.bio}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {investor.preferredSectors.map((sector) => (
              <span
                key={sector}
                className="rounded-[5px] bg-[#E8F7EC] px-2 py-1 text-xs leading-[1.35] text-accent"
              >
                {sector}
              </span>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[14px] bg-[#0B2118] p-[22px]">
          <p className="text-[13px] leading-[1.4] tracking-wide text-[#A8C5B2]">
            PORTFOLIO SNAPSHOT · LATEST REPORTED
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-[18px]">
            <Metric label="Investments" value={String(details.investmentsCount)} />
            <Metric label="Amount invested" value={details.totalInvestedLabel} />
            <Metric
              label="Current value"
              value={details.currentValueLabel}
              accent
            />
          </div>
          <p className="text-xs leading-[1.4] text-[#A8C5B2]">
            Current value excludes cash distributions.
          </p>
        </section>

        <div className="flex flex-col gap-[22px] lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-[22px] order-2 lg:order-1">
            <SectorAllocationPanel sectors={details.sectorAllocation} />
            <RecentInvestmentsPanel
              investments={details.recentInvestments}
              total={details.investmentsCount}
            />
          </div>

          <div className="flex w-full flex-col gap-[18px] order-1 lg:order-2 lg:w-[365px] lg:shrink-0">
            {status === "none" ? (
              <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
                  Start a conversation
                </h2>
                <StatusBadge status="none" />
                <p className="text-[15px] leading-[1.4] text-[#53645B]">
                  Connect with {investor.displayName.split(" ")[0]} to share
                  perspectives on private markets and the sectors you both
                  follow.
                </p>
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-[#14271F]">
                    Add a short message (optional)
                  </span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={3}
                    placeholder={`Hi ${investor.displayName.split(" ")[0]}, I’d love to exchange ideas on…`}
                    className="rounded-lg border border-[#D9E5DD] bg-[#F4F9F6] px-3 py-3 text-sm text-[#14271F] outline-none placeholder:text-[#718078]"
                  />
                </label>
                <button
                  type="button"
                  disabled={sendConnection.isPending}
                  onClick={connect}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[15px] font-semibold text-white disabled:opacity-60"
                >
                  {sendConnection.isPending ? "Sending…" : "Connect"}
                </button>
                {note ? (
                  <p className="text-[13px] text-[#53645B]">{note}</p>
                ) : null}
                <div className="h-px bg-[#D9E5DD]" />
                <p className="text-[13px] leading-[1.4] text-[#718078]">
                  Only your public investor profile is shared. Contact and
                  account details stay private.
                </p>
              </section>
            ) : status === "pending" ? (
              <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
                  Connection pending
                </h2>
                <StatusBadge status="pending" />
                <p className="text-[15px] leading-[1.4] text-[#53645B]">
                  A connection request is open with {investor.displayName}.
                  You’ll be notified when it’s resolved.
                </p>
                <div className="h-px bg-[#D9E5DD]" />
                <p className="text-[13px] leading-[1.4] text-[#718078]">
                  Only your public investor profile is shared. Contact and
                  account details stay private.
                </p>
              </section>
            ) : status === "accepted" ? (
              <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
                  You’re connected
                </h2>
                <StatusBadge status="accepted" />
                <p className="text-[15px] leading-[1.4] text-[#53645B]">
                  You and {investor.displayName.split(" ")[0]} are connected in
                  the FMI investor network.
                </p>
              </section>
            ) : status === "self" ? (
              <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
                  Your public profile
                </h2>
                <Link
                  href="/network/mine"
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-[15px] font-semibold text-white"
                >
                  Edit in My network
                </Link>
              </section>
            ) : null}

            {shared.length > 0 && status !== "self" ? (
              <section className="hidden flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px] lg:flex">
                <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
                  A shared starting point
                </h2>
                <p className="text-sm leading-[1.4] text-[#53645B]">
                  You and {investor.displayName.split(" ")[0]} both follow{" "}
                  {formatSharedList(shared)}.
                </p>
                <p className="text-[13px] leading-[1.4] text-[#718078]">
                  Connect around shared interests. Always make your own
                  investment decisions.
                </p>
              </section>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden px-8 py-[18px] text-[13px] leading-[1.4] text-[#718078] lg:block">
        Investor-provided profile. Portfolio figures are illustrative and not
        independently verified. Past performance does not predict future
        results.
      </div>
    </div>
  );
}

function formatSharedList(items: string[]) {
  const list = items.slice(0, 3);
  if (list.length === 0) return "shared sectors";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list[0]}, ${list[1]} and ${list[2]}`;
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-[136px] flex-col gap-1">
      <p className="text-sm leading-[1.4] text-[#A8C5B2]">{label}</p>
      <p
        className={`font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.25] tracking-[-0.014em] ${
          accent ? "text-[#2FC382]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectorAllocationPanel({
  sectors,
}: {
  sectors: Array<{ sector: string; percent: number }>;
}) {
  const total = sectors.reduce((sum, item) => sum + item.percent, 0) || 1;

  return (
    <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
      <div>
        <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
          Sector allocation
        </h2>
        <p className="text-[13px] leading-[1.4] text-[#53645B]">
          By current portfolio value
        </p>
      </div>

      {sectors.length === 0 ? (
        <p className="text-sm text-[#718078]">No sector allocation data</p>
      ) : (
        <>
          <div className="flex h-4 overflow-hidden rounded">
            {sectors.map((item, index) => (
              <div
                key={item.sector}
                style={{
                  width: `${(item.percent / total) * 100}%`,
                  backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length],
                }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-[18px]">
            {sectors.map((item, index) => (
              <div key={item.sector} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[#53645B]">{item.sector}</p>
                  <p className="text-sm font-semibold text-[#14271F]">
                    {Math.round(item.percent)}%
                  </p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-[3px] bg-[#EDF3EF]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{
                      width: `${Math.min(100, item.percent)}%`,
                      backgroundColor:
                        SECTOR_COLORS[index % SECTOR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#718078]">
            Values reflect periodic reporting and may change. No daily price
            discovery.
          </p>
        </>
      )}
    </section>
  );
}

function RecentInvestmentsPanel({
  investments,
  total,
}: {
  investments: Array<{
    name: string;
    sector: string;
    investedLabel: string;
    date: string;
  }>;
  total: number;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
      <div>
        <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
          Recent investments
        </h2>
        <p className="text-[13px] leading-[1.4] text-[#53645B]">
          Latest {investments.length} of {total} investments · Amounts invested
        </p>
      </div>

      {investments.length === 0 ? (
        <p className="text-sm text-[#718078]">No recent investments</p>
      ) : (
        <div className="flex flex-col gap-3">
          {investments.map((item) => (
            <div key={`${item.name}-${item.date}`} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[#14271F]">
                    {item.name}
                  </p>
                  <p className="text-[13px] text-[#53645B]">{item.sector}</p>
                  <p className="text-xs text-[#718078]">{item.date}</p>
                </div>
                <p className="shrink-0 text-base font-semibold text-[#14271F]">
                  {item.investedLabel}
                </p>
              </div>
              <div className="h-px bg-[#D9E5DD]" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

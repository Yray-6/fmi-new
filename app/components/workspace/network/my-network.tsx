"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useMyNetworkProfile,
  useNetworkConnections,
  useUpdateMyNetworkProfile,
} from "@/hooks/use-network";
import type { InvestorCategory, NetworkConnection } from "@/lib/api/network";
import { formatActivityDate } from "@/lib/utils/formatters";
import { NetworkChrome } from "./chrome";
import { StatusBadge } from "./status-badge";

const CATEGORY_OPTIONS: Array<{ value: InvestorCategory; label: string }> = [
  { value: "INDIVIDUAL", label: "Individual investor" },
  { value: "ANGEL", label: "Angel investor" },
  { value: "FAMILY_OFFICE", label: "Family office" },
  { value: "VC", label: "Venture capital" },
  { value: "PE", label: "Private equity" },
  { value: "INSTITUTIONAL", label: "Institutional investor" },
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

export function MyNetwork() {
  const profileQuery = useMyNetworkProfile();
  const connectionsQuery = useNetworkConnections();
  const updateProfile = useUpdateMyNetworkProfile();

  const [displayName, setDisplayName] = useState("");
  const [investorCategory, setInvestorCategory] =
    useState<InvestorCategory>("INDIVIDUAL");
  const [preferredSectors, setPreferredSectors] = useState<string[]>([]);
  const [sectorDraft, setSectorDraft] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!profileQuery.data) return;
    setDisplayName(profileQuery.data.displayName);
    const category = profileQuery.data.investorCategory as InvestorCategory;
    if (CATEGORY_OPTIONS.some((item) => item.value === category)) {
      setInvestorCategory(category);
    }
    setPreferredSectors(profileQuery.data.preferredSectors);
  }, [profileQuery.data]);

  const pending = connectionsQuery.data?.pending ?? [];
  const connected = connectionsQuery.data?.connected ?? [];
  const pendingCount = connectionsQuery.data?.pendingCount ?? pending.length;
  const connectedCount =
    connectionsQuery.data?.connectedCount ?? connected.length;

  const availableSectors = useMemo(
    () =>
      SECTOR_OPTIONS.filter(
        (sector) =>
          !preferredSectors.some(
            (item) => item.toLowerCase() === sector.toLowerCase(),
          ),
      ),
    [preferredSectors],
  );

  async function saveProfile() {
    setNote("");
    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim(),
        investorCategory,
        preferredSectors,
      });
      setNote("Profile saved.");
    } catch (error) {
      setNote(
        error instanceof Error ? error.message : "Could not save profile.",
      );
    }
  }

  function addSector(sector: string) {
    const next = sector.trim();
    if (!next) return;
    if (
      preferredSectors.some((item) => item.toLowerCase() === next.toLowerCase())
    ) {
      return;
    }
    setPreferredSectors((current) => [...current, next]);
    setSectorDraft("");
  }

  return (
    <NetworkChrome view="mine">
      <section className="flex flex-wrap gap-x-10 gap-y-4 rounded-[14px] bg-[#0B2118] p-[22px]">
        <SummaryMetric value={String(connectedCount)} label="Connections" />
        <SummaryMetric value={String(pendingCount)} label="Pending" />
      </section>

      <div className="flex flex-col gap-[22px] lg:flex-row">
        <section className="flex w-full flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px] lg:w-[470px] lg:shrink-0">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
            Your public investor profile
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#E8F7EC] text-[18px] font-semibold text-[#14271F]">
              {profileQuery.data?.initials || "—"}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#14271F]">
                {profileQuery.data?.displayName || "Your profile"}
              </p>
              <p className="text-[13px] text-[#53645B]">
                This is how other investors see you.
              </p>
            </div>
          </div>

          <div className="h-px bg-[#D9E5DD]" />

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#14271F]">
              Display name
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-lg border border-[#D9E5DD] px-3 py-3 text-[15px] text-[#53645B] outline-none focus:text-[#14271F]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[#14271F]">
              Investor type
            </span>
            <select
              value={investorCategory}
              onChange={(event) =>
                setInvestorCategory(event.target.value as InvestorCategory)
              }
              className="rounded-lg border border-[#D9E5DD] px-3 py-3 text-[15px] text-[#53645B]"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#14271F]">
              Preferred sectors
            </span>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#D9E5DD] p-3">
              {preferredSectors.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() =>
                    setPreferredSectors((current) =>
                      current.filter((item) => item !== sector),
                    )
                  }
                  className="rounded-[5px] bg-[#E8F7EC] px-2 py-1 text-xs text-accent"
                >
                  {sector} ×
                </button>
              ))}
              {availableSectors.length > 0 ? (
                <select
                  value={sectorDraft}
                  onChange={(event) => {
                    addSector(event.target.value);
                  }}
                  className="bg-transparent text-sm text-accent outline-none"
                >
                  <option value="">+ Add sector</option>
                  {availableSectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>

          <p className="flex items-start gap-2 text-[13px] leading-[1.4] text-[#53645B]">
            Visible to FMI members only. Account and contact details are never
            displayed.
          </p>

          <button
            type="button"
            disabled={updateProfile.isPending || profileQuery.isLoading}
            onClick={saveProfile}
            className="rounded-lg bg-accent px-4 py-2.5 text-[15px] font-semibold text-white disabled:opacity-60"
          >
            {updateProfile.isPending ? "Saving…" : "Save profile changes"}
          </button>
          {note ? <p className="text-xs text-[#718078]">{note}</p> : null}
          <p className="text-xs text-[#718078]">
            Changes update your network profile, not your account details. Bio
            and location are not editable here yet.
          </p>
        </section>

        <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
          <ConnectionList
            title={`Pending · ${pendingCount}`}
            empty="No pending connection requests."
            items={pending}
            loading={connectionsQuery.isLoading}
          />
          <ConnectionList
            title={`Connections · ${connectedCount}`}
            empty="No connections yet. Explore investors to get started."
            items={connected}
            loading={connectionsQuery.isLoading}
            showProfile
          />
        </div>
      </div>
    </NetworkChrome>
  );
}

function SummaryMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <p className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.25] tracking-[-0.014em] text-[#2FC382]">
        {value}
      </p>
      <p className="text-sm text-[#A8C5B2]">{label}</p>
    </div>
  );
}

function ConnectionList({
  title,
  empty,
  items,
  loading,
  showProfile = false,
}: {
  title: string;
  empty: string;
  items: NetworkConnection[];
  loading: boolean;
  showProfile?: boolean;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
      <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
        {title}
      </h2>

      {loading ? (
        <p className="text-sm text-[#718078]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[#718078]">{empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E8F7EC] text-sm font-semibold text-[#14271F]">
                  {item.investor.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-[#14271F]">
                    {item.investor.displayName}
                  </p>
                  <p className="truncate text-[13px] text-[#53645B]">
                    {item.investor.investorCategoryDisplay} ·{" "}
                    {item.investor.location}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-[13px] text-[#53645B]">
                {item.status === "accepted" ? "Connected" : "Requested"}{" "}
                {item.createdAt ? formatActivityDate(item.createdAt) : ""}
                {item.investor.preferredSectors.length > 0
                  ? ` · ${item.investor.preferredSectors.slice(0, 2).join(", ")}`
                  : ""}
              </p>
              {showProfile ? (
                <div>
                  <Link
                    href={`/network/${item.investor.id}`}
                    className="inline-flex rounded-lg border border-[#D9E5DD] px-4 py-2.5 text-[15px] font-semibold text-[#14271F]"
                  >
                    View profile
                  </Link>
                </div>
              ) : null}
              <div className="h-px bg-[#D9E5DD]" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

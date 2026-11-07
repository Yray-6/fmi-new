"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useNetworkConnections } from "@/hooks/use-network";

export function NetworkChrome({
  view,
  children,
}: {
  view: "explore" | "mine";
  children: ReactNode;
}) {
  const connectionsQuery = useNetworkConnections();
  const networkCount =
    connectionsQuery.data?.connectedCount ??
    connectionsQuery.data?.connections.filter((item) => item.status === "accepted")
      .length ??
    0;
  const mineLabel = connectionsQuery.isLoading
    ? "My network · …"
    : `My network · ${networkCount}`;

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8">
        <div className="flex min-w-0 flex-col gap-[5px]">
          <p className="text-[10px] font-semibold tracking-[0.125em] text-accent lg:text-xs">
            {view === "mine"
              ? "CONNECT / MY NETWORK"
              : "CONNECT / INVESTOR NETWORK"}
          </p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.25] tracking-[-0.014em] text-[#14271F] lg:text-[32px] lg:tracking-[-0.0125em]">
            {view === "mine"
              ? "Connections worth building."
              : "Good company. Shared ambition."}
          </h1>
          <p className="text-base leading-[1.4] text-[#53645B]">
            {view === "mine"
              ? "Manage your investor profile, requests and the people in your circle."
              : "Discover investors, exchange perspectives and build meaningful connections."}
          </p>
        </div>

        {view === "explore" ? <NetworkHero /> : null}

        <div className="flex flex-wrap gap-x-[26px] border-b border-[#D9E5DD]">
          <Link
            href="/network"
            aria-current={view === "explore" ? "page" : undefined}
            className={`-mb-px border-b-2 py-[11px] text-base font-semibold ${
              view === "explore"
                ? "border-accent text-accent"
                : "border-transparent text-[#53645B] hover:text-[#14271F]"
            }`}
          >
            Explore investors
          </Link>
          <Link
            href="/network/mine"
            aria-current={view === "mine" ? "page" : undefined}
            className={`-mb-px border-b-2 py-[11px] text-base font-semibold ${
              view === "mine"
                ? "border-accent text-accent"
                : "border-transparent text-[#53645B] hover:text-[#14271F]"
            }`}
          >
            {mineLabel}
          </Link>
        </div>

        {children}
      </div>

      <div className="hidden px-8 py-[18px] text-[13px] leading-[1.4] text-[#718078] lg:block">
        Portfolio values are the latest reported values, not live prices.
        Connecting does not constitute investment advice or an endorsement.
      </div>
    </div>
  );
}

function NetworkHero() {
  return (
    <section className="rounded-[14px] bg-[#0B2118] p-[22px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="font-[family-name:var(--font-stack-sans)] text-[22px] font-normal leading-[1.25] tracking-[-0.018em] text-white lg:text-2xl lg:tracking-[-0.017em]">
            Your next perspective starts here.
          </p>
          <p className="text-[15px] leading-[1.4] text-[#A8C5B2]">
            Explore our private investor network. Find people who share your
            interests, not just your portfolio.
          </p>
        </div>
        <div className="hidden w-[200px] shrink-0 flex-col gap-1 lg:flex">
          <p className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.25] tracking-[-0.014em] text-[#2FC382]">
            Invest in connection.
          </p>
          <p className="text-sm leading-[1.4] text-[#A8C5B2]">
            A private space for FMI investors.
          </p>
        </div>
      </div>
    </section>
  );
}

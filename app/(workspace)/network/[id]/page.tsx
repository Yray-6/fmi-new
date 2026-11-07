import { Suspense } from "react";
import type { Metadata } from "next";
import { NetworkProfile } from "@/app/components/workspace/network/profile";

export const metadata: Metadata = {
  title: "Investor profile · FMI",
  description: "View an investor profile in the FMI network.",
};

export default function NetworkInvestorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<NetworkProfileFallback />}>
      <NetworkInvestor params={params} />
    </Suspense>
  );
}

async function NetworkInvestor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NetworkProfile id={id} />;
}

function NetworkProfileFallback() {
  return (
    <div className="flex flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8">
      <div className="h-5 w-48 animate-pulse rounded bg-[#E6EDE8]" />
      <div className="h-48 animate-pulse rounded-[14px] bg-[#E6EDE8]" />
      <div className="h-32 animate-pulse rounded-[14px] bg-[#0B2118]" />
    </div>
  );
}

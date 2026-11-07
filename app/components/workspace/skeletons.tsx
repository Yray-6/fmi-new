"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#E8F0EB] ${className}`}
      aria-hidden
    />
  );
}

function MetricBone({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-3 rounded-[14px] border p-4 lg:p-5 ${
        dark ? "border-[#0B2118] bg-[#0B2118]" : "border-[#D9E5DD] bg-white"
      }`}
    >
      <Bone className={`h-3 w-24 ${dark ? "bg-[#365342]" : ""}`} />
      <Bone className={`h-8 w-32 ${dark ? "bg-[#365342]" : ""}`} />
      <Bone className={`h-3 w-40 ${dark ? "bg-[#365342]" : ""}`} />
    </div>
  );
}

function CardBone() {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-[14px] border border-[#D9E5DD] bg-white p-3.5">
      <Bone className="h-[140px] w-full rounded-[9px]" />
      <Bone className="h-5 w-2/3" />
      <Bone className="h-3 w-1/2" />
      <Bone className="h-2 w-full" />
      <div className="flex gap-3">
        <Bone className="h-10 flex-1" />
        <Bone className="h-10 flex-1" />
      </div>
    </div>
  );
}

function PanelBone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 lg:p-[22px] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-5 w-40" />
        <Bone className="h-4 w-20" />
      </div>
      <Bone className="h-28 w-full" />
      <Bone className="h-3 w-3/4" />
      <Bone className="h-3 w-1/2" />
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2.5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8"
      aria-busy="true"
      aria-label="Loading overview"
    >
      <div className="flex flex-col gap-3 lg:max-w-[640px]">
        <Bone className="h-3 w-48" />
        <Bone className="h-8 w-72" />
        <Bone className="h-4 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-2 gap-2 lg:gap-4 xl:grid-cols-4">
        <MetricBone dark />
        <MetricBone />
        <MetricBone />
        <MetricBone />
      </div>
      <div className="grid gap-2.5 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <PanelBone />
        <PanelBone />
      </div>
      <div className="grid gap-2.5 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <PanelBone />
        <PanelBone />
      </div>
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8"
      aria-busy="true"
      aria-label="Loading marketplace"
    >
      <div className="flex flex-col gap-3 lg:max-w-[640px]">
        <Bone className="h-3 w-40" />
        <Bone className="h-8 w-80" />
        <Bone className="h-4 w-full max-w-lg" />
      </div>
      <Bone className="h-28 w-full rounded-[14px]" />
      <div className="flex gap-6 border-b border-[#D9E5DD] pb-3">
        <Bone className="h-4 w-40" />
        <Bone className="h-4 w-36" />
        <Bone className="h-4 w-28" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <Bone className="h-11 w-full lg:w-[260px]" />
        <Bone className="h-11 w-full lg:w-36" />
        <Bone className="h-11 w-full lg:w-36" />
        <Bone className="h-11 w-full lg:w-36" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <CardBone />
        <CardBone />
        <CardBone />
        <CardBone />
        <CardBone />
        <CardBone />
      </div>
    </div>
  );
}

export function WorkspacePageSkeleton() {
  return (
    <div
      className="flex w-full min-w-0 flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="flex flex-col gap-3 lg:max-w-[640px]">
        <Bone className="h-3 w-36" />
        <Bone className="h-8 w-64" />
        <Bone className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <PanelBone />
        <PanelBone />
        <PanelBone />
      </div>
      <PanelBone className="min-h-[240px]" />
    </div>
  );
}

function RouteSkeletonInner() {
  const pathname = usePathname();

  if (pathname.startsWith("/overview")) return <OverviewSkeleton />;
  if (pathname.startsWith("/marketplace")) return <MarketplaceSkeleton />;
  return <WorkspacePageSkeleton />;
}

export function RouteSkeleton() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <RouteSkeletonInner />
    </Suspense>
  );
}

export function MarketplaceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 lg:grid-cols-2 lg:gap-[18px] xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading opportunities"
    >
      {Array.from({ length: count }, (_, index) => (
        <CardBone key={index} />
      ))}
    </div>
  );
}

export function WatchlistGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading watchlist"
    >
      {Array.from({ length: count }, (_, index) => (
        <CardBone key={index} />
      ))}
    </div>
  );
}

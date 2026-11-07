import { Suspense, type ReactNode } from "react";
import { FiltersProvider } from "@/app/components/workspace/marketplace/filters";
import { WatchlistProvider } from "@/app/components/workspace/marketplace/watchlist-state";

/** Dynamic opportunity routes make layout pathname/params unknown at build. */
export const instant = false;

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[50vh] px-4 py-6 sm:px-8 sm:py-8" />}>
      <WatchlistProvider>
        <FiltersProvider>{children}</FiltersProvider>
      </WatchlistProvider>
    </Suspense>
  );
}

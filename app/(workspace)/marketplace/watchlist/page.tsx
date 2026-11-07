import type { Metadata } from "next";
import { MarketplaceChrome } from "@/app/components/workspace/marketplace/chrome";
import { SavedOpportunities } from "@/app/components/workspace/marketplace/saved";

export const metadata: Metadata = {
  title: "Watchlist · FMI",
  description: "Saved businesses. Not committed investments.",
};

export default function WatchlistPage() {
  return (
    <MarketplaceChrome view="watchlist">
      <SavedOpportunities />
    </MarketplaceChrome>
  );
}

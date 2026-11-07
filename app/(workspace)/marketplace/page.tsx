import type { Metadata } from "next";
import { MarketplaceChrome } from "@/app/components/workspace/marketplace/chrome";
import { PrimaryInvestments } from "@/app/components/workspace/marketplace/primary";

export const metadata: Metadata = {
  title: "Marketplace · FMI",
  description:
    "Explore vetted businesses. Understand the terms. Invest on your own terms.",
};

export default function MarketplacePage() {
  return (
    <MarketplaceChrome view="primary">
      <PrimaryInvestments />
    </MarketplaceChrome>
  );
}

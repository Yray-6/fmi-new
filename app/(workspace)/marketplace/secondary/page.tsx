import type { Metadata } from "next";
import { SecondaryMarket } from "@/app/components/workspace/marketplace/secondary";

export const metadata: Metadata = {
  title: "Secondary market · FMI",
  description:
    "Discover verified sellers, request a sale and follow ownership through settlement.",
};

export default function SecondaryMarketPage() {
  return <SecondaryMarket />;
}

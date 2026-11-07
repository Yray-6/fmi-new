import type { Metadata } from "next";
import { NetworkExplore } from "@/app/components/workspace/network/explore";

export const metadata: Metadata = {
  title: "Network · FMI",
  description:
    "Discover investors, exchange perspectives and build meaningful connections.",
};

export default function NetworkPage() {
  return <NetworkExplore />;
}

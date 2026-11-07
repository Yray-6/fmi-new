import type { Metadata } from "next";
import { Overview } from "@/app/components/workspace/overview";

export const metadata: Metadata = {
  title: "Overview · FMI",
  description:
    "A clearer view of your capital, opportunities and what comes next.",
};

export default function OverviewPage() {
  return <Overview />;
}

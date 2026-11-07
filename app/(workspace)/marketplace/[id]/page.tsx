import { Suspense } from "react";
import type { Metadata } from "next";
import { OpportunityDetail } from "@/app/components/workspace/marketplace/opportunity-detail";

export const metadata: Metadata = {
  title: "Opportunity · FMI",
  description: "Review terms and express interest in a marketplace opportunity.",
};

/** Dynamic id + client URL hooks need a blocking/streaming boundary. */
export const instant = false;

export default function OpportunityPage() {
  return (
    <Suspense
      fallback={<div className="min-h-[50vh] px-4 py-6 sm:px-8 sm:py-8" />}
    >
      <OpportunityDetail />
    </Suspense>
  );
}

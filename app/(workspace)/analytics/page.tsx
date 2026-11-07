import { Suspense } from "react";
import type { Metadata } from "next";
import { Analytics } from "@/app/components/workspace/analytics/analytics";

export const metadata: Metadata = {
  title: "Analytics · FMI",
  description:
    "Understand what drives your portfolio, with the context private markets need.",
};

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] px-4 py-6 sm:px-8 sm:py-8" />}>
      <Analytics />
    </Suspense>
  );
}

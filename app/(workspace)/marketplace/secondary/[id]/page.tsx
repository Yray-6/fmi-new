import { Suspense } from "react";
import type { Metadata } from "next";
import { ListingDetail } from "@/app/components/workspace/marketplace/listing-detail";

export const metadata: Metadata = {
  title: "Secondary listing · FMI",
  description:
    "Review a secondary market listing and express interest in an existing holding.",
};

export default async function SecondaryListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={<div className="min-h-[50vh] px-4 py-6 sm:px-8 sm:py-8" />}
    >
      <ListingDetail id={id} />
    </Suspense>
  );
}

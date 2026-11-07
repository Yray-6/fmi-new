import { Suspense } from "react";
import type { Metadata } from "next";
import { Account } from "@/app/components/workspace/account/account";

export const metadata: Metadata = {
  title: "Account & security · FMI",
  description:
    "Manage your identity, investor readiness and the protection around your account.",
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] px-4 py-6 sm:px-8 sm:py-8" />}>
      <Account />
    </Suspense>
  );
}

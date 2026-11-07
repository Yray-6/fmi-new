import type { Metadata } from "next";
import { Wallet } from "@/app/components/workspace/wallet/wallet";

export const metadata: Metadata = {
  title: "Wallet · FMI",
  description: "Fund your next investment and follow every deposit, payout and withdrawal.",
};

export default function WalletPage() {
  return <Wallet />;
}

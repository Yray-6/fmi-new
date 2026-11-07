import type { Metadata } from "next";
import { MyNetwork } from "@/app/components/workspace/network/my-network";

export const metadata: Metadata = {
  title: "My network · FMI",
  description:
    "Manage your investor profile, requests and the people in your circle.",
};

export default function MyNetworkPage() {
  return <MyNetwork />;
}

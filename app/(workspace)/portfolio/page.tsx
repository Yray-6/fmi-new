import type { Metadata } from "next";
import { Portfolio } from "@/app/components/workspace/portfolio/portfolio";

export const metadata: Metadata = {
  title: "Portfolio · FMI",
  description:
    "Every position, its performance and the documents that make it yours.",
};

export default function PortfolioPage() {
  return <Portfolio />;
}

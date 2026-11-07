"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOpportunityDetail } from "@/lib/api/marketplace";
import {
  fetchAssetAllocation,
  fetchInvestmentDetail,
  fetchPerformanceAnalysis,
  fetchPerformanceHistory,
  fetchPortfolioBundle,
  fetchRiskMetrics,
} from "@/lib/api/portfolio";
import { useSessionStore } from "@/lib/store/use-session-store";

function useAuthed() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);
  return { userId, enabled: status === "authenticated" && !!userId };
}

export function usePortfolio() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["portfolio", userId],
    queryFn: fetchPortfolioBundle,
    enabled,
  });
}

export function useInvestmentDetail(id: string | undefined) {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["portfolio", "investment", userId, id],
    queryFn: () => fetchInvestmentDetail(id!),
    enabled: enabled && !!id,
  });
}

export function usePerformanceHistory(id: string | undefined, days: number) {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["portfolio", "performance", userId, id, days],
    queryFn: () => fetchPerformanceHistory(id!, days),
    enabled: enabled && !!id,
  });
}

export function useHoldingDocuments(opportunityIds: number[]) {
  const { userId, enabled } = useAuthed();
  const key = [...opportunityIds].sort((left, right) => left - right).join(",");
  return useQuery({
    queryKey: ["portfolio", "documents", userId, key],
    queryFn: async () => {
      const details = await Promise.all(
        opportunityIds.map((id) =>
          fetchOpportunityDetail(String(id)).catch(() => null),
        ),
      );
      return details.flatMap((detail) => {
        if (!detail) return [];
        return (detail.documents || []).map((document) => ({
          opportunityId: detail.id,
          id: `${detail.id}-${document.id}`,
          title: document.title,
          summary: document.document_type_display || document.document_type || "Issuer document",
          href: document.file_url || document.file || undefined,
        }));
      });
    },
    enabled: enabled && opportunityIds.length > 0,
  });
}

export function usePortfolioAnalytics() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["portfolio", "analytics", userId],
    queryFn: async () => {
      const [performance, risk, allocation] = await Promise.all([
        fetchPerformanceAnalysis().catch(() => null),
        fetchRiskMetrics().catch(() => null),
        fetchAssetAllocation().catch(() => null),
      ]);
      return { performance, risk, allocation };
    },
    enabled,
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToWatchlist,
  fetchOpportunities,
  fetchWatchlist,
  removeFromWatchlist,
  type Opportunity,
  type OpportunityListParams,
} from "@/lib/api/marketplace";
import { useSessionStore } from "@/lib/store/use-session-store";

function normalizeList(value?: string | string[]) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .map((item) => item.trim())
    .filter(Boolean)
    .sort();
}

export function useMarketplaceOpportunities(params?: OpportunityListParams) {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);
  const search = params?.search?.trim() || undefined;
  const sectors = normalizeList(params?.sector);
  const risks = normalizeList(params?.risk_level);
  const types = normalizeList(params?.investment_type);
  const statuses = normalizeList(params?.status);
  const maxMin = params?.max_min_investment;
  const ordering = params?.ordering;

  return useQuery({
    queryKey: [
      "marketplace",
      "opportunities",
      userId,
      search || "",
      sectors.join(","),
      risks.join(","),
      types.join(","),
      statuses.join(","),
      maxMin ?? "",
      ordering || "",
    ],
    queryFn: () =>
      fetchOpportunities({
        search,
        sector: sectors.length > 0 ? sectors : undefined,
        risk_level: risks.length > 0 ? (risks as OpportunityListParams["risk_level"]) : undefined,
        investment_type:
          types.length > 0
            ? (types as OpportunityListParams["investment_type"])
            : undefined,
        status: statuses.length > 0 ? statuses : undefined,
        max_min_investment: maxMin,
        ordering,
      }),
    enabled: status === "authenticated" && !!userId,
  });
}

export function useMarketplaceWatchlist() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);

  return useQuery({
    queryKey: ["marketplace", "watchlist", userId],
    queryFn: fetchWatchlist,
    enabled: status === "authenticated" && !!userId,
  });
}

export function useWatchlistMutation() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async ({
      id,
      removing,
    }: {
      id: string;
      removing: boolean;
      name: string;
    }) => {
      if (removing) await removeFromWatchlist(id);
      else await addToWatchlist(id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["marketplace", "watchlist", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["marketplace", "opportunities", userId],
        }),
      ]);
    },
  });
}

export function useWatchlistIds() {
  const { data } = useMarketplaceWatchlist();
  return (data || []).map((item: Opportunity) => item.id);
}

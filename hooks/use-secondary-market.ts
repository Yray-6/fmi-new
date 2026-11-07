"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  expressSecondaryInterest,
  fetchSecondaryListing,
  fetchSecondaryListings,
  type SecondaryListParams,
} from "@/lib/api/secondary-market";
import { useSessionStore } from "@/lib/store/use-session-store";

function normalizeList(value?: string | string[]) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .map((item) => item.trim())
    .filter(Boolean)
    .sort();
}

export function useSecondaryListings(params?: SecondaryListParams) {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);
  const search = params?.search?.trim() || undefined;
  const sectors = normalizeList(params?.sector);
  const transferTypes = normalizeList(params?.transfer_type);
  const ordering = params?.ordering;
  const minAmount = params?.min_amount;
  const maxAmount = params?.max_amount;

  return useQuery({
    queryKey: [
      "secondary-market",
      "listings",
      userId,
      search || "",
      sectors.join(","),
      transferTypes.join(","),
      ordering || "",
      minAmount ?? "",
      maxAmount ?? "",
    ],
    queryFn: () =>
      fetchSecondaryListings({
        search,
        sector: sectors.length > 0 ? sectors : undefined,
        transfer_type:
          transferTypes.length > 0
            ? (transferTypes as SecondaryListParams["transfer_type"])
            : undefined,
        ordering,
        min_amount: minAmount,
        max_amount: maxAmount,
      }),
    enabled: status === "authenticated" && !!userId,
  });
}

export function useSecondaryListing(id: string) {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);

  return useQuery({
    queryKey: ["secondary-market", "listing", userId, id],
    queryFn: () => fetchSecondaryListing(id),
    enabled: status === "authenticated" && !!userId && !!id,
  });
}

export function useExpressSecondaryInterest() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (id: string) => expressSecondaryInterest(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["secondary-market", "listings", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["secondary-market", "listing", userId, id],
        }),
      ]);
    },
  });
}

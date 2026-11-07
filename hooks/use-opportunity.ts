"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvestorInterest,
  createInvestorInterest,
  fetchInvestorInterests,
  updateInvestorInterest,
} from "@/lib/api/interests";
import {
  fetchOpportunityDetail,
  requestOpportunityInformation,
} from "@/lib/api/marketplace";
import { useSessionStore } from "@/lib/store/use-session-store";

function useAuthed() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);
  return { userId, enabled: status === "authenticated" && !!userId };
}

export function useOpportunityDetail(id: string) {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["marketplace", "opportunity", userId, id],
    queryFn: () => fetchOpportunityDetail(id),
    enabled: enabled && !!id,
  });
}

export function useInvestorInterests() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["marketplace", "interests", userId],
    queryFn: fetchInvestorInterests,
    enabled,
  });
}

export function useCreateInvestorInterest() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: createInvestorInterest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["marketplace", "interests", userId],
      });
    },
  });
}

export function useUpdateInvestorInterest() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: ({
      id,
      amount,
      investmentDate,
    }: {
      id: string;
      amount?: string;
      investmentDate?: string;
    }) => updateInvestorInterest(id, { amount, investmentDate }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["marketplace", "interests", userId],
      });
    },
  });
}

export function useCancelInvestorInterest() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: cancelInvestorInterest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["marketplace", "interests", userId],
      });
    },
  });
}

export function useRequestOpportunityInformation() {
  return useMutation({
    mutationFn: (id: string) => requestOpportunityInformation(id),
  });
}

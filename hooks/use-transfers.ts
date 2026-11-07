"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelSecondaryInterest,
  cancelTransfer,
  createTransfer,
  fetchSecondaryInterests,
  fetchTransfer,
  fetchTransfers,
  submitTransfer,
  updateSecondaryInterest,
  updateTransfer,
} from "@/lib/api/transfers";
import type { TransferCreateRequest } from "@/lib/api/types";
import { useSessionStore } from "@/lib/store/use-session-store";

function useAuthed() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);
  return { userId, enabled: status === "authenticated" && !!userId };
}

export function useTransfers() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["transfers", userId],
    queryFn: fetchTransfers,
    enabled,
  });
}

export function useSecondaryInterests() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["secondary-interests", userId],
    queryFn: fetchSecondaryInterests,
    enabled,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (body: TransferCreateRequest) => createTransfer(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transfers", userId] });
    },
  });
}

export function useTransferDetail(id: string | undefined) {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["transfers", "detail", userId, id],
    queryFn: () => fetchTransfer(id!),
    enabled: enabled && !!id,
  });
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<TransferCreateRequest>;
    }) => updateTransfer(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transfers", userId] });
    },
  });
}

export function useSubmitTransfer() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (id: string) => submitTransfer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transfers", userId] });
    },
  });
}

export function useCancelTransfer() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (id: string) => cancelTransfer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["transfers", userId] });
    },
  });
}

export function useCancelSecondaryInterest() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (id: string) => cancelSecondaryInterest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["secondary-interests", userId],
      });
    },
  });
}

export function useUpdateSecondaryInterest() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: string }) =>
      updateSecondaryInterest(id, amount),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["secondary-interests", userId],
      });
    },
  });
}

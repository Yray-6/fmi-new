"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyNetworkProfile,
  fetchNetworkConnections,
  fetchNetworkDirectory,
  fetchNetworkInvestor,
  partitionNetworkConnections,
  sendNetworkConnection,
  updateMyNetworkProfile,
  updateNetworkConnection,
  type NetworkDirectoryParams,
  type UpdateMyNetworkProfileInput,
} from "@/lib/api/network";
import { useSessionStore } from "@/lib/store/use-session-store";

function useAuthed() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);
  return { userId, enabled: status === "authenticated" && !!userId };
}

export function useNetworkDirectory(params?: NetworkDirectoryParams) {
  const { userId, enabled } = useAuthed();
  const search = params?.search?.trim() || undefined;
  const sector = params?.sector?.trim() || undefined;
  const location = params?.location?.trim() || undefined;
  const page = params?.page ?? 1;

  return useQuery({
    queryKey: [
      "network",
      "directory",
      userId,
      page,
      search || "",
      sector || "",
      location || "",
    ],
    queryFn: () =>
      fetchNetworkDirectory({
        page,
        search,
        sector,
        location,
      }),
    enabled,
  });
}

export function useNetworkInvestor(id: string | undefined) {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["network", "investor", userId, id],
    queryFn: () => fetchNetworkInvestor(id!),
    enabled: enabled && !!id,
  });
}

export function useNetworkConnections() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["network", "connections", userId],
    queryFn: async () => {
      const connections = await fetchNetworkConnections();
      return {
        connections,
        ...partitionNetworkConnections(connections),
      };
    },
    enabled,
  });
}

export function useMyNetworkProfile() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["network", "my-profile", userId],
    queryFn: fetchMyNetworkProfile,
    enabled,
  });
}

export function useSendNetworkConnection() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);

  return useMutation({
    mutationFn: ({
      targetId,
      message,
    }: {
      targetId: string;
      message?: string;
    }) => sendNetworkConnection(targetId, message),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["network", "directory", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["network", "connections", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["network", "investor", userId, variables.targetId],
        }),
      ]);
    },
  });
}

export function useUpdateNetworkConnection() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);

  return useMutation({
    mutationFn: ({
      connectionId,
      status,
    }: {
      connectionId: string;
      status: "accepted" | "rejected";
    }) => updateNetworkConnection(connectionId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["network", "directory", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["network", "connections", userId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["network", "investor", userId],
        }),
      ]);
    },
  });
}

export function useUpdateMyNetworkProfile() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (input: UpdateMyNetworkProfileInput) =>
      updateMyNetworkProfile(input),
    onSuccess: async (profile) => {
      queryClient.setQueryData(["network", "my-profile", userId], profile);
      await queryClient.invalidateQueries({
        queryKey: ["network", "directory", userId],
      });
    },
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type Notice,
} from "@/lib/api/notifications";
import { useSessionStore } from "@/lib/store/use-session-store";

export function useNotifications() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);

  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: fetchNotifications,
    enabled: status === "authenticated" && !!userId,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (notices: Notice[]) => {
      markAllNotificationsRead(notices);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },
  });
}

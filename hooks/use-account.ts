"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteAccountDocument,
  downloadAccountDocument,
  fetchAccountActivity,
  fetchAccountDocuments,
  fetchAccountProfile,
  fetchNotificationFlags,
  fetchSessions,
  revokeSession,
  updateAccountProfile,
  updateNotificationFlags,
  uploadAccountDocument,
  type AccountProfile,
  type NotificationFlag,
} from "@/lib/api/account";
import { useSessionStore } from "@/lib/store/use-session-store";

function useAuthed() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);
  return { userId, enabled: status === "authenticated" && !!userId };
}

export function useAccountProfile() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["account", "profile", userId],
    queryFn: fetchAccountProfile,
    enabled,
  });
}

export function useUpdateAccountProfile() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (profile: AccountProfile) => updateAccountProfile(profile),
    onSuccess: async (profile) => {
      queryClient.setQueryData(["account", "profile", userId], profile);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useAccountSessions() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["account", "sessions", userId],
    queryFn: fetchSessions,
    enabled,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["account", "sessions", userId],
      });
    },
  });
}

export function useAccountDocuments() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["account", "documents", userId],
    queryFn: fetchAccountDocuments,
    enabled,
  });
}

export function useUploadAccountDocument() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) =>
      uploadAccountDocument(file, title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["account", "documents", userId],
      });
    },
  });
}

export function useDeleteAccountDocument() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (id: string) => deleteAccountDocument(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["account", "documents", userId],
      });
    },
  });
}

export function useAccountActivity() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["account", "activity", userId],
    queryFn: fetchAccountActivity,
    enabled,
  });
}

export function useNotificationFlags() {
  const { userId, enabled } = useAuthed();
  return useQuery({
    queryKey: ["account", "notifications", userId],
    queryFn: fetchNotificationFlags,
    enabled,
  });
}

export function useUpdateNotificationFlags() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id);
  return useMutation({
    mutationFn: (flags: NotificationFlag[]) => updateNotificationFlags(flags),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["account", "notifications", userId],
      });
    },
  });
}

export { downloadAccountDocument };

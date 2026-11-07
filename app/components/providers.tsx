"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { makeQueryClient } from "@/lib/query/client";
import { useSessionStore } from "@/lib/store/use-session-store";

function createNoopPersister() {
  return {
    persistClient: async () => undefined,
    restoreClient: async () => undefined,
    removeClient: async () => undefined,
  };
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const userId = useSessionStore((state) => state.user?.id);

  const persister = useMemo(() => {
    if (typeof window === "undefined") {
      return createNoopPersister();
    }
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: `fmi-query-cache-${userId ?? "anonymous"}`,
    });
  }, [userId]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        buster: "v1",
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

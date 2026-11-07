"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOverviewDashboard } from "@/lib/api/overview";
import { useSessionStore } from "@/lib/store/use-session-store";

export function useOverview() {
  const userId = useSessionStore((state) => state.user?.id);
  const status = useSessionStore((state) => state.status);

  return useQuery({
    queryKey: ["overview", userId],
    queryFn: fetchOverviewDashboard,
    enabled: status === "authenticated" && !!userId,
  });
}

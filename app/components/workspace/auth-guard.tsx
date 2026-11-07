"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/use-session-store";
import { WorkspaceShell } from "./workspace-shell";
import { RouteSkeleton } from "./skeletons";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useSessionStore((state) => state.status);
  const hydrate = useSessionStore((state) => state.hydrate);
  const hasHydrated = useSessionStore((state) => state._hasHydrated);
  const isVerifying = useSessionStore((state) => state.isVerifying);

  useEffect(() => {
    if (!hasHydrated) return;
    void hydrate();
  }, [hasHydrated, hydrate]);

  useEffect(() => {
    if (!hasHydrated || isVerifying) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [hasHydrated, isVerifying, status, router]);

  const authenticated = status === "authenticated";

  return (
    <WorkspaceShell>
      {/* Keep the route mounted so Cache Components can validate instant navigation. */}
      <div hidden={!authenticated} inert={!authenticated}>
        {children}
      </div>
      {authenticated ? null : <RouteSkeleton />}
    </WorkspaceShell>
  );
}

"use client";

import {
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { WorkspaceHeader } from "./workspace-header";

function CloseMenuOnNavigate({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    onNavigate();
  }, [pathname, onNavigate]);

  return null;
}

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-svh w-full min-w-0 flex-1 bg-white text-[#14271F]">
      <Suspense fallback={null}>
        <CloseMenuOnNavigate onNavigate={() => setMenuOpen(false)} />
      </Suspense>

      <div className="sticky top-0 hidden h-svh shrink-0 lg:block">
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader
          menuOpen={menuOpen}
          onMenu={() => setMenuOpen((open) => !open)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

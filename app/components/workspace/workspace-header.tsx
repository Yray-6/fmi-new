"use client";

import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { NotificationControl } from "./notifications";
import { useSlide } from "./use-slide";
import { useSessionStore } from "@/lib/store/use-session-store";

export function WorkspaceHeader({
  menuOpen,
  onMenu,
}: {
  menuOpen: boolean;
  onMenu: () => void;
}) {
  const { mounted, shown } = useSlide(menuOpen);
  const user = useSessionStore((state) => state.user);
  const initials = user?.initials || "—";
  const displayName = user?.fullName || "Investor";
  const role = user?.investorTypeDisplay || "Investor";

  return (
    <header className="sticky top-0 z-30 border-b border-[#D9E5DD] bg-white">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-0 lg:hidden"
          aria-label="Close navigation"
          onClick={onMenu}
        />
      ) : null}
      <div className="relative z-10 flex items-center gap-3 px-4 py-4 lg:hidden">
        <Link
          href="/overview"
          className="flex min-w-0 flex-1 items-center gap-2.5"
          onClick={() => {
            if (menuOpen) onMenu();
          }}
        >
          <img
            src="/logo-green.svg"
            alt=""
            width={28}
            height={52}
            className="h-[52px] w-auto"
          />
          <span className="font-[family-name:var(--font-alan-sans)] text-[21px] font-bold leading-none text-accent">
            FMI
          </span>
        </Link>
        <Link
          href="/account"
          aria-label="Account and security"
          className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#E8F7EC] text-sm font-semibold leading-[1.35] text-[#14271F]"
          onClick={() => {
            if (menuOpen) onMenu();
          }}
        >
          {initials}
        </Link>
        <NotificationControl menuOpen={menuOpen} onMenu={onMenu} />
        <button
          type="button"
          className="inline-flex size-[35px] shrink-0 items-center justify-center"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-workspace-menu"
          onClick={onMenu}
        >
          <img src="/workspace/icon-menu.svg" alt="" width={35} height={35} />
        </button>
      </div>
      {mounted ? (
        <div
          className={`absolute inset-x-0 top-full z-10 overflow-hidden drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] lg:hidden ${
            shown ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <MobileMenu shown={shown} onClose={onMenu} />
        </div>
      ) : null}

      <div className="relative z-10 hidden h-[82px] items-center justify-end gap-[22px] px-8 lg:flex">
        <NotificationControl menuOpen={menuOpen} onMenu={onMenu} />

        <div className="h-7 w-px shrink-0 bg-[#D9E5DD]" aria-hidden />

        <Link
          href="/account"
          aria-label="Account and security"
          className="flex shrink-0 items-center gap-2.5 rounded-lg py-1 pr-1 hover:bg-[#F4F9F6]"
        >
          <div className="flex size-[34px] items-center justify-center rounded-full bg-[#E8F7EC] text-sm font-semibold leading-[1.35] text-[#14271F]">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold leading-[1.35] text-[#14271F]">
              {displayName}
            </p>
            <p className="text-[10px] leading-[1.35] text-[#718078]">{role}</p>
          </div>
          <img src="/workspace/icon-chevron.svg" alt="" width={16} height={16} />
        </Link>
      </div>
    </header>
  );
}

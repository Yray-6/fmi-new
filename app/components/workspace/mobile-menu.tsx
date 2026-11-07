"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/use-session-store";

const destinations = [
  { label: "Overview", href: "/overview", icon: "/workspace/menu-overview.svg" },
  { label: "Marketplace", href: "/marketplace", icon: "/workspace/menu-marketplace.svg" },
  { label: "Portfolio", href: "/portfolio", icon: "/workspace/menu-portfolio.svg" },
  { label: "Analytics", href: "/analytics", icon: "/workspace/menu-analytics.svg" },
  // { label: "Wallet", href: "/wallet", icon: "/workspace/menu-wallet.svg" },
  {
    label: "Network",
    href: "/network",
    icon: "/workspace/menu-network.svg",
  },
  {
    label: "Secondary Market",
    href: "/marketplace/secondary",
    icon: "/workspace/menu-secondary.svg",
  },
  {
    label: "Account & Security",
    href: "/account",
    icon: "/workspace/menu-account.svg",
    plain: true,
  },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/marketplace") {
    return (
      pathname === "/marketplace" || pathname.startsWith("/marketplace/watchlist")
    );
  }
  if (href === "/marketplace/secondary") {
    return pathname.startsWith("/marketplace/secondary");
  }
  if (href === "/network") {
    return pathname === "/network" || pathname.startsWith("/network/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ src, size }: { src: string; size: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskMode: "alpha",
      }}
    />
  );
}

export function MobileMenu({
  onClose,
  shown,
}: {
  onClose: () => void;
  shown: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);

  return (
    <nav
      id="mobile-workspace-menu"
      aria-label="Workspace"
      className={`flex max-h-[calc(100svh-5.5rem)] flex-col gap-[5px] overflow-y-auto rounded-b-[20px] bg-white pt-[15px] pb-[5px] transition-transform duration-300 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {destinations.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onClose}
            style={{ paddingLeft: "clamp(2rem, calc(50% - 4rem), 8.125rem)" }}
            className={`flex items-center gap-5 py-3 pr-6 text-xs leading-[1.35] ${
              "plain" in item && item.plain ? "" : "border-b border-[#D9E5DD]"
            } ${active ? "font-semibold text-accent" : "text-[#7C7C7C]"}`}
          >
            <span className="flex size-[22px] shrink-0 items-center justify-center">
              <MenuIcon src={item.icon} size={22} />
            </span>
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          onClose();
          await logout();
          router.replace("/login");
        }}
        style={{ paddingLeft: "clamp(2rem, calc(50% - 4rem), 8.125rem)" }}
        className="flex items-center gap-5 py-3 pr-6 text-left text-xs leading-[1.35] text-[#F43939]"
      >
        <span className="flex size-[22px] shrink-0 items-center justify-center">
          <MenuIcon src="/workspace/menu-sign-out.svg" size={20} />
        </span>
        Sign Out
      </button>
    </nav>
  );
}

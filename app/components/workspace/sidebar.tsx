"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/store/use-session-store";

const destinations = [
  { label: "Overview", href: "/overview", icon: "/workspace/icon-overview.svg" },
  { label: "Marketplace", href: "/marketplace", icon: "/workspace/icon-marketplace.svg" },
  { label: "Portfolio", href: "/portfolio", icon: "/workspace/icon-portfolio.svg" },
  { label: "Analytics", href: "/analytics", icon: "/workspace/icon-analytics.svg" },
  // { label: "Wallet", href: "/wallet", icon: "/workspace/icon-wallet.svg" },
  {
    label: "Network",
    href: "/network",
    icon: "/workspace/icon-network.svg",
  },
  {
    label: "Secondary market",
    href: "/marketplace/secondary",
    icon: "/workspace/icon-transfer.svg",
  },
  {
    label: "Account & security",
    href: "/account",
    icon: "/workspace/icon-account.svg",
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useSessionStore((state) => state.logout);

  return (
    <aside className="flex h-full w-[232px] flex-col justify-between overflow-y-auto border-r border-[#D9E5DD] bg-white px-[18px] pb-6 pt-7">
      <div className="flex flex-col gap-7">
        <Link href="/overview" className="flex items-center gap-2.5">
          <img
            src="/logo-green.svg"
            alt=""
            width={28}
            height={51}
            className="h-[51px] w-auto"
          />
          <span className="font-[family-name:var(--font-alan-sans)] text-[21px] font-bold leading-none text-accent">
            FMI
          </span>
        </Link>

        <nav aria-label="Workspace" className="flex flex-col gap-1.5">
          <p className="text-[11px] leading-4 text-[#718078]">WORKSPACE</p>
          {destinations.map((item) => {
            const active =
              item.href === "/marketplace"
                ? pathname === "/marketplace" ||
                  pathname.startsWith("/marketplace/watchlist")
                : item.href === "/marketplace/secondary"
                  ? pathname.startsWith("/marketplace/secondary")
                  : item.href === "/network"
                    ? pathname === "/network" || pathname.startsWith("/network/")
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
            const className = `flex h-[50px] items-center gap-[3px] rounded-lg px-2.5 ${
              active ? "bg-[#E8F7EC]" : "hover:bg-[#F4F9F6]"
            }`;
            const label = (
              <>
                <img
                  src={item.icon}
                  alt=""
                  width={22}
                  height={22}
                  className="size-[22px] shrink-0"
                />
                <span
                  className={`pl-2.5 text-base leading-6 ${
                    active ? "font-semibold text-accent" : "text-[#53645B]"
                  }`}
                >
                  {item.label}
                </span>
              </>
            );

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 flex flex-col gap-[17px]">
        <a
          href="#"
          className="flex items-center gap-2.5 px-2.5 text-[15px] leading-6 text-[#53645B] hover:text-[#14271F]"
          onClick={(event) => event.preventDefault()}
        >
          <img
            src="/workspace/icon-help.svg"
            alt=""
            width={18}
            height={18}
          />
          Help & support
        </a>
        <div className="h-px bg-[#D9E5DD]" />
        <button
          type="button"
          className="flex h-9 items-center gap-[13px] pl-2.5 text-left text-[15px] leading-6 text-[#53645B] hover:text-[#14271F]"
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <img
            src="/workspace/icon-sign-out.svg"
            alt=""
            width={20}
            height={20}
          />
          Sign out
        </button>
      </div>
    </aside>
  );
}

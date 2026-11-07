import Link from "next/link";
import type { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full min-w-0 flex-1 flex-col overflow-x-clip bg-white text-[#14271F]">
      <header className="border-b border-[#D9E5DD]">
        <div className="mx-auto flex h-[88px] w-full max-w-[1440px] items-center justify-between gap-4 px-6 lg:h-24 lg:px-12">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo-green.svg"
                alt="FMI"
                width={28}
                height={51}
                className="h-[51px] w-auto"
              />
              <span className="font-[family-name:var(--font-alan-sans)] text-[21px] font-bold leading-none text-accent lg:text-[23px]">
                FMI
              </span>
            </Link>
            <p className="hidden text-base text-[#53645B] lg:block">
              Investor workspace
            </p>
          </div>
          <a
            href="#"
            className="shrink-0 text-xs leading-6 text-accent hover:underline lg:text-[15px]"
          >
            Help & support
          </a>
        </div>
      </header>

      <main className="flex w-full min-w-0 flex-1 flex-col lg:justify-center">
        {children}
      </main>

      <footer className="bg-[#F4F9F6] lg:bg-transparent">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-3 px-6 py-6 lg:min-h-[68px] lg:flex-row lg:justify-between lg:px-12 lg:py-4">
          <div className="flex gap-6 lg:order-2">
            <a
              href="#"
              className="text-xs leading-5 text-[#53645B] hover:underline lg:text-[13px]"
            >
              Privacy policy
            </a>
            <a
              href="#"
              className="text-xs leading-5 text-[#53645B] hover:underline lg:text-[13px]"
            >
              Terms of use
            </a>
          </div>
          <p className="text-xs leading-[18px] text-[#718078] lg:order-1 lg:text-[13px]">
            © 2026 FMI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const platformLinks = [
  "Explore Opportunities",
  "How It Works",
  "Portfolio Management",
  "Market Insights",
] as const;

const companyLinks = ["About FMI", "Contact Us", "For Businesses"] as const;

const resourceLinks = [
  "Investor Guide",
  "FAQs",
  "Investment Education",
] as const;

const legalLinks = [
  "Terms of Use",
  "Privacy Policy",
  "Risk Disclosures",
  "Regulatory Information",
] as const;

function FooterColumn({
  title,
  links,
  compact = false,
}: {
  title: string;
  links: readonly string[];
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex h-full flex-col gap-4 rounded-2xl bg-[#F3F4F6] p-4"
          : "flex min-w-0 flex-1 flex-col gap-5 rounded-2xl bg-[#F3F4F6] p-6"
      }
    >
      <h3
        className={
          compact
            ? "font-[family-name:var(--font-stack-sans)] text-xs font-medium leading-[26px] text-accent"
            : "font-[family-name:var(--font-stack-sans)] text-lg font-medium leading-[26px] text-accent"
        }
      >
        {title}
      </h3>
      <ul className={compact ? "flex flex-col" : "flex flex-col gap-2.5"}>
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className={
                compact
                  ? "block text-xs leading-6 text-[#53645B] hover:text-accent"
                  : "block text-[17px] leading-[26px] text-[#53645B] hover:text-accent"
              }
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#07130F] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 83% 16%, rgba(23, 76, 53, 1) 0%, rgba(11, 33, 24, 1) 65%, rgba(7, 19, 15, 1) 100%)",
        }}
        aria-hidden
      />
      <img
        src="/cta-pattern.svg"
        alt=""
        className="pointer-events-none absolute top-6 right-0 w-[280px] lg:hidden"
        aria-hidden
      />
      <img
        src="/cta-pattern.svg"
        alt=""
        className="pointer-events-none absolute top-7 right-0 hidden opacity-10 lg:block"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[480px] flex-col items-center gap-8 px-6 py-14 text-center lg:hidden">
        <div className="flex flex-col items-center gap-6">
          <h2 className="max-w-[237px] font-[family-name:var(--font-stack-sans)] text-sm font-normal leading-[43px] text-[#F7FAF8]">
            A More Informed Way to Explore{" "}
            <span className="text-accent-bright">Private Markets.</span>
          </h2>
          <img
            src="/divider-mobile.svg"
            alt=""
            className="h-[3px] w-full"
            aria-hidden
          />
          <p className="text-xs leading-[27px] text-[#C0CEC6]">
            Your next investment opportunity starts with the right information.
            Join FFMI to explore private businesses, understand available
            opportunities, and manage your investment journey from one central
            platform.
          </p>
        </div>
        <div className="flex w-full flex-col gap-4">
          <p className="text-xs leading-[22px] text-[#9BAEA2]">
            Create your account to get started. Investment eligibility and
            verification requirements may apply.
          </p>
          <a
            href="/login"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[10px] border border-white bg-white text-xs font-medium leading-6 text-accent"
          >
            Get Started
          </a>
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-[1440px] flex-col gap-10 px-6 py-24 sm:px-10 lg:flex lg:flex-row lg:items-center lg:gap-20 lg:px-[60px] lg:py-32">
        <div className="flex max-w-[740px] flex-col gap-7">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[36px] font-normal leading-[50px] text-[#F7FAF8] sm:text-[48px] sm:leading-[66px]">
            A More Informed Way
            <br />
            to Explore <span className="text-accent-bright">Private Markets.</span>
          </h2>
          <img
            src="/divider-cta.svg"
            alt=""
            className="h-1 w-full max-w-[379px]"
            aria-hidden
          />
          <p className="max-w-[640px] text-xl leading-[29px] text-[#C0CEC6]">
            Your next investment opportunity starts with the right information.
            Join FFMI to explore private businesses, understand available
            opportunities, and manage your investment journey from one central
            platform.
          </p>
        </div>

        <div className="flex w-full max-w-[387px] flex-col items-stretch gap-6 lg:ml-auto lg:items-end">
          <p className="max-w-[350px] text-right text-[15px] leading-[22px] text-[#9BAEA2]">
            Create your account to get started. Investment eligibility and
            verification requirements may apply.
          </p>
          <a
            href="/login"
            className="inline-flex h-[42px] w-full max-w-[376px] items-center justify-center rounded-[10px] border border-white bg-white text-[17px] font-medium leading-6 text-accent"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 rounded-t-[30px] bg-[#F4F9F6]">
      <div className="relative z-10 mx-auto flex w-full max-w-[480px] flex-col gap-8 px-6 py-8 lg:hidden">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-[#E8F7E8] p-6 text-center">
          <a href="#" className="flex items-center gap-2.5">
            <img
              src="/logo-green.svg"
              alt="FMI"
              className="h-[52px] w-auto"
            />
            <span className="font-[family-name:var(--font-alan-sans)] text-[21px] font-bold leading-none text-accent">
              FMI
            </span>
          </a>
          <p className="font-[family-name:var(--font-stack-sans)] text-sm font-medium leading-6 text-[#14271F]">
            Capital Meets Opportunity.
          </p>
          <p className="text-xs leading-[26px] text-[#53645B]">
            Connecting investors with private-market opportunities through a
            more accessible, informed, and structured investment experience.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FooterColumn compact title="Platform" links={platformLinks} />
          <FooterColumn compact title="Company" links={companyLinks} />
          <FooterColumn compact title="Resources" links={resourceLinks} />
          <FooterColumn compact title="Legal" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-[22px]">
          <div className="h-px w-full bg-[#D9E5DD]" />
          <p className="text-center text-xs leading-[22px] text-[#53645B]">
            © 2026 FMI. All rights reserved.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-[1440px] flex-col gap-14 px-6 pt-10 pb-10 sm:px-10 lg:flex lg:gap-14 lg:px-[60px] lg:pt-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-20">
          <div className="flex w-full max-w-[360px] shrink-0 flex-col gap-5 rounded-3xl bg-[#E8F7E8] p-8">
            <a href="#" className="flex items-center gap-[18px]">
              <img
                src="/logo-green.svg"
                alt="FMI"
                className="h-[72px] w-[39px]"
              />
              <span className="font-[family-name:var(--font-alan-sans)] text-[36px] font-bold leading-none text-accent">
                FMI
              </span>
            </a>
            <p className="font-[family-name:var(--font-stack-sans)] text-base font-medium leading-[44px] text-[#14271F]">
              Capital Meets Opportunity.
            </p>
            <p className="text-lg leading-[26px] text-[#53645B]">
              Connecting investors with private-market opportunities through a
              more accessible, informed, and structured investment experience.
            </p>
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
            <FooterColumn title="Platform" links={platformLinks} />
            <FooterColumn title="Company" links={companyLinks} />
            <FooterColumn title="Resources" links={resourceLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>
        </div>

        <div className="flex flex-col gap-[22px]">
          <div className="h-px w-full bg-[#D9E5DD]" />
          <p className="text-sm leading-[22px] text-[#53645B]">
            © 2026 FMI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function ClosingBlock() {
  return (
    <div className="relative">
      <SiteFooter />
    </div>
  );
}

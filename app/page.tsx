import { ClosingBlock } from "./components/closing-sections";
import { ClaritySection, JourneySection } from "./components/landing-sections";

const navLinks: { label: string; href: string; active?: boolean }[] = [
  { label: "Home", href: "#", active: true },
  { label: "About Us", href: "#" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Analytics", href: "#" },
];

const features = [
  {
    title: "Discover Opportunities",
    body: "Explore businesses with the potential to shape industries, create value, and contribute to economic growth. Review available opportunities, understand their funding objectives, and assess the details that matter to you.",
    icon: "/security.svg",
    iconAlt: "Discover opportunities",
  },
  {
    title: "Portfolio Monitoring",
    body: "Track capital deployment, realized gains, and payout history through centralized dashboard designed for clarity, and informed decision making across both primary and secondary investments.",
    icon: "/activity.svg",
    iconAlt: "Monitoring activity",
  },
  {
    title: "Ownership Transfer",
    body: "Execute secure secondary transactions with verified sellers, and automated ownership reassignment ensuring a seamless transfer process without disrupting future returns or investment timelines.",
    icon: "/transfer.svg",
    iconAlt: "Ownership transfer",
  },
] as const;

function BrandMark() {
  return (
    <a href="#" className="flex items-center gap-3">
      <img
        src="/logo.svg"
        alt="FMI"
        width={32}
        height={59}
        className="h-[clamp(2.5rem,5.5vh,3.7rem)] w-auto"
      />
      <span className="font-[family-name:var(--font-alan-sans)] text-[clamp(1.25rem,2.3vh,1.5rem)] font-bold leading-none">
        FMI
      </span>
    </a>
  );
}

export default function Home() {
  return (
    <div className="min-h-full bg-white">
      <section className="relative isolate overflow-hidden rounded-b-[32px] bg-[#051713] text-white lg:h-svh lg:max-h-svh lg:rounded-b-[60px]">
        <img
          src="/hero-bg.gif"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(8, 8, 8, 0.5) 50%, rgba(0, 0, 0, 0.5) 100%), radial-gradient(ellipse at 40% 50%, rgba(0, 0, 0, 0.6) 0%, rgba(56, 56, 56, 0.6) 49%, rgba(0, 0, 0, 0.6) 100%)",
          }}
          aria-hidden
        />
        <img
          src="/overlay-left.svg"
          alt=""
          className="pointer-events-none absolute left-[-36%] top-[-95%] z-0 hidden h-[290%] w-[72%] opacity-10 lg:block"
          aria-hidden
        />
        <img
          src="/overlay-right.svg"
          alt=""
          className="pointer-events-none absolute left-[24%] top-[-80%] z-0 hidden h-[290%] w-[120%] opacity-60 lg:block"
          aria-hidden
        />

        {/* Desktop — Figma proportions as % of 1440×1024 */}
        <div className="relative z-10 mx-auto hidden h-full w-full max-w-[1440px] lg:block">
          <header className="absolute left-[4.1%] right-[4.1%] top-[4.5%] flex items-center justify-between">
            <BrandMark />
            <nav className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-base leading-6 ${
                    link.active
                      ? "text-accent"
                      : "text-white hover:text-accent-bright"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <a
              href="/login"
              className="rounded-lg bg-white px-6 py-2 text-base leading-6 text-accent shadow-[0px_2px_4px_-2px_rgba(255,255,255,0.05),0px_4px_6px_-1px_rgba(255,255,255,0.05)]"
            >
              Register
            </a>
          </header>

          {/* Cards: x=842/1440≈58.5%, y=212/1024≈20.7%, w=539/1440≈37.4%, h=140/1024≈13.7%, gap≈1.2% */}
          <div className="absolute left-[58.5%] top-[20.7%] flex w-[37.4%] flex-col gap-[1.2vh]">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex h-[min(13.7vh,140px)] items-center gap-3 rounded-[20px] bg-glass px-[4%] py-[2.5%]"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-[clamp(0.95rem,1.95vh,1.25rem)] font-bold leading-tight text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-1 line-clamp-3 text-[clamp(0.7rem,1.3vh,0.83rem)] leading-[1.35] text-muted">
                    {feature.body}
                  </p>
                </div>
                <img
                  src={feature.icon}
                  alt={feature.iconAlt}
                  className="h-[clamp(3.5rem,9.4vh,6rem)] w-[clamp(3.5rem,9.4vh,6rem)] shrink-0"
                />
              </article>
            ))}
          </div>

          {/* Headline: x=61/1440≈4.2%, y=636/1024≈62.1%, w=800/1440≈55.5%, 64px≈6.25vh */}
          <h1 className="absolute left-[4.2%] top-[62.1%] w-[55.5%] font-[family-name:var(--font-stack-sans)] text-[clamp(2.25rem,6.25vh,4rem)] font-normal leading-[1.09]">
            Take Full Control
            <br />
            of You{" "}
            <span className="font-bold text-accent-bright">Investments</span> and{" "}
            <span className="font-bold text-accent-bright">Private Portfolio</span>
          </h1>

          {/* Supporting: x=844/1440≈58.6%, y=742/1024≈72.5%, w=534/1440≈37.1% */}
          <p className="absolute left-[58.6%] top-[72.5%] w-[37.1%] text-right text-[clamp(0.9rem,1.95vh,1.25rem)] font-medium leading-[1.4] text-muted-light">
            From real-time performance tracking to ownership transfers and
            in-depth analytics, everything you need to manage your investments
            is right here.
          </p>

          {/* CTAs: x=59/1440≈4.1%, y=886/1024≈86.5% */}
          <div className="absolute left-[4.1%] top-[86.5%] flex items-center gap-6">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-6 py-2 text-base leading-6 text-accent"
            >
              Start Investing
              <img src="/arrow.svg" alt="" width={15} height={15} />
            </a>
            <a
              href="/overview"
              className="inline-flex items-center justify-center rounded-lg border border-accent bg-glass px-6 py-2 text-base leading-6 text-accent"
            >
              View Portfolio
            </a>
          </div>
        </div>

        {/* Mobile — Figma 390px investment overview */}
        <div className="relative z-10 mx-auto w-full max-w-[480px] px-6 pb-8 pt-6 lg:hidden">
          <header className="flex items-center justify-between">
            <a href="#" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="FMI"
                width={23}
                height={42}
                className="h-[42px] w-auto"
              />
              <span className="font-[family-name:var(--font-alan-sans)] text-[17px] font-bold leading-none">
                FMI
              </span>
            </a>
            <a
              href="/login"
              className="inline-flex h-10 w-24 items-center justify-center rounded-[5px] bg-white text-[10px] leading-4 text-accent"
            >
              Register
            </a>
          </header>

          <div className="mt-12 flex flex-col items-center gap-5 text-center">
            <h1 className="max-w-[261px] font-[family-name:var(--font-stack-sans)] text-2xl font-normal leading-[30px]">
              Take Full Control of Your{" "}
              <span className="font-bold text-accent-bright">Investments</span>{" "}
              and{" "}
              <span className="font-bold text-accent-bright">
                Private Portfolio
              </span>
            </h1>
            <p className="text-sm leading-[26px] text-muted-light">
              From real-time performance tracking to ownership transfers and
              in-depth analytics, everything you need to manage your investments
              is right here.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href="/login"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 text-[10px] leading-6 text-accent"
            >
              Start Investing
              <img src="/arrow.svg" alt="" width={15} height={15} />
            </a>
            <a
              href="/overview"
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-accent bg-glass px-4 text-[10px] leading-6 text-accent"
            >
              View Portfolio
            </a>
          </div>

          <div className="mt-10 flex flex-col gap-[5px]">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="relative rounded-[14px] border border-white/20 bg-glass px-[13px] py-[13px]"
              >
                <h2 className="pr-8 text-[10px] font-bold leading-5 text-white">
                  {feature.title}
                </h2>
                <p className="mt-[3px] text-[10px] leading-4 text-muted">
                  {feature.body}
                </p>
                <img
                  src={feature.icon}
                  alt={feature.iconAlt}
                  className="absolute right-3 top-2.5 h-7 w-7"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <ClaritySection />
      <JourneySection />
      <ClosingBlock />
    </div>
  );
}

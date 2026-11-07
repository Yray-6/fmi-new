const clarityCards = [
  {
    title: "Discover Opportunities",
    body: "Explore private businesses and investment opportunities across different sectors and industries.",
    icon: "/global-search.svg",
    className: "z-20 -rotate-[2.5deg]",
  },
  {
    title: "Track Your Investments",
    body: "Monitor your holdings, review available performance information, and keep track of portfolio activity.",
    icon: "/market-analysis.svg",
    className: "z-10 ml-12 rotate-[2deg] sm:ml-14",
  },
  {
    title: "Invest with Greater Confidence",
    body: "Make more informed decisions with access to relevant information, transparent terms, and risk disclosures.",
    icon: "/gold.svg",
    className: "z-20 -rotate-[1.5deg]",
  },
] as const;

const opportunityRows = [
  ["Funding Objective", "Company Overview"],
  ["Projected Returns", "Investment Status"],
  ["Minimum Investment"],
  ["Business name and industry"],
  ["Investment Structure"],
] as const;

function MobileOpportunityTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-[9px] text-[10px] leading-[22px] text-accent shadow-[0px_0px_12px_0px_rgba(50,163,100,0.25)]">
      <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
      {label}
    </span>
  );
}

const journeySteps = [
  {
    number: "01",
    title: "Discover",
    body: "Explore businesses and opportunities across relevant sectors to find investments that align with your interests and objectives.",
  },
  {
    number: "02",
    title: "Participate",
    body: "Follow the applicable investment process, complete the required checks, and make investment decisions based on the opportunity's terms.",
  },
  {
    number: "03",
    title: "Monitor",
    body: "Keep track of your investments, review available performance data, and stay informed about relevant portfolio updates.",
  },
] as const;

const journeyIntro =
  "From your first discovery to ongoing portfolio monitoring, TribeRock FMI brings the essential steps of your investment journey into one connected experience.";

function DecoBars({
  columns,
  className,
}: {
  columns: number[];
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none flex items-start gap-[26px] opacity-40 ${className ?? ""}`}
      aria-hidden
    >
      {columns.map((count, index) => (
        <div key={index} className="flex flex-col gap-[31px] opacity-50">
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="block h-4 w-4 bg-accent" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SectionDivider({ src }: { src: string }) {
  return (
    <img src={src} alt="" className="h-[5px] w-full max-w-[533px]" aria-hidden />
  );
}

function MobileIntro({
  title,
  body,
  titleClassName,
  bodyClassName,
  gapClassName = "gap-2",
}: {
  title: string;
  body: string;
  titleClassName: string;
  bodyClassName: string;
  gapClassName?: string;
}) {
  return (
    <div className={`flex flex-col text-center ${gapClassName}`}>
      <h2
        className={`font-[family-name:var(--font-stack-sans)] font-medium text-accent ${titleClassName}`}
      >
        {title}
      </h2>
      <img
        src="/divider-mobile.svg"
        alt=""
        className="h-[3px] w-full"
        aria-hidden
      />
      <p className={`text-xs leading-[26px] ${bodyClassName}`}>{body}</p>
    </div>
  );
}

export function ClaritySection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-[18px] px-6 py-14 lg:hidden">
        <MobileIntro
          title="Private Investing, Made Clearer."
          body="Private-market investing shouldn't feel complicated or out of reach. PrivCap gives you a structured way to discover opportunities, understand investment details, and keep your financial interests organised."
          titleClassName="text-base leading-5"
          bodyClassName="text-body-gray"
        />
        <div className="relative">
          <img
            src="/pixel-pattern.svg"
            alt=""
            className="pointer-events-none absolute inset-x-0 top-16 w-full"
            aria-hidden
          />
          <div className="relative flex flex-col gap-2">
            {clarityCards.map((card) => (
              <article
                key={card.title}
                className="flex items-center gap-3 rounded-[20px] bg-accent px-5 py-2.5 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)]"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-[10px] font-bold leading-7">{card.title}</h3>
                  <p className="text-[10px] leading-[23px]">{card.body}</p>
                </div>
                <img
                  src={card.icon}
                  alt=""
                  className="h-[42px] w-[42px] shrink-0"
                />
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto hidden w-full max-w-[1440px] px-6 py-16 sm:px-10 lg:block lg:px-[60px] lg:py-20">
        <DecoBars
          columns={[9, 9, 9, 8, 8, 8]}
          className="absolute left-0 top-10 hidden opacity-40 lg:flex"
        />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
          <div className="relative flex min-w-0 max-w-[576px] flex-col gap-6 overflow-visible pr-2">
            {clarityCards.map((card) => (
              <article
                key={card.title}
                className={`flex w-full max-w-[480px] items-center gap-3.5 rounded-[32px] bg-accent px-5 py-3.5 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] sm:rounded-[36px] sm:gap-4 sm:px-6 sm:py-4 ${card.className}`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-[15px] font-bold leading-6 sm:text-base sm:leading-7">
                    {card.title}
                  </h3>
                  <p className="text-[13px] leading-5 sm:text-sm sm:leading-6">
                    {card.body}
                  </p>
                </div>
                <img
                  src={card.icon}
                  alt=""
                  className="h-[58px] w-[58px] shrink-0 sm:h-[67px] sm:w-[67px]"
                />
              </article>
            ))}
          </div>

          <div className="relative z-20 flex flex-col items-start gap-5 bg-white lg:items-end lg:pl-4">
            <h2 className="max-w-[474px] font-[family-name:var(--font-stack-sans)] text-[36px] font-medium leading-[48px] text-accent sm:text-[48px] sm:leading-[60px] lg:text-right">
              Private Investing, Made Clearer.
            </h2>
            <SectionDivider src="/divider-1.svg" />
            <p className="max-w-[480px] text-xl leading-7 text-body-gray lg:text-right">
              Private-market investing shouldn&apos;t feel complicated or out of
              reach. PrivCap gives you a structured way to discover
              opportunities, understand investment details, and keep your
              financial interests organised.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OpportunitiesSection() {
  return (
    <section className="relative overflow-hidden bg-[#F4FAF7] lg:bg-section-tint">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-6 pb-10 pt-14 lg:hidden">
        <MobileIntro
          title="Discover Opportunities Beyond the Ordinary."
          body="Explore businesses with the potential to shape industries, create value, and contribute to economic growth. Review available opportunities, understand their funding objectives, and assess the details that matter to you."
          titleClassName="text-sm leading-5"
          bodyClassName="text-foreground"
        />

        <div className="relative flex flex-col items-center gap-[22px] py-5">
          <img
            src="/pixel-pattern.svg"
            alt=""
            className="pointer-events-none absolute left-1/2 top-8 w-full max-w-[342px] -translate-x-1/2"
            aria-hidden
          />
          {opportunityRows.map((row) => (
            <div
              key={row.join("-")}
              className="relative z-10 flex flex-wrap items-center justify-center gap-3"
            >
              {row.map((label) => (
                <MobileOpportunityTag key={label} label={label} />
              ))}
            </div>
          ))}
        </div>

        <a
          href="#"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent bg-white text-xs leading-6 text-accent"
        >
          Explore
          <img src="/arrow-explore.svg" alt="" width={15} height={15} />
        </a>
      </div>

      <div className="relative mx-auto hidden w-full max-w-[1440px] px-6 py-16 sm:px-10 lg:block lg:px-[60px] lg:py-[80px]">
        <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,566px)_minmax(0,1fr)] lg:gap-10 xl:gap-16">
          <div className="relative z-20 flex max-w-[566px] flex-col gap-5">
            <h2 className="max-w-[528px] font-[family-name:var(--font-stack-sans)] text-[36px] font-medium leading-[48px] text-accent sm:text-[48px] sm:leading-[60px]">
              Discover Opportunities Beyond the Ordinary.
            </h2>
            <SectionDivider src="/divider-2.svg" />
            <p className="text-xl leading-7 text-body-gray">
              Explore businesses with the potential to shape industries, create
              value, and contribute to economic growth. Review available
              opportunities, understand their funding objectives, and assess the
              details that matter to you.
            </p>
            <a
              href="#"
              className="mt-2 inline-flex h-[42px] w-fit items-center justify-center gap-2 rounded-[10px] bg-white px-6 text-base leading-6 text-accent shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)]"
            >
              Explore
              <img src="/arrow-explore.svg" alt="" width={15} height={15} />
            </a>
          </div>

          <div className="relative isolate min-w-0">
            <img
              src="/opportunity-deco.png"
              alt=""
              className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-auto max-w-none opacity-35 lg:block"
              aria-hidden
            />

            <img
              src="/opportunity-tags.png"
              alt="Funding Objective, Company Overview, Projected Returns, Minimum Investment, Investment Status, Business name and industry, Investment Structure"
              className="relative z-10 hidden h-auto w-full max-w-[742px] justify-self-end object-contain lg:ml-auto lg:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyMarker({ children }: { children: string }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl font-medium leading-7 text-white shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)]">
      {children}
    </span>
  );
}

export function JourneySection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-9 px-6 pt-14 pb-16 lg:hidden">
        <MobileIntro
          title="A Clearer Path to Private Investing."
          body={journeyIntro}
          titleClassName="text-sm leading-5"
          bodyClassName="text-foreground"
          gapClassName="gap-[18px]"
        />

        <ol>
          {journeySteps.map((step, index) => {
            const isLast = index === journeySteps.length - 1;
            return (
              <li
                key={step.number}
                className={`relative flex gap-[18px] ${isLast ? "" : "pb-8"}`}
              >
                {isLast ? null : (
                  <span
                    aria-hidden
                    className="absolute top-11 bottom-0 left-[22px] w-px -translate-x-1/2"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, #32A364 0 7px, transparent 7px 14px)",
                    }}
                  />
                )}
                <span className="relative z-10 flex h-[26px] w-11 shrink-0 items-center justify-center">
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-accent font-[family-name:var(--font-mplus-code)] text-[10px] font-medium leading-none text-white">
                    {step.number}
                  </span>
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-[family-name:var(--font-mplus-code)] text-[13px] font-medium leading-6 text-accent">
                    {step.title}
                  </p>
                  <p className="text-[10px] leading-[23px] text-body-gray">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="@container hidden w-full lg:block">
        <div
          className="relative mx-auto w-full max-w-[1440px] overflow-hidden"
          style={{ height: "calc(811px * min(1, 100cqi / 1440px))" }}
        >
          <div
            className="relative h-[811px] w-[1440px] origin-top-left"
            style={{ transform: "scale(min(1, 100cqi / 1440px))" }}
          >
            <div className="absolute top-[141px] left-[588px] flex w-[788px] flex-col items-end gap-5">
              <h2 className="w-[474px] text-right font-[family-name:var(--font-stack-sans)] text-[48px] leading-[60px] font-medium text-accent">
                A Clearer Path to Private Investing.
              </h2>
              <SectionDivider src="/divider-3.svg" />
              <p className="w-[652px] text-right text-xl leading-7 font-normal text-body-gray">
                {journeyIntro}
              </p>
            </div>

            <img
              src="/journey-path.svg"
              alt=""
              className="absolute top-[112px] left-[84px] h-[460px] w-[1293px]"
              aria-hidden
            />

            <div className="absolute top-[76px] left-[60px] h-[101px] w-[461px]">
              <span className="absolute top-3 left-0">
                <JourneyMarker>01</JourneyMarker>
              </span>
              <p className="absolute top-0 left-16 font-[family-name:var(--font-mplus-code)] text-xl leading-[60px] font-medium text-accent">
                Discover
              </p>
              <p className="absolute top-[17px] left-[162px] w-[299px] text-base leading-7 font-medium text-body-gray">
                {journeySteps[0].body}
              </p>
            </div>

            <div className="absolute top-[448px] left-[408px] h-[185px] w-[359px]">
              <span className="absolute top-0 left-[155px]">
                <JourneyMarker>02</JourneyMarker>
              </span>
              <p className="absolute top-12 left-1/2 -translate-x-1/2 font-[family-name:var(--font-mplus-code)] text-xl leading-[60px] font-medium whitespace-nowrap text-accent">
                Participate
              </p>
              <p className="absolute top-[101px] left-0 w-full text-center text-base leading-7 font-medium text-body-gray">
                {journeySteps[1].body}
              </p>
            </div>

            <div className="absolute top-[547px] left-[1083px] h-[188px] w-[298px]">
              <span className="absolute top-0 left-[250px]">
                <JourneyMarker>03</JourneyMarker>
              </span>
              <p className="absolute top-12 right-0 font-[family-name:var(--font-mplus-code)] text-xl leading-[60px] font-medium whitespace-nowrap text-accent">
                Monitor
              </p>
              <p className="absolute top-[104px] right-0 w-[295px] text-right text-base leading-7 font-medium text-body-gray">
                {journeySteps[2].body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

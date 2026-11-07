const capabilities = [
  {
    icon: "/auth/icon-briefcase.svg",
    title: "Portfolio",
    body: "All your holdings",
  },
  {
    icon: "/auth/icon-opportunities.svg",
    title: "Opportunities",
    body: "Explore private markets",
  },
  {
    icon: "/auth/icon-files.svg",
    title: "Documents",
    body: "Always within reach",
  },
] as const;

export function WorkspacePanel() {
  return (
    <section className="hidden w-full min-w-0 flex-col justify-between gap-10 rounded-[14px] bg-[#F4F9F6] p-8 sm:p-10 lg:order-1 lg:flex lg:flex-1 lg:p-12 xl:h-[780px] xl:w-[704px] xl:flex-none xl:p-14">
      <div className="flex flex-col gap-5">
        <p className="text-[13px] font-semibold text-accent">
          YOUR PRIVATE MARKETS, IN PERSPECTIVE
        </p>
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[32px] font-normal leading-[1.18] text-[#14271F] sm:text-[40px] xl:text-[44px]">
          A clearer view of
          <br />
          your investments.
        </h2>
        <p className="max-w-[480px] text-lg leading-[1.5] text-[#53645B]">
          Your portfolio, opportunities and documents. Together in one
          considered workspace.
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-[22px] rounded-[14px] border border-[#D9E5DD] bg-white p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="font-[family-name:var(--font-stack-sans)] text-xl font-normal text-[#14271F]">
            See the bigger picture
          </p>
          <span className="rounded-[5px] bg-[#F4F9F6] px-[9px] py-1 text-xs text-[#53645B]">
            Your workspace
          </span>
        </div>
        <img
          src="/auth/portfolio-chart.svg"
          alt=""
          className="h-32 w-full min-w-0 max-w-full"
          aria-hidden
        />
        <div className="grid grid-cols-3 gap-4">
          {capabilities.map((item) => (
            <div key={item.title} className="flex min-w-0 flex-col gap-[7px]">
              <img src={item.icon} alt="" width={20} height={20} aria-hidden />
              <p className="text-[15px] font-semibold leading-snug text-[#14271F]">
                {item.title}
              </p>
              <p className="text-[13px] leading-[1.4] text-[#53645B]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="flex items-center gap-2.5 text-sm text-[#53645B]">
        <img
          src="/auth/icon-shield.svg"
          alt=""
          width={19}
          height={19}
          aria-hidden
        />
        Private by design. Built around your financial world.
      </p>
    </section>
  );
}

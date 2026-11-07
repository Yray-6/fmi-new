"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is PrivCap, and how does it work?",
    answer:
      "PrivCap is designed to help investors discover, evaluate, and track private-market opportunities in a more structured way. It is built to support the discovery process, portfolio monitoring, and ongoing portfolio activity.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Create an account by registering with your details and completing any required verification steps. Once approved, you can explore opportunities and manage your investment journey from your dashboard.",
  },
  {
    question: "What investment opportunities are available?",
    answer:
      "FMI surfaces private-market opportunities across sectors and industries. Each listing includes available details such as funding objectives, structure, and status so you can evaluate what fits your goals.",
  },
  {
    question: "What is the minimum investment amount?",
    answer:
      "Minimum investment amounts vary by opportunity. Review each listing for its stated minimum and related terms before deciding to participate.",
  },
  {
    question: "Who is eligible to invest?",
    answer:
      "Eligibility depends on opportunity terms and applicable regulations. Some investments may require verification or meet investor criteria before you can participate.",
  },
  {
    question: "Are investment returns guaranteed?",
    answer:
      "No. Private-market investments carry risk, and returns are not guaranteed. Always review disclosures and opportunity details carefully before investing.",
  },
  {
    question: "Can I transfer or exit my investment?",
    answer:
      "Transfer and exit options depend on the opportunity and applicable terms. Where secondary transfers are supported, FMI helps facilitate a structured ownership change process.",
  },
  {
    question: "What fees or additional costs should I expect?",
    answer:
      "Fees and costs vary by opportunity and may include platform or transaction-related charges. Review the listed terms and disclosures for each investment.",
  },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative overflow-hidden bg-[#F5FAF7]">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-8 px-6 py-14 lg:hidden">
        <div className="relative flex flex-col gap-4 text-center">
          <img
            src="/candlestick.svg"
            alt=""
            className="pointer-events-none absolute top-0 right-0 h-36 w-[124px]"
            aria-hidden
          />
          <h2 className="font-[family-name:var(--font-stack-sans)] text-sm font-medium leading-10 text-accent">
            Questions Before You Invest?
          </h2>
          <p className="text-xs leading-[26px] text-body-gray">
            Get familiar with how FMI works, what to expect when creating an
            account, and the key considerations involved in private-market
            investing.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={faq.question}
                className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-2.5"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-4 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span className="min-w-0 flex-1 text-xs font-medium leading-[26px] text-[#111827]">
                    {faq.question}
                  </span>
                  <img
                    src={isOpen ? "/faq-minus.svg" : "/faq-plus.svg"}
                    alt=""
                    className="h-5 w-5 shrink-0"
                  />
                </button>
                {isOpen ? (
                  <p className="mt-3 text-xs leading-6 text-body-gray">
                    {faq.answer}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto hidden w-full max-w-[1440px] px-6 py-16 sm:px-10 lg:block lg:px-[60px] lg:py-[120px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,496px)_minmax(0,765px)] lg:items-start lg:gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="max-w-[466px] font-[family-name:var(--font-stack-sans)] text-[36px] font-medium leading-[48px] text-accent sm:text-[48px] sm:leading-[60px]">
              Questions Before You Invest?
            </h2>
            <p className="max-w-[515px] text-xl leading-7 text-body-gray">
              Get familiar with how FMI works, what to expect when creating an
              account, and the key considerations involved in private-market
              investing.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span className="min-w-0 flex-1 text-lg font-semibold leading-7 text-[#111827] sm:text-xl">
                      {faq.question}
                    </span>
                    <img
                      src={isOpen ? "/faq-minus.svg" : "/faq-plus.svg"}
                      alt=""
                      className="h-5 w-5 shrink-0"
                    />
                  </button>
                  {isOpen ? (
                    <p className="mt-3 text-base leading-6 text-body-gray">
                      {faq.answer}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

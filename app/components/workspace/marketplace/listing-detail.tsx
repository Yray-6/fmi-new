"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  useExpressSecondaryInterest,
  useSecondaryListing,
} from "@/hooks/use-secondary-market";
import type { SecondaryListing } from "@/lib/api/secondary-market";
import { DialogButton, FeedbackDialog, Note } from "./feedback-dialog";

export function ListingDetail({ id }: { id: string }) {
  const listingQuery = useSecondaryListing(id);
  const interestMutation = useExpressSecondaryInterest();
  const [dialog, setDialog] = useState<
    | null
    | { kind: "interest-sent"; name: string }
    | { kind: "interest-failed"; message: string }
  >(null);

  if (listingQuery.isLoading) {
    return (
      <div className="flex flex-col gap-5 px-4 py-4 lg:gap-[22px] lg:px-8 lg:py-8">
        <div className="h-5 w-56 animate-pulse rounded bg-[#E6EDE8]" />
        <div className="h-10 w-72 animate-pulse rounded bg-[#E6EDE8]" />
        <div className="h-56 animate-pulse rounded-[14px] bg-[#0B2118]" />
        <div className="grid gap-[22px] lg:grid-cols-[1fr_400px]">
          <div className="h-80 animate-pulse rounded-[14px] bg-[#E6EDE8]" />
          <div className="h-80 animate-pulse rounded-[14px] bg-[#E6EDE8]" />
        </div>
      </div>
    );
  }

  if (listingQuery.isError || !listingQuery.data) {
    return (
      <div className="flex flex-col gap-5 px-4 py-4 lg:px-8 lg:py-8">
        <BackLink />
        <p className="rounded-[14px] border border-[#D9E5DD] px-4 py-8 text-sm text-[#53645B]">
          {(listingQuery.error as Error)?.message ||
            "This secondary listing could not be loaded."}
        </p>
      </div>
    );
  }

  const listing = listingQuery.data;

  async function expressInterest() {
    try {
      await interestMutation.mutateAsync(listing.id);
      setDialog({ kind: "interest-sent", name: listing.name });
    } catch (error) {
      setDialog({
        kind: "interest-failed",
        message:
          error instanceof Error
            ? error.message
            : "Could not express interest in this listing.",
      });
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="flex w-full min-w-0 flex-col gap-[22px] px-4 py-5 lg:px-8 lg:py-8">
        <BackLink />

        <div className="flex flex-col gap-[5px]">
          <p className="text-xs font-semibold tracking-[0.125em] text-accent">
            SECONDARY MARKET / LISTING {listing.code}
          </p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.25] tracking-[-0.014em] text-[#14271F] lg:text-[32px] lg:tracking-[-0.0125em]">
            {listing.name}
          </h1>
          <p className="text-base leading-[1.4] text-[#53645B]">
            {listing.sector} · {listing.structureLabel} · Existing investor
            holding
          </p>
        </div>

        <section className="overflow-hidden rounded-[14px] bg-[#0B2118]">
          <div className="flex flex-col gap-[7px] p-[22px]">
            <p className="font-[family-name:var(--font-stack-sans)] text-2xl font-normal leading-[1.25] tracking-[-0.0167em] text-white">
              {listing.sector}. An existing opportunity.
            </p>
            <p className="text-[15px] leading-[1.4] text-[#A8C5B2]">
              Acquire {listing.isPartial ? "a portion of" : ""} an existing
              investment
              {listing.sector ? ` in ${listing.sector.toLowerCase()}` : ""}.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Chip>{listing.status}</Chip>
              <Chip>{listing.transferLabel}</Chip>
              {listing.listedAtLabel !== "Not provided" ? (
                <Chip muted>Listed {listing.listedAtLabel}</Chip>
              ) : null}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-[22px] lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-[22px] order-2 lg:order-1">
            <TermsPanel listing={listing} />
            <SellerPanel listing={listing} />
            <NextStepsPanel />
          </div>

          <div className="flex w-full flex-col gap-[22px] order-1 lg:order-2 lg:w-[400px] lg:shrink-0">
            <PurchaseSummary
              listing={listing}
              pending={interestMutation.isPending}
              onInterest={expressInterest}
            />
            <DatesPanel listing={listing} />
            {listing.opportunityId ? (
              <RelatedOpportunity listing={listing} />
            ) : null}
          </div>
        </div>

        <section className="rounded-lg bg-[#E8F7EC] px-[18px] py-[18px]">
          <p className="text-[15px] font-semibold text-[#14271F]">
            Understand the risks before you commit.
          </p>
          <p className="mt-[7px] text-[13px] leading-[1.4] text-[#53645B]">
            Private investments are illiquid and capital is at risk. A secondary
            listing is not a guarantee of liquidity. Returns, distributions and
            maturity payments are subject to issuer performance. Review the
            original investment documents and final transfer terms.
          </p>
        </section>
      </div>

      {dialog?.kind === "interest-sent" ? (
        <FeedbackDialog
          eyebrow="SECONDARY / INTEREST"
          title="Interest submitted"
          onClose={() => setDialog(null)}
          actions={
            <DialogButton onClick={() => setDialog(null)}>Close</DialogButton>
          }
        >
          <Note title="Request received">
            Your interest in {dialog.name} was sent to the seller workflow.
            Expressing interest does not reserve units or move funds.
          </Note>
        </FeedbackDialog>
      ) : null}

      {dialog?.kind === "interest-failed" ? (
        <FeedbackDialog
          eyebrow="SECONDARY / REQUEST FAILURE"
          title="Couldn’t express interest"
          onClose={() => setDialog(null)}
          showClose
          actions={
            <DialogButton tone="primary" onClick={() => setDialog(null)}>
              Try again
            </DialogButton>
          }
        >
          <Note tone="failure">
            <span className="text-base font-semibold text-[#14271F]">
              {dialog.message}
            </span>
          </Note>
        </FeedbackDialog>
      ) : null}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/marketplace/secondary"
      className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-accent"
    >
      ← Back to secondary market
    </Link>
  );
}

function Chip({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-[5px] px-2 py-1 text-xs leading-[1.35] ${
        muted ? "bg-[#F4F9F6] text-[#53645B]" : "bg-[#E8F7EC] text-accent"
      }`}
    >
      {children}
    </span>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-[22px]">
      <h2 className="font-[family-name:var(--font-stack-sans)] text-xl font-normal tracking-[-0.02em] text-[#14271F]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailRow({ label, value, accent = false }: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm leading-[1.4] text-[#53645B]">{label}</p>
      <p
        className={`shrink-0 text-sm font-semibold leading-[1.4] ${
          accent ? "text-accent" : "text-[#14271F]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TermsPanel({ listing }: { listing: SecondaryListing }) {
  const firstName = listing.seller.split(/\s+/)[0] || "the seller";
  const pct =
    listing.percentage !== null ? Math.round(listing.percentage) : null;

  return (
    <Panel title="Investment & transfer terms">
      <Chip>{listing.transferLabel}</Chip>
      <DetailRow label="Investment structure" value={listing.structureLabel} />
      <DetailRow
        label="Principal being transferred"
        value={listing.asking}
      />
      {listing.minimum !== "See terms" ? (
        <DetailRow label="Opportunity minimum" value={listing.minimum} />
      ) : null}
      <div className="h-px bg-[#D9E5DD]" />
      <p className="text-sm leading-[1.4] text-[#53645B]">
        {listing.isPartial && pct !== null
          ? `You are buying ${pct}% of ${firstName}’s existing holding, not ${pct}% of ${listing.name}. The remaining ${100 - pct}% stays with the seller. Rights and future distributions transfer proportionately after approval.`
          : `You are buying ${firstName}’s existing holding in ${listing.name}. Rights and future distributions transfer after approval.`}
      </p>
      <div className="h-px bg-[#D9E5DD]" />
      <DetailRow label="Risk level" value={listing.riskLevel} />
      <DetailRow
        label="Original investment term"
        value={listing.investmentTermLabel}
      />
      <DetailRow
        label="Issuer projected return"
        value={listing.targetIrr}
        accent={listing.targetIrr !== "Not provided"}
      />
      <DetailRow label="Payout frequency" value={listing.payoutFrequency} />
      <p className="text-xs leading-[1.4] text-[#718078]">
        Asking values are set by sellers and are not live prices or a guarantee
        of sale value. Issuer projections are not guaranteed and not
        recalculated for this purchase price.
      </p>
    </Panel>
  );
}

function SellerPanel({ listing }: { listing: SecondaryListing }) {
  return (
    <Panel title="About the seller">
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#E8F7EC] text-[15px] font-semibold text-[#14271F]">
          {listing.sellerInitials}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[#14271F]">
            {listing.seller}
          </p>
          <p className="text-sm leading-[1.4] text-[#53645B]">
            FMI member · Verified seller
          </p>
        </div>
      </div>
      {listing.reason ? (
        <>
          <p className="text-[13px] leading-[1.4] tracking-wide text-[#718078]">
            SELLER’S NOTE / REASON FOR SELLING
          </p>
          <p className="text-[15px] leading-[1.4] text-[#53645B]">
            “{listing.reason}”
          </p>
          <p className="text-xs leading-[1.4] text-[#718078]">
            Seller-provided statement. FMI does not endorse the reason for sale.
          </p>
        </>
      ) : (
        <p className="text-sm text-[#718078]">
          No seller note was provided for this listing.
        </p>
      )}
    </Panel>
  );
}

function NextStepsPanel() {
  const steps = [
    {
      title: "Express your interest",
      body: "Tell FMI you’d like to proceed. This is not a purchase commitment.",
    },
    {
      title: "Review and confirm",
      body: "We check availability and eligibility, then share the final terms and documents.",
    },
    {
      title: "Complete the transfer",
      body: "Once approved, pay the confirmed amount and sign. Your portfolio updates after settlement.",
    },
  ];

  return (
    <Panel title="What happens next?">
      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E8F7EC] text-sm font-semibold text-accent">
              {index + 1}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#14271F]">
                {step.title}
              </p>
              <p className="text-sm leading-[1.4] text-[#53645B]">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PurchaseSummary({
  listing,
  pending,
  onInterest,
}: {
  listing: SecondaryListing;
  pending: boolean;
  onInterest: () => void;
}) {
  const available =
    listing.statusCode === "APPROVED" ||
    listing.status.toLowerCase().includes("available") ||
    listing.status.toLowerCase().includes("approved") ||
    listing.status.toLowerCase().includes("open");

  return (
    <Panel title="Purchase summary">
      <Chip>
        {available
          ? `${listing.status} · Open to interest`
          : listing.status}
      </Chip>
      <div className="flex flex-col gap-[5px]">
        <p className="text-sm leading-[1.4] text-[#53645B]">
          Seller’s asking price
        </p>
        <p className="font-[family-name:var(--font-stack-sans)] text-[36px] font-normal leading-[1.25] tracking-[-0.011em] text-[#14271F]">
          {listing.asking}
        </p>
        <p className="text-[13px] leading-[1.4] text-[#53645B]">
          {listing.isPartial && listing.percentage !== null
            ? `For ${Math.round(listing.percentage)}% of the seller’s holding`
            : "For the seller’s holding"}
        </p>
      </div>
      <div className="h-px bg-[#D9E5DD]" />
      <DetailRow label="Purchase price" value={listing.asking} />
      <DetailRow label="Transfer fee" value={listing.feeLabel} />
      <div className="h-px bg-[#D9E5DD]" />
      <div className="flex flex-col gap-[5px] rounded-lg bg-[#E8F7EC] p-3.5">
        <p className="text-sm font-semibold text-[#14271F]">
          Estimated buyer total
        </p>
        <p className="font-[family-name:var(--font-stack-sans)] text-[30px] font-normal leading-[1.25] tracking-[-0.013em] text-accent">
          {listing.buyerPayableLabel}
        </p>
        <p className="text-xs leading-[1.4] text-[#53645B]">
          Asking price plus listed transfer fee. Final fees confirmed before
          you commit.
        </p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={onInterest}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[15px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Express interest"}
        {!pending ? <span aria-hidden>→</span> : null}
      </button>
      <p className="text-[13px] leading-[1.4] text-[#53645B]">
        No payment is taken now. FMI will confirm availability, eligibility and
        transfer documents before you commit.
      </p>
      <div className="h-px bg-[#D9E5DD]" />
      <p className="flex gap-2 text-[13px] leading-[1.4] text-[#53645B]">
        <img
          src="/workspace/icon-shield-check.svg"
          alt=""
          width={20}
          height={20}
          className="mt-0.5 shrink-0"
        />
        Subject to seller acceptance and issuer approval. Transfers are not
        guaranteed.
      </p>
    </Panel>
  );
}

function DatesPanel({ listing }: { listing: SecondaryListing }) {
  return (
    <Panel title="Listing status & key dates">
      <DetailRow label="Status" value={listing.status} accent />
      <DetailRow label="Listed on" value={listing.listedAtLabel} />
      <DetailRow
        label="Indicative settlement"
        value={listing.estimatedCompletionLabel}
      />
      <p className="text-xs leading-[1.4] text-[#718078]">
        After approvals and signed transfer documents. The listing may close
        early if sold or withdrawn.
      </p>
    </Panel>
  );
}

function RelatedOpportunity({ listing }: { listing: SecondaryListing }) {
  return (
    <Panel title="Related marketplace opportunity">
      <p className="text-[15px] font-semibold text-[#14271F]">
        {listing.opportunityTitle || listing.name}
      </p>
      <p className="text-sm leading-[1.4] text-[#53645B]">
        Review the business, original raise and issuer-provided investment
        documents.
      </p>
      <Link
        href={`/marketplace/${listing.opportunityId}`}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 py-2.5 text-[15px] font-semibold text-[#14271F]"
      >
        View marketplace opportunity
        <span aria-hidden>↗</span>
      </Link>
    </Panel>
  );
}

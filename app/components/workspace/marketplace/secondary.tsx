"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DialogButton, FeedbackDialog, Note } from "./feedback-dialog";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useSecondaryListings } from "@/hooks/use-secondary-market";
import {
  useCreateTransfer,
  useSubmitTransfer,
  useTransfers,
} from "@/hooks/use-transfers";
import type { SecondaryListing } from "@/lib/api/secondary-market";
import { LiveTransferWorkspace } from "./transfer-panels";
import { MarketplaceGridSkeleton } from "../skeletons";

type View = "transfers" | "listings" | "holdings" | "documents";
type Dialog =
  | { kind: "sale" }
  | { kind: "sale-sent"; name: string }
  | { kind: "support" }
  | { kind: "support-sent" };

const stages = [
  { title: "Matched", detail: "22 Oct", state: "done" },
  { title: "Buyer checks", detail: "22 Oct", state: "done" },
  { title: "Issuer approval", detail: "In progress", state: "current" },
  { title: "Settlement", detail: "Next", state: "upcoming" },
  { title: "Reassigned", detail: "Final", state: "upcoming" },
] as const;

const sellable = [
  {
    id: "northstar",
    name: "Northstar Logistics",
    detail: "Secondary · Equity",
    owned: "3,000",
    pending: "500",
    available: "2,500",
    value: "₦27,000",
  },
  {
    id: "cedar",
    name: "Cedar Agriculture",
    detail: "Secondary · Equity",
    owned: "2,000",
    pending: "0",
    available: "2,000",
    value: "₦24,730",
  },
] as const;

function fallbackListing(
  partial: Pick<
    SecondaryListing,
    | "id"
    | "name"
    | "code"
    | "sector"
    | "sectorCode"
    | "asking"
    | "askingValue"
    | "minimum"
    | "detail"
    | "transferType"
    | "termLabel"
  >,
): SecondaryListing {
  return {
    ...partial,
    quoted: true,
    seller: "Verified",
    sellerInitials: "VS",
    status: "Approved",
    statusCode: "APPROVED",
    transferTypeCode: "PARTIAL",
    isPartial: true,
    percentage: 40,
    transferLabel: `${partial.transferType} · 40%`,
    feeValue: null,
    feeLabel: "Not provided",
    netValue: null,
    netLabel: "Not provided",
    buyerPayableValue: partial.askingValue,
    buyerPayableLabel: partial.asking,
    reason: "",
    listedAt: "",
    listedAtLabel: "Not provided",
    estimatedCompletion: "",
    estimatedCompletionLabel: "Not provided",
    opportunityId: null,
    opportunityTitle: null,
    riskLevel: "Not provided",
    investmentTermYears: null,
    investmentTermLabel: partial.termLabel,
    targetIrr: "Not provided",
    payoutFrequency: "Not provided",
    structureLabel: "Equity",
  };
}

const fallbackListings: SecondaryListing[] = [
  fallbackListing({
    id: "gh-s01",
    name: "Greenhaven Health",
    code: "GH-S01",
    sector: "Healthcare",
    sectorCode: "HEALTHCARE",
    asking: "₦15,000",
    askingValue: 15000,
    minimum: "₦2,500",
    detail: "Equity · 5–7 yr horizon",
    transferType: "Partial",
    termLabel: "5–7 yr horizon",
  }),
  fallbackListing({
    id: "ca-s01",
    name: "Cedar Agriculture",
    code: "CA-S01",
    sector: "Food & agriculture",
    sectorCode: "AGRICULTURE",
    asking: "₦12,365",
    askingValue: 12365,
    minimum: "₦1,000",
    detail: "Equity · 4–6 yr horizon",
    transferType: "Partial",
    termLabel: "4–6 yr horizon",
  }),
];

const history = [
  {
    id: "TRF-2026-018",
    holding: "Northstar",
    submitted: "22 Oct 2026",
    gross: "₦5,400",
    direction: "Sell",
    status: "In review",
    documentsStatus: "Awaiting approval",
    tone: "review" as const,
  },
  {
    id: "TRF-2026-009",
    holding: "Cedar",
    submitted: "12 Sep 2026",
    gross: "₦20,000",
    direction: "Buy",
    status: "Completed",
    documentsStatus: "Completed",
    tone: "done" as const,
  },
] as const;

const ownershipRecords = [
  {
    title: "Northstar · Transfer agreement",
    detail: "Signed · Pending reassignment",
    body: "TRF-2026-018\n500 units of Northstar Logistics\nAgreed unit price ₦10.80\nGross sale value ₦5,400\nSigned · Pending reassignment\n\nIllustrative private document for this demo.",
  },
  {
    title: "Cedar · Ownership certificate",
    detail: "2,000 units · Reassigned 12 Sep 2026",
    body: "TRF-2026-009\nCedar Agriculture\n2,000 units reassigned 12 Sep 2026\n\nIllustrative private document for this demo.",
  },
] as const;

const transferDocuments = [
  {
    title: "Northstar · Signed transfer agreement",
    detail: "TRF-2026-018 · Signed · Pending reassignment",
    body: "Northstar · Signed transfer agreement\nTRF-2026-018 · Signed · Pending reassignment\n\nThis agreement is not a reassigned ownership certificate.\n\nIllustrative private document for this demo.",
  },
  {
    title: "Northstar · Ownership certificate",
    detail: "3,000 units · 500 in pending transfer · Issued 12 Feb 2026",
    body: "Northstar · Ownership certificate\n3,000 units · 500 in pending transfer · Issued 12 Feb 2026\n\nIllustrative private document for this demo.",
  },
  {
    title: "Cedar · Ownership certificate",
    detail: "TRF-2026-009 · 2,000 units · Reassigned 12 Sep 2026",
    body: "Cedar · Ownership certificate\nTRF-2026-009 · 2,000 units · Reassigned 12 Sep 2026\n\nIllustrative private document for this demo.",
  },
  {
    title: "Cedar · Completed purchase record",
    detail: "TRF-2026-009 · ₦20,000 · 12 Sep 2026",
    body: "Cedar · Completed purchase record\nTRF-2026-009 · ₦20,000 · 12 Sep 2026\n\nIllustrative private document for this demo.",
  },
] as const;

const settlement = [
  ["Gross sale value", "₦5,400"],
  ["Seller fee · 1.5%", "−₦81"],
  ["Transfer administration", "₦0"],
  ["Cost basis of 500 units", "₦5,000"],
  ["Est. realized gain, after fee", "+₦319"],
] as const;

const panel =
  "flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 lg:p-[22px]";

function downloadText(filename: string, contents: string, type = "text/plain") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.33 8h9.34M8 3.33v9.34"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FileIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.2 2.75h5.1L15.25 6.7v10.55H6.2A1.45 1.45 0 0 1 4.75 15.8V4.2A1.45 1.45 0 0 1 6.2 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M11.1 2.9V6.7h3.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.4 10.2h5.2M7.4 13h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.25v7.2M5.25 7.1 8 9.85l2.75-2.75M3.25 13.25h9.5"
        stroke="#53645B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6.2 8 10.2 12 6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MobileStageBar({ state }: { state: "done" | "current" | "upcoming" }) {
  const bar = state === "done" ? "bg-accent" : state === "current" ? "bg-[#E8F7EC]" : "bg-[#F4F9F6]";
  return (
    <div className={`relative h-3.5 rounded-full ${bar}`}>
      <span className="absolute left-0 top-0 grid size-3.5 place-items-center">
        {state === "done" ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 5.1 4.1 7.2 8 2.8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : state === "current" ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="5.2" stroke="#32A364" strokeWidth="1.3" />
            <path d="M7 4.1V7.1L8.8 8.2" stroke="#32A364" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="5.2" stroke="#32A364" strokeWidth="1.3" />
          </svg>
        )}
      </span>
    </div>
  );
}

function StageMark({ state }: { state: "done" | "current" | "upcoming" }) {
  const shell =
    state === "done" ? "bg-accent text-white" : state === "current" ? "bg-[#E8F7EC] text-accent" : "bg-[#F4F9F6] text-[#718078]";
  return (
    <span className={`grid size-7 shrink-0 place-items-center rounded-full ${shell}`}>
      {state === "done" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2.8 7.2 5.6 10 11.2 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : state === "current" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="5.1" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 4.2V7.2L9 8.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      )}
    </span>
  );
}

function OutlineButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-[18px] py-[11px] text-base font-semibold leading-[1.4] text-[#14271F] hover:bg-[#F4F9F6] ${className}`}
    >
      {children}
    </button>
  );
}

function TextAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 text-sm leading-[1.4] text-accent">
      {children}
    </button>
  );
}

function PanelTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
      <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
        {title}
      </h2>
      {action && onAction ? <TextAction onClick={onAction}>{action}</TextAction> : null}
    </div>
  );
}

function Stacked({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <p className="text-sm font-semibold leading-[1.35] text-[#14271F]">
      {primary}
      <span className="block font-semibold">{secondary}</span>
    </p>
  );
}

function Value({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "review" | "done" }) {
  const color = tone === "review" ? "text-[#956428]" : tone === "done" ? "text-accent" : "text-[#14271F]";
  return <p className={`text-sm leading-[1.35] ${color}`}>{children}</p>;
}

function DataTable({
  columns,
  rows,
  minWidth,
}: {
  columns: { label: string; width: string }[];
  rows: { key: string; cells: ReactNode[] }[];
  minWidth: string;
}) {
  const template = columns.map((column) => column.width).join(" ");
  return (
    <div className="min-w-0 overflow-x-auto">
      <div style={{ minWidth }}>
        <div
          className="grid items-center gap-4 rounded-md bg-[#F4F9F6] px-3 text-[13px] leading-[46px] text-[#718078]"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((column) => (
            <p key={column.label} className="whitespace-nowrap">
              {column.label}
            </p>
          ))}
        </div>
        {rows.map((row) => (
          <div
            key={row.key}
            className="grid items-center gap-4 border-b border-[#D9E5DD] px-3 py-3.5"
            style={{ gridTemplateColumns: template }}
          >
            {row.cells.map((cell, index) => (
              <div key={index} className="min-w-0">
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
      <p className="text-[15px] leading-[1.4] text-[#53645B]">{label}</p>
      <p className="text-[15px] font-semibold leading-[1.4] text-[#14271F] lg:shrink-0">{value}</p>
    </div>
  );
}

function MobileRecord({ label, children }: { label: string; children: ReactNode }) {
  return (
    <article className="flex flex-col rounded-lg bg-[#F4F9F6] px-3 py-4 text-sm leading-[1.8] text-[#14271F]">
      <p className="text-[#718078]">{label}</p>
      {children}
    </article>
  );
}

function toneClass(tone: "default" | "review" | "done") {
  return tone === "review" ? "text-[#956428]" : tone === "done" ? "text-accent" : "text-[#14271F]";
}

function Footnote({ children }: { children: string }) {
  return <p className="text-xs leading-[1.4] text-[#53645B]">{children}</p>;
}

function secondaryOrdering(sort: string) {
  if (sort === "asking") return "asking" as const;
  if (sort === "name") return "name" as const;
  return "featured" as const;
}

function sectorCodeFromDisplay(display: string) {
  return display
    .trim()
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function SecondaryMarket() {
  const router = useRouter();
  const [view, setView] = useState<View>("transfers");
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [sort, setSort] = useState("featured");
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [saleHolding, setSaleHolding] = useState("");
  const [saleError, setSaleError] = useState("");
  const [saleSubmitting, setSaleSubmitting] = useState(false);
  const [supportNote, setSupportNote] = useState("");
  const sectorCodeByLabel = useRef<Map<string, string>>(new Map());

  const resolvedSector =
    sector === "all"
      ? undefined
      : sectorCodeByLabel.current.get(sector) || sectorCodeFromDisplay(sector);

  const listingsQuery = useSecondaryListings({
    search: query.trim() || undefined,
    sector: resolvedSector,
    ordering: secondaryOrdering(sort),
  });
  const portfolio = usePortfolio();
  const transfersQuery = useTransfers();
  const createTransfer = useCreateTransfer();
  const submitTransfer = useSubmitTransfer();
  const sellableHoldings = portfolio.data?.holdings || [];

  const listings = useMemo(() => {
    const rows =
      listingsQuery.data?.listings && listingsQuery.data.listings.length > 0
        ? listingsQuery.data.listings
        : listingsQuery.isError
          ? fallbackListings
          : listingsQuery.data?.listings || [];

    for (const item of rows) {
      if (item.sector && item.sectorCode) {
        sectorCodeByLabel.current.set(item.sector, item.sectorCode);
      }
    }
    return rows;
  }, [listingsQuery.data, listingsQuery.isError]);

  const listingCount =
    listingsQuery.data?.count ??
    (listings.length > 0 ? listings.length : listingsQuery.isLoading ? 0 : fallbackListings.length);

  const transferCount = transfersQuery.data?.length ?? 0;
  const holdingCount = portfolio.data?.holdings.length ?? 0;
  const views: { id: View; label: string }[] = [
    { id: "transfers", label: `My transfers · ${transfersQuery.isLoading ? "…" : transferCount}` },
    {
      id: "listings",
      label: listingsQuery.isLoading
        ? "Verified listings · …"
        : `Verified listings · ${listingCount}`,
    },
    { id: "holdings", label: `Sellable holdings · ${portfolio.isLoading ? "…" : holdingCount}` },
    { id: "documents", label: "Transfer documents" },
  ];

  const sectorOptions = useMemo(() => {
    const fromData = Array.from(
      new Set(listings.map((item) => item.sector).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
    return fromData.length > 0
      ? fromData
      : ["Healthcare", "Food & agriculture"];
  }, [listings]);

  const previewListings = listings.slice(0, 2);

  // Live API already filters/sorts; client pass only for error fallback.
  const visibleListings = useMemo(() => {
    if (!listingsQuery.isError) return listings;
    const needle = query.trim().toLowerCase();
    const filtered = listings.filter((listing) => {
      const matchesSector = sector === "all" || listing.sector === sector;
      const matchesQuery =
        needle.length === 0 ||
        listing.name.toLowerCase().includes(needle) ||
        listing.code.toLowerCase().includes(needle) ||
        listing.sector.toLowerCase().includes(needle);
      return matchesSector && matchesQuery;
    });
    const ranked = [...filtered];
    if (sort === "asking") {
      ranked.sort((a, b) => (b.askingValue ?? -1) - (a.askingValue ?? -1));
    } else if (sort === "name") {
      ranked.sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
    }
    return ranked;
  }, [listings, listingsQuery.isError, query, sector, sort]);

  function openSale(id?: string) {
    const holdings = portfolio.data?.holdings || [];
    const preferred =
      (id && holdings.some((holding) => holding.id === id) ? id : "") ||
      holdings[0]?.id ||
      "";
    setSaleHolding(preferred);
    setSaleError("");
    setDialog({ kind: "sale" });
  }

  async function submitSaleListing() {
    setSaleError("");
    const holding = sellableHoldings.find((item) => item.id === saleHolding);
    if (!holding) {
      setSaleError(
        sellableHoldings.length === 0
          ? "No holdings are available to list yet."
          : "Choose a holding to list.",
      );
      return;
    }

    setSaleSubmitting(true);
    try {
      const created = await createTransfer.mutateAsync({
        investment: Number(holding.id),
        transfer_type: "FULL",
        transfer_amount: String(holding.valuation),
        reason: "Secondary market listing",
        status: "DRAFT",
      });
      await submitTransfer.mutateAsync(String(created.id));
      setDialog({ kind: "sale-sent", name: holding.name });
    } catch (error) {
      setSaleError(
        error instanceof Error ? error.message : "Could not create the sell listing.",
      );
    } finally {
      setSaleSubmitting(false);
    }
  }

  function showPendingTransfer() {
    setView("transfers");
    window.setTimeout(() => {
      document.getElementById("pending-transfer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function exportHistory() {
    const header = ["Transfer", "Holding", "Submitted", "Gross value", "Direction", "Status"];
    const body = history.map((row) => [row.id, row.holding, row.submitted, row.gross, row.direction, row.status]);
    const csv = [header, ...body].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    downloadText("fmi-transfer-history.csv", csv, "text/csv");
  }

  function downloadRecord(title: string, body: string) {
    downloadText(`${slug(title)}.txt`, `${title}\n${body}\n`);
  }

  const disclaimer =
    view === "transfers"
      ? "Liquidity is not guaranteed. Private securities may be subject to lockups, rights of first refusal and jurisdiction restrictions. Listings do not guarantee a buyer, approval, sale price or completion date. Ownership records are automatically reassigned only after successful settlement."
      : "Liquidity is not guaranteed. Private securities may be subject to lockups, rights of first refusal and jurisdiction restrictions. Listings do not guarantee a buyer, approval, sale price or completion date. Ownership is reassigned only after successful settlement.";

  return (
    <div className="flex w-full min-w-0 flex-col gap-[22px] px-4 py-6 sm:px-8 sm:py-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-col gap-[5px]">
          <p className="text-xs font-semibold text-accent">LIQUIDITY / OWNERSHIP TRANSFERS</p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.2] text-[#14271F] lg:text-[32px]">
            A considered path to your next move.
          </h1>
          <p className="text-base leading-[1.4] text-[#53645B]">
            Discover verified sellers, request a sale and follow ownership through settlement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openSale()}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-[18px] py-[11px] text-base font-semibold leading-[1.4] text-white lg:w-fit"
        >
          Create sell listing
          <PlusIcon />
        </button>
      </header>

      <div
        className="grid grid-cols-2 gap-x-6 border-b border-[#D9E5DD] lg:flex lg:gap-x-[26px]"
        role="tablist"
        aria-label="Secondary market"
      >
        {views.map((item) => {
          const active = item.id === view;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`secondary-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`secondary-panel-${item.id}`}
              onClick={() => setView(item.id)}
              className={`-mb-px w-fit border-b-2 py-[11px] text-left text-base leading-6 lg:shrink-0 lg:whitespace-nowrap ${
                active ? "border-accent font-semibold text-accent" : "border-transparent font-normal text-[#53645B]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`secondary-panel-${view}`}
        aria-labelledby={`secondary-tab-${view}`}
        className="flex flex-col gap-[22px]"
      >
        {view === "transfers" ? <LiveTransferWorkspace mode="transfers" /> : null}

        {view === "listings" ? (
          listingsQuery.isLoading && listings.length === 0 ? (
            <MarketplaceGridSkeleton count={4} />
          ) : (
            <Listings
              query={query}
              sector={sector}
              sort={sort}
              rows={visibleListings}
              sectorOptions={sectorOptions}
              isError={listingsQuery.isError}
              errorMessage={
                listingsQuery.error instanceof Error
                  ? listingsQuery.error.message
                  : null
              }
              onQuery={setQuery}
              onSector={setSector}
              onSort={setSort}
              onReset={() => {
                setQuery("");
                setSector("all");
                setSort("featured");
              }}
              onReview={(id) => router.push(`/marketplace/secondary/${id}`)}
            />
          )
        ) : null}

        {view === "holdings" ? <LiveTransferWorkspace mode="holdings" /> : null}

        {view === "documents" ? <LiveTransferWorkspace mode="documents" /> : null}
      </div>

      <p className="text-[13px] leading-[1.4] text-[#53645B]">{disclaimer}</p>

      {dialog?.kind === "sale" ? (
        <FeedbackDialog
          eyebrow="SELL LISTING"
          title="Create a sell listing"
          onClose={() => setDialog(null)}
          actions={
            <>
              <DialogButton onClick={() => setDialog(null)}>Cancel</DialogButton>
              <DialogButton
                tone="primary"
                disabled={saleSubmitting || sellableHoldings.length === 0}
                onClick={submitSaleListing}
              >
                {saleSubmitting ? "Submitting…" : "Submit request"}
              </DialogButton>
            </>
          }
        >
          <p className="text-sm leading-[1.45] text-[#53645B]">
            A listing is a request to find a buyer, not a promise of liquidity. Units stay in your
            ownership until settlement and reassignment. The issuer may reject a transfer.
          </p>
          {sellableHoldings.length === 0 ? (
            <p className="rounded-[10px] bg-[#FBF3E5] px-4 py-3 text-sm text-[#53645B]">
              {portfolio.isLoading
                ? "Loading your holdings…"
                : "No holdings are available to list yet."}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {sellableHoldings.map((holding) => {
                const selected = holding.id === saleHolding;
                return (
                  <button
                    key={holding.id}
                    type="button"
                    onClick={() => {
                      setSaleHolding(holding.id);
                      setSaleError("");
                    }}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left ${
                      selected ? "border-accent bg-[#E8F7EC]" : "border-[#D9E5DD] bg-white"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-[#14271F]">
                        {holding.name}
                      </span>
                      <span className="block text-[13px] leading-[1.4] text-[#53645B]">
                        {holding.sector}
                      </span>
                    </span>
                    <span className="text-sm text-[#14271F]">
                      {holding.valuation.toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {saleError ? (
            <p className="rounded-[10px] bg-[#FCF0EE] px-4 py-3 text-sm text-[#53645B]">
              {saleError}
            </p>
          ) : null}
          <p className="text-sm leading-[1.45] text-[#53645B]">
            Seller fee at settlement is 1.5% of the gross sale. Administration is ₦0 in this example.
            Reported value is not a guaranteed sale price.
          </p>
        </FeedbackDialog>
      ) : null}

      {dialog?.kind === "sale-sent" ? (
        <FeedbackDialog
          eyebrow="SELL LISTING"
          title="Listing request received"
          onClose={() => setDialog(null)}
          actions={<DialogButton onClick={() => setDialog(null)}>Close</DialogButton>}
        >
          <Note>
            {dialog.name} stays in your ownership until a buyer is verified and the issuer approves.
            The transfer is submitted as pending. Staff approve and complete it.
          </Note>
        </FeedbackDialog>
      ) : null}

      {dialog?.kind === "support" ? (
        <FeedbackDialog
          eyebrow="TRANSFER SUPPORT"
          title="Contact support"
          onClose={() => setDialog(null)}
          actions={
            <>
              <DialogButton onClick={() => setDialog(null)}>Cancel</DialogButton>
              <DialogButton tone="primary" onClick={() => setDialog({ kind: "support-sent" })}>
                Send message
              </DialogButton>
            </>
          }
        >
          <p className="text-sm leading-[1.45] text-[#53645B]">
            TRF-2026-018 is with the issuer for approval. Buyer checks are complete and the purchase
            funds are reserved.
          </p>
          <label className="flex flex-col gap-2 text-sm text-[#53645B]">
            Message
            <textarea
              value={supportNote}
              onChange={(event) => setSupportNote(event.target.value)}
              rows={4}
              placeholder="How can we help with this transfer?"
              className="resize-none rounded-lg border border-[#D9E5DD] px-3 py-2.5 text-sm text-[#14271F] outline-none placeholder:text-[#718078] focus:border-accent"
            />
          </label>
        </FeedbackDialog>
      ) : null}

      {dialog?.kind === "support-sent" ? (
        <FeedbackDialog
          eyebrow="TRANSFER SUPPORT"
          title="Message received"
          onClose={() => setDialog(null)}
          actions={<DialogButton onClick={() => setDialog(null)}>Close</DialogButton>}
        >
          <Note>
            A specialist will follow up about TRF-2026-018. This demo does not send email.
          </Note>
        </FeedbackDialog>
      ) : null}
    </div>
  );
}

function Transfers({
  previewListings,
  listingCount,
  onHoldings,
  onListings,
  onSale,
  onListing,
  onExport,
  onAgreement,
  onSupport,
  onDownload,
}: {
  previewListings: SecondaryListing[];
  listingCount: number;
  onHoldings: () => void;
  onListings: () => void;
  onSale: (id: (typeof sellable)[number]["id"]) => void;
  onListing: (id: string) => void;
  onExport: () => void;
  onAgreement: () => void;
  onSupport: () => void;
  onDownload: (title: string, body: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <section id="pending-transfer" className={`${panel} scroll-mt-28`}>
          <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
            <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
              Northstar Logistics · Partial sale
            </h2>
            <p className="text-sm text-accent">TRF-2026-018</p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-[5px] bg-[#FBF3E5] px-2 py-[3px] text-[13px] font-medium text-[#956428]">
                Awaiting issuer approval
              </span>
              <span className="rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] text-[13px] font-medium text-accent">
                Buyer verified
              </span>
            </div>
            <p className="text-[13px] leading-[1.35] text-[#718078]">Submitted 22 Oct 2026</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-3 lg:gap-5">
            {[
              ["500 units", "Of 3,000 owned"],
              ["₦5,400", "Gross sale value"],
              ["₦10.80", "Agreed unit price"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col gap-1.5 rounded-lg bg-[#F4F9F6] p-4">
                <p className="font-[family-name:var(--font-stack-sans)] text-[26px] font-normal leading-none text-[#14271F]">
                  {value}
                </p>
                <p className="text-[13px] leading-[1.4] text-[#53645B]">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3.5 lg:hidden">
            {stages.map((stage) => (
              <div key={stage.title} className="flex flex-col gap-1.5">
                <MobileStageBar state={stage.state} />
                <div>
                  <p className="text-[13px] font-semibold leading-[1.35] text-[#14271F]">{stage.title}</p>
                  <p className="text-xs leading-[1.35] text-[#718078]">{stage.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto py-2 lg:block">
            <div className="flex min-w-[640px] gap-1.5">
              {stages.map((stage) => (
                <div key={stage.title} className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <StageMark state={stage.state} />
                    <span className="h-px min-w-2 flex-1 bg-[#D9E5DD]" />
                  </div>
                  <p className="text-[13px] font-semibold leading-[1.35] text-[#14271F]">{stage.title}</p>
                  <p className="text-xs leading-[1.35] text-[#718078]">{stage.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-[#D9E5DD]" />
          <p className="text-sm leading-[1.4] text-[#53645B]">
            FMI has verified the buyer and reserved the purchase funds. The issuer is reviewing
            transfer restrictions. Your 500 units remain in your ownership until settlement and
            reassignment are complete.
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            <OutlineButton onClick={onAgreement} className="w-full lg:w-auto">
              View signed agreement
              <FileIcon />
            </OutlineButton>
            <OutlineButton onClick={onSupport} className="w-full lg:w-auto">
              Contact support
            </OutlineButton>
          </div>
        </section>

        <section className="flex w-full shrink-0 flex-col gap-4 rounded-[14px] bg-[#0B2118] p-4 lg:p-[22px] xl:w-[430px]">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-white">
            Settlement breakdown
          </h2>
          <p className="font-[family-name:var(--font-stack-sans)] text-[36px] font-normal leading-none text-white">
            ₦5,319
          </p>
          <p className="text-sm text-[#A8C5B2]">Estimated amount credited to your wallet</p>
          {settlement.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <p className="text-sm text-[#A8C5B2]">{label}</p>
              <p className="text-[15px] text-white">{value}</p>
            </div>
          ))}
          <div className="h-px bg-[#365342]" />
          <p className="text-sm leading-[1.4] text-[#A8C5B2]">
            Expected 3–5 business days after approval. Taxes excluded. Future distributions follow
            the ownership record date; no return is counted before reassignment.
          </p>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className={panel}>
          <PanelTitle title="Available to list" action="View sellable holdings →" onAction={onHoldings} />
          <div className="flex flex-col gap-3 lg:hidden">
            {sellable.map((holding) => (
              <MobileRecord key={holding.id} label="Holding">
                <p className="text-base font-semibold leading-[1.8]">{holding.name}</p>
                <p className="text-base font-semibold leading-[1.8]">{holding.detail}</p>
                <p>Available units: {holding.available}</p>
                <p>Est. value: {holding.value}</p>
                <p>
                  Action:{" "}
                  <button type="button" onClick={() => onSale(holding.id)} className="text-[#14271F]">
                    Request sale ↗
                  </button>
                </p>
              </MobileRecord>
            ))}
          </div>
          <div className="hidden lg:block">
          <DataTable
            minWidth="520px"
            columns={[
              { label: "Holding", width: "minmax(160px,190px)" },
              { label: "Available units", width: "minmax(0,1fr)" },
              { label: "Est. value", width: "minmax(0,1fr)" },
              { label: "Action", width: "minmax(120px,1fr)" },
            ]}
            rows={sellable.map((holding) => ({
              key: holding.id,
              cells: [
                <Stacked key="name" primary={holding.name} secondary={holding.detail} />,
                <Value key="units">{holding.available}</Value>,
                <Value key="value">{holding.value}</Value>,
                <button
                  key="action"
                  type="button"
                  onClick={() => onSale(holding.id)}
                  className="text-left text-sm leading-[1.35] text-[#14271F] hover:text-accent"
                >
                  Request sale ↗
                </button>,
              ],
            }))}
          />
          </div>
          <Footnote>
            Availability excludes units in pending transfers. Valuation is not an executable sale price.
          </Footnote>
        </section>

        <section className={panel}>
          <PanelTitle
            title="From verified sellers"
            action={`Browse all ${listingCount} listings →`}
            onAction={onListings}
          />
          {previewListings.length === 0 ? (
            <p className="text-sm text-[#53645B]">No verified listings available yet.</p>
          ) : (
            <>
              <div className="flex flex-col gap-3 lg:hidden">
                {previewListings.map((listing) => (
                  <MobileRecord key={listing.id} label="Listing">
                    <p className="text-base font-semibold leading-[1.8]">{listing.name}</p>
                    <p className="text-base font-semibold leading-[1.8]">{listing.detail}</p>
                    <p>Asking value: {listing.asking}</p>
                    <p>Minimum: {listing.minimum}</p>
                    <p>
                      Seller:{" "}
                      <button
                        type="button"
                        onClick={() => onListing(listing.id)}
                        className="text-[#14271F]"
                      >
                        {listing.seller || "Verified"} ✓
                      </button>
                    </p>
                  </MobileRecord>
                ))}
              </div>
              <div className="hidden lg:block">
                <DataTable
                  minWidth="520px"
                  columns={[
                    { label: "Listing", width: "minmax(170px,205px)" },
                    { label: "Asking value", width: "minmax(0,1fr)" },
                    { label: "Minimum", width: "minmax(0,1fr)" },
                    { label: "Seller", width: "minmax(0,1fr)" },
                  ]}
                  rows={previewListings.map((listing) => ({
                    key: listing.id,
                    cells: [
                      <Stacked
                        key="name"
                        primary={listing.name}
                        secondary={listing.detail}
                      />,
                      <Value key="asking">{listing.asking}</Value>,
                      <Value key="minimum">{listing.minimum}</Value>,
                      <button
                        key="seller"
                        type="button"
                        onClick={() => onListing(listing.id)}
                        className="text-left text-sm leading-[1.35] text-[#14271F] hover:text-accent"
                      >
                        {listing.seller || "Verified"} ✓
                      </button>,
                    ],
                  }))}
                />
              </div>
            </>
          )}
          <Footnote>
            Asking values are set by sellers. Negotiation, investor eligibility and issuer approval apply.
          </Footnote>
        </section>
      </div>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <section className={panel}>
          <PanelTitle title="Transfer history" action="Export history ↓" onAction={onExport} />
          <div className="flex flex-col gap-3 lg:hidden">
            {history.map((row) => (
              <MobileRecord key={row.id} label="Transfer / holding">
                <p className="text-base font-semibold leading-[1.8]">
                  {row.id} · {row.holding}
                </p>
                <p>Submitted: {row.submitted}</p>
                <p>Gross value: {row.gross}</p>
                <p>Direction: {row.direction}</p>
                <p className={toneClass(row.tone)}>Status: {row.status}</p>
              </MobileRecord>
            ))}
          </div>
          <div className="hidden lg:block">
          <DataTable
            minWidth="680px"
            columns={[
              { label: "Transfer / holding", width: "minmax(180px,220px)" },
              { label: "Submitted", width: "minmax(0,1fr)" },
              { label: "Gross value", width: "minmax(0,1fr)" },
              { label: "Direction", width: "minmax(0,0.7fr)" },
              { label: "Status", width: "minmax(0,0.9fr)" },
            ]}
            rows={history.map((row) => ({
              key: row.id,
              cells: [
                <p key="id" className="text-sm font-semibold leading-[1.35] text-[#14271F]">
                  {row.id} · {row.holding}
                </p>,
                <Value key="date">{row.submitted}</Value>,
                <Value key="gross">{row.gross}</Value>,
                <Value key="direction">{row.direction}</Value>,
                <Value key="status" tone={row.tone}>
                  {row.status}
                </Value>,
              ],
            }))}
          />
          </div>
        </section>

        <section className={`${panel} xl:w-[430px] xl:shrink-0`}>
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
            Ownership records
          </h2>
          <div>
            {ownershipRecords.map((record) => (
              <div key={record.title} className="flex items-center gap-3 border-b border-[#D9E5DD] py-[11px]">
                <span className="text-accent lg:text-[#53645B]">
                  <FileIcon size={20} />
                </span>
                <button
                  type="button"
                  onClick={() => onDownload(record.title, record.body)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block text-[15px] font-semibold leading-[1.35] text-[#14271F]">
                    {record.title}
                  </span>
                  <span className="block text-xs leading-[1.35] text-[#718078]">{record.detail}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Download ${record.title}`}
                  onClick={() => onDownload(record.title, record.body)}
                  className="shrink-0"
                >
                  <DownloadIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Listings({
  query,
  sector,
  sort,
  rows,
  sectorOptions,
  isError,
  errorMessage,
  onQuery,
  onSector,
  onSort,
  onReset,
  onReview,
}: {
  query: string;
  sector: string;
  sort: string;
  rows: SecondaryListing[];
  sectorOptions: string[];
  isError: boolean;
  errorMessage: string | null;
  onQuery: (value: string) => void;
  onSector: (value: string) => void;
  onSort: (value: string) => void;
  onReset: () => void;
  onReview: (id: string) => void;
}) {
  return (
    <>
      {isError ? (
        <p className="rounded-[10px] bg-[#FCF0EE] px-4 py-4 text-sm leading-[1.45] text-[#53645B]">
          {errorMessage || "Could not refresh secondary listings."} Showing
          available records where possible.
        </p>
      ) : null}
      <section className={panel}>
        <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.25] text-[#14271F]">
            From verified sellers
          </h2>
          <p className="text-sm leading-[1.4] text-accent">
            {rows.length} {rows.length === 1 ? "listing" : "listings"}
          </p>
        </div>
        <form className="flex flex-col gap-2.5 lg:flex-row lg:flex-wrap" onSubmit={(event) => event.preventDefault()}>
          <label className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 lg:h-auto lg:w-auto lg:justify-start lg:px-[18px] lg:py-[11px]">
            <span className="sr-only">Search listing or business</span>
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Search listing or business"
              className="w-[210px] max-w-[calc(100%-24px)] bg-transparent text-center text-base font-semibold text-[#14271F] outline-none placeholder:font-semibold placeholder:text-[#14271F] lg:w-[230px] lg:max-w-none lg:text-left"
            />
            <img src="/workspace/icon-search.svg" alt="" width={16} height={16} />
          </label>
          <label className="relative flex h-12 w-full items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-4 lg:inline-flex lg:h-auto lg:w-auto lg:justify-start lg:px-0">
            <span className="sr-only">Sector</span>
            <select
              value={sector}
              onChange={(event) => onSector(event.target.value)}
              className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-base font-semibold text-[#14271F] opacity-0 outline-none focus:border-accent lg:static lg:rounded-lg lg:py-[11px] lg:pl-[18px] lg:pr-10 lg:opacity-100"
            >
              <option value="all">All sectors</option>
              {sectorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="pointer-events-none inline-flex items-center gap-2 text-base font-semibold text-[#14271F] lg:hidden">
              {sector === "all" ? "All sectors" : sector}
              <ChevronIcon />
            </span>
            <span className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 text-[#14271F] lg:block">
              <ChevronIcon />
            </span>
          </label>
          <label className="relative flex h-12 w-full items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-4 lg:inline-flex lg:h-auto lg:w-auto lg:justify-start lg:px-0">
            <span className="sr-only">Sort listings</span>
            <select
              value={sort}
              onChange={(event) => onSort(event.target.value)}
              className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-base font-semibold text-[#14271F] opacity-0 outline-none focus:border-accent lg:static lg:rounded-lg lg:py-[11px] lg:pl-[18px] lg:pr-10 lg:opacity-100"
            >
              <option value="featured">Sort: Featured</option>
              <option value="asking">Sort: Asking value</option>
              <option value="name">Sort: Business</option>
            </select>
            <span className="pointer-events-none inline-flex items-center gap-2 text-base font-semibold text-[#14271F] lg:hidden">
              {sort === "asking" ? "Sort: Asking value" : sort === "name" ? "Sort: Business" : "Sort: Featured"}
              <ChevronIcon />
            </span>
            <span className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 text-[#14271F] lg:block">
              <ChevronIcon />
            </span>
          </label>
        </form>
        {rows.length === 0 ? (
          <p className="px-1 py-6 text-sm leading-[1.4] text-[#53645B]">
            No listings match this search.
            <button type="button" onClick={onReset} className="ml-2 text-accent">
              Clear filters
            </button>
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-3 lg:hidden">
              {rows.map((listing) => (
                <MobileRecord key={listing.id} label="Business / listing">
                  <p className="text-base font-semibold leading-[1.8]">{listing.name}</p>
                  <p className="text-base font-semibold leading-[1.8]">
                    {listing.transferType || "Equity"} · {listing.code}
                  </p>
                  <p>Asking value: {listing.asking}</p>
                  <p>Minimum: {listing.minimum}</p>
                  <p>
                    Action:{" "}
                    <button type="button" onClick={() => onReview(listing.id)} className="text-[#14271F]">
                      Review listing ↗
                    </button>
                  </p>
                  <p className="font-medium text-accent">
                    Seller: {listing.seller || "Verified"}
                  </p>
                </MobileRecord>
              ))}
            </div>
            <div className="hidden lg:block">
              <DataTable
                minWidth="860px"
                columns={[
                  { label: "Business / listing", width: "minmax(200px,250px)" },
                  { label: "Asking value", width: "minmax(0,1fr)" },
                  { label: "Minimum", width: "minmax(0,1fr)" },
                  { label: "Seller", width: "minmax(0,0.8fr)" },
                  { label: "Action", width: "minmax(130px,1fr)" },
                ]}
                rows={rows.map((listing) => ({
                  key: listing.id,
                  cells: [
                    <Stacked
                      key="name"
                      primary={listing.name}
                      secondary={`${listing.transferType || "Equity"} · ${listing.code}`}
                    />,
                    <Value key="asking">{listing.asking}</Value>,
                    <Value key="minimum">{listing.minimum}</Value>,
                    <Value key="seller">{listing.seller || "Verified"}</Value>,
                    <button
                      key="action"
                      type="button"
                      onClick={() => onReview(listing.id)}
                      className="text-left text-sm leading-[1.35] text-[#14271F] hover:text-accent"
                    >
                      Review listing ↗
                    </button>,
                  ],
                }))}
              />
            </div>
          </>
        )}
        <p className="text-[13px] leading-[1.4] text-[#53645B]">
          Asking values are set by sellers. Lots without a quoted amount may
          require a quote. Seller verification is not a recommendation.
        </p>
      </section>
      <div className="rounded-[10px] bg-[#E8F7EC] px-4 py-4 text-sm leading-[1.5] text-[#53645B]">
        Asking values are set by sellers and are not executable issuer valuations. Review
        restrictions, documents and total costs before requesting a purchase.
      </div>
    </>
  );
}

function Holdings({
  onSale,
  onPending,
}: {
  onSale: (id: (typeof sellable)[number]["id"]) => void;
  onPending: () => void;
}) {
  return (
    <>
      <section className={panel}>
        <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.25] text-[#14271F]">
            Available to list
          </h2>
          <p className="text-sm leading-[1.4] text-accent">2 eligible holdings</p>
        </div>
        <div className="flex flex-col gap-3 lg:hidden">
          {sellable.map((holding) => (
            <MobileRecord key={holding.id} label="Holding">
              <p className="text-base font-semibold leading-[1.8]">{holding.name}</p>
              <p className="text-base font-semibold leading-[1.8]">{holding.detail}</p>
              <p>Units owned: {holding.owned}</p>
              <p>In pending transfer: {holding.pending}</p>
              <p>Available units: {holding.available}</p>
              <p>Reported value: {holding.value}</p>
              <p>
                Action:{" "}
                <button type="button" onClick={() => onSale(holding.id)} className="text-[#14271F]">
                  Request sale ↗
                </button>
              </p>
            </MobileRecord>
          ))}
        </div>
        <div className="hidden lg:block">
        <DataTable
          minWidth="920px"
          columns={[
            { label: "Holding", width: "minmax(200px,250px)" },
            { label: "Units owned", width: "minmax(0,1fr)" },
            { label: "In pending transfer", width: "minmax(0,1.1fr)" },
            { label: "Available units", width: "minmax(0,1fr)" },
            { label: "Reported value¹", width: "minmax(0,1fr)" },
            { label: "Action", width: "minmax(130px,1fr)" },
          ]}
          rows={sellable.map((holding) => ({
            key: holding.id,
            cells: [
              <Stacked key="name" primary={holding.name} secondary={holding.detail} />,
              <Value key="owned">{holding.owned}</Value>,
              <Value key="pending">{holding.pending}</Value>,
              <Value key="available">{holding.available}</Value>,
              <Value key="value">{holding.value}</Value>,
              <button
                key="action"
                type="button"
                onClick={() => onSale(holding.id)}
                className="text-left text-sm leading-[1.35] text-[#14271F] hover:text-accent"
              >
                Request sale ↗
              </button>,
            ],
          }))}
        />
        </div>
        <p className="text-[13px] leading-[1.4] text-[#53645B]">
          ¹ Northstar available value = 2,500 × ₦10.80. Cedar value reflects all 2,000 units.
          Reported 30 Sep 2026; these are not guaranteed sale prices.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className={panel}>
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.25] text-[#14271F]">
            Northstar Logistics
          </h2>
          <span className="w-full rounded-[5px] bg-[#FBF3E5] px-[9px] py-[5px] text-center text-[13px] leading-[1.4] text-[#995B13] lg:w-fit lg:text-left">
            500 units unavailable to list
          </span>
          <Fact label="Pending transfer" value="TRF-2026-018" />
          <Fact label="Stage" value="Awaiting issuer approval" />
          <p className="text-[15px] leading-[1.4] text-[#53645B]">
            Units remain owned until settlement and reassignment. Only the 2,500 uncommitted units
            can be included in another listing.
          </p>
          <OutlineButton onClick={onPending} className="w-full lg:w-auto">
            View pending transfer
          </OutlineButton>
        </section>

        <section className={panel}>
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.25] text-[#14271F]">
            Before you list
          </h2>
          <p className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.25] text-[#14271F]">
            Review issuer restrictions
          </p>
          <p className="text-[15px] leading-[1.4] text-[#53645B]">
            Your listing is a request to find a buyer, not a promise of liquidity. The issuer may
            reject a transfer or exercise rights of first refusal.
          </p>
          <Fact label="Seller fee at settlement" value="1.5% of gross sale" />
          <Fact label="Administration" value="₦0 in supplied example" />
        </section>
      </div>
    </>
  );
}

function Documents({ onDownload }: { onDownload: (title: string, body: string) => void }) {
  return (
    <>
      <section className={panel}>
        <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.25] text-[#14271F]">
            Transfer documents
          </h2>
          <p className="text-sm leading-[1.4] text-accent">Private ownership records</p>
        </div>
        <div>
          {transferDocuments.map((document) => (
            <div key={document.title} className="flex items-center gap-3.5 border-b border-[#D9E5DD] py-[17px]">
              <button
                type="button"
                onClick={() => onDownload(document.title, document.body)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block text-[15px] font-semibold leading-[1.6] text-[#14271F]">
                  {document.title}
                </span>
                <span className="block text-[13px] leading-[1.4] text-[#718078]">{document.detail}</span>
                <span className="block text-sm text-accent">View / download</span>
              </button>
              <button
                type="button"
                aria-label={`Download ${document.title}`}
                onClick={() => onDownload(document.title, document.body)}
                className="shrink-0"
              >
                <DownloadIcon />
              </button>
            </div>
          ))}
        </div>
        <div className="rounded-[10px] bg-[#E8F7EC] px-4 py-4 text-sm leading-[1.5] text-[#53645B]">
          Northstar’s signed agreement is not a reassigned ownership certificate. A replacement
          record is only available after settlement and registry reassignment.
        </div>
      </section>

      <section className={panel}>
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.25] text-[#14271F]">
          Transfer record summary
        </h2>
        <div className="flex flex-col gap-3 lg:hidden">
          {history.map((row) => (
            <MobileRecord key={row.id} label="Transfer / holding">
              <p className="text-base font-semibold leading-[1.8]">
                {row.id} · {row.holding}
              </p>
              <p>Submitted: {row.submitted}</p>
              <p>Gross value: {row.gross}</p>
              <p>Direction: {row.direction}</p>
              <p className={toneClass(row.tone)}>Status: {row.documentsStatus}</p>
            </MobileRecord>
          ))}
        </div>
        <div className="hidden lg:block">
        <DataTable
          minWidth="760px"
          columns={[
            { label: "Transfer / holding", width: "minmax(200px,250px)" },
            { label: "Submitted", width: "minmax(0,1fr)" },
            { label: "Gross value", width: "minmax(0,1fr)" },
            { label: "Direction", width: "minmax(0,0.7fr)" },
            { label: "Status", width: "minmax(0,1fr)" },
          ]}
          rows={history.map((row) => ({
            key: row.id,
            cells: [
              <p key="id" className="text-sm font-semibold leading-[1.35] text-[#14271F]">
                {row.id} · {row.holding}
              </p>,
              <Value key="date">{row.submitted}</Value>,
              <Value key="gross">{row.gross}</Value>,
              <Value key="direction">{row.direction}</Value>,
              <Value key="status">{row.documentsStatus}</Value>,
            ],
          }))}
        />
        </div>
      </section>
    </>
  );
}

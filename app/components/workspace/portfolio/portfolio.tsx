"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useHoldingDocuments, usePortfolio } from "@/hooks/use-portfolio";
import { useTransfers } from "@/hooks/use-transfers";
import { isExited } from "@/lib/api/portfolio";
import { downloadTransferDocument } from "@/lib/api/transfers";
import {
  downloadText,
  gainOf,
  gainPercent,
  money,
  policy,
  signedMoney,
  type Holding,
  type PortfolioDocument,
} from "./data";

type View = "all" | "active" | "exited" | "documents";
type DocType = "all" | "ownership" | "issuer";

function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.25v7.2M5.25 7.1 8 9.85l2.75-2.75M3.25 13.25h9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6.2 2.75h5.1L15.25 6.7v10.55H6.2A1.45 1.45 0 0 1 4.75 15.8V4.2A1.45 1.45 0 0 1 6.2 2.75Z"
        stroke="#32A364"
        strokeWidth="1.4"
      />
      <path d="M11.1 2.9V6.7h3.8" stroke="#32A364" strokeWidth="1.4" />
      <path d="M7.4 10.2h5.2M7.4 13h5.2" stroke="#32A364" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className={`mt-0.5 shrink-0 ${className}`}
    >
      <circle cx="9" cy="9" r="7.25" stroke="#32A364" strokeWidth="1.5" />
      <path d="M9 8.15V12.6" stroke="#32A364" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="5.85" r="0.8" fill="#32A364" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.33 11.33V4.67H4.67M11.33 4.67 4.67 11.33"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function downloadDocument(document: PortfolioDocument) {
  const transferDocument = document.id.match(/^transfer-(\d+)-(\d+)$/);
  if (transferDocument) {
    downloadTransferDocument(transferDocument[1], transferDocument[2], document.title).catch(
      () => undefined,
    );
    return;
  }
  if (document.href) {
    window.open(document.href, "_blank", "noopener,noreferrer");
    return;
  }
  downloadText(
    `${slug(document.title)}.txt`,
    `${document.title}\n${document.detail}\n`,
  );
}

function exportHoldings(rows: Holding[]) {
  const header = [
    "Business",
    "Channel",
    "Structure",
    "Sector",
    "Invested",
    "Valuation",
    "Unrealized gain",
    "Distributions",
    "Status",
  ];
  const body = rows.map((holding) => [
    holding.name,
    holding.channel,
    holding.structure,
    holding.sector,
    holding.invested.toFixed(2),
    holding.valuation.toFixed(2),
    gainOf(holding).toFixed(2),
    holding.distributions.toFixed(2),
    holding.channel,
  ]);
  const csv = [header, ...body]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  downloadText("fmi-holdings.csv", csv, "text/csv");
}

function PolicyNote({ icon = true }: { icon?: boolean }) {
  return (
    <div className="flex gap-3 rounded-[10px] bg-[#E8F7EC] p-4">
      <InfoIcon className={icon ? "" : "max-md:hidden"} />
      <p className="text-sm leading-[1.4] text-[#53645B]">{policy}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  dark = false,
  accentDetail = false,
}: {
  label: string;
  value: string;
  detail: string;
  dark?: boolean;
  accentDetail?: boolean;
}) {
  return (
    <article
      className={`flex min-w-0 flex-col rounded-[14px] border p-4 md:gap-2 md:p-5 ${
        dark ? "border-[#0B2118] bg-[#0B2118]" : "border-[#D9E5DD] bg-white"
      }`}
    >
      <p className={`text-[15px] leading-[1.8] md:leading-6 ${dark ? "text-[#A8C5B2]" : "text-[#53645B]"}`}>
        {label}
      </p>
      <p
        className={`font-[family-name:var(--font-stack-sans)] text-[20px] font-normal leading-[1.6] md:text-[30px] md:leading-none ${
          dark ? "text-white" : "text-[#14271F]"
        }`}
      >
        {value}
      </p>
      <p
        className={`break-words text-[13px] leading-[1.8] md:leading-5 ${
          dark ? "text-[#A8C5B2]" : accentDetail ? "text-[#718078] md:text-accent" : "text-[#718078]"
        }`}
      >
        {detail}
      </p>
    </article>
  );
}

function SelectControl({
  label,
  value,
  onChange,
  options,
  emphasis = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  emphasis?: boolean;
}) {
  return (
    <label className="relative inline-flex w-full md:w-auto">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none rounded-lg border border-[#D9E5DD] bg-white outline-none focus:border-accent ${
          emphasis
            ? "py-3 pl-4 pr-10 text-base font-semibold text-[#14271F] md:h-11 md:py-2.5 md:pl-3 md:text-sm md:font-normal md:text-[#53645B]"
            : "h-11 py-2.5 pl-4 pr-10 text-sm text-[#53645B] md:pl-3"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <img
        src="/workspace/icon-chevron.svg"
        alt=""
        width={16}
        height={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 md:right-3"
      />
    </label>
  );
}

function SearchField({
  label,
  value,
  onChange,
  placeholder,
  wide = false,
  emphasis = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  wide?: boolean;
  emphasis?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-3 rounded-lg border border-[#D9E5DD] bg-white ${
        emphasis
          ? "w-full px-4 py-3 md:h-11 md:w-[280px] md:px-3 md:py-0"
          : wide
            ? "h-11 w-full px-4 md:w-[280px] md:px-3"
            : "h-11 w-full px-4 md:w-[260px] md:px-3"
      }`}
    >
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent outline-none ${
          emphasis
            ? "text-base font-semibold text-[#14271F] placeholder:font-semibold placeholder:text-[#14271F] md:text-sm md:font-normal md:placeholder:font-normal md:placeholder:text-[#53645B]"
            : "text-sm text-[#14271F] placeholder:text-[#53645B]"
        }`}
      />
      <img src="/workspace/icon-search.svg" alt="" width={16} height={16} />
    </label>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-5">
      <p className="text-[13px] leading-[1.6] text-[#53645B] md:text-[15px] md:leading-[1.4]">{label}</p>
      <p className="text-sm font-semibold leading-[1.6] text-[#14271F] md:text-right md:text-[15px] md:leading-[1.4]">
        {value}
      </p>
    </div>
  );
}

function DocumentButton({
  document,
  title,
}: {
  document: PortfolioDocument;
  title?: string;
}) {
  const label = title ?? document.title;
  return (
    <div className="flex items-center gap-3 border-b border-[#D9E5DD] py-4 last:border-b-0">
      <button type="button" onClick={() => downloadDocument(document)} className="min-w-0 flex-1 text-left">
        <span className="block text-[15px] font-semibold leading-[1.6] text-[#14271F]">
          {label}
        </span>
        <span className="block text-[13px] leading-[1.4] text-[#718078]">{document.detail}</span>
        <span className="block text-sm text-accent">View / download</span>
      </button>
      <button
        type="button"
        aria-label={`Download ${label}`}
        onClick={() => downloadDocument(document)}
        className="shrink-0 text-[#53645B]"
      >
        <DownloadIcon size={17} />
      </button>
    </div>
  );
}

function HoldingDocuments({
  holding,
  documents,
  onOpenVault,
}: {
  holding: Holding;
  documents: PortfolioDocument[];
  onOpenVault: () => void;
}) {
  const related = documents.filter((document) => document.holdingId === holding.id);
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px] xl:w-[510px] xl:shrink-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.7] text-[#14271F] md:leading-snug">
          Ownership & documents
        </h2>
        <button type="button" onClick={onOpenVault} className="w-fit text-sm text-accent">
          Open document vault →
        </button>
      </div>
      {related.length === 0 ? (
        <p className="text-sm leading-[1.4] text-[#53645B]">No documents for this holding yet.</p>
      ) : (
        related.map((document) => (
          <div
            key={document.id}
            className="flex items-center gap-3 border-b border-[#D9E5DD] py-[11px] last:border-b-0"
          >
            <FileIcon />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-[1.7] text-[#14271F]">
                {document.sideTitle ?? document.title}
              </p>
              <p className="text-[13px] font-normal leading-[1.4] text-[#718078]">{document.summary}</p>
            </div>
            <button
              type="button"
              aria-label={`Download ${document.title}`}
              onClick={() => downloadDocument(document)}
              className="shrink-0 text-[#53645B]"
            >
              <DownloadIcon size={17} />
            </button>
          </div>
        ))
      )}
    </section>
  );
}

function HoldingDetail({ holding }: { holding: Holding }) {
  const gain = gainOf(holding);
  const available =
    holding.unitsOwned !== undefined && holding.pendingUnits !== undefined
      ? holding.unitsOwned - holding.pendingUnits
      : holding.unitsOwned;

  return (
    <section
      data-selected-holding
      className="flex min-w-0 flex-1 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]"
    >
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.7] text-[#14271F] md:leading-snug">
          {holding.name}
        </h2>
        <p className="text-sm text-accent">
          {holding.code ? `Selected holding · ${holding.code}` : "Selected holding"}
        </p>
      </div>

      {holding.id === "northstar" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-[5px] bg-[#F4F9F6] px-2 py-[3px] text-[13px] font-medium text-[#53645B]">
              Secondary · Equity
            </span>
            <span className="rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] text-[13px] font-medium text-accent">
              Ownership verified
            </span>
            <span className="rounded-[5px] bg-[#FBF3E5] px-2 py-[3px] text-[13px] font-medium text-[#956428]">
              Transfer in progress
            </span>
          </div>
          <div className="flex flex-col gap-4 md:hidden">
            <Fact label="Units owned" value="3,000" />
            <Fact label="Acquired" value="12 Feb 2026" />
            <Fact label="Cost per unit" value={money(10, 2)} />
            <Fact label="Last reported unit value" value={money(10.8, 2)} />
            <Fact label="Valuation date" value="30 Sep 2026" />
            <Fact label="Units in pending transfer" value="500" />
          </div>
          <div className="hidden md:grid md:grid-cols-2 md:gap-7">
            <div className="flex flex-col gap-3">
              <Fact label="Units owned" value="3,000" />
              <Fact label="Acquired" value="12 Feb 2026" />
              <Fact label="Cost per unit" value={money(10, 2)} />
            </div>
            <div className="flex flex-col gap-3">
              <Fact label="Last reported unit value" value={money(10.8, 2)} />
              <Fact label="Valuation date" value="30 Sep 2026" />
              <Fact label="Units in pending transfer" value="500" />
            </div>
          </div>
          <div className="h-px bg-[#D9E5DD]" />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-[1.4] text-[#53645B]">
              2,500 units remain available to request a sale. Transfers require issuer
              approval and a buyer.
            </p>
            <Link
              href="/marketplace/secondary"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-base font-semibold text-[#14271F] md:w-auto md:shrink-0 md:px-[18px] md:py-2.5"
            >
              Manage transfer
              <ArrowIcon />
            </Link>
          </div>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 md:gap-7">
          <div className="flex flex-col gap-3">
            <Fact label="Invested" value={money(holding.invested)} />
            <Fact label="Valuation" value={money(holding.valuation)} />
            <Fact
              label="Unrealized gain"
              value={`${signedMoney(gain)} · ${gainPercent(holding)}`}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Fact label="Distributions" value={money(holding.distributions)} />
            <Fact label="Sector" value={holding.sector} />
            {holding.unitsOwned !== undefined ? (
              <Fact
                label={holding.pendingUnits ? "Units owned" : "Units owned / available"}
                value={holding.unitsOwned.toLocaleString("en-US")}
              />
            ) : (
              <Fact label="Structure" value={`${holding.channel} · ${holding.structure}`} />
            )}
            {holding.acquired ? <Fact label="Acquired" value={holding.acquired} /> : null}
            {available !== undefined && holding.pendingUnits ? (
              <Fact label="Available to request a sale" value={available.toLocaleString("en-US")} />
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

function HoldingRecord({
  holding,
  selected,
  splitGain,
  onSelect,
  onOpenDocs,
}: {
  holding: Holding;
  selected: boolean;
  splitGain: boolean;
  onSelect: (id: string) => void;
  onOpenDocs: (id: string) => void;
}) {
  const gain = gainOf(holding);
  return (
    <article className="rounded-lg bg-[#F4F9F6] px-3 py-4">
      <button
        type="button"
        onClick={() => onSelect(holding.id)}
        aria-pressed={selected}
        className="block w-full text-left"
      >
        <span className="block text-sm leading-[1.8] text-[#718078]">Business / investment</span>
        <span className="block text-base font-semibold leading-[1.8] text-[#14271F]">{holding.name}</span>
        <span className="block text-base font-semibold leading-[1.8] text-[#14271F]">
          {holding.channel} · {holding.structure}
        </span>
        <span className="block text-sm leading-[1.8] text-[#14271F]">
          Invested: {money(holding.invested)}
        </span>
        <span className="block text-sm leading-[1.8] text-[#14271F]">
          Valuation: {money(holding.valuation)}
        </span>
        {splitGain ? (
          <>
            <span className="block text-sm leading-[1.8] text-[#14271F]">
              Unrealized gain: {signedMoney(gain)}
            </span>
            <span className="block text-sm leading-[1.8] text-[#14271F]">+{gainPercent(holding)}</span>
          </>
        ) : (
          <span className="block text-sm leading-[1.8] text-[#14271F]">
            Unrealized gain: {signedMoney(gain)} · {gainPercent(holding)}
          </span>
        )}
        <span className="block text-sm leading-[1.8] text-[#14271F]">
          Distributions: {money(holding.distributions)}
        </span>
      </button>
      <p className="text-sm leading-[1.8] text-[#14271F]">
        Ownership:{" "}
        <button type="button" onClick={() => onOpenDocs(holding.id)} className="text-[#14271F]">
          View docs ↗
        </button>
      </p>
      <p className="text-sm font-medium leading-[1.8] text-accent">Status: {holding.channel}</p>
    </article>
  );
}

function HoldingsTable({
  rows,
  selectedId,
  splitGain,
  onSelect,
  onOpenDocs,
}: {
  rows: Holding[];
  selectedId: string;
  splitGain: boolean;
  onSelect: (id: string) => void;
  onOpenDocs: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-[10px] bg-[#F4F9F6] px-4 py-6 text-sm leading-[1.4] text-[#53645B]">
        No holdings match this search. Try another business, sector, or structure.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((holding) => (
          <li key={holding.id}>
            <HoldingRecord
              holding={holding}
              selected={holding.id === selectedId}
              splitGain={splitGain}
              onSelect={onSelect}
              onOpenDocs={onOpenDocs}
            />
          </li>
        ))}
      </ul>
      <div className="hidden min-w-0 overflow-x-auto md:block">
        <div className="min-w-[920px]">
          <div className="flex items-center gap-3 rounded-md bg-[#F4F9F6] px-3 py-3 text-xs font-medium text-[#718078]">
            <p className="w-[237px] shrink-0">Business / investment</p>
            <p className="min-w-[88px] flex-1">Invested</p>
            <p className="min-w-[88px] flex-1">Valuation</p>
            <p className="min-w-[110px] flex-1">Unrealized gain</p>
            <p className="min-w-[96px] flex-1">Distributions</p>
            <p className="min-w-[88px] flex-1">Ownership</p>
            <p className="w-16 shrink-0">Status</p>
          </div>
          {rows.map((holding) => {
            const gain = gainOf(holding);
            const selected = holding.id === selectedId;
            return (
              <div
                key={holding.id}
                className={`flex items-center gap-3 border-b border-[#D9E5DD] px-3 py-3.5 ${
                  selected ? "bg-[#F4F9F6]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(holding.id)}
                  aria-pressed={selected}
                  className="w-[237px] shrink-0 text-left text-sm font-semibold leading-[1.35] text-[#14271F]"
                >
                  {holding.name}
                  <br />
                  {holding.channel} · {holding.structure}
                </button>
                <p className="min-w-[88px] flex-1 text-sm leading-[1.35] text-[#14271F]">
                  {money(holding.invested)}
                </p>
                <p className="min-w-[88px] flex-1 text-sm leading-[1.35] text-[#14271F]">
                  {money(holding.valuation)}
                </p>
                <p className="min-w-[110px] flex-1 text-sm leading-[1.35] text-accent">
                  {signedMoney(gain)}
                  <br />+{gainPercent(holding)}
                </p>
                <p className="min-w-[96px] flex-1 text-sm leading-[1.35] text-[#14271F]">
                  {money(holding.distributions)}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenDocs(holding.id)}
                  className="min-w-[88px] flex-1 text-left text-sm leading-[1.35] text-[#14271F]"
                >
                  View docs ↗
                </button>
                <p className="w-16 shrink-0 text-sm leading-[1.35] text-accent">{holding.channel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function sumHoldings(rows: Holding[]) {
  return rows.reduce(
    (totals, holding) => ({
      invested: totals.invested + holding.invested,
      valuation: totals.valuation + holding.valuation,
      distributions: totals.distributions + holding.distributions,
    }),
    { invested: 0, valuation: 0, distributions: 0 },
  );
}

export function Portfolio() {
  const portfolio = usePortfolio();
  const transfers = useTransfers();
  const holdings = useMemo(
    () =>
      (portfolio.data?.holdings || []).map(
        (holding): Holding => ({
          id: holding.id,
          name: holding.name,
          channel: holding.status,
          structure: holding.sector,
          sector: holding.sector,
          invested: holding.invested,
          valuation: holding.valuation,
          distributions: holding.distributions,
        }),
      ),
    [portfolio.data?.holdings],
  );
  const opportunityIds = useMemo(
    () =>
      Array.from(
        new Set(
          (portfolio.data?.holdings || [])
            .map((holding) => holding.opportunityId)
            .filter((id): id is number => typeof id === "number"),
        ),
      ),
    [portfolio.data?.holdings],
  );
  const issuerDocsQuery = useHoldingDocuments(opportunityIds);
  const documents = useMemo(() => {
    const byOpportunity = new Map(
      (portfolio.data?.holdings || [])
        .filter((holding) => holding.opportunityId)
        .map((holding) => [holding.opportunityId, holding.id]),
    );
    const issuer = (issuerDocsQuery.data || []).map(
      (document): PortfolioDocument => ({
        id: document.id,
        holdingId: byOpportunity.get(document.opportunityId) || "",
        title: document.title,
        summary: document.summary,
        detail: document.summary,
        group: "issuer",
        href: document.href,
      }),
    );
    const ownership = (transfers.data || []).flatMap((transfer) =>
      (transfer.documents || []).map(
        (document): PortfolioDocument => ({
          id: `transfer-${transfer.id}-${document.id}`,
          holdingId: String(transfer.investment),
          title: document.document_type_display || document.document_type || "Transfer document",
          summary: transfer.investment_name || "Ownership transfer",
          detail: transfer.status_display || transfer.status,
          group: "ownership",
        }),
      ),
    );
    return [...ownership, ...issuer];
  }, [issuerDocsQuery.data, portfolio.data?.holdings, transfers.data]);

  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All sectors");
  const [valueDesc, setValueDesc] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [docQuery, setDocQuery] = useState("");
  const [docHolding, setDocHolding] = useState("all");
  const [docType, setDocType] = useState<DocType>("all");

  const rows = useMemo(() => {
    const filtered = holdings.filter((holding) => {
      const source = portfolio.data?.holdings.find((item) => item.id === holding.id);
      const exited = source ? isExited(source) : false;
      if (view === "active" && exited) return false;
      if (view === "exited" && !exited) return false;
      if (sector !== "All sectors" && holding.sector !== sector) return false;
      if (query.trim() && !holding.name.toLowerCase().includes(query.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
    return filtered.sort((a, b) =>
      valueDesc ? b.valuation - a.valuation : a.valuation - b.valuation,
    );
  }, [holdings, portfolio.data?.holdings, query, sector, valueDesc, view]);

  const selected = rows.find((holding) => holding.id === selectedId) ?? rows[0];
  const totals = sumHoldings(view === "documents" ? holdings : rows);
  const narrowed = query.trim().length > 0 || sector !== "All sectors";
  const totalLabel = view === "all" && !narrowed ? "Portfolio total" : "Matching holdings";
  const sectors = Array.from(new Set(holdings.map((holding) => holding.sector))).sort();
  const activeCount = (portfolio.data?.holdings || []).filter((holding) => !isExited(holding)).length;
  const exitedCount = (portfolio.data?.holdings || []).filter((holding) => isExited(holding)).length;
  const views: { id: View; label: string }[] = [
    { id: "all", label: `All holdings · ${holdings.length}` },
    { id: "active", label: `Active · ${activeCount}` },
    { id: "exited", label: `Exited · ${exitedCount}` },
    { id: "documents", label: "Documents" },
  ];
  const gain = totals.valuation - totals.invested;
  const gainPct = totals.invested ? (gain / totals.invested) * 100 : 0;

  function openDocs(holdingId?: string) {
    setDocHolding(holdingId ?? "all");
    setDocQuery("");
    setDocType("all");
    setView("documents");
  }

  function selectHolding(id: string) {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 1279px)").matches) {
      requestAnimationFrame(() => {
        const target = [...document.querySelectorAll("[data-selected-holding]")].find(
          (node) => node.getClientRects().length > 0,
        );
        target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  const visibleDocs = documents.filter((document) => {
    const holding = holdings.find((item) => item.id === document.holdingId);
    const haystack = `${document.title} ${holding?.name ?? ""}`.toLowerCase();
    if (docQuery.trim() && !haystack.includes(docQuery.trim().toLowerCase())) return false;
    if (docHolding !== "all" && document.holdingId !== docHolding) return false;
    return true;
  });
  const ownershipDocs =
    docType === "issuer" ? [] : visibleDocs.filter((document) => document.group === "ownership");
  const issuerDocs =
    docType === "ownership" ? [] : visibleDocs.filter((document) => document.group === "issuer");

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-4 md:gap-[22px] md:px-8 md:py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex max-w-[640px] flex-col md:gap-[5px]">
          <p className="text-xs font-semibold leading-[1.7] text-accent">OWNERSHIP / PORTFOLIO</p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[20px] font-normal leading-[1.6] text-[#14271F] md:text-[32px] md:leading-[1.2]">
            Your capital at work.
          </h1>
          <p className="text-xs leading-[1.7] text-[#53645B] md:text-base md:leading-[1.4]">
            Every position, its performance and the documents that make it yours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportHoldings(view === "documents" ? holdings : rows)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-xs font-semibold text-[#14271F] md:w-fit md:px-[18px] md:py-2.5 md:text-base"
        >
          Export holdings
          <DownloadIcon />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-4 xl:grid-cols-4">
        <Metric
          dark
          label="Current valuation"
          value={money(portfolio.data?.portfolioValue ?? totals.valuation)}
          detail={portfolio.isLoading ? "Loading holdings…" : `${holdings.length} positions`}
        />
        <Metric
          label="Total invested"
          value={money(portfolio.data?.invested ?? totals.invested)}
          detail={`${activeCount} active · ${exitedCount} exited`}
        />
        <Metric
          accentDetail
          label="Unrealized gain"
          value={signedMoney(portfolio.data?.unrealized ?? gain)}
          detail={`${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(2)}% vs. invested capital`}
        />
        <Metric
          accentDetail
          label="Distributions received"
          value={money(portfolio.data?.distributions ?? totals.distributions)}
          detail="From recorded capital activities"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#D9E5DD] md:flex-nowrap md:gap-x-[26px] md:gap-y-0 md:overflow-x-auto">
        {views.map((item) => {
          const active = item.id === view;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => {
                if (item.id === "documents" && view !== "documents") {
                  setDocHolding("all");
                  setDocQuery("");
                  setDocType("all");
                }
                setView(item.id);
              }}
              className={`-mb-px shrink-0 border-b-2 py-[11px] text-base leading-6 ${
                active
                  ? "border-accent font-semibold text-accent"
                  : "border-transparent text-[#53645B] hover:text-[#14271F]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {portfolio.isError ? (
        <p className="rounded-[10px] bg-[#FCF0EE] px-4 py-4 text-sm text-[#53645B]">
          {portfolio.error instanceof Error
            ? portfolio.error.message
            : "Holdings could not be loaded."}
        </p>
      ) : null}
      {view === "documents" ? (
        <DocumentsView
          holdings={holdings}
          query={docQuery}
          holding={docHolding}
          type={docType}
          ownershipDocs={ownershipDocs}
          issuerDocs={issuerDocs}
          onQuery={setDocQuery}
          onHolding={setDocHolding}
          onType={setDocType}
        />
      ) : null}

      {view !== "documents" ? (
        <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
          {view !== "all" ? (
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
              <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.7] text-[#14271F] md:leading-snug">
                {view === "active" ? "Active holdings" : "Exited holdings"}
              </h2>
              <button
                type="button"
                onClick={() => setValueDesc((current) => !current)}
                className="w-fit text-left text-sm text-accent"
              >
                {rows.length} {rows.length === 1 ? "holding" : "holdings"} · Sorted by value{" "}
                {valueDesc ? "↓" : "↑"}
              </button>
            </div>
          ) : null}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form
              className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:gap-2.5"
              onSubmit={(event) => event.preventDefault()}
            >
              <SearchField
                label="Search your holdings"
                value={query}
                onChange={setQuery}
                placeholder="Search your holdings"
              />
              <SelectControl
                label="Sector"
                value={sector}
                onChange={setSector}
                options={[
                  { value: "All sectors", label: "All sectors" },
                  ...sectors.map((item) => ({ value: item, label: item })),
                ]}
              />
            </form>
            {view === "all" ? (
              <p className="text-[13px] leading-[1.35] text-[#718078]">
                {rows.length} {rows.length === 1 ? "holding" : "holdings"} ·{" "}
                <button
                  type="button"
                  onClick={() => setValueDesc((current) => !current)}
                  className="text-[#718078]"
                >
                  Sorted by value {valueDesc ? "↓" : "↑"}
                </button>
              </p>
            ) : null}
          </div>
          <HoldingsTable
            rows={rows}
            selectedId={selected?.id ?? ""}
            splitGain={view === "all"}
            onSelect={selectHolding}
            onOpenDocs={openDocs}
          />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-2">
            <p className="text-[13px] leading-[1.6] text-[#53645B] md:text-[15px] md:leading-[1.4]">
              {totalLabel}
            </p>
            <p className="text-sm font-semibold leading-[1.6] text-[#14271F] md:text-[15px] md:leading-[1.4]">
              {money(totals.invested)} invested · {money(totals.valuation)} valuation ·{" "}
              {money(totals.distributions)} distributions
            </p>
          </div>
        </section>
      ) : null}

      {view !== "documents" && selected ? (
        <div className="flex flex-col gap-5 xl:flex-row">
          <HoldingDetail holding={selected} />
          <HoldingDocuments
            holding={selected}
            documents={documents}
            onOpenVault={() => openDocs(selected.id)}
          />
        </div>
      ) : null}

      <PolicyNote icon={view === "all"} />
    </div>
  );
}

function MobilePrimaryDetail({
  holding,
  onOpenDocs,
}: {
  holding: Holding;
  onOpenDocs: () => void;
}) {
  const gain = gainOf(holding);
  return (
    <section
      data-selected-holding
      className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:hidden"
    >
      <div>
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.7] text-[#14271F]">
          {holding.name} · Holding detail
        </h2>
        <p className="text-sm text-accent">
          {holding.channel} · {holding.structure}
        </p>
      </div>
      <Fact label="Invested capital" value={money(holding.invested)} />
      <Fact
        label={`Reported value · ${holding.valuationDate ?? "30 Sep 2026"}`}
        value={money(holding.valuation)}
      />
      <Fact
        label="Unrealized movement"
        value={`${signedMoney(gain)} · +${gainPercent(holding)}`}
      />
      <Fact label="Lifetime distributions" value={money(holding.distributions)} />
      {holding.latestDistribution ? (
        <Fact
          label="Latest credited distribution"
          value={`${money(holding.latestDistribution.amount)} · ${holding.latestDistribution.date}`}
        />
      ) : null}
      <button
        type="button"
        onClick={onOpenDocs}
        className="inline-flex w-full items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-base font-semibold text-[#14271F]"
      >
        View ownership documents ↗
      </button>
    </section>
  );
}


function DocumentsView({
  holdings,
  query,
  holding,
  type,
  ownershipDocs,
  issuerDocs,
  onQuery,
  onHolding,
  onType,
}: {
  holdings: Holding[];
  query: string;
  holding: string;
  type: DocType;
  ownershipDocs: PortfolioDocument[];
  issuerDocs: PortfolioDocument[];
  onQuery: (value: string) => void;
  onHolding: (value: string) => void;
  onType: (value: DocType) => void;
}) {
  return (
    <>
      <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.7] text-[#14271F] md:leading-[1.25]">
            Ownership document vault
          </h2>
          <p className="text-sm leading-[1.4] text-accent">{holdings.length} holdings</p>
        </div>
        <form
          className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchField
            wide
            emphasis
            label="Search document or business"
            value={query}
            onChange={onQuery}
            placeholder="Search document or business"
          />
          <SelectControl
            emphasis
            label="Holding"
            value={holding}
            onChange={onHolding}
            options={[
              { value: "all", label: "All holdings" },
              ...holdings.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
          <SelectControl
            emphasis
            label="Document type"
            value={type}
            onChange={(value) => onType(value as DocType)}
            options={[
              { value: "all", label: "All documents" },
              { value: "ownership", label: "Ownership documents" },
              { value: "issuer", label: "Issuer reports & agreements" },
            ]}
          />
        </form>
        {type !== "issuer" ? (
          <div>
            {ownershipDocs.map((document) => (
              <DocumentButton key={document.id} document={document} />
            ))}
            {ownershipDocs.length === 0 ? (
              <p className="text-sm leading-[1.4] text-[#53645B]">
                No ownership documents match this search.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
      {type !== "ownership" ? (
        <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 md:p-[22px]">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-[1.7] text-[#14271F] md:leading-[1.25]">
            Issuer reports & agreements
          </h2>
          <div>
            {issuerDocs.map((document) => (
              <DocumentButton key={document.id} document={document} />
            ))}
            {issuerDocs.length === 0 ? (
              <p className="text-sm leading-[1.4] text-[#53645B]">
                No issuer reports match this search.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DepositFundsButton } from "../deposit-dialog";
import {
  Choice,
  DialogButton,
  FeedbackDialog,
  Note,
} from "../marketplace/feedback-dialog";
import { downloadText } from "../portfolio/data";
import {
  availableBalance,
  dateRanges,
  money,
  payouts,
  reservedFunds,
  signedAmount,
  statuses,
  tabNotes,
  totalBalance,
  transactionsFor,
  walletTabs,
  type DateRangeId,
  type Transaction,
  type WalletTab,
} from "./data";

function LandmarkIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" aria-hidden>
      <path
        d="M11.5 3.2 3.2 7.4h16.6L11.5 3.2Z"
        stroke="#32A364"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4.4 9.2v6.2M8.6 9.2v6.2M14.4 9.2v6.2M18.6 9.2v6.2" stroke="#32A364" strokeWidth="1.5" />
      <path d="M3.2 17.2h16.6M4.6 19.6h13.8" stroke="#32A364" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="mt-0.5 shrink-0">
      <path
        d="M10 2.4 4.2 4.6v4.7c0 3.5 2.3 6.6 5.8 8.3 3.5-1.7 5.8-4.8 5.8-8.3V4.6L10 2.4Z"
        stroke="#32A364"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7.4 10.1 9.2 11.9 12.8 8.3" stroke="#32A364" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.25 6.5h11.5M5.25 2.25v2.2M10.75 2.25v2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function parseAmount(value: string) {
  const cleaned = value.replace(/[₦$]/g, "").replace(/,/g, "").trim();
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}

const statementFile = "FMI-00842_statement_2026-10-24.pdf";

const statementRows = [
  { label: "Helix distribution · 24 Oct", value: `+${money(450)} · Completed` },
  { label: "Chase deposit · 20 Oct", value: `+${money(10000)} · Completed` },
  { label: "Chase withdrawal · 15 Oct", value: `−${money(2000)} · Completed` },
  { label: "Fieldwork FW-028", value: `${money(5000)} · Reserved` },
] as const;

function snapshotCopy() {
  return `Current snapshot: ${money(availableBalance)} available + ${money(reservedFunds)} reserved = ${money(totalBalance)}. New sample deposit and withdrawal flows are excluded.`;
}

function pdfDocument(lines: string[]) {
  const content = [
    "BT",
    "/F1 11 Tf",
    "16 TL",
    "48 760 Td",
    ...lines.flatMap((line, index) => {
      const safe = line.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
      return index === 0 ? [`(${safe}) Tj`] : ["T*", `(${safe}) Tj`];
    }),
    "ET",
  ].join("\n");
  const stream = `${content}\n`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(output.length);
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return output;
}

function statementPdf() {
  return pdfDocument([
    "FMI activity statement",
    statementFile,
    "01 Oct - 24 Oct 2026",
    "PDF / NGN",
    "",
    "Helix distribution, 24 Oct",
    "+NGN 450 - Completed",
    "",
    "Chase deposit, 20 Oct",
    "+NGN 10,000 - Completed",
    "",
    "Chase withdrawal, 15 Oct",
    "-NGN 2,000 - Completed",
    "",
    "Fieldwork FW-028",
    "NGN 5,000 - Reserved",
    "",
    "Available NGN 18,320 + reserved NGN 5,000 = NGN 23,320.",
    "New sample deposit and withdrawal flows are excluded.",
    "Illustrative statement. No transactions were submitted or changed.",
  ]);
}

function receiptText(transaction: Transaction) {
  return `${transaction.title}\n${transaction.reference}\n${transaction.date}\n${transaction.type}\n${signedAmount(transaction.amount)}\n${transaction.status}\n\nIllustrative wallet receipt. No bank file is stored for this demo.\n`;
}

function Metric({
  label,
  value,
  detail,
  dark = false,
}: {
  label: string;
  value: string;
  detail: string;
  dark?: boolean;
}) {
  return (
    <article
      className={`flex min-w-0 flex-col gap-2 rounded-[14px] border p-4 ${
        dark ? "border-[#0B2118] bg-[#0B2118]" : "border-[#D9E5DD] bg-white"
      }`}
    >
      <p className={`text-xs leading-[1.6] md:text-[15px] md:leading-6 ${dark ? "text-[#A8C5B2]" : "text-[#53645B]"}`}>{label}</p>
      <p
        className={`break-words font-[family-name:var(--font-stack-sans)] text-xl font-normal leading-none md:text-[30px] ${
          dark ? "text-white" : "text-[#14271F]"
        }`}
      >
        {value}
      </p>
      <p className={`break-words text-xs leading-5 md:text-[13px] ${dark ? "text-[#A8C5B2]" : "text-[#718078]"}`}>{detail}</p>
    </article>
  );
}

function WithdrawDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"amount" | "review" | "pending">("amount");
  const [amount, setAmount] = useState("₦500.00");
  const [amountError, setAmountError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [submitted, setSubmitted] = useState(500);
  const parsed = parseAmount(amount);

  function review() {
    if (parsed === null) {
      setAmountError("Enter a withdrawal amount greater than ₦0.");
      return;
    }
    if (parsed > availableBalance) {
      setAmountError(`Amount is above the ${money(availableBalance)} available balance. Reserved funds stay reserved.`);
      return;
    }
    setAmount(money(parsed, 2));
    setAmountError("");
    setStep("review");
  }

  function submit() {
    if (parsed === null || parsed > availableBalance) {
      setStep("amount");
      return;
    }
    if (!authorized) {
      setAuthError(true);
      return;
    }
    setSubmitted(parsed);
    setStep("pending");
  }

  if (step === "review" && parsed !== null) {
    return (
      <FeedbackDialog
        eyebrow="WITHDRAWAL / REVIEW"
        title="Review your withdrawal"
        onClose={onClose}
        showClose
        actions={
          <>
            <DialogButton onClick={() => setStep("amount")}>Back</DialogButton>
            <DialogButton tone="primary" onClick={submit}>
              Submit withdrawal request
            </DialogButton>
          </>
        }
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <p className="text-[15px] leading-[1.4] text-[#53645B]">Withdrawal amount</p>
          <p className="text-[15px] font-semibold text-[#14271F]">{money(parsed, 2)}</p>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <p className="text-[15px] leading-[1.4] text-[#53645B]">To</p>
          <p className="min-w-0 break-words text-[15px] font-semibold text-[#14271F] sm:text-right">Chase checking ···· 4821</p>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <p className="text-[15px] leading-[1.4] text-[#53645B]">Estimated arrival</p>
          <p className="text-[15px] font-semibold text-[#14271F]">2–5 business days</p>
        </div>
        <Choice
          checked={authorized}
          label="I authorize this same-name withdrawal to the verified bank account."
          onChange={() => {
            setAuthorized((current) => !current);
            setAuthError(false);
          }}
        />
        {authError ? (
          <p className="text-[13px] leading-[1.4] text-[#8A3E36]">Authorize the withdrawal before submitting.</p>
        ) : null}
        <Note>
          Nothing has been requested yet. The {money(availableBalance)} available balance and{" "}
          {money(reservedFunds)} Fieldwork reserve are unchanged.
        </Note>
      </FeedbackDialog>
    );
  }

  if (step === "pending") {
    return (
      <FeedbackDialog
        eyebrow="WITHDRAWAL / PENDING"
        title="Withdrawal request pending"
        onClose={onClose}
        showClose
        actions={<DialogButton onClick={onClose}>Close</DialogButton>}
      >
        <Note tone="warning">
          Illustrative request received. This is not a completed withdrawal, and the available
          balance is unchanged until a real transfer would settle.
        </Note>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <p className="text-[15px] leading-[1.4] text-[#53645B]">Requested amount</p>
          <p className="text-[15px] font-semibold text-[#14271F]">{money(submitted, 2)}</p>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          <p className="text-[15px] leading-[1.4] text-[#53645B]">Destination</p>
          <p className="text-[15px] font-semibold text-[#14271F]">Chase checking ···· 4821</p>
        </div>
      </FeedbackDialog>
    );
  }

  return (
    <FeedbackDialog
      eyebrow="WITHDRAWAL / AMOUNT"
      title="Withdraw funds"
      onClose={onClose}
      showClose
      actions={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton tone="primary" onClick={review}>
            Review withdrawal
          </DialogButton>
        </>
      }
    >
      <p className="text-[15px] leading-[1.45] text-[#53645B]">
        Send cleared funds to your verified same-name bank. Reserved funds cannot be withdrawn.
      </p>
      <label className="flex flex-col gap-[7px]">
        <span className="text-sm font-semibold text-[#14271F]">Withdrawal amount · ₦</span>
        <span className="rounded-lg border border-[#D9E5DD] px-4 py-3 focus-within:border-accent">
          <input
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setAmountError("");
            }}
            inputMode="decimal"
            aria-invalid={amountError ? true : undefined}
            className="w-full bg-transparent text-base text-[#14271F] outline-none"
          />
        </span>
        <span className={`text-[13px] leading-[1.4] ${amountError ? "text-[#8A3E36]" : "text-[#53645B]"}`}>
          {amountError || `Available to withdraw ${money(availableBalance)}. Reserved ${money(reservedFunds)} stays reserved.`}
        </span>
      </label>
      <div className="rounded-lg border border-[#D9E5DD] px-4 py-3 text-base text-[#14271F]">
        Chase checking ···· 4821 · Verified
      </div>
    </FeedbackDialog>
  );
}

function MethodsDialog({ onClose }: { onClose: () => void }) {
  return (
    <FeedbackDialog
      eyebrow="WALLET / PAYMENT METHODS"
      title="Chase checking ···· 4821"
      onClose={onClose}
      showClose
      actions={<DialogButton onClick={onClose}>Close</DialogButton>}
    >
      <Note title="Verified default">Alex Morgan · ACH transfer · Same-name bank only.</Note>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <p className="text-[15px] text-[#53645B]">Deposits</p>
        <p className="min-w-0 break-words text-[15px] font-semibold text-[#14271F] sm:text-right">1–3 business days · ₦0 fee</p>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <p className="text-[15px] text-[#53645B]">Withdrawals</p>
        <p className="min-w-0 break-words text-[15px] font-semibold text-[#14271F] sm:text-right">2–5 business days</p>
      </div>
      <Note>
        Funds must clear before investing. Security checks may apply. No bank connection is live in
        this demo.
      </Note>
    </FeedbackDialog>
  );
}

function StatementDialog({ onClose }: { onClose: () => void }) {
  return (
    <FeedbackDialog
      eyebrow="STATEMENTS / READY TO DOWNLOAD"
      title="Your statement is ready"
      onClose={onClose}
      showClose
      placement="center"
      actions={
        <>
          <DialogButton onClick={onClose}>Done</DialogButton>
          <DialogButton
            tone="primary"
            onClick={() => downloadText(statementFile, statementPdf(), "application/pdf")}
          >
            Download PDF
          </DialogButton>
        </>
      }
    >
      <Note>The illustrative activity statement is ready. No transactions have been submitted or changed.</Note>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold leading-[1.4] text-[#14271F]">{statementFile}</p>
        <p className="text-[13px] leading-5 text-[#53645B]">01 Oct – 24 Oct 2026 · PDF · NGN</p>
      </div>
      {statementRows.map((row) => (
        <div key={row.label} className="flex flex-col">
          <p className="text-[13px] leading-5 text-[#53645B]">{row.label}</p>
          <p className="text-sm font-semibold leading-[1.4] text-[#14271F]">{row.value}</p>
        </div>
      ))}
      <Note>{snapshotCopy()}</Note>
    </FeedbackDialog>
  );
}

export function Wallet() {
  const [tab, setTab] = useState<WalletTab>("all");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<DateRangeId>("90");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All statuses");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);

  const rows = useMemo(
    () => transactionsFor(tab, query, range, status),
    [tab, query, range, status],
  );
  const rangeLabel = dateRanges.find((item) => item.id === range)?.label ?? "Last 90 days";
  const historyTitle =
    tab === "all" ? "Transaction history" : `${walletTabs.find((item) => item.id === tab)?.label} history`;

  const illustratedPage =
    tab === "all" && query.trim() === "" && range === "90" && status === "All statuses";

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-[640px] flex-col gap-[5px]">
          <p className="text-xs font-semibold text-accent">CAPITAL / WALLET & TRANSACTIONS</p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.2] text-[#14271F] sm:text-[32px]">
            Every movement, accounted for.
          </h1>
          <p className="text-base leading-[1.4] text-[#53645B]">
            Fund your next investment and follow every deposit, payout and withdrawal.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => setWithdrawOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-[18px] py-[11px] text-base font-semibold leading-[1.4] text-[#14271F] hover:bg-[#F4F9F6] sm:w-auto"
          >
            Withdraw
          </button>
          <DepositFundsButton className="w-full sm:w-auto" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
        <Metric
          dark
          label="Available balance"
          value={money(availableBalance)}
          detail="Cleared funds · Ready to invest"
        />
        <Metric
          label="Reserved funds"
          value={money(reservedFunds)}
          detail={
            tab === "all"
              ? "Fieldwork Labs order · Awaiting allocation"
              : "Fieldwork Labs · FW-028 · Awaiting allocation"
          }
        />
        <Metric
          label="Total wallet balance"
          value={money(totalBalance)}
          detail={
            tab === "all"
              ? "Available + reserved · ₦"
              : "Available + reserved · Pending deposits excluded"
          }
        />
      </div>

      {tab === "all" ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_510px]">
          <section className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
                Payment methods
              </h2>
              <button
                type="button"
                onClick={() => setMethodsOpen(true)}
                className="w-fit text-left text-sm text-accent"
              >
                Manage methods →
              </button>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="flex size-[46px] shrink-0 items-center justify-center rounded-[9px] bg-[#E8F7EC]">
                <LandmarkIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-[1.35] text-[#14271F]">
                  Chase checking ···· 4821
                </p>
                <p className="text-[13px] leading-[1.35] text-[#718078]">
                  Alex Morgan · ACH transfer · Default method
                </p>
              </div>
              <p className="rounded-[5px] bg-[#E8F7EC] px-2 py-[3px] text-[13px] font-medium text-accent">
                Verified
              </p>
            </div>
            <div className="h-px bg-[#D9E5DD]" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-[1.35] text-[#14271F]">
                  Deposits · 1–3 business days
                </p>
                <p className="text-[13px] leading-[1.4] text-[#53645B]">
                  ACH deposit fee: ₦0. Funds must clear before investing.
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold leading-[1.35] text-[#14271F]">
                  Withdrawals · 2–5 business days
                </p>
                <p className="text-[13px] leading-[1.4] text-[#53645B]">
                  Verified same-name bank only. Security checks may apply.
                </p>
              </div>
            </div>
          </section>

          <section
            id="payout-schedule"
            className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
                Next scheduled payouts
              </h2>
              <a href="#payout-schedule" className="w-fit text-sm text-accent">
                Full schedule →
              </a>
            </div>
            {payouts.map((payout) => (
              <div
                key={payout.when}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <p className="text-[13px] leading-[1.4] text-[#53645B]">{payout.when}</p>
                <p className="text-sm font-semibold leading-[1.4] text-[#14271F]">{money(payout.amount)}</p>
              </div>
            ))}
            <p className="text-xs leading-[1.4] text-[#53645B]">
              Estimated · Subject to issuer declaration and available cash. Payout dates and amounts
              may change.
            </p>
          </section>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] leading-[1.4] text-[#53645B]">
            Chase checking ···· 4821 · Verified default · ACH deposits 1–3 business days ·
            Withdrawals 2–5 business days
          </p>
          <button
            type="button"
            onClick={() => setMethodsOpen(true)}
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-[18px] py-[11px] text-base font-semibold leading-[1.4] text-[#14271F] sm:w-fit"
          >
            Manage methods →
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-x-2 border-b border-[#D9E5DD] sm:gap-x-[26px]" role="tablist">
        {walletTabs.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 py-[11px] text-base leading-6 ${
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

      <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] font-normal leading-snug text-[#14271F]">
            {historyTitle}
          </h2>
          <button
            type="button"
            onClick={() => setStatementOpen(true)}
            className="w-fit text-left text-sm text-accent"
          >
            Download statement ↓
          </button>
        </div>
        <form
          className="flex flex-col gap-2.5 lg:flex-row lg:flex-wrap"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="relative flex h-11 w-full items-center rounded-lg border border-[#D9E5DD] bg-white px-3 focus-within:border-accent lg:w-[250px]">
            <span className="sr-only">Search reference or business</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reference or business"
              className="w-full bg-transparent pr-6 text-center text-sm text-[#14271F] outline-none placeholder:text-[#53645B] lg:text-left"
            />
            <img
              src="/workspace/icon-search.svg"
              alt=""
              width={16}
              height={16}
              className="pointer-events-none absolute right-3"
            />
          </label>
          <FilterSelect
            label="Date range"
            value={range}
            onChange={(value) => setRange(value as DateRangeId)}
            options={dateRanges.map((item) => ({ value: item.id, label: item.label }))}
            icon="calendar"
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as (typeof statuses)[number])}
            options={statuses.map((item) => ({ value: item, label: item }))}
            icon="chevron"
          />
        </form>

        {rows.length === 0 ? (
          <p className="py-6 text-sm leading-[1.4] text-[#53645B]">
            No transactions match these filters. Only the supplied account records are shown.
          </p>
        ) : (
          <TransactionTable rows={rows} />
        )}

        {tab === "all" ? (
          <div className="flex flex-col gap-4 text-sm leading-[1.4] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-[13px] leading-[1.35] text-[#718078]">
              {illustratedPage
                ? "Showing 7 of 38 transactions"
                : `Showing ${rows.length} of ${rows.length} transactions`}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <p className="text-[#718078]">← Previous</p>
              <p className="text-[#14271F]">Next →</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[13px] leading-[1.4] text-[#53645B]">
                Visible source records · {rangeLabel}
              </p>
              <p className="text-sm font-semibold leading-[1.4] text-[#14271F]">
                {rows.length} matching transactions
              </p>
            </div>
            <p className="text-[13px] leading-[1.4] text-[#718078]">
              Only supplied account records are displayed in this alternate tab. No additional
              transaction history is inferred.
            </p>
          </div>
        )}
      </section>

      {tab === "all" ? (
        <div className="flex gap-3 rounded-[10px] bg-[#E8F7EC] p-4">
          <ShieldIcon />
          <p className="text-sm leading-[1.4] text-[#53645B]">
            Transactions are encrypted and monitored. Reserved funds cannot be withdrawn until the
            order completes or is released. Never send funds to bank details received outside your
            FMI workspace.
          </p>
        </div>
      ) : (
        <div className="rounded-[10px] bg-[#E8F7EC] p-4 text-sm leading-[1.5] text-[#53645B]">
          <p className="font-semibold text-[#14271F]">{tabNotes[tab].title}</p>
          <p>{tabNotes[tab].body}</p>
        </div>
      )}

      {withdrawOpen ? <WithdrawDialog onClose={() => setWithdrawOpen(false)} /> : null}
      {methodsOpen ? <MethodsDialog onClose={() => setMethodsOpen(false)} /> : null}
      {statementOpen ? <StatementDialog onClose={() => setStatementOpen(false)} /> : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon: "calendar" | "chevron";
}) {
  const selected = options.find((option) => option.value === value)?.label ?? value;

  return (
    <label className="relative flex h-11 w-full items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-3 focus-within:border-accent lg:w-auto lg:min-w-[160px] lg:justify-start">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent text-sm text-[#53645B] opacity-0 outline-none lg:static lg:h-auto lg:pr-8 lg:opacity-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none text-sm text-[#53645B] lg:hidden">{selected}</span>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#53645B]">
        {icon === "calendar" ? (
          <CalendarIcon />
        ) : (
          <img src="/workspace/icon-chevron.svg" alt="" width={16} height={16} />
        )}
      </span>
    </label>
  );
}

function statusTone(status: Transaction["status"]) {
  return status === "Completed" ? "text-accent" : "text-[#995B13]";
}

function TransactionTable({ rows }: { rows: Transaction[] }) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((transaction) => (
          <li key={transaction.id} className="flex flex-col rounded-lg bg-[#F4F9F6] px-3 py-4">
            <p className="text-sm leading-[1.8] text-[#718078]">Transaction / reference</p>
            <p className="text-base font-semibold leading-snug text-[#14271F]">{transaction.title}</p>
            <p className="text-base font-semibold leading-snug text-[#14271F]">{transaction.reference}</p>
            <p className="text-sm leading-[1.8] text-[#14271F]">Date: {transaction.date}</p>
            <p className="text-sm leading-[1.8] text-[#14271F]">Type: {transaction.type}</p>
            <p className="text-sm leading-[1.8] text-[#14271F]">
              Amount: {signedAmount(transaction.amount)}
            </p>
            <p className="text-sm leading-[1.8] text-[#14271F]">
              Receipt: <Receipt transaction={transaction} className="text-[#14271F]" />
            </p>
            <p className={`text-sm font-semibold leading-[1.8] ${statusTone(transaction.status)}`}>
              Status: {transaction.status}
            </p>
          </li>
        ))}
      </ul>
      <div className="hidden min-w-0 overflow-x-auto md:block">
        <div className="min-w-[860px]">
          <div className="flex gap-3 rounded-md bg-[#F4F9F6] px-3 py-3 text-xs font-medium text-[#718078]">
            <p className="w-[285px] shrink-0">Transaction / reference</p>
            <p className="min-w-0 flex-1">Date</p>
            <p className="min-w-0 flex-1">Type</p>
            <p className="min-w-0 flex-1">Amount</p>
            <p className="min-w-0 flex-1">Status</p>
            <p className="min-w-0 flex-1">Receipt</p>
          </div>
          {rows.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-3 border-b border-[#D9E5DD] px-3 py-3.5 text-sm leading-[1.35]"
            >
              <p className="w-[285px] shrink-0 font-semibold leading-[22.67px] text-[#14271F]">
                {transaction.title}
                <br />
                {transaction.reference}
              </p>
              <p className="min-w-0 flex-1 text-[#14271F]">{transaction.date}</p>
              <p className="min-w-0 flex-1 text-[#14271F]">{transaction.type}</p>
              <p className={`min-w-0 flex-1 ${transaction.amount > 0 ? "text-accent" : "text-[#14271F]"}`}>
                {signedAmount(transaction.amount)}
              </p>
              <p className={`min-w-0 flex-1 ${statusTone(transaction.status)}`}>
                {transaction.status}
              </p>
              <div className="min-w-0 flex-1">
                <Receipt transaction={transaction} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Receipt({
  transaction,
  className = "text-accent",
}: {
  transaction: Transaction;
  className?: string;
}) {
  if (transaction.receipt === "order") {
    return (
      <Link href="/portfolio" className={`text-sm leading-[1.35] underline ${className}`}>
        View order
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => downloadText(`${transaction.reference}.txt`, receiptText(transaction))}
      className={`text-left text-sm leading-[1.35] ${className}`}
    >
      Download
    </button>
  );
}

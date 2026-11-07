"use client";

import { useState } from "react";
import {
  Choice,
  DialogButton,
  FeedbackDialog,
  Note,
} from "./marketplace/feedback-dialog";

const availableBalance = 18320;

function parseAmount(value: string) {
  const cleaned = value.replace(/[₦$]/g, "").replace(/,/g, "").trim();
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}

function formatAmount(amount: number, digits = 2) {
  return amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
      <p className="min-w-0 text-[15px] leading-[1.4] text-[#53645B]">{label}</p>
      <p className="min-w-0 break-words text-[15px] font-semibold leading-[1.4] text-[#14271F] sm:text-right">
        {value}
      </p>
    </div>
  );
}

function useDepositDialog() {
  const [open, setOpen] = useState(false);
  return {
    openDeposit: () => setOpen(true),
    dialog: open ? <DepositDialog onClose={() => setOpen(false)} /> : null,
  };
}

export function AddFundsButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const { openDeposit, dialog } = useDepositDialog();

  return (
    <>
      <button
        type="button"
        onClick={openDeposit}
        className={
          fullWidth
            ? "inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-4 text-xs font-semibold leading-6 text-[#14271F]"
            : "inline-flex items-center gap-2 rounded-lg border border-[#D9E5DD] bg-white px-[18px] py-2.5 text-base font-semibold leading-6 text-[#14271F]"
        }
      >
        Add funds
        <img src="/workspace/icon-plus.svg" alt="" width={16} height={16} />
      </button>
      {dialog}
    </>
  );
}

export function DepositFundsButton({ className = "" }: { className?: string }) {
  const { openDeposit, dialog } = useDepositDialog();

  return (
    <>
      <button
        type="button"
        onClick={openDeposit}
        className={`inline-flex items-center justify-center rounded-lg border border-accent bg-accent px-[18px] py-[11px] text-base font-semibold leading-[1.4] text-white ${className}`}
      >
        Deposit funds +
      </button>
      {dialog}
    </>
  );
}

function DepositDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"amount" | "review" | "pending">("amount");
  const [amount, setAmount] = useState("₦2,500.00");
  const [amountError, setAmountError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [submitted, setSubmitted] = useState(2500);

  const parsed = parseAmount(amount);

  function review() {
    if (parsed === null) {
      setAmountError("Enter a deposit amount greater than ₦0.");
      return;
    }
    setAmount(formatAmount(parsed));
    setAmountError("");
    setStep("review");
  }

  function submit() {
    if (parsed === null) {
      setStep("amount");
      setAmountError("Enter a deposit amount greater than ₦0.");
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
        eyebrow="DEPOSIT / REVIEW"
        title="Review your deposit"
        onClose={onClose}
        showClose
        actions={
          <>
            <DialogButton onClick={() => setStep("amount")}>Back</DialogButton>
            <DialogButton tone="primary" onClick={submit}>
              Submit deposit request
            </DialogButton>
          </>
        }
      >
        <DetailRow label="Deposit amount" value={formatAmount(parsed)} />
        <DetailRow label="From" value="Chase checking ···· 4821" />
        <DetailRow label="Account holder" value="Alex Morgan" />
        <DetailRow label="ACH fee" value="₦0.00" />
        <DetailRow label="Total bank debit requested" value={formatAmount(parsed)} />
        <DetailRow label="Estimated clearing" value="1–3 business days" />
        <div className="flex flex-col gap-2">
          <Choice
            checked={authorized}
            label="I authorize this same-name ACH deposit request under the payment terms."
            onChange={() => {
              setAuthorized((current) => !current);
              setAuthError(false);
            }}
          />
          {authError ? (
            <p className="text-[13px] leading-[1.4] text-[#8A3E36]">
              Authorize the deposit request before submitting.
            </p>
          ) : null}
        </div>
        <Note>
          Nothing has been requested yet. The {formatAmount(availableBalance, 0)} available
          balance and ₦5,000 Fieldwork FW-028 reserve are unchanged. This is a static
          design, not bank authorization.
        </Note>
      </FeedbackDialog>
    );
  }

  if (step === "pending") {
    return (
      <FeedbackDialog
        eyebrow="DEPOSIT / PENDING SUBMISSION STATE"
        title="Deposit request pending"
        onClose={onClose}
        showClose
        actions={
          <>
            <DialogButton onClick={onClose}>Close</DialogButton>
            <DialogButton
              tone="primary"
              onClick={() => document.getElementById("deposit-status")?.focus()}
            >
              View deposit status
            </DialogButton>
          </>
        }
      >
        <Note tone="warning">
          <span id="deposit-status" tabIndex={-1} className="outline-none">
            Illustrative request received · Awaiting ACH processing. This is not a
            completed deposit or cleared funds.
          </span>
        </Note>
        <DetailRow label="Requested amount" value={formatAmount(submitted)} />
        <DetailRow label="Source" value="Chase checking ···· 4821" />
        <DetailRow label="Processing estimate" value="1–3 business days" />
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-semibold text-[#14271F]">
            Request received → Processing → Cleared
          </p>
          <p className="text-[13px] leading-5 text-[#53645B]">
            Processing and clearance are not yet confirmed.
          </p>
        </div>
        <DetailRow
          label="Cleared available balance"
          value={`${formatAmount(availableBalance, 0)} · Unchanged`}
        />
        <Note>
          Do not count pending funds as available. No actual bank connection or transfer
          is performed in this concept.
        </Note>
      </FeedbackDialog>
    );
  }

  return (
    <FeedbackDialog
      eyebrow="DEPOSIT / AMOUNT ENTRY"
      title="Deposit funds"
      onClose={onClose}
      showClose
      actions={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton tone="primary" onClick={review}>
            Review deposit
          </DialogButton>
        </>
      }
    >
      <p className="text-[15px] leading-[1.45] text-[#53645B]">
        Add cleared funds from your verified same-name bank.
      </p>
      <label className="flex flex-col gap-[7px]">
        <span className="text-sm font-semibold text-[#14271F]">Deposit amount · ₦</span>
        <span className="rounded-lg border border-[#D9E5DD] px-4 py-3 focus-within:border-accent">
          <input
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setAmountError("");
            }}
            onBlur={() => {
              if (parsed !== null) setAmount(formatAmount(parsed));
            }}
            inputMode="decimal"
            aria-invalid={amountError ? true : undefined}
            aria-describedby="deposit-amount-help"
            className="w-full bg-transparent text-base leading-[1.45] text-[#14271F] outline-none"
          />
        </span>
        <span
          id="deposit-amount-help"
          className={`text-[13px] leading-[1.4] ${amountError ? "text-[#8A3E36]" : "text-[#53645B]"}`}
        >
          {amountError ||
            "Illustrative new deposit, separate from the completed ₦10,000 deposit."}
        </span>
      </label>
      <div className="flex flex-col gap-[7px]">
        <p className="text-sm font-semibold text-[#14271F]">From bank</p>
        <div className="rounded-lg border border-[#D9E5DD] px-4 py-3 text-base leading-[1.45] text-[#14271F]">
          Chase checking ···· 4821 · Verified
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-[#14271F]">
          Alex Morgan · ACH transfer
        </p>
        <p className="text-[13px] leading-5 text-[#53645B]">
          Same-name ACH only · Expected 1–3 business days
        </p>
      </div>
      <DetailRow label="ACH deposit fee" value="₦0" />
      <DetailRow label="Current available balance" value={formatAmount(availableBalance, 0)} />
      <Note>
        Funds must clear before investing. This static amount entry does not contact a
        bank or move money.
      </Note>
    </FeedbackDialog>
  );
}

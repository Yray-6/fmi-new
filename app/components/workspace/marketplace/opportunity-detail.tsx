"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCancelInvestorInterest,
  useCreateInvestorInterest,
  useInvestorInterests,
  useOpportunityDetail,
  useRequestOpportunityInformation,
  useUpdateInvestorInterest,
} from "@/hooks/use-opportunity";
import { useWatchlist } from "./watchlist-state";
import { formatNaira } from "@/lib/utils/formatters";

function amount(value: string | number | null | undefined) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function OpportunityDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const detail = useOpportunityDetail(id);
  const interests = useInvestorInterests();
  const createInterest = useCreateInvestorInterest();
  const updateInterest = useUpdateInvestorInterest();
  const cancelInterest = useCancelInvestorInterest();
  const requestInfo = useRequestOpportunityInformation();
  const { saved, toggle } = useWatchlist();
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledgeDate, setPledgeDate] = useState("");
  const [note, setNote] = useState("");
  const [infoNote, setInfoNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    setPledgeDate(new Date().toISOString().slice(0, 10));
  }, []);

  if (detail.isLoading) {
    return <p className="px-4 py-8 text-sm text-[#53645B] sm:px-8">Loading opportunity…</p>;
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="flex flex-col gap-3 px-4 py-8 sm:px-8">
        <p className="text-sm text-[#53645B]">
          {detail.error instanceof Error
            ? detail.error.message
            : "This opportunity could not be loaded."}
        </p>
        <Link href="/marketplace" className="w-fit text-sm text-accent">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const opportunity = detail.data;
  const bookmarked = saved.includes(String(opportunity.id));
  const mine = (interests.data || []).filter(
    (item) => item.opportunity === opportunity.id,
  );
  const tags = opportunity.tags || [];

  async function pledge(event: React.FormEvent) {
    event.preventDefault();
    setNote("");
    try {
      await createInterest.mutateAsync({
        opportunity: opportunity.id,
        amount: pledgeAmount,
        investmentDate: pledgeDate,
      });
      setNote("Pledge submitted. Staff convert it into an investment.");
      setPledgeAmount("");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not submit the pledge.");
    }
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setNote("");
    try {
      await updateInterest.mutateAsync({
        id: editingId,
        amount: editAmount,
        investmentDate: editDate,
      });
      setNote("Pledge updated.");
      setEditingId(null);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not update the pledge.");
    }
  }

  async function requestInformation() {
    setInfoNote("");
    try {
      await requestInfo.mutateAsync(String(opportunity.id));
      setInfoNote("Information request sent to the issuer.");
    } catch (error) {
      setInfoNote(
        error instanceof Error
          ? error.message
          : "Could not request information.",
      );
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-6 sm:px-8 sm:py-8">
      <Link href="/marketplace" className="w-fit text-sm text-accent">
        ← Marketplace
      </Link>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-[760px] flex-col gap-2">
          <p className="text-xs font-semibold text-accent">
            {opportunity.sector_display || opportunity.sector} ·{" "}
            {opportunity.status_display || opportunity.status}
          </p>
          <h1 className="font-[family-name:var(--font-stack-sans)] text-[28px] font-normal leading-[1.2] text-[#14271F] lg:text-[32px]">
            {opportunity.title}
          </h1>
          <p className="text-base leading-[1.45] text-[#53645B]">
            {opportunity.description}
          </p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-[5px] bg-[#E8F7EC] px-2 py-1 text-[12px] text-accent"
                >
                  {tag.tag_name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggle(String(opportunity.id), opportunity.title)}
            className="inline-flex w-fit items-center justify-center rounded-lg border border-[#D9E5DD] bg-white px-4 py-2.5 text-sm font-semibold text-[#14271F]"
          >
            {bookmarked ? "Saved to watchlist" : "Save to watchlist"}
          </button>
          <button
            type="button"
            disabled={requestInfo.isPending}
            onClick={requestInformation}
            className="inline-flex w-fit items-center justify-center rounded-lg border border-accent bg-white px-4 py-2.5 text-sm font-semibold text-accent"
          >
            {requestInfo.isPending ? "Requesting…" : "Request information"}
          </button>
        </div>
      </div>
      {infoNote ? <p className="text-sm text-[#53645B]">{infoNote}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Minimum" value={formatNaira(amount(opportunity.min_investment))} />
        <Stat
          label="Raised"
          value={`${formatNaira(amount(opportunity.current_raised_amount))} of ${formatNaira(amount(opportunity.target_raise_amount))}`}
        />
        <Stat
          label="Remaining"
          value={formatNaira(amount(opportunity.remaining_amount))}
        />
        <Stat
          label="Target IRR"
          value={
            opportunity.target_irr
              ? `${amount(opportunity.target_irr)}%`
              : "Not provided"
          }
        />
        <Stat
          label="Term"
          value={
            opportunity.investment_term_years
              ? `${opportunity.investment_term_years} years`
              : "Not provided"
          }
        />
        <Stat
          label="Investors"
          value={String(opportunity.investors_count ?? 0)}
        />
        <Stat
          label="Manager"
          value={opportunity.fund_manager || "Not provided"}
        />
        <Stat label="Stage" value={opportunity.stage || "Not provided"} />
      </div>

      <section className="flex flex-col gap-3 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] text-[#14271F]">
          Terms
        </h2>
        <Fact label="Structure" value={opportunity.investment_type_display || opportunity.investment_type} />
        <Fact label="Risk" value={opportunity.risk_level_display || opportunity.risk_level} />
        <Fact
          label="Payout"
          value={opportunity.payout_frequency_display || opportunity.payout_frequency}
        />
        <Fact label="Currency" value={opportunity.currency || "Not provided"} />
        <Fact label="Location" value={opportunity.location || "Not provided"} />
        <Fact
          label="Verification"
          value={
            opportunity.verification_type_display ||
            opportunity.verification_type ||
            "Not provided"
          }
        />
        <Fact label="Rating" value={opportunity.rating || "Not provided"} />
        <Fact
          label="Funding progress"
          value={`${amount(opportunity.funding_progress_percentage).toFixed(1)}%`}
        />
        {opportunity.monthly_revenue ? (
          <Fact
            label="Monthly revenue"
            value={formatNaira(amount(opportunity.monthly_revenue))}
          />
        ) : null}
        {opportunity.net_cash_flow ? (
          <Fact
            label="Net cash flow"
            value={formatNaira(amount(opportunity.net_cash_flow))}
          />
        ) : null}
        {opportunity.detailed_description ? (
          <p className="whitespace-pre-wrap text-sm leading-[1.5] text-[#53645B]">
            {opportunity.detailed_description}
          </p>
        ) : null}
        {opportunity.investment_requirements ? (
          <p className="text-sm leading-[1.5] text-[#53645B]">
            {opportunity.investment_requirements}
          </p>
        ) : null}
        {opportunity.disclaimer ? (
          <p className="text-xs leading-[1.4] text-[#718078]">{opportunity.disclaimer}</p>
        ) : null}
        {(opportunity.contact_email || opportunity.contact_phone) ? (
          <div className="border-t border-[#D9E5DD] pt-3 text-sm text-[#53645B]">
            <p className="font-semibold text-[#14271F]">Issuer contact</p>
            {opportunity.contact_email ? <p>{opportunity.contact_email}</p> : null}
            {opportunity.contact_phone ? <p>{opportunity.contact_phone}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] text-[#14271F]">
          Documents
        </h2>
        {(opportunity.documents || []).length === 0 ? (
          <p className="text-sm text-[#53645B]">No documents published for this opportunity.</p>
        ) : (
          (opportunity.documents || []).map((document) => {
            const href = document.file_url || document.file;
            return (
              <div key={document.id} className="flex items-center justify-between gap-3 border-b border-[#D9E5DD] py-2">
                <div>
                  <p className="text-sm font-semibold text-[#14271F]">{document.title}</p>
                  <p className="text-xs text-[#718078]">
                    {document.document_type_display || document.document_type || "Document"}
                  </p>
                </div>
                {href ? (
                  <a href={href} className="text-sm text-accent" target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : null}
              </div>
            );
          })
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] text-[#14271F]">
          Express interest
        </h2>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={pledge}>
          <label className="flex flex-1 flex-col gap-1 text-sm text-[#53645B]">
            Amount
            <input
              required
              inputMode="decimal"
              value={pledgeAmount}
              onChange={(event) => setPledgeAmount(event.target.value)}
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-[#14271F] outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#53645B]">
            Expected date
            <input
              required
              type="date"
              value={pledgeDate}
              onChange={(event) => setPledgeDate(event.target.value)}
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-[#14271F] outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={createInterest.isPending || !pledgeDate}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {createInterest.isPending ? "Submitting…" : "Submit pledge"}
          </button>
        </form>
        {note ? <p className="text-sm text-[#53645B]">{note}</p> : null}
        {mine.length > 0 ? (
          <div className="flex flex-col gap-3">
            {mine.map((item) => {
              const itemId = String(item.id);
              const pending = item.status === "PENDING";
              if (editingId === itemId) {
                return (
                  <form
                    key={item.id}
                    className="flex flex-col gap-2 rounded-[10px] border border-[#D9E5DD] bg-[#F4F9F6] p-3 sm:flex-row sm:items-end"
                    onSubmit={saveEdit}
                  >
                    <label className="flex flex-1 flex-col gap-1 text-sm text-[#53645B]">
                      Amount
                      <input
                        required
                        inputMode="decimal"
                        value={editAmount}
                        onChange={(event) => setEditAmount(event.target.value)}
                        className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-2 text-[#14271F] outline-none focus:border-accent"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-[#53645B]">
                      Expected date
                      <input
                        required
                        type="date"
                        value={editDate}
                        onChange={(event) => setEditDate(event.target.value)}
                        className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-2 text-[#14271F] outline-none focus:border-accent"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={updateInterest.isPending}
                      className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      {updateInterest.isPending ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      className="text-sm text-[#53645B]"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel edit
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 border-b border-[#D9E5DD] py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-[#14271F]">
                    {formatNaira(amount(item.amount))} · {item.investment_date} ·{" "}
                    {item.status_display || item.status}
                  </p>
                  {pending ? (
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        className="text-accent"
                        onClick={() => {
                          setEditingId(itemId);
                          setEditAmount(String(item.amount ?? ""));
                          setEditDate(item.investment_date || "");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-accent"
                        onClick={() => cancelInterest.mutate(itemId)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-[#D9E5DD] bg-white p-4">
      <p className="text-xs text-[#718078]">{label}</p>
      <p className="text-base font-semibold text-[#14271F]">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <p className="text-[#718078]">{label}</p>
      <p className="text-right font-semibold text-[#14271F]">{value}</p>
    </div>
  );
}

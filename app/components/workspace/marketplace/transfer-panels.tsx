"use client";

import { useState } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import {
  useCancelSecondaryInterest,
  useCancelTransfer,
  useCreateTransfer,
  useSecondaryInterests,
  useSubmitTransfer,
  useTransfers,
  useUpdateSecondaryInterest,
  useUpdateTransfer,
} from "@/hooks/use-transfers";
import { downloadTransferDocument } from "@/lib/api/transfers";
import { formatNaira } from "@/lib/utils/formatters";

function money(value: string | number | undefined) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? formatNaira(n) : "—";
}

export function LiveTransferWorkspace({
  mode,
}: {
  mode: "transfers" | "holdings" | "documents";
}) {
  const transfers = useTransfers();
  const interests = useSecondaryInterests();
  const portfolio = usePortfolio();
  const createTransfer = useCreateTransfer();
  const updateTransfer = useUpdateTransfer();
  const submitTransfer = useSubmitTransfer();
  const cancelTransfer = useCancelTransfer();
  const cancelInterest = useCancelSecondaryInterest();
  const updateInterest = useUpdateSecondaryInterest();
  const [investmentId, setInvestmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [transferType, setTransferType] = useState<"FULL" | "PARTIAL">("PARTIAL");
  const [note, setNote] = useState("");
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);
  const [editTransferAmount, setEditTransferAmount] = useState("");
  const [editTransferReason, setEditTransferReason] = useState("");
  const [editingInterestId, setEditingInterestId] = useState<string | null>(null);
  const [editInterestAmount, setEditInterestAmount] = useState("");

  const rows = transfers.data || [];
  const holdings = portfolio.data?.holdings || [];
  const pending = rows.filter((row) =>
    ["DRAFT", "PENDING", "APPROVED"].includes(row.status),
  );

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setNote("");
    const investment = Number(investmentId);
    if (!investment) {
      setNote("Choose a holding.");
      return;
    }
    try {
      const created = await createTransfer.mutateAsync({
        investment,
        transfer_type: transferType,
        transfer_amount: amount,
        reason,
        status: "DRAFT",
      });
      await submitTransfer.mutateAsync(String(created.id));
      setNote("Transfer submitted for staff approval.");
      setAmount("");
      setReason("");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not create the transfer.");
    }
  }

  async function saveTransferEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingTransferId) return;
    setNote("");
    try {
      await updateTransfer.mutateAsync({
        id: editingTransferId,
        body: {
          transfer_amount: editTransferAmount,
          reason: editTransferReason,
        },
      });
      setNote("Draft transfer updated.");
      setEditingTransferId(null);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not update the transfer.");
    }
  }

  async function saveInterestEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingInterestId) return;
    setNote("");
    try {
      await updateInterest.mutateAsync({
        id: editingInterestId,
        amount: editInterestAmount,
      });
      setNote("Buyer interest updated.");
      setEditingInterestId(null);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Could not update the interest.");
    }
  }

  if (transfers.isLoading || portfolio.isLoading) {
    return <p className="text-sm text-[#53645B]">Loading transfers…</p>;
  }

  if (transfers.isError) {
    return (
      <p className="text-sm text-[#53645B]">
        {transfers.error instanceof Error
          ? transfers.error.message
          : "Transfers could not be loaded."}
      </p>
    );
  }

  if (mode === "holdings") {
    return (
      <section className="flex flex-col gap-4 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] text-[#14271F]">
          Request a transfer
        </h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={create}>
          <label className="flex flex-col gap-1 text-sm text-[#53645B]">
            Holding
            <select
              value={investmentId}
              onChange={(event) => setInvestmentId(event.target.value)}
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-[#14271F]"
            >
              <option value="">Select a holding</option>
              {holdings.map((holding) => (
                <option key={holding.id} value={holding.id}>
                  {holding.name} · {formatNaira(holding.valuation)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#53645B]">
            Type
            <select
              value={transferType}
              onChange={(event) =>
                setTransferType(event.target.value as "FULL" | "PARTIAL")
              }
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-[#14271F]"
            >
              <option value="PARTIAL">Partial</option>
              <option value="FULL">Full</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#53645B]">
            Amount
            <input
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-[#14271F]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[#53645B] md:col-span-2">
            Reason
            <input
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="rounded-lg border border-[#D9E5DD] px-3 py-2 text-[#14271F]"
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
          >
            Submit transfer
          </button>
        </form>
        {note ? <p className="text-sm text-[#53645B]">{note}</p> : null}
      </section>
    );
  }

  if (mode === "documents") {
    const documents = rows.flatMap((transfer) =>
      (transfer.documents || []).map((document) => ({
        ...document,
        transferId: transfer.id,
        transferName: transfer.investment_name || `Transfer ${transfer.id}`,
      })),
    );
    return (
      <section className="flex flex-col gap-3 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] text-[#14271F]">
          Transfer documents
        </h2>
        {documents.length === 0 ? (
          <p className="text-sm text-[#53645B]">No transfer documents yet.</p>
        ) : (
          documents.map((document) => (
            <div
              key={`${document.transferId}-${document.id}`}
              className="flex items-center justify-between gap-3 border-b border-[#D9E5DD] py-2"
            >
              <div>
                <p className="text-sm font-semibold text-[#14271F]">
                  {document.document_type_display ||
                    document.document_type ||
                    "Document"}
                </p>
                <p className="text-xs text-[#718078]">{document.transferName}</p>
              </div>
              <button
                type="button"
                className="text-sm text-accent"
                onClick={() =>
                  downloadTransferDocument(
                    String(document.transferId),
                    String(document.id),
                    `transfer-${document.transferId}-${document.id}`,
                  )
                }
              >
                Download
              </button>
            </div>
          ))
        )}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] text-[#14271F]">
          Your transfers
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-[#53645B]">You have not created a transfer yet.</p>
        ) : (
          rows.map((transfer) => {
            const id = String(transfer.id);
            if (editingTransferId === id) {
              return (
                <form
                  key={transfer.id}
                  className="flex flex-col gap-2 rounded-[10px] border border-[#D9E5DD] bg-[#F4F9F6] p-3"
                  onSubmit={saveTransferEdit}
                >
                  <label className="flex flex-col gap-1 text-sm text-[#53645B]">
                    Amount
                    <input
                      required
                      value={editTransferAmount}
                      onChange={(event) => setEditTransferAmount(event.target.value)}
                      className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-2 text-[#14271F]"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-[#53645B]">
                    Reason
                    <input
                      required
                      value={editTransferReason}
                      onChange={(event) => setEditTransferReason(event.target.value)}
                      className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-2 text-[#14271F]"
                    />
                  </label>
                  <div className="flex gap-3 text-sm">
                    <button
                      type="submit"
                      disabled={updateTransfer.isPending}
                      className="text-accent"
                    >
                      {updateTransfer.isPending ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      className="text-[#53645B]"
                      onClick={() => setEditingTransferId(null)}
                    >
                      Cancel edit
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <article
                key={transfer.id}
                className="flex flex-col gap-2 border-b border-[#D9E5DD] py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-semibold text-[#14271F]">
                    {transfer.investment_name || `Investment ${transfer.investment}`}
                  </p>
                  <p className="text-sm text-accent">
                    {transfer.status_display || transfer.status}
                  </p>
                </div>
                <p className="text-sm text-[#53645B]">
                  {transfer.transfer_type_display || transfer.transfer_type} ·{" "}
                  {money(transfer.transfer_amount)} ·{" "}
                  {transfer.recipient || transfer.to_name || "Secondary market"}
                </p>
                <div className="flex gap-3 text-sm">
                  {transfer.status === "DRAFT" ? (
                    <>
                      <button
                        type="button"
                        className="text-accent"
                        onClick={() => {
                          setEditingTransferId(id);
                          setEditTransferAmount(String(transfer.transfer_amount || ""));
                          setEditTransferReason(transfer.reason || "");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-accent"
                        onClick={() => submitTransfer.mutate(id)}
                      >
                        Submit
                      </button>
                    </>
                  ) : null}
                  {transfer.status === "DRAFT" || transfer.status === "PENDING" ? (
                    <button
                      type="button"
                      className="text-[#8A3E36]"
                      onClick={() => cancelTransfer.mutate(id)}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
        {pending.length === 0 ? null : (
          <p className="text-xs text-[#718078]">
            Approval and completion stay with PrivCap staff. This screen shows status only.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-[14px] border border-[#D9E5DD] bg-white p-4 sm:p-[22px]">
        <h2 className="font-[family-name:var(--font-stack-sans)] text-[19px] text-[#14271F]">
          Your buyer interests
        </h2>
        {(interests.data || []).length === 0 ? (
          <p className="text-sm text-[#53645B]">No secondary-market interests yet.</p>
        ) : (
          (interests.data || []).map((interest) => {
            const id = String(interest.id);
            if (editingInterestId === id) {
              return (
                <form
                  key={interest.id}
                  className="flex flex-col gap-2 rounded-[10px] border border-[#D9E5DD] bg-[#F4F9F6] p-3 sm:flex-row sm:items-end"
                  onSubmit={saveInterestEdit}
                >
                  <label className="flex flex-1 flex-col gap-1 text-sm text-[#53645B]">
                    Amount
                    <input
                      required
                      value={editInterestAmount}
                      onChange={(event) => setEditInterestAmount(event.target.value)}
                      className="rounded-lg border border-[#D9E5DD] bg-white px-3 py-2 text-[#14271F]"
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
                    onClick={() => setEditingInterestId(null)}
                  >
                    Cancel edit
                  </button>
                </form>
              );
            }

            return (
              <div
                key={interest.id}
                className="flex flex-col gap-2 border-b border-[#D9E5DD] py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-[#14271F]">
                  {money(interest.amount)} · {interest.status_display || interest.status}
                </p>
                {interest.status === "PENDING" ? (
                  <div className="flex gap-3 text-sm">
                    <button
                      type="button"
                      className="text-accent"
                      onClick={() => {
                        setEditingInterestId(id);
                        setEditInterestAmount(String(interest.amount || ""));
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-accent"
                      onClick={() => cancelInterest.mutate(id)}
                    >
                      Withdraw
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
        {note ? <p className="text-sm text-[#53645B]">{note}</p> : null}
      </section>
    </div>
  );
}

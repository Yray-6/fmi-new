import { bffDelete, bffDownload, bffGet, bffPatch, bffPost } from "./client";
import { fetchAllPages } from "./pagination";
import type {
  OwnershipTransfer,
  SecondaryMarketInterest,
  TransferCreateRequest,
} from "./types";

function listOrResults<T>(payload: T[] | { results?: T[] }) {
  return Array.isArray(payload) ? payload : payload.results || [];
}

export async function fetchTransfers() {
  const [owned, pending, history] = await Promise.all([
    fetchAllPages<OwnershipTransfer>("/api/bff/transfers"),
    bffGet<OwnershipTransfer[] | { results?: OwnershipTransfer[] }>(
      "/api/bff/transfers/pending",
    ).then(listOrResults),
    bffGet<OwnershipTransfer[] | { results?: OwnershipTransfer[] }>(
      "/api/bff/transfers/history",
    ).then(listOrResults),
  ]);

  const byId = new Map<number, OwnershipTransfer>();
  for (const transfer of [...owned, ...pending, ...history]) {
    byId.set(transfer.id, transfer);
  }
  return [...byId.values()].sort((a, b) => b.id - a.id);
}

export function fetchTransfer(id: string) {
  return bffGet<OwnershipTransfer>(`/api/bff/transfers/${id}`);
}

export function createTransfer(body: TransferCreateRequest) {
  return bffPost<OwnershipTransfer>("/api/bff/transfers", body);
}

export function updateTransfer(id: string, body: Partial<TransferCreateRequest>) {
  return bffPatch<OwnershipTransfer>(`/api/bff/transfers/${id}`, body);
}

export function submitTransfer(id: string) {
  return bffPost<OwnershipTransfer>(`/api/bff/transfers/${id}/submit`, {});
}

export function cancelTransfer(id: string) {
  return bffDelete(`/api/bff/transfers/${id}`);
}

export function downloadTransferDocument(
  transferId: string,
  documentId: string,
  filename: string,
) {
  return bffDownload(
    `/api/bff/transfers/${transferId}/documents/${documentId}/download`,
    filename,
  );
}

export function fetchSecondaryInterests() {
  return fetchAllPages<SecondaryMarketInterest>("/api/bff/secondary-market-interests");
}

export function updateSecondaryInterest(id: string, amount: string) {
  return bffPatch<SecondaryMarketInterest>(
    `/api/bff/secondary-market-interests/${id}`,
    { amount },
  );
}

export function cancelSecondaryInterest(id: string) {
  return bffPost(`/api/bff/secondary-market-interests/${id}/cancel`, {});
}

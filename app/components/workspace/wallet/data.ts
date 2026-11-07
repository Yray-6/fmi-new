export type WalletTab = "all" | "deposits" | "investments" | "distributions" | "withdrawals";

export type TransactionType =
  | "Distribution"
  | "Reservation"
  | "Deposit"
  | "Withdrawal"
  | "Investment";

export type Transaction = {
  id: string;
  title: string;
  reference: string;
  date: string;
  iso: string;
  type: TransactionType;
  amount: number;
  status: "Completed" | "Reserved";
  receipt: "download" | "order";
};

export const walletTabs: { id: WalletTab; label: string }[] = [
  { id: "all", label: "All transactions" },
  { id: "deposits", label: "Deposits" },
  { id: "investments", label: "Investments" },
  { id: "distributions", label: "Distributions" },
  { id: "withdrawals", label: "Withdrawals" },
];

export const dateRanges = [
  { id: "90", label: "Last 90 days" },
  { id: "30", label: "Last 30 days" },
  { id: "ytd", label: "Year to date" },
  { id: "all", label: "All time" },
] as const;

export type DateRangeId = (typeof dateRanges)[number]["id"];

export const statuses = ["All statuses", "Completed", "Reserved"] as const;

export const availableBalance = 18320;
export const reservedFunds = 5000;
export const totalBalance = availableBalance + reservedFunds;

export const payouts = [
  { when: "01 Nov · Helix Solar", amount: 1250 },
  { when: "15 Nov · Greenhaven Health", amount: 860 },
  { when: "30 Nov · Meridian Foods", amount: 540 },
] as const;

export const transactions: Transaction[] = [
  {
    id: "txn-1024-045",
    title: "Helix Solar · Quarterly interest",
    reference: "TXN-1024-045",
    date: "24 Oct 2026",
    iso: "2026-10-24",
    type: "Distribution",
    amount: 450,
    status: "Completed",
    receipt: "download",
  },
  {
    id: "txn-1022-044",
    title: "Fieldwork Labs · Order FW-028",
    reference: "TXN-1022-044",
    date: "22 Oct 2026",
    iso: "2026-10-22",
    type: "Reservation",
    amount: -5000,
    status: "Reserved",
    receipt: "order",
  },
  {
    id: "txn-1020-043",
    title: "Chase ···· 4821",
    reference: "TXN-1020-043",
    date: "20 Oct 2026",
    iso: "2026-10-20",
    type: "Deposit",
    amount: 10000,
    status: "Completed",
    receipt: "download",
  },
  {
    id: "txn-1015-042",
    title: "Chase ···· 4821",
    reference: "TXN-1015-042",
    date: "15 Oct 2026",
    iso: "2026-10-15",
    type: "Withdrawal",
    amount: -2000,
    status: "Completed",
    receipt: "download",
  },
  {
    id: "txn-0930-041",
    title: "Greenhaven Health · Dividend",
    reference: "TXN-0930-041",
    date: "30 Sep 2026",
    iso: "2026-09-30",
    type: "Distribution",
    amount: 860,
    status: "Completed",
    receipt: "download",
  },
  {
    id: "txn-0930-040",
    title: "Meridian Foods · Revenue share",
    reference: "TXN-0930-040",
    date: "30 Sep 2026",
    iso: "2026-09-30",
    type: "Distribution",
    amount: 540,
    status: "Completed",
    receipt: "download",
  },
  {
    id: "txn-0912-039",
    title: "Cedar Agriculture · Equity purchase",
    reference: "TXN-0912-039",
    date: "12 Sep 2026",
    iso: "2026-09-12",
    type: "Investment",
    amount: -20000,
    status: "Completed",
    receipt: "download",
  },
];

const tabTypes: Record<Exclude<WalletTab, "all">, TransactionType[]> = {
  deposits: ["Deposit"],
  investments: ["Reservation", "Investment"],
  distributions: ["Distribution"],
  withdrawals: ["Withdrawal"],
};

const asOf = Date.parse("2026-10-24T00:00:00Z");

export function transactionsFor(
  tab: WalletTab,
  query: string,
  range: DateRangeId,
  status: string,
) {
  const needle = query.trim().toLowerCase();
  return transactions.filter((transaction) => {
    if (tab !== "all" && !tabTypes[tab].includes(transaction.type)) return false;
    if (status !== "All statuses" && transaction.status !== status) return false;
    if (needle) {
      const haystack = `${transaction.title} ${transaction.reference} ${transaction.type}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    const time = Date.parse(`${transaction.iso}T00:00:00Z`);
    if (range === "30" && time < asOf - 29 * 24 * 60 * 60 * 1000) return false;
    if (range === "90" && time < asOf - 89 * 24 * 60 * 60 * 1000) return false;
    if (range === "ytd" && time < Date.parse("2026-01-01T00:00:00Z")) return false;
    return true;
  });
}

export function money(value: number, digits = 0) {
  return value.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function signedAmount(value: number) {
  const formatted = money(Math.abs(value), 2);
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}

export const tabNotes: Record<Exclude<WalletTab, "all">, { title: string; body: string }> = {
  deposits: {
    title: "Cleared balances only",
    body: "The available ₦18,320 excludes the ₦5,000 Fieldwork reservation. Pending deposits do not increase your cleared wallet balance. Pending withdrawals are separately reserved until settlement.",
  },
  investments: {
    title: "Reserved is not completed",
    body: "Fieldwork Labs FW-028 has ₦5,000 reserved and is awaiting allocation. It is separate from the existing ₦25,000 Fieldwork holding. The new Helix sample request has not been submitted in this wallet state.",
  },
  distributions: {
    title: "Received vs estimated",
    body: "Helix +₦450 on 24 Oct is completed and already credited. November payouts are estimates, not cleared cash or guaranteed payments. Lifetime distributions are ₦8,620.",
  },
  withdrawals: {
    title: "Cleared balances only",
    body: "The available ₦18,320 excludes the ₦5,000 Fieldwork reservation. Pending deposits do not increase your cleared wallet balance. Pending withdrawals are separately reserved until settlement.",
  },
};

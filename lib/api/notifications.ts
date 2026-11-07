import { fetchAllPages } from "./pagination";
import { fetchTransfers } from "./transfers";
import type { ApiCapitalActivity, OwnershipTransfer } from "./types";
import { formatNaira } from "@/lib/utils/formatters";

export type Notice = {
  id: string;
  icon: string;
  title: string;
  body: string;
  meta: string;
  action: string;
  href?: string;
  unread: boolean;
};

const READ_STATE_KEY = "fmi_notice_read_v1";

type ReadState = Record<string, true>;

function loadReadState(): ReadState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(READ_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReadState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveReadState(state: ReadState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_STATE_KEY, JSON.stringify(state));
}

function parseAmount(value: string | number | null | undefined) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMetaDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function activityIcon(type: string) {
  const upper = type.toUpperCase();
  if (upper === "DISTRIBUTION" || upper === "PARTIAL_EXIT" || upper === "FULL_EXIT") {
    return "/workspace/icon-notice-wallet.svg";
  }
  if (upper === "CAPITAL_CALL") {
    return "/workspace/icon-notice-briefcase.svg";
  }
  return "/workspace/icon-notice-briefcase.svg";
}

function mapActivity(
  activity: ApiCapitalActivity,
  read: ReadState,
): Notice {
  const id = `activity-${activity.id}`;
  const amount = Math.abs(parseAmount(activity.amount));
  const name = activity.investment?.name || "Investment";
  const type = (activity.activity_type || "").toUpperCase();
  const typeLabel = activity.activity_type_display || activity.activity_type;

  let title = typeLabel;
  let body = `${formatNaira(amount)} · ${name}`;
  let action = "View portfolio";
  let href = "/portfolio";

  if (type === "DISTRIBUTION") {
    title = `${name} distribution`;
    body = `${formatNaira(amount)} was credited from ${name}.`;
    action = "View portfolio";
  } else if (type === "CAPITAL_CALL") {
    title = `${name} capital call`;
    body = `${formatNaira(amount)} is due for ${name}.`;
    action = "View portfolio";
  } else if (type === "INITIAL_INVESTMENT") {
    title = `${name} investment`;
    body = `${formatNaira(amount)} was recorded for ${name}.`;
    action = "View portfolio";
  } else if (type === "PARTIAL_EXIT" || type === "FULL_EXIT") {
    title = `${name} ${typeLabel.toLowerCase()}`;
    body = `${formatNaira(amount)} was recorded for ${name}.`;
    action = "View portfolio";
  }

  return {
    id,
    icon: activityIcon(type),
    title,
    body,
    meta: `${formatMetaDate(activity.date || activity.created_at)} · ${typeLabel}`,
    action,
    href,
    unread: !read[id],
  };
}

function mapTransfer(transfer: OwnershipTransfer, read: ReadState): Notice {
  const id = `transfer-${transfer.id}`;
  const name = transfer.investment_name || "Holding";
  const amount = Math.abs(parseAmount(transfer.transfer_amount));
  const status = transfer.status_display || transfer.status || "Transfer";
  const date =
    transfer.initiated_date ||
    transfer.estimated_completion_date ||
    "";

  return {
    id,
    icon: "/workspace/icon-notice-transfer.svg",
    title: `${name} transfer ${status.toLowerCase()}`,
    body: `TRF-${transfer.id} · ${formatNaira(amount)}. ${
      transfer.reason ? transfer.reason : "Ownership transfer update."
    }`,
    meta: `${formatMetaDate(date)} · Transfer`,
    action: "View transfer",
    href: "/marketplace/secondary",
    unread: !read[id],
  };
}

function sortTime(notice: Notice) {
  const stamp = notice.meta.split(" · ")[0];
  const parsed = new Date(stamp);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export async function fetchNotifications(): Promise<Notice[]> {
  const read = loadReadState();
  const [activities, transfers] = await Promise.all([
    fetchAllPages<ApiCapitalActivity>("/api/capital-activities").catch(
      () => [] as ApiCapitalActivity[],
    ),
    fetchTransfers().catch(() => [] as OwnershipTransfer[]),
  ]);

  const notices = [
    ...activities.map((activity) => mapActivity(activity, read)),
    ...transfers.map((transfer) => mapTransfer(transfer, read)),
  ]
    .sort((a, b) => sortTime(b) - sortTime(a))
    .slice(0, 30);

  return notices;
}

export function markNotificationsRead(ids: string[]) {
  const read = loadReadState();
  for (const id of ids) read[id] = true;
  saveReadState(read);
}

export function markAllNotificationsRead(notices: Notice[]) {
  markNotificationsRead(notices.map((notice) => notice.id));
}

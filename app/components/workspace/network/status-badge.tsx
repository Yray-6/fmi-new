import type { NetworkConnectionStatus } from "@/lib/api/network";

export function connectionLabel(status: NetworkConnectionStatus) {
  if (status === "accepted") return "Connected";
  if (status === "pending") return "Pending";
  if (status === "self") return "You";
  return "Not connected";
}

export function StatusBadge({
  status,
}: {
  status: NetworkConnectionStatus | "pending" | "accepted" | "rejected";
}) {
  const normalized =
    status === "accepted"
      ? "accepted"
      : status === "pending"
        ? "pending"
        : status === "self"
          ? "self"
          : "none";

  const styles =
    normalized === "accepted"
      ? "bg-[#E8F7EC] text-accent"
      : normalized === "pending"
        ? "bg-[#FAF4E5] text-[#8C6B27]"
        : "bg-[#F4F9F6] text-[#53645B]";

  return (
    <span
      className={`inline-flex rounded-[5px] px-2 py-1 text-xs leading-[1.35] ${styles}`}
    >
      {connectionLabel(normalized)}
    </span>
  );
}

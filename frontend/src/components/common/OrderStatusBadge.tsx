const STATUS_STYLES: Record<string, string> = {
  pending: "bg-hairline text-ink/70",
  confirmed: "bg-teal-light text-teal-dark",
  processing: "bg-teal-light text-teal-dark",
  shipped: "bg-gold-light text-gold-dark",
  delivered: "bg-teal-light text-teal-dark",
  cancelled: "bg-red-50 text-red-700",
  refunded: "bg-red-50 text-red-700",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-hairline text-ink/70";
  return (
    <span className={`rounded-sm px-2.5 py-1 font-mono text-xs uppercase tracking-wide ${style}`}>
      {status}
    </span>
  );
}
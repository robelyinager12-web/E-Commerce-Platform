export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="price-tag mt-2 text-2xl">{value}</p>
      {sub && <p className="mt-1 font-sans text-xs text-muted">{sub}</p>}
    </div>
  );
}
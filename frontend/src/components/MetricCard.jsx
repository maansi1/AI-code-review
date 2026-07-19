export default function MetricCard({ label, value, unit, accent }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-wider text-muted mb-1.5">{label}</p>
      <p className="font-mono text-xl font-semibold tabular" style={{ color: accent || "#E8ECF1" }}>
        {value}
        {unit && <span className="text-xs text-muted ml-1">{unit}</span>}
      </p>
    </div>
  );
}

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SEVERITY_META, SEVERITY_ORDER } from "./severity";

export default function SeverityChart({ findings }) {
  const data = SEVERITY_ORDER.map((sev) => ({
    name: SEVERITY_META[sev].label,
    value: findings.filter((f) => f.severity === sev).length,
    color: SEVERITY_META[sev].color,
  }));

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted mb-3">Findings by severity</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: "#8895A7", fontSize: 11 }} axisLine={{ stroke: "#232F3D" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#8895A7", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{ background: "#171F2A", border: "1px solid #232F3D", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#E8ECF1" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

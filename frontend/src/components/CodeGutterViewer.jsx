import { useMemo, useState } from "react";
import { SEVERITY_META } from "./severity";

export default function CodeGutterViewer({ sourceCode, findings, activeFindingId, onSelectLine }) {
  const [hoveredLine, setHoveredLine] = useState(null);
  const lines = useMemo(() => (sourceCode || "").split("\n"), [sourceCode]);

  const findingsByLine = useMemo(() => {
    const map = new Map();
    for (const f of findings) {
      if (!f.lineNumber) continue;
      const list = map.get(f.lineNumber) || [];
      list.push(f);
      map.set(f.lineNumber, list);
    }
    return map;
  }, [findings]);

  function severityForLine(lineNum) {
    const found = findingsByLine.get(lineNum);
    if (!found || found.length === 0) return null;
    const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
    found.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
    return found[0];
  }

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden shadow-panel">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-700 bg-ink-800">
        <span className="font-mono text-xs text-muted">source · {lines.length} lines</span>
        <div className="flex items-center gap-3 text-[11px] text-muted">
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <span key={sev} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEVERITY_META[sev].color }} />
              {SEVERITY_META[sev].label}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-auto max-h-[560px] font-mono text-[13px] leading-6">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const finding = severityForLine(lineNum);
          const isActive = finding && activeFindingId && findingsByLine.get(lineNum)?.some((f) => f.id === activeFindingId);
          return (
            <div
              key={lineNum}
              onMouseEnter={() => setHoveredLine(lineNum)}
              onMouseLeave={() => setHoveredLine(null)}
              onClick={() => finding && onSelectLine?.(findingsByLine.get(lineNum))}
              className={`flex group ${finding ? "cursor-pointer" : ""} ${
                isActive ? "bg-ink-700/60" : hoveredLine === lineNum ? "bg-ink-800/70" : ""
              }`}
            >
              <div className="w-11 shrink-0 flex items-center justify-center relative">
                {finding && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: SEVERITY_META[finding.severity]?.color }}
                    title={finding.issue}
                  />
                )}
              </div>
              <div className="w-10 shrink-0 text-right pr-3 text-ink-600 select-none tabular">{lineNum}</div>
              <pre className="whitespace-pre-wrap break-all pr-4 text-paper/90 flex-1">{line || " "}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

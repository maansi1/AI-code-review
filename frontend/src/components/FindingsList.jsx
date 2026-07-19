import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { CATEGORY_LABELS, SEVERITY_META, SEVERITY_ORDER } from "./severity";

export default function FindingsList({ findings, activeId, onHoverFinding }) {
  const [openId, setOpenId] = useState(null);

  const sorted = [...findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-ink-700 bg-ink-900 p-8 text-center">
        <p className="text-signal-mint font-medium">No findings — clean pass.</p>
        <p className="text-sm text-muted mt-1">Nothing flagged by static analysis or the AI reviewer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((f) => {
        const meta = SEVERITY_META[f.severity] || SEVERITY_META.INFO;
        const isOpen = openId === f.id;
        return (
          <div
            key={f.id}
            id={`finding-${f.id}`}
            onMouseEnter={() => onHoverFinding?.(f.id)}
            className={`rounded-lg border bg-ink-900 transition-colors ${
              activeId === f.id ? "border-signal-lavender" : "border-ink-700"
            }`}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : f.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span
                className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.label}
              </span>
              <span className="text-xs text-muted font-mono">{CATEGORY_LABELS[f.category] || f.category}</span>
              {f.source === "AI" && (
                <span className="flex items-center gap-1 text-[11px] text-signal-lavender">
                  <Sparkles size={11} /> AI
                </span>
              )}
              {f.lineNumber && <span className="text-xs text-ink-600 font-mono ml-auto tabular">L{f.lineNumber}</span>}
              <ChevronDown
                size={16}
                className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""} ${f.lineNumber ? "" : "ml-auto"}`}
              />
            </button>
            <div className="px-4 pb-0.5">
              <p className="text-sm text-paper/90 font-medium -mt-1 mb-2">{f.issue}</p>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 space-y-2 border-t border-ink-700 pt-3 animate-fadeUp">
                {f.explanation && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted mb-1">Why it matters</p>
                    <p className="text-sm text-paper/80">{f.explanation}</p>
                  </div>
                )}
                {f.suggestion && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted mb-1">Suggested fix</p>
                    <p className="text-sm text-signal-mint/90">{f.suggestion}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export const SEVERITY_META = {
  CRITICAL: { label: "Critical", color: "#FF6B5B", bg: "rgba(255,107,91,0.12)" },
  HIGH: { label: "High", color: "#FF9466", bg: "rgba(255,148,102,0.12)" },
  MEDIUM: { label: "Medium", color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
  LOW: { label: "Low", color: "#5FB4E8", bg: "rgba(95,180,232,0.12)" },
  INFO: { label: "Info", color: "#8895A7", bg: "rgba(136,149,167,0.12)" },
};

export const CATEGORY_LABELS = {
  BUG: "Bug",
  SECURITY: "Security",
  CODE_SMELL: "Code smell",
  PERFORMANCE: "Performance",
  STYLE: "Style",
  AI_SUGGESTION: "AI suggestion",
};

export function scoreColor(score) {
  if (score >= 85) return "#4FD1A5";
  if (score >= 65) return "#F5A623";
  return "#FF6B5B";
}

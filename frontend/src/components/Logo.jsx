export default function Logo({ size = "default" }) {
  const textSize = size === "large" ? "text-2xl" : "text-lg";
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <rect x="2" y="2" width="20" height="20" rx="4" stroke="#FF6B5B" strokeWidth="1.6" />
        <path d="M7 8H13" stroke="#8895A7" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 12H17" stroke="#FF6B5B" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 16H11" stroke="#8895A7" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className={`font-mono font-semibold tracking-tight ${textSize}`}>
        redline
      </span>
    </div>
  );
}

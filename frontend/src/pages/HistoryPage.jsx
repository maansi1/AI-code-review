import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2, FileCode2 } from "lucide-react";
import { reviewService } from "../services/reviewService";
import { scoreColor } from "../components/severity";

export default function HistoryPage() {
  const [reviews, setReviews] = useState(null);
  const [query, setQuery] = useState("");

  async function load(q) {
    const data = await reviewService.listReviews(q);
    setReviews(data);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  async function handleDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this review?")) return;
    await reviewService.deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Review history</h1>
          <p className="text-sm text-muted mt-1">Every submission you've reviewed, searchable by project name.</p>
        </div>
      </header>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by project name…"
          className="input pl-9"
        />
      </div>

      {reviews === null ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-ink-700 border-t-signal-critical rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 py-16 text-center">
          <FileCode2 size={24} className="mx-auto text-muted mb-3" />
          <p className="text-paper/80">No reviews yet</p>
          <p className="text-sm text-muted mt-1">
            <Link to="/" className="text-signal-low hover:underline">
              Submit your first file
            </Link>{" "}
            to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Link
              key={r.id}
              to={`/reviews/${r.id}`}
              className="flex items-center gap-4 rounded-lg border border-ink-700 bg-ink-900 px-4 py-3.5 hover:border-ink-600 transition-colors group"
            >
              <div
                className="font-mono text-sm font-semibold w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2"
                style={{ color: scoreColor(r.reviewScore), borderColor: scoreColor(r.reviewScore) }}
              >
                {r.reviewScore}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.projectName}</p>
                <p className="text-xs text-muted mt-0.5">
                  {new Date(r.createdAt).toLocaleString()}
                  {r.criticalCount > 0 && (
                    <span className="text-signal-critical ml-2">{r.criticalCount} critical</span>
                  )}
                  {r.highCount > 0 && <span className="text-signal-high ml-2">{r.highCount} high</span>}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, r.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-signal-critical transition-all"
              >
                <Trash2 size={15} />
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

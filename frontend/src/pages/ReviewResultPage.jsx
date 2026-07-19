import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { reviewService } from "../services/reviewService";
import ScoreDial from "../components/ScoreDial";
import MetricCard from "../components/MetricCard";
import SeverityChart from "../components/SeverityChart";
import FindingsList from "../components/FindingsList";
import CodeGutterViewer from "../components/CodeGutterViewer";
import { scoreColor } from "../components/severity";

export default function ReviewResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [activeFindingId, setActiveFindingId] = useState(null);

  useEffect(() => {
    setReview(null);
    reviewService
      .getReview(id)
      .then(setReview)
      .catch(() => setError("Couldn't load this review."));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this review? This can't be undone.")) return;
    await reviewService.deleteReview(id);
    navigate("/history");
  }

  if (error) {
    return <div className="p-10 text-signal-critical">{error}</div>;
  }
  if (!review) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="w-6 h-6 border-2 border-ink-700 border-t-signal-critical rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/history")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-paper mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to history
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">{review.projectName}</h1>
          <p className="text-sm text-muted mt-1">
            Reviewed {new Date(review.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-signal-critical transition-colors px-3 py-1.5 rounded-md hover:bg-ink-800"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 mb-8">
        <div className="rounded-lg border border-ink-700 bg-ink-900 p-6 flex flex-col items-center justify-center">
          <ScoreDial score={review.reviewScore} />
          <p className="text-sm text-muted mt-3 text-center">{review.summary}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          <MetricCard label="Classes" value={review.classCount} />
          <MetricCard label="Methods" value={review.methodCount} />
          <MetricCard label="Lines of code" value={review.linesOfCode} />
          <MetricCard label="Avg method length" value={review.avgMethodLength} unit="lines" />
          <MetricCard
            label="Cyclomatic complexity"
            value={review.cyclomaticComplexity}
            accent={review.cyclomaticComplexity > 20 ? "#FF6B5B" : "#4FD1A5"}
          />
          <MetricCard
            label="Maintainability"
            value={review.maintainabilityIndex}
            unit="/ 100"
            accent={scoreColor(review.maintainabilityIndex)}
          />
        </div>
      </div>

      <div className="mb-6">
        <SeverityChart findings={review.findings} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted mb-3">Reviewed source</h2>
          <CodeGutterViewer
            sourceCode={review.sourceCode}
            findings={review.findings}
            activeFindingId={activeFindingId}
            onSelectLine={(lineFindings) => setActiveFindingId(lineFindings[0]?.id)}
          />
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted mb-3">
            Findings <span className="text-paper/60">({review.findings.length})</span>
          </h2>
          <FindingsList
            findings={review.findings}
            activeId={activeFindingId}
            onHoverFinding={setActiveFindingId}
          />
        </div>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, FileCode2, UploadCloud } from "lucide-react";
import { reviewService } from "../services/reviewService";

const SAMPLE = `public class PaymentProcessor {
    public String apiKey = "sk-test-12345";

    public void charge(int amount) {
        try {
            process(amount);
        } catch (Exception e) {
        }
    }

    private void process(int a) {
        int l = a * 2;
        System.out.println("processed: " + l);
    }
}
`;

export default function DashboardPage() {
  const [mode, setMode] = useState("paste");
  const [projectName, setProjectName] = useState("");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (mode === "paste" && !code.trim()) {
      setError("Paste some Java code first.");
      return;
    }
    if (mode === "file" && !file) {
      setError("Choose a .java file to upload.");
      return;
    }

    setLoading(true);
    try {
      let review;
      if (mode === "paste") {
        review = await reviewService.submitCode({
          projectName: projectName || "Untitled submission",
          sourceCode: code,
        });
      } else {
        review = await reviewService.uploadFile(file, projectName);
      }
      navigate(`/reviews/${review.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Review failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Submit code for review</h1>
        <p className="text-sm text-muted mt-1">
          Paste a snippet or upload a single <code className="font-mono text-paper/80">.java</code> file.
          You'll get a scored, line-annotated review in seconds.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1.5">Project name</label>
          <input
            className="input"
            placeholder="e.g. PaymentProcessor"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-ink-900 border border-ink-700 w-fit">
          {[
            { key: "paste", label: "Paste code", icon: FileCode2 },
            { key: "file", label: "Upload file", icon: UploadCloud },
          ].map(({ key, label, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() => setMode(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm rounded-md transition-colors ${
                mode === key ? "bg-ink-700 text-paper" : "text-muted hover:text-paper"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {mode === "paste" ? (
          <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-ink-700 bg-ink-800">
              <span className="text-xs font-mono text-muted">source.java</span>
              <button
                type="button"
                onClick={() => setCode(SAMPLE)}
                className="text-xs text-signal-low hover:underline"
              >
                Load sample
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your Java code here…"
              spellCheck={false}
              className="w-full h-80 bg-transparent p-4 font-mono text-[13px] leading-6 outline-none resize-none placeholder:text-ink-600"
            />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border-2 border-dashed border-ink-700 bg-ink-900 hover:border-signal-low transition-colors cursor-pointer flex flex-col items-center justify-center py-16 text-center"
          >
            <UploadCloud size={28} className="text-muted mb-3" />
            <p className="text-sm text-paper/80">
              {file ? file.name : "Click to choose a .java file"}
            </p>
            <p className="text-xs text-muted mt-1">Max 15MB, single file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".java"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-signal-critical bg-signal-critical/10 border border-signal-critical/30 rounded-md px-3 py-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-signal-critical text-ink-950 font-medium rounded-md py-2.5 text-sm hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Run review"}
        </button>
      </form>
    </div>
  );
}

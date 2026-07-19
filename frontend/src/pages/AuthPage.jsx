import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Bug, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.fieldErrors
          ? Object.values(err.response.data.fieldErrors)[0]
          : err.response?.data?.message || "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hero panel */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-900 border-r border-ink-700 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #E8ECF1 0, #E8ECF1 1px, transparent 1px, transparent 24px)",
          }}
        />
        <Logo size="large" />
        <div className="relative">
          <h1 className="text-4xl font-semibold leading-tight mb-4">
            Every line, <span className="text-signal-critical">reviewed</span> before it ships.
          </h1>
          <p className="text-muted text-base max-w-md leading-relaxed">
            Paste or upload Java source. Redline runs static analysis and an AI
            reviewer side by side, then marks every finding right in the margin
            — the way a senior engineer would redline a pull request.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: Bug, text: "Bug & code smell detection with cyclomatic complexity" },
              { icon: ShieldCheck, text: "Security checks: hardcoded secrets, unsafe patterns" },
              { icon: Sparkles, text: "AI-generated refactors, naming, and best-practice notes" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-paper/80">
                <Icon size={16} className="text-signal-medium shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted relative">Built for students, interview prep, and PR review.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="flex gap-1 mb-8 p-1 rounded-lg bg-ink-900 border border-ink-700 w-fit">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  mode === m ? "bg-ink-700 text-paper" : "text-muted hover:text-paper"
                }`}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-1">
            {mode === "login" ? "Welcome back" : "Start reviewing code"}
          </h2>
          <p className="text-sm text-muted mb-6">
            {mode === "login" ? "Sign in to view your review history." : "Free — no credit card, just Java."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input"
                  placeholder="Maansi"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="input"
                placeholder="At least 8 characters"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 text-sm text-signal-critical bg-signal-critical/10 border border-signal-critical/30 rounded-md px-3 py-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-signal-critical text-ink-950 font-medium rounded-md py-2.5 text-sm hover:brightness-110 transition disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}

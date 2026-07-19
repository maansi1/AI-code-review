import { useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [nameStatus, setNameStatus] = useState(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwStatus, setPwStatus] = useState(null);
  const [pwError, setPwError] = useState(null);

  async function handleNameSave(e) {
    e.preventDefault();
    setNameStatus("saving");
    try {
      const data = await authService.updateProfile({ name });
      updateLocalUser({ name: data.name });
      setNameStatus("saved");
      setTimeout(() => setNameStatus(null), 2000);
    } catch {
      setNameStatus(null);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwError(null);
    setPwStatus("saving");
    try {
      await authService.changePassword(pw);
      setPw({ currentPassword: "", newPassword: "" });
      setPwStatus("saved");
      setTimeout(() => setPwStatus(null), 2000);
    } catch (err) {
      setPwStatus(null);
      setPwError(err.response?.data?.message || "Couldn't update password.");
    }
  }

  return (
    <div className="px-8 py-10 max-w-lg mx-auto space-y-10">
      <header>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted mt-1">Manage your account details.</p>
      </header>

      <form onSubmit={handleNameSave} className="rounded-lg border border-ink-700 bg-ink-900 p-6 space-y-4">
        <h2 className="text-sm font-medium">Display name</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-ink-700 hover:bg-ink-600 text-paper text-sm rounded-md px-4 py-2 transition-colors"
          >
            Save
          </button>
          {nameStatus === "saved" && (
            <span className="flex items-center gap-1 text-signal-mint text-sm">
              <Check size={14} /> Saved
            </span>
          )}
        </div>
      </form>

      <form onSubmit={handlePasswordChange} className="rounded-lg border border-ink-700 bg-ink-900 p-6 space-y-4">
        <h2 className="text-sm font-medium">Change password</h2>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1.5">Current password</label>
          <input
            type="password"
            required
            className="input"
            value={pw.currentPassword}
            onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted mb-1.5">New password</label>
          <input
            type="password"
            required
            minLength={8}
            className="input"
            value={pw.newPassword}
            onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
          />
        </div>
        {pwError && <p className="text-sm text-signal-critical">{pwError}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-ink-700 hover:bg-ink-600 text-paper text-sm rounded-md px-4 py-2 transition-colors"
          >
            Update password
          </button>
          {pwStatus === "saved" && (
            <span className="flex items-center gap-1 text-signal-mint text-sm">
              <Check size={14} /> Updated
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

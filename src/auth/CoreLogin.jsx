import { useState } from "react";
import { useLocation } from "react-router-dom";

/** -core sign-in — LDAP-backed, per docs/IPF_DEVGUIDE.md §5a. Shown by RequireRole whenever a
 * gated screen is reached without a session; on success it calls onSignedIn (re-checks /me) rather
 * than navigating anywhere, so the caller just re-renders into whatever screen was actually
 * requested — no separate post-login redirect logic to keep in sync with the route table.
 *
 * Google sign-in passes returnTo = the hash path the user was trying to open, so after OAuth they
 * land back on Workbench / Assist Me (etc.) instead of always dumping onto Apply (handoff §9). */
export default function CoreLogin({ onSignedIn }) {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");
  const location = useLocation();

  const googleReturnTo = `${location.pathname}${location.search || ""}`;
  const googleStartHref = `/api/auth/google/start?returnTo=${encodeURIComponent(
    googleReturnTo.startsWith("/") ? `#${googleReturnTo}` : googleReturnTo
  )}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/auth/core-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign-in failed");
      onSignedIn();
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 340, margin: "80px auto", padding: 24, fontFamily: "-apple-system, sans-serif" }}>
      <div style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0891b2", marginBottom: 8 }}>
        Core team sign-in
      </div>
      <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Sign in</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b", lineHeight: 1.45 }}>
        Product Design, ID, CD, and other ops screens use this login — not the job-seeker Apply landing.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          Username
          <input required value={uid} onChange={(e) => setUid(e.target.value)} placeholder="priya_sharma" style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          Password
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </label>
        <button type="submit" disabled={status === "loading"} style={buttonStyle}>
          {status === "loading" ? "Signing in…" : "Sign in"}
        </button>
        {error && <div style={{ color: "#991b1b", fontSize: 13 }}>{error}</div>}
      </form>
      <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: 10, color: "#cbd5e1", fontSize: 12 }}>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        or
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      <a
        href={googleStartHref}
        style={{ ...buttonStyle, display: "block", textAlign: "center", textDecoration: "none", background: "#fff", color: "#334155", border: "1px solid #cbd5e1" }}
      >
        Sign in with Google (job seekers)
      </a>
      <p style={{ marginTop: 20, fontSize: 12, color: "#94a3b8" }}>
        Applying for the first time? <a href="#/apply">Go to Apply</a> instead — no account needed there.
      </p>
    </div>
  );
}

const inputStyle = { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14 };
const buttonStyle = {
  padding: "9px 14px",
  background: "#0891b2",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

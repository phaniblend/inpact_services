import { useState } from "react";
import {
  getBalanceCents,
  addFundsCents,
  FUND_BUCKETS_CENTS,
  TOTAL_FREE_LESSONS,
  PRICE_PER_LESSON_CENTS,
  STUDENT_PRICE_PER_LESSON_CENTS,
  qualifiesForStudentPricing,
  isEduEmail,
} from "./lessonAccess.js";
import { isSupabaseConfigured, sendStudentEduMagicLink } from "./supabase.js";

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  fontFamily: "'DM Sans', sans-serif",
};
const card = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "28px 32px",
  maxWidth: "420px",
  width: "90%",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};
const title = { fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "8px" };
const sub = { fontSize: "13px", color: "#64748b", marginBottom: "16px", lineHeight: 1.5 };
const balance = { fontSize: "14px", fontWeight: 600, color: "#00d4ff", marginBottom: "16px" };
const btn = (primary) => ({
  padding: "10px 20px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  background: primary ? "#00d4ff" : "transparent",
  color: primary ? "#052545" : "#0f172a",
  border: primary ? "none" : "1px solid #0f172a",
  marginRight: "8px",
  marginBottom: "8px",
});

export default function AddFundsModal({ user = null, onDone }) {
  const [balanceCents, setBalanceCents] = useState(getBalanceCents());
  const [eduEmail, setEduEmail] = useState("");
  const [magicStatus, setMagicStatus] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);

  const studentActive = qualifiesForStudentPricing(user);
  const price = studentActive ? STUDENT_PRICE_PER_LESSON_CENTS : PRICE_PER_LESSON_CENTS;

  const refresh = () => {
    setBalanceCents(getBalanceCents());
  };

  const add = (cents) => {
    addFundsCents(cents);
    refresh();
  };

  const sendMagic = async (e) => {
    e?.preventDefault?.();
    setMagicStatus("");
    const em = eduEmail.trim();
    if (!em) {
      setMagicStatus("Enter your school email.");
      return;
    }
    if (!isEduEmail(em)) {
      setMagicStatus("Only addresses ending in .edu can receive the student magic link.");
      return;
    }
    setMagicLoading(true);
    try {
      await sendStudentEduMagicLink(em);
      setMagicStatus("Check your inbox for the sign-in link. Open it in this browser to unlock the student rate.");
    } catch (err) {
      setMagicStatus(err?.message || "Could not send email.");
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onDone?.()}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={title}>Add funds</div>
        <div style={sub}>
          Your first {TOTAL_FREE_LESSONS} lessons in this browser are included. After that, each new lesson is{" "}
          <strong>${(PRICE_PER_LESSON_CENTS / 100).toFixed(2)}</strong> standard, or{" "}
          <strong>${(STUDENT_PRICE_PER_LESSON_CENTS / 100).toFixed(2)}</strong> when you&apos;re signed in with a{" "}
          <strong>.edu</strong> email (Google sign-in with school Google works too). Load a bucket to continue — real
          payments when we wire the processor.
        </div>

        {studentActive ? (
          <div
            style={{
              fontSize: "13px",
              color: "#065f46",
              background: "#d1fae5",
              border: "1px solid #6ee7b7",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "14px",
              lineHeight: 1.5,
            }}
          >
            <strong>Student rate active</strong> — your account email ends in <strong>.edu</strong>, so paid lessons
            use <strong>${(STUDENT_PRICE_PER_LESSON_CENTS / 100).toFixed(2)}</strong> each.
          </div>
        ) : (
          <div
            style={{
              fontSize: "13px",
              color: "#334155",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "14px",
              lineHeight: 1.5,
            }}
          >
            <strong>Unlock student pricing with .edu</strong>
            <p style={{ margin: "8px 0 0", color: "#64748b" }}>
              We only send a magic link to a <strong>.edu</strong> address. After you click the link in email, sign in
              again so your session email is that .edu address.
            </p>
            {!isSupabaseConfigured ? (
              <p style={{ margin: "8px 0 0", color: "#b45309" }}>
                Student .edu verification is not available on this install yet.
              </p>
            ) : (
              <form onSubmit={sendMagic} style={{ marginTop: "12px" }}>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@university.edu"
                  value={eduEmail}
                  onChange={(e) => setEduEmail(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                />
                <button type="submit" style={{ ...btn(true), width: "100%", marginBottom: 0 }} disabled={magicLoading}>
                  {magicLoading ? "Sending…" : "Email me a magic link"}
                </button>
                {magicStatus ? (
                  <p style={{ margin: "10px 0 0", fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>{magicStatus}</p>
                ) : null}
              </form>
            )}
          </div>
        )}

        <div style={balance}>
          Balance: ${(balanceCents / 100).toFixed(2)}
          <span style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#64748b", marginTop: "6px" }}>
            Next lesson unlock (your rate):{" "}
            <strong style={{ color: "#0f172a" }}>${(price / 100).toFixed(2)}</strong>
            {!studentActive && (
              <span style={{ display: "block", marginTop: "4px" }}>
                (Standard until you&apos;re on a .edu session — see above.)
              </span>
            )}
          </span>
        </div>
        <div>
          {FUND_BUCKETS_CENTS.map((cents) => (
            <button key={cents} type="button" style={btn(true)} onClick={() => add(cents)}>
              +${(cents / 100).toFixed(0)}
            </button>
          ))}
        </div>
        <button type="button" style={{ ...btn(false), marginTop: "16px" }} onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}

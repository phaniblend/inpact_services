import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLessonActivity, isSupabaseConfigured, isSupabaseAuthUserId } from "./supabase.js";
import { getAppUsageSeconds } from "./appUsageTime.js";
import { TRACK_LABELS } from "../trackLessonCounts.js";
import { buildLessonPath } from "./redirectPath.js";
import { LEARNER_FOCUS_TRACK } from "./learnerFocus.js";

function formatDuration(totalSeconds) {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const m = Math.floor(totalSeconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

export default function UserDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState(/** @type {any[]} */ ([]));
  const [appSeconds, setAppSeconds] = useState(0);

  const load = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured || !isSupabaseAuthUserId(user.id)) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getLessonActivity(user.id);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Could not load progress.");
      setRows([]);
    } finally {
      setLoading(false);
    }
    setAppSeconds(getAppUsageSeconds(user.id));
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user?.id) return undefined;
    const id = setInterval(() => setAppSeconds(getAppUsageSeconds(user.id)), 15000);
    return () => clearInterval(id);
  }, [user?.id]);

  const tsRows = rows.filter((r) => r.track === LEARNER_FOCUS_TRACK);
  const completed = tsRows.filter((r) => r.completed_at);
  const inProgress = tsRows.filter((r) => !r.completed_at);
  const lessonSeconds = tsRows.reduce((acc, r) => acc + (Number(r.time_spent_seconds) || 0), 0);

  const goToLesson = (lessonIndex) => {
    navigate(buildLessonPath(LEARNER_FOCUS_TRACK, lessonIndex));
  };

  if (!user?.id) {
    return (
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px", fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ color: "#64748b", fontSize: "15px" }}>Log in to see your dashboard and saved lesson progress.</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inpact-btn-primary"
          style={{
            marginTop: "16px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#00d4ff",
            color: "#052545",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Back to lessons
        </button>
      </div>
    );
  }

  const listStyle = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };
  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 14px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    flexWrap: "wrap",
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "32px 24px 64px",
        fontFamily: "'DM Sans', sans-serif",
        color: "#0f172a",
      }}
    >
      <p style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#64748b", fontWeight: 600, marginBottom: "8px" }}>
        YOUR PROGRESS
      </p>
      <h1 style={{ fontSize: "clamp(1.35rem, 3vw, 1.75rem)", fontWeight: 700, margin: "0 0 8px" }}>Dashboard</h1>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px", lineHeight: 1.5 }}>
        <strong style={{ color: "#0f172a" }}>{TRACK_LABELS[LEARNER_FOCUS_TRACK]}</strong> only — other tracks are hidden here for now.
      </p>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px", lineHeight: 1.5 }}>
        Signed in as <strong style={{ color: "#0f172a" }}>{user.emailOrPhone || user.name}</strong>. Progress syncs when you open and finish lessons on this account.
      </p>

      {!isSupabaseConfigured ? (
        <p style={{ color: "#b45309", fontSize: "14px" }}>Progress backup is unavailable right now.</p>
      ) : null}
      {isSupabaseConfigured && user?.id && !isSupabaseAuthUserId(user.id) ? (
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px", lineHeight: 1.55 }}>
          You’re signed in with Google on this device. Detailed lesson history in this dashboard syncs with email
          accounts for now; yours will show here once that link is enabled, or you can add the same email via&nbsp;
          <strong>Log in</strong> to sync progress in the cloud.
        </p>
      ) : null}

      {error ? (
        <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {[
          { label: "Completed lessons", value: loading ? "…" : String(completed.length) },
          { label: "In progress", value: loading ? "…" : String(inProgress.length) },
          { label: "Time in lessons", value: loading ? "…" : formatDuration(lessonSeconds) },
          { label: "Time on app (this device)", value: formatDuration(appSeconds) },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#052545" }}>{card.value}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", fontWeight: 600 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <section style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>In progress</h2>
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading…</p>
        ) : inProgress.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>No active lessons. Open a lesson from the catalog to start.</p>
        ) : (
          <ul style={listStyle}>
            {inProgress.map((r) => (
              <li key={`${r.track}-${r.lesson_index}`} style={rowStyle}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{r.lesson_title || `Lesson ${Number(r.lesson_index) + 1}`}</div>
                </div>
                <button
                  type="button"
                  onClick={() => goToLesson(r.lesson_index)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #334155",
                    background: "#fff",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Continue
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Completed</h2>
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading…</p>
        ) : completed.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Complete a lesson to see it here.</p>
        ) : (
          <ul style={listStyle}>
            {[...completed]
              .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
              .map((r) => (
                <li key={`${r.track}-${r.lesson_index}-done`} style={rowStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{r.lesson_title || `Lesson ${Number(r.lesson_index) + 1}`}</div>
                    {r.time_spent_seconds ? (
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        {formatDuration(Number(r.time_spent_seconds))}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToLesson(r.lesson_index)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Review
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "40px", lineHeight: 1.5 }}>
        “Time on app” is tracked on this browser while you’re logged in and the tab is visible. Lesson time is recorded when you finish a step-based React · TS lesson.
      </p>
    </div>
  );
}

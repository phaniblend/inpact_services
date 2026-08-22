/**
 * Mentor-led algorithm lesson: step-through UI using /api/mentor/start and /api/mentor/next.
 * Renders mentorSays, example, and choices; continues until done.
 */

import { useState, useEffect, useCallback } from "react";

const API = "/api/mentor";

export default function LearnAlgoPage({ lessonId, lessonTitle, onBackToLessons }) {
  const [step, setStep] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sendNext = useCallback(
    (currentStepId, choiceLabel = null) => {
      setLoading(true);
      setError(null);
      fetch(`${API}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          currentStepId,
          ...(choiceLabel != null && { choiceLabel }),
        }),
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.done) {
            setDone(true);
            setStep(null);
          } else if (data.step) {
            setStep(data.step);
          }
        })
        .catch((err) => setError(err.message || "Failed to advance"))
        .finally(() => setLoading(false));
    },
    [lessonId]
  );

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    setDone(false);
    setStep(null);
    fetch(`${API}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.step) setStep(data.step);
        else setError("No step returned");
      })
      .catch((err) => setError(err.message || "Failed to start lesson"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const wrapStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "'DM Sans', sans-serif",
    padding: "24px",
    boxSizing: "border-box",
  };
  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e2e8f0",
  };
  const cardStyle = {
    maxWidth: "720px",
    margin: "0 auto 24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "28px 32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };
  const mentorSaysStyle = {
    fontSize: "16px",
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
    marginBottom: "20px",
  };
  const exampleStyle = {
    background: "rgb(5, 37, 67)",
    color: "#e2e8f0",
    padding: "16px 20px",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "13px",
    whiteSpace: "pre-wrap",
    marginBottom: "20px",
    borderLeft: "4px solid #00d4ff",
  };
  const choicesWrap = { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" };
  const btnBase = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #0f172a",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  };
  const btnPrimary = { ...btnBase, background: "#00d4ff", borderColor: "#00d4ff", color: "#052545" };

  if (error) {
    return (
      <div style={wrapStyle}>
        <div style={headerStyle}>
          <button type="button" style={btnPrimary} onClick={onBackToLessons}>
            ← All Lessons
          </button>
          <span style={{ fontSize: "14px", color: "#64748b" }}>{lessonTitle || lessonId}</span>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "#dc2626" }}>{error}</p>
          <button type="button" style={btnPrimary} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={wrapStyle}>
        <div style={headerStyle}>
          <button type="button" style={btnPrimary} onClick={onBackToLessons}>
            ← All Lessons
          </button>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginBottom: "12px", color: "#0f172a" }}>Lesson complete</h2>
          <p style={{ marginBottom: "20px", color: "#64748b" }}>You’ve finished this lesson.</p>
          <button type="button" style={btnPrimary} onClick={onBackToLessons}>
            Back to Algorithms
          </button>
        </div>
      </div>
    );
  }

  if (loading && !step) {
    return (
      <div style={wrapStyle}>
        <div style={headerStyle}>
          <button type="button" style={btnPrimary} onClick={onBackToLessons}>
            ← All Lessons
          </button>
        </div>
        <div style={{ ...cardStyle, textAlign: "center", color: "#64748b" }}>Loading lesson…</div>
      </div>
    );
  }

  if (!step) {
    return null;
  }

  return (
    <div style={wrapStyle}>
      <div style={headerStyle}>
        <button type="button" style={btnPrimary} onClick={onBackToLessons}>
          ← All Lessons
        </button>
        <span style={{ fontSize: "14px", color: "#64748b" }}>{lessonTitle || lessonId}</span>
      </div>

      <div style={cardStyle}>
        {step.mentorSays && <div style={mentorSaysStyle}>{step.mentorSays}</div>}
        {step.example && <pre style={exampleStyle}>{step.example}</pre>}

        {step.choices && step.choices.length > 0 && (
          <div style={choicesWrap}>
            {step.choices.map((c, i) => (
              <button
                key={i}
                type="button"
                style={btnBase}
                onClick={() => sendNext(step.stepId, c.label)}
                disabled={loading}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {(step.action === "continue" || (!step.choices?.length && step.next)) && (
          <div style={{ marginTop: "24px" }}>
            <button
              type="button"
              style={btnPrimary}
              onClick={() => sendNext(step.stepId)}
              disabled={loading}
            >
              {loading ? "…" : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

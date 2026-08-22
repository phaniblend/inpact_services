/**
 * Algorithm lesson taught by the same INPACT engine as React-JS.
 * Fetches lesson JSON from GET /api/mentor/lesson/:id, converts flow → NODES via mentorToEngineAdapter,
 * then renders createINPACTEngine so the UI and step-through match other tracks.
 */

import { useState, useEffect, useMemo } from "react";
import createINPACTEngine from "../engines/inpact_engine_shared.jsx";
import { mentorFlowToEngineConfig } from "./mentorToEngineAdapter.js";

const wrapStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  color: "#0f172a",
  fontFamily: "'DM Sans', sans-serif",
  padding: "48px",
};

export default function AlgoEngine({ lessonId, lessonTitle, onNextLesson }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    setLesson(null);
    fetch(`/api/mentor/lesson/${encodeURIComponent(lessonId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Lesson not found" : "Failed to load lesson");
        return r.json();
      })
      .then(setLesson)
      .catch((e) => setError(e.message || "Failed to load lesson"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const engineConfig = useMemo(() => {
    if (!lesson) return null;
    const { NODES, sideItems } = mentorFlowToEngineConfig(lesson);
    return {
      NODES,
      sideItems,
      lessonNum: 1,
      title: lesson.title || lessonTitle,
      shortName: lesson.id || lessonId,
    };
  }, [lesson, lessonTitle, lessonId]);

  const Engine = useMemo(() => {
    if (!engineConfig) return null;
    return createINPACTEngine(engineConfig);
  }, [engineConfig]);

  if (loading) {
    return (
      <div style={wrapStyle}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>Loading lesson…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={wrapStyle}>
        <p style={{ fontSize: "14px", color: "#b91c1c", marginBottom: "16px" }}>{error}</p>
      </div>
    );
  }
  if (!Engine) return null;

  return <Engine onNextLesson={onNextLesson} />;
}

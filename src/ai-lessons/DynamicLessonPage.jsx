/**
 * Dynamic lesson entry — AI-generated intro (overview + why it matters) → AI-generated LOs → code steps.
 * First screen: lesson overview and "Why it matters" from AI. Second: learning objectives from AI. Then the engine (steps only).
 */

import { useState, useEffect, useMemo } from "react";
import { generateLessonIntro, generateLessonObjectives, generateLesson } from "./services/lessonOrchestrator.js";
import { aiLessonToEngineConfig } from "./adapters/normalizeToEngineConfig.js";
import createINPACTEngine from "../engines/inpact_engine_shared.jsx";
import RichLearnerText from "../engines/RichLearnerText.jsx";
import DeepDiveModal from "../engines/DeepDiveModal.jsx";
import DeepDiveImageButton from "../engines/DeepDiveImageButton.jsx";
import { fetchLessonCodeValidation } from "./clientLessonValidation.js";
import { lessonApiUrl } from "./lessonApiUrl.js";
import { getIntroDeepDiveConcept } from "../learn/conceptGlossary.js";

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
  paddingTop: "52px",
  boxSizing: "border-box",
};

/** Left offset so lesson content clears header and aligns with blue border (no overlap with "← All Lessons" / track). */
const CONTENT_LEFT_OFFSET = "125px";

/** Phase: loading intro → intro (AI) → objectives (AI) → lesson (engine, steps only). */
export default function DynamicLessonPage({
  track,
  lessonTitle,
  lessonIndex,
  onBackToLessons,
  onNextLesson,
  onLessonComplete,
  onFallbackToLocal,
}) {
  const [phase, setPhase] = useState("loading");
  const [intro, setIntro] = useState(/** @type {{ tag?: string, title: string, body: string, usecase?: string } | null} */ (null));
  const [objectives, setObjectives] = useState(/** @type {string[]} */ ([]));
  const [objectivesLeadIn, setObjectivesLeadIn] = useState("After completing this lesson, you will be able to:");
  const [introError, setIntroError] = useState("");
  const [objectivesLoading, setObjectivesLoading] = useState(false);
  const [objectivesError, setObjectivesError] = useState("");
  const [config, setConfig] = useState(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullError, setFullError] = useState("");
  const [source, setSource] = useState(/** @type {'real'|'mock'|null} */ (null));
  const [fallbackReason, setFallbackReason] = useState("");
  const [deepDiveConcept, setDeepDiveConcept] = useState(null);

  const params = useMemo(() => ({ track, lessonTitle, lessonIndex }), [track, lessonTitle, lessonIndex]);

  const introDeepDiveConcept = useMemo(
    () =>
      getIntroDeepDiveConcept(
        track,
        lessonIndex != null ? lessonIndex + 1 : null,
        lessonTitle || intro?.title
      ),
    [track, lessonIndex, lessonTitle, intro?.title]
  );

  // When user navigates to a different lesson (e.g. Next Lesson), reset all state so we don't show the previous lesson's content
  useEffect(() => {
    setPhase("loading");
    setIntro(null);
    setObjectives([]);
    setObjectivesLeadIn("After completing this lesson, you will be able to:");
    setConfig(null);
    setIntroError("");
    setObjectivesError("");
    setFullError("");
    setDeepDiveConcept(null);
  }, [params.track, params.lessonTitle, params.lessonIndex]);

  // Call 1: AI intro (lesson overview + why it matters) — first screen
  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    setIntro(null);
    setIntroError("");
    generateLessonIntro(params)
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.intro) {
          setIntro(result.intro);
          setPhase("intro");
        } else {
          setIntroError(result.error || "Could not load lesson overview");
        }
      })
      .catch((err) => {
        if (!cancelled) setIntroError(err?.message || "Failed to load intro");
      });
    return () => { cancelled = true; };
  }, [params.track, params.lessonTitle, params.lessonIndex]);

  // Call 2: when user continues to objectives — AI learning objectives
  useEffect(() => {
    if (phase !== "objectives" || objectives.length > 0) return;
    let cancelled = false;
    setObjectivesLoading(true);
    setObjectivesError("");
    generateLessonObjectives(params)
      .then((result) => {
        if (cancelled) return;
        if (result.success && Array.isArray(result.objectives)) {
          setObjectives(result.objectives);
          if (result.leadIn) setObjectivesLeadIn(result.leadIn);
        } else {
          setObjectivesError(result.error || "Could not load objectives");
        }
      })
      .catch((err) => {
        if (!cancelled) setObjectivesError(err?.message || "Objectives failed");
      })
      .finally(() => {
        if (!cancelled) setObjectivesLoading(false);
      });
    return () => { cancelled = true; };
  }, [phase, params.track, params.lessonTitle, params.lessonIndex]);

  // Call 3: full lesson (for engine). Start when user reaches objectives screen.
  useEffect(() => {
    if (phase !== "objectives") return;
    setFullLoading(true);
    setFullError("");
    generateLesson(params)
      .then((result) => {
        if (result.success) {
          setConfig(result.config);
          setSource(result.source ?? "mock");
          setFallbackReason(result.fallbackReason ?? "");
        } else {
          setFullError(result.error || "Could not load lesson");
        }
      })
      .catch((err) => setFullError(err?.message || String(err)))
      .finally(() => setFullLoading(false));
  }, [phase, params.track, params.lessonTitle, params.lessonIndex]);

  const engineConfig = useMemo(() => {
    if (!config) return null;
    const base = aiLessonToEngineConfig(config, {
      track,
      language:
        track === "angular" || track === "mobile-angular" || track?.includes("ts")
          ? "typescript"
          : "javascript",
      skipIntroAndObjectives: true,
      lessonNumFallback:
        params.lessonIndex != null && params.lessonIndex >= 0 ? params.lessonIndex + 1 : undefined,
    });
    const withIntroAndObjectives = {
      ...base,
      intro: config.intro ?? intro ?? null,
      objectives: config.objectives ?? objectives ?? [],
    };
    const lessonKey = `${track ?? ""}:${params.lessonTitle ?? ""}:${params.lessonIndex ?? ""}`;
    const onAskMentor = async (node, userMessage) => {
      const res = await fetch(lessonApiUrl("/api/lessons/mentor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: {
            id: node.id,
            instruction: node.paal,
            paal: node.paal,
          },
          userMessage: String(userMessage).trim(),
          track: track ?? undefined,
          lessonKey,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || res.statusText || "Mentor unavailable");
      }
      const data = await res.json();
      return data.reply ?? "";
    };
    if (base.validateWithAI === false) {
      return { ...withIntroAndObjectives, lessonKey, onAskMentor };
    }
    return {
      ...withIntroAndObjectives,
      lessonKey,
      onValidateCode: async (node, userCode) =>
        fetchLessonCodeValidation({
          track: track ?? "javascript",
          node,
          userCode,
          language: base.language || "javascript",
        }),
      onAskMentor,
    };
  }, [config, track, intro, objectives, params.lessonTitle, params.lessonIndex]);

  const Engine = useMemo(() => (engineConfig ? createINPACTEngine(engineConfig) : null), [engineConfig]);

  const canStartLesson = phase === "objectives" && config !== null;

  // ——— Phase: lesson (engine, steps only) ———
  if (phase === "lesson" && Engine) {
    return (
      <>
        {source === "mock" && (
          <div style={{ padding: "6px 12px", fontSize: "11px", color: "#64748b", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
            Real AI unavailable{fallbackReason ? `: ${fallbackReason}. ` : " — "}Using backup lesson. Run <code style={{ background: "#e2e8f0", padding: "0 4px" }}>npm run server</code> and restart.
          </div>
        )}
        <Engine
          onNextLesson={onNextLesson}
          onBackToLessons={onBackToLessons}
          onLessonComplete={onLessonComplete}
        />
      </>
    );
  }

  // ——— Phase: objectives (AI-generated LOs) ———
  if (phase === "objectives") {
    return (
      <>
      <div style={{ ...wrapStyle, width: "100%", boxSizing: "border-box", display: "block", paddingLeft: CONTENT_LEFT_OFFSET, paddingRight: "48px" }}>
        <div style={{ maxWidth: "840px", marginLeft: 0, marginRight: "auto", position: "relative", textAlign: "left", width: "100%", paddingLeft: "140px", boxSizing: "border-box" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#0f172a", marginBottom: "12px" }}>
          Learning objectives
        </h1>
        {objectives.length > 0 && (
          <p style={{ fontSize: "15px", color: "#0f172a", marginBottom: "20px", lineHeight: 1.5 }}>
            {objectivesLeadIn}
          </p>
        )}
        {objectivesLoading && objectives.length === 0 && (
          <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "24px" }}>Loading objectives…</p>
        )}
        {objectivesError && objectives.length === 0 && !objectivesLoading && (
          <p style={{ fontSize: "14px", color: "#ef4444", marginBottom: "24px" }}>{objectivesError}</p>
        )}
        {objectives.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", textAlign: "left" }}>
            {objectives.map((obj, i) => (
              <li key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9", fontSize: "15px", color: "#0f172a", display: "flex", gap: "12px" }}>
                <span style={{ color: "#00d4ff", fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>
                <RichLearnerText as="span" text={obj} style={{ display: "inline", flex: 1 }} />
              </li>
            ))}
          </ul>
        )}
        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
          {fullLoading ? "Preparing your steps…" : fullError ? "Something went wrong loading steps. You can try starting anyway or go back." : "You're all set. Start when you're ready."}
        </p>
        {introDeepDiveConcept ? (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#00d4ff", marginBottom: "8px", fontWeight: 600 }}>CONCEPT GUIDE</div>
            <DeepDiveImageButton
              onClick={() => setDeepDiveConcept(introDeepDiveConcept)}
              title={`Open concept guide: ${introDeepDiveConcept.label || introDeepDiveConcept.id}`}
            />
          </div>
        ) : null}
        <button
          type="button"
          className="inpact-btn-primary"
          onClick={() => setPhase("lesson")}
          disabled={!canStartLesson}
          style={{
            padding: "12px 28px",
            borderRadius: "8px",
            border: "none",
            background: canStartLesson ? "#00d4ff" : "#e2e8f0",
            color: canStartLesson ? "#052545" : "#94a3b8",
            fontWeight: 600,
            fontSize: "14px",
            cursor: canStartLesson ? "pointer" : "not-allowed",
          }}
        >
          Start building
        </button>
        </div>
      </div>
      <DeepDiveModal open={Boolean(deepDiveConcept)} onClose={() => setDeepDiveConcept(null)} concept={deepDiveConcept} />
      </>
    );
  }

  // ——— Phase: loading intro ———
  if (phase === "loading" && !intro) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
        <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>Loading your lesson…</p>
      </div>
    );
  }

  if (introError && !intro) {
    return (
      <div style={{ ...wrapStyle, width: "100%", boxSizing: "border-box", display: "block" }}>
        <div style={{ maxWidth: "840px", margin: "0 auto", position: "relative", width: "100%" }}>
          <p style={{ fontSize: "15px", color: "#ef4444", marginBottom: "16px" }}>{introError}</p>
        </div>
      </div>
    );
  }

  // ——— Phase: intro (AI lesson overview + why it matters) ———
  // Lesson number comes from the clicked lesson index so it's always correct (e.g. 5th lesson → LESSON #5).
  const introLessonTag = `LESSON #${(lessonIndex ?? 0) + 1}`;
  if (phase === "intro" && intro) {
    return (
      <>
      <div style={{ ...wrapStyle, width: "100%", boxSizing: "border-box", display: "block", paddingLeft: CONTENT_LEFT_OFFSET, paddingRight: "48px" }}>
        <div style={{ maxWidth: "840px", marginLeft: 0, marginRight: "auto", position: "relative", textAlign: "left", width: "100%", paddingLeft: "140px", boxSizing: "border-box" }}>
        <p style={{ fontSize: "12px", color: "#00d4ff", letterSpacing: "0.12em", marginBottom: "12px" }}>
          {introLessonTag}
        </p>
        <h1 style={{ fontSize: "26px", fontWeight: 600, color: "#0f172a", marginBottom: "16px", lineHeight: 1.3 }}>
          {intro.title ?? lessonTitle}
        </h1>
        {introDeepDiveConcept ? (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#00d4ff", marginBottom: "8px", fontWeight: 600 }}>CONCEPT GUIDE</div>
            <DeepDiveImageButton
              onClick={() => setDeepDiveConcept(introDeepDiveConcept)}
              title={`Open concept guide: ${introDeepDiveConcept.label || introDeepDiveConcept.id}`}
            />
          </div>
        ) : null}
        {intro.body && (
          <RichLearnerText
            text={intro.body}
            style={{ fontSize: "15px", color: "#0f172a", lineHeight: 1.6, marginBottom: "20px" }}
          />
        )}
        {intro.usecase && (
          <div style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "32px", paddingLeft: "12px", borderLeft: "3px solid #00d4ff" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#00d4ff", marginBottom: "8px" }}>WHY IT MATTERS</div>
            <RichLearnerText as="span" text={intro.usecase} variant="muted" style={{ display: "inline" }} />
          </div>
        )}
        <button
          type="button"
          className="inpact-btn-primary"
          onClick={() => setPhase("objectives")}
          style={{
            padding: "12px 28px",
            borderRadius: "8px",
            border: "none",
            background: "#00d4ff",
            color: "#052545",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Continue to learning objectives
        </button>
        </div>
      </div>
      <DeepDiveModal open={Boolean(deepDiveConcept)} onClose={() => setDeepDiveConcept(null)} concept={deepDiveConcept} />
      </>
    );
  }

  return null;
}

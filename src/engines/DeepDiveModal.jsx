import { useEffect, useCallback } from "react";
import RichLearnerText from "./RichLearnerText";

const sectionStyle = {
  marginBottom: "22px",
};
const labelStyle = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  color: "#0891b2",
  marginBottom: "8px",
  textTransform: "uppercase",
};
const thinkLabelStyle = {
  ...labelStyle,
  color: "#7c2d12",
};
const bodyStyle = {
  fontSize: "14px",
  color: "#334155",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

function Section({ title, emoji, text, showLabel = false, emphasize = false }) {
  if (!text || !String(text).trim()) return null;
  return (
    <div
      style={
        emphasize
          ? {
              ...sectionStyle,
              padding: "12px 14px",
              border: "1px solid #fdba74",
              borderLeft: "4px solid #f97316",
              borderRadius: "10px",
              background: "#fff7ed",
            }
          : sectionStyle
      }
    >
      {showLabel ? (
        <div style={emphasize ? thinkLabelStyle : labelStyle}>
          {emoji ? `${emoji} ` : ""}
          {title}
        </div>
      ) : null}
      <RichLearnerText text={String(text)} style={bodyStyle} variant="task" contentMode="blocks" />
    </div>
  );
}

/**
 * PAAL-style deep-dive for a single glossary concept (first introduction).
 * @param {{ open: boolean, onClose: () => void, concept: { label?: string, deepDive?: Record<string, string> } | null }} props
 */
export default function DeepDiveModal({ open, onClose, concept }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return undefined;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  if (!open || !concept?.deepDive) return null;

  const dd = concept.deepDive;
  const title = concept.label || "Deep dive";

  // Some deep-dive entries embed an SVG “illustration” inside dd.hook.
  // We want that illustration to appear right before the Pattern section (inside dd.discover),
  // not above the rest of the explanation.
  let adjustedHook = dd.hook;
  let adjustedDiscover = dd.discover;
  if (typeof dd?.hook === "string" && typeof dd?.discover === "string") {
    const hookText = dd.hook;
    // Extract a leading <svg>...</svg> (optionally preceded/followed by whitespace/newlines).
    const m = hookText.match(/^\s*(<svg[\s\S]*?<\/svg>)(\s*\n\n|\s*\n|\s*)/);
    if (m) {
      const svg = m[1];
      const rest = hookText.slice(m[0].length);
      // Keep hook readable by trimming only leading whitespace.
      adjustedHook = rest.trimStart();
      adjustedDiscover = `${svg}\n\n${dd.discover}`;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 11050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.55)",
        padding: "20px",
        boxSizing: "border-box",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inpact-deep-dive-title"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "min(92vw, 760px)",
          maxHeight: "min(90vh, 820px)",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            flexShrink: 0,
            padding: "14px 18px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "#64748b", fontWeight: 600, marginBottom: "2px" }}>
              FIRST-TIME CONCEPT
            </div>
            <div id="inpact-deep-dive-title" style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              Deep dive · {title}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 600,
              background: "#0891b2",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 22px 24px" }}>
          <Section text={adjustedHook} />
          <Section text={dd.pain} />
          <Section text={dd.mentalModel} />
          <Section text={adjustedDiscover} />
          <Section title="THINK, DON'T TYPE YET" emoji="🔁" text={dd.dryRun} showLabel emphasize />
          <Section text={dd.build} />
        </div>
      </div>
    </div>
  );
}

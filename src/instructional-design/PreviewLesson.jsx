import { useState } from "react";

// Same eager glob AssistMeWorkspace uses — every generated module registers itself here just by
// existing on disk. Each module's default export is `createINPACTEngine({...})`'s return value,
// the exact same shape every real numbered lesson in App.jsx uses. Rendering it directly here is
// what makes this a true production-fidelity preview instead of Assist Me's simplified workspace —
// and it's fully isolated from App.jsx's real lesson catalog, so there's nothing to break.
const ASSIST_MODULES = import.meta.glob("../engines/assist/*.{jsx,tsx}", { eager: true });

function listModules() {
  return Object.entries(ASSIST_MODULES)
    .map(([path, mod]) => {
      const slugMatch = /inpact_assist_(.+)_engine\.[jt]sx$/.exec(path);
      return { slug: slugMatch?.[1] ?? path, Engine: mod.default, path };
    })
    .filter((m) => typeof m.Engine === "function")
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Standalone preview: runs any generated assist module through the real production lesson
 * engine (reveal → objectives → question steps → complete, full CodeEditor + grading), with
 * zero connection to App.jsx's real lesson catalog. Not linked from anywhere by design — it's a
 * testing tool, not a JS-facing route. Reach it directly at #/preview-lesson. */
export default function PreviewLesson() {
  const modules = listModules();
  const [selected, setSelected] = useState(null);

  if (selected) {
    const mod = modules.find((m) => m.slug === selected);
    if (!mod) return null;
    const { Engine } = mod;
    return (
      <div>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            padding: "6px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            PREVIEW · <b>{mod.slug}</b> · not a real lesson, running in isolation from the App.jsx catalog
          </span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            style={{
              background: "none",
              border: "1px solid #475569",
              color: "#e2e8f0",
              borderRadius: 4,
              padding: "2px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
            }}
          >
            ← choose a different lesson
          </button>
        </div>
        <div style={{ paddingTop: 32 }}>
          <Engine onNextLesson={() => setSelected(null)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 90px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0891b2", marginBottom: 8 }}>
        Lesson preview
      </div>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 27, margin: "0 0 8px" }}>Run a generated module for real</h1>
      <p style={{ color: "#475569", marginBottom: 28 }}>
        Every module below is on disk right now, whether or not it's been approved and published in ID Studio. This
        renders it through the exact same engine every numbered lesson uses — full reveal → objectives → editor
        steps → complete flow, real grading, nothing simulated.
      </p>

      {modules.length === 0 && (
        <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
          Nothing in src/engines/assist/ yet — generate one from ID Studio first.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {modules.map((m) => (
          <button
            key={m.slug}
            type="button"
            onClick={() => setSelected(m.slug)}
            style={{
              textAlign: "left",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "12px 16px",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              color: "#0f172a",
            }}
          >
            {m.slug}
          </button>
        ))}
      </div>
    </div>
  );
}

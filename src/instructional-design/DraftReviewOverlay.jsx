import { useState, useMemo, useRef, useEffect } from "react";
import "./DraftReviewOverlay.css";

/** A textarea that grows to fit its content instead of clipping it — fixed `rows` counts can't
 * guess how long a body/hint/deepDive field will be, and content was getting cut off with no
 * visible cue that there was more below. Resizes on every value change (typing, or the initial
 * mount with real loaded content) via the classic auto-height trick: collapse to `auto`, then
 * read the resulting scrollHeight and set that as the real height. */
function AutoTextarea({ value, onChange, className, minRows = 1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} className={className} value={value} rows={minRows} onChange={onChange} style={{ overflow: "hidden", resize: "none" }} />;
}

// Same eager glob AssistMeWorkspace/PreviewLesson use — gets the real, already-parsed NODES data,
// not raw source text. This is what makes a *content* review possible instead of a code dump.
const ASSIST_MODULES = import.meta.glob("../engines/assist/*.{jsx,tsx}", { eager: true });

function findModuleByFilePath(filePath) {
  const needle = String(filePath || "").replace(/\\/g, "/");
  const entry = Object.entries(ASSIST_MODULES).find(([path]) => needle.endsWith(path.replace("../engines/assist/", "")));
  return entry ? { path: entry[0], mod: entry[1] } : null;
}

const STRUCTURAL_KEYS = new Set(["id", "type", "phase"]);
const LABELS = {
  paal: "Task prompt",
  hint: "Hint",
  example_code: "Example code (shown as reference, different domain)",
  starter_code: "Starter code (given to the learner)",
  seed_code: "Seed code",
  expected: "Expected solution",
  analog_example: "Analogous example",
  mc_options: "Multiple-choice options",
  mc_correct_option: "Correct option",
  mc_anchor: "Anchor phrase (for grading)",
  why_this_matters: "Why this matters",
  answer_keywords: "Grading keywords",
  feedback_correct: "Feedback — correct",
  feedback_partial: "Feedback — partial",
  feedback_wrong: "Feedback — wrong",
  deepDiveLabel: "Deep dive label",
  deepDive: "Deep dive",
  title: "Title",
  body: "Body",
  usecase: "Real-world use case",
  items: "Objectives",
  hook: "Hook",
  pain: "Pain point",
  mentalModel: "Mental model",
  discover: "Discover",
  quickRules: "Quick rules",
  watchOut: "Watch out",
  dryRun: "Dry run",
  build: "Build",
};

const CODE_FIELDS = new Set(["example_code", "starter_code", "seed_code", "expected", "analog_example", "discover"]);

/** Generic editor for one node's content: walks every non-structural key, rendering a string as a
 * textarea (monospace for anything that's actually code), an array of strings as a repeatable
 * list, and a nested object (content{}, deepDive{}) as its own labeled sub-section — recursively,
 * one level. This is deliberately generic rather than one hand-built field per NODES field: the
 * schema has ~20 possible fields across node types and hand-enumerating each risks silently
 * dropping edit support for whichever one wasn't built — a real regression compared to the raw
 * code view it replaces, which at least showed everything even if unreadably. */
function FieldEditor({ obj, onChange, depth = 0 }) {
  return (
    <div className="dro-fields" style={{ marginLeft: depth * 16 }}>
      {Object.entries(obj)
        .filter(([k]) => !STRUCTURAL_KEYS.has(k))
        .map(([key, value]) => {
          const label = LABELS[key] || key;
          if (value == null) return null;
          if (typeof value === "string") {
            return (
              <label className="dro-field" key={key}>
                <span className="dro-field-label">{label}</span>
                <AutoTextarea
                  className={CODE_FIELDS.has(key) ? "dro-field-code" : ""}
                  value={value}
                  minRows={CODE_FIELDS.has(key) ? 4 : 1}
                  onChange={(e) => onChange({ ...obj, [key]: e.target.value })}
                />
              </label>
            );
          }
          if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
            return (
              <div className="dro-field" key={key}>
                <span className="dro-field-label">{label}</span>
                {value.map((item, i) => (
                  <div className="dro-list-row" key={i}>
                    <AutoTextarea
                      value={item}
                      onChange={(e) => {
                        const next = [...value];
                        next[i] = e.target.value;
                        onChange({ ...obj, [key]: next });
                      }}
                    />
                    <button type="button" className="dro-remove" onClick={() => onChange({ ...obj, [key]: value.filter((_, vi) => vi !== i) })}>
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="dro-add" onClick={() => onChange({ ...obj, [key]: [...value, ""] })}>
                  + Add
                </button>
              </div>
            );
          }
          if (typeof value === "object" && !Array.isArray(value)) {
            return (
              <fieldset className="dro-subsection" key={key}>
                <legend>{label}</legend>
                <FieldEditor obj={value} onChange={(next) => onChange({ ...obj, [key]: next })} depth={depth + 1} />
              </fieldset>
            );
          }
          return null; // booleans/numbers/functions — nothing here needs editing (e.g. a custom evaluate fn)
        })}
    </div>
  );
}

/** Full-screen review overlay: same step-by-step content AssistMeWorkspace shows a learner, but
 * editable, with Approve & Publish reachable from any slide. Replaces the raw `<pre>{code}</pre>`
 * dump ID Studio used to show — found live to be an unreasonable review experience for someone
 * judging pedagogy, not parsing JSX. */
export default function DraftReviewOverlay({ filePath, moduleTag, concept, onClose, onPublished }) {
  const found = useMemo(() => findModuleByFilePath(filePath), [filePath]);
  const [nodes, setNodes] = useState(() => (found ? structuredClone(found.mod.NODES) : []));
  const [activeIdx, setActiveIdx] = useState(0);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | error
  const [saveError, setSaveError] = useState("");
  const [publishStatus, setPublishStatus] = useState("idle"); // idle | loading | done | error
  const [dirty, setDirty] = useState(false);

  if (!found) {
    return (
      <div className="dro-overlay">
        <div className="dro-error-panel">
          Couldn't find this module's compiled content in the browser (glob may not have picked it up yet — try
          reloading). <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const active = nodes[activeIdx];

  function updateActive(next) {
    setNodes((prev) => prev.map((n, i) => (i === activeIdx ? next : n)));
    setDirty(true);
  }

  async function saveEdits() {
    setSaveStatus("saving");
    setSaveError("");
    try {
      const res = await fetch("/api/id/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, nodes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
      setSaveStatus("idle");
      setDirty(false);
      return true;
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err.message);
      return false;
    }
  }

  async function approveAndPublish() {
    if (dirty) {
      const saved = await saveEdits();
      if (!saved) return;
    }
    setPublishStatus("loading");
    try {
      const res = await fetch("/api/id/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleTag, concept, filePath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Publish failed (${res.status})`);
      setPublishStatus("done");
      onPublished?.(data);
    } catch (err) {
      setPublishStatus("error");
      setSaveError(err.message);
    }
  }

  return (
    <div className="dro-overlay">
      <div className="dro-topbar">
        <span className="dro-topbar-title">Reviewing · {moduleTag}</span>
        <span className="dro-topbar-progress">
          Slide {activeIdx + 1} of {nodes.length}
        </span>
        <button type="button" className="dro-close" onClick={onClose}>
          ✕ Close
        </button>
      </div>

      <div className="dro-body">
        <nav className="dro-steps">
          {nodes.map((n, i) => (
            <button
              type="button"
              key={n.id || i}
              className={`dro-step-item ${i === activeIdx ? "active" : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              {n.type === "reveal" ? "Lesson" : n.type === "objectives" ? "Objectives" : n.phase || `Step ${i + 1}`}
            </button>
          ))}
        </nav>

        <div className="dro-slide">
          {active && <FieldEditor obj={active} onChange={updateActive} />}
        </div>
      </div>

      <div className="dro-footer">
        <div className="dro-nav">
          <button type="button" onClick={() => setActiveIdx((i) => Math.max(0, i - 1))} disabled={activeIdx === 0}>
            ← Previous
          </button>
          <button type="button" onClick={() => setActiveIdx((i) => Math.min(nodes.length - 1, i + 1))} disabled={activeIdx === nodes.length - 1}>
            Next →
          </button>
        </div>
        <div className="dro-actions">
          {dirty && saveStatus !== "saving" && <span className="dro-dirty-hint">Unsaved edits</span>}
          {saveError && <span className="dro-save-error">{saveError}</span>}
          <button type="button" onClick={saveEdits} disabled={!dirty || saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving…" : "Save edits"}
          </button>
          <button type="button" className="dro-publish" onClick={approveAndPublish} disabled={publishStatus === "loading" || publishStatus === "done"}>
            {publishStatus === "done" ? "Published ✓" : publishStatus === "loading" ? "Publishing…" : "Approve & publish to Module Library"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import CodeEditor from "./CodeEditor";
import CssTabsEditor from "./css/CssTabsEditor";
import AngularTabbedEditor from "./angular/AngularTabbedEditor";
import { mergeAngularTsWithHtml, mergeAngularCssIntoTS } from "./angular/angularTabMerge.js";
import LessonEditorOutputTabs from "./LessonEditorOutputTabs";

if (typeof document !== "undefined" && !document.getElementById("dm-sans-font")) {
  const link = document.createElement("link");
  link.id = "dm-sans-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

function evaluate(node, answer) {
  if (node.evaluate) return node.evaluate(answer);
  const lower = (answer || "").toLowerCase().replace(/\s/g, "");
  const keywords = node.answer_keywords || [];
  const hits = keywords.filter((kw) => lower.includes(kw.toLowerCase().replace(/\s/g, "")));
  const ratio = keywords.length ? hits.length / keywords.length : 0;
  if (ratio >= 0.8) return "correct";
  if (ratio >= 0.5) return "partial";
  return "wrong";
}

export default function createINPACTEngine(config) {
  const { NODES, sideItems, problemNum, title, shortName, language, getOutputPreview, answerShape, defaultHtml, lessonIntro: configLessonIntro, lessonObjectives: configLessonObjectives, intro: configIntro, objectives: configObjectives } = config;
  const lessonIntro = configLessonIntro ?? configIntro ?? null;
  const lessonObjectives = configLessonObjectives ?? (Array.isArray(configObjectives) ? configObjectives : null);
  const pad = String(problemNum).padStart(2, "0");

  return function INPACTEngine({ onNextProblem }) {
    const [nodeIndex, setNodeIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [mainTab, setMainTab] = useState("editor");
    const [result, setResult] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [showExampleModal, setShowExampleModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [checking, setChecking] = useState(false);
    const [completedNodes, setCompletedNodes] = useState([]);
    const [passedCodeByStepId, setPassedCodeByStepId] = useState({});
    const node = NODES[nodeIndex];
    const progress = NODES.length <= 1 ? 0 : Math.min(100, Math.round((nodeIndex / (NODES.length - 1)) * 100));

    useEffect(() => {
      setResult(null);
      setAttempts(0);
      setShowHint(false);
      setShowExampleModal(false);
      setShowFeedbackModal(false);
      setChecking(false);
      setMainTab("editor");
      if (node?.type === "question") {
        let initialCode = "";
        if (node.id && passedCodeByStepId[node.id]) {
          initialCode = passedCodeByStepId[node.id];
        } else {
          for (let i = nodeIndex - 1; i >= 0; i--) {
            const prev = NODES[i];
            if (prev?.type === "question" && prev.id && passedCodeByStepId[prev.id]) {
              initialCode = passedCodeByStepId[prev.id];
              break;
            }
          }
          if (initialCode === "") {
            if (answerShape === "css-tabs") {
              initialCode = JSON.stringify({ html: defaultHtml || "", css: node.starter_code || node.seed_code || "" });
            } else if (answerShape === "angular-tabs") {
              const seed = node.starter_code || node.seed_code || "";
              initialCode = typeof seed === "object" && seed !== null && ("ts" in seed || "html" in seed)
                ? JSON.stringify({ ts: seed.ts ?? "", html: seed.html ?? "", css: seed.css ?? "" })
                : JSON.stringify({ ts: typeof seed === "string" ? seed : "", html: "", css: "" });
            } else if (node.starter_code) {
              initialCode = node.starter_code;
            }
          }
        }
        setAnswer(initialCode);
      }
    }, [nodeIndex, passedCodeByStepId]);

    function next() {
      if (node?.type === "question" && node?.id && result === "correct") {
        setPassedCodeByStepId((prev) => ({ ...prev, [node.id]: answer }));
      }
      if (node?.id) setCompletedNodes((p) => (p.includes(node.id) ? p : [...p, node.id]));
      setNodeIndex((i) => Math.min(i + 1, NODES.length));
    }

    function submit() {
      const toEval = answerShape === "css-tabs" ? (() => {
        try {
          const p = JSON.parse(answer);
          return (p && typeof p.css === "string") ? p.css : answer;
        } catch (_) { return answer; }
      })() : answerShape === "angular-tabs" ? (() => {
        try {
          const p = JSON.parse(answer);
          if (p && typeof p === "object") {
            let ts = (p.ts ?? "").trim();
            const html = (p.html ?? "").trim();
            const css = (p.css ?? "").trim();
            ts = mergeAngularTsWithHtml(ts, html);
            ts = mergeAngularCssIntoTS(ts, css);
            return ts;
          }
          return answer;
        } catch (_) { return answer; }
      })() : answer;
      if (!toEval.trim()) return;
      setChecking(true);
      const minCheckingMs = 500;
      const start = Date.now();
      const done = () => {
        const elapsed = Date.now() - start;
        setTimeout(() => setChecking(false), Math.max(0, minCheckingMs - elapsed));
      };
      const res = evaluate(node, toEval);
      setResult(res);
      setAttempts((a) => a + 1);
      if (attempts >= 1) setShowHint(true);
      if (node.hint || node[`feedback_${res}`]) setShowFeedbackModal(true);
      done();
    }

    const parsedCssTabs = useMemo(() => {
      if (answerShape !== "css-tabs") return null;
      try {
        const p = JSON.parse(answer || "{}");
        return { html: p.html ?? "", css: p.css ?? "" };
      } catch (_) {
        return { html: defaultHtml || "", css: answer || "" };
      }
    }, [answer, answerShape, defaultHtml]);

    const parsedAngularTabs = useMemo(() => {
      if (answerShape !== "angular-tabs") return null;
      try {
        const p = JSON.parse(answer || "{}");
        return { ts: p.ts ?? "", html: p.html ?? "", css: p.css ?? "" };
      } catch (_) {
        return { ts: answer || "", html: "", css: "" };
      }
    }, [answer, answerShape]);

    const angularPlaceholder = useMemo(() => {
      if (answerShape !== "angular-tabs" || !node) return undefined;
      const seed = node.starter_code ?? node.seed_code ?? "";
      if (typeof seed === "object" && seed !== null && ("ts" in seed || "html" in seed)) {
        return { ts: seed.ts ?? "", html: seed.html ?? "", css: seed.css ?? "" };
      }
      return { ts: typeof seed === "string" ? seed : "", html: "", css: "" };
    }, [answerShape, node]);

    const s = {
      wrap: { height: "100vh", overflow: "hidden", background: "#ffffff", color: "#1e293b", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", paddingTop: "52px", boxSizing: "border-box" },
      body: { display: "flex", flex: 1, minHeight: 0, minWidth: 0, overflowX: "hidden" },
      sidebar: { width: "240px", background: "#f1f5f9", borderRight: "1px solid #e2e8f0", padding: "20px 0", flexShrink: 0, overflowY: "auto" },
      sidebarLabel: { fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", color: "#64748b", padding: "0 20px 10px", marginBottom: "4px" },
      sideItem: (a, d) => ({ padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", background: a ? "#e0f2fe" : "transparent", borderLeft: a ? "3px solid #0891b2" : "3px solid transparent" }),
      sideItemDot: (a, d) => ({ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, ...(d ? { background: "#10b981" } : a ? { background: "#0891b2" } : { background: "transparent", border: "2px solid #94a3b8" }) }),
      sideItemText: (a, d) => ({ fontSize: "13px", color: d ? "#059669" : a ? "#0f172a" : "#64748b", lineHeight: 1.35, fontWeight: (a ? 600 : 400) }),
      main: { flex: 1, padding: "4px 20px 24px 20px", paddingLeft: "96px", minWidth: "75vw", maxWidth: "75vw", minHeight: 0, display: "flex", flexDirection: "column", overflowX: "hidden", boxSizing: "border-box" },
      phase: { fontSize: "10px", letterSpacing: "3px", color: "#0891b2", marginBottom: "16px" },
      tag: { fontSize: "11px", color: "#7c3aed", fontWeight: "600", letterSpacing: "0.15em", marginBottom: "12px" },
      h1: { fontSize: "28px", fontWeight: "400", color: "#0f172a", marginBottom: "32px", lineHeight: "1.2" },
      pre: { fontSize: "13px", lineHeight: "1.8", color: "#475569", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "24px", whiteSpace: "pre-wrap", marginBottom: "32px" },
      paalBox: { background: "#f1f5f9", border: "1px solid #e2e8f0", borderLeft: "3px solid #0891b2", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" },
      paalLabel: { fontSize: "10px", color: "#0891b2", letterSpacing: "2px", marginBottom: "10px" },
      paalText: { fontSize: "16px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap" },
      btnRow: { display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap" },
      btn: (v) => ({ padding: "14px 32px", borderRadius: "16px", cursor: "pointer", fontSize: "14px", fontWeight: "600", letterSpacing: "0.02em", background: v === "primary" ? "#00D2FF" : v === "ghost" ? "transparent" : "#e0f2fe", color: v === "primary" ? "#00334E" : v === "ghost" ? "#64748b" : "#0f172a", border: v === "ghost" ? "1px solid #cbd5e1" : v === "secondary" ? "1px solid #bae6fd" : "none" }),
      feedback: (t) => ({ marginTop: "20px", padding: "16px 20px", borderRadius: "8px", fontSize: "12px", lineHeight: "1.8", background: t === "correct" ? "rgba(16,185,129,0.1)" : t === "partial" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${t === "correct" ? "#10b981" : t === "partial" ? "#f59e0b" : "#ef4444"}`, color: t === "correct" ? "#059669" : t === "partial" ? "#d97706" : "#dc2626", whiteSpace: "pre-wrap" }),
      hintBox: { marginTop: "12px", padding: "12px 16px", background: "rgba(124,58,237,0.08)", border: "1px solid #7c3aed", borderRadius: "6px", fontSize: "11px", color: "#6d28d9", lineHeight: "1.7" },
      expectedBox: { marginTop: "12px", padding: "16px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", color: "#475569", whiteSpace: "pre-wrap", lineHeight: "1.7" },
      completeBanner: { textAlign: "center", padding: "60px 20px" },
    };

    function renderReveal() {
      const c = node.content;
      const revealPadding = { paddingLeft: "44px" };
      return (
        <div>
          <div style={revealPadding}>
            <div style={s.phase}>{node.phase}</div>
            {c.tag && <div style={s.tag}>{c.tag}</div>}
            <h1 style={s.h1}>{c.title}</h1>
            <div style={s.pre}>{c.body}</div>
          </div>
          {c.usecase && <div style={{ ...revealPadding, background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.25)", borderLeft: "3px solid #0891b2", borderRadius: "8px", padding: "16px 20px", marginBottom: "28px" }}><div style={{ fontSize: "10px", letterSpacing: "2px", color: "#0891b2", marginBottom: "8px" }}>💡 WHY THIS MATTERS</div><div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7" }}>{c.usecase}</div></div>}
          <div style={s.btnRow}><button type="button" className="inpact-btn-primary" style={s.btn("primary")} onClick={next}>CONTINUE →</button></div>
        </div>
      );
    }

    function renderObjectives() {
      return (
        <div>
          <div style={s.phase}>{node.phase}</div>
          <h1 style={s.h1}>After completing this Lesson, you'll be able to:</h1>
          {node.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", padding: "14px 0", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", color: "#0891b2", flexShrink: 0, minWidth: "20px" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontSize: "15px", color: "#334155", lineHeight: "1.6" }}>{item}</div>
            </div>
          ))}
          <div style={s.btnRow}><button type="button" className="inpact-btn-primary" style={s.btn("primary")} onClick={next}>LET'S BUILD →</button></div>
        </div>
      );
    }

    const stepNum = nodeIndex + 1;
    const totalSteps = NODES.length;

    function renderEditorBlockScrollable() {
      const codeForCursor = answerShape === "css-tabs" ? (parsedCssTabs?.css || "") : answerShape === "angular-tabs" ? (parsedAngularTabs?.ts || "") : (answer || "");
      const stepLineIndex = codeForCursor.split("\n").findIndex((l) => l.includes("// Step"));
      const cursorAtStartOfLine = node.cursorAtStartOfLine ?? (stepLineIndex >= 0 ? stepLineIndex + 2 : undefined);
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", color: "#0891b2", fontWeight: 600 }}>Step {stepNum} of {totalSteps}</span>
            {stepNum > 1 && (
              <>
                <span style={{ fontSize: "11px", color: "#64748b" }}>·</span>
                <span style={{ fontSize: "11px", color: "#0891b2", fontWeight: 600, letterSpacing: "0.05em" }}>CODE BUILT SO FAR — edit below</span>
              </>
            )}
          </div>
          {cursorAtStartOfLine != null && answerShape !== "css-tabs" && answerShape !== "angular-tabs" && <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px" }}>Type your code below the comment.</div>}
          {answerShape === "angular-tabs" && (
            <div style={{ fontSize: "12px", color: "#0e7490", marginBottom: "8px", padding: "8px 12px", background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.25)", borderRadius: "6px", lineHeight: 1.5 }}>
              <strong>Tip:</strong> Use <code style={{ background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>{"template: `" + "`"}</code> in the TypeScript tab and put your markup in the <strong>HTML</strong> tab; put CSS in the <strong>CSS</strong> tab. All three merge when you click Check.
            </div>
          )}
          <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: "4px", height: "480px", minHeight: "480px", width: "100%", maxWidth: "100%" }}>
            {answerShape === "css-tabs" ? (
              <CssTabsEditor
                key={node?.id}
                value={parsedCssTabs || { html: "", css: "" }}
                onChange={(v) => setAnswer(JSON.stringify(v))}
                height="480px"
              />
            ) : answerShape === "angular-tabs" ? (
              <AngularTabbedEditor
                key={node?.id}
                value={parsedAngularTabs || { ts: "", html: "", css: "" }}
                onChange={(v) => setAnswer(JSON.stringify(v))}
                height="480px"
                placeholder={angularPlaceholder}
              />
            ) : (
              <CodeEditor key={node?.id} value={answer} onChange={setAnswer} height="480px" cursorAtEndOfLine={cursorAtStartOfLine == null ? node.cursorLine : undefined} cursorAtStartOfLine={cursorAtStartOfLine} language={language || node.language || "javascript"} />
            )}
          </div>
        </>
      );
    }

    function renderEditorBlockButtons(fbMsg) {
      const canSubmit = answerShape === "css-tabs" ? (parsedCssTabs?.css?.trim()) : answerShape === "angular-tabs" ? (parsedAngularTabs?.ts?.trim() || parsedAngularTabs?.html?.trim() || parsedAngularTabs?.css?.trim()) : answer.trim();
      // Priority: example_code → multiline expected → seed_code fallback → short expected label
      const exampleEntry = node.example_code
        ? { label: "EXAMPLE (similar pattern — not the exact answer)", code: node.example_code }
        : (node.expected && node.expected.includes("\n"))
          ? { label: "EXPECTED", code: node.expected }
          : node.seed_code
            ? { label: "EXAMPLE", code: node.seed_code }
            : node.expected
              ? { label: "EXPECTED", code: node.expected }
              : null;
      const exampleContent = exampleEntry ? (
        <>
          <div style={{ ...s.paalLabel, marginBottom: "6px" }}>{exampleEntry.label}</div>
          <div style={s.expectedBox}>{exampleEntry.code}</div>
        </>
      ) : null;
      const hasHintOrFeedback = node.hint || fbMsg;
      return (
        <>
          <div style={s.btnRow}>
            {result !== "correct" ? (
              <>
                <button type="button" className={`inpact-btn-primary ${checking ? "inpact-btn-checking" : ""}`} style={s.btn("primary")} onClick={submit} disabled={!canSubmit || checking}>{checking ? "Checking..." : "CHECK MY CODE{ctrl+shift+enter}"}</button>
                {exampleContent && <button type="button" style={s.btn("secondary")} onClick={() => setShowExampleModal(true)}>SHOW ME AN EXAMPLE</button>}
                {attempts > 0 && !showHint && <button type="button" style={s.btn("secondary")} onClick={() => { setShowHint(true); setShowFeedbackModal(true); }}>SHOW HINT</button>}
                {hasHintOrFeedback && <button type="button" style={s.btn("secondary")} onClick={() => setShowFeedbackModal(true)}>💡 VIEW HINT & FEEDBACK</button>}
              </>
            ) : (
              <>
                <button type="button" className="inpact-btn-primary" style={s.btn("primary")} onClick={next}>NEXT STEP →</button>
                {hasHintOrFeedback && <button type="button" style={s.btn("secondary")} onClick={() => setShowFeedbackModal(true)}>💡 VIEW HINT & FEEDBACK</button>}
              </>
            )}
          </div>
          {showExampleModal && exampleContent && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(15, 23, 42, 0.5)",
                padding: "24px",
                boxSizing: "border-box",
              }}
              onClick={() => setShowExampleModal(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="example-modal-title"
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "24px",
                  maxWidth: "560px",
                  width: "100%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  border: "1px solid #e2e8f0",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div id="example-modal-title" style={{ ...s.paalLabel, marginBottom: "8px" }}>{exampleEntry.label}</div>
                <div style={s.expectedBox}>{exampleEntry.code}</div>
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" className="inpact-btn-primary" style={s.btn("primary")} onClick={() => setShowExampleModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
          {showFeedbackModal && hasHintOrFeedback && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(15, 23, 42, 0.5)",
                padding: "24px",
                boxSizing: "border-box",
              }}
              onClick={() => setShowFeedbackModal(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-modal-title"
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "24px",
                  maxWidth: "520px",
                  width: "100%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  border: "1px solid #e2e8f0",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div id="feedback-modal-title" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", color: "#64748b", marginBottom: "16px" }}>HINT & FEEDBACK</div>
                {node.hint && <div style={{ ...s.hintBox, marginBottom: fbMsg ? "16px" : 0 }}>💡 {node.hint}</div>}
                {fbMsg && <div style={s.feedback(result)}>{fbMsg}</div>}
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" className="inpact-btn-primary" style={s.btn("primary")} onClick={() => setShowFeedbackModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    function renderEditorContent() {
      const rawFb = result === "correct" ? node.feedback_correct : result === "partial" ? node.feedback_partial : result === "wrong" ? node.feedback_wrong : null;
      const fbMsg = typeof rawFb === "function" ? rawFb(answer) : rawFb;
      return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", maxWidth: "100%" }}>
            {renderEditorBlockScrollable()}
          </div>
          <div style={{ flexShrink: 0, paddingTop: "20px", marginTop: "8px", borderTop: "1px solid #e2e8f0" }}>
            {renderEditorBlockButtons(fbMsg)}
          </div>
        </div>
      );
    }

    function renderComplete() {
      return (
        <div style={s.completeBanner}>
          <div style={{ fontSize: "48px", marginBottom: "24px" }}>🎯</div>
          <h1 style={{ ...s.h1, textAlign: "center" }}>Problem #{problemNum} Complete</h1>
          <p style={{ color: "#4a5568", fontSize: "13px" }}>{title} done. Ready for the Next Lesson.</p>
          {onNextProblem && <div style={s.btnRow}><button type="button" className="inpact-btn-primary" style={s.btn("primary")} onClick={onNextProblem}>Next Lesson →</button></div>}
        </div>
      );
    }

    function renderNode() {
      if (nodeIndex >= NODES.length) return renderComplete();
      switch (node.type) {
        case "reveal": return renderReveal();
        case "objectives": return renderObjectives();
        case "question": return renderEditorContent();
        default: return renderReveal();
      }
    }

    return (
      <div style={s.wrap}>
        <div style={s.body}>
          <div style={s.sidebar}>
            <div style={s.sidebarLabel}>PROGRESS</div>
            {sideItems.map((item, i) => {
              const isActive = NODES[nodeIndex]?.id === item.id || (nodeIndex >= NODES.length && i === sideItems.length - 1);
              const isDone = completedNodes.includes(item.id);
              return (
                <div key={item.id} style={s.sideItem(isActive, isDone)} onClick={() => setNodeIndex(i)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setNodeIndex(i); } }}>
                  <div style={s.sideItemDot(isActive, isDone)} /><div style={s.sideItemText(isActive, isDone)}>{item.label}</div>
                </div>
              );
            })}
          </div>
          <div style={{ ...s.main, overflowY: "auto" }}>
            {node?.type === "question" ? (
              <LessonEditorOutputTabs
                node={node}
                nodes={NODES}
                mainTab={mainTab}
                setMainTab={setMainTab}
                answer={answer}
                getOutputPreview={getOutputPreview ?? (answerShape === "angular-tabs" ? (ans) => {
                  try {
                    const p = typeof ans === "string" ? JSON.parse(ans || "{}") : ans;
                    const html = (p?.html ?? "").trim();
                    const css = (p?.css ?? "").trim();
                    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || "<p>Add markup in the HTML tab to see a preview.</p>"}</body></html>`;
                  } catch (_) { return "<!DOCTYPE html><html><body><p>Invalid answer format.</p></body></html>"; }
                } : undefined)}
                lessonIntro={lessonIntro}
                lessonObjectives={lessonObjectives}
              >
                {renderEditorContent()}
              </LessonEditorOutputTabs>
            ) : (
              renderNode()
            )}
          </div>
        </div>
      </div>
    );
  };
}

import { useState, useEffect } from "react";
import InpactLogo from "../../components/InpactLogo.jsx";
import CodeEditor from "../CodeEditor";
import LessonEditorOutputTabs from "../LessonEditorOutputTabs";

if (typeof document !== "undefined" && !document.getElementById("dm-sans-font")) {
  const link = document.createElement("link");
  link.id = "dm-sans-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

// ─── ENGINE ANG09: PIPES — STEP-BY-STEP (same pattern as React engines) ─────────
// One small task per step: create the pipe file piece by piece, then use it in template.

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "ANG09 — PIPES",
      title: "Pipes — Creation & Usage",
      body: `We'll build a pipe called statusLabel that turns status codes into readable labels:

  ON_TIME   → "✅ On Time"
  DELAYED   → "⚠️ Delayed"
  CANCELLED → "❌ Cancelled"

You'll write it step by step in a TypeScript file, then use it in a template. One small task per step.`,
      usecase: "Pipes are display-only logic. Angular interviews always ask: how do you create a pipe, and what's pure vs impure? This engine teaches creation and usage the same way we teach React — one step at a time.",
    },
  },

  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Import Pipe and PipeTransform from @angular/core",
      "Add the @Pipe decorator with a name",
      "Create a class that implements PipeTransform",
      "Implement the transform(value, ...args) method",
      "Map status codes to labels and return the result",
      "Use the pipe in a template with the | syntax",
    ],
  },

  // ── Step 1: Import ─────────────────────────────────────────────────────────
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 7",
    paal: "Write the import line: import Pipe and PipeTransform from '@angular/core'.",
    hint: "Angular pipes need two things from the core package: the decorator that marks the class as a pipe, and the interface that defines the transform method. What are their names, and which package do they come from?",
    seed_code: `// status-label.pipe.ts — we'll build this file step by step

// Step 1: add the import here

`,
    answer_keywords: ["import", "pipe", "pipetransform", "@angular/core"],
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      if (a.includes("import") && (a.includes("pipe") || a.includes("pipetransform")) && a.includes("angular")) return "correct";
      if (a.includes("import") && a.includes("angular")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Pipe is the decorator; PipeTransform is the interface your class will implement.",
    feedback_partial: "Import both Pipe and PipeTransform from '@angular/core'.",
    feedback_wrong: "import { Pipe, PipeTransform } from '@angular/core';",
    expected: "import { Pipe, PipeTransform } from '@angular/core';",
    type_input: "code",
  },

  // ── Step 2: @Pipe decorator ────────────────────────────────────────────────
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 7",
    paal: "Add the @Pipe decorator with name: 'statusLabel'. Write it above where the class will go (you can add an empty class in the next step).",
    hint: "You need a decorator above the class. Its config object should include a name property — the string you'll use in the template after the | symbol.",
    seed_code: `// status-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

// Step 2: add @Pipe decorator with name: 'statusLabel'

`,
    answer_keywords: ["@pipe", "name", "statuslabel"],
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      if (a.includes("@pipe") && a.includes("statuslabel")) return "correct";
      if (a.includes("@pipe")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ The name in the decorator is what you use in the template: {{ value | statusLabel }}.",
    feedback_partial: "Add name: 'statusLabel' inside the @Pipe decorator.",
    feedback_wrong: "@Pipe({ name: 'statusLabel' })",
    expected: "@Pipe({ name: 'statusLabel' })",
    type_input: "code",
  },

  // ── Step 3: Class + PipeTransform ─────────────────────────────────────────
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 7",
    paal: "Declare the class: export class StatusLabelPipe implements PipeTransform { } (empty body for now).",
    hint: "The pipe is a class. It must implement the interface you imported so Angular knows it has a transform method. The class name is usually the pipe name plus 'Pipe'.",
    seed_code: `// status-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLabel' })
// Step 3: add the class here

`,
    answer_keywords: ["class", "statuslabelpipe", "pipetransform"],
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      if (a.includes("class") && (a.includes("statuslabelpipe") || a.includes("statuslabel")) && a.includes("pipetransform")) return "correct";
      if (a.includes("class") && a.includes("pipetransform")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ PipeTransform is the interface — it means your class will have a transform() method.",
    feedback_partial: "Export class StatusLabelPipe implements PipeTransform { }",
    feedback_wrong: "export class StatusLabelPipe implements PipeTransform { }",
    expected: "export class StatusLabelPipe implements PipeTransform {\n}",
    type_input: "code",
  },

  // ── Step 4: transform method signature ─────────────────────────────────────
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 7",
    paal: "Inside the class, add the transform method: transform(status: string): string { return status; } (for now just return the input unchanged).",
    hint: "The interface requires one method: it receives the value from the template and returns the transformed value. What's the method name? For now you can return the input unchanged.",
    seed_code: `// status-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  // Step 4: add transform(status: string): string { return status; }
}
`,
    answer_keywords: ["transform", "status", "string", "return"],
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      if (a.includes("transform(") && (a.includes("status") || a.includes("value")) && a.includes("return")) return "correct";
      if (a.includes("transform(")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ transform() receives the value from the left of | in the template. Later we'll replace the body with the mapping logic.",
    feedback_partial: "Add transform(status: string): string { return status; } inside the class.",
    feedback_wrong: "transform(status: string): string {\n  return status;\n}",
    expected: "transform(status: string): string {\n  return status;\n}",
    type_input: "code",
  },

  // ── Step 5: Map object inside transform ────────────────────────────────────
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 7",
    paal: "Inside transform, add a const map (e.g. Record<string, string>) that maps 'ON_TIME' → '✅ On Time', 'DELAYED' → '⚠️ Delayed', 'CANCELLED' → '❌ Cancelled'. Still return status at the end for now.",
    hint: "Create an object that maps each status string (ON_TIME, DELAYED, CANCELLED) to its display label. You'll use this in the next step to return the right label.",
    seed_code: `// status-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    // Step 5: add the map object here
    return status;
  }
}
`,
    answer_keywords: ["on_time", "delayed", "cancelled", "map"],
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasMap = a.includes("on_time") || a.includes("delayed") || a.includes("cancelled");
      if (hasMap) return "correct";
      return "wrong";
    },
    feedback_correct: "✅ The map holds the status code → label pairs. Next step we'll return the mapped value.",
    feedback_partial: "Add a const map with keys ON_TIME, DELAYED, CANCELLED and their label strings.",
    feedback_wrong: "const map: Record<string, string> = { ON_TIME: '✅ On Time', DELAYED: '⚠️ Delayed', CANCELLED: '❌ Cancelled' };",
    expected: "const map: Record<string, string> = {\n  ON_TIME: '✅ On Time',\n  DELAYED: '⚠️ Delayed',\n  CANCELLED: '❌ Cancelled',\n};",
    type_input: "code",
  },

  // ── Step 6: Return mapped value ────────────────────────────────────────────
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 7",
    paal: "Replace the return statement with: return map[status] ?? status; so unknown statuses are passed through unchanged.",
    hint: "Use the map to look up the label. If the status isn't in the map, return the original status. Nullish coalescing (??) helps here.",
    seed_code: `// status-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    const map: Record<string, string> = {
      ON_TIME: '✅ On Time',
      DELAYED: '⚠️ Delayed',
      CANCELLED: '❌ Cancelled',
    };
    // Step 6: return the mapped value (or status if not found)
  }
}
`,
    answer_keywords: ["return", "map[", "??", "status"],
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      if (a.includes("return") && (a.includes("map[") || a.includes("map[")) && (a.includes("??") || a.includes("status"))) return "correct";
      if (a.includes("return") && a.includes("map")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Your pipe is complete. map[status] ?? status returns the label or the original value. Don't forget to declare the pipe in your module or standalone component.",
    feedback_partial: "Return map[status] ?? status so we use the label when the key exists, otherwise the raw status.",
    feedback_wrong: "return map[status] ?? status;",
    expected: "return map[status] ?? status;",
    type_input: "code",
  },

  // ── Step 7: Use pipe in template ───────────────────────────────────────────
  {
    id: "step7",
    type: "question",
    phase: "Step 7 of 7",
    paal: "In the component template (HTML), write one line that displays flight.status using the statusLabel pipe. Assume the component has a variable flight with a status property.",
    hint: "In the template, the value on the left of the pipe symbol is passed to transform(). The pipe name goes on the right. Use interpolation (double curly braces) with the pipe.",
    seed_code: `<!-- component template: flight is in scope (e.g. from *ngFor) -->
<!-- Step 7: display flight.status through the statusLabel pipe -->

`,
    answer_keywords: ["statuslabel", "|", "flight.status", "{{"],
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasPipe = a.includes("|") && (a.includes("statuslabel") || a.includes("status"));
      const hasInterpolation = a.includes("{{") || a.includes("}}");
      if (hasPipe && (a.includes("flight") || a.includes("status"))) return "correct";
      if (hasPipe) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ {{ flight.status | statusLabel }} passes flight.status into the pipe's transform() and displays the result. That's how pipes are used — value on the left, pipe name on the right.",
    feedback_partial: "In the template use the pipe with | : {{ flight.status | statusLabel }}",
    feedback_wrong: "{{ flight.status | statusLabel }}",
    expected: "{{ flight.status | statusLabel }}",
    type_input: "code",
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Step 1" },
  { id: "step2", label: "Step 2" },
  { id: "step3", label: "Step 3" },
  { id: "step4", label: "Step 4" },
  { id: "step5", label: "Step 5" },
  { id: "step6", label: "Step 6" },
  { id: "step7", label: "Step 7" },
];

const s = {
  wrap: { fontFamily: "'DM Sans', sans-serif", background: "#0f1117", minHeight: "100vh", minWidth: "1000px", overflow: "hidden", color: "#e2e8f0", display: "flex", flexDirection: "column" },
  topbar: { display: "flex", alignItems: "center", gap: "12px", padding: "0 24px", height: "96px", background: "#1a1d2e", borderBottom: "1px solid #2d3748", flexShrink: 0 },
  logo: { fontWeight: 700, fontSize: "13px", letterSpacing: "0.15em", color: "#7c3aed", marginRight: "8px" },
  engineTag: { fontWeight: 700, fontSize: "10px", letterSpacing: "0.12em", color: "#4a5568", textTransform: "uppercase" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: { width: "200px", flexShrink: 0, background: "#13151f", borderRight: "1px solid #2d3748", padding: "20px 12px", overflowY: "auto" },
  sidebarLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase", marginBottom: "12px", paddingLeft: "8px" },
  sideItem: (active, done) => ({
    display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "6px", marginBottom: "2px", cursor: "pointer",
    background: active ? "rgba(124,58,237,0.15)" : "transparent",
    border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
    transition: "all 0.15s",
  }),
  sideItemDot: (active, done) => ({ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: done ? "#10b981" : active ? "#7c3aed" : "#2d3748" }),
  sideItemText: (active, done) => ({ fontSize: "11px", color: done ? "#10b981" : active ? "#c4b5fd" : "#4a5568", fontWeight: active ? 600 : 400, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
  main: { flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: "720px" },
  phase: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "10px" },
  h1: { fontSize: "26px", fontWeight: 700, color: "#f1f5f9", marginBottom: "20px", lineHeight: 1.3 },
  tag: { display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.4)", marginBottom: "14px" },
  pre: { fontFamily: "'Courier New', monospace", fontSize: "13px", background: "#1a1d2e", border: "1px solid #2d3748", borderRadius: "8px", padding: "16px 20px", lineHeight: 1.7, color: "#94a3b8", whiteSpace: "pre-wrap", marginBottom: "20px" },
  usecase: { fontSize: "13px", color: "#64748b", borderLeft: "2px solid #7c3aed", paddingLeft: "14px", lineHeight: 1.7, marginBottom: "24px" },
  objList: { listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" },
  objItem: { display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 },
  objDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0, marginTop: "6px" },
  paalLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#64748b", marginBottom: "8px" },
  paalText: { fontSize: "15px", fontWeight: 500, color: "#e2e8f0", marginBottom: "10px" },
  hint: { fontSize: "13px", color: "#64748b", marginBottom: "16px" },
  btnRow: { display: "flex", gap: "8px", marginTop: "12px" },
  btn: (variant) => ({
    padding: "10px 20px", borderRadius: "6px", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "12px", cursor: "pointer", letterSpacing: "0.05em",
    ...(variant === "primary" ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "#fff" } : { background: "#1a1d2e", border: "1px solid #2d3748", color: "#94a3b8" }),
  }),
  feedback: (type) => ({
    padding: "14px 18px", borderRadius: "8px", fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: "16px",
    ...(type === "correct" ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }
      : type === "partial" ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" }
      : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }),
  }),
};

export default function AngularA09Pipes({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showExpected, setShowExpected] = useState(false);
  const [showMe, setShowMe] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [mainTab, setMainTab] = useState("editor");

  const node = NODES[nodeIndex];
  useEffect(() => { setMainTab("editor"); }, [nodeIndex]);

  const currentAnswer = (() => {
    if (answers[node.id] !== undefined) return answers[node.id];
    if (node.type === "question") {
      for (let i = nodeIndex - 1; i >= 0; i--) {
        const prev = NODES[i];
        if (prev.type === "question" && answers[prev.id] !== undefined) return answers[prev.id];
      }
    }
    return node.seed_code || "";
  })();
  const setCurrentAnswer = (val) => setAnswers((prev) => ({ ...prev, [node.id]: val }));

  function next() {
    if (!completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
    setNodeIndex((i) => Math.min(i + 1, NODES.length - 1));
    setResult(null);
    setShowExpected(false);
    setShowMe(false);
  }

  function goTo(id) {
    const index = NODES.findIndex((n) => n.id === id);
    if (index !== -1) { setNodeIndex(index); setResult(null); setShowExpected(false); setShowMe(false); }
  }

  function evaluate() {
    if (!currentAnswer.trim()) return;
    const res = node.evaluate ? node.evaluate(currentAnswer) : "wrong";
    setResult(res);
    if (res === "correct" && !completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
  }

  function getFeedback() {
    if (!result) return null;
    const fb = node[`feedback_${result}`];
    return typeof fb === "function" ? fb(currentAnswer) : fb;
  }

  function renderReveal() {
    const c = node.content;
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <div style={s.tag}>{c.tag}</div>
        <h1 style={s.h1}>{c.title}</h1>
        <div style={s.pre}>{c.body}</div>
        <div style={s.usecase}>{c.usecase}</div>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>LET'S BUILD IT →</button></div>
      </div>
    );
  }

  function renderObjectives() {
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>By the end of this engine, you will be able to:</h1>
        <ul style={s.objList}>
          {node.items.map((item, i) => (
            <li key={i} style={s.objItem}><div style={s.objDot} />{item}</li>
          ))}
        </ul>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>START →</button></div>
      </div>
    );
  }

  function renderQuestion() {
    const feedback = getFeedback();
    const editorContent = (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <div style={{ fontSize: "11px", color: "#00d4ff", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "8px" }}>CODE BUILT SO FAR — edit below</div>
        <div style={s.hint}>💡 {node.hint}</div>
        {!showMe && node.expected && (
          <div style={{ marginBottom: "12px" }}>
            <button type="button" style={s.btn("secondary")} onClick={() => setShowMe(true)}>Show me</button>
          </div>
        )}
        {showMe && node.expected && (
          <div style={{ ...s.pre, borderLeft: "2px solid #7c3aed", marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#a78bfa", marginBottom: "8px" }}>HINT (CODE)</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{node.expected}</pre>
          </div>
        )}
        <CodeEditor value={currentAnswer} onChange={setCurrentAnswer} height="320px" />
        {feedback && <div style={s.feedback(result)}>{feedback}</div>}
        {showExpected && node.expected && (
          <div style={{ ...s.pre, borderLeft: "2px solid #10b981", marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#10b981", marginBottom: "8px" }}>MODEL ANSWER</div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{node.expected}</pre>
          </div>
        )}
        <div style={s.btnRow}>
          <button style={s.btn("primary")} onClick={evaluate} disabled={!currentAnswer.trim()}>CHECK →</button>
          {result && result !== "correct" && node.expected && <button style={s.btn("secondary")} onClick={() => setShowExpected(true)}>SHOW ANSWER</button>}
          {result === "correct" && <button style={s.btn("primary")} onClick={next}>NEXT →</button>}
          {result && result !== "correct" && <button style={{ ...s.btn("secondary"), marginLeft: "auto" }} onClick={next}>SKIP →</button>}
        </div>
      </div>
    );
    return (
      <LessonEditorOutputTabs node={node} nodes={NODES} mainTab={mainTab} setMainTab={setMainTab} answer={currentAnswer || ""}>
        {editorContent}
      </LessonEditorOutputTabs>
    );
  }

  function renderNode() {
    if (node.type === "reveal") return renderReveal();
    if (node.type === "objectives") return renderObjectives();
    if (node.type === "question") return renderQuestion();
    return null;
  }

  return (
    <div style={s.wrap}>
      <header style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <InpactLogo height={80} />
          <span style={{ fontWeight: 700, fontSize: "13px", letterSpacing: "0.15em", color: "#7c3aed" }}>· ANGULAR</span>
        </div>
        <div style={s.engineTag}>ANG09 — PIPES</div>
      </header>
      <div style={s.body}>
        <aside style={s.sidebar}>
          <div style={s.sidebarLabel}>PROGRESS</div>
          {sideItems.map((item) => {
            const active = item.id === node.id;
            const done = completedNodes.includes(item.id);
            return (
              <div key={item.id} style={s.sideItem(active, done)} onClick={() => goTo(item.id)}>
                <div style={s.sideItemDot(active, done)} />
                <div style={s.sideItemText(active, done)}>{item.label}</div>
              </div>
            );
          })}
        </aside>
        <main style={s.main}>{renderNode()}</main>
      </div>
    </div>
  );
}

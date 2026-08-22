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

// ─── ENGINE ANG08: MODULE FEDERATION ──────────────────────────────────────────

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "ANG08 — MODULE FEDERATION",
      title: "Micro-Frontend Architecture",
      body: `Design the Module Federation setup for a multi-team flight portal:

  • Shell app (Host): loads the navbar and orchestrates remote modules
  • FlightsApp (Remote): owns all flight search and booking routes
  • AdminApp (Remote): owns the operations dashboard
  • Both remotes expose Angular modules/components
  • Shared: Angular core and common-utils must be singletons
  • The Shell loads FlightsApp at runtime without a rebuild
  • Communication: selected flight shared between Shell and FlightsApp`,
      usecase:
        "Module Federation is the architect-level Angular topic. Being able to describe Host/Remote, shared singletons, and runtime composition is a strong signal for senior roles at large orgs.",
    },
  },

  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Explain what Webpack Module Federation is and the lesson it solves",
      "Distinguish Host vs Remote — ownership and deployment boundaries",
      "Describe how shared singletons work and why Angular must be shared",
      "Sketch a Remote webpack config exposing an Angular module",
      "Sketch a Host webpack config consuming that Remote",
      "Show how to lazy load a Remote with loadRemoteModule() in the router",
      "Discuss communication patterns between MFEs (custom events, shared store, shared services)",
      "List tradeoffs and when NOT to use Module Federation",
    ],
  },

  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 4",
    paal:
      "Explain Module Federation, what lesson it solves, what a Host is, and what a Remote is. Write your answer as structured code comments.",
    hint: "Focus on: independent deployments, runtime composition, no Shell rebuild, and clear ownership boundaries between apps.",
    seed_code: `// Step 1: Explain Module Federation
// - What lesson does it solve?
// - What is a Host?
// - What is a Remote?
// - Why does it matter for large teams?`,
    answer_keywords: ["host", "remote", "runtime", "deploy"],
  },

  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 4",
    paal:
      "Sketch a minimal webpack Module Federation config for a Remote Angular app called flightsApp that exposes FlightsModule.",
    hint: "Use ModuleFederationPlugin with name, filename, and exposes; and share Angular as a singleton.",
    seed_code: `// Step 2: flightsApp Remote webpack.config.js (snippet)
// new ModuleFederationPlugin({
//   name: 'flightsApp',
//   filename: 'remoteEntry.js',
//   exposes: {
//     './FlightsModule': './src/app/flights/flights.module.ts',
//   },
//   shared: {
//     '@angular/core': { singleton: true, strictVersion: true },
//     // ...
//   },
// })`,
    answer_keywords: ["remoteentry.js", "exposes", "singleton", "strictversion"],
  },

  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 4",
    paal:
      "In the Shell's router, add a lazy route for /flights that loads FlightsModule from the flightsApp Remote using loadRemoteModule().",
    hint: "Use loadRemoteModule() in loadChildren, then return m.FlightsModule.",
    seed_code: `// Step 3: Shell routes snippet with loadRemoteModule()
// import { loadRemoteModule } from '@angular-architects/module-federation';
//
// const routes: Routes = [
//   {
//     path: 'flights',
//     loadChildren: () =>
//       loadRemoteModule({
//         type: 'module',
//         remoteEntry: 'http://localhost:4201/remoteEntry.js',
//         exposedModule: './FlightsModule',
//       }).then(m => m.FlightsModule),
//   },
// ];`,
    answer_keywords: ["loadremotemodule", "loadchildren", "remoteentry", "exposedmodule"],
  },

  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 4",
    paal:
      "List 3–5 tradeoffs of Module Federation and when you would avoid it, even if you know how to implement it.",
    hint: "Think: operational complexity, shared dependency management, debugging, and when a single team owns the whole surface area.",
    seed_code: `// Step 4: When NOT to use Module Federation
// - ...
// - ...
// - ...`,
    answer_keywords: ["tradeoff", "complex", "small team", "overhead"],
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Explain MF" },
  { id: "step2", label: "Remote config" },
  { id: "step3", label: "Shell routing" },
  { id: "step4", label: "Tradeoffs" },
];

const s = {
  wrap: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#0f1117",
    minHeight: "100vh",
    minWidth: "1000px",
    overflow: "hidden",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 24px",
    height: "96px",
    background: "#1a1d2e",
    borderBottom: "1px solid #2d3748",
    flexShrink: 0,
  },
  logo: {
    fontWeight: 700,
    fontSize: "13px",
    letterSpacing: "0.15em",
    color: "#7c3aed",
    marginRight: "8px",
  },
  engineTag: {
    fontWeight: 700,
    fontSize: "10px",
    letterSpacing: "0.12em",
    color: "#4a5568",
    textTransform: "uppercase",
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: "200px",
    flexShrink: 0,
    background: "#13151f",
    borderRight: "1px solid #2d3748",
    padding: "20px 12px",
    overflowY: "auto",
  },
  sidebarLabel: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#4a5568",
    textTransform: "uppercase",
    marginBottom: "12px",
    paddingLeft: "8px",
  },
  sideItem: (active, done) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 8px",
    borderRadius: "6px",
    marginBottom: "2px",
    cursor: "pointer",
    background: active ? "rgba(124,58,237,0.15)" : "transparent",
    border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
    transition: "all 0.15s",
  }),
  sideItemDot: (active, done) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
    background: done ? "#10b981" : active ? "#7c3aed" : "#2d3748",
  }),
  sideItemText: (active, done) => ({
    fontSize: "11px",
    color: done ? "#10b981" : active ? "#c4b5fd" : "#4a5568",
    fontWeight: active ? 600 : 400,
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  main: {
    flex: 1,
    overflowY: "auto",
    padding: "32px 40px",
    maxWidth: "720px",
  },
  phase: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#7c3aed",
    marginBottom: "10px",
  },
  h1: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: "20px",
    lineHeight: 1.3,
  },
  tag: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    background: "rgba(124,58,237,0.2)",
    color: "#c4b5fd",
    border: "1px solid rgba(124,58,237,0.4)",
    marginBottom: "14px",
  },
  pre: {
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    background: "#1a1d2e",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    padding: "16px 20px",
    lineHeight: 1.7,
    color: "#94a3b8",
    whiteSpace: "pre-wrap",
    marginBottom: "20px",
  },
  usecase: {
    fontSize: "13px",
    color: "#64748b",
    borderLeft: "2px solid #7c3aed",
    paddingLeft: "14px",
    lineHeight: 1.7,
    marginBottom: "24px",
  },
  objList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "28px",
  },
  objItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  objDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#7c3aed",
    flexShrink: 0,
    marginTop: "6px",
  },
  paalLabel: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: "8px",
  },
  paalText: {
    fontSize: "15px",
    fontWeight: 500,
    color: "#e2e8f0",
    marginBottom: "10px",
  },
  hint: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    minHeight: "140px",
    background: "#1a1d2e",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    padding: "14px",
    color: "#e2e8f0",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    marginBottom: "12px",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  btn: (variant) => ({
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    letterSpacing: "0.05em",
    ...(variant === "primary"
      ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "#fff" }
      : { background: "#1a1d2e", border: "1px solid #2d3748", color: "#94a3b8" }),
  }),
  feedback: (type) => ({
    padding: "14px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    marginBottom: "16px",
    ...(type === "correct"
      ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }
      : type === "partial"
      ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" }
      : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }),
  }),
};

export default function AngularA08ModuleFederation({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [mainTab, setMainTab] = useState("editor");

  const node = NODES[nodeIndex];
  useEffect(() => { setMainTab("lesson"); }, [nodeIndex]);

  const currentAnswer = (() => {
    if (answers[node.id] !== undefined) return answers[node.id];
    if (node.type === "question") {
      for (let i = nodeIndex - 1; i >= 0; i--) {
        const prev = NODES[i];
        if (prev.type === "question" && answers[prev.id] !== undefined) {
          return answers[prev.id];
        }
      }
    }
    return node.seed_code || "";
  })();
  const setCurrentAnswer = (val) => setAnswers((prev) => ({ ...prev, [node.id]: val }));

  function next() {
    if (!completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
    setNodeIndex((i) => Math.min(i + 1, NODES.length - 1));
    setResult(null);
    setShowAnalogy(false);
    setShowExpected(false);
  }

  function goTo(id) {
    const index = NODES.findIndex((n) => n.id === id);
    if (index !== -1) {
      setNodeIndex(index);
      setResult(null);
      setShowAnalogy(false);
      setShowExpected(false);
    }
  }

  function evaluate() {
    if (!currentAnswer.trim()) return;
    let res;
    if (node.evaluate) {
      res = node.evaluate(currentAnswer);
    } else {
      const a = currentAnswer.toLowerCase();
      const hits = (node.answer_keywords || []).filter((k) => a.includes(k.toLowerCase())).length;
      res =
        hits === node.answer_keywords.length
          ? "correct"
          : hits >= (node.answer_keywords?.length || 0) * 0.6
          ? "partial"
          : "wrong";
    }
    setResult(res);
    if (res === "correct" && !completedNodes.includes(node.id)) {
      setCompletedNodes((p) => [...p, node.id]);
    }
  }

  function getFeedback() {
    if (!result) return null;
    const fb = node[`feedback_${result}`];
    if (typeof fb === "function") return fb(currentAnswer);
    return fb;
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
        <div style={s.btnRow}>
          <button style={s.btn("primary")} onClick={next}>
            LET'S DESIGN IT →
          </button>
        </div>
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
            <li key={i} style={s.objItem}>
              <div style={s.objDot} />
              {item}
            </li>
          ))}
        </ul>
        <div style={s.btnRow}>
          <button style={s.btn("primary")} onClick={next}>
            START →
          </button>
        </div>
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
        <CodeEditor value={currentAnswer} onChange={setCurrentAnswer} height="320px" />
        {feedback && <div style={s.feedback(result)}>{feedback}</div>}
        {showExpected && node.expected && (
          <div style={{ ...s.pre, borderLeft: "2px solid #10b981", marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#10b981", marginBottom: "8px" }}>MODEL ANSWER</div>
            {node.expected}
          </div>
        )}
        <div style={s.btnRow}>
          <button style={s.btn("primary")} onClick={evaluate} disabled={!currentAnswer.trim()}>CHECK →</button>
          {result && result !== "correct" && <button style={s.btn("secondary")} onClick={() => setShowExpected(true)}>SHOW ANSWER</button>}
          {result === "correct" && <button style={s.btn("primary")} onClick={next}>NEXT →</button>}
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
        <div style={s.engineTag}>ANG08 — MODULE FEDERATION</div>
      </header>
      <div style={s.body}>
        <aside style={s.sidebar}>
          <div style={s.sidebarLabel}>FLOW</div>
          {sideItems.map((item) => {
            const active = item.id === node.id;
            const done = completedNodes.includes(item.id);
            return (
              <div
                key={item.id}
                style={s.sideItem(active, done)}
                onClick={() => goTo(item.id)}
              >
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


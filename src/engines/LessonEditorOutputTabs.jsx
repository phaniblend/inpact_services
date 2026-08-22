import { useRef, useEffect, useLayoutEffect, useState, useContext, useMemo, useCallback } from "react";
import RichLearnerText from "./RichLearnerText";
import ReadingModeModal from "./ReadingModeModal";
import DeepDiveModal from "./DeepDiveModal";
import DeepDiveImageButton from "./DeepDiveImageButton";
import { LessonValidationContext } from "../ai-lessons/lessonValidationContext.jsx";
import { getDeepDiveConceptsForStep, getIntroDeepDiveConcept } from "../learn/conceptGlossary.js";

/**
 * Shared Lesson | Editor | Output tabs + YOUR TASK callout.
 * - Lesson: parses node.paal for "Your task:" / "Your turn:" and shows callout.
 * - Editor: task block (same as EditorTaskBlock) + children.
 * - Output: getOutputPreview(answer) if provided; auto React live preview via
 *   Babel Standalone when code looks like a React component; formatted code
 *   preview for Angular/other templates.
 */

/** Engine / JSON may use `deepDive` or `deep_dive` on question nodes. */
function getQuestionNodeDeepDiveObject(node) {
  if (!node || node.type !== "question") return null;
  const dd = node.deepDive ?? node.deep_dive;
  if (dd && typeof dd === "object" && !Array.isArray(dd)) return dd;
  return null;
}

function deepDiveLabelFromNode(node) {
  return node?.deepDiveLabel ?? node?.deep_dive_label ?? node?.title ?? "Deep dive";
}

/** Map common live-preview errors to a short, actionable markdown line for learners. */
function learnerPreviewCoachHint(message) {
  const m = String(message || "").toLowerCase();
  if ((m.includes("usestate") || m.includes("use state")) && m.includes("not defined")) {
    return "React hooks are **case-sensitive**. Use **`useState`** with a capital **S** — `usestate` is not defined.";
  }
  if (m.includes("useeffect") && m.includes("not defined")) {
    return "Use **`useEffect`** with a capital **E**.";
  }
  if (m.includes("useref") && m.includes("not defined")) {
    return "Use **`useRef`** with a capital **R**.";
  }
  if (m.includes("expected a component")) {
    return "Name your root component **`App`** (or match the lesson) and use **`export default`** when the step asks for it.";
  }
  if (m.includes("app is not defined")) {
    return "The preview looks for your component name (e.g. **`const ControlledInput = (): JSX.Element => …`**). If you see this error after a refresh, the preview may not have detected the name — use the lesson’s component name or **`export default function App`**.";
  }
  if (m.includes("is not defined")) {
    return "Check **spelling**, **imports**, and **capitalization** against the lesson example.";
  }
  return "";
}

/** Inject reset + background into any HTML string returned by getOutputPreview */
function injectBaseStyles(html) {
  if (typeof html !== "string" || !html) return html;
  const base = `<style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 20px; background: #f0f4f8; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1a202c; line-height: 1.5; }
  </style>`;
  return html.includes("</head>")
    ? html.replace("</head>", base + "</head>")
    : base + html;
}

/** Detect if code looks like a React component */
function isReactCode(code) {
  return (
    /\breturn\s*\(?\s*</.test(code) ||
    /React\.createElement/.test(code) ||
    /useState|useEffect|useRef|useMemo|useCallback|useReducer/.test(code)
  );
}

/** Detect if code looks like an Angular/HTML template */
function isAngularTemplate(code) {
  return (
    /\*ngFor|\*ngIf|\[\(ngModel\)\]|\[ngClass\]|\(click\)/.test(code) ||
    (/<[a-z][\s\S]*>/i.test(code) && !isReactCode(code))
  );
}

/**
 * Live iframe preview strips all `import` lines and only injects React globals.
 * Redux / RTK Query apps therefore break at runtime (undefined Provider, store, hooks).
 * Detect that early and show a clear message instead of a cryptic "Script error."
 */
function previewCannotRunInSandbox(code) {
  if (!code || typeof code !== "string") return false;
  const c = code;
  return (
    /from\s+['"]react-redux['"]/.test(c) ||
    /from\s+['"]@reduxjs\/toolkit/.test(c) ||
    /from\s+['"]@reduxjs\/toolkit\/query/.test(c) ||
    /from\s+['"]\.\/store['"]/.test(c) ||
    /from\s+['"]\.\/api['"]/.test(c) ||
    /\buseGetPostsQuery\b|\buseGetPostQuery\b|\buseAddPostMutation\b/.test(c) ||
    (/\bProvider\b/.test(c) && /\bstore\s*=\s*\{/.test(c)) ||
    (/\bconfigureStore\b/.test(c) && /\bcreateApi\b/.test(c))
  );
}

/** Static HTML when preview cannot execute learner code (Redux / RTK / multi-file imports). */
function generateSandboxBlockedPreview() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 24px; background: #f0f4f8; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #334155; line-height: 1.6; max-width: 520px; }
    h1 { font-size: 15px; color: #0f172a; margin: 0 0 12px 0; }
    p { margin: 0 0 10px 0; }
    .box { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 18px; border-left: 4px solid #0891b2; }
    code { font-size: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Preview isn’t available for this setup</h1>
    <p>This lesson uses <strong>Redux</strong> and/or <strong>RTK Query</strong> with imports from <code>./store</code>, <code>./api</code>, or <code>react-redux</code>. The in-app preview runs a single file in an iframe and removes import lines, so the store and hooks are not defined — the browser then often shows only <code>Script error.</code></p>
    <p>Use <strong>CHECK MY CODE{CTRL+SHIFT+ENTER}{ctrl+shift+enter}</strong> for validation, or run the project in your own local development environment to see the real UI.</p>
  </div>
</body>
</html>`;
}

/**
 * Hook / call names whose generic args must be stripped before Babel (TSX).
 * In `.tsx`, `useFetch<Todo>(url)` is parsed as JSX (`<Todo>` → runtime "X is not defined").
 * Nested types (`Array<string>`, `{ id: number }`) use balanced < >.
 */
const PREVIEW_STRIP_CALL_SITE_GENERICS = [
  "useState",
  "useRef",
  "useMemo",
  "useCallback",
  "useReducer",
  "useContext",
  "useLayoutEffect",
  "useImperativeHandle",
  "useSyncExternalStore",
  "useDeferredValue",
  "useFetch",
];

/**
 * Remove `<...>` type arguments on call expressions like `useFetch<Todo>(` so the
 * in-iframe Babel+TSX preview does not treat `<Todo` as a JSX tag.
 */
function stripTsxGenericCallSiteArgs(src, fnNames) {
  let s = src;
  for (const name of fnNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let searchStart = 0;
    let scanning = true;
    while (scanning) {
      const re = new RegExp(`\\b${escaped}\\s*<`, "g");
      re.lastIndex = searchStart;
      const match = re.exec(s);
      if (!match) {
        scanning = false;
        continue;
      }
      const openAngle = match.index + match[0].length - 1;
      let depth = 0;
      let j = openAngle;
      for (; j < s.length; j++) {
        const c = s[j];
        if (c === "<") depth++;
        else if (c === ">") {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      if (depth !== 0) {
        searchStart = openAngle + 1;
        continue;
      }
      const before = s.slice(0, openAngle);
      const after = s.slice(j);
      s = before + after;
      searchStart = match.index + name.length;
    }
  }
  return s;
}

/** Strip common TypeScript-only bits so Babel standalone is less likely to stall on learner code. */
function stripTsForBabelPreview(src) {
  let s = stripTsxGenericCallSiteArgs(src, PREVIEW_STRIP_CALL_SITE_GENERICS);
  s = s
    // function TodoList(): JSX.Element {
    .replace(/\)\s*:\s*JSX\.Element\s*\{/g, ") {")
    .replace(/\)\s*:\s*React\.ReactNode\s*\{/g, ") {")
    // const X = (): Type => (
    .replace(/(\)\s*):\s*React\.ChangeEvent<HTMLInputElement>\s*=>/g, "$1 =>");
  // (param: number) in arrow / function args (single identifier param only, common in lessons)
  s = s.replace(/\(([a-zA-Z_$][\w$]*)\s*:\s*[a-zA-Z_$][\w$|.<>\s&]*\)\s*=>/g, "($1) =>");
  s = s.replace(/function\s+(\w+)\s*\(\s*([a-zA-Z_$][\w$]*)\s*:\s*[a-zA-Z_$][\w$|.<>\s&]*\s*\)/g, "function $1($2)");
  return s;
}

/** Generate a live React preview iframe HTML using Babel Standalone CDN */
function generateReactPreview(code) {
  if (!code || !code.trim()) {
    return `<!DOCTYPE html><html><body style="background:#f0f4f8;padding:24px;font-family:system-ui,sans-serif;color:#64748b;font-size:14px">Write your React component in the Editor tab to see a live preview here.</body></html>`;
  }

  // Find the main component name from the source code (`const X = (): JSX.Element =>`, legacy `React.FC`, or `function X`)
  const nameMatch =
    code.match(/(?:export\s+default\s+)?function\s+([A-Z][a-zA-Z0-9]*)\s*[({]/) ||
    code.match(/(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*:\s*(?:React\.)?FC\b/) ||
    code.match(/(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(/) ||
    code.match(/(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*=/) ||
    code.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/);
  const componentName = nameMatch ? nameMatch[1] : "App";

  // Strip import lines and convert `export default function X` → `function X`
  const safeCode = stripTsForBabelPreview(
    code
      .split("\n")
      .filter((l) => !l.trim().startsWith("import "))
      .join("\n")
      .replace(/export\s+default\s+function\s+/g, "function ")
      .replace(/export\s+default\s+/g, "")
      .replace(/export\s+/g, "")
      .replace(/<\/script>/gi, "<\\/script>")
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 20px; background: #f0f4f8; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; color: #1a202c; }
    .error-box { background: #fff1f0; border: 1px solid #ffa39e; color: #c0392b; padding: 12px 16px; border-radius: 6px; font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; margin-top: 8px; max-width: 100%; overflow-x: auto; }
    .loading { color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div id="root"><span class="loading">Loading preview…</span></div>
  <script>
    (function () {
      function reportPreviewIssue(title, detail) {
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(
              { type: "inpact-preview-lesson", message: title, detail: detail || "" },
              "*"
            );
          }
        } catch (err) {}
      }
      function reportPreviewOk() {
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: "inpact-preview-ok" }, "*");
          }
        } catch (err) {}
      }
      window.__inpactReportPreviewIssue = reportPreviewIssue;
      window.__inpactReportPreviewOk = reportPreviewOk;

      function showPreviewError(title, detail) {
        var r = document.getElementById("root");
        if (!r) return;
        r.innerHTML = "";
        var d = document.createElement("div");
        d.className = "error-box";
        d.appendChild(document.createTextNode(title));
        if (detail) {
          d.appendChild(document.createElement("br"));
          d.appendChild(document.createElement("br"));
          d.appendChild(document.createTextNode(detail));
        }
        r.appendChild(d);
        reportPreviewIssue(title, detail || "");
      }
      window.onerror = function (message, _src, _line, _col, error) {
        var msg = message == null ? "" : String(message);
        var detail = error && error.stack ? String(error.stack) : "";
        if (msg === "Script error." || msg === "Script error") {
          detail =
            (detail ? detail + " — " : "") +
            "Browsers often hide the real line for cross-origin scripts. Missing imports after the preview strips them (Redux / RTK Query) is a common cause — use CHECK MY CODE{CTRL+SHIFT+ENTER}{ctrl+shift+enter} or run locally.";
        }
        showPreviewError("Preview error: " + msg, detail);
        return true;
      };
      window.addEventListener("unhandledrejection", function (e) {
        var reason = e.reason;
        var msg = reason && reason.message ? reason.message : String(reason);
        showPreviewError("Preview error: " + msg, reason && reason.stack ? String(reason.stack) : "");
      });
      setTimeout(function () {
        var r = document.getElementById("root");
        if (r && r.querySelector(".loading")) {
          showPreviewError(
            "Preview timed out (still loading).",
            "Common causes: blocked network to unpkg.com (React / Babel CDNs), a TypeScript/Babel compile error, or heavy CPU. Open devtools → select this iframe → Console for details."
          );
        }
      }, 15000);
      window.__inpactShowPreviewError = showPreviewError;
    })();
  </script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" onerror="window.__inpactShowPreviewError&&window.__inpactShowPreviewError('Failed to load React from unpkg.com.','Check your network, VPN, or ad-blocker.')"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" onerror="window.__inpactShowPreviewError&&window.__inpactShowPreviewError('Failed to load React DOM from unpkg.com.','Check your network, VPN, or ad-blocker.')"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" onerror="window.__inpactShowPreviewError&&window.__inpactShowPreviewError('Failed to load Babel from unpkg.com.','Preview needs Babel to compile TypeScript/JSX. Check your network.')"></script>
  <script type="text/babel" data-presets="typescript,react">
    const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, Component } = React;
    class _InpactPreviewErrorBoundary extends Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }
      static getDerivedStateFromError(error) {
        return { error };
      }
      render() {
        if (this.state.error) {
          var m = this.state.error.message || String(this.state.error);
          var det = this.state.error.stack ? String(this.state.error.stack) : "";
          if (window.__inpactReportPreviewIssue) {
            window.__inpactReportPreviewIssue("Render error: " + m, det);
          }
          return React.createElement("div", { className: "error-box" }, "Render error: " + m);
        }
        return this.props.children;
      }
    }
    try {
      ${safeCode}
      var __C = ${componentName};
      if (typeof __C !== "function") {
        throw new Error(
          'Expected a component named "${componentName}" (function or const). If your component uses another name, rename it or add export default YourName.'
        );
      }
      var el = document.getElementById("root");
      var root = ReactDOM.createRoot(el);
      root.render(
        React.createElement(
          _InpactPreviewErrorBoundary,
          null,
          React.createElement(__C)
        )
      );
      if (window.__inpactReportPreviewOk) window.__inpactReportPreviewOk();
    } catch (e) {
      var errTitle = "Preview error: " + (e && e.message ? e.message : String(e));
      var r = document.getElementById("root");
      if (r) {
        r.innerHTML = "";
        var d = document.createElement("div");
        d.className = "error-box";
        d.textContent = errTitle;
        r.appendChild(d);
      }
      if (window.__inpactReportPreviewIssue) {
        window.__inpactReportPreviewIssue(errTitle, e && e.stack ? String(e.stack) : "");
      }
    }
  </script>
</body>
</html>`;
}

/** Generate a formatted Angular/HTML template preview */
function generateTemplatePreview(code) {
  if (!code || !code.trim()) {
    return `<!DOCTYPE html><html><body style="background:#f0f4f8;padding:24px;font-family:system-ui,sans-serif;color:#64748b;font-size:14px">Write your template code in the Editor tab to see a preview here.</body></html>`;
  }
  const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 20px; background: #f8fafc; font-family: monospace; font-size: 13px; color: #334155; }
    pre { color: #0f172a; white-space: pre-wrap; word-break: break-word; line-height: 1.7; margin: 0; }
    .note { font-family: system-ui, sans-serif; font-size: 12px; color: #64748b; margin-bottom: 14px; padding: 10px 14px; background: rgba(100,116,139,0.1); border-left: 3px solid #475569; border-radius: 4px; }
    .tag { color: #7dd3fc; }
    .attr { color: #86efac; }
    .val { color: #fde68a; }
  </style>
</head>
<body>
  <div class="note">📋 Angular template — code preview (runtime execution requires a full Angular environment)</div>
  <pre>${escaped}</pre>
</body>
</html>`;
}
const lessonStyles = {
  wrap: { maxWidth: "640px" },
  lessonScroll: { maxHeight: "calc(100vh - 220px)", overflowY: "auto", overflowX: "hidden" },
  phase: { fontSize: "10px", letterSpacing: "3px", color: "#f28a8a", marginBottom: "16px" },
  badge: { display: "inline-block", fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "#64748b", marginBottom: "12px", padding: "0" },
  card: { background: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "4px solid #f28a8a", borderRadius: "12px", padding: "24px 28px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  paalLabel: { fontSize: "10px", color: "#f28a8a", letterSpacing: "2px", marginBottom: "10px", fontWeight: 600 },
  paalText: { fontSize: "16px", color: "#334155", lineHeight: "1.75", whiteSpace: "pre-wrap" },
  taskCard: { background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.45)", borderLeft: "4px solid #FF6B6B", borderRadius: "10px", padding: "18px 22px", marginTop: "20px", marginBottom: "24px" },
  taskLabel: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#124559", marginBottom: "8px" },
  taskText: { fontSize: "15px", color: "#422006", lineHeight: "1.65", whiteSpace: "pre-wrap" },
  editorTaskWrap: { width: "100%", marginBottom: "4px", flexShrink: 0, boxSizing: "border-box" },
  editorTaskBox: { background: "#ffffff", border: "1px solid #e2e8f0", borderLeft: "4px solid #f28a8a", borderRadius: "8px", padding: "8px 12px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
  editorTaskLabel: { fontSize: "9px", color: "#f28a8a", letterSpacing: "0.12em", marginBottom: "2px", fontWeight: 700 },
  editorTaskText: { fontSize: "13px", color: "#334155", lineHeight: "1.45", whiteSpace: "pre-wrap" },
  cta: { marginTop: "28px", padding: "14px 20px", background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.25)", borderRadius: "8px", fontSize: "13px", color: "#0e7490", lineHeight: "1.6", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  tabBar: { display: "flex", gap: "6px", marginBottom: "4px", borderBottom: "none", paddingBottom: "0", flexShrink: 0 },
  tab: (active) => ({ padding: "10px 18px", fontSize: "12px", fontWeight: 600, background: "#ffffff", border: active ? "1px solid #0891b2" : "1px solid #e2e8f0", color: active ? "#0891b2" : "#64748b", borderRadius: "8px", cursor: "pointer" }),
  outputPlaceholder: { height: "calc(100vh - 180px)", minHeight: "320px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "32px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", textAlign: "center", fontSize: "14px", color: "#64748b", lineHeight: 1.6, maxWidth: "420px", margin: "0 auto" },
  outputIframe: { width: "100%", height: "calc(100vh - 180px)", minHeight: "400px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" },
};

/** Same task block shown above the editor everywhere (tabs and non-tabs). Parses "Your task:" / "Your turn:" for callout. */
export function EditorTaskBlock({
  node,
  taskInstructionPulseNonce = 0,
  deepDiveConcepts = [],
  onOpenDeepDive,
  /** When true, host gets `data-tour-id="deep-dive-editor-button"` (omit when modal workspace is closed so the id is not duplicated). */
  tourAnchorEditorDeepDive = false,
}) {
  const paal = node?.paal || "";
  const markerMatch = paal.match(/your\s+(?:task|turn)\s*:/i);
  const markerIdx = markerMatch ? markerMatch.index : -1;
  const mainText = markerIdx >= 0 ? paal.slice(0, markerIdx).trim() : paal;
  const taskText = markerIdx >= 0 ? paal.slice(markerIdx).trim() : "";
  if (!paal) return null;
  const pulseClass = taskInstructionPulseNonce > 0 ? " inpact-editor-task-box--pulse" : "";
  const dives = Array.isArray(deepDiveConcepts) ? deepDiveConcepts : [];
  const hasDeepDive = dives.length > 0 && typeof onOpenDeepDive === "function";
  return (
    <div
      style={{
        ...lessonStyles.editorTaskWrap,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        gap: "12px",
      }}
    >
      <div
        style={{
          flex: hasDeepDive ? "0 0 60%" : "1 1 100%",
          maxWidth: hasDeepDive ? "60%" : "100%",
          minWidth: 0,
          maxHeight: "min(48vh, 560px)",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          key={taskInstructionPulseNonce}
          style={{ ...lessonStyles.editorTaskBox, minHeight: "min-content" }}
          className={`inpact-editor-task-box${pulseClass}`}
        >
          <div style={lessonStyles.editorTaskLabel}>TASK</div>
          {mainText ? (
            <RichLearnerText text={mainText} style={lessonStyles.editorTaskText} variant="task" />
          ) : null}
          {taskText ? (
            <div style={{ ...lessonStyles.taskCard, marginTop: "12px", marginBottom: 0 }} className="inpact-task-callout">
              <div style={lessonStyles.taskLabel} className="inpact-task-badge">YOUR TASK</div>
              <RichLearnerText text={taskText} style={lessonStyles.taskText} variant="taskCallout" />
            </div>
          ) : null}
        </div>
      </div>
      {hasDeepDive ? (
        <div
          style={{
            flex: "1 1 40%",
            minWidth: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "2px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="inpact-editor-deep-dive-toolbar inpact-editor-deep-dive-toolbar--beside-task inpact-editor-task-deep-dive-host"
            {...(tourAnchorEditorDeepDive ? { "data-tour-id": "deep-dive-editor-button" } : {})}
          >
            {dives.map((c, di) => (
              <DeepDiveImageButton
                key={c.id}
                onClick={() => onOpenDeepDive(c)}
                title={dives.length > 1 ? `Deep-dive: ${c.label || c.id}` : `Open concept guide: ${c.label || c.id}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const introNodeFromNodes = (nodes) => nodes?.find((n) => n.type === "reveal" && (n.id === "intro" || n.phase === "Lesson")) || nodes?.find((n) => n.type === "reveal");
const objectivesNodeFromNodes = (nodes) => nodes?.find((n) => n.type === "objectives");

/** Same PROGRESS affordance as the main lesson sidebar, embedded beside the code editor. */
function EditorProgressRail({ items, activeNodeIndex, completedIds, onSelectIndex }) {
  if (!Array.isArray(items) || items.length === 0 || typeof onSelectIndex !== "function") return null;
  const doneSet = new Set(Array.isArray(completedIds) ? completedIds : []);
  const railStyles = {
    wrap: {
      width: "220px",
      flexShrink: 0,
      background: "#f1f5f9",
      borderRight: "1px solid #e2e8f0",
      padding: "12px 0",
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
      alignSelf: "stretch",
      minHeight: 0,
    },
    label: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#64748b", padding: "0 16px 10px", marginBottom: "2px" },
    row: (isActive, isDone) => ({
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
      background: isActive ? "#e0f2fe" : "transparent",
      borderLeft: isActive ? "3px solid #0891b2" : "3px solid transparent",
      marginLeft: 0,
    }),
    dot: (isActive, isDone) => ({
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      flexShrink: 0,
      ...(isDone
        ? { background: "#10b981" }
        : isActive
          ? { background: "#0891b2" }
          : { background: "transparent", border: "2px solid #94a3b8" }),
    }),
    text: (isActive, isDone) => ({
      fontSize: "12px",
      color: isDone ? "#059669" : isActive ? "#0f172a" : "#64748b",
      lineHeight: 1.35,
      fontWeight: isActive ? 600 : 400,
    }),
  };
  return (
    <nav
      className="inpact-editor-progress-rail"
      aria-label="Lesson progress"
      data-tour-id="editor-progress-rail"
      style={railStyles.wrap}
    >
        <div style={railStyles.label}>PROGRESS</div>
        {items.map((item, i) => {
          const isActive = activeNodeIndex === i;
          const isDone = doneSet.has(item.id);
          return (
            <div
              key={item.id}
              style={railStyles.row(isActive, isDone)}
              onClick={() => onSelectIndex(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectIndex(i);
                }
              }}
            >
              <div style={railStyles.dot(isActive, isDone)} aria-hidden />
              <div style={railStyles.text(isActive, isDone)}>{item.label}</div>
            </div>
          );
        })}
    </nav>
  );
}

export default function LessonEditorOutputTabs({
  node,
  nodes,
  mainTab,
  setMainTab,
  answer = "",
  previewCode = "",
  getOutputPreview,
  showTaskInEditor = true,
  tabsInSidebar = false,
  lessonIntro = null,
  lessonObjectives = null,
  lessonTrack,
  /** Lesson index (matches glossary `lessonNum` in track JSON lessons). */
  lessonNum,
  /** Increment when learner advances from feedback modal "Next step" — subtle pulse on TASK box */
  taskInstructionPulseNonce = 0,
  /** Full-screen editor workspace over the lesson chrome (shared INPACT engines). */
  useEditorWorkspaceModal = false,
  editorWorkspaceOpen = false,
  onOpenEditorWorkspace,
  onCloseEditorWorkspace,
  editorWorkspaceTitle = "",
  /** When editor workspace (or inline editor) is shown, optional PROGRESS rail; indices align with lesson nodes. */
  editorProgress = null,
  /** Hide the objectives block on the Lesson tab (e.g. intro reveal should mirror legacy single-screen intro). */
  omitObjectivesFromLessonTab = false,
  /** Extra controls after the Lesson tab CTA (e.g. CONTINUE / LET'S BUILD on React · TS lesson 1 shell). */
  preQuestionFooter = null,
  /**
   * When set (e.g. intro MCQ from the engine), replaces the default TOPICS card on the Lesson tab so the slot owns the full intro UI.
   */
  lessonIntroSlot = null,
  children,
}) {
  const lessonValidationCtx = useContext(LessonValidationContext);
  const track = lessonTrack || lessonValidationCtx?.track;
  const deepDiveConcepts = useMemo(() => {
    const dd = getQuestionNodeDeepDiveObject(node);
    const inlineStepConcept =
      node?.type === "question" && dd
        ? {
            label: deepDiveLabelFromNode(node),
            deepDive: dd,
          }
        : null;
    const introduces =
      node?.introduces_concepts ?? node?.introducesConcepts ?? undefined;
    return getDeepDiveConceptsForStep(track, lessonNum, node?.id, introduces, inlineStepConcept);
  }, [
    track,
    lessonNum,
    node?.id,
    node?.introduces_concepts,
    node?.introducesConcepts,
    node?.type,
    node?.deepDive,
    node?.deep_dive,
    node?.deepDiveLabel,
    node?.deep_dive_label,
    node?.title,
  ]);
  const [deepDiveConcept, setDeepDiveConcept] = useState(null);
  const code = typeof previewCode === "string" && previewCode.trim() ? previewCode : (typeof answer === "string" ? answer : "");
  const hasOutput = typeof getOutputPreview === "function";
  const sandboxBlocked = !hasOutput && previewCannotRunInSandbox(code);
  const isReact = !hasOutput && !sandboxBlocked && isReactCode(code);
  const isAngular = !hasOutput && !sandboxBlocked && !isReact && isAngularTemplate(code);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [previewCoach, setPreviewCoach] = useState(null);
  const [showReadingModal, setShowReadingModal] = useState(false);
  /** True when the Lesson tab scroll area has more content below the fold (real scroll host is here, not engine main). */
  const [lessonScrollMoreBelow, setLessonScrollMoreBelow] = useState(false);
  const lessonScrollRef = useRef(null);
  const lessonObjectivesAnchorRef = useRef(null);
  const previewIframeRef = useRef(null);
  const introNode = introNodeFromNodes(nodes);
  const objectivesNode = omitObjectivesFromLessonTab ? null : objectivesNodeFromNodes(nodes);
  const lessonContent = introNode?.content || (lessonIntro && { tag: lessonIntro.tag, title: lessonIntro.title, body: lessonIntro.body, usecase: lessonIntro.usecase }) || {};
  const objectives = objectivesNode?.items || (Array.isArray(lessonObjectives) ? lessonObjectives : []);
  const introDeepDiveConcept = useMemo(
    () => getIntroDeepDiveConcept(track, lessonNum, lessonContent.title),
    [track, lessonNum, lessonContent.title]
  );

  const updateLessonScrollMoreBelow = useCallback(() => {
    const el = lessonScrollRef.current;
    if (!el) {
      setLessonScrollMoreBelow(false);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const bottomGap = scrollHeight - scrollTop - clientHeight;
    const hasOverflow = scrollHeight > clientHeight + 8;
    const notAtBottom = bottomGap > 12;
    setLessonScrollMoreBelow(hasOverflow && notAtBottom);
  }, []);

  /** Same content as former Output tab: HTML for iframe or placeholder */
  const outputContent = hasOutput
    ? injectBaseStyles(getOutputPreview(answer))
    : sandboxBlocked
      ? generateSandboxBlockedPreview()
      : isReact
        ? generateReactPreview(code)
        : isAngular
          ? generateTemplatePreview(code)
          : null;

  useLayoutEffect(() => {
    const showLessonMain = useEditorWorkspaceModal || mainTab === "lesson";
    if (!showLessonMain) return;
    const scrollEl = lessonScrollRef.current;
    if (!scrollEl) return;
    const run = () => {
      if (node?.type === "objectives" && objectives.length > 0) {
        const anchor = lessonObjectivesAnchorRef.current;
        if (anchor) {
          const sRect = scrollEl.getBoundingClientRect();
          const aRect = anchor.getBoundingClientRect();
          const delta = aRect.top - sRect.top - 8;
          scrollEl.scrollTop = Math.max(0, scrollEl.scrollTop + delta);
          const lets = scrollEl.querySelector("[data-inpact-lesson-lets-build]");
          if (lets instanceof HTMLElement) {
            const sRect2 = scrollEl.getBoundingClientRect();
            const bRect = lets.getBoundingClientRect();
            if (bRect.bottom > sRect2.bottom - 12) {
              const bump = bRect.bottom - sRect2.bottom + 12;
              scrollEl.scrollTop = Math.min(
                scrollEl.scrollHeight - scrollEl.clientHeight,
                scrollEl.scrollTop + bump
              );
            }
          }
          return;
        }
      }
      scrollEl.scrollTop = 0;
    };
    const id = requestAnimationFrame(() => {
      run();
      requestAnimationFrame(() => {
        updateLessonScrollMoreBelow();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [mainTab, useEditorWorkspaceModal, node?.id, node?.type, objectives.length, updateLessonScrollMoreBelow]);

  useLayoutEffect(() => {
    const showLessonMain = useEditorWorkspaceModal || mainTab === "lesson";
    if (!showLessonMain) {
      setLessonScrollMoreBelow(false);
      return undefined;
    }
    const el = lessonScrollRef.current;
    if (!el) return undefined;
    updateLessonScrollMoreBelow();
    const onScroll = () => updateLessonScrollMoreBelow();
    el.addEventListener("scroll", onScroll, { passive: true });
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateLessonScrollMoreBelow());
      ro.observe(el);
      const inner = el.querySelector(".inpact-lesson-scroll-inner");
      if (inner instanceof Element) ro.observe(inner);
    }
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (ro) ro.disconnect();
    };
  }, [
    updateLessonScrollMoreBelow,
    mainTab,
    useEditorWorkspaceModal,
    editorWorkspaceOpen,
    node?.id,
    node?.type,
    lessonContent?.body,
    lessonContent?.title,
    lessonContent?.usecase,
    objectives.length,
    omitObjectivesFromLessonTab,
  ]);

  useEffect(() => {
    if (!useEditorWorkspaceModal || !editorWorkspaceOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseEditorWorkspace?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [useEditorWorkspaceModal, editorWorkspaceOpen, onCloseEditorWorkspace]);

  useEffect(() => {
    queueMicrotask(() => {
      setDeepDiveConcept(null);
    });
  }, [node?.id]);

  useEffect(() => {
    function onMessage(e) {
      const iframe = previewIframeRef.current;
      if (!iframe || e.source !== iframe.contentWindow) return;
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === "inpact-preview-lesson") {
        setPreviewCoach({
          message: typeof d.message === "string" ? d.message : String(d.message ?? ""),
          detail: typeof d.detail === "string" ? d.detail : "",
        });
      }
      if (d.type === "inpact-preview-ok") setPreviewCoach(null);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function closeOutputModal() {
    setPreviewCoach(null);
    setShowOutputModal(false);
  }

  function openOutputModal() {
    setPreviewCoach(null);
    setShowOutputModal(true);
  }

  return (
    <>
      <style>
        {`
          .inpact-editor-progress-rail { width: 220px; }
          @media (max-width: 700px) {
            .inpact-editor-progress-row { flex-direction: column !important; align-items: stretch !important; }
            .inpact-editor-progress-rail {
              width: 100% !important;
              max-height: min(36vh, 200px);
              border-right: none !important;
              border-bottom: 1px solid #e2e8f0;
              flex-shrink: 0;
            }
          }
          @keyframes inpact-lesson-scroll-hint-bounce {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(6px); opacity: 1; }
          }
          .inpact-lesson-scroll-hint-chevrons {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1px;
          }
          .inpact-lesson-scroll-hint-chevron {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
            color: #0891b2;
            animation: inpact-lesson-scroll-hint-bounce 1.2s ease-in-out infinite;
            will-change: transform;
          }
          .inpact-lesson-scroll-hint-chevrons .inpact-lesson-scroll-hint-chevron:nth-child(1) { animation-delay: 0s; }
          .inpact-lesson-scroll-hint-chevrons .inpact-lesson-scroll-hint-chevron:nth-child(2) { animation-delay: 0.14s; }
          .inpact-lesson-scroll-hint-chevrons .inpact-lesson-scroll-hint-chevron:nth-child(3) { animation-delay: 0.28s; }
        `}
      </style>
      {!tabsInSidebar && (
        <div
          className="inpact-main-tabs-row"
          style={{ ...lessonStyles.tabBar, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              style={lessonStyles.tab(useEditorWorkspaceModal ? !editorWorkspaceOpen : mainTab === "lesson")}
              data-tour-id="tab-lesson"
              onClick={() => {
                if (useEditorWorkspaceModal) {
                  onCloseEditorWorkspace?.();
                  setMainTab("lesson");
                } else setMainTab("lesson");
              }}
            >
              Lesson
            </button>
            <button
              type="button"
              style={lessonStyles.tab(useEditorWorkspaceModal ? editorWorkspaceOpen : mainTab === "editor")}
              data-tour-id="tab-editor"
              onClick={() => {
                if (useEditorWorkspaceModal) onOpenEditorWorkspace?.();
                else setMainTab("editor");
              }}
            >
              Editor
            </button>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              type="button"
              style={{ ...lessonStyles.tab(false), borderColor: "#00C49A", color: "#124559", fontSize: "11px" }}
              data-tour-id="reading-button"
              onClick={() => setShowReadingModal(true)}
              title="Skim the lesson like a book — steps, code, and explanations"
            >
              📖 Reading
            </button>
          </div>
        </div>
      )}
      {(useEditorWorkspaceModal || mainTab === "lesson") && (
        <div style={{ position: "relative", width: "100%" }}>
          <div ref={lessonScrollRef} style={lessonStyles.lessonScroll}>
            <div className="inpact-lesson-scroll-inner" style={lessonStyles.wrap}>
            {lessonIntroSlot ? (
              <div style={{ marginBottom: "8px" }}>{lessonIntroSlot}</div>
            ) : (lessonContent.title || lessonContent.body || lessonContent.usecase) ? (
              <div style={lessonStyles.card}>
                <div style={lessonStyles.paalLabel}>TOPICS & CONCEPTS</div>
                {lessonContent.tag && <div style={{ fontSize: "11px", color: "#f28a8a", marginBottom: "8px" }}>{lessonContent.tag}</div>}
                {lessonContent.title && <div style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "12px" }}>{lessonContent.title}</div>}
                {introDeepDiveConcept ? (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ ...lessonStyles.paalLabel, marginBottom: "8px" }}>CONCEPT GUIDE</div>
                    <DeepDiveImageButton
                      onClick={() => setDeepDiveConcept(introDeepDiveConcept)}
                      title={`Open concept guide: ${introDeepDiveConcept.label || introDeepDiveConcept.id}`}
                    />
                  </div>
                ) : null}
                {lessonContent.body && (
                  <RichLearnerText text={lessonContent.body} style={lessonStyles.paalText} />
                )}
                {lessonContent.usecase && (
                  <RichLearnerText
                    text={lessonContent.usecase}
                    variant="muted"
                    style={{ marginTop: "14px", fontSize: "14px", color: "#94a3b8", fontStyle: "italic" }}
                  />
                )}
              </div>
            ) : null}
            {objectives.length > 0 && (
              <div ref={node?.type === "objectives" ? lessonObjectivesAnchorRef : undefined} style={lessonStyles.card}>
                <div style={lessonStyles.paalLabel}>LEARNING OBJECTIVES</div>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", lineHeight: 1.85, fontSize: "15px" }}>
                  {objectives.map((item, i) => (
                    <li key={i} style={{ marginBottom: "6px" }}>
                      <RichLearnerText as="span" text={item} style={{ display: "inline" }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lessonIntroSlot ? null : (
              <div style={lessonStyles.cta}>
                <span style={{ fontSize: "18px" }}>👉</span>
                <span>
                  {useEditorWorkspaceModal ? (
                    <>
                      Open the <strong style={{ color: "#0891b2" }}>Editor</strong> tab to code in full screen, then <strong style={{ color: "#0891b2" }}>Preview</strong> to run output.
                    </>
                  ) : (
                    <>
                      Switch to the <strong style={{ color: "#0891b2" }}>Editor</strong> tab to write your code, then click <strong style={{ color: "#0891b2" }}>Preview</strong> to see the output.
                    </>
                  )}
                </span>
              </div>
            )}
            {preQuestionFooter}
            {node?.type === "question" && deepDiveConcepts.length > 0 ? (
              <div style={{ ...lessonStyles.card, marginTop: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "14px",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                    <div style={lessonStyles.paalLabel}>OPTIONAL DEEP DIVE · THIS STEP</div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "#0e7490",
                      }}
                    >
                      Hungry for more?
                    </div>
                  </div>
                  <div
                    className="inpact-editor-deep-dive-toolbar inpact-deep-dive-lesson-toolbar"
                    data-tour-id="deep-dive-lesson-button"
                    style={{ flexShrink: 0, marginLeft: "auto", alignSelf: "flex-start" }}
                  >
                    {deepDiveConcepts.map((c, di) => (
                      <DeepDiveImageButton
                        key={c.id}
                        onClick={() => setDeepDiveConcept(c)}
                        title={
                          deepDiveConcepts.length > 1
                            ? `Deep dive: ${c.label || c.id}`
                            : `Open concept guide: ${c.label || c.id}`
                        }
                      />
                    ))}
                  </div>
                </div>
                <p style={{ margin: "0 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.55 }}>
                  Extra diagrams and plain-language context for this step — open anytime; the same strip appears next to the task in the Editor workspace.
                </p>
              </div>
            ) : null}
            </div>
          </div>
          {lessonScrollMoreBelow ? (
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                bottom: "14px",
                transform: "translateX(-50%)",
                zIndex: 6,
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "8px 16px 6px",
                borderRadius: "999px",
                background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(248,250,252,0.92) 40%, rgba(248,250,252,0.98) 100%)",
                boxShadow: "0 -6px 18px rgba(15,23,42,0.08)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: "#64748b" }}>
                SROLL
              </span>
              <div className="inpact-lesson-scroll-hint-chevrons" aria-hidden>
                {[
                  { w: 22, sw: 2.25 },
                  { w: 18, sw: 2 },
                  { w: 14, sw: 1.75 },
                ].map(({ w, sw }) => (
                  <span key={w} className="inpact-lesson-scroll-hint-chevron">
                    <svg
                      width={w}
                      height={Math.round(w * 0.42)}
                      viewBox="0 0 24 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M3 3.5L12 9.5L21 3.5"
                        stroke="currentColor"
                        strokeWidth={sw}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
      {!useEditorWorkspaceModal && mainTab === "editor" && (
        <div
          className="inpact-inline-editor-root"
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%", maxWidth: "100%", overflow: "hidden" }}
        >
          <div style={{ marginBottom: "4px", flexShrink: 0 }}>
            <button
              type="button"
              style={{ ...lessonStyles.tab(false), borderColor: "#0891b2", color: "#0891b2", fontSize: "11px" }}
              data-tour-id="preview-button"
              onClick={openOutputModal}
            >
              🖥️ Preview
            </button>
          </div>
          {showTaskInEditor && (
            <EditorTaskBlock
              node={node}
              taskInstructionPulseNonce={taskInstructionPulseNonce}
              deepDiveConcepts={deepDiveConcepts}
              onOpenDeepDive={setDeepDiveConcept}
              tourAnchorEditorDeepDive
            />
          )}
          <div
            className={editorProgress ? "inpact-editor-progress-row" : undefined}
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: editorProgress ? "row" : "column",
              alignItems: editorProgress ? "stretch" : undefined,
              minWidth: 0,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {editorProgress ? (
              <EditorProgressRail
                items={editorProgress.items}
                activeNodeIndex={editorProgress.activeNodeIndex}
                completedIds={editorProgress.completedIds}
                onSelectIndex={editorProgress.onSelectIndex}
              />
            ) : null}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      )}
      {useEditorWorkspaceModal && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10020,
              pointerEvents: editorWorkspaceOpen ? "auto" : "none",
              visibility: editorWorkspaceOpen ? "visible" : "hidden",
              background: editorWorkspaceOpen ? "rgba(15, 23, 42, 0.45)" : "transparent",
              transition: "background 0.15s ease",
            }}
            aria-hidden={!editorWorkspaceOpen}
            onClick={() => editorWorkspaceOpen && onCloseEditorWorkspace?.()}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Editor workspace"
              data-inpact-editor-workspace={editorWorkspaceOpen ? "open" : "closed"}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                left: "max(8px, env(safe-area-inset-left, 0px))",
                right: "max(8px, env(safe-area-inset-right, 0px))",
                top: "max(8px, env(safe-area-inset-top, 0px))",
                bottom: "max(8px, env(safe-area-inset-bottom, 0px))",
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.35)",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "10px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {editorWorkspaceTitle || "Editor workspace"}
                </span>
                <button
                  type="button"
                  onClick={() => onCloseEditorWorkspace?.()}
                  data-tour-id="editor-close"
                  style={{
                    flexShrink: 0,
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Close
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px 12px 12px",
                  overflow: "hidden",
                }}
              >
                {showTaskInEditor && (
                  <div style={{ flexShrink: 0, marginBottom: "4px" }}>
                    <EditorTaskBlock
                      node={node}
                      taskInstructionPulseNonce={taskInstructionPulseNonce}
                      deepDiveConcepts={deepDiveConcepts}
                      onOpenDeepDive={setDeepDiveConcept}
                      tourAnchorEditorDeepDive={editorWorkspaceOpen}
                    />
                  </div>
                )}
                <div
                  className={editorProgress ? "inpact-editor-progress-row" : undefined}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: editorProgress ? "row" : "column",
                    alignItems: editorProgress ? "stretch" : undefined,
                    overflow: "hidden",
                  }}
                >
                  {editorProgress ? (
                    <EditorProgressRail
                      items={editorProgress.items}
                      activeNodeIndex={editorProgress.activeNodeIndex}
                      completedIds={editorProgress.completedIds}
                      onSelectIndex={editorProgress.onSelectIndex}
                    />
                  ) : null}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ flexShrink: 0, marginBottom: "4px" }}>
                      <button
                        type="button"
                        style={{ ...lessonStyles.tab(false), borderColor: "#0891b2", color: "#0891b2", fontSize: "11px" }}
                        data-tour-id="preview-button"
                        onClick={openOutputModal}
                      >
                        🖥️ Preview
                      </button>
                    </div>
                    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      {children}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <ReadingModeModal
        open={showReadingModal}
        onClose={() => setShowReadingModal(false)}
        nodes={nodes}
        lessonTitle={lessonContent.title || node?.title || ""}
      />
      <DeepDiveModal open={Boolean(deepDiveConcept)} onClose={() => setDeepDiveConcept(null)} concept={deepDiveConcept} />
      {showOutputModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.6)",
            padding: "24px",
            boxSizing: "border-box",
          }}
          onClick={closeOutputModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="output-modal-title"
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
              width: "100%",
              maxWidth: "900px",
              height: "85vh",
              maxHeight: "720px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              border: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <span id="output-modal-title" style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>🖥️ Output preview</span>
              <button type="button" onClick={closeOutputModal} style={{ padding: "6px 14px", fontSize: "12px", fontWeight: 600, background: "#0891b2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Close</button>
            </div>
            {previewCoach ? (
              <div
                style={{
                  flexShrink: 0,
                  padding: "12px 16px",
                  background: "linear-gradient(180deg, #EAFBFF 0%, #ffffff 100%)",
                  borderBottom: "1px solid #fcd34d",
                  fontSize: "13px",
                  color: "#124559",
                  lineHeight: 1.55,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px", color: "#124559" }}>
                  Learner hint
                </div>
                {learnerPreviewCoachHint(previewCoach.message) ? (
                  <div style={{ marginBottom: "8px" }}>
                    <RichLearnerText text={learnerPreviewCoachHint(previewCoach.message)} variant="task" />
                  </div>
                ) : null}
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "11px", opacity: 0.92, wordBreak: "break-word" }}>
                  {previewCoach.message}
                </div>
              </div>
            ) : null}
            <div style={{ flex: 1, minHeight: 0, background: "#f8fafc" }}>
              {outputContent ? (
                <iframe
                  ref={previewIframeRef}
                  title="Preview"
                  srcDoc={outputContent}
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  sandbox="allow-scripts"
                />
              ) : (
                <div style={{ ...lessonStyles.outputPlaceholder, height: "100%", minHeight: "280px", maxWidth: "none" }}>
                  <span style={{ fontSize: "32px" }}>🖥️</span>
                  <div>Write your code in the <strong style={{ color: "#0891b2" }}>Editor</strong> tab, then click Preview to see the output here.</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>You can also paste your code into <a href="https://codesandbox.io" target="_blank" rel="noreferrer" style={{ color: "#0891b2" }}>CodeSandbox</a> for a full live environment.</div>
                  <button type="button" onClick={closeOutputModal} style={{ marginTop: "12px", padding: "8px 16px", fontSize: "12px", fontWeight: 600, background: "#e2e8f0", color: "#475569", border: "none", borderRadius: "6px", cursor: "pointer" }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

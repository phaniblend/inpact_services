import { useState, useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { configureMonacoDiagnosticsOff, MONACO_SHARED_OPTIONS } from "../monacoEditorConfig.js";

/** Shared auto-close-tag logic — same as CodeEditor, works for HTML tab too */
function setupAutoCloseTags(editor, monaco) {
  let applying = false;
  return editor.onDidChangeModelContent((event) => {
    if (applying) return;
    const model = editor.getModel();
    if (!model) return;
    for (const change of event.changes) {
      if (change.text !== ">") continue;
      const line = change.range.startLineNumber;
      const col = change.range.startColumn;
      const lineText = model.getLineContent(line);
      const beforeGt = lineText.substring(0, col - 1);
      // (?<!\w) prevents matching TypeScript generics like useState<string>
      const tagMatch = beforeGt.match(/(?<!\w)<([a-zA-Z][a-zA-Z0-9.-]*)(?:\s[^>]*)?$/);
      if (!tagMatch) continue;
      if (beforeGt.trimEnd().endsWith("/")) continue;
      const tagName = tagMatch[1];
      const voidTags = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
      if (voidTags.has(tagName.toLowerCase())) continue;
      const cursorCol = col + 1;
      applying = true;
      editor.executeEdits("auto-close-tag", [{
        range: new monaco.Range(line, cursorCol, line, cursorCol),
        text: `</${tagName}>`,
      }]);
      editor.setPosition({ lineNumber: line, column: cursorCol });
      applying = false;
      break;
    }
  });
}

/**
 * Two-tab Monaco editor for CSS engines.
 *
 * value:    { html: string, css: string }
 * onChange: (value: { html, css }) => void
 *
 * - Starts on the CSS tab so learners land directly where they write CSS.
 * - Each tab keeps its own Monaco model so switching tabs never loses edits
 *   and the cursor position is preserved per-tab.
 * - On mount, the editor scrolls to the end of the CSS content so learners
 *   immediately see where to add their code.
 */

const MONACO_OPTIONS = {
  ...MONACO_SHARED_OPTIONS,
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
  fontLigatures: true,
  lineNumbers: "on",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on",
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  renderLineHighlight: "line",
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  autoClosingTags: true,
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  padding: { top: 12, bottom: 12 },
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true },
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  parameterHints: { enabled: false },
  wordBasedSuggestions: "off",
};

function scrollToEnd(editor) {
  if (!editor) return;
  const model = editor.getModel();
  if (!model) return;
  const lastLine = model.getLineCount();
  const lastCol = model.getLineMaxColumn(lastLine);
  editor.setPosition({ lineNumber: lastLine, column: lastCol });
  editor.revealLine(lastLine);
  editor.focus();
}

export default function CssTabsEditor({ value = {}, onChange, height = "240px" }) {
  const [activeTab, setActiveTab] = useState("css");
  const editorRef = useRef(null);
  const disposeRef = useRef(null);

  const html = value.html ?? "";
  const css = value.css ?? "";
  const currentValue = activeTab === "css" ? css : html;
  const currentLang = activeTab === "css" ? "css" : "html";

  const handleChange = useCallback(
    (val) => {
      const v = val ?? "";
      if (activeTab === "css") onChange({ ...value, css: v });
      else onChange({ ...value, html: v });
    },
    [activeTab, onChange, value]
  );

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    // Wire auto-close tags (covers HTML tab; harmless for CSS tab)
    disposeRef.current?.dispose();
    disposeRef.current = setupAutoCloseTags(editor, monaco);
    // Scroll to end after first paint so learner sees where to type
    requestAnimationFrame(() => scrollToEnd(editor));
  }, []);

  useEffect(() => () => disposeRef.current?.dispose(), []);

  const switchTab = useCallback(
    (tab) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
      // After React re-renders the editor with the new value, scroll to end
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToEnd(editorRef.current));
      });
    },
    [activeTab]
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.tabBar}>
        {["css", "html"].map((key) => (
          <button
            key={key}
            type="button"
            style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}
            onClick={() => switchTab(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ ...styles.editor, height }}>
        <Editor
          key={activeTab}
          height={height}
          language={currentLang}
          value={currentValue}
          theme="vs-dark"
          onChange={handleChange}
          beforeMount={configureMonacoDiagnosticsOff}
          onMount={handleMount}
          options={MONACO_OPTIONS}
        />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    borderRadius: "8px",
    border: "1px solid #1e2733",
    overflow: "hidden",
    background: "#1e1e1e",
    marginBottom: "16px",
  },
  tabBar: {
    display: "flex",
    gap: "2px",
    padding: "6px 8px 0",
    background: "#13151f",
    borderBottom: "1px solid #2d3748",
  },
  tab: {
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    background: "transparent",
    border: "none",
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    color: "#64748b",
    cursor: "pointer",
  },
  tabActive: {
    color: "#c4b5fd",
    background: "#1e1e1e",
  },
  editor: { minHeight: 0 },
};

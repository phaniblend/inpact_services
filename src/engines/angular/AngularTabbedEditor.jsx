import { useState, useMemo, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { htmlAutoCloseTags } from "../codemirrorHtmlAutoClose.js";

const TAB_ORDER = ["ts", "html", "css"];
const TAB_LABELS = { ts: "TypeScript", html: "HTML", css: "CSS" };

const extensionsByTab = {
  ts: [javascript({ typescript: true })],
  html: [htmlLang(), htmlAutoCloseTags()],
  css: [cssLang()],
};

const basicSetup = {
  lineNumbers: true,
  highlightActiveLineGutter: true,
  highlightSpecialChars: true,
  history: true,
  foldGutter: true,
  drawSelection: true,
  dropCursor: true,
  allowMultipleSelections: true,
  indentOnInput: true,
  syntaxHighlighting: true,
  bracketMatching: true,
  closeBrackets: true,
  autocompletion: true,
  rectangularSelection: true,
  crosshairCursor: true,
  highlightActiveLine: true,
  highlightSelectionMatches: true,
  closeBracketsKeymap: true,
  defaultKeymap: true,
  searchKeymap: true,
  historyKeymap: true,
  foldKeymap: true,
  completionKeymap: true,
  lintKeymap: true,
  tabSize: 2,
};

/**
 * Three-tab code editor for Angular: TypeScript, HTML, CSS.
 * value: { ts: string, html: string, css: string }
 * onChange: (value: { ts, html, css }) => void
 * placeholder: { ts?: string, html?: string, css?: string } — cleared on first focus when content matches
 */
export default function AngularTabbedEditor({
  value = {},
  onChange,
  height = "240px",
  tabs = ["ts", "html", "css"],
  placeholder: placeholderByTab = {},
}) {
  const [activeTab, setActiveTab] = useState(tabs[0] || "ts");
  const ts = value.ts ?? "";
  const htmlVal = value.html ?? "";
  const cssVal = value.css ?? "";

  const currentValue = useMemo(() => {
    if (activeTab === "ts") return ts;
    if (activeTab === "html") return htmlVal;
    return cssVal;
  }, [activeTab, ts, htmlVal, cssVal]);

  const handleEditorChange = useCallback(
    (newVal) => {
      if (activeTab === "ts") onChange({ ...value, ts: newVal });
      else if (activeTab === "html") onChange({ ...value, html: newVal });
      else onChange({ ...value, css: newVal });
    },
    [activeTab, value, onChange]
  );

  const activePlaceholder = (placeholderByTab && placeholderByTab[activeTab]) ?? "";
  const clearOnFocusExtension = useMemo(() => {
    if (!activePlaceholder) return [];
    const ph = activePlaceholder;
    return [
      EditorView.domEventHandlers({
        focus(_event, view) {
          const cur = view.state.doc.toString();
          if (cur.trim() === String(ph).trim()) {
            view.dispatch({ changes: { from: 0, to: cur.length, insert: "" } });
            handleEditorChange("");
          }
        },
      }),
    ];
  }, [activePlaceholder, handleEditorChange]);

  const extensions = useMemo(
    () => [...(extensionsByTab[activeTab] ?? extensionsByTab.ts), ...clearOnFocusExtension],
    [activeTab, clearOnFocusExtension]
  );

  const visibleTabs = Array.isArray(tabs) && tabs.length ? tabs : TAB_ORDER;

  return (
    <div style={styles.wrap}>
      <div style={styles.tabBar}>
        {visibleTabs.map((key) => (
          <button
            key={key}
            type="button"
            style={{
              ...styles.tab,
              ...(activeTab === key ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(key)}
          >
            {TAB_LABELS[key] ?? key}
          </button>
        ))}
      </div>
      <div style={styles.editor}>
        <CodeMirror
          value={currentValue}
          height={height}
          theme={oneDark}
          extensions={extensions}
          onChange={handleEditorChange}
          basicSetup={basicSetup}
          style={styles.cm}
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
    background: "#1a1d2e",
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
    letterSpacing: "0.04em",
    background: "transparent",
    border: "none",
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    color: "#64748b",
    cursor: "pointer",
    transition: "color 0.15s, background 0.15s",
  },
  tabActive: {
    color: "#c4b5fd",
    background: "#1a1d2e",
    marginBottom: "-1px",
    borderBottom: "1px solid #1a1d2e",
  },
  editor: {
    minHeight: 0,
  },
  cm: {
    fontSize: "15px",
  },
};

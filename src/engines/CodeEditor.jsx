import Editor from "@monaco-editor/react";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { configureMonacoDiagnosticsOff, MONACO_SHARED_OPTIONS } from "./monacoEditorConfig.js";
import { registerReactSnippetPacks, SNIPPET_PACK_IDS } from "./monacoReactSnippetPacks.js";

/**
 * Auto-insert a closing tag when the user types '>'.
 * Works for JSX in javascript/typescript mode where Monaco's built-in
 * auto-closing doesn't apply.
 *
 * Returns a disposable so callers can clean up on unmount.
 */
function setupAutoCloseTags(editor, monaco) {
  let applying = false;

  return editor.onDidChangeModelContent((event) => {
    if (applying) return;
    const model = editor.getModel();
    if (!model) return;

    for (const change of event.changes) {
      // Only act on a single '>' being typed (not paste)
      if (change.text !== ">") continue;

      const line = change.range.startLineNumber;
      const col = change.range.startColumn; // 1-indexed column where '>' landed

      // Full line after the insert; text BEFORE '>' is substring(0, col-1)
      const lineText = model.getLineContent(line);
      const beforeGt = lineText.substring(0, col - 1);

      // Match an opening JSX/HTML tag: <tagName or <tagName attrs...
      // Reject closing tags (</...) and self-closing (.../)
      // (?<!\w) ensures we don't match TypeScript generics like useState<string>
      // where '<' is immediately preceded by a word character.
      const tagMatch = beforeGt.match(/(?<!\w)<([a-zA-Z][a-zA-Z0-9.-]*)(?:\s[^>]*)?$/);
      if (!tagMatch) continue;
      if (beforeGt.trimEnd().endsWith("/")) continue; // already self-closing

      const tagName = tagMatch[1];

      // Void elements never need a closing tag
      const voidTags = new Set([
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
      ]);
      if (voidTags.has(tagName.toLowerCase())) continue;

      // Cursor is now at col+1 (after the '>').  Insert closing tag there.
      const cursorCol = col + 1;
      const closeTag = `</${tagName}>`;

      applying = true;
      editor.executeEdits("auto-close-tag", [
        {
          range: new monaco.Range(line, cursorCol, line, cursorCol),
          text: closeTag,
        },
      ]);
      // Park cursor between the two tags, not at the end of </tag>
      editor.setPosition({ lineNumber: line, column: cursorCol });
      applying = false;
      break;
    }
  });
}

/**
 * Single-file Monaco-based code editor.
 *
 * Props:
 *   value              — current code string
 *   onChange           — (newValue: string) => void
 *   height             — CSS height string, default "240px"
 *   language           — monaco language id, default "javascript"
 *   cursorAtStartOfLine — 1-based line number; place cursor at start of that line
 *   cursorAtEndOfLine   — 1-based line number; place cursor at end of that line
 *   placeholderClearOnFocus — if set, first editor focus while value matches (trim) clears to ""
 *   focusOnMount — call editor.focus() after positioning (default true; set false when using placeholderClearOnFocus so seed text is not wiped on load)
 *   onSubmitShortcut — Ctrl+Shift+Enter / ⌘⇧↵ (Monaco is iframe-hosted; parent window key handlers never see these keys)
 *   snippetPacks — ['react-ts'] and/or ['react'] — which React snippet packs to merge for completions (see monacoReactSnippetPacks.js)
 */
export default function CodeEditor({
  value = "",
  onChange,
  height = "480px",
  language = "javascript",
  cursorAtStartOfLine,
  cursorAtEndOfLine,
  placeholderClearOnFocus,
  focusOnMount = true,
  onSubmitShortcut,
  snippetPacks = [],
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const disposeRef = useRef(null);
  const snippetDisposableRef = useRef(null);
  const placeholderRef = useRef(placeholderClearOnFocus);
  const onChangeRef = useRef(onChange);
  const onSubmitShortcutRef = useRef(onSubmitShortcut);
  const [monacoMountGen, setMonacoMountGen] = useState(0);
  const snippetPacksKey = useMemo(
    () => JSON.stringify([...(snippetPacks || [])].sort()),
    [snippetPacks]
  );

  placeholderRef.current = placeholderClearOnFocus;
  onChangeRef.current = onChange;
  onSubmitShortcutRef.current = onSubmitShortcut;

  const applyPosition = useCallback(
    (editor) => {
      if (!editor) return;
      const model = editor.getModel();
      if (!model) return;
      const totalLines = model.getLineCount();

      let line, column;
      if (cursorAtStartOfLine != null) {
        line = Math.min(cursorAtStartOfLine, totalLines);
        column = 1;
      } else if (cursorAtEndOfLine != null) {
        line = Math.min(cursorAtEndOfLine, totalLines);
        column = model.getLineMaxColumn(line);
      } else {
        line = totalLines;
        column = model.getLineMaxColumn(totalLines);
      }

      editor.setPosition({ lineNumber: line, column });
      editor.revealLineInCenter(line);
      if (focusOnMount) editor.focus();
    },
    [cursorAtStartOfLine, cursorAtEndOfLine, focusOnMount]
  );

  useEffect(() => {
    if (editorRef.current) applyPosition(editorRef.current);
  }, [applyPosition]);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return undefined;
    snippetDisposableRef.current?.dispose();
    snippetDisposableRef.current = null;
    const allowed = new Set(SNIPPET_PACK_IDS);
    const ids = (snippetPacks || []).filter((id) => allowed.has(id));
    if (!ids.length) return undefined;
    snippetDisposableRef.current = registerReactSnippetPacks(monaco, ids);
    return () => {
      snippetDisposableRef.current?.dispose();
      snippetDisposableRef.current = null;
    };
  }, [snippetPacksKey, monacoMountGen]);

  const handleMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      disposeRef.current?.dispose();
      const autoClose = setupAutoCloseTags(editor, monaco);
      const submitShortcutId = editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        () => {
          onSubmitShortcutRef.current?.();
        }
      );
      const clearPlaceholder = editor.onDidFocusEditorWidget(() => {
        const ph = placeholderRef.current;
        if (ph == null || ph === "") return;
        const model = editor.getModel();
        if (!model) return;
        const cur = model.getValue();
        if (cur.trim() !== String(ph).trim()) return;
        onChangeRef.current?.("");
      });
      disposeRef.current = {
        dispose() {
          snippetDisposableRef.current?.dispose();
          snippetDisposableRef.current = null;
          autoClose.dispose();
          clearPlaceholder.dispose();
          if (submitShortcutId != null && typeof editor.removeCommand === "function") {
            try {
              editor.removeCommand(submitShortcutId);
            } catch {
              /* ignore */
            }
          }
        },
      };

      setMonacoMountGen((g) => g + 1);
      requestAnimationFrame(() => applyPosition(editor));
    },
    [applyPosition]
  );

  useEffect(() => () => disposeRef.current?.dispose(), []);

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme="vs"
      onChange={(val) => onChange(val ?? "")}
      beforeMount={configureMonacoDiagnosticsOff}
      onMount={handleMount}
      options={{
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
      }}
    />
  );
}

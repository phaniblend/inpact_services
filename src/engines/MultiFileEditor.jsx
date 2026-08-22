import { useMemo, useState } from "react";
import CodeEditor from "./CodeEditor";

function hasFileKey(files, name) {
  return typeof name === "string" && name !== "" && Object.prototype.hasOwnProperty.call(files, name);
}

function parseAnswer(raw) {
  try {
    const parsed = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object") return null;
    const files = parsed.files && typeof parsed.files === "object" ? parsed.files : {};
    const normalized = Object.fromEntries(
      Object.entries(files).map(([k, v]) => [String(k), typeof v === "string" ? v : String(v ?? "")])
    );
    const fileNames = Object.keys(normalized);
    const activeFile =
      typeof parsed.activeFile === "string" && hasFileKey(normalized, parsed.activeFile)
        ? parsed.activeFile
        : fileNames[0] || null;
    return { files: normalized, activeFile };
  } catch {
    return null;
  }
}

function stringifyAnswer(files, activeFile) {
  return JSON.stringify({ activeFile, files });
}

/** Monaco language id from filename (default matches parent `language` prop). */
function languageForFileName(fileName, fallback) {
  const n = String(fileName || "").toLowerCase();
  if (n.endsWith(".css")) return "css";
  if (n.endsWith(".tsx")) return "typescript";
  if (n.endsWith(".ts")) return "typescript";
  if (n.endsWith(".jsx")) return "javascript";
  if (n.endsWith(".js")) return "javascript";
  if (n.endsWith(".json")) return "json";
  if (n.endsWith(".html")) return "html";
  return fallback || "typescript";
}

export default function MultiFileEditor({
  value = "",
  onChange,
  height = "480px",
  defaultFileName = "App.tsx",
  language = "typescript",
  /** Per-file content when the lesson step loaded (from engine). Takes precedence over seed-based placeholderByFile so carry-forward matches focus-clear. */
  focusBaselineByFile,
  /** Per-file seed strings: fallback when focusBaselineByFile is unset (first paint before effect) or missing a tab. */
  placeholderByFile,
  /** When false (default), never clear editor on focus — avoids wiping carry-forward code on later steps. */
  clearPlaceholderOnFirstFocus = false,
  /** Passed to CodeEditor — Ctrl+Shift+Enter / ⌘⇧↵ */
  onSubmitShortcut,
  /** Passed to CodeEditor — enabled React snippet pack ids */
  snippetPacks = [],
}) {
  const parsed = useMemo(() => parseAnswer(value), [value]);
  const files = parsed?.files ?? { [defaultFileName]: "" };
  const fileNames = Object.keys(files);
  const activeFile = parsed?.activeFile ?? fileNames[0];
  const activeCode = files[activeFile] ?? "";
  const editorLanguage = languageForFileName(activeFile, language);
  const baselineFromStep =
    focusBaselineByFile &&
    typeof focusBaselineByFile === "object" &&
    activeFile &&
    hasFileKey(focusBaselineByFile, activeFile)
      ? String(focusBaselineByFile[activeFile] ?? "")
      : "";
  const propRaw =
    placeholderByFile && typeof placeholderByFile === "object" && hasFileKey(placeholderByFile, activeFile)
      ? String(placeholderByFile[activeFile] ?? "")
      : "";
  const candidateBaseline = baselineFromStep.trim() ? baselineFromStep : propRaw;
  const placeholderClearOnFocus =
    clearPlaceholderOnFirstFocus && candidateBaseline.trim() ? candidateBaseline : undefined;
  const [newFileName, setNewFileName] = useState("");

  function updateFileCode(code) {
    onChange(stringifyAnswer({ ...files, [activeFile]: code ?? "" }, activeFile));
  }

  function addFile() {
    const raw = (newFileName || "").trim();
    if (!raw) return;
    const fileName = raw.includes(".") ? raw : `${raw}.ts`;
    if (files[fileName]) {
      setNewFileName("");
      return;
    }
    onChange(stringifyAnswer({ ...files, [fileName]: "" }, fileName));
    setNewFileName("");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", height, minHeight: height }}>
      <div style={{ borderRight: "1px solid #e2e8f0", background: "#f8fafc", padding: "8px", overflowY: "auto" }}>
        <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "8px" }}>
          FILES
        </div>
        {fileNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(stringifyAnswer(files, name))}
            style={{
              width: "100%",
              textAlign: "left",
              marginBottom: "6px",
              padding: "8px 10px",
              borderRadius: "6px",
              border: activeFile === name ? "1px solid #0891b2" : "1px solid #cbd5e1",
              background: activeFile === name ? "#e0f2fe" : "#ffffff",
              color: "#0f172a",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {name}
          </button>
        ))}
        <div style={{ marginTop: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
          <input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="new file (e.g. store.ts)"
            style={{
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "6px",
              padding: "7px 8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "12px",
            }}
          />
          <button
            type="button"
            onClick={addFile}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #0891b2",
              background: "#0891b2",
              color: "#fff",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            + Add file
          </button>
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <CodeEditor
          key={activeFile}
          value={activeCode}
          onChange={updateFileCode}
          height={height}
          language={editorLanguage}
          placeholderClearOnFocus={placeholderClearOnFocus}
          focusOnMount={!placeholderClearOnFocus}
          onSubmitShortcut={onSubmitShortcut}
          snippetPacks={snippetPacks}
        />
      </div>
    </div>
  );
}

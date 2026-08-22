/**
 * Curated React snippet packs inspired by VS Code "React Snippets" / "React TypeScript Snippets" style extensions.
 * Registered via Monaco completion providers (InsertAsSnippet).
 */

/** @typedef {{ label: string, insertText: string, documentation?: string, detail?: string, filterText?: string }} MonacoSnippetItem */

/** Snippets with TypeScript types (React + TS extension style) */
export const REACT_TS_SNIPPETS = /** @type {MonacoSnippetItem[]} */ ([
  {
    label: "imr",
    detail: "Import React",
    insertText: "import React from 'react';",
    documentation: "Default React import",
    filterText: "imr import react",
  },
  {
    label: "imrs",
    detail: "Import React + useState",
    insertText: "import React, { useState } from 'react';",
    documentation: "React and useState",
    filterText: "imrs useState",
  },
  {
    label: "imrse",
    detail: "Import React + useState + useEffect",
    insertText: "import React, { useState, useEffect } from 'react';",
    filterText: "imrse useEffect",
  },
  {
    label: "usf",
    detail: "useState (typed)",
    insertText: "const [${1:state}, set${2:setState}] = useState<${3:type}>(${4:initial});",
    documentation: "useState with generic type",
    filterText: "useState typed",
  },
  {
    label: "useState",
    detail: "useState (typed)",
    insertText: "const [${1:state}, set${2:setState}] = useState<${3:type}>(${4:initial});",
    documentation: "Alias for usf",
    filterText: "use state hook typed",
  },
  {
    label: "usfnum",
    detail: "useState number",
    insertText: "const [${1:count}, setCount] = useState<number>(${2:0});",
    filterText: "useState number",
  },
  {
    label: "usfbool",
    detail: "useState boolean",
    insertText: "const [${1:open}, setOpen] = useState<boolean>(${2:false});",
    filterText: "useState boolean",
  },
  {
    label: "rfc",
    detail: "Function component (typed)",
    insertText: [
      "type ${1:Props} = {",
      "  ${2:// props}",
      "};",
      "",
      "export default function ${3:Component}({ }: ${1:Props}): JSX.Element {",
      "  return (",
      "    <div>",
      "      ${4://}",
      "    </div>",
      "  );",
      "}",
    ].join("\n"),
    documentation: "Typed function component with Props type",
    filterText: "rfc component",
  },
  {
    label: "rue",
    detail: "useEffect",
    insertText: [
      "useEffect(() => {",
      "  ${1:// effect}",
      "  return () => {",
      "    ${2:// cleanup}",
      "  };",
      "}, [${3:deps}]);",
    ].join("\n"),
    filterText: "useEffect",
  },
  {
    label: "useEffect",
    detail: "useEffect",
    insertText: [
      "useEffect(() => {",
      "  ${1:// effect}",
      "  return () => {",
      "    ${2:// cleanup}",
      "  };",
      "}, [${3:deps}]);",
    ].join("\n"),
    filterText: "use effect hook",
  },
  {
    label: "rafc",
    detail: "Arrow function component (typed)",
    insertText: [
      "type ${1:Props} = {",
      "  ${2:// props}",
      "};",
      "",
      "export const ${3:Component} = ({}: ${1:Props}): JSX.Element => (",
      "  <div>",
      "    ${4://}",
      "  </div>",
      ");",
    ].join("\n"),
    filterText: "rafc arrow component",
  },
  {
    label: "cevt",
    detail: "Typed React change handler",
    insertText: "const handle${1:Name}Change = (e: React.ChangeEvent<HTMLInputElement>) => {\n  ${2:setValue}(e.target.value);\n};",
    filterText: "change event handler input",
  },
  {
    label: "cclk",
    detail: "Typed React click handler",
    insertText: "const handle${1:Name}Click = (e: React.MouseEvent<HTMLButtonElement>) => {\n  ${2://}\n};",
    filterText: "click handler button",
  },
]);

/** Snippets without TS types (React JS extension style) */
export const REACT_JS_SNIPPETS = /** @type {MonacoSnippetItem[]} */ ([
  {
    label: "imr",
    detail: "Import React",
    insertText: "import React from 'react';",
    filterText: "imr import react",
  },
  {
    label: "imrs",
    detail: "Import React + useState",
    insertText: "import React, { useState } from 'react';",
    filterText: "imrs useState",
  },
  {
    label: "imrse",
    detail: "Import React + useState + useEffect",
    insertText: "import React, { useState, useEffect } from 'react';",
    filterText: "imrse useEffect",
  },
  {
    label: "usf",
    detail: "useState",
    insertText: "const [${1:state}, set${2:setState}] = useState(${3:initial});",
    filterText: "useState",
  },
  {
    label: "useState",
    detail: "useState",
    insertText: "const [${1:state}, set${2:setState}] = useState(${3:initial});",
    filterText: "use state hook",
  },
  {
    label: "rfc",
    detail: "Function component",
    insertText: [
      "export default function ${1:Component}() {",
      "  return (",
      "    <div>",
      "      ${2://}",
      "    </div>",
      "  );",
      "}",
    ].join("\n"),
    filterText: "rfc component",
  },
  {
    label: "rue",
    detail: "useEffect",
    insertText: [
      "useEffect(() => {",
      "  ${1:// effect}",
      "  return () => {",
      "    ${2:// cleanup}",
      "  };",
      "}, [${3:deps}]);",
    ].join("\n"),
    filterText: "useEffect",
  },
  {
    label: "useEffect",
    detail: "useEffect",
    insertText: [
      "useEffect(() => {",
      "  ${1:// effect}",
      "  return () => {",
      "    ${2:// cleanup}",
      "  };",
      "}, [${3:deps}]);",
    ].join("\n"),
    filterText: "use effect hook",
  },
  {
    label: "rafc",
    detail: "Arrow function component",
    insertText: [
      "export const ${1:Component} = () => (",
      "  <div>",
      "    ${2://}",
      "  </div>",
      ");",
    ].join("\n"),
    filterText: "rafc arrow component",
  },
  {
    label: "cevt",
    detail: "Change handler",
    insertText: "const handle${1:Name}Change = (e) => {\n  ${2:setValue}(e.target.value);\n};",
    filterText: "change handler input",
  },
  {
    label: "cclk",
    detail: "Click handler",
    insertText: "const handle${1:Name}Click = (e) => {\n  ${2://}\n};",
    filterText: "click handler",
  },
]);

/** Extra hooks: imports + patterns (TS-friendly generics where useful) */
export const REACT_HOOKS_SNIPPETS = /** @type {MonacoSnippetItem[]} */ ([
  {
    label: "imhm",
    detail: "Import useMemo + useCallback + useRef",
    insertText: "import { useMemo, useCallback, useRef } from 'react';",
    filterText: "imhm import hooks memo callback ref",
  },
  {
    label: "imur",
    detail: "Import useReducer",
    insertText: "import { useReducer } from 'react';",
    filterText: "imur import reducer",
  },
  {
    label: "ucb",
    detail: "useCallback",
    insertText: "const ${1:handler} = useCallback((${2:args}) => {\n  ${3://}\n}, [${4:deps}]);",
    filterText: "useCallback",
  },
  {
    label: "umm",
    detail: "useMemo",
    insertText: "const ${1:value} = useMemo(() => ${2:compute()}, [${3:deps}]);",
    filterText: "useMemo",
  },
  {
    label: "urf",
    detail: "useRef",
    insertText: "const ${1:ref} = useRef<${2:HTMLDivElement | null}>(null);",
    filterText: "useRef ref null",
  },
  {
    label: "urfm",
    detail: "useRef mutable box",
    insertText: "const ${1:ref} = useRef(${2:null});",
    filterText: "useRef mutable box",
  },
  {
    label: "urd",
    detail: "useReducer",
    insertText: [
      "const [${1:state}, dispatch] = useReducer(${2:reducer}, ${3:initialState});",
    ].join("\n"),
    filterText: "useReducer reducer",
  },
  {
    label: "usync",
    detail: "useEffect sync with cleanup",
    insertText: [
      "useEffect(() => {",
      "  let cancelled = false;",
      "  async function run() {",
      "    ${1://}",
      "  }",
      "  void run();",
      "  return () => {",
      "    cancelled = true;",
      "  };",
      "}, [${2:deps}]);",
    ].join("\n"),
    filterText: "useEffect async cleanup",
  },
]);

/** Small helpers: logging, fragments, stubs */
export const REACT_QOL_SNIPPETS = /** @type {MonacoSnippetItem[]} */ ([
  {
    label: "clg",
    detail: "console.log",
    insertText: "console.log(${1:value});",
    filterText: "clg console log",
  },
  {
    label: "clgj",
    detail: "console.log JSON",
    insertText: "console.log(JSON.stringify(${1:value}, null, 2));",
    filterText: "console json",
  },
  {
    label: "frag",
    detail: "Fragment",
    insertText: "<>\n  ${1://}\n</>",
    filterText: "fragment <>",
  },
  {
    label: "expdef",
    detail: "export default (named)",
    insertText: "export default ${1:Name};",
    filterText: "export default",
  },
  {
    label: "impn",
    detail: "import named from module",
    insertText: "import { ${2:name} } from '${1:module}';",
    filterText: "import named module",
  },
  {
    label: "awaitp",
    detail: "await in try/catch",
    insertText: [
      "try {",
      "  const ${1:data} = await ${2:promise};",
      "  ${3://}",
      "} catch (${4:err}) {",
      "  console.error(${4:err});",
      "}",
    ].join("\n"),
    filterText: "await try catch async",
  },
]);

const PACKS = {
  "react-ts": REACT_TS_SNIPPETS,
  react: REACT_JS_SNIPPETS,
  "react-hooks": REACT_HOOKS_SNIPPETS,
  "react-qol": REACT_QOL_SNIPPETS,
};

/** Valid pack ids for UI + CodeEditor */
export const SNIPPET_PACK_IDS = /** @type {const} */ (Object.keys(PACKS));

/**
 * @param {import('monaco-editor').editor.IStandaloneCodeEditor} editor
 * @param {typeof import('monaco-editor')} monaco
 * @param {string} packId - 'react-ts' | 'react'
 */
function buildSuggestions(monaco, items) {
  if (!items?.length) return [];
  const { CompletionItemKind, CompletionItemInsertTextRule } = monaco.languages;
  return items.map((item) => ({
    label: item.label,
    kind: CompletionItemKind.Snippet,
    insertText: item.insertText,
    insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: item.documentation || item.detail || item.label,
    detail: item.detail || "React snippet",
    filterText: item.filterText || item.label,
    /** Sort before default TS/DOM symbols (ReadableStream, etc.) */
    sortText: `!snippet-${item.label}`,
  }));
}

/** Merge packs in order; duplicate labels keep the first occurrence (TS pack wins over JS when both on). */
export function mergeReactSnippetItems(packIds) {
  const seen = new Set();
  const out = [];
  for (const id of packIds) {
    const items = PACKS[id];
    if (!items) continue;
    for (const item of items) {
      if (seen.has(item.label)) continue;
      seen.add(item.label);
      out.push(item);
    }
  }
  return out;
}

function snippetMatchesWord(s, wordText) {
  if (!wordText) return true;
  const w = wordText.toLowerCase();
  const ft = String(s.filterText || s.label || "").toLowerCase();
  const lb = String(s.label || "").toLowerCase();
  const ins = String(s.insertText || "").toLowerCase();
  const det = String(s.detail || "").toLowerCase();
  if (ft.includes(w) || lb.startsWith(w)) return true;
  if (ins.includes(w) || det.includes(w)) return true;
  return false;
}

function isImportReactSnippet(s) {
  const t = String(s.insertText || "").trimStart();
  return t.startsWith("import ");
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @param {string[]} packIds - e.g. ['react-ts'] or ['react-ts','react']
 * @returns {{ dispose: () => void }}
 */
export function registerReactSnippetPacks(monaco, packIds) {
  const ids = [...new Set(packIds || [])].filter((id) => PACKS[id]);
  if (!monaco?.languages || ids.length === 0) {
    return { dispose: () => {} };
  }

  const mergedItems = mergeReactSnippetItems(ids);
  const langs = ["typescript", "javascript", "typescriptreact", "javascriptreact"];
  const disposables = [];

  for (const lang of langs) {
    try {
      const d = monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          const wordText = (word.word || "").toLowerCase();
          const lineText = model.getLineContent(position.lineNumber);
          const beforeCursor = lineText.substring(0, position.column - 1);
          const onImportLine = /^\s*import\s/i.test(beforeCursor.trimStart());

          const baseRaw = buildSuggestions(monaco, mergedItems);
          const base = baseRaw.map((s) => ({ ...s, range }));

          let suggestions = wordText ? base.filter((s) => snippetMatchesWord(s, wordText)) : base;

          if (wordText && suggestions.length === 0 && onImportLine) {
            const importSnippets = base.filter((s) => isImportReactSnippet(s));
            suggestions = importSnippets.filter((s) => snippetMatchesWord(s, wordText));
            if (suggestions.length === 0 && importSnippets.length) {
              suggestions = importSnippets;
            }
          }

          return { suggestions };
        },
      });
      disposables.push(d);
    } catch {
      /* language id may not exist in all Monaco builds */
    }
  }

  return {
    dispose() {
      disposables.forEach((x) => {
        try {
          x.dispose();
        } catch {
          /* ignore */
        }
      });
    },
  };
}

/**
 * @param {typeof import('monaco-editor')} monaco
 * @param {string} packId
 * @returns {{ dispose: () => void }}
 */
export function registerReactSnippetPack(monaco, packId) {
  return registerReactSnippetPacks(monaco, packId ? [packId] : []);
}

/** Options for `<select multiple>` — react-ts track */
export const SNIPPET_PACK_OPTIONS_REACT_TS = [
  { id: "react-ts", label: "React + TypeScript" },
  { id: "react", label: "React (JavaScript)" },
  { id: "react-hooks", label: "Extra hooks (memo, ref, reducer)" },
  { id: "react-qol", label: "Quick helpers (log, fragment, import)" },
];

/** react-js track */
export const SNIPPET_PACK_OPTIONS_REACT_JS = [
  { id: "react", label: "React (JavaScript)" },
  { id: "react-hooks", label: "Extra hooks" },
  { id: "react-qol", label: "Quick helpers" },
];

/** @deprecated use SNIPPET_PACK_OPTIONS_REACT_TS */
export const SNIPPET_PACK_CHECKBOXES_REACT_TS = SNIPPET_PACK_OPTIONS_REACT_TS;
/** @deprecated use SNIPPET_PACK_OPTIONS_REACT_JS */
export const SNIPPET_PACK_CHECKBOXES_REACT_JS = SNIPPET_PACK_OPTIONS_REACT_JS;

/**
 * Shared Monaco settings: hide red/yellow squiggles (semantic/syntax diagnostics) in lesson editors.
 * Learners still get real validation from Check → /api/lessons/validate.
 */

/** @param {any} monaco */
export function configureMonacoDiagnosticsOff(monaco) {
  if (!monaco?.languages) return;
  const ts = monaco.languages.typescript;
  if (ts?.javascriptDefaults && ts?.typescriptDefaults) {
    const opts = {
      noSemanticValidation: true,
      noSyntaxValidation: true,
    };
    ts.javascriptDefaults.setDiagnosticsOptions(opts);
    ts.typescriptDefaults.setDiagnosticsOptions(opts);
  }
  try {
    monaco.languages.css?.cssDefaults?.setOptions?.({ validate: false });
  } catch {
    /* optional API */
  }
  try {
    monaco.languages.html?.htmlDefaults?.setOptions?.({ validate: false });
  } catch {
    /* optional API */
  }
  try {
    monaco.languages.json?.jsonDefaults?.setDiagnosticsOptions?.({ validate: false });
  } catch {
    /* optional API */
  }
}

/** Base editor options merged into CodeEditor and CssTabsEditor. */
export const MONACO_SHARED_OPTIONS = {
  renderValidationDecorations: "off",
  unicodeHighlight: {
    ambiguousCharacters: false,
    invisibleCharacters: false,
  },
};

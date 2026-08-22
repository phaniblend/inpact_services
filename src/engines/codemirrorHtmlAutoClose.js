/**
 * CodeMirror 6: when the user types `>` to finish an opening HTML tag, insert the closing tag
 * and leave the cursor between them (same behaviour as CodeEditor.jsx / Monaco for JSX).
 */
import { Annotation } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const autoCloseTagTxn = Annotation.define();

const VOID_HTML = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * @returns {import("@codemirror/state").Extension}
 */
export function htmlAutoCloseTags() {
  return EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;
    if (update.transactions.some((t) => t.annotation(autoCloseTagTxn))) return;

    update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
      if (inserted.length !== 1 || inserted.sliceString(0) !== ">") return;

      const posAfterGt = fromB + 1;
      const doc = update.state.doc;
      const line = doc.lineAt(posAfterGt);
      const beforeGt = line.text.slice(0, posAfterGt - line.from);

      // Opening tag only — not TS generics (word char before <) or closing tags (</)
      const tagMatch = beforeGt.match(/(?<!\w)<([a-zA-Z][a-zA-Z0-9.-]*)(?:\s[^>]*)?$/);
      if (!tagMatch) return;
      if (beforeGt.trimEnd().endsWith("/")) return;

      const tagName = tagMatch[1];
      if (VOID_HTML.has(tagName.toLowerCase())) return;

      const close = `</${tagName}>`;
      update.view.dispatch({
        changes: { from: posAfterGt, insert: close },
        selection: { anchor: posAfterGt },
        annotations: autoCloseTagTxn.of(true),
      });
    });
  });
}

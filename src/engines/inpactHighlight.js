import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import plaintext from "highlight.js/lib/languages/plaintext";

let registered = false;

function ensureHljs() {
  if (registered) return;
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("js", javascript);
  hljs.registerLanguage("jsx", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("ts", typescript);
  hljs.registerLanguage("tsx", typescript);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("html", xml);
  hljs.registerLanguage("plaintext", plaintext);
  hljs.registerLanguage("text", plaintext);
  registered = true;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Highlight fenced code for trusted lesson/deep-dive JSON. Returns HTML for <code class="hljs">.
 * @param {string} lang - fence language tag (e.g. jsx, tsx, typescript)
 * @param {string} code
 */
export function highlightFencedCode(lang, code) {
  ensureHljs();
  const raw = String(code ?? "");
  const l = String(lang || "text").toLowerCase().trim();
  const candidates = [l, "tsx", "jsx", "typescript", "javascript", "xml", "plaintext"];
  const picked = candidates.find((c) => c && hljs.getLanguage(c));
  try {
    if (picked) {
      return hljs.highlight(raw, { language: picked, ignoreIllegals: true }).value;
    }
  } catch {
    /* fall through */
  }
  return escapeHtml(raw);
}

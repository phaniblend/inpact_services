/**
 * Wire Angular Template (HTML), TypeScript, and CSS tabs for validation and preview.
 *
 * - **TS tab**: Component class and @Component decorator (may have inline template and/or styles).
 * - **HTML tab**: Template markup; on submit it is merged into TS as the `template: \`...\`` value
 *   (so the validator sees one TS file with the template). You can use inline `template: \`...\`` in TS,
 *   or `templateUrl: ""` in TS and put markup in the HTML tab — both are merged on "CHECK MY CODE{CTRL+SHIFT+ENTER}{ctrl+shift+enter}".
 *   If the HTML tab is empty, the engine sends the TS as-is so an inline template is validated correctly.
 * - **CSS tab**: Component styles; on submit they are merged into TS as `styles: [\`...\`]` (or
 *   replace existing styles in the decorator) so the full component is validated.
 *
 * Split (splitAngularSeed): seed code with inline template is split into TS (with template: ``)
 * and HTML for the tabbed editor. Merge (mergeAngularTsWithHtml, mergeAngularCssIntoTS): on
 * "CHECK MY CODE{CTRL+SHIFT+ENTER}{ctrl+shift+enter}", TS + HTML + CSS are combined into a single TS string and sent to the validator.
 */

/**
 * Escape HTML content for use inside a JS template literal (backticks).
 * @param {string} html
 * @returns {string}
 */
function escapeForTemplateLiteral(html) {
  if (typeof html !== "string") return "";
  return html.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

/**
 * Replace the first template: '...' | template: "..." | template: `...` in TS with template: `htmlContent`.
 * So the component uses the HTML tab as its template.
 * @param {string} tsCode - TypeScript component source (may have inline template)
 * @param {string} htmlContent - Content of the HTML tab
 * @returns {string} Single TS string with template set to htmlContent
 */
export function mergeAngularTsWithHtml(tsCode, htmlContent) {
  if (typeof tsCode !== "string") return "";
  const html = typeof htmlContent === "string" ? htmlContent : "";

  // Match template: followed by a string (single-quoted, double-quoted, or backtick).
  // Single/double: match until next unescaped quote. Backtick: match until next unescaped backtick.
  const singleQuoted = /template\s*:\s*'((?:[^'\\]|\\.)*)'/;
  const doubleQuoted = /template\s*:\s*"((?:[^"\\]|\\.)*)"/;
  const backtick = /template\s*:\s*`((?:[^`\\]|\\.)*)`/;

  const escaped = escapeForTemplateLiteral(html);
  const replacement = `template: \`${escaped}\``;

  if (backtick.test(tsCode)) {
    return tsCode.replace(backtick, replacement);
  }
  if (singleQuoted.test(tsCode)) {
    return tsCode.replace(singleQuoted, replacement);
  }
  if (doubleQuoted.test(tsCode)) {
    return tsCode.replace(doubleQuoted, replacement);
  }

  // templateUrl: "" or templateUrl: '' — use HTML tab as the template (replaced with inline template on merge)
  const templateUrlEmptyDouble = /templateUrl\s*:\s*""/;
  const templateUrlEmptySingle = /templateUrl\s*:\s*''/;
  if (templateUrlEmptyDouble.test(tsCode)) {
    return tsCode.replace(templateUrlEmptyDouble, replacement);
  }
  if (templateUrlEmptySingle.test(tsCode)) {
    return tsCode.replace(templateUrlEmptySingle, replacement);
  }

  // template: with no value (incomplete) — e.g. "template: \n  }" or "template:  }" — replace with template: `html`
  if (/template\s*:\s*(?=[\s\n]*(?:\}|,|$))/.test(tsCode)) {
    return tsCode.replace(/template\s*:\s*(?=[\s\n]*(?:\}|,|$))/, replacement);
  }

  // No template: or templateUrl: "" found — try to inject before the closing of @Component (before the last })
  const injectBeforeDecoratorEnd = /(@Component\s*\(\s*\{[\s\S]*?)(\}\s*\))/;
  const match = tsCode.match(injectBeforeDecoratorEnd);
  if (match) {
    return tsCode.replace(injectBeforeDecoratorEnd, `$1  ${replacement},\n$2`);
  }
  return tsCode;
}

/**
 * Replace or inject styles in @Component so the CSS tab content is part of the component.
 * Matches styles: [`...`] or styles: ["..."] and replaces with the cssContent; if none found, injects before the closing of @Component({ ... }).
 * @param {string} tsCode - TypeScript component source
 * @param {string} cssContent - Content of the CSS tab
 * @returns {string} TS with styles set to cssContent
 */
export function mergeAngularCssIntoTS(tsCode, cssContent) {
  if (typeof tsCode !== "string") return "";
  const css = typeof cssContent === "string" ? cssContent : "";
  const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
  const replacement = `styles: [\`${escaped}\`]`;

  const backtickStyles = /styles\s*:\s*\[\s*`(?:[^`\\]|\\.)*`\s*]/;
  const doubleQuotedStyles = /styles\s*:\s*\[\s*"(?:[^"\\]|\\.)*"\s*]/;
  if (backtickStyles.test(tsCode)) {
    return tsCode.replace(backtickStyles, replacement);
  }
  if (doubleQuotedStyles.test(tsCode)) {
    return tsCode.replace(doubleQuotedStyles, replacement);
  }
  const injectBeforeDecoratorEnd = /(@Component\s*\(\s*\{[\s\S]*?)(\}\s*\))/;
  if (injectBeforeDecoratorEnd.test(tsCode)) {
    return tsCode.replace(injectBeforeDecoratorEnd, `$1  ${replacement},\n$2`);
  }
  return tsCode;
}

/**
 * Extract the first template value from Angular TS seed and split into TS (with empty template) + HTML.
 * Used to populate initial code so learners edit template in the HTML tab.
 * @param {string} seedCode - Full seed (TS with inline template)
 * @returns {{ tsPart: string, htmlPart: string }}
 */
export function splitAngularSeed(seedCode) {
  if (typeof seedCode !== "string") return { tsPart: "", htmlPart: "" };

  const singleQuoted = /template\s*:\s*'((?:[^'\\]|\\.)*)'/;
  const doubleQuoted = /template\s*:\s*"((?:[^"\\]|\\.)*)"/;
  const backtick = /template\s*:\s*`((?:[^`\\]|\\.)*)`/;

  let htmlPart = "";
  let tsPart = seedCode;

  const tryBacktick = seedCode.match(backtick);
  if (tryBacktick) {
    htmlPart = tryBacktick[1].replace(/\\`/g, "`").replace(/\\\\/g, "\\");
    tsPart = seedCode.replace(backtick, "template: ``");
    return { tsPart, htmlPart };
  }
  const trySingle = seedCode.match(singleQuoted);
  if (trySingle) {
    htmlPart = trySingle[1].replace(/\\./g, (m) => (m === "\\'" ? "'" : m));
    tsPart = seedCode.replace(singleQuoted, "template: ``");
    return { tsPart, htmlPart };
  }
  const tryDouble = seedCode.match(doubleQuoted);
  if (tryDouble) {
    htmlPart = tryDouble[1].replace(/\\./g, (m) => (m === '\\"' ? '"' : m));
    tsPart = seedCode.replace(doubleQuoted, "template: ``");
    return { tsPart, htmlPart };
  }

  return { tsPart: seedCode, htmlPart: "" };
}

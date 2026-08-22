/**
 * Inject variables into prompt templates.
 * Placeholders: {{TRACK}}, {{LESSON_TITLE}}, {{CODE_SO_FAR}}, {{COMPLETED_STEPS_JSON}}, etc.
 * See src/ai-prompt.txt for the full variable list.
 */

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

/**
 * @param {string} template - Raw template with {{VAR}} placeholders
 * @param {Record<string, string | number | object>} variables - Key-value map (objects are JSON.stringified)
 * @returns {string}
 */
export function injectVariables(template, variables = {}) {
  return template.replace(PLACEHOLDER_REGEX, (_, key) => {
    const value = variables[key];
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  });
}

export default injectVariables;

/**
 * Assist-module funda prerequisites — SpecForge drafts can declare funda lesson titles the
 * apprentice should have completed first. We check those against coreLessonManifest (+ Module
 * Library published tags) so ID knows what's missing before they publish.
 */
import manifest from "../id-module/coreLessonManifest.json" with { type: "json" };

const FUNDA_TRACKS = new Set(["backend-fundamentals", "coding-fundamentals", "webapp-fundamentals"]);

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Titles from the lessons catalog that look like fundamentals (track name or moduleId). */
export function fundaLessonCatalog() {
  return (manifest.entries || [])
    .filter(
      (e) =>
        FUNDA_TRACKS.has(e.track) ||
        /fundamental/i.test(e.track || "") ||
        /fundamental|funda/i.test(e.moduleId || ""),
    )
    .map((e) => ({
      lessonKey: e.lessonKey,
      title: e.title,
      track: e.track,
      published: e.published !== false,
    }));
}

/**
 * @param {string[]} suggested — funda titles/keys from Gemini draft
 * @param {{ publishedModuleTags?: string[] }} [opts]
 * @returns {{ present: string[], missing: string[] }}
 */
export function classifySuggestedFundas(suggested, opts = {}) {
  const wanted = (suggested || []).map((s) => String(s).trim()).filter(Boolean);
  if (wanted.length === 0) return { present: [], missing: [] };

  const catalog = fundaLessonCatalog();
  const publishedTags = new Set((opts.publishedModuleTags || []).map(normalize));

  const present = [];
  const missing = [];

  for (const label of wanted) {
    const n = normalize(label);
    const inCore = catalog.some(
      (c) =>
        c.published &&
        (normalize(c.title) === n ||
          normalize(c.lessonKey) === n ||
          normalize(c.title).includes(n) ||
          n.includes(normalize(c.title))),
    );
    const inLibrary = [...publishedTags].some((t) => t === n || t.includes(n) || n.includes(t));
    if (inCore || inLibrary) present.push(label);
    else missing.push(label);
  }

  return { present, missing };
}

/** Stable module tag for a generated funda assist lesson (never product-specific). */
export function fundaModuleTag(label) {
  const slug = String(label || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return slug ? `funda-${slug}` : `funda-prereq`;
}

/** Spec passed to generateAssistModule for a selected missing funda. */
export function fundaGenerationSpec(label, { parentTag = "" } = {}) {
  const tag = fundaModuleTag(label);
  return {
    moduleTag: tag,
    concept: `Fundamental prerequisite: ${label}`,
    build: `A small standalone drill that teaches "${label}" with a generic worked example — never a named product.`,
    keyTeaching: `The core idea of "${label}" an apprentice needs before related assistance lessons${parentTag ? ` (e.g. ${parentTag})` : ""}.`,
    newConcepts: "fundamentals, prerequisite",
  };
}

/**
 * Task -> real IAAL-main core lesson matching (FE webapp-blocks + BE backend-blocks/fundamentals).
 * Text-overlap via scoreOverlap, plus an analogOf boost so product tasks like "vote up/down"
 * land on teaching analogs like be-counter-api.
 */
import { scoreOverlap } from "./matchModules.js";
import manifest from "./coreLessonManifest.json" with { type: "json" };

const CONFIDENCE_AUTO = 0.45;
const CONFIDENCE_CURATED = 0.1;
/** Extra score when the query hits a declared analogOf tag (vote → counter-api, etc.). */
const ANALOG_TAG_BOOST = 0.35;

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function analogBoost(query, entry) {
  const q = normalize(query);
  if (!q || !Array.isArray(entry.analogOf) || entry.analogOf.length === 0) return 0;
  let hit = 0;
  for (const tag of entry.analogOf) {
    const t = normalize(tag);
    if (!t) continue;
    if (q.includes(t) || t.split(" ").every((w) => w.length > 2 && q.includes(w))) {
      hit = Math.max(hit, ANALOG_TAG_BOOST);
    }
    // soft synonym: "vote" / "upvote" / "like" against tags containing vote/like/clap
    if (/\bvotes?\b|\bupvotes?\b|\bliked?\b|\bclaps?\b|\breact(?:ion)?s?\b/.test(q) && /vote|like|clap|react|score|counter|qty/.test(t)) {
      hit = Math.max(hit, ANALOG_TAG_BOOST);
    }
    if (/\bcrud\b|\btodos?\b|\bnotes?\b|\bproducts?\b|\bentit(?:y|ies)\b/.test(q) && /crud|todo|entity|resource|catalog/.test(t)) {
      hit = Math.max(hit, ANALOG_TAG_BOOST * 0.85);
    }
  }
  return hit;
}

function scoreEntry(query, entry) {
  const base = scoreOverlap(query, entry.matchText);
  const boost = analogBoost(query, entry);
  return Math.min(1, base + boost);
}

/** query -> ranked lessons from the manifest, highest score first. */
export function rankCoreLessons(query, { side } = {}) {
  return manifest.entries
    .filter((entry) => !side || entry.side === side || (!entry.side && side === "frontend"))
    .map((entry) => ({ ...entry, score: scoreEntry(query, entry) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Best match only, or null if nothing clears the confidence bar. */
export function bestCoreLessonMatch(query, opts) {
  const ranked = rankCoreLessons(query, opts);
  const top = ranked[0];
  return top && top.score >= CONFIDENCE_AUTO ? top : null;
}

/** { auto } if confident, else { curated: [...] }, else { none: true }. */
export function matchCoreLesson(query, opts) {
  const ranked = rankCoreLessons(query, opts);
  const top = ranked[0];
  if (top && top.score >= CONFIDENCE_AUTO) return { auto: top };
  const curated = ranked.filter((m) => m.score >= CONFIDENCE_CURATED).slice(0, 3);
  if (curated.length > 0) return { curated };
  return { none: true };
}

export function coreLessonManifestMeta() {
  return {
    generatedAt: manifest.generatedAt,
    count: manifest.count,
    tracks: manifest.tracks || null,
  };
}

export function lessonByKey(lessonKey) {
  return manifest.entries.find((e) => e.lessonKey === lessonKey) || null;
}

/** Prefer BE analogs when the task trade/text looks backend-shaped. */
export function inferLessonSide(query) {
  const q = normalize(query);
  if (
    /\b(api|endpoint|rest|sql|postgres|database|middleware|jwt|webhook|queue|migration|schema|crud|server|backend|route handler)\b/.test(
      q,
    )
  ) {
    return "backend";
  }
  return null; // search all
}

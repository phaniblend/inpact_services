/**
 * Shared module-matching scorer — used by ID Studio's own "Check Module Library" (server/id-router.js)
 * and by SpecForge's Stage 3 task classifier (server/specforge-router.js) so a task auto-created from
 * a spec is scored against the exact same library a human checks manually. One scorer, one notion of
 * "close enough," used everywhere a task needs to be paired with a tutorial.
 */
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "for", "with", "without",
  "is", "are", "be", "that", "this", "it", "its", "as", "so", "not", "than", "then",
  "at", "by", "from", "into", "onto", "over", "under", "between", "each", "own", "one",
]);

function tokenize(s) {
  return new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOPWORDS.has(w)));
}

/** Fraction of `a`'s significant words that also appear in `b`. Asymmetric on purpose —
 * a short task title matching most of a long module description is still a strong signal. */
export function scoreOverlap(a, b) {
  const wordsA = tokenize(a);
  const wordsB = tokenize(b);
  let hits = 0;
  for (const w of wordsA) if (wordsB.has(w)) hits += 1;
  return hits / Math.max(1, wordsA.size);
}

/** query -> ranked matches across published Module Library issues + the planned catalog.
 * `published` is the raw list of OneDev "Module: <tag>" issues; `catalog` is MODULE_CATALOG. */
export function rankModuleMatches(query, published, catalog) {
  const publishedRanked = published.map((m) => ({
    tag: m.title.replace("Module: ", ""),
    description: m.description,
    status: "published",
    score: scoreOverlap(query, `${m.title} ${m.description}`),
  }));

  const publishedTags = new Set(publishedRanked.map((p) => p.tag));
  const plannedRanked = catalog
    .filter((c) => !publishedTags.has(c.tag))
    .map((c) => ({
      tag: c.tag,
      description: `${c.category} · ${c.tier} · ${c.concept}`,
      status: "planned",
      score: scoreOverlap(query, `${c.tag} ${c.category} ${c.concept} ${c.build} ${c.keyTeaching}`),
    }));

  return [...publishedRanked, ...plannedRanked].filter((m) => m.score > 0.3).sort((a, b) => b.score - a.score);
}

/** Best match only, or null. Used where a task needs a single yes/no wiring decision
 * rather than a ranked list to review. Slightly stricter threshold than the browse view
 * (0.45 vs 0.3) — an auto-wire should be more confident than a "worth a look" suggestion. */
export function bestModuleMatch(query, published, catalog) {
  const ranked = rankModuleMatches(query, published, catalog).filter((m) => m.score >= 0.45);
  return ranked[0] ?? null;
}

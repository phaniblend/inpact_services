/**
 * Algorithm family teaching profiles for INPACT beginner-friendly pedagogy.
 * Used to inject mental model, concept-bridge, and family-specific guidance into algorithm lesson generation.
 * See docs/ALGORITHM_FAMILIES.md for progression examples.
 */

/** @typedef {{ mentalModel: string, conceptBridge: string, visualMetaphor: string, commonConfusions: string[] }} FamilyTeachingProfile */

/** @type {Record<string, FamilyTeachingProfile>} */
export const ALGORITHM_FAMILY_PROFILES = {
  "array-hashmap": {
    mentalModel: "Remember what we have already seen",
    conceptBridge: "Show the learner how to use a lookup structure (e.g. object or Map) to remember seen values and avoid re-scanning.",
    visualMetaphor: "A notebook where we write down what we've seen and check it in one step.",
    commonConfusions: [
      "What do we store as key vs value?",
      "When do we check the structure vs add to it?",
    ],
  },
  "sliding-window": {
    mentalModel: "Move a stretch or window across the array",
    conceptBridge: "Teach the learner to think in terms of a moving segment: when to expand the window, when to shrink it.",
    visualMetaphor: "Highlight a moving segment of the array; show expand and shrink.",
    commonConfusions: [
      "What is the window?",
      "When do we expand?",
      "When do we shrink?",
    ],
  },
  "linked-list": {
    mentalModel: "Walk node by node; no direct indexing",
    conceptBridge: "Add a pointer mental model first: we can only move to next (or prev); we cannot jump by index.",
    visualMetaphor: "Show node-to-node traversal; one step at a time along the chain.",
    commonConfusions: [
      "Why can't we use an index?",
      "How do we avoid losing the head?",
    ],
  },
  "tree": {
    mentalModel: "Explore branches from a root",
    conceptBridge: "Use branch/root visual reasoning; visiting nodes or exploring levels one at a time.",
    visualMetaphor: "Show exploring from the root down branches; one level or one branch at a time.",
    commonConfusions: [
      "Which order do we visit?",
      "What is the base case (empty tree)?",
    ],
  },
  "graph": {
    mentalModel: "Explore a network while avoiding revisits",
    conceptBridge: "Introduce the 'visited' concept before using it; prevent confusion around revisiting nodes.",
    visualMetaphor: "Show visited vs unvisited nodes; paths without going in circles.",
    commonConfusions: [
      "When do we mark visited?",
      "What if there are cycles?",
    ],
  },
  "recursion": {
    mentalModel: "Solve a smaller version of the same lesson",
    conceptBridge: "Explain base case and 'smaller lesson' thinking; do not jump directly into recursive code.",
    visualMetaphor: "Same lesson, smaller input; when does it stop?",
    commonConfusions: [
      "What is the base case?",
      "How is the smaller lesson related to the big one?",
    ],
  },
  "dynamic-programming": {
    mentalModel: "Reuse answers to smaller subproblems",
    conceptBridge: "Introduce 'remembering solved smaller lessons'; focus on reuse, not formula memorization.",
    visualMetaphor: "Fill a table or reuse previous results; avoid doing the same work twice.",
    commonConfusions: [
      "What do we store?",
      "In what order do we solve subproblems?",
    ],
  },
  "stack-queue": {
    mentalModel: "Stack: last in, first out. Queue: first in, first out.",
    conceptBridge: "Use real-life metaphors first: stack = plates or books; queue = line at a counter. Then map to code.",
    visualMetaphor: "Stack: pile of plates. Queue: people in a line.",
    commonConfusions: [
      "When do I use stack vs queue?",
      "What is the cost of push vs pop?",
    ],
  },
  "binary-search": {
    mentalModel: "Cut the search space in half",
    conceptBridge: "Explain sorted prerequisite and midpoint reasoning; focus on eliminating half at each step.",
    visualMetaphor: "Repeatedly cut the range in half; only one half can contain the answer.",
    commonConfusions: [
      "Why must the array be sorted?",
      "What if the target is not found?",
    ],
  },
  "two-pointers": {
    mentalModel: "Two positions moving through the data",
    conceptBridge: "Show how two indices or pointers can move toward each other or in the same direction to avoid nested scans.",
    visualMetaphor: "Two fingers on the array; move them according to the comparison.",
    commonConfusions: [
      "When do we move the left vs right pointer?",
      "How do we avoid missing a pair?",
    ],
  },
  greedy: {
    mentalModel: "Make the best local choice at each step",
    conceptBridge: "Show that sometimes the best small decision leads to the best overall result; when that works vs when it does not.",
    visualMetaphor: "At each step, pick the best option in front of you.",
    commonConfusions: [
      "Does the local best always give the global best?",
      "When is greedy wrong?",
    ],
  },
  backtracking: {
    mentalModel: "Try a choice, explore, then undo if it doesn't lead to a solution",
    conceptBridge: "Introduce try → recurse → undo; emphasize that we explore all options by undoing.",
    visualMetaphor: "Explore a path; if it dead-ends, go back and try another branch.",
    commonConfusions: [
      "When do we backtrack?",
      "What do we undo?",
    ],
  },
};

/** Default family when lesson title cannot be mapped (e.g. generic array lesson). */
const DEFAULT_FAMILY = "array-hashmap";

/**
 * Map a lesson title (or lesson name) to an algorithm family key.
 * Uses simple keyword matching; can be extended with a full curriculum map.
 * @param {string} lessonTitle
 * @returns {string} family key
 */
export function getAlgorithmFamilyFromTitle(lessonTitle) {
  if (!lessonTitle || typeof lessonTitle !== "string") return DEFAULT_FAMILY;
  const t = lessonTitle.toLowerCase();
  if (t.includes("sliding window") || t.includes("substring") || t.includes("window") || t.includes("longest unique")) return "sliding-window";
  if (t.includes("linked list") || t.includes("reverse list") || t.includes("node")) return "linked-list";
  if (t.includes("tree") || t.includes("binary tree") || t.includes("depth") || t.includes("bst")) return "tree";
  if (t.includes("graph") || t.includes("islands") || t.includes("bfs") || t.includes("dfs") || t.includes("course schedule")) return "graph";
  if (t.includes("recursion") || t.includes("factorial") || t.includes("fibonacci") || t.includes("recurse")) return "recursion";
  if (t.includes("dynamic programming") || t.includes("dp") || t.includes("climbing stairs") || t.includes("coin change") || t.includes("memo")) return "dynamic-programming";
  if (t.includes("stack") || t.includes("parentheses") || t.includes("queue")) return "stack-queue";
  if (t.includes("binary search") || t.includes("sorted array") || t.includes("search insert")) return "binary-search";
  if (t.includes("two pointer") || t.includes("pointers") || t.includes("remove duplicate") || t.includes("container with most water")) return "two-pointers";
  if (t.includes("greedy") || t.includes("jump game") || t.includes("activity")) return "greedy";
  if (t.includes("backtrack") || t.includes("permutation") || t.includes("n-queens")) return "backtracking";
  if (t.includes("two sum") || t.includes("hash") || t.includes("map") || t.includes("object")) return "array-hashmap";
  return DEFAULT_FAMILY;
}

/**
 * Get the teaching profile for an algorithm family. Used by the master algorithm prompt.
 * @param {string} family - One of the keys in ALGORITHM_FAMILY_PROFILES
 * @returns {FamilyTeachingProfile}
 */
export function getAlgorithmFamilyTeachingProfile(family) {
  const key = family && ALGORITHM_FAMILY_PROFILES[family] ? family : DEFAULT_FAMILY;
  return ALGORITHM_FAMILY_PROFILES[key];
}

/**
 * Build all variables needed for family-aware algorithm prompt injection.
 * @param {{ lessonTitle: string, track?: string, lessonIndex?: number, language?: string }} params
 * @returns {{ ALGORITHM_FAMILY: string, MENTAL_MODEL: string, CONCEPT_BRIDGE: string, VISUAL_METAPHOR: string, COMMON_CONFUSIONS: string }}
 */
export function getAlgorithmFamilyPromptVars(params) {
  const family = getAlgorithmFamilyFromTitle(params.lessonTitle ?? "");
  const profile = getAlgorithmFamilyTeachingProfile(family);
  return {
    ALGORITHM_FAMILY: family,
    MENTAL_MODEL: profile.mentalModel,
    CONCEPT_BRIDGE: profile.conceptBridge,
    VISUAL_METAPHOR: profile.visualMetaphor,
    COMMON_CONFUSIONS: Array.isArray(profile.commonConfusions) ? profile.commonConfusions.join("; ") : "",
  };
}

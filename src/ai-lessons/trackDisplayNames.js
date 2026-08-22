/**
 * Map internal track id (from UI) to a display name for AI prompts.
 * Ensures prompts receive a human-readable track (e.g. "React - Javascript") so
 * generated content adapts to the track without hardcoding in templates.
 */
const TRACK_DISPLAY_NAMES = {
  "react-js": "React - Javascript",
  "react-ts": "React - TypeScript",
  angular: "Angular",
  "mobile-angular": "Mobile Angular (Ionic + Capacitor)",
  vue: "Vue",
  js: "JavaScript",
  ts: "TypeScript",
  node: "Node.js",
  express: "Express",
  python: "Python",
  css: "CSS",
  sd: "System Design",
  pe: "Production Engineering",
  sec: "Security",
  el: "Engineering Leadership",
  fe: "Frontend Engineering",
  "algo-js": "Algorithms (JavaScript)",
  "algo-ts": "Algorithms (TypeScript)",
  "algo-python": "Algorithms (Python)",
  "algo-java": "Algorithms (Java)",
};

/**
 * @param {string} trackId - Internal track id (e.g. "react-js", "angular")
 * @returns {string} Display name for prompts (e.g. "React - Javascript")
 */
export function getTrackDisplayName(trackId) {
  if (!trackId || typeof trackId !== "string") return "General";
  return TRACK_DISPLAY_NAMES[trackId] ?? trackId;
}

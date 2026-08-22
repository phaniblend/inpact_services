import createINPACTEngine from "../inpact_engine_shared";

/** React · JS track: parallel slot to TS lesson #120 (JSON-driven). Short JS-oriented placeholder. */
const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #120",
      title: "Creating RTK Endpoints — use the TypeScript track",
      body: "This lesson is authored for **React · TypeScript** (multi-file RTK Query + JSONPlaceholder). Switch to the **React · TS** track for the full step-by-step build. On this track, here is a tiny reminder: RTK Query endpoints map to hooks like useGetPostsQuery.",
      usecase: "TS track carries the complete lesson JSON.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Prefer React · TS for lesson #120 (RTK endpoints + typicode)",
      "Recall: createApi + endpoints → generated hooks",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 1",
    paal: "Optional: open React · TS track lesson #120 for the full experience. Export a placeholder component.",
    answer_keywords: ["export", "default"],
    seed_code: "export default function App() {\n  return <p>Use React · TS for lesson #120</p>\n}",
    feedback_correct: "✅ Placeholder complete.",
    feedback_partial: "Add export default.",
    feedback_wrong: "Export a default component",
    expected: "export default",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Placeholder", id: "step1" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 120,
  title: "Creating RTK Endpoints (from zero)",
  shortName: "RTK ENDPOINTS",
});

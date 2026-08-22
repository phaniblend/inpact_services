import createINPACTEngine from "../inpact_engine_shared";

/** React · JS track: parallel slot to TS lesson #121 (JSON-driven). Short pointer to TypeScript track. */
const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #121",
      title: "Query Building in RTK — use the TypeScript track",
      body: "This lesson is authored for **React · TypeScript**: a full **api.ts** walkthrough for `getPosts: builder.query<Post[], void>({ query: () => '/posts' })` and exporting `useGetPostsQuery`. Switch to **React · TS** for the complete micro-step lesson.",
      usecase: "The TS track lesson JSON carries every step and the multi-file editor setup.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Prefer React · TS for lesson #121 (RTK Query builder.query)",
      "Recall: endpoint name → generated useGetPostsQuery hook",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 1",
    paal: "Optional: open React · TS track lesson #121. Export a placeholder component.",
    answer_keywords: ["export", "default"],
    seed_code: "export default function App() {\n  return <p>Use React · TS for lesson #121</p>\n}",
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
  lessonNum: 121,
  title: "Query Building in RTK",
  shortName: "RTK QUERY",
});

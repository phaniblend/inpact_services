import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "React TypeScript",
      title: "Lesson 68",
      body: "Temporarily cleared lesson content.",
      usecase: "Placeholder engine to keep app compilation stable.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: ["This lesson is intentionally empty for now."],
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 68,
  title: "Lesson 68",
  shortName: "TS - L68",
});

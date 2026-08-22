import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #27 (React Hooks)",
      title: "useLayoutEffect vs useEffect",
      body: "A shipment header measures element width to align status badges. With `useEffect`, the first paint can show wrong alignment for one frame. You will compare `useEffect` and `useLayoutEffect` timing and choose the right hook for DOM measurement work.",
      usecase:
        "UI that depends on measured layout (tooltips, sticky headers, chart labels) must avoid visible jump on first paint.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Describe timing difference: `useEffect` after paint vs `useLayoutEffect` before paint",
      "Use `useLayoutEffect` for DOM reads/writes that must happen before paint",
      "Keep non-visual side effects in `useEffect` to avoid blocking paint",
      "Select hook based on user-visible flicker risk",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 3",
    paal: "Create a `ref` for a header element and state for its measured width.",
    answer_keywords: ["useRef", "useState", "offsetWidth"],
    seed_code:
      "import { useRef, useState } from 'react';\n\nexport default function ShipmentHeader() {\n  // Step 1\n}",
    feedback_correct: "Great — measurement state scaffold is in place.",
    feedback_partial: "Add a header ref and width state.",
    feedback_wrong: "Create `headerRef` and `headerWidth` state.",
    expected: "Ref + width state",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 3",
    paal: "Measure width in `useLayoutEffect` and update state before paint.",
    answer_keywords: ["useLayoutEffect", "headerRef.current", "setHeaderWidth"],
    seed_code:
      "import { useLayoutEffect, useRef, useState } from 'react';\n\nexport default function ShipmentHeader() {\n  const headerRef = useRef(null);\n  const [headerWidth, setHeaderWidth] = useState(0);\n  // Step 2\n}",
    feedback_correct: "Perfect — pre-paint measurement prevents flicker.",
    feedback_partial: "Use `useLayoutEffect` for measurement, not `useEffect`.",
    feedback_wrong: "Measure in `useLayoutEffect` and update width state.",
    expected: "Layout effect measurement",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 3",
    paal: "Render header width and export final component; keep analytics/logging in a regular `useEffect` comment block.",
    answer_keywords: ["return", "headerWidth", "export", "default"],
    seed_code:
      "import { useEffect, useLayoutEffect, useRef, useState } from 'react';\n\nexport default function ShipmentHeader() {\n  const headerRef = useRef(null);\n  const [headerWidth, setHeaderWidth] = useState(0);\n\n  useLayoutEffect(() => {\n    if (headerRef.current) setHeaderWidth(headerRef.current.offsetWidth);\n  }, []);\n\n  // Step 3\n}",
    feedback_correct: "Done — hook choice is now intentional and clear.",
    feedback_partial: "Render measured width and keep non-visual work in `useEffect`.",
    feedback_wrong: "Return JSX using `headerRef` and `headerWidth`.",
    expected: "Final measured header component",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
  { label: "Step 4", id: "step4" },
  { label: "Step 5", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 27,
  title: "useLayoutEffect vs useEffect",
  shortName: "HOOKS — LAYOUT EFFECT",
});

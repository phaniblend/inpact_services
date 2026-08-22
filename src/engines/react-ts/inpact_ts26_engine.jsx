import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #26 (React Hooks)",
      title: "useEffect — Cleanup",
      body: "A live shipment panel subscribes to timers or browser listeners while visible. When the panel changes or unmounts, old listeners must be removed. You will build a component where an effect sets up work and returns a cleanup function so no stale subscription keeps running.",
      usecase:
        "Dashboard cards frequently mount and unmount as routes change. Missing cleanup causes duplicate intervals, memory leaks, and stale updates from previous cards.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Return a cleanup function from useEffect to dispose subscriptions or timers",
      "Explain when cleanup runs: before re-run and on unmount",
      "Use dependency arrays so setup/cleanup pairs track the same input",
      "Prevent duplicate intervals and stale event listeners in changing views",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 3",
    paal: "Create polling state with `count` and a `shipmentId` prop; render both values.",
    answer_keywords: ["useState", "shipmentId", "count"],
    seed_code: "import { useState } from 'react';\n\nexport default function ShipmentPoller({ shipmentId }) {\n  // Step 1\n}",
    feedback_correct: "Nice start — state and UI shell are ready.",
    feedback_partial: "Add `count` state and show shipment id in JSX.",
    feedback_wrong: "Set up `count` state and render shipment id + count.",
    expected: "Initial state + shell",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 3",
    paal: "Inside `useEffect`, start an interval that increments count and depends on shipmentId.",
    answer_keywords: ["useEffect", "setInterval", "shipmentId"],
    seed_code:
      "import { useEffect, useState } from 'react';\n\nexport default function ShipmentPoller({ shipmentId }) {\n  const [count, setCount] = useState(0);\n  // Step 2\n}",
    feedback_correct: "Interval setup is wired correctly.",
    feedback_partial: "Add useEffect and make it track `shipmentId`.",
    feedback_wrong: "Create interval in effect and increment count.",
    expected: "Effect setup",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 3",
    paal: "Return cleanup from the effect with `clearInterval` and export final component.",
    answer_keywords: ["return", "clearInterval", "export", "default"],
    seed_code:
      "import { useEffect, useState } from 'react';\n\nexport default function ShipmentPoller({ shipmentId }) {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    const id = setInterval(() => setCount(c => c + 1), 1000);\n    // Step 3\n  }, [shipmentId]);\n\n  return <p>{shipmentId}: {count}</p>;\n}",
    feedback_correct: "Perfect — cleanup prevents duplicate timers and leaks.",
    feedback_partial: "Return a cleanup function that clears the interval.",
    feedback_wrong: "Add `return () => clearInterval(id)` from the effect.",
    expected: "Effect cleanup",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 26,
  title: "useEffect — Cleanup",
  shortName: "HOOKS — EFFECT CLEANUP",
});

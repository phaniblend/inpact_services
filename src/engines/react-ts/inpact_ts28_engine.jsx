import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #28 (React Data)",
      title: "fetch + Loading + Error State",
      body: "A shipment detail screen fetches by id and must clearly represent loading, success, and failure. You will implement a typed fetch flow with explicit state branches so the user always sees the correct UI while data is in-flight or failed.",
      usecase:
        "Most real product screens fetch async data; stable loading and error UX is a baseline requirement for reliability.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Model loading, error, and data states explicitly in TypeScript",
      "Run fetch in `useEffect` keyed by id changes",
      "Handle non-OK HTTP responses with user-visible error messaging",
      "Render deterministic UI branches for loading, error, empty, and success",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 3",
    paal: "Define `Shipment` type and state: `isLoading`, `error`, `data`.",
    answer_keywords: ["type Shipment", "useState", "isLoading", "error", "data"],
    seed_code:
      "import { useState } from 'react';\n\nexport default function ShipmentPanel({ shipmentId }) {\n  // Step 1\n}",
    feedback_correct: "Good — state model is explicit and typed.",
    feedback_partial: "Add all three state variables with proper defaults.",
    feedback_wrong: "Define `Shipment` and state for loading/error/data.",
    expected: "Typed fetch state",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 3",
    paal: "Fetch `/api/shipments/${shipmentId}` in `useEffect`, update state in try/catch/finally.",
    answer_keywords: ["useEffect", "fetch", "try", "catch", "finally", "shipmentId"],
    seed_code:
      "import { useEffect, useState } from 'react';\n\nexport default function ShipmentPanel({ shipmentId }) {\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState(null);\n  const [data, setData] = useState(null);\n  // Step 2\n}",
    feedback_correct: "Nice — async flow is wired to id changes.",
    feedback_partial: "Ensure non-OK response throws and final state clears loading.",
    feedback_wrong: "Implement fetch in effect with try/catch/finally.",
    expected: "Effect fetch flow",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 3",
    paal: "Render UI branches: loading spinner, error message, and success detail card.",
    answer_keywords: ["if (isLoading)", "if (error)", "return", "data"],
    seed_code:
      "import { useEffect, useState } from 'react';\n\nexport default function ShipmentPanel({ shipmentId }) {\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState(null);\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    // existing fetch logic\n  }, [shipmentId]);\n\n  // Step 3\n}",
    feedback_correct: "Perfect — predictable UX for each async state.",
    feedback_partial: "Add explicit loading and error returns before success JSX.",
    feedback_wrong: "Return conditional branches for loading, error, and success.",
    expected: "Final state-based rendering",
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
  lessonNum: 28,
  title: "fetch + Loading + Error State",
  shortName: "DATA — FETCH STATES",
});

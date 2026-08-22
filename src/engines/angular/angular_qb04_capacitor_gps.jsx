/**
 * QB04 — Capacitor GPS + Nearby Restaurants (QuickBite)
 * Placeholder when AI lesson is not loaded.
 */
import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "QB04 — CAPACITOR GPS",
      title: "Capacitor GPS + Nearby Restaurants",
      body: `Simulate: "Find restaurants near me" button that reads device GPS and calls a location API.

You will add @capacitor/geolocation, request permissions, get coordinates, and call an HTTP service — and handle denial with ion-toast.`,
      usecase: "Location-aware features are standard in delivery and discovery apps; Capacitor bridges to native APIs.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Install and sync a Capacitor first-party plugin (@capacitor/geolocation) using npm install + npx cap sync",
      "Follow the correct permission-first pattern: call requestPermissions() before any native API call",
      "Read device coordinates using Geolocation.getCurrentPosition() and pass them to an HTTP service",
      "Handle permission denial gracefully using ion-toast with color=\"danger\"",
      "Explain how Capacitor routes the same JS call to CLLocationManager on iOS and FusedLocationProviderClient on Android",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 1",
    paal: "Add @capacitor/geolocation, request permissions, then call getCurrentPosition and pass coords to a service.",
    hint: "Use Geolocation.requestPermissions() then Geolocation.getCurrentPosition().",
    answer_keywords: ["Geolocation", "getCurrentPosition", "requestPermissions", "capacitor"],
    seed_code: "// import { Geolocation } from '@capacitor/geolocation';\n// Request permissions, then getCurrentPosition\n",
    feedback_correct: "✅ GPS flow complete.",
    feedback_partial: "Use Capacitor Geolocation with permissions first.",
    feedback_wrong: "Add Geolocation plugin, request permissions, then getCurrentPosition.",
    expected: "GPS permission and position",
    evaluation: { mode: "keyword_match", required: ["Geolocation"], partialThreshold: 0.5, correctThreshold: 0.8 },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 4,
  title: "Capacitor GPS + Nearby Restaurants",
  shortName: "QB04",
  answerShape: "angular-tabs",
});

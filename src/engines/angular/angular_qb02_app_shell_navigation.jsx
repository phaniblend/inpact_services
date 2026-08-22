/**
 * QB02 — App Shell & Navigation (QuickBite)
 * Placeholder when AI lesson is not loaded.
 */
import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "QB02 — APP SHELL & NAVIGATION",
      title: "App Shell & Navigation",
      body: `Simulate: Building the tab bar with Orders / Menu / Profile tabs.

You will wrap the app with Ion App and Ion Router Outlet, then build a bottom tab bar and wire it to lazy-loaded routes.`,
      usecase: "Tab-based navigation is the standard pattern for mobile apps; Ionic makes it platform-aware (iOS vs Material).",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Wrap the app root with <ion-app> and replace <router-outlet> with <ion-router-outlet> and explain why",
      "Build a bottom tab bar using <ion-tabs>, <ion-tab-bar>, and <ion-tab-button>",
      "Wire tabs to lazy-loaded Angular route modules — same as standard Angular routing",
      "Use <ion-header>, <ion-toolbar>, <ion-title> to build a sticky top bar with safe area support",
      "Explain what \"platform-aware rendering\" means — why the same code looks iOS-style on iPhone and Material on Android",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 1",
    paal: "Add <ion-app> and <ion-router-outlet> to your app root, then create a tab bar with Orders, Menu, Profile.",
    hint: "Use ion-tabs, ion-tab-bar, ion-tab-button and wire them to routes.",
    answer_keywords: ["ion-app", "ion-router-outlet", "ion-tabs", "ion-tab-bar"],
    seed_code: "// App shell: ion-app, ion-router-outlet, ion-tabs\n",
    feedback_correct: "✅ Shell complete.",
    feedback_partial: "Include ion-app, ion-router-outlet, and tab bar.",
    feedback_wrong: "Add Ion App, Ion Router Outlet, and tab bar.",
    expected: "App shell with tabs",
    evaluation: { mode: "keyword_match", required: ["ion-app"], partialThreshold: 0.5, correctThreshold: 0.8 },
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
  lessonNum: 2,
  title: "App Shell & Navigation",
  shortName: "QB02",
  answerShape: "angular-tabs",
});

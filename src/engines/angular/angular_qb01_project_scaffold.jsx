/**
 * QB01 — Project Scaffold (QuickBite / Ionic + Angular + Capacitor)
 * Placeholder when AI lesson is not loaded. AI-generated lesson overrides when available.
 */
import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "QB01 — PROJECT SCAFFOLD",
      title: "Project Scaffold",
      body: `Simulate: Setting up the QuickBite app from scratch — CLI, folder structure, capacitor config.

You will use the Ionic CLI to scaffold a new Ionic + Angular + Capacitor app and configure it for iOS and Android.`,
      usecase: "Real mobile apps start with a correct project setup; this lesson teaches the exact workflow used in production.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Install the Ionic CLI and scaffold a new Ionic + Angular + Capacitor app using ionic start",
      "Explain the role of the ios/ and android/ folders and why you never edit them manually",
      "Configure capacitor.config.ts with the correct appId, appName, and webDir",
      "Explain the difference between ionic serve (browser dev) and ionic build && npx cap sync (device deploy)",
      "Describe the 3-layer mental model: Angular = blueprint, Ionic = UI kit, Capacitor = native bridge",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 1",
    paal: "Set up the project: install Ionic CLI and run ionic start for QuickBite.",
    hint: "Use npm or npx to install @ionic/cli and create a new app with tabs template.",
    answer_keywords: ["ionic", "start", "capacitor", "angular"],
    seed_code: "// Run: npm install -g @ionic/cli\n// Then: ionic start QuickBite tabs --type=angular --capacitor\n",
    feedback_correct: "✅ Setup complete.",
    feedback_partial: "Ensure you use Ionic CLI with Angular and Capacitor.",
    feedback_wrong: "Use ionic start with type angular and capacitor.",
    expected: "Ionic + Angular + Capacitor app created",
    evaluation: { mode: "keyword_match", required: ["ionic"], partialThreshold: 0.5, correctThreshold: 0.8 },
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
  lessonNum: 1,
  title: "Project Scaffold",
  shortName: "QB01",
  answerShape: "angular-tabs",
});

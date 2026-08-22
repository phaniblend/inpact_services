/**
 * QB03 — Orders List Page (QuickBite)
 * Placeholder when AI lesson is not loaded.
 */
import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "QB03 — ORDERS LIST PAGE",
      title: "Orders List Page",
      body: `Simulate: Displaying live orders with status badges and pull-to-refresh.

You will build a scrollable orders list with ion-content, ion-list, ion-item, status badges, pull-to-refresh, and loading skeletons.`,
      usecase: "List UIs with refresh and loading states are core to any delivery or order-management app.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Build a scrollable orders list using <ion-content>, <ion-list>, and <ion-item>",
      "Display dynamic order status using <ion-badge> with conditional color binding ([color]=\"getBadgeColor()\")",
      "Implement pull-to-refresh with <ion-refresher> and correctly call event.target.complete() to dismiss the spinner",
      "Use <ion-skeleton-text> to show loading placeholders while data fetches",
      "Trigger a native-style <ion-toast> notification from the component TypeScript",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 1",
    paal: "Create an orders list page with ion-list, ion-item, ion-badge for status, and ion-refresher.",
    hint: "Use ion-refresher and (ionRefresh) with event.target.complete().",
    answer_keywords: ["ion-list", "ion-item", "ion-badge", "ion-refresher"],
    seed_code: "// Orders list: ion-content, ion-list, ion-item, ion-badge, ion-refresher\n",
    feedback_correct: "✅ List page complete.",
    feedback_partial: "Include list, items, badges, and refresher.",
    feedback_wrong: "Add ion-list, ion-item, ion-badge, ion-refresher.",
    expected: "Orders list with refresh",
    evaluation: { mode: "keyword_match", required: ["ion-list"], partialThreshold: 0.5, correctThreshold: 0.8 },
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
  lessonNum: 3,
  title: "Orders List Page",
  shortName: "QB03",
  answerShape: "angular-tabs",
});

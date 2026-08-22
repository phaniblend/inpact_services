import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #14", title: "Performance optimisation", body: `trackBy, virtual scrolling (CdkVirtualScrollViewport), deferrable views (@defer).`, usecase: "Large lists and fast load." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["trackBy for ngFor", "Virtual scroll", "@defer"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Add trackBy to *ngFor. When is virtual scrolling needed? What does @defer do?", answer_keywords: ["trackBy", "virtual scroll", "CdkVirtualScrollViewport", "defer", "lazy"], seed_code: `*ngFor="let item of items; trackBy: trackById"
// Virtual scroll: render only visible rows
// @defer { <heavy-component /> }  // load when in viewport`, feedback_correct: "✅ trackBy reduces re-renders; virtual scroll for long lists; @defer lazy loads.", feedback_wrong: "trackBy; virtual scrolling for large lists; @defer for lazy loading.", expected: "Performance" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F14", title: "Performance optimisation", shortName: "ANG — PERF" });

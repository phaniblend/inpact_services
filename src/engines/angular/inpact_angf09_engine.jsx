import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #9", title: "Change detection", body: `Default vs OnPush, markForCheck, detachChangeDetector, async pipe, zone.js.`, usecase: "Performance and predictable updates." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["OnPush strategy", "markForCheck", "async pipe", "zone.js"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "When does ChangeDetectionStrategy.OnPush run? How do you trigger check when state changes outside zone (e.g. setTimeout)? Use async pipe.", answer_keywords: ["OnPush", "markForCheck", "async pipe", "zone", "detectChanges"], seed_code: `changeDetection: ChangeDetectionStrategy.OnPush
// OnPush: on input ref change, events, async pipe, manual markForCheck
observable | async  // subscribes and marks for check`, feedback_correct: "✅ OnPush on inputs/events/async pipe; markForCheck for external updates.", feedback_wrong: "OnPush reduces checks; async pipe triggers check; markForCheck when updating from outside.", expected: "Change detection" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F09", title: "Change detection", shortName: "ANG — CHANGE DETECTION" });

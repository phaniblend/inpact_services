import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #2", title: "Directives", body: `*ngIf/*ngFor/*ngSwitch, structural vs attribute directives, custom directive creation.`, usecase: "Conditionals, lists, and reusable behaviour." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use *ngIf, *ngFor, *ngSwitch", "Structural vs attribute", "Create custom directive"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Use *ngFor with trackBy. Write *ngIf with else block. When do you need a custom structural directive?", answer_keywords: ["ngFor", "ngIf", "trackBy", "structural", "directive"], seed_code: `*ngFor="let x of items; trackBy: trackById"
*ngIf="cond; else other" <ng-template #other>`, feedback_correct: "✅ *ngFor trackBy; *ngIf else; structural directive changes DOM.", feedback_wrong: "ngFor with trackBy; ngIf/else; structural directives use *.", expected: "Directives" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F02", title: "Directives", shortName: "ANG — DIRECTIVES" });

import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #4", title: "RxJS & Observables", body: `Observable vs Promise, map/filter/switchMap/mergeMap/concatMap/exhaustMap, Subject types.`, usecase: "Async streams and HTTP." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use map, filter, switchMap", "Choose mergeMap vs concatMap vs exhaustMap", "Subject types"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "When to use switchMap vs mergeMap vs concatMap? Create a Subject and emit a value from a component.", answer_keywords: ["switchMap", "mergeMap", "concatMap", "Subject", "Observable"], seed_code: `// switchMap: cancel previous (search); mergeMap: parallel; concatMap: order
const sub = new Subject(); sub.next(1); sub.asObservable()`, feedback_correct: "✅ switchMap cancels previous; mergeMap parallel; concatMap ordered. Subject.next().", feedback_wrong: "switchMap for cancel; mergeMap/concatMap for concurrency; Subject for multicasting.", expected: "RxJS operators" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F04", title: "RxJS & Observables", shortName: "ANG — RXJS" });

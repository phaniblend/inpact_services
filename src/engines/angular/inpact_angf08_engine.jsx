import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #8", title: "State management with NgRx", body: `Store, Actions, Reducers, Selectors, Effects, entity adapter.`, usecase: "Global state at scale." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Actions and reducers", "Selectors", "Effects", "Entity adapter"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define an action, a reducer that handles it, and a selector that derives a list from state. When do you use an Effect?", answer_keywords: ["createAction", "createReducer", "createSelector", "Effect", "dispatch"], seed_code: `createAction('[Users] Load')
createReducer(initial, on(loadUsers, (s,a) => ({...s, users: a.users})))
createSelector(selectUsers, users => users.filter(...))
// Effect: dispatch on action, call API, dispatch result`, feedback_correct: "✅ createAction, createReducer, createSelector; Effects for side effects.", feedback_wrong: "Actions, reducers, selectors; Effects for async/side effects.", expected: "NgRx" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F08", title: "NgRx", shortName: "ANG — NGRX" });

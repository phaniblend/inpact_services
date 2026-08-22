import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #12", title: "Testing Angular", body: `TestBed, ComponentFixture, async testing, marble testing for RxJS, HttpClientTestingModule.`, usecase: "Unit and integration tests." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["TestBed and fixtures", "Async testing", "Marble testing", "HttpClientTestingModule"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Configure TestBed with a component and HttpClientTestingModule. Trigger a click and expect DOM change. Use fakeAsync/tick for async.", answer_keywords: ["TestBed", "ComponentFixture", "detectChanges", "fakeAsync", "tick", "HttpTestingController"], seed_code: `TestBed.configureTestingModule({ imports: [HttpClientTestingModule], declarations: [MyComponent] })
const fixture = TestBed.createComponent(MyComponent)
fixture.detectChanges()
// fakeAsync(() => { ... tick(100) })`, feedback_correct: "✅ TestBed, fixture.detectChanges; fakeAsync/tick; HttpTestingController.", feedback_wrong: "TestBed; fixture.detectChanges; fakeAsync for async; HttpTestingController for HTTP.", expected: "Testing" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F12", title: "Testing Angular", shortName: "ANG — TESTING" });

import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "ANGULAR #7", title: "Forms", body: `Reactive forms (FormBuilder, FormGroup, FormControl), Template-driven, custom validators, async validators.`, usecase: "Complex forms and validation." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Reactive forms", "FormBuilder, FormGroup", "Custom and async validators"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Build a reactive form with FormBuilder: email (required, email) and password (min 8). Add a custom validator and an async validator (e.g. unique email).", answer_keywords: ["FormBuilder", "FormGroup", "Validators", "asyncValidator", "custom validator"], seed_code: `fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.minLength(8)]] })
// validators: [myValidator]  asyncValidators: [uniqueEmail]`, feedback_correct: "✅ FormBuilder.group; Validators; custom validator fn; asyncValidators.", feedback_wrong: "FormBuilder; Validators.required/email/minLength; custom and async validators.", expected: "Reactive forms" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "ANG-F07", title: "Forms", shortName: "ANG — FORMS" });

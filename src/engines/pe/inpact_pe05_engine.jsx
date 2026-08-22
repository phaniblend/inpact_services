import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #5", title: "Infrastructure as Code", body: `Terraform basics, state management, modules, drift detection, CDK.`, usecase: "Reproducible cloud infra." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Terraform resources and state", "Modules", "Drift detection"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Where should Terraform state live? What is drift? How do Terraform modules work?", answer_keywords: ["Terraform", "state", "remote", "drift", "module"], seed_code: `// State: S3 + DynamoDB lock; never local only
// Drift: actual != state; terraform plan shows it
// Module: reusable .tf folder; source = "..."`, feedback_correct: "✅ State in remote backend; drift = out-of-band changes; modules encapsulate.", feedback_wrong: "Remote state; drift detection; modules.", expected: "IaC" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-05", title: "Infrastructure as Code", shortName: "PE — IAC" });

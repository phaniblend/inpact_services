import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #9", title: "Secrets & compliance", body: `Rotation automation, audit logs, SOC 2 controls, least-privilege IAM.`, usecase: "Security and compliance in prod." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Secret rotation", "Audit logging", "SOC 2 and IAM"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "How automate secret rotation? What are SOC 2 controls? Least-privilege IAM in practice?", answer_keywords: ["rotation", "audit", "SOC", "IAM", "least privilege"], seed_code: `// Rotation: Lambda/scheduler + Secrets Manager
// Audit: CloudTrail, access logs, immutable store
// IAM: minimal permissions; assume role, not long-lived keys`, feedback_correct: "✅ Rotate with automation; audit trail; SOC 2 controls; IAM minimal scope.", feedback_wrong: "Secret rotation; audit logs; least-privilege IAM.", expected: "Secrets & compliance" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-09", title: "Secrets & compliance", shortName: "PE — SECRETS" });

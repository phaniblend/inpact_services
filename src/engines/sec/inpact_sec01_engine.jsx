import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SECURITY ENG #1", title: "Authentication & authorisation", body: `Authn vs Authz, sessions vs JWT, OAuth2/OIDC, RBAC/ABAC, secure password handling.`, usecase: "Who is the user and what can they do?" } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Authn vs Authz", "Sessions and JWT", "OAuth2 and RBAC"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Authn vs Authz? When sessions vs JWT? What is RBAC?", answer_keywords: ["authentication", "authorisation", "session", "JWT", "RBAC", "OAuth"], seed_code: `// Authn: who are you; Authz: what can you do
// Session: server state; JWT: stateless, expiry
// RBAC: role -> permissions`, feedback_correct: "✅ Authn = identity; Authz = permissions; session vs JWT; RBAC.", feedback_wrong: "Authentication vs authorisation; session vs JWT; RBAC.", expected: "Authn & Authz" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SEC-01", title: "Authentication & authorisation", shortName: "SEC — AUTH" });

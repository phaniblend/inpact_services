import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "PRODUCTION ENG #7", title: "Database operations", body: `Backup strategies, point-in-time recovery, connection pooling (PgBouncer), read replicas.`, usecase: "DB reliability and performance." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Backup and PITR", "Connection pooling", "Read replicas"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What backup strategy for RDS/Postgres? What is PgBouncer for? When use read replicas?", answer_keywords: ["backup", "PITR", "PgBouncer", "pool", "replica"], seed_code: `// Backup: automated daily + WAL for PITR
// PgBouncer: connection pooler; many app conns -> few DB conns
// Read replica: scale reads; eventual consistency`, feedback_correct: "✅ Automated backup + WAL; PgBouncer pools connections; replicas for read scale.", feedback_wrong: "Backup and PITR; PgBouncer; read replicas.", expected: "DB operations" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "PE-07", title: "Database operations", shortName: "PE — DB" });

import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #13",
      title: "Environment & config",
      body: `dotenv, config validation with Zod. 12-factor app. Secrets vs non-secrets.`,
      usecase: "Secure, validated config across dev/staging/prod.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use dotenv and validate with Zod", "Follow 12-factor config", "Separate secrets from config"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Load .env with dotenv and validate required env vars (e.g. PORT, DATABASE_URL) with Zod. Fail fast if missing.",
    answer_keywords: ["dotenv", "zod", "schema", "parse", "env", "validate"],
    seed_code: `import 'dotenv/config'
import { z } from 'zod'
const schema = z.object({ PORT: z.string().transform(Number), DATABASE_URL: z.string().url() })
const config = schema.parse(process.env)  // throws if invalid`,
    feedback_correct: "✅ dotenv/config; Zod schema; parse(process.env) for fail-fast validation.",
    feedback_wrong: "dotenv loads .env; Zod.parse(process.env) validates and throws on missing/invalid.",
    expected: "dotenv + Zod config",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F13", title: "Environment & config", shortName: "NODE — CONFIG" });

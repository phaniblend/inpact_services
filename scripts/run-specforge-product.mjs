/**
 * Drive a real product concept through the actual SpecForge pipeline (Stage 1 -> Stage 2 ->
 * Stage 3 -> tutorial drafting -> Gemini module generation) end to end, locally, and print/write
 * everything it produces — no OneDev write required, so this can run wherever the DEEPSEEK/GEMINI
 * keys are available, independent of live OneDev access.
 *
 * This replaces the old write-smb-assist-engines.mjs/seed-smb-pipeline.mjs approach (a hand-
 * authored task+module array) for any *new* product from here on — those two scripts and
 * codingTasks.data.mjs are for the throwaway starting seed only and are going away with it.
 *
 *   node scripts/run-specforge-product.mjs
 *
 * Edit PRODUCT below per run, or lift this into a small CLI later if more than one product a
 * session becomes normal.
 */
import "dotenv/config";
import { runStages1And2, runTaskBreakdown, runTutorialDrafting } from "../src/specforge/pipeline.js";
import { generateAssistModule } from "../src/id-module/generateModule.js";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY not set");
if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

const PRODUCT = {
  product_name: "VendorBillTracker",
  description:
    "A small business tracks what it owes its own vendors/suppliers — bill amount, vendor, due date — separate from what customers owe it. Owner or bookkeeper logs a bill when it arrives, marks it paid when it's paid, and can see at a glance what's due this week versus already overdue. The system itself, not the person, decides whether a bill is upcoming, due, or overdue based on the due date, and refuses to let the same bill be marked paid twice.",
  target_users: ["Solo tradesperson or small shop owner with no dedicated bookkeeper", "Part-time bookkeeper for a 2-10 person business"],
  business_goal: "Never miss a vendor due date and never pay the same bill twice, without buying a full bill-pay/AP-automation platform priced for a business with dedicated AP staff.",
  constraints: [
    "No payment processing — this tracks bills and payments as records, it does not move money",
    "No per-user seats, no ACH/card processing fees — the whole point is avoiding that pricing model",
    "List + form + one derived-status rule per screen, same grain as every other seeded product",
  ],
};

console.log(`\n=== Stage 1+2: ${PRODUCT.product_name} ===`);
const { stage1, stage2 } = await runStages1And2(PRODUCT, DEEPSEEK_API_KEY);
console.log(JSON.stringify({ stage1, stage2 }, null, 2));

console.log(`\n=== Stage 3: Task breakdown ===`);
const tasks = await runTaskBreakdown(stage1, stage2, DEEPSEEK_API_KEY);
console.log(JSON.stringify(tasks, null, 2));

const codingTasks = tasks.filter((t) => t.trade.toLowerCase() === "coding" && !t.no_tutorial_needed);
console.log(`\n${tasks.length} total task(s), ${codingTasks.length} Coding task(s) needing an assist module.`);

// No live Module Library to classify against from here — treat every Coding task as unmatched,
// same as a brand-new product would be against an empty (or unrelated) library.
console.log(`\n=== Tutorial drafting: grouping ${codingTasks.length} unmatched Coding task(s) ===`);
const groups = await runTutorialDrafting(codingTasks, PRODUCT.product_name, DEEPSEEK_API_KEY);
console.log(JSON.stringify(groups, null, 2));

console.log(`\n=== Generating ${groups.length} assist module(s) with Gemini (designMock enforced) ===`);
const generated = [];
for (const group of groups) {
  try {
    const result = await generateAssistModule({
      moduleTag: group.moduleTag,
      concept: group.concept,
      build: group.build,
      keyTeaching: group.keyTeaching,
    });
    console.log(`  ✓ ${group.moduleTag} -> ${result.fileName}`);
    generated.push({ tag: group.moduleTag, file: result.fileName, taskIndexes: group.taskIndexes });
  } catch (err) {
    console.error(`  ✗ ${group.moduleTag} FAILED: ${err.message}`);
    generated.push({ tag: group.moduleTag, error: err.message, taskIndexes: group.taskIndexes });
  }
}

console.log("\n=== Summary ===");
console.log(JSON.stringify({ product: PRODUCT.product_name, taskCount: tasks.length, codingTaskCount: codingTasks.length, moduleGroups: generated }, null, 2));

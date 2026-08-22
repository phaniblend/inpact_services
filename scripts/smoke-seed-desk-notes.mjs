/**
 * Seed a tiny Desk Notes Sprint delivery project with 2 JavaScript tasks
 * already AssistModule-wired so Apply → Workbench → Assist Me can be dry-run
 * without waiting on Gemini SpecForge publish.
 */
import "dotenv/config";
import { listProjects, createIssue, ensureDeliveryProject } from "../server/onedev-client.js";
import { notifyTeamServer } from "../server/notify-server.js";

const NAME = "Desk Notes Sprint";
const ASSIST = "AssistModule: define-entity-with-conversion-unit";

function taskDescription(trade) {
  return [
    "Epic: Notes Manager",
    "Story: First release dry-run",
    `Trade: ${trade}`,
    "TechLevel: JavaScript",
    `Cohort: ${NAME}`,
    "AcceptanceCriteria: List, create, and edit notes end-to-end against the notes UI/API.",
    ASSIST,
  ].join("\n");
}

const ensured = await ensureDeliveryProject({
  name: NAME,
  description: "Dry-run delivery project for PD→Workbench→Assist Me end-to-end test.",
});
const projectId = ensured.projectId;
console.log("project", projectId, ensured.projectName, ensured.reused ? "(reused)" : "(created)");

const cohortId = await createIssue({
  projectId: 3,
  title: `Cohort: ${NAME}`,
  description: [
    `Product: ${NAME}`,
    `DeliveryProject: ${NAME} (#${projectId})`,
    "TaskCount: 2",
    `CreatedAt: ${new Date().toISOString()}`,
  ].join("\n"),
});
console.log("cohort", cohortId);

const feId = await createIssue({
  projectId,
  title: "Build Notes list screen with create and edit forms",
  description: taskDescription("frontend"),
});
const beId = await createIssue({
  projectId,
  title: "Implement Notes REST API with CRUD operations",
  description: taskDescription("backend"),
});
console.log({ feId, beId, projectId, cohortId });

try {
  await notifyTeamServer(
    `🧪 Dry-run seeded **${NAME}** with 2 JavaScript tasks (FE #${feId}, BE #${beId}) wired for Assist Me.`,
  );
} catch (err) {
  console.warn("notify skipped:", err.message);
}

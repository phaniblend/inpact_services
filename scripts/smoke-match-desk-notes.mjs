import "dotenv/config";
import { createIssue, listIssues } from "../server/onedev-client.js";

const name = "Venkat “Phani” Bhushan";
const email = "bsit.setty@gmail.com";
const taskId = 131;
const projectId = 8;

const issues = await listIssues({ count: 200 });
const existingApp = issues.find(
  (i) => i.projectId === 2 && i.title.startsWith("Application:") && (i.description || "").includes(email),
);

let applicationId = existingApp?.id;
if (!applicationId) {
  applicationId = await createIssue({
    projectId: 2,
    title: `Application: ${name}`,
    description: [
      `Name: ${name}`,
      `Email: ${email}`,
      "Stated trade: Coding",
      "SkillLevel: js",
      "CodingFocus: backend",
      "Aspiration: js",
      `SubmittedAt: ${new Date().toISOString()}`,
      "Note: Dry-run application for Assist Me path",
    ].join("\n"),
  });
  console.log("created application", applicationId);
} else {
  console.log("reuse application", applicationId);
}

const matchId = await createIssue({
  projectId: 2,
  title: `Matched: ${name} → Implement Notes REST API with CRUD operations`,
  description: [
    `ApplicationId: ${applicationId}`,
    `TaskId: ${taskId}`,
    `ProjectId: ${projectId}`,
    `Email: ${email}`,
    "Trade: backend",
    "TechLevel: JavaScript",
    `MatchedAt: ${new Date().toISOString()}`,
    "Note: Dry-run manual match for Assist Me path",
  ].join("\n"),
});
console.log({ applicationId, matchId, taskId, projectId });

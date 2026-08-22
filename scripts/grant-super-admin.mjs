/**
 * Audit-trail RoleGrant issues for a super-admin email (OneDev team-ops).
 * Runtime access also comes from IPF_SUPER_ADMIN_EMAILS in .env.
 *
 * Run: node scripts/grant-super-admin.mjs bsit.setty@gmail.com
 */
import dotenv from "dotenv";
dotenv.config();
import { createIssue } from "../server/onedev-client.js";
import { GRANTABLE_ROLES } from "../server/role-grants.js";

const TEAM_OPS_PROJECT_ID = 3;
const email = process.argv[2] || "bsit.setty@gmail.com";

for (const role of GRANTABLE_ROLES) {
  const id = await createIssue({
    projectId: TEAM_OPS_PROJECT_ID,
    title: `RoleGrant: ${email}`,
    description: [
      `Role: ${role}`,
      `Action: grant`,
      `GrantedBy: IPF_SUPER_ADMIN bootstrap`,
      `GrantedAt: ${new Date().toISOString()}`,
      `Note: Platform super-admin — every IPF surface`,
    ].join("\n"),
  });
  console.log(`Granted ${role} → issue ${id}`);
}
console.log("Done. Restart npm run server if it was already running, then refresh /me.");

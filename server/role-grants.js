/**
 * Role grants for JS accounts — the other half of the founder's stated design: "-core roles are
 * fixed identities; PD, PMGT, ID (no -core suffix) are roles that can also be assigned to a JS as
 * they grow into them." A -core employee's role comes straight from LDAP (see ldap-auth.js); a
 * JS's roles are explicit, human-logged grants — same "logged decision, not an algorithm's guess"
 * philosophy as every placement/aspiration/match in this app. Stored as `RoleGrant: <email>`
 * issues in team-ops, most recent per (email, role) pair wins, matching the Aspiration check-in
 * pattern already established.
 *
 * Super-admins: emails listed in IPF_SUPER_ADMIN_EMAILS (comma-separated) always receive every
 * grantable role regardless of OneDev issues — for founder / platform operators.
 */
import { listIssues } from "./onedev-client.js";

const TEAM_OPS_PROJECT_ID = 3;
export const GRANTABLE_ROLES = ["PD", "PMGT", "ID", "CD"];
const GRANTABLE_ROLE_SET = new Set(GRANTABLE_ROLES);

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/** Emails that bypass RoleGrant and always hold every grantable IPF role. */
export function superAdminEmails() {
  return String(process.env.IPF_SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isSuperAdminEmail(email) {
  const needle = normalizeEmail(email);
  return needle.length > 0 && superAdminEmails().includes(needle);
}

/** All roles currently granted to this email, newest grant/revoke per role wins. A `RoleGrant`
 * issue's description carries `Action: grant` or `Action: revoke` — revocable, not just additive,
 * since growing into a role is a real reversible people decision, not a one-way ratchet. */
export async function rolesForEmail(email) {
  if (!email) return [];
  if (isSuperAdminEmail(email)) return [...GRANTABLE_ROLES];

  const issues = await listIssues({ count: 250 });
  const grants = issues
    .filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title === `RoleGrant: ${email}`)
    .sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));

  // Also accept RoleGrant titles that differ only by email casing.
  const grantsLoose =
    grants.length > 0
      ? grants
      : issues
          .filter(
            (i) =>
              i.projectId === TEAM_OPS_PROJECT_ID &&
              /^RoleGrant:\s*/i.test(i.title || "") &&
              normalizeEmail(i.title.replace(/^RoleGrant:\s*/i, "")) === normalizeEmail(email),
          )
          .sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));

  const latestActionPerRole = new Map();
  for (const issue of grantsLoose) {
    const role = /^Role:\s*(.+)$/m.exec(issue.description || "")?.[1]?.trim();
    const action = /^Action:\s*(.+)$/m.exec(issue.description || "")?.[1]?.trim();
    if (!role || !GRANTABLE_ROLE_SET.has(role)) continue;
    if (!latestActionPerRole.has(role)) latestActionPerRole.set(role, action); // first hit = newest
  }
  return [...latestActionPerRole.entries()].filter(([, action]) => action === "grant").map(([role]) => role);
}

/**
 * Session issuance/verification — one shared session shape for both identity paths (LDAP `-core`
 * and Google-OAuth JS), since route guards need to check the same thing regardless of how someone
 * signed in: are they logged in, and what roles do they hold. Signed JWT in an httpOnly cookie —
 * no server-side session store needed for a token this short-lived and this low-stakes (internal
 * tool, not a bank).
 */
import jwt from "jsonwebtoken";

import { rolesForEmail } from "./role-grants.js";

const COOKIE_NAME = "ipf_session";
const SESSION_TTL = "12h";

/** Reads AUTH_SESSION_SECRET lazily, at call time, not at module load — this module is imported
 * (transitively, via auth-router.js) before server/index.js's own `dotenv.config()` call runs, since
 * ES module imports are always evaluated before the importing file's own top-level code, regardless
 * of source order. A top-level `const SECRET = process.env...` here would have silently captured
 * `undefined` forever. Found live: the server logged "AUTH_SESSION_SECRET is not set" on startup
 * even though the .env line was correctly populated — same class of bug as the vite.config.js
 * self-targeting-proxy issue found earlier this session, just at module-load time instead of
 * request time. Throws loudly if still unset when actually needed, rather than silently signing
 * with `undefined` (which jsonwebtoken would otherwise accept). */
function secret() {
  const value = process.env.AUTH_SESSION_SECRET;
  if (!value) throw new Error("AUTH_SESSION_SECRET is not set in .env — cannot issue or verify sessions.");
  return value;
}

/** session shape: { sub, name, email, accountType: 'core' | 'js', coreRole?: string, roles: string[] } */
export function issueSession(payload) {
  return jwt.sign(payload, secret(), { expiresIn: SESSION_TTL });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax", // "lax" not "strict": the Google OAuth callback redirect is a top-level
    // cross-site navigation landing back on this origin — "strict" would drop the cookie on that
    // exact hop, breaking login on the very last step.
    maxAge: 12 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

export function readSessionFromRequest(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}

/** Express middleware: requires *some* valid session, any account type. Attaches it to req.session. */
export function requireSession(req, res, next) {
  const session = readSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: "Not signed in" });
  req.session = session;
  next();
}

/** Express middleware factory: requires a valid session AND at least one of the given roles.
 * A `-core` account's coreRole (e.g. "PD-core") satisfies the bare role name too ("PD-core"
 * grants "PD") — per the founder's own design: "-core roles ... PD, PMGT, ID (no -core suffix)
 * are roles, not fixed identities — they can also be assigned to a JS." A -core employee already
 * IS their role; a JS has to be explicitly granted it (see role-grants.js).
 * JS roles are re-resolved live from RoleGrant / super-admin list so a grant (or SUPER_ADMIN env)
 * takes effect without forcing a full re-login. */
export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const session = readSessionFromRequest(req);
      if (!session) return res.status(401).json({ error: "Not signed in" });
      if (session.accountType === "js" && session.email) {
        session.roles = await rolesForEmail(session.email);
      }
      const coreRoleBare = session.coreRole?.replace(/-core$/, "");
      const effectiveRoles = new Set([...(session.roles || []), ...(coreRoleBare ? [coreRoleBare] : [])]);
      const allowed = allowedRoles.some((r) => effectiveRoles.has(r));
      if (!allowed) return res.status(403).json({ error: `Requires one of: ${allowedRoles.join(", ")}` });
      req.session = session;
      next();
    } catch (err) {
      console.error("[auth] requireRole failed:", err.message);
      res.status(500).json({ error: "Could not verify roles" });
    }
  };
}

/**
 * Auth routes — the two identity paths from docs/IPF_DEVGUIDE.md §5a, one shared session shape.
 *  - POST /core-login       LDAP bind auth, -core employees (PD-core, PMGT-core, ID-core, ...)
 *  - GET  /google/start     redirects to Google's real consent screen, JS applicants
 *  - GET  /google/callback  verifies Google's redirect, issues a session, sends the browser home
 *  - GET  /me               current session, or 401 — what the frontend polls to know who's signed in
 *  - POST /logout           clears the session cookie
 */
import express from "express";
import crypto from "crypto";
import { authenticateCoreUser } from "./ldap-auth.js";
import { buildAuthUrl, verifyOAuthCallback, isGoogleOAuthConfigured } from "./google-oauth.js";
import { rolesForEmail } from "./role-grants.js";
import { issueSession, setSessionCookie, clearSessionCookie, readSessionFromRequest } from "./auth-session.js";

const router = express.Router();

// Google's own redirect lands the browser directly on this AI server's real origin
// (GOOGLE_OAUTH_REDIRECT_URI, e.g. 127.0.0.1:3000) — it is NOT proxied through Vite the way the
// frontend's own fetch() calls to /api/... are, because Google is the one performing that
// redirect, not this app. Setting the session cookie at that point would scope it to port 3000,
// which the frontend (port 5173, a different origin) would then never send back on its own
// same-origin, Vite-proxied /api/auth/me calls. Fixed the same way the core-lesson completion flow
// already solved an analogous cross-origin handoff: a short-lived, one-time exchange code in the
// redirect URL, which the frontend immediately trades in via its own proxied (same-origin) call —
// *that* response is what actually sets the cookie, correctly scoped to the frontend's real origin.
// In-memory is deliberate: this is used within seconds of being minted, and NOT persisting a
// one-time login secret anywhere durable is a feature, not a gap.
const pendingLoginExchanges = new Map(); // code -> { payload, expiresAt }
const LOGIN_CODE_TTL_MS = 60 * 1000;

function mintLoginCode(sessionPayload) {
  const code = crypto.randomBytes(24).toString("hex");
  pendingLoginExchanges.set(code, { payload: sessionPayload, expiresAt: Date.now() + LOGIN_CODE_TTL_MS });
  return code;
}

// CSRF state for the OAuth handshake — was a cookie (set on /google/start, read back on
// /google/callback), which is the textbook way to do this EXCEPT that here it broke every real
// sign-in: /google/start is reached via the frontend's Vite-proxied origin (browser sees
// "localhost:5173"), so the cookie got scoped to host "localhost" — but Google's own redirect lands
// directly on GOOGLE_OAUTH_REDIRECT_URI's host ("127.0.0.1:3000"), a DIFFERENT host as far as the
// browser's cookie jar is concerned (browsers never share cookies between "localhost" and
// "127.0.0.1", even though both resolve to the same machine). The cookie the browser had for
// "localhost" was simply never sent on the direct-to-127.0.0.1 callback request, so the state check
// failed on every single real attempt — found live 2026-08-09 via an actual Google sign-in, not
// something curl-based testing could ever have caught (curl doesn't juggle a real per-host cookie
// jar the way a browser does). Fixed by moving state out of a cookie entirely: server-memory,
// same one-time pattern as pendingLoginExchanges above — state round-trips through Google as a URL
// query param, which Google faithfully echoes back regardless of which host the callback lands on.
const pendingOAuthStates = new Map(); // state -> { expiresAt, returnTo }
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

/** Only same-app HashRouter paths are allowed back after Google — anything else would be an open
 * redirect. Accept "#/workbench?…" or "/workbench?…" and normalize to a hash path. */
function sanitizeReturnTo(raw) {
  if (!raw || typeof raw !== "string") return "#/apply";
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return "#/apply";
  }
  if (path.startsWith("/#/")) path = path.slice(1); // "/#/x" → "#/x"
  if (path.startsWith("/") && !path.startsWith("//")) path = `#${path}`; // "/workbench" → "#/workbench"
  if (!path.startsWith("#/")) return "#/apply";
  if (path.includes("://") || path.includes("\\")) return "#/apply";
  return path;
}

function mintOAuthState(returnTo) {
  const state = crypto.randomBytes(16).toString("hex");
  pendingOAuthStates.set(state, {
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
    returnTo: sanitizeReturnTo(returnTo),
  });
  return state;
}

/** One-time: deletes the state the instant it's checked, valid or not, same replay-protection
 * reasoning as the login code below. Returns the stored entry (or null) so the callback can honor
 * returnTo without a second lookup. */
function consumeOAuthState(state) {
  const entry = state && pendingOAuthStates.get(state);
  if (state) pendingOAuthStates.delete(state);
  if (!entry || entry.expiresAt <= Date.now()) return null;
  return entry;
}

router.post("/core-login", async (req, res) => {
  try {
    const { uid, password } = req.body;
    const profile = await authenticateCoreUser(uid, password);
    const token = issueSession({
      sub: profile.dn,
      name: profile.name,
      email: profile.email,
      accountType: "core",
      coreRole: profile.coreRole,
      roles: [],
    });
    setSessionCookie(res, token);
    res.json({ ok: true, name: profile.name, coreRole: profile.coreRole });
  } catch (err) {
    // Always the same generic message regardless of the real failure reason (unknown user, wrong
    // password, LDAP unreachable) — distinguishing those in the response would let an attacker
    // enumerate valid usernames or probe server health. Real cause still goes to the server log.
    console.error("[auth] /core-login failed:", err.message);
    res.status(401).json({ error: "Invalid username or password" });
  }
});

router.get("/google/start", (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).send("Google OAuth is not configured yet — GOOGLE_OAUTH_CLIENT_ID/SECRET are empty in .env.");
  }
  // returnTo lets Workbench / Assist Me (and any other gated screen) survive the Google round-trip
  // instead of always dumping the browser back on Apply — that was the login-wall dead-end for a
  // matched applicant whose session had expired (handoff §9).
  res.redirect(buildAuthUrl(mintOAuthState(req.query.returnTo)));
});

router.get("/google/callback", async (req, res) => {
  // "localhost", not "127.0.0.1" — found live: this dev environment's Vite server binds only to
  // [::1]:5173 (IPv6 loopback), not 0.0.0.0/127.0.0.1, so a literal IPv4 redirect target gets
  // ERR_CONNECTION_REFUSED even though the exact same machine is reachable at "localhost:5173".
  const frontend = process.env.IPF_FRONTEND_URL || "http://localhost:5173";
  const oauthState = consumeOAuthState(String(req.query.state || ""));
  const returnTo = oauthState?.returnTo || "#/apply";
  try {
    const { code } = req.query;
    // CSRF check — a callback with a missing/unrecognized/already-used state didn't originate from
    // a /google/start redirect this server itself issued moments ago. Reject outright, don't try to
    // "recover." (See pendingOAuthStates' comment above for why this isn't a cookie.)
    if (!oauthState) {
      return res.status(400).send("Invalid or expired sign-in attempt — please try signing in again.");
    }

    const identity = await verifyOAuthCallback(String(code));
    const roles = await rolesForEmail(identity.email);
    const loginCode = mintLoginCode({
      sub: identity.googleId,
      name: identity.name,
      email: identity.email,
      accountType: "js",
      roles,
    });
    // returnTo is already a "#/…" hash path — concatenate onto the frontend origin (no extra slash)
    // so HashRouter + useSearchParams on the destination page both see loginCode.
    const sep = returnTo.includes("?") ? "&" : "?";
    res.redirect(`${frontend}${returnTo}${sep}loginCode=${encodeURIComponent(loginCode)}`);
  } catch (err) {
    console.error("[auth] /google/callback failed:", err.message);
    const sep = returnTo.includes("?") ? "&" : "?";
    res.redirect(`${frontend}${returnTo}${sep}authError=1`);
  }
});

/** POST /exchange-login-code — { code } -> sets the real session cookie. Called by the frontend
 * itself, same-origin (via Vite's proxy), immediately after landing on ?loginCode=... from the
 * Google callback redirect above. One-time: the code is deleted the instant it's read, valid or
 * not, so a leaked/reused URL (e.g. a shared browser, a proxy log) can't replay a login. */
router.post("/exchange-login-code", (req, res) => {
  const { code } = req.body;
  const pending = code && pendingLoginExchanges.get(code);
  if (pending) pendingLoginExchanges.delete(code);
  if (!pending || pending.expiresAt < Date.now()) {
    return res.status(400).json({ error: "This sign-in link has expired — please sign in again." });
  }
  const token = issueSession(pending.payload);
  setSessionCookie(res, token);
  res.json({ ok: true, name: pending.payload.name });
});

router.get("/me", async (req, res) => {
  const session = readSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: "Not signed in" });
  // Live-refresh JS roles so RoleGrant / IPF_SUPER_ADMIN_EMAILS take effect without re-OAuth.
  if (session.accountType === "js" && session.email) {
    try {
      session.roles = await rolesForEmail(session.email);
      setSessionCookie(res, issueSession({
        sub: session.sub,
        name: session.name,
        email: session.email,
        accountType: session.accountType,
        roles: session.roles,
      }));
    } catch (err) {
      console.error("[auth] /me role refresh failed:", err.message);
    }
  }
  res.json(session);
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

export default router;

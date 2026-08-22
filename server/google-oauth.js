/**
 * Google OAuth for JS applicants — deliberately no separate registration/password system for
 * them, per the founder's identity design (docs/IPF_DEVGUIDE.md §5a): "JS applicants authenticate
 * via social login (OAuth), to keep the applicant funnel frictionless." Standard authorization-code
 * flow via google-auth-library; the ID token (not the access token) is what we actually trust —
 * it's signed by Google and verifiable offline, so a verified ID token's email is as good as
 * Google's own word that this person controls that address.
 */
import { OAuth2Client } from "google-auth-library";

// Read lazily, not at module top-level — see auth-session.js's comment for why: this module loads
// before server/index.js's own dotenv.config() call runs, so a top-level read would always be undefined.
function config() {
  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://127.0.0.1:3000/api/auth/google/callback",
  };
}

export function isGoogleOAuthConfigured() {
  const { clientId, clientSecret } = config();
  return Boolean(clientId && clientSecret);
}

function client() {
  const { clientId, clientSecret, redirectUri } = config();
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

/** Builds the URL to send a browser to for real Google sign-in. `state` should be a per-attempt
 * random value the caller stores (e.g. in a short-lived cookie) and re-checks on callback — CSRF
 * protection for the OAuth handshake, standard practice, not optional. */
export function buildAuthUrl(state) {
  return client().generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    state,
  });
}

/** Exchanges the authorization code Google's redirect handed back for a verified identity.
 * Returns { email, name, googleId } — throws if the code is invalid/expired or the token doesn't
 * verify, never returns a partial/unverified identity. */
export async function verifyOAuthCallback(code) {
  const oauth2 = client();
  const { tokens } = await oauth2.getToken(code);
  if (!tokens.id_token) throw new Error("Google did not return an ID token");
  const ticket = await oauth2.verifyIdToken({ idToken: tokens.id_token, audience: config().clientId });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Google ID token has no verified email");
  if (!payload.email_verified) throw new Error("Google account email is not verified");
  return { email: payload.email, name: payload.name || payload.email, googleId: payload.sub };
}

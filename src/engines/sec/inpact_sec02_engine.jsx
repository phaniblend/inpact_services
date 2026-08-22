import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "SECURITY ENGINEERING #2",
      title: "Auth Architecture — OAuth2, Secrets & Zero Trust",
      body: `Authentication tells you WHO a user is.
Authorization tells you WHAT they can do.
Getting either wrong is a breach waiting to happen.

The landscape senior engineers must own:
  OAuth2 / OIDC  — delegated auth, the industry standard
  JWT lifecycle  — short-lived tokens, refresh rotation
  Secrets mgmt   — nothing in code, nothing in env files in prod
  Zero Trust     — never trust, always verify, even inside the network
  mTLS           — service-to-service auth at the infra layer

The most dangerous words in security:
"Our internal network is safe, we don't need auth between services."
That assumption is how breaches spread from one compromised
service to an entire infrastructure.`,
      usecase: `Every app with user accounts, every service that calls another service, every API key that could leak, every secret that lives in code — this is the foundation of production security.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Implement OAuth2 Authorization Code flow with PKCE",
      "Design access token + refresh token rotation correctly",
      "Store secrets in Vault or AWS Secrets Manager — never env files in prod",
      "Implement API key hashing — never store raw API keys",
      "Apply Zero Trust principles to service-to-service calls",
      "Detect and respond to token theft with refresh token rotation",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Implement OAuth2 Authorization Code flow with PKCE. Show why implicit flow is deprecated and what PKCE protects against.",
    answer_keywords: ["oauth2", "pkce", "authorization code", "code verifier", "state", "code challenge"],
    seed_code: `// Step 1: OAuth2 Authorization Code + PKCE

import crypto from 'crypto'

/*
WHY NOT IMPLICIT FLOW?
  Implicit flow returns the access token directly in the URL fragment.
  → Token visible in browser history, server logs, referrer headers
  → No way to authenticate the client
  → DEPRECATED in OAuth 2.1

WHY PKCE? (Proof Key for Code Exchange)
  Without PKCE: if an attacker intercepts the auth code, they can
  exchange it for a token (code interception attack).

  With PKCE: the client creates a secret before the auth request.
  The auth server only issues a token if the client proves it knows
  the original secret. Intercepted code is useless without the secret.

─── PKCE FLOW ────────────────────────────────────────────────────
1. Client generates: code_verifier (random 64-byte string)
2. Client computes:  code_challenge = SHA256(code_verifier) base64url encoded
3. Client sends code_challenge to auth server in /authorize request
4. Auth server stores code_challenge with the issued auth code
5. Client exchanges auth code + code_verifier for token
6. Auth server verifies: SHA256(code_verifier) == stored code_challenge
7. Token issued ✅
*/

function generatePKCE() {
  const codeVerifier = crypto.randomBytes(64).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  return { codeVerifier, codeChallenge }
}

function buildAuthURL({ clientId, redirectUri, scopes, codeChallenge }) {
  const state = crypto.randomBytes(16).toString('hex')  // CSRF protection
  const params = new URLSearchParams({
    response_type: 'code',
    client_id:     clientId,
    redirect_uri:  redirectUri,
    scope:         scopes.join(' '),
    state,                                // store in session, verify on callback
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })
  sessionStorage.set('oauth_state', state)  // store for verification
  sessionStorage.set('code_verifier', codeVerifier)
  return \`https://auth.provider.com/authorize?\${params}\`
}

async function handleCallback({ code, state }) {
  // Verify state matches (CSRF protection):
  const storedState = sessionStorage.get('oauth_state')
  if (state !== storedState) throw new Error('State mismatch — possible CSRF')

  const codeVerifier = sessionStorage.get('code_verifier')

  const tokens = await fetch('https://auth.provider.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  REDIRECT_URI,
      client_id:     CLIENT_ID,
      code_verifier,   // prove we started this flow
    }),
  }).then(r => r.json())

  return tokens  // { access_token, refresh_token, expires_in }
}

export { generatePKCE, buildAuthURL, handleCallback }`,
    feedback_correct: "✅ PKCE: generate verifier → hash to challenge → send challenge → exchange code+verifier. State param prevents CSRF. Implicit flow is deprecated.",
    feedback_partial: "PKCE: codeVerifier = random bytes. codeChallenge = SHA256(verifier). Send challenge in /authorize, verifier in /token. Verify state on callback.",
    feedback_wrong: "crypto.randomBytes(64).toString('base64url') = verifier. SHA256(verifier).toString('base64url') = challenge. State = CSRF protection.",
    expected: "OAuth2 Authorization Code + PKCE",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Design access token + refresh token rotation: detect token theft via refresh token reuse detection.",
    answer_keywords: ["refresh token", "rotation", "reuse", "theft", "family", "revoke"],
    seed_code: `// Step 2: refresh token rotation with theft detection

/*
STRATEGY:
  Access token:  short-lived (15 min), stored in memory (not localStorage)
  Refresh token: long-lived (7 days), stored in httpOnly cookie
  Rotation:      each refresh issues a NEW refresh token, invalidates old one
  Theft detect:  if an old (already rotated) refresh token is used → revoke ALL

WHY THIS WORKS:
  Attacker steals refresh token at T=0.
  Legitimate user uses it at T=1 → new refresh token issued, old invalidated.
  Attacker tries to use stolen token at T=2 → it's already been rotated.
  Server detects reuse → revokes ENTIRE token family (kicks everyone out).
  → Attacker AND legitimate user must re-authenticate.
  → Theft detected and neutralised.
*/

async function refreshTokens(oldRefreshToken) {
  const tokenRecord = await db.findRefreshToken(oldRefreshToken)

  // Token not found at all:
  if (!tokenRecord) throw new AuthError('Invalid refresh token')

  // REUSE DETECTION — token was already rotated:
  if (tokenRecord.rotatedAt) {
    // This token was already used once — possible theft!
    // Revoke the entire family (all sessions for this user):
    await db.revokeTokenFamily(tokenRecord.familyId)
    await alertUser(tokenRecord.userId, 'Suspicious login detected — all sessions ended')
    throw new AuthError('Refresh token reuse detected — session revoked')
  }

  // Token is expired:
  if (tokenRecord.expiresAt < new Date()) {
    await db.deleteRefreshToken(tokenRecord.id)
    throw new AuthError('Refresh token expired')
  }

  // Issue new tokens:
  const newAccessToken  = generateAccessToken(tokenRecord.userId)
  const newRefreshToken = crypto.randomBytes(32).toString('hex')

  // Mark old token as rotated (don't delete — needed for reuse detection):
  await db.markTokenRotated(tokenRecord.id)

  // Store new refresh token (same family):
  await db.createRefreshToken({
    token:    crypto.createHash('sha256').update(newRefreshToken).digest('hex'),  // store hash
    userId:   tokenRecord.userId,
    familyId: tokenRecord.familyId,
    expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
  })

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

function generateAccessToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m', algorithm: 'HS256' }
  )
}

export { refreshTokens }`,
    feedback_correct: "✅ Rotation: each refresh creates new token, marks old as rotated. Reuse detection: rotated token used again → revoke entire family.",
    feedback_partial: "Mark old refresh token as rotated (don't delete). If rotated token arrives again → theft → revoke family. Store hash not raw token.",
    feedback_wrong: "tokenRecord.rotatedAt exists → theft detected → revoke all tokens in familyId. Store SHA256(refreshToken) not raw token.",
    expected: "Refresh token rotation and theft detection",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Manage secrets correctly: Vault/Secrets Manager in prod, never in env files or code. Show secret rotation without downtime.",
    answer_keywords: ["vault", "secrets manager", "rotation", "env", "never in code", "dynamic credentials"],
    seed_code: `// Step 3: secrets management — the right way

/*
THE WRONG WAYS (all too common):
  ❌ Hardcoded in source code:  const key = 'sk_live_abc123'
  ❌ .env file committed to git
  ❌ .env file on production server (flat file, no audit, no rotation)
  ❌ Environment variables in Docker Compose committed to repo
  ❌ Secrets in CI/CD logs (via echo or error messages)

THE RIGHT WAY: a secrets manager with audit logging + rotation
*/

// ── AWS SECRETS MANAGER ───────────────────────────────────────
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' })

// Cache secrets in memory — don't call Secrets Manager on every request:
const secretCache = new Map()

async function getSecret(secretName, maxAgeMs = 300_000) {  // 5 min cache
  const cached = secretCache.get(secretName)
  if (cached && Date.now() - cached.fetchedAt < maxAgeMs) {
    return cached.value
  }

  const command = new GetSecretValueCommand({ SecretId: secretName })
  const response = await secretsClient.send(command)
  const value = JSON.parse(response.SecretString)

  secretCache.set(secretName, { value, fetchedAt: Date.now() })
  return value
}

// Usage:
async function getDBCredentials() {
  return getSecret('prod/myapp/postgres')
  // returns { username: '...', password: '...' }
}

// ── SECRET ROTATION WITHOUT DOWNTIME ─────────────────────────
// Pattern: dual credentials during rotation window
//
// T=0:  DB has credentials A (active) and B (pending)
//       App uses A
// T=1:  Rotation begins:
//       1. Create new credential B in DB
//       2. Update Secrets Manager to version B
//       3. Invalidate app cache → next request fetches B
//       4. App now uses B
// T=2:  Rotation completes:
//       5. Delete old credential A from DB
//
// App never loses DB access — always has at least one valid credential.

// ── HASHICORP VAULT (self-hosted alternative) ─────────────────
// Dynamic credentials — Vault creates a TEMPORARY DB user per request:
// vault.database.generateCredentials('my-postgres-role')
// → { username: 'v-app-AbCdEf', password: '...', ttl: '1h' }
// Credentials expire automatically. No long-lived service passwords.

// ── IN KUBERNETES ──────────────────────────────────────────────
// Use External Secrets Operator:
// ExternalSecret CR syncs from AWS/Vault → Kubernetes Secret
// Pods mount the K8s Secret as env vars or volume
// Never put secrets in ConfigMaps or Helm values

export { getSecret }`,
    feedback_correct: "✅ Secrets Manager/Vault, never in code or env files. Cache in memory (don't call per request). Dual credentials enable zero-downtime rotation.",
    feedback_partial: "AWS Secrets Manager or HashiCorp Vault. Cache secrets with TTL. Dual credentials for zero-downtime rotation. Dynamic credentials expire automatically.",
    feedback_wrong: "getSecret('prod/myapp/key') with in-memory cache. Never .env in prod. Dual credentials for rotation: create new, update, then delete old.",
    expected: "Secrets management and zero-downtime rotation",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Implement API key management: generation, storage (hashed), scoping, and revocation. Show the lookup pattern.",
    answer_keywords: ["api key", "hash", "prefix", "scope", "revoke", "sha256"],
    seed_code: `// Step 4: API key management

/*
DESIGN PRINCIPLES:
  1. Generate cryptographically random keys
  2. Show the full key ONCE at creation — never again
  3. Store only the HASH in the DB (breach-safe)
  4. Use a readable prefix (like GitHub: ghp_, Stripe: sk_live_)
  5. Scope keys to specific permissions
  6. Support revocation per-key

FORMAT: {prefix}_{randomBytes}
  sk_live_abc123xyz...   (Stripe-style)
  myapp_abc123xyz...
*/

import crypto from 'crypto'

// ── GENERATION ───────────────────────────────────────────────
async function createAPIKey({ userId, name, scopes }) {
  const rawKey = crypto.randomBytes(32).toString('base64url')
  const key    = \`myapp_\${rawKey}\`  // full key — shown ONCE
  const hash   = crypto.createHash('sha256').update(key).digest('hex')
  const prefix = key.substring(0, 12)  // for display: 'myapp_aBcDeF'

  await db.query([
    'INSERT INTO api_keys (user_id, name, key_hash, key_prefix, scopes, created_at)',
    'VALUES ($1, $2, $3, $4, $5, NOW())',
  ].join('\n'), [userId, name, hash, prefix, JSON.stringify(scopes)])

  // Return the RAW KEY — this is the only time it's visible:
  return { key, prefix, scopes }
}

// ── LOOKUP ON REQUEST ─────────────────────────────────────────
// Request arrives with: Authorization: Bearer myapp_aBcDeF...
async function authenticateAPIKey(rawKey) {
  if (!rawKey?.startsWith('myapp_')) {
    throw new AuthError('Invalid API key format')
  }

  const hash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const record = await db.query([
    'SELECT user_id, scopes, revoked_at, last_used_at',
    'FROM api_keys',
    'WHERE key_hash = $1',
  ].join('\n'), [hash])

  if (!record) throw new AuthError('Invalid API key')
  if (record.revoked_at) throw new AuthError('API key revoked')

  // Update last used (async — don't block the request):
  setImmediate(() =>
    db.query('UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1', [hash])
  )

  return { userId: record.user_id, scopes: record.scopes }
}

// ── SCOPE CHECKING ────────────────────────────────────────────
function requireScope(scope) {
  return (req, res, next) => {
    if (!req.apiKey?.scopes?.includes(scope)) {
      return res.status(403).json({ error: \`Requires scope: \${scope}\` })
    }
    next()
  }
}

// ── REVOCATION ────────────────────────────────────────────────
async function revokeAPIKey(keyId, userId) {
  await db.query([
    'UPDATE api_keys SET revoked_at = NOW()',
    'WHERE id = $1 AND user_id = $2  -- scope by owner',
  ].join('\n'), [keyId, userId])
}

export { createAPIKey, authenticateAPIKey, requireScope, revokeAPIKey }`,
    feedback_correct: "✅ Generate random, store SHA256 hash, show raw key once. Prefix for display. Scopes for least privilege. Lookup by hashing the incoming key.",
    feedback_partial: "SHA256(rawKey) stored. Raw key shown once at creation. Lookup: hash incoming key, compare to stored hash. Revoke sets revoked_at.",
    feedback_wrong: "crypto.randomBytes(32) → prefix+rawKey. Store SHA256(key). Show raw key once. Lookup: hash incoming key → db.query(WHERE key_hash=$1).",
    expected: "API key generation, storage, and lookup",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Apply Zero Trust principles to service-to-service calls. Show how to authenticate inter-service requests without trusting the network.",
    answer_keywords: ["zero trust", "service account", "mtls", "service mesh", "jwt", "never trust"],
    seed_code: `// Step 5: Zero Trust — service-to-service authentication

/*
TRADITIONAL (broken) MODEL:
  "Services inside our VPC can trust each other."
  → One compromised service → all services compromised.
  → Lateral movement is trivial.
  → Assumes the network perimeter holds forever.

ZERO TRUST MODEL:
  "Never trust, always verify — even inside the network."
  Every service call must be authenticated and authorized.
  Every request carries a credential. Nothing is trusted by default.

IMPLEMENTATION OPTIONS (pick based on your infra):
*/

// ── OPTION 1: SERVICE JWT (simplest) ─────────────────────────
// Each service has a long-lived service account JWT.
// Services include it in Authorization header.

const serviceToken = jwt.sign(
  { sub: 'order-service', iss: 'auth-service', scope: 'payment:read payment:write' },
  process.env.SERVICE_JWT_SECRET,
  { expiresIn: '1h', algorithm: 'HS256' }
)

async function callPaymentService(orderId) {
  return fetch('https://payment-service.internal/payments', {
    headers: { 'Authorization': \`Bearer \${serviceToken}\` },
    // payment-service verifies the JWT before processing
  })
}

// ── OPTION 2: mTLS (mutual TLS) — strongest ──────────────────
// Both client AND server present certificates.
// Only services with valid certs issued by your CA can communicate.
// Used by: Istio, Linkerd, Envoy service meshes.
//
// Config in Istio:
// apiVersion: security.istio.io/v1beta1
// kind: PeerAuthentication
// spec:
//   mtls:
//     mode: STRICT   ← reject any connection without a valid cert

// ── OPTION 3: SPIFFE/SPIRE (cloud-native identity) ───────────
// Each workload gets a SPIFFE ID: spiffe://myapp.com/order-service
// Automatically rotated, short-lived x.509 certificates.
// Works across clouds and on-premises.

// ── WHAT TO AUTHORIZE ─────────────────────────────────────────
// Authentication: who is calling?
// Authorization: what can they call?
//
// order-service can call:  payment-service/charge, inventory-service/reserve
// order-service CANNOT:   user-service/admin, billing-service/refund
//
// Implement with: OPA (Open Policy Agent) or custom middleware

function serviceAuthMiddleware(allowedServices) {
  return async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No service token' })

    const payload = jwt.verify(token, process.env.SERVICE_JWT_SECRET)
    if (!allowedServices.includes(payload.sub)) {
      return res.status(403).json({ error: \`Service \${payload.sub} not allowed\` })
    }

    req.callerService = payload.sub
    next()
  }
}

// payment-service uses this:
// app.use('/charge', serviceAuthMiddleware(['order-service', 'subscription-service']))

export { serviceAuthMiddleware, callPaymentService }`,
    feedback_correct: "✅ Zero Trust: every inter-service call authenticated. Service JWTs for simple setups. mTLS for strongest guarantees. Never trust the network.",
    feedback_partial: "Zero Trust: never trust, always verify. Service JWT or mTLS for inter-service auth. Authorise which services can call which endpoints.",
    feedback_wrong: "Each service presents credentials. JWT: sub=service-name, verify on every call. mTLS: mutual cert authentication via Istio/Envoy.",
    expected: "Zero Trust service-to-service authentication",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — OAuth2 + PKCE", id: "step1" },
  { label: "Step 2 — Token rotation", id: "step2" },
  { label: "Step 3 — Secrets management", id: "step3" },
  { label: "Step 4 — API keys", id: "step4" },
  { label: "Step 5 — Zero Trust", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "SEC-02", title: "Auth Architecture & Secrets Management", shortName: "SEC — AUTH ARCH" });

# Deploying this repo on Railway — two services, one repo

Railway lets multiple services point at the same GitHub repo, each with its own start command —
no yaml/config file needed, just two dashboard settings.

## Service 1 — main API (`inpact-api`)

Start command: `node server/index.js` (Railway's default Node build already runs `npm install`
then `npm start`, and `package.json`'s `start` script is exactly this — nothing to change).

Needs **public networking** (this is what `inpactFE`'s `serve.js` reverse-proxies `/api/*` to via
`API_INTERNAL_URL`, and Railway private networking works between services in the same project
regardless of which repo backs each one).

### Environment variables

| Variable | Value |
|---|---|
| `PORT` | Set automatically by Railway — leave unset yourself |
| `AUTH_SESSION_SECRET` | Long random string — session JWT signing key |
| `DEEPSEEK_API_KEY` / `VITE_DEEPSEEK_API_KEY` | DeepSeek API key (AI lesson generation/validation) |
| `GOOGLE_API_KEY` / `GEMINI_API_KEY` / `VITE_GEMINI_API_KEY` | Gemini API key, if used |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` / `GOOGLE_OAUTH_REDIRECT_URI` | Google sign-in |
| `IPF_FRONTEND_URL` | The deployed `inpactFE` service's public URL (OAuth redirect target) |
| `IPF_SUPER_ADMIN_EMAILS` | Comma-separated emails that always hold every grantable role |
| `ONEDEV_API_USER` / `ONEDEV_API_PASS` | OneDev Basic-Auth credentials (server-side only, never sent to the browser) |
| `ONEDEV_INTERNAL_URL` | Private-network address of the OneDev Railway service, e.g. `http://onedev.railway.internal:6610` |
| `MATTERMOST_INTERNAL_URL` | Private-network address of the Mattermost Railway service, e.g. `http://mattermost.railway.internal:8065` |
| `VITE_MATTERMOST_WEBHOOK_ID` | Mattermost incoming-webhook id |
| `LDAP_URL` | Private-network address of the LDAP Railway service, e.g. `ldap://ldap.railway.internal:389` |
| `LDAP_ADMIN_DN` / `LDAP_ADMIN_PASSWORD` / `LDAP_BASE_DN` / `LDAP_CORE_OU` | LDAP bind + search config |
| `CACHE_DIR` / `CONTENT_DIR` | Optional — override default on-disk paths if needed |

## Service 2 — gemini-lessons (`inpact-gemini-lessons`)

Same repo, different Railway service. Start command override (Settings → Deploy → Custom Start
Command): `node server/gemini-react-ts-lessons-server.js`

### Environment variables

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini API key + model name |

(`PORT` is injected automatically by Railway — this service now prefers it over the local-dev-only `GEMINI_LESSON_SERVER_PORT` convention, so nothing to set.)

This service does not need public networking unless something outside Railway calls it directly.

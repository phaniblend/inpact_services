/**
 * Shared OneDev server-side client. Every router that talks to OneDev (id-router, specforge-router,
 * and any future one) should go through here instead of hand-rolling its own fetch + auth header —
 * that duplication is how the auth header and the base URL drift apart between files.
 *
 * Endpoints used (confirmed against OneDev's own RESTful resource source, not guessed):
 *   POST /issues                     -> create issue, body IssueOpenData {projectId, title, description, ...}, returns issue id
 *   GET  /issues?query=&offset=&count= -> list issues
 *   POST /issues/{id}/description    -> replace an issue's description, body = raw JSON string
 *   POST /issues/{id}/title          -> replace an issue's title, body = raw JSON string
 *   POST /projects                   -> create project, body ProjectData {name, description, ...}, returns project id
 *   GET  /projects?offset=&count=    -> list projects
 */
// Local dev: OneDev's Docker container on localhost. Production (Railway): set ONEDEV_INTERNAL_URL
// to the private-network address of the OneDev service (e.g. http://onedev.railway.internal:6610) —
// never expose OneDev's own port publicly; only this server talks to it directly.
const ONEDEV_URL = `${(process.env.ONEDEV_INTERNAL_URL || "http://localhost:6610").replace(/\/+$/, "")}/~api`;

function authHeader() {
  const user = process.env.ONEDEV_API_USER || "";
  const pass = process.env.ONEDEV_API_PASS || "";
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

async function onedevFetch(path, opts = {}) {
  const res = await fetch(`${ONEDEV_URL}${path}`, {
    ...opts,
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Project service error (${res.status})`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function listProjects({ offset = 0, count = 100 } = {}) {
  return onedevFetch(`/projects?offset=${offset}&count=${count}`);
}

/** Case-insensitive match on project name across pages (OneDev may paginate). */
export async function findProjectByName(name) {
  const want = String(name || "").trim().toLowerCase();
  if (!want) return null;
  let offset = 0;
  const count = 100;
  for (;;) {
    const page = (await listProjects({ offset, count })) || [];
    const hit = page.find((p) => String(p?.name || "").trim().toLowerCase() === want);
    if (hit) return hit;
    if (page.length < count) return null;
    offset += count;
    if (offset > 2000) return null;
  }
}

/**
 * Create a delivery project, or reuse one that already has this name.
 * OneDev rejects duplicate names with "already used"; SpecForge first-publish used to hard-fail
 * after a seed / prior attempt left the project behind.
 *
 * @returns {{ projectId: number, projectName: string, reused: boolean }}
 */
export async function ensureDeliveryProject({ name, description }) {
  const desired = String(name || "").trim();
  if (!desired) throw new Error("delivery project name is required");

  const existing = await findProjectByName(desired);
  if (existing?.id) {
    return { projectId: existing.id, projectName: existing.name || desired, reused: true };
  }

  try {
    const projectId = await createProject({ name: desired, description });
    if (!projectId) throw new Error("Project service did not return a project id after creation");
    return { projectId, projectName: desired, reused: false };
  } catch (err) {
    const msg = err?.message || String(err);
    // Race / OneDev duplicate wording — re-check and reuse rather than fail the whole publish.
    if (/already used|already exists|duplicate|name.*taken/i.test(msg)) {
      const again = await findProjectByName(desired);
      if (again?.id) {
        return { projectId: again.id, projectName: again.name || desired, reused: true };
      }
    }
    throw err;
  }
}

export async function listIssues({ query = "", offset = 0, count = 200 } = {}) {
  return onedevFetch(`/issues?query=${encodeURIComponent(query)}&offset=${offset}&count=${count}`);
}

/** Returns the new project's id as a plain number — same bare-id response shape as createIssue
 * below (POST /projects, same OneDev creation-endpoint family), normalized the same way. */
export async function createProject({ name, description }) {
  const result = await onedevFetch(`/projects`, {
    method: "POST",
    body: JSON.stringify({
      name,
      description: description || "",
      // ProjectData rejects these as "must not be null" if omitted entirely — OneDev wants the
      // objects present even with every inner field null, same shape GET /projects returns for
      // existing projects. Discovered live: the first-ever project creation 400'd on this.
      gitPackConfig: { windowMemory: null, packSizeLimit: null, threads: null, window: null },
      codeAnalysisSetting: { analysisFiles: null },
    }),
  });
  return typeof result === "number" ? result : result?.id;
}

/** Returns the new issue's id as a plain number. Confirmed via a direct curl to the real API:
 * POST /issues' response body is the bare id (e.g. `111`), not `{"id":111,...}` like most other
 * endpoints here — despite @Consumes/@Produces both being application/json. Normalized once, here:
 * three call sites (specforge-router.js x2, assistance-sessions.js) had already independently
 * discovered this and defended against it with their own `typeof result === "number" ? result :
 * result?.id` — a fourth (recruit-router.js) hadn't, and silently wrote "ApplicationId: undefined"
 * into real OneDev issues until found live 2026-08-09. One normalization point beats four
 * (three, in this case) copies of the same defensive guess. */
export async function createIssue({ projectId, title, description }) {
  const result = await onedevFetch(`/issues`, { method: "POST", body: JSON.stringify({ projectId, title, description: description || "" }) });
  return typeof result === "number" ? result : result?.id;
}

// Found live: both of these endpoints take a bare `String` JAX-RS parameter
// (`setDescription(Long issueId, String description)` / `setTitle(...)`), and OneDev's server reads
// the raw request body bytes directly into that String rather than JSON-parsing it — despite
// @Consumes(APPLICATION_JSON) and despite this doc'd elsewhere as "a raw JSON string". Sending
// JSON.stringify(text) stores the text WITH its literal quote marks and escaped `\n` sequences as
// part of the value itself — confirmed live by round-tripping a real update and reading it back:
// every regex expecting a real line break (e.g. Workbench's `/^AssistModule:/m` wired-tutorial
// check) silently failed to match, so a task ID Studio had just unblocked still showed as
// unassisted. Fix: send the raw text directly, no JSON.stringify — verified this round-trips with
// real newlines intact. Content-Type stays application/json to satisfy @Consumes; the body itself
// is deliberately not valid JSON.
export async function updateIssueDescription(issueId, description) {
  return onedevFetch(`/issues/${issueId}/description`, { method: "POST", body: description });
}

export async function updateIssueTitle(issueId, title) {
  return onedevFetch(`/issues/${issueId}/title`, { method: "POST", body: title });
}

/** Parses the simple "Key: value" per-line convention every IPF module uses for issue descriptions
 * (Apply, MatchingQueue, HuddleCalendar, ContributionMonitor, id-router all follow this). Values that
 * span multiple lines aren't supported — same limitation the existing per-file parsers already have. */
export function parseKV(description) {
  return Object.fromEntries(
    (description || "")
      .split("\n")
      .map((l) => l.split(": "))
      .filter((parts) => parts.length >= 2)
      .map(([k, ...rest]) => [k.trim(), rest.join(": ").trim()])
  );
}

export { onedevFetch };

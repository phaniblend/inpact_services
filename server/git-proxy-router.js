/**
 * Git-smart-HTTP proxy — relays isomorphic-git's browser `http` client to OneDev's real git
 * endpoint, injecting the same shared service-account credential already used for REST calls at
 * `/api/onedev` (see `onedev-client.js`'s `authHeader()` — same pattern, duplicated here rather
 * than imported since this proxy deals in raw bytes, not JSON, and has no other overlap with that
 * module). Mounted at /api/git behind `requireSession` in server/index.js — any signed-in learner
 * may push to their own assigned project; OneDev's own per-project permissions (none enforced today
 * since every call uses the one shared admin account) are a finer boundary this doesn't add.
 *
 * Verified live against real OneDev (2026-09-02) before writing this: `curl -u user:pass
 * http://localhost:6610/OneInbox.git/info/refs?service=git-upload-pack` returns a real, valid
 * pkt-line-framed `application/x-git-upload-pack-advertisement` body; `service=git-receive-pack`
 * likewise returns a real `application/x-git-receive-pack-advertisement`. Both auth cleanly with
 * the existing ONEDEV_API_USER/ONEDEV_API_PASS — no separate git-specific credential exists or is
 * needed for the transport hop.
 *
 * isomorphic-git only ever issues three request shapes against a remote:
 *   GET  {url}/info/refs?service=git-upload-pack|git-receive-pack   (clone/fetch/push discovery)
 *   POST {url}/git-upload-pack   body: application/x-git-upload-pack-request
 *   POST {url}/git-receive-pack  body: application/x-git-receive-pack-request
 * All three are handled by the single catch-all below.
 */
import express from "express";

const router = express.Router();

/**
 * Raw binary body capture, scoped to this router only (not applied globally in server/index.js).
 * server/index.js's global `express.json()` only consumes bodies whose Content-Type is JSON — for
 * every other content type (our `application/x-git-*-request` bodies included) it leaves the
 * request stream untouched, so it's still readable here. `type: () => true` matches every request
 * regardless of Content-Type; GET requests simply produce an empty Buffer.
 */
router.use(express.raw({ type: () => true, limit: "80mb" }));

function authHeader() {
  const user = process.env.ONEDEV_API_USER || "";
  const pass = process.env.ONEDEV_API_PASS || "";
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

router.use(async (req, res) => {
  // req.url is already relative to this router's /api/git mount point (Express strips the mount
  // prefix before handing control to a sub-router) — e.g.
  // "/OneInbox.git/info/refs?service=git-upload-pack" or "/OneInbox.git/git-upload-pack". Split on
  // the literal ".git/" to recover the OneDev project path and the git-command suffix, rather than
  // relying on Express 5's wildcard route syntax (its `*` matching changed from Express 4 and is
  // easy to get subtly wrong for a variable-depth path like an OneDev project path).
  const marker = ".git/";
  const idx = req.url.indexOf(marker);
  if (idx < 0) {
    return res.status(400).json({ error: "Malformed git proxy path — expected /<project>.git/<git-command>" });
  }
  const projectPath = decodeURIComponent(req.url.slice(1, idx)); // strip leading "/"
  const suffix = req.url.slice(idx + marker.length); // "info/refs?service=..." or "git-upload-pack" etc.

  const base = (process.env.ONEDEV_INTERNAL_URL || "http://localhost:6610").replace(/\/+$/, "");
  const target = `${base}/${projectPath}.git/${suffix}`;
  const hasBody = !["GET", "HEAD"].includes(req.method);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        Authorization: authHeader(),
        "Content-Type": req.headers["content-type"] || "application/octet-stream",
        Accept: req.headers["accept"] || "*/*",
      },
      body: hasBody ? req.body : undefined,
    });
    // Buffered, not streamed — v1 simplicity (see plan doc for the size-limit tradeoff this
    // implies). `fetch` already de-chunks OneDev's `Transfer-Encoding: chunked` responses for us.
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.send(buf);
  } catch (err) {
    console.error("[git-proxy] upstream error:", err.message);
    res.status(502).json({ error: "Git upstream error" });
  }
});

export default router;

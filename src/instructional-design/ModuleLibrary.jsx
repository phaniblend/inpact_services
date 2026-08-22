import { useEffect, useState, useCallback } from "react";
import "./ModuleLibrary.css";

const MODULE_LIBRARY_PROJECT_ID = 4;

async function api(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/** Honest progress view over the ID Module Library: the 43-entry planned catalog
 * (src/id-module/moduleCatalog.js) cross-referenced against what's actually been published
 * or is still sitting in review — plus anything SpecForge auto-drafted that was never on the
 * planned list at all, since its tags come from the LLM's own grouping, not the catalog. */
export default function ModuleLibrary() {
  const [catalog, setCatalog] = useState([]);
  const [published, setPublished] = useState([]); // [{tag, publishedAt}]
  const [pending, setPending] = useState([]); // [{tag, product, taskCount}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [catalogRes, issues] = await Promise.all([
        api("/api/id/catalog"),
        api(`/api/onedev/issues?offset=0&count=200`),
      ]);
      setCatalog(catalogRes.catalog || []);

      const libraryIssues = issues.filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID);
      const pub = libraryIssues
        .filter((i) => i.title.startsWith("Module:"))
        .map((i) => ({ tag: i.title.replace("Module:", "").trim(), publishedAt: i.submitDate }));
      const pend = libraryIssues
        .filter(
          (i) =>
            (i.title.startsWith("Assistance lesson needed:") || i.title.startsWith("Tutorial needed:")) &&
            !i.title.includes("(resolved)")
        )
        .map((i) => {
          const productMatch = /RequestedForProduct:\s*(.+)/.exec(i.description || "");
          const tasksMatch = /RequestedForTasks:\s*(.+)/.exec(i.description || "");
          const tag = i.title
            .replace(/^Assistance lesson needed:\s*/i, "")
            .replace(/^Tutorial needed:\s*/i, "")
            .trim();
          return {
            tag,
            product: productMatch?.[1]?.trim() || "",
            taskCount: (tasksMatch?.[1] || "").split(",").filter(Boolean).length,
            kind: /Kind:\s*funda/i.test(i.description || "") ? "funda" : "core",
          };
        });
      setPublished(pub);
      setPending(pend);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const publishedTags = new Set(published.map((p) => p.tag));
  const pendingTags = new Set(pending.map((p) => p.tag));

  const catalogWithStatus = catalog.map((c) => ({
    ...c,
    status: publishedTags.has(c.tag) ? "published" : pendingTags.has(c.tag) ? "pending" : "planned",
  }));

  const publishedCount = catalogWithStatus.filter((c) => c.status === "published").length;
  const pendingCount = catalogWithStatus.filter((c) => c.status === "pending").length;
  const plannedCount = catalogWithStatus.filter((c) => c.status === "planned").length;

  // Published or pending tags that aren't in the planned catalog at all — SpecForge drafts these
  // organically from real tasks, so the pool grows beyond what was pre-written.
  const catalogTags = new Set(catalog.map((c) => c.tag));
  const orgPublished = published.filter((p) => !catalogTags.has(p.tag));
  const orgPending = pending.filter((p) => !catalogTags.has(p.tag));

  const grouped = catalogWithStatus.reduce((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="mlib">
      <header className="mlib-header">
        <div className="mlib-kicker">ID Module Library</div>
        <h1>How much of the generic pool actually exists</h1>
        <p className="mlib-sub">
          The planned catalog is a target, not an inventory — this is what's really been generated and
          reviewed. Every module here is meant to be generic and reusable across products, never tied to
          one; see <a href="#/id-studio">ID Studio</a> to review anything still pending.
        </p>
      </header>

      {error && <div className="mlib-error">{error}</div>}
      {loading && <div className="mlib-loading">Loading…</div>}

      {!loading && (
        <>
          <section className="mlib-tiles">
            <div className="mlib-tile">
              <div className="mlib-tile-value">{catalog.length}</div>
              <div className="mlib-tile-label">Planned catalog entries</div>
            </div>
            <div className="mlib-tile mlib-tile-good">
              <div className="mlib-tile-value">{publishedCount}</div>
              <div className="mlib-tile-label">Published</div>
            </div>
            <div className="mlib-tile mlib-tile-warn">
              <div className="mlib-tile-value">{pendingCount}</div>
              <div className="mlib-tile-label">Drafted, pending review</div>
            </div>
            <div className="mlib-tile">
              <div className="mlib-tile-value">{plannedCount}</div>
              <div className="mlib-tile-label">Not started</div>
            </div>
          </section>

          {(orgPublished.length > 0 || orgPending.length > 0) && (
            <section className="mlib-organic">
              <h2>Grown beyond the plan</h2>
              <p className="mlib-organic-sub">
                SpecForge drafts these from real published tasks — its own grouping, not the catalog below —
                so the pool ends up bigger than what was pre-written.
              </p>
              <div className="mlib-organic-list">
                {orgPublished.map((p) => (
                  <span className="mlib-chip mlib-chip-published" key={p.tag}>
                    ✓ {p.tag}
                  </span>
                ))}
                {orgPending.map((p) => (
                  <span className="mlib-chip mlib-chip-pending" key={p.tag}>
                    ⏳ {p.kind === "funda" ? "funda · " : ""}
                    {p.tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {Object.entries(grouped).map(([category, entries]) => (
            <section className="mlib-category" key={category}>
              <h2>{category}</h2>
              <div className="mlib-grid">
                {entries.map((c) => (
                  <div className={`mlib-card mlib-card-${c.status}`} key={c.tag}>
                    <div className="mlib-card-top">
                      <span className="mlib-tag">{c.tag}</span>
                      <span className={`mlib-tier mlib-tier-${c.tier}`}>{c.tier}</span>
                    </div>
                    <p className="mlib-concept">{c.concept}</p>
                    <span className={`mlib-status mlib-status-${c.status}`}>
                      {c.status === "published" ? "✓ Published" : c.status === "pending" ? "⏳ Pending review" : "— Not started"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

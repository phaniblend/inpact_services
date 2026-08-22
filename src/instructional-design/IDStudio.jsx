import { useState, useEffect } from "react";
import DraftReviewOverlay from "./DraftReviewOverlay.jsx";
import "./IDStudio.css";

const EMPTY = { moduleTag: "", concept: "", build: "", keyTeaching: "", newConcepts: "" };

async function api(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function getJson(path) {
  const res = await fetch(path);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export default function IDStudio() {
  const [tab, setTab] = useState("pending"); // "pending" | "generate"
  const [form, setForm] = useState(EMPTY);
  const [matches, setMatches] = useState(null);
  const [matchStatus, setMatchStatus] = useState("idle");
  const [generated, setGenerated] = useState(null);
  const [genStatus, setGenStatus] = useState("idle");
  const [publishStatus, setPublishStatus] = useState("idle");
  const [publishResult, setPublishResult] = useState(null);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  /** Map of missing-funda label -> "generate" | "trivial" */
  const [fundaChoices, setFundaChoices] = useState({});
  const [fundaStatus, setFundaStatus] = useState("idle"); // idle | loading | done | error
  const [fundaResult, setFundaResult] = useState(null);

  useEffect(() => {
    fetch("/api/id/catalog")
      .then((r) => r.json())
      .then((d) => setCatalog(d.catalog || []))
      .catch(() => {});
    loadPendingRequests();
  }, []);

  async function loadPendingRequests() {
    setPendingLoading(true);
    try {
      const data = await getJson("/api/id/pending-requests");
      setPendingRequests(data.requests);
    } catch {
      // OneDev unreachable — leave empty rather than blocking.
    } finally {
      setPendingLoading(false);
    }
  }

  function pickFromCatalog(entry) {
    setForm({
      moduleTag: entry.tag,
      concept: entry.concept,
      build: entry.build,
      keyTeaching: entry.keyTeaching,
      newConcepts: "",
    });
    setCatalogOpen(false);
    resetReviewState();
  }

  function resetReviewState() {
    setMatches(null);
    setMatchStatus("idle");
    setGenerated(null);
    setGenStatus("idle");
    setPublishStatus("idle");
    setPublishResult(null);
    setActiveRequest(null);
    setReviewOpen(false);
    setError("");
    setFundaChoices({});
    setFundaStatus("idle");
    setFundaResult(null);
  }

  function handlePublished(data) {
    setPublishStatus("done");
    setPublishResult(data);
    loadPendingRequests();
  }

  function startFresh() {
    setForm(EMPTY);
    resetReviewState();
    setTab("generate");
  }

  function initFundaChoices(req) {
    const next = {};
    for (const label of req.missingFundas || []) {
      next[label] = "generate";
    }
    setFundaChoices(next);
  }

  async function openPendingRequest(req) {
    resetReviewState();
    setActiveRequest(req);
    initFundaChoices(req);
    setForm({
      moduleTag: req.tag,
      concept: req.concept,
      build: req.build,
      keyTeaching: req.keyTeaching,
      newConcepts: "",
    });
    setTab("generate");
    if (req.filePath) {
      try {
        const data = await getJson(`/api/id/draft?filePath=${encodeURIComponent(req.filePath)}`);
        setGenerated({ filePath: data.filePath, code: data.code });
        setGenStatus("done");
      } catch (err) {
        setError(`Couldn't load the auto-generated draft (${err.message}) — generate again below.`);
        // Fall through to the same "needs Gemini" UX as a failed publish draft.
        setMatchStatus("done");
        setMatches([]);
      }
    } else {
      // SpecForge queued this without a draft (or generation failed) — don't make ID re-run
      // "Check Module Library" just to unlock Generate with Gemini.
      setMatchStatus("done");
      setMatches([]);
    }
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function setFundaChoice(label, choice) {
    setFundaChoices((prev) => ({ ...prev, [label]: choice }));
  }

  async function submitFundaDecision() {
    if (!activeRequest?.issueId) return;
    const generate = Object.entries(fundaChoices)
      .filter(([, c]) => c === "generate")
      .map(([label]) => label);
    const skip = Object.entries(fundaChoices)
      .filter(([, c]) => c === "trivial")
      .map(([label]) => label);
    if (generate.length === 0 && skip.length === 0) {
      setError("Assign each missing funda to Generate or Trivial first.");
      return;
    }
    setFundaStatus("loading");
    setError("");
    setFundaResult(null);
    try {
      const data = await api("/api/id/funda-decision", {
        issueId: activeRequest.issueId,
        generate,
        skip,
      });
      setFundaResult(data);
      setFundaStatus("done");
      setActiveRequest((r) =>
        r
          ? {
              ...r,
              missingFundas: (r.missingFundas || []).filter((m) => !generate.includes(m) && !skip.includes(m)),
              generateFundas: generate,
              skipFundas: skip,
              fundaDecision: data.decision,
            }
          : r
      );
      await loadPendingRequests();
    } catch (err) {
      setError(err.message);
      setFundaStatus("error");
    }
  }

  async function checkMatch(e) {
    e.preventDefault();
    setMatchStatus("loading");
    setError("");
    setMatches(null);
    try {
      const data = await api("/api/id/match", { moduleTag: form.moduleTag, concept: form.concept });
      setMatches(data.matches);
      setMatchStatus("done");
    } catch (err) {
      setError(err.message);
      setMatchStatus("error");
    }
  }

  async function generate() {
    setGenStatus("loading");
    setError("");
    setGenerated(null);
    try {
      const data = await api("/api/id/generate", form);
      setGenerated(data);
      setGenStatus("done");
    } catch (err) {
      setError(err.message);
      setGenStatus("error");
    }
  }

  const showFundaPanel =
    activeRequest &&
    activeRequest.kind !== "funda" &&
    ((activeRequest.missingFundas?.length > 0 && fundaStatus !== "done") || fundaStatus === "done");

  return (
    <div className="ids">
      <header className="ids-header">
        <div className="ids-kicker">Instructional Design (ID) Module</div>
        <h1>Reuse first. Generate only if nothing fits.</h1>
        <p className="ids-sub">
          Workbench / SpecForge files missing-lesson drafts into this queue. Your job is review / edit /
          regenerate, then publish — Workbench wires published lessons onto the waiting tasks automatically.
        </p>
        <div className="ids-tabs">
          <button type="button" className={tab === "pending" ? "ids-tab-active" : ""} onClick={() => setTab("pending")}>
            Pending requests {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ""}
          </button>
          <button type="button" className={tab === "generate" ? "ids-tab-active" : ""} onClick={startFresh}>
            Generate new
          </button>
        </div>
        {tab === "generate" && (
          <button type="button" className="ids-catalog-toggle" onClick={() => setCatalogOpen((o) => !o)}>
            {catalogOpen ? "Hide" : "Browse"} planned catalog ({catalog.length})
          </button>
        )}
      </header>

      {tab === "pending" && (
        <section className="ids-pending">
          {pendingLoading && <p className="ids-sub">Loading…</p>}
          {!pendingLoading && pendingRequests.length === 0 && (
            <p className="ids-sub">
              Nothing waiting — every SpecForge task so far matched an existing assistance module.
            </p>
          )}
          {pendingRequests.map((req) => (
            <div className="ids-pending-card" key={req.issueId}>
              <button type="button" className="ids-pending-card-main" onClick={() => openPendingRequest(req)}>
                <div className="ids-pending-top">
                  <span className="ids-match-tag">{req.tag}</span>
                  <span className={`ids-status-tag ${req.filePath ? "ids-status-published" : "ids-status-planned"}`}>
                    {req.kind === "funda"
                      ? req.filePath
                        ? "funda draft ready"
                        : "funda generation failed"
                      : req.filePath
                        ? "draft ready"
                        : "needs draft"}
                  </span>
                </div>
                <p className="ids-pending-concept">{req.concept}</p>
                <div className="ids-pending-meta">
                  {req.kind === "funda" ? (
                    <>
                      Funda for <strong>{req.parentLesson || "parent lesson"}</strong>
                      {req.product ? <> · {req.product}</> : null}
                    </>
                  ) : (
                    <>
                      For <strong>{req.product}</strong> · blocks {req.taskCount} task{req.taskCount === 1 ? "" : "s"}
                    </>
                  )}
                </div>
                {req.missingFundas?.length > 0 && (
                  <div className="ids-funda-alert">
                    ⚠ Missing funda prereqs (decide generate vs trivial):{" "}
                    <strong>{req.missingFundas.join(", ")}</strong>
                  </div>
                )}
              </button>
              {!req.filePath && (
                <button
                  type="button"
                  className="ids-pending-generate"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPendingRequest(req);
                  }}
                >
                  Generate draft →
                </button>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === "generate" && (
        <>
          {catalogOpen && (
            <section className="ids-catalog">
              {Object.entries(
                catalog.reduce((acc, c) => {
                  (acc[c.category] ??= []).push(c);
                  return acc;
                }, {})
              ).map(([category, entries]) => (
                <div className="ids-catalog-group" key={category}>
                  <h3>{category}</h3>
                  {entries.map((c) => (
                    <button type="button" className="ids-catalog-item" key={c.tag} onClick={() => pickFromCatalog(c)}>
                      <span className={`ids-tier-tag ids-tier-${c.tier}`}>{c.tier}</span>
                      <span className="ids-catalog-item-tag">{c.tag}</span>
                    </button>
                  ))}
                </div>
              ))}
            </section>
          )}

          {activeRequest && (
            <div className="ids-request-banner">
              {activeRequest.kind === "funda" ? (
                <>
                  Reviewing a <strong>funda</strong> assistance-lesson draft
                  {activeRequest.parentLesson ? (
                    <>
                      {" "}
                      for parent <strong>{activeRequest.parentLesson}</strong>
                    </>
                  ) : null}
                  . Publish to the Module Library after you edit / regenerate — same path as core lessons.
                </>
              ) : (
                <>
                  Reviewing an assistance-lesson draft for <strong>{activeRequest.product}</strong> — publish it to the
                  Module Library after you edit / regenerate. That unblocks {activeRequest.taskCount} task
                  {activeRequest.taskCount === 1 ? "" : "s"}.
                </>
              )}
            </div>
          )}

          {showFundaPanel && (
            <section className="ids-funda-panel">
              <h2>Missing funda prereqs</h2>
              <p className="ids-sub">
                These fundas are listed on the draft but are not in the assistance modules catalog yet. Mark trivial
                ones to skip; generate only the ones apprentices actually need. Generated fundas land in Pending
                requests for the same review/publish loop.
              </p>
              {fundaStatus !== "done" &&
                (activeRequest.missingFundas || []).map((label) => (
                  <div className="ids-funda-row" key={label}>
                    <span className="ids-funda-label">{label}</span>
                    <div className="ids-funda-choices">
                      <label>
                        <input
                          type="radio"
                          name={`funda-${label}`}
                          checked={fundaChoices[label] === "generate"}
                          onChange={() => setFundaChoice(label, "generate")}
                        />
                        Generate draft
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`funda-${label}`}
                          checked={fundaChoices[label] === "trivial"}
                          onChange={() => setFundaChoice(label, "trivial")}
                        />
                        Trivial — skip
                      </label>
                    </div>
                  </div>
                ))}
              {fundaStatus !== "done" && (activeRequest.missingFundas?.length || 0) > 0 && (
                <button type="button" onClick={submitFundaDecision} disabled={fundaStatus === "loading"}>
                  {fundaStatus === "loading"
                    ? "Saving & generating fundas…"
                    : "Save decision & generate selected fundas"}
                </button>
              )}
              {fundaStatus === "done" && fundaResult && (
                <div className="ids-funda-done">
                  Decision saved.
                  {fundaResult.skip?.length > 0 && (
                    <p>
                      Marked trivial: <strong>{fundaResult.skip.join(", ")}</strong>
                    </p>
                  )}
                  {fundaResult.created?.length > 0 && (
                    <p>
                      Drafted into queue: <strong>{fundaResult.created.map((c) => c.tag).join(", ")}</strong> — open
                      Pending requests to review/publish.
                    </p>
                  )}
                  {fundaResult.skippedExisting?.length > 0 && (
                    <p>Already pending/published: {fundaResult.skippedExisting.map((c) => c.tag).join(", ")}</p>
                  )}
                  {fundaResult.failures?.length > 0 && (
                    <p className="ids-error-inline">
                      Failed: {fundaResult.failures.map((f) => `${f.label} (${f.error})`).join("; ")}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          <form className="ids-form" onSubmit={checkMatch}>
            <label>
              Module tag <span className="ids-hint">short, generic — e.g. toggle-boolean-state</span>
              <input required value={form.moduleTag} onChange={update("moduleTag")} placeholder="toggle-boolean-state" />
            </label>
            <label>
              Concept
              <input
                required
                value={form.concept}
                onChange={update("concept")}
                placeholder="Flipping a boolean piece of state and reflecting it in the UI"
              />
            </label>
            <label>
              Build <span className="ids-hint">generic worked example, never a named product</span>
              <input
                value={form.build}
                onChange={update("build")}
                placeholder="A Card with a Save button that toggles saved/unsaved"
              />
            </label>
            <label>
              Key teaching
              <input
                value={form.keyTeaching}
                onChange={update("keyTeaching")}
                placeholder="Functional updater prev => !prev, not !state directly"
              />
            </label>
            <label>
              New concepts <span className="ids-hint">optional</span>
              <input
                value={form.newConcepts}
                onChange={update("newConcepts")}
                placeholder="useState<boolean>, conditional className"
              />
            </label>
            <button type="submit" disabled={matchStatus === "loading"}>
              {matchStatus === "loading" ? "Checking…" : "Check Module Library"}
            </button>
          </form>

          {error && <div className="ids-error">{error}</div>}

          {matchStatus === "done" && (
            <section className="ids-section">
              <h2>Module Library check</h2>
              {matches.length === 0 && (
                <div className="ids-nomatch">
                  <p>
                    {activeRequest && !activeRequest.filePath
                      ? "This SpecForge request still needs a draft — generate it here, then review & publish."
                      : "Nothing close enough exists — generating a new module is warranted."}
                  </p>
                  <button type="button" onClick={generate} disabled={genStatus === "loading" || genStatus === "done"}>
                    {genStatus === "loading"
                      ? "Generating draft…"
                      : genStatus === "done"
                        ? "Draft ready below"
                        : "Generate draft"}
                  </button>
                </div>
              )}
              {matches.length > 0 && (
                <div className="ids-matches">
                  <p>
                    Found {matches.length} close match(es) — {matches.filter((m) => m.status === "published").length}{" "}
                    already published and reusable, {matches.filter((m) => m.status === "planned").length} planned but
                    not generated yet:
                  </p>
                  {matches.map((m) => (
                    <div className="ids-match-card" key={m.tag}>
                      <span className={`ids-status-tag ids-status-${m.status}`}>{m.status}</span>
                      <div className="ids-match-tag">{m.tag}</div>
                      <div className="ids-match-score">{Math.round(m.score * 100)}% overlap</div>
                      <div className="ids-match-desc">{m.description}</div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="ids-generate-anyway"
                    onClick={generate}
                    disabled={genStatus === "loading"}
                  >
                    Generate anyway
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Always offer draft generation once the form has a tag+concept — don't trap ID behind Match-only. */}
          {matchStatus === "idle" && form.moduleTag.trim() && form.concept.trim() && (
            <section className="ids-section">
              <h2>Generate</h2>
              <p className="ids-sub">
                Prefer <strong>Check Module Library</strong> first when you&apos;re inventing a new tag. If you already
                know nothing fits, generate directly.
              </p>
              <button type="button" onClick={generate} disabled={genStatus === "loading"}>
                {genStatus === "loading" ? "Generating draft…" : "Generate draft"}
              </button>
            </section>
          )}

          {genStatus === "done" && generated && (
            <section className="ids-section">
              <h2>{activeRequest ? "Auto-drafted — review before publishing" : "Generated — review before publishing"}</h2>
              <p className="ids-filepath">{generated.filePath}</p>
              {publishStatus !== "done" ? (
                <button type="button" onClick={() => setReviewOpen(true)}>
                  Review content &amp; publish →
                </button>
              ) : (
                <p className="ids-unblocked">
                  Published ✓{" "}
                  {publishResult?.unblockedTaskCount > 0
                    ? `— unblocked ${publishResult.unblockedTaskCount} task${
                        publishResult.unblockedTaskCount === 1 ? "" : "s"
                      } that were waiting on this assistance lesson.`
                    : "— nothing else was waiting on this one."}
                </p>
              )}
            </section>
          )}

          {reviewOpen && generated && (
            <DraftReviewOverlay
              filePath={generated.filePath}
              moduleTag={form.moduleTag}
              concept={form.concept}
              onClose={() => setReviewOpen(false)}
              onPublished={(data) => {
                handlePublished(data);
                setReviewOpen(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

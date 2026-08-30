import { useState, useLayoutEffect, useRef } from "react";
import { inferCodingTechLevel } from "../cohort-matching/skillLevels.js";
import ProductProposer from "./ProductProposer.jsx";
import "./PDStudio.css";

const EMPTY_FORM = {
  product_name: "",
  description: "",
  target_users: "",
  business_goal: "",
  constraints: "",
};

const TEAM_OPS_PROJECT_ID = 3;

/** Full-content height — no fixed rows / inner scrollbar (founder call). */
function AutoGrowTextarea({ value, onChange, className, placeholder, minRows = 2, ...rest }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const cs = window.getComputedStyle(el);
    const line = Number.parseFloat(cs.lineHeight) || 20;
    const pad = Number.parseFloat(cs.paddingTop) + Number.parseFloat(cs.paddingBottom) || 0;
    const minH = line * minRows + pad;
    el.style.height = `${Math.max(minH, el.scrollHeight)}px`;
  }, [value, minRows]);
  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      {...rest}
    />
  );
}

function toList(text) {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

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

/** Editable bullet list: each item is a text input, plus add/remove. Used for
 * business_outcomes, assumptions, questions, validation_rules, acceptance criteria —
 * anything SpecForge generates that PD should be able to correct before it's reviewed. */
function EditableList({ items, onChange, placeholder }) {
  function updateAt(i, value) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
  function removeAt(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, ""]);
  }
  return (
    <div className="pdstudio-editlist">
      {items.map((item, i) => (
        <div className="pdstudio-editrow" key={i}>
          <input value={item} onChange={(e) => updateAt(i, e.target.value)} placeholder={placeholder} />
          <button type="button" className="pdstudio-remove" onClick={() => removeAt(i)} aria-label="Remove">
            ×
          </button>
        </div>
      ))}
      <button type="button" className="pdstudio-add" onClick={add}>
        + Add
      </button>
    </div>
  );
}

function MatchChip({ task }) {
  if (task.no_tutorial_needed) {
    return <span className="pdstudio-chip pdstudio-chip-exempt">— no assistance lesson needed for this trade</span>;
  }
  if (task.matchStatus === "matched") {
    return (
      <span className="pdstudio-chip pdstudio-chip-matched">
        ✓ wired to <code>{task.moduleTag}</code> ({Math.round((task.matchScore ?? 0) * 100)}%)
      </span>
    );
  }
  if (task.matchStatus === "unmatched") {
    return (
      <span className="pdstudio-chip pdstudio-chip-blocked">
        ⚠ needs an assistance lesson — drafted on Publish, then review in{" "}
        <a href="#/id-studio">ID Studio</a>
      </span>
    );
  }
  return null;
}

export default function PDStudio() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | loading | error | similar | done
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // the editable, human-reviewed spec

  // --- Stage 3 ---
  const [tasks, setTasks] = useState([]);
  const [stage3Status, setStage3Status] = useState("idle"); // idle | breaking-down | classifying | done | error
  const [existingCohorts, setExistingCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState(""); // "" = create a new cohort
  const [publishStatus, setPublishStatus] = useState("idle"); // idle | loading | error | done
  const [publishResult, setPublishResult] = useState(null);

  const [stage2RebuildStatus, setStage2RebuildStatus] = useState("idle"); // idle | loading | error

  /** Near-duplicate delivery product (≥60%). When set, PD chooses extend vs force-new. */
  const [similarMatch, setSimilarMatch] = useState(null);
  /** Append-only publish onto an existing product (cohort + delivery project). */
  const [extendTarget, setExtendTarget] = useState(null);

  const formRef = useRef(null);
  /** An "Add"-ed Product Forge proposal pre-fills the Stage 1 form below instead of PD retyping
   * the name/description SpecForge already generated — same "generate once, reuse" spirit as
   * every other stage in this pipeline. */
  function useProposal(proposal) {
    resetPipelineState();
    setForm((f) => ({
      ...f,
      product_name: proposal.name,
      description: [proposal.description, `Narrow slice for this release: ${proposal.narrowSlice}`].join(" "),
    }));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function resetPipelineState() {
    setResult(null);
    setTasks([]);
    setStage3Status("idle");
    setPublishStatus("idle");
    setPublishResult(null);
    setStage2RebuildStatus("idle");
    setSimilarMatch(null);
    setExtendTarget(null);
    setSelectedCohortId("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    resetPipelineState();
    try {
      const res = await fetch("/api/specforge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: form.product_name,
          description: form.description,
          target_users: toList(form.target_users),
          business_goal: form.business_goal,
          constraints: toList(form.constraints),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      let similar = null;
      try {
        similar = await api("/api/specforge/similar-products", {
          product_name: form.product_name,
          description: form.description,
          release_features: data.stage1?.release_features || [],
        });
      } catch (simErr) {
        console.warn("[pd-studio] similar-products check skipped:", simErr.message);
      }

      if (similar?.match) {
        setResult(data);
        setSimilarMatch(similar);
        setStatus("similar");
        return;
      }

      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  /** Continue into Stage 1 editor as a patch on the matched product — existing board features stay; PD adds new ones. */
  function chooseExtendProduct() {
    if (!similarMatch?.match || !result) return;
    const match = similarMatch.match;
    const proposed = similarMatch.proposedNewFeatures?.length
      ? similarMatch.proposedNewFeatures
      : [];
    setResult((r) => ({
      ...r,
      stage1: {
        ...r.stage1,
        product_name: match.productName,
        // Scope for this run = net-new features only. Board inventory stays in the extend banner.
        release_features: proposed.length ? proposed : [""],
      },
      // Force a fresh Stage 2 from the new scope only.
      stage2: { surfaces: [], apis: [], scope_notes: r.stage2?.scope_notes || "" },
    }));
    setForm((f) => ({ ...f, product_name: match.productName }));
    setExtendTarget({
      projectId: match.projectId,
      projectName: match.projectName,
      productName: match.productName,
      cohortIssueId: match.cohortIssueId,
      cohortName: match.cohortName,
      existingFeatures: match.features,
    });
    if (match.cohortIssueId) setSelectedCohortId(String(match.cohortIssueId));
    setSimilarMatch(null);
    setStatus("done");
  }

  function chooseForceNewProduct() {
    setExtendTarget(null);
    setSelectedCohortId("");
    setSimilarMatch(null);
    setStatus("done");
  }

  // --- Stage 1 edits ---
  function updateStage1(field, value) {
    setResult((r) => ({ ...r, stage1: { ...r.stage1, [field]: value } }));
  }

  // --- Stage 2 edits (surfaces + APIs) ---
  function updateSurface(idx, field, value) {
    setResult((r) => {
      const surfaces = [...(r.stage2.surfaces || [])];
      surfaces[idx] = { ...surfaces[idx], [field]: value };
      return { ...r, stage2: { ...r.stage2, surfaces } };
    });
  }
  function removeSurface(idx) {
    setResult((r) => {
      const removed = r.stage2.surfaces[idx]?.name?.trim();
      const surfaces = (r.stage2.surfaces || []).filter((_, i) => i !== idx);
      const apis = (r.stage2.apis || []).map((a) => ({
        ...a,
        backs_surfaces: (a.backs_surfaces || []).filter((n) => n !== removed),
      }));
      return { ...r, stage2: { ...r.stage2, surfaces, apis } };
    });
  }
  function addSurface() {
    setResult((r) => ({
      ...r,
      stage2: {
        ...r.stage2,
        surfaces: [
          ...(r.stage2.surfaces || []),
          {
            name: "New surface",
            kind: "screen",
            pages: ["main view"],
            user_jobs: ["complete the primary job"],
            description: "",
            data_notes: "",
          },
        ],
      },
    }));
  }
  function updateApi(idx, field, value) {
    setResult((r) => {
      const apis = [...(r.stage2.apis || [])];
      apis[idx] = { ...apis[idx], [field]: value };
      return { ...r, stage2: { ...r.stage2, apis } };
    });
  }
  function removeApi(idx) {
    setResult((r) => ({
      ...r,
      stage2: { ...r.stage2, apis: (r.stage2.apis || []).filter((_, i) => i !== idx) },
    }));
  }
  function addApi() {
    setResult((r) => ({
      ...r,
      stage2: {
        ...r.stage2,
        apis: [
          ...(r.stage2.apis || []),
          {
            name: "New API",
            description: "",
            operations: ["list", "create", "update", "delete"],
            backs_surfaces: r.stage2.surfaces?.[0]?.name ? [r.stage2.surfaces[0].name] : [],
          },
        ],
      },
    }));
  }
  function updateStage2List(field, value) {
    setResult((r) => ({ ...r, stage2: { ...r.stage2, [field]: value } }));
  }

  function downloadEditedSpec() {
    const blob = new Blob([JSON.stringify({ ...result, stage3: tasks }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.product_name || "spec"}.specforge.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Stage 3: breakdown + classify ---
  async function rebuildStage2() {
    setStage2RebuildStatus("loading");
    setError("");
    setTasks([]);
    setStage3Status("idle");
    try {
      const data = await api("/api/specforge/stage2", { stage1: result.stage1 });
      setResult((r) => ({ ...r, stage2: data.stage2 }));
      setStage2RebuildStatus("idle");
    } catch (err) {
      setError(err.message);
      setStage2RebuildStatus("error");
    }
  }

  async function runBreakdown() {
    const surfaces = result?.stage2?.surfaces || [];
    const apis = result?.stage2?.apis || [];
    if (surfaces.length === 0 || apis.length === 0) {
      setError(
        "Stage 2 has no feature screens and/or APIs yet. Edit release features (Stage 1), then click “Rebuild screens & APIs”, before breaking down into tasks.",
      );
      return;
    }
    setStage3Status("breaking-down");
    setError("");
    try {
      const data = await api("/api/specforge/breakdown", { stage1: result.stage1, stage2: result.stage2 });
      setStage3Status("classifying");
      const classified = await api("/api/specforge/classify", { tasks: data.tasks });
      setTasks(classified.tasks);
      setStage3Status("done");
      loadCohorts();
    } catch (err) {
      setError(err.message);
      setStage3Status("error");
    }
  }

  async function loadCohorts() {
    try {
      const res = await fetch("/api/onedev/issues?offset=0&count=200");
      if (!res.ok) return;
      const all = await res.json();
      const cohorts = all
        .filter((i) => i.projectId === TEAM_OPS_PROJECT_ID && i.title.startsWith("Cohort:"))
        .map((i) => {
          const projectMatch = /DeliveryProject:\s*(.+?)\s*\(#\d+\)/.exec(i.description || "");
          const productMatch = /^Product:\s*(.+)$/m.exec(i.description || "");
          return {
            issueId: i.id,
            name: i.title.replace("Cohort:", "").trim(),
            projectName: projectMatch?.[1] ?? "?",
            productName: productMatch?.[1]?.trim() ?? "",
          };
        });
      setExistingCohorts(cohorts);
    } catch {
      // Non-fatal — "create a new cohort" still works without the existing-cohort list.
    }
  }

  function updateTask(i, field, value) {
    setTasks((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }
  function updateTaskCriteria(i, criteria) {
    setTasks((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], acceptance_criteria: criteria };
      return next;
    });
  }
  function removeTask(i) {
    setTasks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handlePublish() {
    setPublishStatus("loading");
    setError("");
    try {
      const body = {
        productName: form.product_name,
        // tech_level is not a PD concern — SpecForge / publish infer a matching floor.
        // FE → js; BE → http-api or crud (language-agnostic). PD never picks these.
        tasks: tasks.map(({ epic, story, title, description, trade, acceptance_criteria, no_tutorial_needed, tech_level, coding_focus }) => {
          const coding = /^coding$/i.test(trade || "");
          const focus = coding_focus || null;
          return {
            epic,
            story,
            title,
            description,
            trade,
            acceptance_criteria,
            no_tutorial_needed: !!no_tutorial_needed,
            coding_focus: focus,
            tech_level: no_tutorial_needed
              ? null
              : tech_level ||
                (coding ? inferCodingTechLevel({ title, description, focus: focus || "" }) : null),
          };
        }),
      };

      // Extend path: always append onto the matched cohort/project — never wipe existing tasks.
      if (extendTarget?.cohortIssueId) {
        body.cohortIssueId = Number(extendTarget.cohortIssueId);
      } else if (extendTarget?.projectId) {
        body.cohortName = extendTarget.productName || form.product_name;
        body.deliveryProjectId = extendTarget.projectId;
        body.deliveryProjectName = extendTarget.projectName || form.product_name;
      } else if (selectedCohortId) {
        body.cohortIssueId = Number(selectedCohortId);
      } else {
        body.cohortName = form.product_name;
        body.deliveryProjectName = form.product_name;
      }

      const data = await api("/api/specforge/publish", body);
      setPublishResult(data);
      setPublishStatus("done");
    } catch (err) {
      setError(err.message);
      setPublishStatus("error");
    }
  }

  const canPublish =
    tasks.length > 0 &&
    (extendTarget?.cohortIssueId ||
      extendTarget?.projectId ||
      selectedCohortId ||
      form.product_name.trim()) &&
    publishStatus !== "loading" &&
    publishStatus !== "done";

  const groupedTasks = tasks.reduce((acc, task, i) => {
    const key = `${task.epic} :: ${task.story}`;
    (acc[key] ??= { epic: task.epic, story: task.story, items: [] }).items.push({ ...task, i });
    return acc;
  }, {});

  return (
    <div className="pdstudio">
      <header className="pdstudio-header">
        <div className="pdstudio-kicker">PD Studio · SpecForge</div>
        <h1>Idea in. Assignable, tutor-wired work out.</h1>
        <p className="pdstudio-sub">
          Generate → trim release scope → screens/APIs → tasks → Publish. Publishing writes to Workbench: each
          coding task is either wired to an existing assistance module or blocked until ID publishes a new one
          (draft → ID review → Module Library).
        </p>
      </header>

      <ProductProposer onUseProposal={useProposal} />

      <form ref={formRef} className="pdstudio-form" onSubmit={handleSubmit}>
        <label>
          Product name
          <input
            required
            value={form.product_name}
            onChange={update("product_name")}
            placeholder="Restaurant Inventory Manager"
          />
        </label>
        <label>
          Description
          <AutoGrowTextarea
            required
            minRows={3}
            value={form.description}
            onChange={update("description")}
            placeholder="Monitor groceries purchased against menu items sold, identify unexplained ingredient losses, and show food-waste trends."
          />
        </label>
        <label>
          Target users <span className="pdstudio-hint">comma-separated</span>
          <input
            value={form.target_users}
            onChange={update("target_users")}
            placeholder="Restaurant owner, Kitchen manager, Inventory manager"
          />
        </label>
        <label>
          Business goal
          <input
            required
            value={form.business_goal}
            onChange={update("business_goal")}
            placeholder="Reduce food waste and catch unusual ingredient consumption"
          />
        </label>
        <label>
          Constraints <span className="pdstudio-hint">comma-separated, optional</span>
          <input
            value={form.constraints}
            onChange={update("constraints")}
            placeholder="Must integrate with common POS platforms"
          />
        </label>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Generating spec…" : "Generate spec"}
        </button>
      </form>

      {status === "error" && <div className="pdstudio-error">{error}</div>}

      {status === "similar" && similarMatch?.match && (
        <div className="pdstudio-similar">
          <h2>A similar product is already on the board</h2>
          <p className="pdstudio-similar-lead">
            <strong>{similarMatch.match.productName}</strong> looks like a{" "}
            {Math.round(similarMatch.match.score * 100)}% match with what you just described
            {similarMatch.match.openTasks + similarMatch.match.closedTasks > 0
              ? ` (${similarMatch.match.openTasks} open · ${similarMatch.match.closedTasks} closed tasks)`
              : ""}
            . Starting another product with the same shape usually creates duplicate work.
          </p>

          <h3>Features already on that product</h3>
          <p className="pdstudio-stage3-intro">
            Rebuilt from the live board (epics / stories) — same kind of list you edit after Generate.
          </p>
          <ul className="pdstudio-similar-features">
            {similarMatch.match.features.map((f) => (
              <li key={f.name}>
                <strong>{f.name}</strong>
                {f.stories?.length > 0 && (
                  <ul>
                    {f.stories.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <p className="pdstudio-similar-ask">
            Are you looking to add more features to this product? Existing tasks stay as they are — publish will
            only append new work.
          </p>
          <div className="pdstudio-similar-actions">
            <button type="button" className="pdstudio-similar-primary" onClick={chooseExtendProduct}>
              Yes — extend this product
            </button>
            <button type="button" className="pdstudio-similar-secondary" onClick={chooseForceNewProduct}>
              No — continue as a separate product
            </button>
          </div>
        </div>
      )}

      {result && status === "done" && (
        <div className="pdstudio-results">
          {extendTarget && (
            <div className="pdstudio-extend-banner">
              Extending <strong>{extendTarget.productName}</strong> — publish appends tasks only; nothing already
              on the board is deleted or reopened.
              {extendTarget.existingFeatures?.length > 0 && (
                <details className="pdstudio-extend-details">
                  <summary>Features already on the board ({extendTarget.existingFeatures.length})</summary>
                  <ul>
                    {extendTarget.existingFeatures.map((f) => (
                      <li key={f.name}>
                        <strong>{f.name}</strong>
                        {f.stories?.length ? ` — ${f.stories.slice(0, 2).join("; ")}` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          <div className="pdstudio-results-bar">
            <span className="pdstudio-editing-note">Editing — nothing is saved until you publish or download it</span>
            <button type="button" className="pdstudio-download" onClick={downloadEditedSpec}>
              Download edited spec (.json)
            </button>
          </div>

          <section className="pdstudio-panel">
            <h2>Stage 1 — Normalized definition</h2>
            <label className="pdstudio-field">
              <span className="pdstudio-label">Problem statement</span>
              <AutoGrowTextarea
                minRows={2}
                value={result.stage1.problem_statement}
                onChange={(e) => updateStage1("problem_statement", e.target.value)}
              />
            </label>

            <label className="pdstudio-field">
              <span className="pdstudio-label">Target users</span>
              <EditableList
                items={result.stage1.target_users}
                onChange={(v) => updateStage1("target_users", v)}
                placeholder="e.g. Kitchen manager"
              />
            </label>

            <label className="pdstudio-field">
              <span className="pdstudio-label">Business outcomes</span>
              <EditableList
                items={result.stage1.business_outcomes}
                onChange={(v) => updateStage1("business_outcomes", v)}
                placeholder="e.g. Reduce food waste"
              />
            </label>

            <label className="pdstudio-field">
              <span className="pdstudio-label">Assumptions</span>
              <EditableList
                items={result.stage1.assumptions}
                onChange={(v) => updateStage1("assumptions", v)}
                placeholder="e.g. Recipes contain standard ingredient quantities"
              />
            </label>

            <div className="pdstudio-questions">
              <h3>Open questions before this can go further</h3>
              <EditableList
                items={result.stage1.questions || []}
                onChange={(v) => updateStage1("questions", v)}
                placeholder="e.g. Is inventory measured by weight, units, or both?"
              />
            </div>

            <div className="pdstudio-scope-box">
              <h3>{extendTarget ? "New features for this patch" : "This release — feature list"}</h3>
              <p className="pdstudio-stage3-intro">
                {extendTarget
                  ? "Only these additions enter Stage 2 → tasks. Features already on the board are listed above — don’t re-add them unless you’re intentionally expanding that epic."
                  : "Only these named features enter Stage 2. Delete anything you don’t want in the first release (e.g. keep Ingredient Manager, drop POS)."}
              </p>
              <EditableList
                items={result.stage1.release_features || []}
                onChange={(v) => updateStage1("release_features", v)}
                placeholder='e.g. Ingredient Manager'
              />
              <h3>Out of scope (deferred)</h3>
              <p className="pdstudio-stage3-intro">Explicitly not in this SpecForge run — e.g. POS integration.</p>
              <EditableList
                items={result.stage1.out_of_scope || []}
                onChange={(v) => updateStage1("out_of_scope", v)}
                placeholder="e.g. POS integration"
              />
              <button
                type="button"
                className="pdstudio-rebuild"
                onClick={rebuildStage2}
                disabled={stage2RebuildStatus === "loading"}
              >
                {stage2RebuildStatus === "loading"
                  ? "Rebuilding screens & APIs…"
                  : "Rebuild screens & APIs from this scope"}
              </button>
            </div>
          </section>

          <section className="pdstudio-panel">
            <h2>Stage 2 — Feature screens &amp; APIs</h2>
            <p className="pdstudio-stage3-intro">
              Each <strong>feature screen</strong> below is one product feature (e.g. Ingredient Manager). Stage 3
              creates <strong>one FE task per feature screen</strong> and <strong>one BE task per API</strong>.
              If this list is empty, edit Stage 1’s release features and click “Rebuild screens &amp; APIs”.
            </p>

            {!(result.stage2.surfaces || []).length && (
              <div className="pdstudio-scope-warning">
                No feature screens yet — Stage 3 must not run. Fix Stage 1 release features, then rebuild Stage 2.
              </div>
            )}

            <h3 className="pdstudio-subhead">Feature screens</h3>
            {(result.stage2.surfaces || []).map((surface, idx) => (
              <div className="pdstudio-entity" key={`surface-${idx}`}>
                <div className="pdstudio-entity-head">
                  <input
                    className="pdstudio-entity-name"
                    value={surface.name}
                    onChange={(e) => updateSurface(idx, "name", e.target.value)}
                  />
                  <select
                    value={surface.kind || "screen"}
                    onChange={(e) => updateSurface(idx, "kind", e.target.value)}
                    aria-label="Surface kind"
                  >
                    <option value="screen">screen</option>
                    <option value="flow">flow</option>
                    <option value="dashboard">dashboard</option>
                  </select>
                  <button
                    type="button"
                    className="pdstudio-entity-remove"
                    onClick={() => removeSurface(idx)}
                    aria-label={`Remove surface ${surface.name}`}
                  >
                    × Remove surface
                  </button>
                </div>
                <AutoGrowTextarea
                  className="pdstudio-entity-desc"
                  minRows={2}
                  value={surface.description || ""}
                  onChange={(e) => updateSurface(idx, "description", e.target.value)}
                  placeholder="What this surface is for"
                />
                <div className="pdstudio-field">
                  <span className="pdstudio-label">Pages / forms inside this surface</span>
                  <EditableList
                    items={surface.pages || []}
                    onChange={(v) => updateSurface(idx, "pages", v)}
                    placeholder="e.g. status list"
                  />
                </div>
                <div className="pdstudio-field">
                  <span className="pdstudio-label">User jobs</span>
                  <EditableList
                    items={surface.user_jobs || []}
                    onChange={(v) => updateSurface(idx, "user_jobs", v)}
                    placeholder="e.g. add a new ingredient"
                  />
                </div>
                <label className="pdstudio-field">
                  <span className="pdstudio-label">Data notes (prose — not a schema dump)</span>
                  <AutoGrowTextarea
                    className="pdstudio-entity-desc"
                    minRows={2}
                    value={surface.data_notes || ""}
                    onChange={(e) => updateSurface(idx, "data_notes", e.target.value)}
                    placeholder="e.g. name, category, default unit, par level"
                  />
                </label>
              </div>
            ))}
            <button type="button" className="pdstudio-add" onClick={addSurface}>
              + Add surface
            </button>

            <h3 className="pdstudio-subhead">APIs</h3>
            {(result.stage2.apis || []).map((apiCap, idx) => (
              <div className="pdstudio-entity" key={`api-${idx}`}>
                <div className="pdstudio-entity-head">
                  <input
                    className="pdstudio-entity-name"
                    value={apiCap.name}
                    onChange={(e) => updateApi(idx, "name", e.target.value)}
                  />
                  <button
                    type="button"
                    className="pdstudio-entity-remove"
                    onClick={() => removeApi(idx)}
                    aria-label={`Remove API ${apiCap.name}`}
                  >
                    × Remove API
                  </button>
                </div>
                <AutoGrowTextarea
                  className="pdstudio-entity-desc"
                  minRows={2}
                  value={apiCap.description || ""}
                  onChange={(e) => updateApi(idx, "description", e.target.value)}
                  placeholder="What this API does for the surfaces above"
                />
                <div className="pdstudio-field">
                  <span className="pdstudio-label">Operations</span>
                  <EditableList
                    items={apiCap.operations || []}
                    onChange={(v) => updateApi(idx, "operations", v)}
                    placeholder="e.g. list with filters"
                  />
                </div>
                <div className="pdstudio-field">
                  <span className="pdstudio-label">Backs surfaces</span>
                  <EditableList
                    items={apiCap.backs_surfaces || []}
                    onChange={(v) => updateApi(idx, "backs_surfaces", v)}
                    placeholder="Exact surface name, e.g. Ingredient Manager"
                  />
                </div>
              </div>
            ))}
            <button type="button" className="pdstudio-add" onClick={addApi}>
              + Add API
            </button>

            <div className="pdstudio-field">
              <span className="pdstudio-label">Scope notes (constraints only — not new features)</span>
              <EditableList
                items={result.stage2.scope_notes || []}
                onChange={(v) => updateStage2List("scope_notes", v)}
                placeholder="e.g. quantities cannot be negative"
              />
            </div>
          </section>

          <section className="pdstudio-panel">
            <h2>Stage 3 — Task breakdown</h2>
            {tasks.length === 0 && (
              <>
                <p className="pdstudio-stage3-intro">
                  Turns each surface into one FE Coding task and each API into one BE Coding task, then checks
                  the Module Library — typically ~2 tasks for something like Ingredient Manager + Ingredients
                  API, not a 14-task CRUD explosion.
                </p>
                <button type="button" onClick={runBreakdown} disabled={stage3Status === "breaking-down" || stage3Status === "classifying"}>
                  {stage3Status === "breaking-down"
                    ? "Breaking down into tasks…"
                    : stage3Status === "classifying"
                      ? "Checking Module Library…"
                      : "Break down into tasks"}
                </button>
              </>
            )}

            {tasks.length > 0 && (
              <>
                {(() => {
                  const surfaceCount = result.stage2.surfaces?.length || 0;
                  const apiCount = result.stage2.apis?.length || 0;
                  const expected = surfaceCount + apiCount;
                  const expectedMax = expected + 1;
                  if (surfaceCount === 0 && apiCount === 0) {
                    return (
                      <div className="pdstudio-scope-warning">
                        ⚠ Stage 2 lists 0 feature screens and 0 APIs — these {tasks.length} tasks are not trustworthy.
                        Clear them, rebuild Stage 2 from the release feature list, then break down again.
                      </div>
                    );
                  }
                  if (tasks.length <= expectedMax) return null;
                  return (
                    <div className="pdstudio-scope-warning">
                      ⚠ {tasks.length} tasks for {surfaceCount} feature screen{surfaceCount === 1 ? "" : "s"} +{" "}
                      {apiCount} API{apiCount === 1 ? "" : "s"} — expected about {expected}. Trim before publishing.
                    </div>
                  );
                })()}
                <div className="pdstudio-task-summary">
                  {tasks.filter((t) => t.matchStatus === "matched").length} of {tasks.length} tasks already have an
                  assistance module wired, {tasks.filter((t) => t.no_tutorial_needed).length} need none. The rest get
                  an assistance lesson drafted on publish, then sit in the ID review queue before a JS
                  can be assigned.
                </div>

                {Object.entries(groupedTasks).map(([key, group]) => (
                  <div className="pdstudio-epic-group" key={key}>
                    <div className="pdstudio-epic-label">
                      {group.epic} <span className="pdstudio-story-label">→ {group.story}</span>
                    </div>
                    {group.items.map((task) => (
                      <div className="pdstudio-task-card" key={task.i}>
                        <div className="pdstudio-task-top">
                          <input
                            className="pdstudio-task-title"
                            value={task.title}
                            onChange={(e) => updateTask(task.i, "title", e.target.value)}
                          />
                          <input
                            className="pdstudio-task-trade"
                            value={task.trade}
                            onChange={(e) => updateTask(task.i, "trade", e.target.value)}
                            placeholder="Trade"
                          />
                          <button
                            type="button"
                            className="pdstudio-remove"
                            onClick={() => removeTask(task.i)}
                            aria-label="Remove task"
                          >
                            ×
                          </button>
                        </div>
                        <AutoGrowTextarea
                          className="pdstudio-task-desc"
                          minRows={2}
                          value={task.description}
                          onChange={(e) => updateTask(task.i, "description", e.target.value)}
                        />
                        <div className="pdstudio-field">
                          <span className="pdstudio-label">Acceptance criteria</span>
                          <EditableList
                            items={task.acceptance_criteria || []}
                            onChange={(v) => updateTaskCriteria(task.i, v)}
                            placeholder="e.g. Quantity field rejects zero and negative values"
                          />
                        </div>
                        <div className="pdstudio-task-bottom">
                          <label className="pdstudio-exempt-toggle">
                            <input
                              type="checkbox"
                              checked={!!task.no_tutorial_needed}
                              onChange={(e) => updateTask(task.i, "no_tutorial_needed", e.target.checked)}
                            />
                            No assistance lesson needed for this trade
                          </label>
                        </div>
                        <MatchChip task={task} />
                      </div>
                    ))}
                  </div>
                ))}

                <div className="pdstudio-publish-panel">
                  <h3>Cohort &amp; delivery project</h3>
                  {extendTarget ? (
                    <p className="pdstudio-hint">
                      Patch publish onto <strong>{extendTarget.productName}</strong>
                      {extendTarget.cohortName ? (
                        <>
                          {" "}
                          (cohort <strong>{extendTarget.cohortName}</strong>)
                        </>
                      ) : null}
                      . Existing open/closed tasks are left alone; only these new tasks are created.
                    </p>
                  ) : (
                    <>
                      {/* Reuse is only offered for cohorts already published for *this* product name. */}
                      {(() => {
                        const sameProductCohorts = existingCohorts.filter(
                          (c) => c.productName.trim().toLowerCase() === form.product_name.trim().toLowerCase()
                        );
                        return (
                          sameProductCohorts.length > 0 && (
                            <label>
                              Cohort{" "}
                              <span className="pdstudio-hint">
                                adding to one keeps the same delivery project — only cohorts already published for
                                &quot;{form.product_name}&quot; are listed
                              </span>
                              <select value={selectedCohortId} onChange={(e) => setSelectedCohortId(e.target.value)}>
                                <option value="">+ Create a new cohort</option>
                                {sameProductCohorts.map((c) => (
                                  <option key={c.issueId} value={c.issueId}>
                                    {c.name} — {c.projectName}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )
                        );
                      })()}
                      {!selectedCohortId && (
                        <p className="pdstudio-hint">
                          Publishing creates a new cohort <strong>and</strong> a new delivery project, both named{" "}
                          <strong>{form.product_name || "(set a product name above)"}</strong>.
                        </p>
                      )}
                    </>
                  )}
                  <button type="button" onClick={handlePublish} disabled={!canPublish}>
                    {publishStatus === "loading"
                      ? "Publishing…"
                      : publishStatus === "done"
                        ? "Published ✓"
                        : extendTarget
                          ? "Publish patch to Workbench"
                          : "Publish to Workbench"}
                  </button>
                </div>

                {publishResult && (
                  <div className="pdstudio-publish-result">
                    <p>
                      <strong>{publishResult.totalTasks}</strong> tasks created in{" "}
                      <strong>{publishResult.deliveryProjectName}</strong> under cohort{" "}
                      <strong>{publishResult.cohortName}</strong>
                      {publishResult.reusedCohort ? " (added to the existing cohort)" : ""}
                      {publishResult.reusedDeliveryProject
                        ? " — reused the existing project of that name (no duplicate-create failure)."
                        : ""}
                      .
                    </p>
                    <p>
                      {publishResult.matchedCount} wired to existing assistance modules ·{" "}
                      {publishResult.exemptCount} exempt (no lesson needed) · {publishResult.blockedCount}{" "}
                      blocked until an assistance lesson is reviewed in ID Studio.
                    </p>
                    {publishResult.draftedGroups.length > 0 && (
                      <ul className="plain">
                        {publishResult.draftedGroups.map((g) => (
                          <li key={g.tag}>
                            <code>{g.tag}</code> — covers {g.taskCount} task{g.taskCount === 1 ? "" : "s"}
                            {g.generationFailed
                              ? " — draft generation failed; ID Studio needs a manual retry"
                              : " — draft ready for ID review"}
                            {g.missingFundas?.length
                              ? ` · missing funda prereqs flagged: ${g.missingFundas.join(", ")}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    <a href="#/workbench" className="pdstudio-download" style={{ display: "inline-block", marginTop: 8 }}>
                      Go to Workbench →
                    </a>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth, hasRole } from "../auth/useAuth.js";
import { RESERVED_PROJECT_IDS } from "../cohort-matching/matching.js";
import { AssistMeEmbedded } from "../assist-me/AssistMeWorkspace.jsx";
import DesignMockPreview from "../id-module/DesignMockPreview.jsx";
import { DESIGN_MOCKS } from "../id-module/designMocks.generated.js";
import "./Workbench.css";

const MODULE_LIBRARY_PROJECT_ID = 4;
const PRODUCT_BACKLOG_PROJECT_ID = 1;
const OPS_ROLES = ["PD", "PMGT", "ID", "CD"];

/** Delivery product boards only — hide IPF bookkeeping projects from the switcher. */
function isDeliveryProject(project) {
  const id = project?.id;
  if (!id) return false;
  if (RESERVED_PROJECT_IDS.has(id)) return false;
  if (id === PRODUCT_BACKLOG_PROJECT_ID) return false;
  return true;
}

async function api(path, opts) {
  const res = await fetch(`/api/onedev${path}`, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`Couldn't load project data (${res.status})`);
  return res.json();
}

const EMPTY_ISSUE = { title: "", description: "" };

// Task titles read as their own imperative sentence ("Build the..."), so folding one into "The
// task title asks you to ___" needs its leading verb lowercased to read as one continuous
// sentence rather than a mid-sentence capital.
function lowerFirst(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function parseAssistInfo(description) {
  const wired = /^AssistModule:\s*(.+)$/m.exec(description || "");
  if (wired) return { status: "wired", tag: wired[1].trim() };
  const draft = /^DraftModule:\s*(.+)$/m.exec(description || "");
  if (/^NeedsTutorial:\s*true/m.test(description || "")) {
    return { status: "blocked", tag: draft?.[1]?.trim() || null };
  }
  if (/^NoTutorialNeeded:\s*true/m.test(description || "")) return { status: "exempt" };
  return { status: "none" };
}

function parseTaskFields(description) {
  const desc = description || "";
  const field = (key) => new RegExp(`^${key}:\\s*(.+)$`, "m").exec(desc)?.[1]?.trim() || "";
  return {
    epic: field("Epic"),
    story: field("Story"),
    trade: field("Trade"),
    techLevel: field("TechLevel"),
    acceptance: field("AcceptanceCriteria")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function taskSearchText(task) {
  const desc = task.description || "";
  const acRaw = /^AcceptanceCriteria:\s*(.+)$/m.exec(desc)?.[1] || "";
  const trade = /^Trade:\s*(.+)$/m.exec(desc)?.[1] || "";
  const tech = /^TechLevel:\s*(.+)$/m.exec(desc)?.[1] || "";
  return `${task.title} ${acRaw.replace(/;/g, " ")} ${trade} ${tech}`.trim();
}

function humanDescription(description) {
  if (!description) return "";
  // Strip Key: value marker lines — show remaining prose if any.
  const prose = description
    .split("\n")
    .filter((l) => !/^[A-Za-z][A-Za-z0-9]*:\s*/.test(l.trim()))
    .join("\n")
    .trim();
  return prose;
}

function humanLessonLabel(tag) {
  return String(tag || "")
    .split("-")
    .filter(Boolean)
    .map((w) => {
      const upper = w.toUpperCase();
      if (["API", "UI", "CRUD", "HTTP", "SQL", "JS", "TS"].includes(upper)) return upper;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/**
 * Assist Me lives inside an opened task — never navigates away to #/assist-me.
 * Core lessons embed in an iframe; published assist modules use AssistMeEmbedded.
 */
function TaskAssistPanel({ task, publishedModules, onCloseLesson, autoStart = false }) {
  const info = parseAssistInfo(task.description);
  const [phase, setPhase] = useState("idle");
  const [coreResult, setCoreResult] = useState(null);
  const [error, setError] = useState("");
  const [pickedTag, setPickedTag] = useState("");
  const [embed, setEmbed] = useState(null); // { kind: 'core', url } | { kind: 'module', tag, mode }
  const moduleTag = pickedTag || publishedModules[0]?.tag || "";
  const didAutoStart = useRef(false);

  async function launchCoreLesson(lesson) {
    setPhase("launching");
    setError("");
    try {
      const res = await fetch("/api/id/assistance-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, taskTitle: task.title, lessonKey: lesson.lessonKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Session creation failed (${res.status})`);
      setEmbed({ kind: "core", url: data.url, title: lesson.title });
      setPhase("embedded");
    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  }

  function launchModule(mode, tag) {
    setEmbed({ kind: "module", tag, mode });
    setPhase("embedded");
  }

  async function startAssistMe() {
    setError("");
    setCoreResult(null);
    // Wired AssistModule wins over core auto-match — that tag is the intended Assist Me path.
    if (info.status === "wired" && info.tag) {
      launchModule("here", info.tag);
      return;
    }
    setPhase("matching");
    try {
      const q = encodeURIComponent(taskSearchText(task));
      const looksBe = /\b(api|endpoint|rest|sql|postgres|middleware|jwt|crud|backend|server)\b/i.test(
        taskSearchText(task)
      );
      const side = looksBe ? "&side=backend" : "";
      const res = await fetch(`/api/id/core-lesson-match?query=${q}${side}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Match failed");
      setCoreResult(data);

      if (data.auto) {
        await launchCoreLesson(data.auto);
        return;
      }
      if (data.curated?.length) {
        setPhase("curated");
        return;
      }
      setPhase("module-fallback");
    } catch (err) {
      setError(err.message || "Could not match a lesson");
      setPhase("error");
    }
  }

  useEffect(() => {
    if (!autoStart || didAutoStart.current) return;
    didAutoStart.current = true;
    startAssistMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot open from Story "Assist me"
  }, [autoStart]);

  function closeEmbed() {
    setEmbed(null);
    setPhase("idle");
    onCloseLesson?.();
  }

  if (embed?.kind === "core") {
    return (
      <div className="workbench-assist-embed">
        <div className="workbench-assist-embed-bar">
          <span>Assist Me{embed.title ? ` · ${embed.title}` : ""}</span>
          <button type="button" onClick={closeEmbed}>
            Close lesson
          </button>
        </div>
        <iframe className="workbench-assist-iframe" title="Assist Me lesson" src={embed.url} />
      </div>
    );
  }

  if (embed?.kind === "module") {
    return (
      <div className="workbench-assist-embed">
        <AssistMeEmbedded
          moduleTag={embed.tag}
          mode={embed.mode}
          embedded
          onClose={closeEmbed}
        />
      </div>
    );
  }

  if (info.status === "exempt") {
    return <p className="workbench-assist-exempt">No tutorial needed for this trade</p>;
  }

  if (phase === "idle") {
    return (
      <div className="workbench-assist-start">
        <p className="workbench-assist-blurb">
          Stuck or learning the pattern for this task? Assist Me opens a guided lesson beside the work —
          you stay on this task.
        </p>
        <button type="button" className="workbench-assist-btn" onClick={startAssistMe}>
          Assist me
        </button>
      </div>
    );
  }

  if (phase === "matching" || phase === "launching") {
    return (
      <span className="workbench-assist-status">
        {phase === "matching" ? "Finding the right lesson…" : "Opening Assist Me…"}
      </span>
    );
  }

  if (phase === "error") {
    return (
      <div className="workbench-assist-popover">
        <p className="workbench-assist-error">{error || "Assist Me unavailable."}</p>
        <button type="button" className="workbench-assist-primary" onClick={startAssistMe}>
          Try again
        </button>
        <button type="button" className="workbench-assist-cancel" onClick={() => setPhase("idle")}>
          Cancel
        </button>
      </div>
    );
  }

  if (phase === "curated") {
    return (
      <div className="workbench-assist-popover">
        <p className="workbench-assist-question">Closest lessons for this task — pick one:</p>
        {(coreResult?.curated || []).map((lesson) => (
          <button
            key={lesson.lessonKey}
            type="button"
            className="workbench-assist-primary"
            onClick={() => launchCoreLesson(lesson)}
          >
            {lesson.title}
            {lesson.side ? ` (${lesson.side === "backend" ? "BE" : "FE"})` : ""}
          </button>
        ))}
        {error && <p className="workbench-assist-error">{error}</p>}
        <button type="button" className="workbench-assist-cancel" onClick={() => setPhase("idle")}>
          Cancel
        </button>
      </div>
    );
  }

  if (info.status === "blocked" && !info.tag) {
    return (
      <div className="workbench-assist-popover">
        <p>A guided lesson for this task isn&apos;t ready yet. Check back soon.</p>
        <button type="button" className="workbench-assist-cancel" onClick={() => setPhase("idle")}>
          Close
        </button>
      </div>
    );
  }

  if (info.status === "wired" && (phase === "module-wired" || phase === "module-fallback")) {
    return (
      <div className="workbench-assist-popover">
        <p className="workbench-assist-wired">
          Guided lesson: <strong>{humanLessonLabel(info.tag)}</strong>
        </p>
        <p className="workbench-assist-question">How do you want to work on this?</p>
        <button type="button" onClick={() => launchModule("local", info.tag)}>
          Follow instructions here — code in my local editor
        </button>
        <button type="button" className="workbench-assist-primary" onClick={() => launchModule("here", info.tag)}>
          Develop here
        </button>
        <button type="button" className="workbench-assist-cancel" onClick={() => setPhase("idle")}>
          Cancel
        </button>
      </div>
    );
  }

  if (publishedModules.length === 0) {
    return (
      <div className="workbench-assist-popover">
        <p>No guided lesson is available for this task yet.</p>
        <button type="button" className="workbench-assist-cancel" onClick={() => setPhase("idle")}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="workbench-assist-popover">
      <p className="workbench-assist-question">Pick a guided lesson for this task:</p>
      <label>
        Lesson
        <select value={moduleTag} onChange={(e) => setPickedTag(e.target.value)}>
          {publishedModules.map((m) => (
            <option key={m.tag} value={m.tag}>
              {humanLessonLabel(m.tag)}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => launchModule("local", moduleTag)}>
        Follow instructions here — code in my local editor
      </button>
      <button type="button" className="workbench-assist-primary" onClick={() => launchModule("here", moduleTag)}>
        Develop here
      </button>
      <button type="button" className="workbench-assist-cancel" onClick={() => setPhase("idle")}>
        Cancel
      </button>
    </div>
  );
}

function OpenTaskView({ task, publishedModules, onBack, isJS, projects = [] }) {
  const fields = parseTaskFields(task.description);
  const prose = humanDescription(task.description);
  const assist = parseAssistInfo(task.description);
  const waitingOnLesson = assist.status === "blocked";
  const [tab, setTab] = useState("story"); // story | assistance
  const [assistOpen, setAssistOpen] = useState(false);
  // The same interactive preview Assist Me shows mid-lesson (DesignMockPreview), surfaced right on
  // the task itself so a dev can see the target screen before ever opening Assist Me. Only exists
  // for wired Coding tasks; other trades/unwired tasks just don't get a button.
  //
  // Two sources, tried in order: the static map (designMocks.generated.js, a byproduct of
  // write-smb-assist-engines.mjs — the 40 hand-authored seed modules, no network needed) first,
  // then GET /api/id/design-mock as a fallback for modules Gemini generated at runtime (PD Studio
  // -> SpecForge -> ID Studio), which have no entry in that build-time file.
  const [mockOpen, setMockOpen] = useState(false);
  const [dynamicMock, setDynamicMock] = useState(null);
  const staticMock = assist.tag ? DESIGN_MOCKS[assist.tag] : null;
  const designMock = staticMock || dynamicMock;
  useEffect(() => {
    setDynamicMock(null);
    if (staticMock || !assist.tag) return;
    let cancelled = false;
    fetch(`/api/id/design-mock?tag=${encodeURIComponent(assist.tag)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setDynamicMock(data?.mock || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [assist.tag, staticMock]);
  useEffect(() => {
    if (!mockOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMockOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mockOpen]);
  const project = projects.find((p) => p.id === task.projectId);
  const projectPath = project?.path || project?.name || null;
  const cloneUrl = projectPath ? `http://localhost:6610/${projectPath}.git` : null;
  const pullsUrl = projectPath ? `http://localhost:6610/${projectPath}/~pulls` : "http://localhost:6610";
  const branchHint = `js/${(task.title || "task")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40)}`;

  function openAssistance() {
    setAssistOpen(true);
    setTab("assistance");
  }

  function closeAssistance() {
    setAssistOpen(false);
    setTab("story");
  }

  return (
    <div className="workbench-task-open">
      <button type="button" className="workbench-task-back" onClick={onBack}>
        ← {isJS ? "Your tasks" : "Board"}
      </button>

      <div className="workbench-card-num">
        #{task.number}
        {task.project ? ` · ${task.project}` : ""}
        {task.state ? ` · ${task.state}` : ""}
      </div>
      <h2 className="workbench-task-title">{task.title}</h2>

      {waitingOnLesson && (
        <div className="workbench-lesson-pending">
          {isJS
            ? "A guided lesson for this task is still being prepared. You can keep reading the task — Assist Me will unlock when it’s ready."
            : <>
                No published assistance lesson is wired to this task yet
                {assist.tag || /^DraftModule:\s*(.+)$/m.exec(task.description || "")?.[1]
                  ? ` (draft: ${assist.tag || /^DraftModule:\s*(.+)$/m.exec(task.description || "")?.[1]?.trim()}).`
                  : "."}{" "}
                ID reviews and publishes it; Workbench will wire it here automatically. Recruit only assigns once
                it&apos;s wired.
              </>}
        </div>
      )}

      {assistOpen && (
        <div className="workbench-task-tabs" role="tablist" aria-label="Task views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "story"}
            className={`workbench-task-tab${tab === "story" ? " is-active" : ""}`}
            onClick={() => setTab("story")}
          >
            Story
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "assistance"}
            className={`workbench-task-tab${tab === "assistance" ? " is-active" : ""}`}
            onClick={() => setTab("assistance")}
          >
            Assistance
          </button>
        </div>
      )}

      <section
        className="workbench-task-panel"
        role="tabpanel"
        hidden={assistOpen && tab !== "story"}
      >
        {(fields.epic || fields.story || fields.trade) && (
          <div className="workbench-task-meta">
            {fields.epic && (
              <span>
                Epic <strong>{fields.epic}</strong>
              </span>
            )}
            {fields.story && (
              <span>
                Story <strong>{fields.story}</strong>
              </span>
            )}
            {fields.trade && (
              <span>
                Trade <strong>{fields.trade}</strong>
              </span>
            )}
          </div>
        )}

        {prose && <p className="workbench-task-body">{prose}</p>}

        {fields.acceptance.length > 0 && (
          <div className="workbench-task-ac">
            <h3>Acceptance criteria</h3>
            <ul>
              {fields.acceptance.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        {designMock && (
          <button type="button" className="workbench-try-mock-btn" onClick={() => setMockOpen(true)}>
            ▶ Try the mock
          </button>
        )}

        {!prose && fields.acceptance.length === 0 && task.description && (
          <pre className="workbench-task-raw">{task.description}</pre>
        )}

        {!waitingOnLesson && !assistOpen && (
          <div className="workbench-assist-start workbench-assist-start-inline">
            <p className="workbench-assist-blurb">
              Stuck or learning the pattern for this task? Assist Me opens a guided lesson in a full tab — you
              stay on this task.
            </p>
            <button type="button" className="workbench-assist-btn" onClick={openAssistance}>
              Assist me
            </button>
          </div>
        )}

        {isJS && !assistOpen && (
          <div className="workbench-submit-box">
            <h3>Submit your work (Pull Request)</h3>
            <ol className="workbench-submit-steps">
              <li>
                Clone the project repo
                {cloneUrl ? (
                  <>
                    : <code>{cloneUrl}</code>
                  </>
                ) : (
                  " from OneDev (project git URL)."
                )}
              </li>
              <li>
                Create a branch, e.g. <code>{branchHint}</code>
              </li>
              <li>Implement the acceptance criteria above (Assist Me helps with the pattern).</li>
              <li>
                Push the branch, then open a Pull Request into <code>main</code> at{" "}
                <a href={pullsUrl} target="_blank" rel="noreferrer">
                  {pullsUrl}
                </a>
              </li>
              <li>CD Review picks up the PR for human review (CI later).</li>
            </ol>
          </div>
        )}
      </section>

      {assistOpen && (
        <section
          className="workbench-task-panel workbench-task-panel-assist"
          role="tabpanel"
          hidden={tab !== "assistance"}
        >
          <TaskAssistPanel
            task={task}
            publishedModules={publishedModules}
            autoStart
            onCloseLesson={closeAssistance}
          />
        </section>
      )}

      {mockOpen && designMock && (
        <div
          className="workbench-mock-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMockOpen(false);
          }}
        >
          <div className="workbench-mock-modal" role="dialog" aria-modal="true" aria-label="Design mock preview">
            <div className="workbench-mock-modal-head">
              <span>What you're building</span>
              <button type="button" className="workbench-mock-close" onClick={() => setMockOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="workbench-mock-modal-body">
              <p className="workbench-mock-bridge">
                The task title asks you to <strong>{lowerFirst(task.title)}</strong> — here's how that looks in the app:
              </p>
              <DesignMockPreview mock={designMock} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Workbench() {
  const { session, status: authStatus } = useAuth();
  const isJS = session?.accountType === "js" && !hasRole(session, OPS_ROLES);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newIssue, setNewIssue] = useState(EMPTY_ISSUE);
  const [creating, setCreating] = useState(false);
  const [publishedModules, setPublishedModules] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const completedTaskId = searchParams.get("tutorialCompleted");
  const highlightTaskId = searchParams.get("highlightTaskId");
  const highlightProjectId = searchParams.get("highlightProjectId");
  const openTaskParam = searchParams.get("openTask");

  const [myTasks, setMyTasks] = useState([]);
  const [myTasksLoading, setMyTasksLoading] = useState(true);
  const [myTasksError, setMyTasksError] = useState("");
  const [openedTask, setOpenedTask] = useState(null);
  const [wireNote, setWireNote] = useState("");

  useEffect(() => {
    if (!isJS) return;
    setMyTasksLoading(true);
    setMyTasksError("");
    fetch("/api/recruit/my-tasks")
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || "Couldn't load your tasks");
        setMyTasks(data.tasks);
      })
      .catch((err) => setMyTasksError(err.message))
      .finally(() => setMyTasksLoading(false));
  }, [isJS]);

  useEffect(() => {
    api(`/issues?offset=0&count=200`)
      .then((all) =>
        setPublishedModules(
          all
            .filter((i) => i.projectId === MODULE_LIBRARY_PROJECT_ID && i.title.startsWith("Module:"))
            .map((i) => ({ tag: i.title.replace("Module: ", "") }))
        )
      )
      .catch(() => {});
  }, []);

  const loadIssues = useCallback(async (pid) => {
    if (!pid) return;
    const data = await api(`/issues?query=&offset=0&count=100`);
    setIssues(data.filter((i) => i.projectId === pid));
  }, []);

  // Workbench listens: when ID publishes a Module Library lesson, NeedsTutorial + DraftModule
  // tasks get AssistModule automatically. Poll while this screen is open.
  useEffect(() => {
    let cancelled = false;
    async function syncWiring() {
      try {
        const res = await fetch("/api/id/sync-wiring");
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        if (data.wiredCount > 0) {
          setWireNote(
            isJS
              ? "A guided lesson just became available on one of your tasks — open the task and use Assist Me."
              : `Wired ${data.wiredCount} task${data.wiredCount === 1 ? "" : "s"} to newly published assistance lessons.`
          );
          if (isJS) {
            fetch("/api/recruit/my-tasks")
              .then((r) => r.json())
              .then((d) => {
                if (!cancelled && d.tasks) setMyTasks(d.tasks);
              })
              .catch(() => {});
          } else if (projectId) {
            loadIssues(projectId).catch(() => {});
          }
        }
      } catch {
        /* ignore transient */
      }
    }
    syncWiring();
    const id = setInterval(syncWiring, 12000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isJS, projectId, loadIssues]);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (isJS) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await api("/projects?offset=0&count=100");
        const delivery = data.filter(isDeliveryProject);
        setProjects(delivery);
        if (delivery.length > 0) {
          const targetId = highlightProjectId ? Number(highlightProjectId) : delivery[0].id;
          const initialProject = delivery.some((p) => p.id === targetId) ? targetId : delivery[0].id;
          setProjectId(initialProject);
          await loadIssues(initialProject);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadIssues, authStatus, isJS]);

  // Deep-link / lesson-return → open task detail once lists are ready.
  useEffect(() => {
    const id = openTaskParam || completedTaskId || highlightTaskId;
    if (!id) return;
    const pool = isJS ? myTasks : issues;
    if (!pool?.length) return;
    const found = pool.find((t) => String(t.id) === String(id));
    if (found) setOpenedTask(found);
  }, [openTaskParam, completedTaskId, highlightTaskId, myTasks, issues, isJS]);

  useEffect(() => {
    if (loading || !highlightTaskId || openedTask) return;
    const raf = requestAnimationFrame(() => {
      document.querySelector(`[data-task-id="${highlightTaskId}"]`)?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [loading, highlightTaskId, openedTask]);

  function openTask(task) {
    setOpenedTask(task);
    const next = new URLSearchParams(searchParams);
    next.set("openTask", String(task.id));
    setSearchParams(next, { replace: true });
  }

  function closeTask() {
    setOpenedTask(null);
    const next = new URLSearchParams(searchParams);
    next.delete("openTask");
    setSearchParams(next, { replace: true });
  }

  async function handleProjectChange(e) {
    const pid = Number(e.target.value);
    setProjectId(pid);
    setOpenedTask(null);
    setLoading(true);
    try {
      await loadIssues(pid);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await api("/issues", {
        method: "POST",
        body: JSON.stringify({ projectId, title: newIssue.title, description: newIssue.description }),
      });
      setNewIssue(EMPTY_ISSUE);
      await loadIssues(projectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (isJS) {
    if (openedTask) {
      return (
        <div className="workbench">
          <header className="workbench-header">
            <div className="workbench-kicker">Your work</div>
            <h1>Your tasks</h1>
          </header>
          <OpenTaskView
            task={openedTask}
            publishedModules={publishedModules}
            onBack={closeTask}
            isJS
            projects={projects}
          />
        </div>
      );
    }

    return (
      <div className="workbench">
        <header className="workbench-header">
          <div className="workbench-kicker">Your work</div>
          <h1>Your tasks</h1>
          <p className="workbench-sub">Open a task to start. If you need help, Assist Me is inside each task.</p>
        </header>

        {wireNote && <div className="workbench-tutorial-done">{wireNote}</div>}

        {completedTaskId && (
          <div className="workbench-tutorial-done">
            ✓ Tutorial completed for task #{completedTaskId}. You&apos;re back on the task.
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("tutorialCompleted");
                setSearchParams(next);
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {myTasksError && <div className="workbench-error">{myTasksError}</div>}
        {myTasksLoading && <div className="workbench-loading">Loading your tasks…</div>}

        {!myTasksLoading && myTasks.length === 0 && !myTasksError && (
          <div className="workbench-empty-state">
            No tasks assigned yet. If you just applied, you&apos;re queued — we&apos;ll match you automatically the
            moment something opens up. <a href="#/apply">Check your application status</a>.
          </div>
        )}

        {!myTasksLoading && myTasks.length > 0 && (
          <div className="workbench-cards workbench-my-tasks">
            {myTasks.map((issue) => (
              <button
                type="button"
                className="workbench-card workbench-card-button"
                key={issue.id}
                data-task-id={issue.id}
                onClick={() => openTask(issue)}
              >
                <div className="workbench-card-num">
                  #{issue.number} · {issue.project}
                </div>
                <div className="workbench-card-title">{issue.title}</div>
                <div className="workbench-card-open-hint">Open task →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (openedTask) {
    return (
      <div className="workbench">
        <header className="workbench-header">
          <div className="workbench-kicker">Workbench</div>
          <h1>Where the work actually happens</h1>
        </header>
        <OpenTaskView
          task={openedTask}
          publishedModules={publishedModules}
          onBack={closeTask}
          isJS={false}
          projects={projects}
        />
      </div>
    );
  }

  const states = ["Open", "Closed"];
  const grouped = states.map((s) => ({
    state: s,
    items: issues.filter((i) => i.state === s),
  }));
  const otherStates = [...new Set(issues.map((i) => i.state).filter((s) => !states.includes(s)))];
  for (const s of otherStates) grouped.push({ state: s, items: issues.filter((i) => i.state === s) });

  return (
    <div className="workbench">
      <header className="workbench-header">
        <div className="workbench-kicker">Workbench</div>
        <h1>Where the work actually happens</h1>
        <p className="workbench-sub">
          Open a task to see details and Assist Me. Workbench wires published lessons onto waiting tasks automatically.
        </p>
      </header>

      {wireNote && <div className="workbench-tutorial-done">{wireNote}</div>}

      {projects.length > 0 && (
        <div className="workbench-project-select">
          <label>
            Project
            <select value={projectId ?? ""} onChange={handleProjectChange}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {completedTaskId && (
        <div className="workbench-tutorial-done">
          ✓ Tutorial completed
          {(() => {
            const completedTask = issues.find((i) => i.id === Number(completedTaskId));
            return completedTask ? ` — "${completedTask.title}"` : ` for task #${completedTaskId}`;
          })()}
          . You&apos;re back — pick up the task below.
          <button type="button" onClick={() => setSearchParams({})}>
            Dismiss
          </button>
        </div>
      )}

      {error && <div className="workbench-error">{error}</div>}
      {loading && <div className="workbench-loading">Loading…</div>}

      {!loading && projects.length === 0 && !error && (
        <div className="workbench-empty-state">
          No delivery products yet — publish one from <a href="#/pd-studio">PD Studio</a>.
        </div>
      )}

      {!loading && projectId && (
        <>
          <form className="workbench-new" onSubmit={handleCreate}>
            <input
              required
              placeholder="New task title"
              value={newIssue.title}
              onChange={(e) => setNewIssue((v) => ({ ...v, title: e.target.value }))}
            />
            <input
              placeholder="Description (optional)"
              value={newIssue.description}
              onChange={(e) => setNewIssue((v) => ({ ...v, description: e.target.value }))}
            />
            <button type="submit" disabled={creating}>
              {creating ? "Adding…" : "+ Add task"}
            </button>
          </form>

          <div className="workbench-board">
            {grouped.map((col) => (
              <div className="workbench-column" key={col.state}>
                <h2>
                  {col.state} <span className="workbench-count">{col.items.length}</span>
                </h2>
                <div className="workbench-cards">
                  {col.items.map((issue) => (
                    <button
                      type="button"
                      className={`workbench-card workbench-card-button${
                        String(issue.id) === highlightTaskId ? " workbench-card-highlight" : ""
                      }`}
                      key={issue.id}
                      data-task-id={issue.id}
                      onClick={() => openTask(issue)}
                    >
                      <div className="workbench-card-num">#{issue.number}</div>
                      <div className="workbench-card-title">{issue.title}</div>
                      <div className="workbench-card-open-hint">Open →</div>
                    </button>
                  ))}
                  {col.items.length === 0 && <div className="workbench-empty">Nothing here</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && projects.length === 0 && (
        <div className="workbench-empty-state">No delivery projects yet — publish from PD Studio first.</div>
      )}
    </div>
  );
}

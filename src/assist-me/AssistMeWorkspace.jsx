import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./AssistMeWorkspace.css";

// Eagerly loads every generated assist module. Each module's default export is createINPACTEngine(...)
// — the real IPAAL UI. We only fall back to reading NODES for mode=local (instructions-only).
const ASSIST_MODULES = import.meta.glob("../engines/assist/*.{jsx,tsx}", { eager: true });

function findModuleBySlug(slug) {
  const entry = Object.entries(ASSIST_MODULES).find(([path]) =>
    path.includes(`inpact_assist_${slug}_engine`),
  );
  return entry ? entry[1] : null;
}

function ChatBubble({ label, children, tone = "default" }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`amw-bubble amw-bubble-${tone}`}>
      <button type="button" className="amw-bubble-head" onClick={() => setOpen((o) => !o)}>
        <span>{label}</span>
        <span className="amw-bubble-toggle">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="amw-bubble-body">{children}</div>}
    </div>
  );
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
 * Embedded Assist Me (published assist-module path). Used inside an opened task.
 * `embedded` hides the full-page chrome; `onClose` returns to the task body.
 */
export function AssistMeEmbedded({ moduleTag, mode = "here", embedded = false, onClose }) {
  const slug = moduleTag;
  const mod = useMemo(() => (slug ? findModuleBySlug(slug) : null), [slug]);
  const Engine = typeof mod?.default === "function" ? mod.default : null;
  const nodes = mod?.NODES || [];
  const questionNodes = nodes.filter((n) => n.type === "question");
  const introNode = nodes.find((n) => n.type === "reveal");
  const objectivesNode = nodes.find((n) => n.type === "objectives");

  const [activeId, setActiveId] = useState(questionNodes[0]?.id || introNode?.id || null);
  const activeNode = nodes.find((n) => n.id === activeId) || introNode;
  const [mentorThread, setMentorThread] = useState([]);
  const [mentorDraft, setMentorDraft] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mentorThread]);

  const handleDone = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  async function sendMentorMessage() {
    const msg = mentorDraft.trim();
    if (!msg) return;
    setMentorLoading(true);
    setMentorError("");
    try {
      const res = await fetch("/api/assist-me/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleTag: slug, node: activeNode, question: msg, thread: mentorThread }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mentor unavailable");
      setMentorThread((t) => [...t, { role: "user", content: msg }, { role: "assistant", content: data.reply }]);
      setMentorDraft("");
    } catch (err) {
      setMentorError(err.message);
    } finally {
      setMentorLoading(false);
    }
  }

  if (!slug) {
    return <div className="amw-empty">No module specified.</div>;
  }
  if (!mod) {
    return (
      <div className="amw-empty">
        No guided lesson found for this topic yet. Try again later, or ask your mentor.
      </div>
    );
  }

  if (mode !== "local" && Engine) {
    return (
      <div className={`amw-engine${embedded ? " amw-engine-embedded" : ""}`}>
        {!embedded && (
          <div className="amw-engine-bar">
            <span>
              Assist Me · <b>{humanLessonLabel(slug)}</b>
            </span>
            <button type="button" onClick={handleDone}>
              ← Back to task
            </button>
          </div>
        )}
        {embedded && (
          <div className="amw-engine-bar amw-engine-bar-embedded">
            <span>
              Assist Me · <b>{humanLessonLabel(slug)}</b>
            </span>
            {onClose && (
              <button type="button" onClick={onClose}>
                Close lesson
              </button>
            )}
          </div>
        )}
        <Engine
          onNextLesson={handleDone}
          onAskMentor={async (node, question, thread) => {
            const res = await fetch("/api/assist-me/ask", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ moduleTag: slug, node, question, thread }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Mentor unavailable");
            return data.reply;
          }}
        />
      </div>
    );
  }

  return (
    <div className={`amw-root amw-mode-local${embedded ? " amw-embedded" : ""}`}>
      {embedded && onClose && (
        <div className="amw-engine-bar amw-engine-bar-embedded">
          <span>
            Assist Me · <b>{humanLessonLabel(slug)}</b> · local
          </span>
          <button type="button" onClick={onClose}>
            Close lesson
          </button>
        </div>
      )}
      <div className="amw-col-instructions">
        <div className="amw-chat">
          <div className="amw-chat-scroll">
            {introNode && (
              <ChatBubble label={`📘 ${introNode.content?.title || "Lesson"}`} tone="intro">
                <p>{introNode.content?.body}</p>
                {introNode.content?.usecase && <p className="amw-usecase">{introNode.content.usecase}</p>}
              </ChatBubble>
            )}
            {objectivesNode && (
              <ChatBubble label="🎯 Objectives" tone="intro">
                <ul>
                  {objectivesNode.items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </ChatBubble>
            )}
            {questionNodes.map((n, i) => (
              <ChatBubble key={n.id} label={`Step ${i + 1}`} tone="task">
                <p>{n.paal || n.content?.body}</p>
                {n.hint && <p className="amw-hint">Hint: {n.hint}</p>}
              </ChatBubble>
            ))}
            {mentorThread.map((m, i) => (
              <ChatBubble key={i} label={m.role === "user" ? "You" : "Mentor"} tone={m.role === "user" ? "you" : "mentor"}>
                <p>{m.content}</p>
              </ChatBubble>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="amw-mentor-compose">
            {mentorError && <p className="amw-mentor-error">{mentorError}</p>}
            <textarea
              rows={2}
              value={mentorDraft}
              onChange={(e) => setMentorDraft(e.target.value)}
              placeholder="Ask the mentor…"
            />
            <button type="button" disabled={mentorLoading || !mentorDraft.trim()} onClick={sendMentorMessage}>
              {mentorLoading ? "…" : "Ask"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hash-route wrapper (`#/assist-me?module=…`) — still works; prefer Workbench task embed. */
export default function AssistMeWorkspace() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const slug = params.get("module");
  const mode = params.get("mode") || "here";

  return (
    <AssistMeEmbedded
      moduleTag={slug}
      mode={mode}
      onClose={() => navigate("/workbench")}
    />
  );
}

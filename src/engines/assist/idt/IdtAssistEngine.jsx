/**
 * Inverse Dependency Tracing (IDT) Assist Me runtime.
 *
 * Phase 1 — reveal the full goal→steps→leaves tree (collapsible) before teaching.
 * Phase 2 — teach bottom-up from the first leaf, ONE atomic chunk per beat,
 *           pause for acknowledgment before continuing.
 */
import { useMemo, useState } from "react";
import "./IdtAssistEngine.css";

function flattenLeaves(node, acc = []) {
  if (!node) return acc;
  if (!node.children?.length) {
    acc.push(node);
    return acc;
  }
  for (const child of node.children) flattenLeaves(child, acc);
  return acc;
}

function TreeNode({ node, depth = 0 }) {
  const hasKids = Array.isArray(node.children) && node.children.length > 0;
  const [open, setOpen] = useState(depth === 0);
  const tag = node.tag; // EXISTING | OUR_WORK | undefined
  return (
    <li className={`idt-node depth-${Math.min(depth, 4)}${hasKids ? "" : " is-leaf"}`}>
      <button
        type="button"
        className={`idt-node-row${hasKids ? " has-kids" : ""}${open ? " is-open" : ""}`}
        onClick={() => hasKids && setOpen((o) => !o)}
        aria-expanded={hasKids ? open : undefined}
      >
        <span className="idt-chevron" aria-hidden>
          {hasKids ? (open ? "▾" : "▸") : "○"}
        </span>
        <span className="idt-node-main">
          <span className="idt-node-name">{node.name}</span>
          {node.ref && <span className="idt-node-ref">{node.ref}</span>}
        </span>
        {tag && (
          <span className={`idt-tag idt-tag-${tag === "EXISTING" ? "existing" : "ours"}`}>
            {tag === "EXISTING" ? "[EXISTING]" : "[OUR WORK]"}
          </span>
        )}
      </button>
      {hasKids && open && (
        <ul className="idt-children">
          {node.children.map((c) => (
            <TreeNode key={c.id || c.name} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * @param {object} spec
 * @param {string} spec.tag
 * @param {string} spec.title
 * @param {string} spec.goal
 * @param {string} spec.analogousPattern  reusable pattern id (e.g. resource-list-and-form)
 * @param {string} spec.analogousStory    human analogy (e.g. Library Holds Desk)
 * @param {string} spec.productHook       how this maps to the current product task
 * @param {object} spec.tree              root node { name, ref?, children?, tag? }
 * @param {Array<{id,text,leafId?,kind?}>} spec.chunks  bottom-up atomic teach sequence
 */
export function createIdtAssistEngine(spec) {
  function IdtAssistEngine({ onNextLesson }) {
    const leaves = useMemo(() => flattenLeaves(spec.tree), []);
    const [phase, setPhase] = useState("tree"); // tree | teach | done
    const [chunkIndex, setChunkIndex] = useState(0);
    const [history, setHistory] = useState([]); // acknowledged chunks
    const [clarify, setClarify] = useState("");
    const [clarifyReply, setClarifyReply] = useState("");

    const chunk = spec.chunks[chunkIndex];
    const total = spec.chunks.length;
    const progress = phase === "done" ? total : phase === "teach" ? chunkIndex : 0;

    function startTeach() {
      setPhase("teach");
      setChunkIndex(0);
      setHistory([]);
      setClarify("");
      setClarifyReply("");
    }

    function acknowledge() {
      if (!chunk) return;
      setHistory((h) => [...h, chunk]);
      setClarify("");
      setClarifyReply("");
      if (chunkIndex >= total - 1) {
        setPhase("done");
        return;
      }
      setChunkIndex((i) => i + 1);
    }

    function askClarify(e) {
      e.preventDefault();
      const q = clarify.trim();
      if (!q) return;
      // Atomic answer only — point back at the current chunk; no forward spoilers.
      setClarifyReply(
        `On this one idea only: ${chunk?.text || ""}\n\n` +
          `Your question (“${q}”) — stay with this leaf until it clicks. ` +
          `If something earlier in the tree is fuzzy, expand that node in Phase 1 and come back. ` +
          `When this chunk is clear, press Got it / Next.`,
      );
      setClarify("");
    }

    return (
      <div className="idt-root">
        <header className="idt-header">
          <div className="idt-eyebrow">Inverse Dependency Tracing · Assist Me</div>
          <h1 className="idt-title">{spec.title}</h1>
          <p className="idt-sub">
            <strong>Goal:</strong> {spec.goal}
          </p>
          <p className="idt-analogy">
            <strong>Reusable analogy:</strong> {spec.analogousStory}{" "}
            <span className="idt-pattern">({spec.analogousPattern})</span>
          </p>
          <p className="idt-hook">{spec.productHook}</p>
          <div className="idt-progress" aria-label="Lesson progress">
            <div className="idt-progress-bar" style={{ width: `${(progress / Math.max(total, 1)) * 100}%` }} />
            <span>
              {phase === "tree"
                ? "Phase 1 — see the whole tree"
                : phase === "teach"
                  ? `Phase 2 — chunk ${chunkIndex + 1} of ${total}`
                  : "Ready to submit"}
            </span>
          </div>
        </header>

        {phase === "tree" && (
          <section className="idt-phase">
            <h2>Phase 1 — Reveal the whole tree first</h2>
            <p className="idt-lead">
              Click nodes to expand. Green branches have children. Leaves are the smallest concrete
              actions (file/line). Do not start coding yet — learn the shape first.
            </p>
            <div className="idt-legend">
              <span>
                <i className="idt-dot root" /> goal
              </span>
              <span>
                <i className="idt-dot branch" /> has children
              </span>
              <span>
                <i className="idt-dot leaf" /> leaf
              </span>
              <span className="idt-tag idt-tag-existing">[EXISTING]</span>
              <span className="idt-tag idt-tag-ours">[OUR WORK]</span>
            </div>
            <ul className="idt-tree">
              <TreeNode node={spec.tree} depth={0} />
            </ul>
            <p className="idt-leaf-count">{leaves.length} leaves in dependency order (we&apos;ll climb them next).</p>
            <button type="button" className="idt-primary" onClick={startTeach}>
              Now that we&apos;ve seen the tree, start from the basic leaf →
            </button>
          </section>
        )}

        {phase === "teach" && chunk && (
          <section className="idt-phase idt-teach">
            <h2>Phase 2 — Bottom-up, one atomic chunk</h2>
            <p className="idt-lead">
              Teaching starts at the first leaf nothing else can happen without. One idea per
              message. Acknowledge before the next.
            </p>

            {history.length > 0 && (
              <ol className="idt-history">
                {history.map((h) => (
                  <li key={h.id}>
                    <span className="idt-history-check">✓</span> {h.text}
                  </li>
                ))}
              </ol>
            )}

            <div className="idt-chunk" key={chunk.id}>
              {chunk.tag && (
                <span className={`idt-tag idt-tag-${chunk.tag === "EXISTING" ? "existing" : "ours"}`}>
                  {chunk.tag === "EXISTING" ? "[EXISTING]" : "[OUR WORK]"}
                </span>
              )}
              {chunk.leafRef && <div className="idt-chunk-ref">{chunk.leafRef}</div>}
              <p className="idt-chunk-text">{chunk.text}</p>
            </div>

            <div className="idt-ack">
              <button type="button" className="idt-primary" onClick={acknowledge}>
                {chunkIndex >= total - 1 ? "Got it — finish Assist Me" : "Got it / Next"}
              </button>
            </div>

            <form className="idt-clarify" onSubmit={askClarify}>
              <label>
                Clarifying question on <em>this</em> chunk only (optional)
                <input
                  value={clarify}
                  onChange={(e) => setClarify(e.target.value)}
                  placeholder="Ask about this one idea…"
                />
              </label>
              <button type="submit" className="idt-secondary" disabled={!clarify.trim()}>
                Ask
              </button>
            </form>
            {clarifyReply && <pre className="idt-clarify-reply">{clarifyReply}</pre>}
          </section>
        )}

        {phase === "done" && (
          <section className="idt-phase idt-done">
            <h2>Tree climbed — submit your work</h2>
            <p className="idt-lead">
              You walked every leaf bottom-up for <strong>{spec.analogousStory}</strong>. Apply the
              same shape to this product task, then open a Pull Request (see Submit your work on the
              Story tab).
            </p>
            <ol className="idt-history">
              {spec.chunks.map((h) => (
                <li key={h.id}>
                  <span className="idt-history-check">✓</span> {h.text}
                </li>
              ))}
            </ol>
            <button type="button" className="idt-primary" onClick={() => onNextLesson?.()}>
              Back to task → submit PR
            </button>
            <button type="button" className="idt-secondary" onClick={() => setPhase("tree")}>
              Revisit the tree
            </button>
          </section>
        )}
      </div>
    );
  }

  IdtAssistEngine.displayName = `IdtAssist(${spec.tag})`;
  return IdtAssistEngine;
}

export default createIdtAssistEngine;

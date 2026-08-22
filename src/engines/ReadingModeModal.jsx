import { useEffect, useCallback, useMemo, useState } from "react";
import RichLearnerText from "./RichLearnerText";

/**
 * Ordered "pages" for reading mode: intro → objectives → each question (and other teachable nodes).
 * @param {object[]|undefined} nodes - NODES from createINPACTEngine
 */
export function buildReadingPages(nodes) {
  if (!Array.isArray(nodes)) return [];
  const pages = [];
  for (const n of nodes) {
    if (!n) continue;
    if (n.type === "reveal" && n.content) {
      pages.push({ kind: "reveal", node: n });
    } else if (n.type === "objectives" && Array.isArray(n.items) && n.items.length > 0) {
      pages.push({ kind: "objectives", node: n });
    } else if (n.type === "question") {
      pages.push({ kind: "question", node: n });
    } else if (n.type === "flowchart") {
      pages.push({ kind: "flowchart", node: n });
    } else if (n.content && (n.content.body || n.content.prompt || n.content.title)) {
      pages.push({ kind: "algo", node: n });
    }
  }
  return pages;
}

const book = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 11040,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(30, 27, 22, 0.72)",
    padding: "20px",
    boxSizing: "border-box",
  },
  shell: {
    width: "100%",
    maxWidth: "640px",
    height: "min(88vh, 820px)",
    maxHeight: "88vh",
    background: "linear-gradient(180deg, #fdfbf7 0%, #f7f2e9 100%)",
    borderRadius: "4px",
    boxShadow: "0 25px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "1px solid #d4c4a8",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  header: {
    flexShrink: 0,
    padding: "14px 20px 10px",
    borderBottom: "1px solid #e8dcc8",
    background: "rgba(255,255,255,0.35)",
  },
  headerTitle: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#8b7355",
    marginBottom: "4px",
    fontFamily: "system-ui, sans-serif",
    fontWeight: 600,
  },
  headerLesson: {
    fontSize: "14px",
    color: "#3d3426",
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
  },
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "28px 32px 24px",
    color: "#2c2419",
    lineHeight: 1.75,
    fontSize: "16px",
  },
  footer: {
    flexShrink: 0,
    padding: "14px 20px 16px",
    borderTop: "1px solid #e8dcc8",
    background: "rgba(255,255,255,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  pageLabel: {
    fontSize: "12px",
    color: "#124559",
    fontFamily: "system-ui, sans-serif",
  },
  navBtn: (enabled) => ({
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
    border: "1px solid #00C49A",
    borderRadius: "8px",
    background: enabled ? "#EAFBFF" : "#EAFBFF",
    color: enabled ? "#1e293b" : "#94a3b8",
    cursor: enabled ? "pointer" : "not-allowed",
    boxShadow: enabled ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
  }),
  sectionLabel: {
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#124559",
    marginTop: "22px",
    marginBottom: "8px",
    fontFamily: "system-ui, sans-serif",
    fontWeight: 700,
  },
  h2: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#1a1510",
    margin: "0 0 16px 0",
    lineHeight: 1.35,
  },
  codeBlock: {
    marginTop: "12px",
    padding: "16px 18px",
    background: "#EAFBFF",
    border: "1px solid #00C49A",
    borderRadius: "6px",
    fontSize: "13px",
    lineHeight: 1.65,
    overflowX: "auto",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    color: "#1e293b",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  pullQuote: {
    marginTop: "18px",
    paddingLeft: "16px",
    borderLeft: "3px solid #c9a227",
    fontStyle: "italic",
    color: "#4a4035",
    fontSize: "15px",
  },
  checklist: {
    margin: "10px 0 0",
    paddingLeft: "22px",
    color: "#3d3426",
  },
};

function QuestionReadingPage({ node }) {
  const paal = node.paal || "";
  const hint = node.hint || "";
  const example = node.example_code || "";
  const expected = node.expected || "";
  const criteria = Array.isArray(node.successCriteria) ? node.successCriteria : [];
  const whenRight = node.feedback_correct || "";

  return (
    <>
      <div style={{ fontSize: "12px", color: "#8b7355", marginBottom: "6px", fontFamily: "system-ui, sans-serif" }}>
        {node.phase || "Step"}
      </div>
      {node.title ? <h2 style={book.h2}>{node.title}</h2> : null}

      <div style={book.sectionLabel}>What this step asks</div>
      {paal ? <RichLearnerText text={paal} style={{ fontSize: "16px", lineHeight: 1.75, color: "#2c2419" }} /> : null}

      {example ? (
        <>
          <div style={book.sectionLabel}>Pattern & reference code</div>
          <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#5c5348" }}>
            Analogous shape — adapt names and context to your lesson file. This is the idea, not necessarily a copy-paste answer.
          </p>
          <pre style={book.codeBlock} role="region" aria-label="Example code">
            {example}
          </pre>
        </>
      ) : null}

      <div style={book.sectionLabel}>Why it matters & nuances</div>
      {hint ? <RichLearnerText text={hint} style={{ fontSize: "15px", lineHeight: 1.72, color: "#3d3426" }} /> : null}
      {expected ? (
        <div style={{ marginTop: hint ? "14px" : 0 }}>
          <RichLearnerText text={`**When your solution is correct, you should see:** ${expected}`} style={{ fontSize: "15px", lineHeight: 1.72, color: "#3d3426" }} />
        </div>
      ) : null}

      {criteria.length > 0 ? (
        <>
          <div style={book.sectionLabel}>Checklist</div>
          <ul style={book.checklist}>
            {criteria.map((c, i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                <RichLearnerText as="span" text={c} style={{ display: "inline" }} />
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {whenRight ? (
        <>
          <div style={book.sectionLabel}>When you have it right</div>
          <div style={book.pullQuote}>
            <RichLearnerText text={whenRight} style={{ fontSize: "15px", lineHeight: 1.65, fontStyle: "italic" }} />
          </div>
        </>
      ) : null}
    </>
  );
}

function RevealReadingPage({ node }) {
  const c = node.content || {};
  return (
    <>
      {c.tag ? (
        <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#8b7355", marginBottom: "10px", fontFamily: "system-ui, sans-serif" }}>
          {c.tag}
        </div>
      ) : null}
      {c.title ? <h2 style={book.h2}>{c.title}</h2> : null}
      {c.body ? <RichLearnerText text={c.body} style={{ fontSize: "17px", lineHeight: 1.8, color: "#2c2419" }} /> : null}
      {c.usecase ? (
        <>
          <div style={{ ...book.sectionLabel, marginTop: "28px" }}>Why this matters</div>
          <RichLearnerText text={c.usecase} variant="muted" style={{ fontSize: "15px", lineHeight: 1.75, color: "#5c5348", fontStyle: "italic" }} />
        </>
      ) : null}
    </>
  );
}

function ObjectivesReadingPage({ node }) {
  const items = node.items || [];
  return (
    <>
      <h2 style={book.h2}>Learning objectives</h2>
      <p style={{ margin: "0 0 16px", color: "#5c5348", fontSize: "15px" }}>
        What you should be able to do or explain after working through this lesson (or reading it cover to cover).
      </p>
      <ol style={{ ...book.checklist, listStyleType: "decimal" }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: "12px" }}>
            <RichLearnerText as="span" text={item} style={{ display: "inline" }} />
          </li>
        ))}
      </ol>
    </>
  );
}

function FlowchartReadingPage({ node }) {
  const c = node.content || {};
  return (
    <>
      <h2 style={book.h2}>{c.title || node.title || node.phase || "Flow"}</h2>
      {c.body ? <RichLearnerText text={c.body} style={{ fontSize: "16px", lineHeight: 1.75 }} /> : null}
    </>
  );
}

function AlgoReadingPage({ node }) {
  const c = node.content || {};
  const body = c.body || c.prompt || "";
  return (
    <>
      <div style={{ fontSize: "12px", color: "#8b7355", marginBottom: "6px", fontFamily: "system-ui, sans-serif" }}>{node.phase}</div>
      <h2 style={book.h2}>{c.title || node.title || "Section"}</h2>
      {body ? <RichLearnerText text={body} style={{ fontSize: "16px", lineHeight: 1.75 }} /> : null}
    </>
  );
}

/**
 * Full-screen book-style paginated reader over lesson NODES.
 */
export default function ReadingModeModal({ open, onClose, nodes, lessonTitle = "" }) {
  const pages = useMemo(() => buildReadingPages(nodes), [nodes]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (open) setPageIndex(0);
  }, [open]);

  const total = pages.length;
  const safeIndex = total ? Math.min(Math.max(0, pageIndex), total - 1) : 0;

  useEffect(() => {
    if (total > 0 && pageIndex > total - 1) setPageIndex(total - 1);
  }, [total, pageIndex]);
  const page = pages[safeIndex];

  const goPrev = useCallback(() => {
    setPageIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setPageIndex((i) => (total <= 0 ? 0 : Math.min(total - 1, i + 1)));
  }, [total]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open) return null;

  return (
    <div style={book.overlay} onClick={onClose} role="presentation">
      <div
        className="inpact-reading-modal"
        style={book.shell}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inpact-reading-title"
      >
        <div style={book.header}>
          <div id="inpact-reading-title" style={book.headerTitle}>
            Reading mode
          </div>
          {lessonTitle ? <div style={book.headerLesson}>{lessonTitle}</div> : null}
        </div>
        <div style={book.body} className="inpact-reading-body">
          {!page ? (
            <p style={{ color: "#64748b", fontFamily: "system-ui, sans-serif" }}>No readable pages in this lesson.</p>
          ) : page.kind === "reveal" ? (
            <RevealReadingPage node={page.node} />
          ) : page.kind === "objectives" ? (
            <ObjectivesReadingPage node={page.node} />
          ) : page.kind === "question" ? (
            <QuestionReadingPage node={page.node} />
          ) : page.kind === "flowchart" ? (
            <FlowchartReadingPage node={page.node} />
          ) : (
            <AlgoReadingPage node={page.node} />
          )}
        </div>
        <div style={book.footer}>
          <button type="button" style={book.navBtn(safeIndex > 0)} onClick={goPrev} disabled={safeIndex <= 0}>
            ← Previous page
          </button>
          <span style={book.pageLabel}>
            Page {total ? safeIndex + 1 : 0} of {total}
          </span>
          <button type="button" style={book.navBtn(safeIndex < total - 1)} onClick={goNext} disabled={safeIndex >= total - 1}>
            Next page →
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...book.navBtn(true),
              marginLeft: "auto",
              borderColor: "#0891b2",
              color: "#0e7490",
              background: "rgba(8, 145, 178, 0.08)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

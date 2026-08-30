import { useState, useEffect, useCallback } from "react";
import "./ProductProposer.css";

/**
 * PD Studio's "Propose New Products" panel — Product Forge's AI-driven catalog widener (see
 * docs/SMB_PRODUCT_SELECTION_JOURNAL.md's sourcing strategy: free/open alternatives to a real paid
 * product's paywalled slice, not from-scratch survey research per product).
 *
 * Generate -> Review -> decide, same discipline as SpecForge/ID Studio: POST /propose only ever
 * files new proposals as Status: proposed (never touches Workbench/tasks); turning an "added" one
 * into real tasks is the existing Stage 1 -> ... -> /publish flow below, pre-filled via
 * onUseProposal so PD doesn't retype the name/description SpecForge already has.
 */
async function api(path, opts) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function ProposalCard({ p, onDecide, deciding }) {
  const [note, setNote] = useState("");
  return (
    <div className="pp-card">
      <div className="pp-card-head">
        <h3>{p.name}</h3>
        <span className="pp-status pp-status-proposed">proposed</span>
      </div>
      <p className="pp-tagline">{p.tagline}</p>
      <p className="pp-desc">{p.description}</p>
      <div className="pp-meta">
        <div>
          <span className="pp-meta-label">Inspired by</span>
          <div className="pp-chips">
            {p.inspiredBy.map((n) => (
              <span className="pp-chip" key={n}>
                {n}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="pp-meta-label">Pain point</span>
          <p>{p.painPoint}</p>
        </div>
        <div>
          <span className="pp-meta-label">Cost barrier</span>
          <p>{p.costBarrier}</p>
        </div>
        <div>
          <span className="pp-meta-label">Narrow slice to build</span>
          <p>{p.narrowSlice}</p>
        </div>
      </div>
      <input
        className="pp-note-input"
        placeholder="Optional note (why added/deferred)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="pp-card-actions">
        <button
          type="button"
          className="pp-btn pp-btn-add"
          disabled={deciding}
          onClick={() => onDecide(p, "added", note)}
        >
          Add
        </button>
        <button
          type="button"
          className="pp-btn pp-btn-defer"
          disabled={deciding}
          onClick={() => onDecide(p, "deferred", note)}
        >
          Defer
        </button>
      </div>
    </div>
  );
}

function HistoryRow({ p }) {
  return (
    <div className="pp-history-row">
      <div className="pp-history-main">
        <strong>{p.name}</strong>
        <span className={`pp-status pp-status-${p.status}`}>{p.status}</span>
      </div>
      <p className="pp-history-tagline">{p.tagline}</p>
      {p.decisionNote && <p className="pp-history-note">“{p.decisionNote}”</p>}
      <span className="pp-history-date">
        {p.status === "proposed" ? "proposed" : "decided"} {new Date(p.decidedAt || p.submitDate).toLocaleDateString()}
      </span>
    </div>
  );
}

export default function ProductProposer({ onUseProposal }) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [decidingId, setDecidingId] = useState(null);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await api("/api/product-forge/proposals");
      setHistory(data.proposals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const pending = history.filter((p) => p.status === "proposed");
  const decided = history.filter((p) => p.status !== "proposed");

  async function handlePropose() {
    setProposing(true);
    setError("");
    try {
      await api("/api/product-forge/propose", { method: "POST", body: JSON.stringify({ count: 6 }) });
      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setProposing(false);
    }
  }

  async function handleDecide(proposal, decision, note) {
    setDecidingId(proposal.id);
    setError("");
    try {
      await api(`/api/product-forge/proposals/${proposal.id}/decide`, {
        method: "POST",
        body: JSON.stringify({ decision, note }),
      });
      if (decision === "added" && onUseProposal) {
        onUseProposal(proposal);
      }
      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <section className="pp">
      <div className="pp-header">
        <div>
          <div className="pp-kicker">Product Forge</div>
          <h2>Propose new products</h2>
          <p className="pp-sub">
            Each batch is a free/open alternative to one paywalled slice of a real product —
            demand is already proven by that product's own customer base. Review, then Add sends it
            straight into the form below.
          </p>
        </div>
        <button type="button" className="pp-propose-btn" onClick={handlePropose} disabled={proposing}>
          {proposing ? "Proposing…" : "Propose new products"}
        </button>
      </div>

      {error && <div className="pp-error">{error}</div>}

      {loadingHistory ? (
        <p className="pp-hint">Loading proposal history…</p>
      ) : (
        <>
          {pending.length > 0 ? (
            <div className="pp-grid">
              {pending.map((p) => (
                <ProposalCard key={p.id} p={p} onDecide={handleDecide} deciding={decidingId === p.id} />
              ))}
            </div>
          ) : (
            <p className="pp-hint">
              No proposals awaiting review. Click “Propose new products” to generate a new batch.
            </p>
          )}

          {decided.length > 0 && (
            <div className="pp-history">
              <button type="button" className="pp-history-toggle" onClick={() => setShowHistory((s) => !s)}>
                {showHistory ? "▾" : "▸"} History ({decided.length} decided)
              </button>
              {showHistory && (
                <div className="pp-history-list">
                  {decided.map((p) => (
                    <HistoryRow key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

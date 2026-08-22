import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Above lesson chrome and Help: Tour (~12040); spotlight just under card. */
const OVERLAY_Z = 12130;
const TOOLTIP_Z = 12160;
const TOOLTIP_MAX_W = 380;
/** Keep tooltip clear of fixed “Help: Tour” (top-right). */
const RESERVE_TOP_RIGHT_FOR_HELP_PX = 140;

const HELP_TOUR_SELECTOR = '.inpact-help-tour-button[data-tour-id="help-tour-button"]';
const SKIP_END_MESSAGE =
  "No worries—you can reopen this interface walkthrough any time from Help: Tour when you want a refresher on where each control lives.";

/** Stable reference — inline `{ … }` each render would change `displayStep` identity and loop `useLayoutEffect` → WSOD. */
const SKIP_HELP_NUDGE_STEP = Object.freeze({
  selector: HELP_TOUR_SELECTOR,
  text: SKIP_END_MESSAGE,
  action: { type: "noop" },
});

function isTourTargetVisible(el) {
  if (!(el instanceof Element)) return false;
  if (el.closest?.('[data-inpact-editor-workspace="closed"]')) return false;
  let n = el;
  while (n && n instanceof Element) {
    const st = window.getComputedStyle(n);
    if (st.display === "none" || st.visibility === "hidden" || Number(st.opacity) === 0) return false;
    n = n.parentElement;
  }
  return true;
}

/**
 * Prefer the first matching element that is actually on-screen (avoids duplicate `data-tour-id`
 * in hidden modals or `visibility:hidden` shells).
 */
function queryTourTargetElement(selector) {
  if (typeof selector !== "string" || !selector.trim()) return null;
  let list;
  try {
    list = document.querySelectorAll(selector);
  } catch {
    try {
      const el = document.querySelector(selector);
      if (!(el instanceof Element) || !isTourTargetVisible(el)) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      return el;
    } catch {
      return null;
    }
  }
  if (!list?.length) return null;
  /** Prefer a target inside the open editor workspace when duplicates exist (lesson shell vs modal). */
  const candidates = [];
  for (const el of list) {
    if (!(el instanceof Element)) continue;
    if (!isTourTargetVisible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    candidates.push(el);
  }
  if (candidates.length === 0) return null;
  const inOpenWorkspace = candidates.find((el) => el.closest?.('[data-inpact-editor-workspace="open"]'));
  return inOpenWorkspace || candidates[0];
}

/**
 * Guided tour overlay: dims the screen, spotlights `[data-tour-id="…"]` targets, and shows step copy.
 * Props:
 * - steps: { selector: string, text: string, action?: { type: string } }[]
 * - onRequestAction: (action) => void — e.g. switch lesson/editor tab before measuring
 * - forceStartNonce: increment to (re)start the tour (uses initialStepIndex for the first step)
 * - lessonKey: when it changes to a different lesson, closes the tour (initial mount does not auto-close)
 * - blockTour: when true, closes the tour (e.g. example / feedback / mentor dialogs stacked above it)
 * - initialStepIndex: starting step when forceStartNonce fires (0 … steps.length-1)
 * - onOpenChange: notifies parent when the tour opens or closes
 * - onLastStepDone: called when the learner taps Done on the final real step (Skip uses a Help nudge instead)
 * - externalCloseNonce: increment to close the tour from the parent (e.g. intro “Skip tour” dismisses without recap)
 */
export default function InterfaceTour({
  steps = [],
  onRequestAction,
  forceStartNonce = 0,
  lessonKey = "",
  blockTour = false,
  initialStepIndex = 0,
  onOpenChange,
  onLastStepDone,
  externalCloseNonce = 0,
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState(null);
  const [missing, setMissing] = useState(false);
  const prevLessonKeyRef = useRef(null);
  const prevExternalCloseRef = useRef(0);
  /** After Skip (any step): one-shot spotlight on Help with reassurance copy. */
  const [skipHelpNudge, setSkipHelpNudge] = useState(false);
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [cardDragging, setCardDragging] = useState(false);
  const cardDragRef = useRef(null);

  useEffect(() => {
    if (forceStartNonce <= 0) return undefined;
    const id = requestAnimationFrame(() => {
      setBox(null);
      setMissing(false);
      setCardOffset({ x: 0, y: 0 });
      const last = Math.max(0, steps.length - 1);
      const raw =
        typeof initialStepIndex === "number" && Number.isFinite(initialStepIndex)
          ? Math.trunc(initialStepIndex)
          : 0;
      const startAt = Math.max(0, Math.min(raw, last));
      // Revisit recap starts at the final step index; jump straight to the Help-tip nudge.
      setSkipHelpNudge(startAt >= last);
      setIndex(startAt);
      setOpen(true);
    });
    return () => cancelAnimationFrame(id);
  }, [forceStartNonce, initialStepIndex, steps.length]);

  useEffect(() => {
    const prev = prevLessonKeyRef.current;
    prevLessonKeyRef.current = lessonKey;
    if (prev === null || prev === lessonKey) return undefined;
    const id = requestAnimationFrame(() => {
      setSkipHelpNudge(false);
      setOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [lessonKey]);

  useEffect(() => {
    if (!blockTour) return undefined;
    setSkipHelpNudge(false);
    setOpen(false);
  }, [blockTour]);

  useEffect(() => {
    if (externalCloseNonce <= 0 || externalCloseNonce === prevExternalCloseRef.current) return undefined;
    prevExternalCloseRef.current = externalCloseNonce;
    const id = requestAnimationFrame(() => {
      setSkipHelpNudge(false);
      setOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [externalCloseNonce]);

  useEffect(() => {
    if (!open) setBox(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCardOffset({ x: 0, y: 0 });
  }, [open, index]);

  const total = steps.length;
  const baseStep = open && total > 0 ? steps[Math.min(Math.max(0, index), total - 1)] : null;
  const displayStep = skipHelpNudge ? SKIP_HELP_NUDGE_STEP : baseStep;

  const isLast = index >= total - 1;

  const measureStep = useCallback(() => {
    if (!displayStep?.selector) {
      setBox(null);
      setMissing(true);
      return;
    }
    const el = queryTourTargetElement(displayStep.selector);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "instant" });
      const r = el.getBoundingClientRect();
      if (r.width >= 2 && r.height >= 2) {
        setBox({ left: r.left, top: r.top, width: r.width, height: r.height });
        setMissing(false);
        return;
      }
    }
    setBox(null);
    setMissing(true);
  }, [displayStep]);

  useLayoutEffect(() => {
    if (!open || !displayStep) return undefined;
    onRequestAction?.(displayStep.action);
    let cancelled = false;
    const run = () => {
      if (!cancelled) measureStep();
    };
    run();
    const t1 = setTimeout(run, 90);
    const t2 = setTimeout(run, 280);
    const t3 = setTimeout(run, 520);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [open, index, displayStep, skipHelpNudge, onRequestAction, measureStep]);

  useEffect(() => {
    if (!open) return undefined;
    const onResize = () => measureStep();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, measureStep]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (skipHelpNudge) {
        setSkipHelpNudge(false);
        setOpen(false);
        return;
      }
      setSkipHelpNudge(true);
      setCardOffset({ x: 0, y: 0 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, skipHelpNudge]);

  useLayoutEffect(() => {
    if (!open || !skipHelpNudge) return undefined;
    let cancelled = false;
    let target = null;
    let raf = 0;
    let t = 0;
    let prevBoxShadow = "";
    let prevOutline = "";
    let prevOutlineOffset = "";
    let prevBorderRadius = "";

    const applyHighlight = () => {
      if (cancelled) return;
      target = queryTourTargetElement(HELP_TOUR_SELECTOR);
      if (!target) return;
      prevBoxShadow = target.style.boxShadow;
      prevOutline = target.style.outline;
      prevOutlineOffset = target.style.outlineOffset;
      prevBorderRadius = target.style.borderRadius;
      target.style.boxShadow =
        "0 0 0 8px rgba(255,255,255,0.92), 0 0 0 12px rgba(186,230,253,0.95)";
      target.style.outline = "2px solid rgba(125,211,252,0.95)";
      target.style.outlineOffset = "0px";
      target.style.borderRadius = "16px";
    };

    applyHighlight();
    raf = requestAnimationFrame(applyHighlight);
    t = window.setTimeout(applyHighlight, 120);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (t) clearTimeout(t);
      if (target) {
        target.style.boxShadow = prevBoxShadow;
        target.style.outline = prevOutline;
        target.style.outlineOffset = prevOutlineOffset;
        target.style.borderRadius = prevBorderRadius;
      }
    };
  }, [open, skipHelpNudge]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  if (!open || total === 0 || !displayStep) return null;
  // Revisit recap should appear only in the final highlighted state (no interim card).
  if (skipHelpNudge && !box) return null;

  const goNext = () => {
    if (skipHelpNudge) return;
    if (isLast) {
      onLastStepDone?.();
      setOpen(false);
    } else setIndex((i) => i + 1);
  };

  const tooltipPos = (() => {
    if (missing || !box) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(calc(-50% - min(56px, 8vw)), -50%)",
        maxWidth: TOOLTIP_MAX_W,
      };
    }
    const margin = 16;
    const gap = 10;
    const approxH = 260;
    let left = box.left + box.width / 2 - TOOLTIP_MAX_W / 2;
    const maxLeft = window.innerWidth - TOOLTIP_MAX_W - margin - RESERVE_TOP_RIGHT_FOR_HELP_PX;
    left = Math.max(margin, Math.min(left, maxLeft));

    const fitsAbove = box.top - gap - approxH >= margin;
    if (fitsAbove) {
      return {
        left,
        bottom: window.innerHeight - box.top + gap,
        top: "auto",
        maxWidth: TOOLTIP_MAX_W,
        transform: "none",
      };
    }
    return {
      left,
      top: box.bottom + gap,
      bottom: "auto",
      maxWidth: TOOLTIP_MAX_W,
      transform: "none",
    };
  })();

  const { transform: tooltipBaseTransform = "none", ...tooltipPosWithoutTransform } = tooltipPos;
  const cardTransform =
    tooltipBaseTransform === "none"
      ? `translate(${cardOffset.x}px, ${cardOffset.y}px)`
      : `${tooltipBaseTransform} translate(${cardOffset.x}px, ${cardOffset.y}px)`;

  const spotlight =
    box && !missing ? (
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: box.left - 8,
          top: box.top - 8,
          width: box.width + 16,
          height: box.height + 16,
          borderRadius: 12,
          boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.75)",
          pointerEvents: "none",
          zIndex: OVERLAY_Z,
          transition: "left 0.12s ease-out, top 0.12s ease-out, width 0.12s ease-out, height 0.12s ease-out",
        }}
      />
    ) : (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.75)",
          zIndex: OVERLAY_Z,
          pointerEvents: "auto",
        }}
      />
    );

  function handleCardPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest?.("button")) return;
    e.preventDefault();
    setCardDragging(true);
    cardDragRef.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: cardOffset.x,
      oy: cardOffset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleCardPointerMove(e) {
    const d = cardDragRef.current;
    if (!d || e.pointerId !== d.id) return;
    setCardOffset({
      x: d.ox + (e.clientX - d.sx),
      y: d.oy + (e.clientY - d.sy),
    });
  }

  function handleCardPointerUp(e) {
    const d = cardDragRef.current;
    if (!d || e.pointerId !== d.id) return;
    setCardDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    cardDragRef.current = null;
  }

  const closeTourFully = () => {
    setSkipHelpNudge(false);
    setCardOffset({ x: 0, y: 0 });
    setOpen(false);
  };

  const handleSkip = () => {
    if (skipHelpNudge) {
      closeTourFully();
      return;
    }
    setSkipHelpNudge(true);
    setCardOffset({ x: 0, y: 0 });
  };

  const card = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inpact-tour-title"
      style={{
        position: "fixed",
        zIndex: TOOLTIP_Z,
        padding: "18px 20px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
        border: "1px solid #e2e8f0",
        pointerEvents: "auto",
        touchAction: "none",
        ...tooltipPosWithoutTransform,
        transform: cardTransform,
      }}
    >
      <div
        role="presentation"
        onPointerDown={handleCardPointerDown}
        onPointerMove={handleCardPointerMove}
        onPointerUp={handleCardPointerUp}
        onPointerCancel={handleCardPointerUp}
        style={{
          cursor: cardDragging ? "grabbing" : "grab",
          margin: "-6px -8px 10px -8px",
          padding: "6px 8px",
          borderRadius: "8px",
          userSelect: "none",
          touchAction: "none",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 55%)",
          borderBottom: "1px solid #e2e8f0",
        }}
        title="Drag to move"
      >
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#64748b" }}>
          {skipHelpNudge ? "INTERFACE TOUR" : "WALKTHROUGH"}
        </div>
      </div>
      <p id="inpact-tour-title" style={{ margin: "0 0 14px", fontSize: "15px", lineHeight: 1.55, color: "#0f172a" }}>
        {displayStep.text}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
          {skipHelpNudge ? "Tip" : `${index + 1} / ${total}`}
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {skipHelpNudge ? (
            <button
              type="button"
              onClick={closeTourFully}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                borderRadius: "8px",
                border: "none",
                background: "#0891b2",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSkip}
                style={{
                  padding: "8px 14px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={goNext}
                style={{
                  padding: "8px 14px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0891b2",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isLast ? "Done" : "Next"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {spotlight}
      {card}
    </>,
    document.body
  );
}

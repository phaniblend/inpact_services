import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { clearReviewDraft, loadReviewDraft, saveReviewDraft } from './localReviewStorage.js'

/** Lesson engine modals/tour use ~11k–12.2k; stay above all of them (stacking-safe via `document.body` portal). */
const REVIEW_Z_PANEL = 2147482000
const REVIEW_Z_FAB = 2147482001
const REVIEW_Z_PASSWORD = 2147482002

const REVIEW_PASSWORD = 'phani'
const SESSION_UNLOCK = 'inpact-local-review-unlocked'

const LocalLessonReviewContext = createContext(null)

/** Clipboard screenshots (e.g. Win+Shift+S) often arrive as `kind: 'file'` with an empty MIME type — `type.startsWith('image/')` misses them. */
function clipboardItemLooksLikeImage(it) {
  if (!it || it.kind !== 'file') return false
  const t = String(it.type || '').toLowerCase()
  if (t.startsWith('image/')) return true
  if (t === '' || t === 'application/octet-stream') return true
  return false
}

function readFileAsImageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const r = String(reader.result || '')
      const base64 = r.includes(',') ? r.split(',')[1] : r
      const mime =
        (file.type && String(file.type).startsWith('image/') ? file.type : '') || 'image/png'
      resolve({ mime, base64 })
    }
    reader.readAsDataURL(file)
  })
}

function buildNullCtx() {
  return { enabled: false }
}

/**
 * @param {object} p
 * @param {boolean} p.enabled
 * @param {number | null} p.lessonIndex
 * @param {string} p.track
 * @param {string} p.lessonTitle
 * @param {import('react').ReactNode} p.children
 */
export function LocalLessonReviewProvider({ enabled, lessonIndex, track, lessonTitle, children }) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false
    return sessionStorage.getItem(SESSION_UNLOCK) === '1'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdInput, setPwdInput] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [submitMsg, setSubmitMsg] = useState('')
  const [draft, setDraft] = useState(() => ({
    version: 1,
    comments: [],
  }))
  const [noteText, setNoteText] = useState('')
  const [pendingImages, setPendingImages] = useState(() => [])
  const [draftHydrated, setDraftHydrated] = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    void (async () => {
      const loaded = await loadReviewDraft()
      if (cancelled) return
      if (loaded?.comments?.length) {
        setDraft({ version: 1, comments: loaded.comments })
      }
      setDraftHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const [draftSaveError, setDraftSaveError] = useState('')

  const persist = useCallback((next) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void saveReviewDraft(next)
        .then(() => {
          setDraftSaveError('')
        })
        .catch((err) => {
          const msg =
            err?.name === 'QuotaExceededError'
              ? 'Browser storage is full (try smaller screenshots or fewer images per note).'
              : err instanceof Error
                ? err.message
                : 'Could not save draft locally.'
          setDraftSaveError(msg)
        })
    }, 350)
  }, [])

  useEffect(() => {
    if (!enabled || !draftHydrated) return
    persist(draft)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [draft, draftHydrated, enabled, persist])

  const lessonNumber = lessonIndex != null ? lessonIndex + 1 : null

  const unlock = useCallback((pwd) => {
    if (pwd === REVIEW_PASSWORD) {
      sessionStorage.setItem(SESSION_UNLOCK, '1')
      setUnlocked(true)
      setPwdError('')
      setPwdInput('')
      setPwdOpen(false)
      setSidebarOpen(true)
      return true
    }
    setPwdError('Wrong password.')
    return false
  }, [])

  const addNote = useCallback(() => {
    if (lessonIndex == null || !track) return
    const t = noteText.trim()
    if (!t && pendingImages.length === 0) return
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(16).slice(2)}`
    const row = {
      id,
      track,
      lessonIndex,
      lessonNumber: lessonIndex + 1,
      lessonTitle: lessonTitle || `Lesson ${lessonIndex + 1}`,
      text: t,
      images: pendingImages.map(({ mime, base64 }) => ({ mime, base64 })),
    }
    setDraft((d) => ({ ...d, comments: [...d.comments, row] }))
    setNoteText('')
    setPendingImages([])
  }, [lessonIndex, lessonTitle, noteText, pendingImages, track])

  const removeComment = useCallback((id) => {
    setDraft((d) => ({ ...d, comments: d.comments.filter((c) => c.id !== id) }))
  }, [])

  const appendImageRows = useCallback((rows) => {
    if (!rows?.length) return
    setPendingImages((prev) => [...prev, ...rows])
  }, [])

  const ingestImageFiles = useCallback(
    async (/** @type {File[]} */ files) => {
      const list = files.filter(
        (f) =>
          f &&
          (String(f.type || '').toLowerCase().startsWith('image/') ||
            String(f.type || '') === '' ||
            String(f.type || '').toLowerCase() === 'application/octet-stream'),
      )
      if (!list.length) return
      const rows = await Promise.all(list.map((file) => readFileAsImageData(file)))
      appendImageRows(rows)
    },
    [appendImageRows],
  )

  /** Clipboard + optional textarea / drop target */
  const onPasteImages = useCallback(
    (e) => {
      const items = e.clipboardData?.items
      if (!items?.length) return
      const files = []
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (!clipboardItemLooksLikeImage(it)) continue
        const f = it.getAsFile()
        if (f) files.push(f)
      }
      if (!files.length) return
      e.preventDefault()
      void ingestImageFiles(files)
    },
    [ingestImageFiles],
  )

  const onDropImages = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      const dt = e.dataTransfer
      if (!dt?.files?.length) return
      void ingestImageFiles(Array.from(dt.files))
    },
    [ingestImageFiles],
  )

  const onDragOverImages = useCallback((e) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const submitReview = useCallback(async () => {
    setSubmitMsg('')
    if (draft.comments.length === 0) {
      setSubmitMsg('Nothing to submit.')
      return
    }
    let body
    try {
      body = JSON.stringify({ comments: draft.comments })
    } catch {
      setSubmitMsg('Payload too large or invalid to serialize. Try submitting fewer screenshots per batch.')
      return
    }
    try {
      const res = await fetch('/__local-review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitMsg(data?.error || `Submit failed (${res.status}).`)
        return
      }
      await clearReviewDraft()
      setDraft({ version: 1, comments: [] })
      setSubmitMsg(data?.message || 'Saved under reviews/.')
    } catch (err) {
      setSubmitMsg(
        err instanceof Error
          ? err.message
          : 'Network error — run `npm run dev` so the local export endpoint is available.',
      )
    }
  }, [draft.comments])

  const ctx = useMemo(() => {
    if (!enabled) return buildNullCtx()
    return {
      enabled: true,
      unlocked,
      lessonIndex,
      pwdOpen,
      setPwdOpen,
      pwdInput,
      setPwdInput,
      pwdError,
      setPwdError,
      unlock,
      sidebarOpen,
      setSidebarOpen,
      draft,
      noteText,
      setNoteText,
      pendingImages,
      setPendingImages,
      onPasteImages,
      addNote,
      removeComment,
      submitReview,
      submitMsg,
      setSubmitMsg,
      draftSaveError,
      lessonNumber,
      track,
      lessonTitle,
      ingestImageFiles,
      onDropImages,
      onDragOverImages,
    }
  }, [
    enabled,
    unlocked,
    lessonIndex,
    pwdOpen,
    pwdInput,
    pwdError,
    unlock,
    sidebarOpen,
    draft,
    noteText,
    pendingImages,
    onPasteImages,
    draftSaveError,
    ingestImageFiles,
    onDropImages,
    onDragOverImages,
    addNote,
    removeComment,
    submitReview,
    submitMsg,
    lessonNumber,
    track,
    lessonTitle,
  ])

  return (
    <LocalLessonReviewContext.Provider value={ctx}>
      {children}
      {enabled ? (
        <>
          <LocalLessonReviewToolbarButton />
          <LocalLessonReviewOverlays />
        </>
      ) : null}
    </LocalLessonReviewContext.Provider>
  )
}

function reviewPortalTarget() {
  return typeof document !== 'undefined' ? document.body : null
}

function LocalLessonReviewOverlays() {
  const ctx = useContext(LocalLessonReviewContext)
  const pasteRef = useRef(null)
  const fileInputRef = useRef(null)
  const [reviewPanelOffset, setReviewPanelOffset] = useState(() => ({ x: 0, y: 0 }))
  const reviewPanelOffsetRef = useRef(reviewPanelOffset)
  reviewPanelOffsetRef.current = reviewPanelOffset
  const reviewPanelDragRef = useRef(null)

  const handleReviewPanelPointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.target.closest('button')) return
    e.preventDefault()
    const off = reviewPanelOffsetRef.current
    reviewPanelDragRef.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: off.x,
      oy: off.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handleReviewPanelPointerMove = useCallback((e) => {
    const d = reviewPanelDragRef.current
    if (!d || e.pointerId !== d.id) return
    setReviewPanelOffset({
      x: d.ox + (e.clientX - d.sx),
      y: d.oy + (e.clientY - d.sy),
    })
  }, [])

  const handleReviewPanelPointerUp = useCallback((e) => {
    const d = reviewPanelDragRef.current
    if (!d || e.pointerId !== d.id) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (_) {
      /* ignore */
    }
    reviewPanelDragRef.current = null
  }, [])

  if (!ctx?.enabled) return null
  const portalEl = reviewPortalTarget()
  if (!portalEl) return null
  return createPortal(
    <>
      {ctx.pwdOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: REVIEW_Z_PASSWORD,
            background: 'rgba(15,23,42,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) ctx.setPwdOpen(false)
          }}
        >
          <div
            style={{
              width: 'min(360px, 92vw)',
              padding: '20px',
              borderRadius: '12px',
              background: '#fff',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Local review</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Password (stored only in this browser session). This tool does not upload anywhere.
            </div>
            <input
              type="password"
              autoFocus
              value={ctx.pwdInput}
              onChange={(e) => {
                ctx.setPwdInput(e.target.value)
                if (ctx.pwdError) ctx.setPwdError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ctx.unlock(ctx.pwdInput)
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            {ctx.pwdError ? (
              <div style={{ color: '#b91c1c', fontSize: '13px', marginTop: '8px' }}>{ctx.pwdError}</div>
            ) : null}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => ctx.setPwdOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => ctx.unlock(ctx.pwdInput)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {ctx.sidebarOpen && ctx.unlocked ? (
        <aside
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '300px',
            height: '100vh',
            zIndex: REVIEW_Z_PANEL,
            background: '#f8fafc',
            borderLeft: '1px solid #cbd5e1',
            boxShadow: '-8px 0 24px rgba(15,23,42,0.12)',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            display: 'flex',
            flexDirection: 'column',
            fontSize: '12px',
            color: '#334155',
            transform: `translate(${reviewPanelOffset.x}px, ${reviewPanelOffset.y}px)`,
          }}
        >
          <div
            role="toolbar"
            aria-label="Drag review panel"
            onPointerDown={handleReviewPanelPointerDown}
            onPointerMove={handleReviewPanelPointerMove}
            onPointerUp={handleReviewPanelPointerUp}
            onPointerCancel={handleReviewPanelPointerUp}
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              cursor: 'grab',
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            <span style={{ fontWeight: 700, color: '#0f172a' }} title="Drag to reposition">
              Lesson review
            </span>
            <button
              type="button"
              onClick={() => ctx.setSidebarOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                color: '#64748b',
              }}
              aria-label="Close review panel"
            >
              ×
            </button>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
            {ctx.lessonNumber != null ? (
              <div>
                <span style={{ color: '#64748b' }}>Current lesson</span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>
                  #{ctx.lessonNumber} · {ctx.track}
                </div>
                <div style={{ marginTop: '4px', lineHeight: 1.35, color: '#475569' }}>{ctx.lessonTitle}</div>
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>Open a lesson to add new notes (draft is kept on this machine).</div>
            )}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>Note</span>
              <textarea
                value={ctx.noteText}
                onChange={(e) => ctx.setNoteText(e.target.value)}
                onPaste={(e) => ctx.onPasteImages(e)}
                disabled={ctx.lessonNumber == null}
                placeholder='Write feedback. Screenshots are listed by filename in the export; add "see the screenshot" only if you want to explicitly point readers at an image.'
                style={{
                  width: '100%',
                  minHeight: '88px',
                  resize: 'vertical',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </label>
            {ctx.draftSaveError ? (
              <div
                role="alert"
                style={{ fontSize: '11px', color: '#b91c1c', lineHeight: 1.35, padding: '6px 8px', background: '#fef2f2', borderRadius: '6px' }}
              >
                {ctx.draftSaveError}
              </div>
            ) : null}
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px', color: '#475569' }}>Screenshots</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                aria-hidden
                onChange={(e) => {
                  const fl = e.target.files
                  if (fl?.length && ctx.lessonNumber != null) {
                    void ctx.ingestImageFiles(Array.from(fl))
                  }
                  e.target.value = ''
                }}
              />
              <div
                ref={pasteRef}
                tabIndex={0}
                onPaste={ctx.onPasteImages}
                onDrop={ctx.lessonNumber != null ? ctx.onDropImages : undefined}
                onDragOver={ctx.lessonNumber != null ? ctx.onDragOverImages : undefined}
                style={{
                  border: '1px dashed #94a3b8',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                  color: '#64748b',
                  background: ctx.lessonNumber == null ? '#f1f5f9' : '#fff',
                  outline: 'none',
                  cursor: ctx.lessonNumber == null ? 'not-allowed' : 'pointer',
                }}
              >
                <div style={{ lineHeight: 1.45, marginBottom: '8px' }}>
                  Paste in the note box or here (Win+Shift+S → Ctrl+V), or drop image files. Clipboard shots often have no
                  MIME type — we accept those now.
                </div>
                <button
                  type="button"
                  disabled={ctx.lessonNumber == null}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: ctx.lessonNumber == null ? '#e2e8f0' : '#fff',
                    cursor: ctx.lessonNumber == null ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0f172a',
                  }}
                >
                  Choose image files…
                </button>
              </div>
              {ctx.pendingImages.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {ctx.pendingImages.map((im, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img
                        src={`data:${im.mime};base64,${im.base64}`}
                        alt=""
                        style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() =>
                          ctx.setPendingImages((prev) => prev.filter((_, j) => j !== i))
                        }
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: 'none',
                          background: '#0f172a',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              disabled={ctx.lessonNumber == null || (!ctx.noteText.trim() && ctx.pendingImages.length === 0)}
              onClick={ctx.addNote}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: ctx.lessonNumber == null ? '#cbd5e1' : '#0ea5e9',
                color: '#fff',
                fontWeight: 600,
                cursor: ctx.lessonNumber == null ? 'not-allowed' : 'pointer',
              }}
            >
              Save note for lesson {ctx.lessonNumber ?? '—'}
            </button>
            <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>Saved notes ({ctx.draft.comments.length})</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ctx.draft.comments.map((c) => (
                <li
                  key={c.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px',
                    position: 'relative',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => ctx.removeComment(c.id)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      fontSize: '16px',
                    }}
                    aria-label="Remove note"
                  >
                    ×
                  </button>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', paddingRight: '20px' }}>
                    L{c.lessonNumber} · {c.track}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, paddingRight: '16px' }}>{c.text || '—'}</div>
                  {c.images?.length ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {c.images.map((im, i) => (
                        <img
                          key={i}
                          src={`data:${im.mime};base64,${im.base64}`}
                          alt=""
                          style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            {ctx.submitMsg ? (
              <div style={{ fontSize: '11px', marginBottom: '8px', color: '#0369a1' }}>{ctx.submitMsg}</div>
            ) : null}
            <button
              type="button"
              onClick={ctx.submitReview}
              disabled={ctx.draft.comments.length === 0}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: ctx.draft.comments.length === 0 ? '#cbd5e1' : '#0f172a',
                color: '#fff',
                fontWeight: 700,
                cursor: ctx.draft.comments.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Submit export
            </button>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
              Dev only: writes <code style={{ fontSize: '10px' }}>reviews/review.txt</code> and{' '}
              <code style={{ fontSize: '10px' }}>reviews/images/</code>. Draft persists in IndexedDB until submit.
            </div>
          </div>
        </aside>
      ) : null}
    </>,
    portalEl,
  )
}

/** Fixed FAB — portaled to `document.body` so it stays above lesson modals (z-index in millions). */
export function LocalLessonReviewToolbarButton() {
  const ctx = useContext(LocalLessonReviewContext)
  if (!ctx?.enabled) return null
  if (ctx.lessonIndex == null) return null
  const portalEl = reviewPortalTarget()
  if (!portalEl) return null
  const btn = (
    <button
      type="button"
      title="Local lesson review (dev)"
      onClick={() => {
        if (!ctx.unlocked) {
          ctx.setPwdOpen(true)
          return
        }
        ctx.setSidebarOpen((o) => !o)
      }}
      style={{
        position: 'fixed',
        left: 'max(16px, env(safe-area-inset-left, 0px))',
        bottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
        zIndex: REVIEW_Z_FAB,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: 'rgb(5, 37, 67)',
        border: '2px solid #22d3ee',
        borderRadius: '999px',
        color: '#e0f2fe',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 700,
        padding: '10px 18px',
        boxShadow: '0 10px 36px rgba(15, 23, 42, 0.45)',
      }}
    >
      Review
    </button>
  )
  return createPortal(btn, portalEl)
}

import { useState, useCallback, useEffect } from 'react'

export const REACT_TS_PATTERNS_BRIDGE_STORAGE_KEY = 'inpact.reactTs.patternsBridge.v1'

export function isReactTsPatternsBridgeDismissed() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(REACT_TS_PATTERNS_BRIDGE_STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

const LP = {
  bg: '#ffffff',
  text: '#0f172a',
  muted: '#475569',
  subtle: '#64748b',
  cyan: '#00d4ff',
  cyanText: '#052545',
  brick: '#c97b7b',
  brickBorder: '#dfa8a3',
  brickTint: 'rgba(201, 123, 123, 0.14)',
  line: '#f1f5f9',
  card: '#f8fafc',
  green: '#059669',
  greenTint: 'rgba(5, 150, 105, 0.12)',
  red: '#dc2626',
  redTint: 'rgba(220, 38, 38, 0.10)',
}

const PATTERN_MAP_BLOCKS = [
  {
    title: 'Cards',
    line: 'The atom of every UI — one item, its most important details, at a glance.',
    example: 'Example: a product tile, a user profile chip, a single order summary.',
  },
  {
    title: 'Lists',
    line: 'The same card, repeated — many items in a scannable row-by-row view.',
    example: 'Example: all open orders, all contacts, every support ticket in the queue.',
  },
  {
    title: 'Detail view',
    line: 'Tap into one item and see everything about it — the full picture, not just the summary.',
    example: 'Example: click one order to see every line item, every note, every status change.',
  },
  {
    title: 'Forms',
    line: 'The moment data changes — a user types, chooses, and submits something new.',
    example: 'Example: book an appointment, edit a profile, submit a payment.',
  },
  {
    title: 'Actions',
    line: 'A decision that affects everyone — something permanent that cannot be quietly undone.',
    example: 'Example: approve a request, send a bulk reminder, archive a record.',
  },
  {
    title: 'Dashboards',
    line: 'Step back from individual items and see the whole picture — trends, totals, comparisons.',
    example: 'Example: revenue this month vs last month, low-stock items across all locations.',
  },
  {
    title: 'Permissions',
    line: 'The rules that decide who can see what — and who can change it.',
    example: 'Example: an admin can edit everything; a new hire can only read.',
  },
]

const SEVEN_BLOCKS_EXAMPLES = [
  'A card that shows one grocery item at a glance.',
  'A list that shows everything in the kitchen.',
  'A detail view only when the team needs a deeper drill-down for one item (notes, history, expiry timeline).',
  'A form to add or update stock.',
  'An action to flag something as expired.',
  'A dashboard only when decisions need trend-level visibility (low-stock patterns, waste risk across locations).',
  'A permission that stops a new hire from deleting records.',
]

const GROCERY_ITEMS = [
  { name: 'Roma tomatoes', quantity: '2 cases', expires: 'Use by Friday' },
  { name: 'Fresh basil', quantity: '3 bunches', expires: 'Use by Tomorrow' },
  { name: 'Chicken breast', quantity: '12 kg', expires: 'Use Tonight' },
]

const btnPrimary = {
  border: 'none',
  borderRadius: '10px',
  padding: '12px 22px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  background: LP.cyan,
  color: LP.cyanText,
}

const btnSecondary = {
  border: '2px solid ' + LP.brickBorder,
  borderRadius: '10px',
  padding: '12px 20px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  background: LP.bg,
  color: LP.text,
}

const kicker = {
  margin: '0 0 10px',
  fontSize: '11px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: LP.cyan,
  fontWeight: 700,
}

function PatternBlockMiniPreview({ title }) {
  const shell = {
    border: '1px solid rgba(15,23,42,0.08)',
    borderRadius: '14px',
    padding: '14px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
    boxSizing: 'border-box',
    width: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    boxShadow: '0 10px 28px rgba(15,23,42,0.08)',
  }
  const label = {
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: LP.cyan,
    marginBottom: '10px',
  }

  if (title === 'Cards') {
    return (
      <div style={shell}>
        <div style={label}>Sample card</div>
        <div style={{ height: '72px', borderRadius: '8px', background: 'linear-gradient(135deg, #a5f3fc 0%, #dbeafe 52%, #fce7f3 100%)', marginBottom: '10px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: LP.text }}>Roma tomatoes</span>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '999px', background: 'rgba(16,185,129,0.20)', color: '#065f46' }}>In stock</span>
        </div>
        <div style={{ fontSize: '11px', color: LP.muted, marginTop: '6px' }}>Qty · Use by Fri</div>
      </div>
    )
  }

  if (title === 'Lists') {
    return (
      <div style={shell}>
        <div style={label}>Scannable rows</div>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: n < 3 ? '1px solid ' + LP.line : 'none' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: n % 2 ? '#bae6fd' : '#fbcfe8' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '8px', width: '55%', background: '#94a3b8', borderRadius: '4px', marginBottom: '6px' }} />
              <div style={{ height: '6px', width: '35%', background: '#dbeafe', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (title === 'Detail view') {
    return (
      <div style={shell}>
        <div style={label}>One row · full detail</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '44%', borderRadius: '8px', background: 'linear-gradient(180deg, #bfdbfe 0%, #fbcfe8 100%)', minHeight: '100px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '10px', width: '70%', background: '#94a3b8', borderRadius: '4px', marginBottom: '10px' }} />
            <div style={{ height: '6px', width: '100%', background: LP.line, borderRadius: '4px', marginBottom: '6px' }} />
            <div style={{ height: '6px', width: '90%', background: LP.line, borderRadius: '4px', marginBottom: '6px' }} />
            <div style={{ height: '6px', width: '60%', background: LP.line, borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (title === 'Forms') {
    return (
      <div style={shell}>
        <div style={label}>Inputs then submit</div>
        <div style={{ height: '10px', width: '28%', background: '#93c5fd', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '36px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '10px', background: '#eff6ff' }} />
        <div style={{ height: '10px', width: '22%', background: '#93c5fd', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '36px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '14px', background: '#eff6ff' }} />
        <button type="button" tabIndex={-1} style={{ ...btnPrimary, width: '100%', padding: '10px 16px', fontSize: '13px', pointerEvents: 'none', background: 'linear-gradient(90deg, #22d3ee 0%, #38bdf8 100%)' }}>Save</button>
      </div>
    )
  }

  if (title === 'Dashboards') {
    return (
      <div style={shell}>
        <div style={label}>Totals and trends</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: '#ecfeff', border: '1px solid #a5f3fc' }}>
            <div style={{ fontSize: '10px', color: LP.muted }}>This week</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: LP.text }}>$24k</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #86efac' }}>
            <div style={{ fontSize: '10px', color: LP.muted }}>Vs last</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: LP.green }}>+12%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '56px' }}>
          {[22, 38, 26, 44, 30].map((hpx, i) => (
            <div key={i} style={{ flex: 1, height: hpx + 'px', borderRadius: '4px 4px 0 0', background: i % 2 === 0 ? LP.cyan : LP.brick, opacity: 0.85 }} />
          ))}
        </div>
      </div>
    )
  }

  if (title === 'Actions') {
    return (
      <div style={shell}>
        <div style={label}>Something permanent</div>
        <p style={{ fontSize: '12px', color: LP.muted, margin: '0 0 14px', lineHeight: 1.45 }}>Approve sends the change to everyone — no undo from here.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" tabIndex={-1} style={{ ...btnSecondary, pointerEvents: 'none', fontSize: '12px', padding: '8px 14px', borderColor: '#fca5a5', background: '#fff1f2' }}>Cancel</button>
          <button type="button" tabIndex={-1} style={{ ...btnPrimary, pointerEvents: 'none', fontSize: '12px', padding: '8px 14px', background: 'linear-gradient(90deg, #22d3ee 0%, #34d399 100%)' }}>Approve request</button>
        </div>
      </div>
    )
  }

  if (title === 'Permissions') {
    return (
      <div style={shell}>
        <div style={label}>Who can do what</div>
        <div style={{ fontSize: '12px', marginBottom: '10px', color: LP.text, fontWeight: 600 }}>Delete shipment</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span>Admin</span><span style={{ color: LP.green, fontWeight: 700 }}>&#10003;</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span>New hire</span><span style={{ color: LP.brick, fontWeight: 700 }}>&#10005;</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function DataFlowDiagram() {
  const arrowStyle = { textAlign: 'center', fontSize: '18px', color: LP.cyan, margin: '8px 0', lineHeight: 1 }
  const stepLabel = { fontSize: '11px', fontWeight: 700, color: LP.cyan, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }

  return (
    <div style={{ margin: '20px 0', padding: '20px', borderRadius: '14px', background: LP.card, border: '1px solid ' + LP.line }}>

      <div style={stepLabel}>Step 1 — the data arrives as a list</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
        {GROCERY_ITEMS.map((item, i) => (
          <div key={item.name} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid ' + LP.line, borderLeft: '3px solid ' + (i % 2 === 0 ? LP.cyan : LP.brick), background: LP.bg, fontSize: '12px', color: LP.muted, lineHeight: 1.5 }}>
            {'{ '}
            <span style={{ color: LP.cyan }}>name</span>{': "'}{item.name}{'", '}
            <span style={{ color: LP.cyan }}>quantity</span>{': "'}{item.quantity}{'", '}
            <span style={{ color: LP.cyan }}>expires</span>{': "'}{item.expires}{'" }'}
          </div>
        ))}
        <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid ' + LP.line, borderLeft: '3px solid ' + LP.brick, background: LP.bg, fontSize: '12px', color: LP.subtle, fontStyle: 'italic' }}>
          ... 44 more items
        </div>
      </div>

      <div style={arrowStyle}>&#8595;</div>

      <div style={stepLabel}>Step 2 — your app loops through it</div>
      <div style={{ padding: '12px 16px', borderRadius: '8px', background: LP.bg, border: '1px solid ' + LP.line, fontFamily: 'monospace', fontSize: '13px', color: LP.text, lineHeight: 1.6, marginBottom: '8px' }}>
        <span style={{ color: LP.brick }}>for each</span>{' item '}<span style={{ color: LP.brick }}>{'→'}</span>{' hand it to the card'}
      </div>

      <div style={arrowStyle}>&#8595;</div>

      <div style={stepLabel}>Step 3 — the same card renders once per item</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {GROCERY_ITEMS.map((item) => (
          <div key={item.name} style={{ border: '1px solid ' + LP.line, borderRadius: '10px', padding: '10px 12px', background: LP.bg, minWidth: '120px', flex: 1, boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
            <div style={{ height: '36px', borderRadius: '6px', background: LP.line, marginBottom: '8px' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: LP.text, marginBottom: '4px' }}>{item.name}</div>
            <div style={{ fontSize: '10px', color: LP.muted }}>{item.quantity}</div>
            <div style={{ fontSize: '10px', color: LP.subtle }}>{item.expires}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DataFlowGate({ onCorrect }) {
  const [step, setStep] = useState(0)

  // step 0 — broken scenario
  // step 1 — rhetorical: what if we defined the shape upfront?
  // step 2 — show the shape, learner reacts
  // step 3 — we name it: that is an interface

  const codeBox = {
    padding: '14px 18px',
    borderRadius: '10px',
    background: '#0f172a',
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: 1.8,
    marginBottom: '16px',
    overflowX: 'auto',
  }

  const cyan = { color: LP.cyan }
  const brick = { color: '#f8a4a4' }
  const green = { color: '#86efac' }
  const white = { color: '#f1f5f9' }

  return (
    <div>

      {/* ── Step 0 — broken scenario ── */}
      {step === 0 && (
        <>
          <div style={{ padding: '18px 20px', borderRadius: '12px', background: LP.redTint, border: '1px solid rgba(220,38,38,0.2)', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: LP.red, marginBottom: '10px' }}>Here is what broken looks like</div>
            <p style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: 1.65, color: LP.text }}>
              A developer built the grocery card. It renders fine in the browser — but <strong>every item shows a blank name and no image.</strong> The data is definitely there. The component definitely mounted.
            </p>
            <p style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: 1.65, color: LP.text }}>
              The developer used <code style={{ background: 'rgba(220,38,38,0.1)', padding: '1px 5px', borderRadius: '4px', fontSize: '13px' }}>itemName</code> in the card. The data arrived from the database with <code style={{ background: 'rgba(220,38,38,0.1)', padding: '1px 5px', borderRadius: '4px', fontSize: '13px' }}>name</code>. One wrong field name. No error. Just silence.
            </p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, color: LP.text, fontWeight: 600 }}>47 blank cards. The owner calls at 6am.</p>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '15px', lineHeight: 1.65, color: LP.muted }}>
            The problem is that nobody agreed on the shape of the data upfront. The database team used one name. The developer writing the card used another. Both assumed the other would match.
          </p>
          <button type="button" onClick={() => setStep(1)} style={btnPrimary}>There has to be a better way</button>
        </>
      )}

      {/* ── Step 1 — rhetorical setup ── */}
      {step === 1 && (
        <>
          <p style={{ margin: '0 0 14px', fontSize: '16px', lineHeight: 1.65, color: LP.text, fontWeight: 600 }}>
            What if both sides agreed on the shape before anyone wrote a single line?
          </p>
          <p style={{ margin: '0 0 14px', fontSize: '15px', lineHeight: 1.65, color: LP.muted }}>
            Imagine writing down a standard — a fixed definition of exactly what fields a grocery item must have and what type each one is. Something like this:
          </p>
          <div style={codeBox}>
            <span style={white}>GroceryItem </span><span style={brick}>must always have:</span><br />
            <span style={cyan}>{'  name'}</span><span style={white}>{' as '}</span><span style={green}>string</span><br />
            <span style={cyan}>{'  quantity'}</span><span style={white}>{' as '}</span><span style={green}>string</span><br />
            <span style={cyan}>{'  expires'}</span><span style={white}>{' as '}</span><span style={green}>string</span>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: '15px', lineHeight: 1.65, color: LP.muted }}>
            Now the developer writing the card knows exactly what to expect. And the database team knows exactly what to send. If either side deviates — the wrong name, a missing field — something catches it immediately.
          </p>
          <button type="button" onClick={() => setStep(2)} style={btnPrimary}>That makes sense — show me what that looks like in TypeScript</button>
        </>
      )}

      {/* ── Step 2 — TypeScript shape, learner reacts ── */}
      {step === 2 && (
        <>
          <p style={{ margin: '0 0 14px', fontSize: '15px', lineHeight: 1.65, color: LP.muted }}>
            In TypeScript, that standard is written like this:
          </p>
          <div style={codeBox}>
            <span style={brick}>interface </span><span style={cyan}>GroceryItem</span><span style={white}>{' {'}</span><br />
            <span style={cyan}>{'  name'}</span><span style={white}>{'     : '}</span><span style={green}>string</span><span style={white}>;</span><br />
            <span style={cyan}>{'  quantity'}</span><span style={white}>{' : '}</span><span style={green}>string</span><span style={white}>;</span><br />
            <span style={cyan}>{'  expires'}</span><span style={white}>{'  : '}</span><span style={green}>string</span><span style={white}>;</span><br />
            <span style={white}>{'}'}</span>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '15px', lineHeight: 1.65, color: LP.muted }}>
            The moment the developer writes <code style={{ background: LP.card, padding: '1px 5px', borderRadius: '4px', fontSize: '13px', border: '1px solid ' + LP.line }}>itemName</code> instead of <code style={{ background: LP.card, padding: '1px 5px', borderRadius: '4px', fontSize: '13px', border: '1px solid ' + LP.line }}>name</code>, TypeScript flags it — before the app runs, before it deploys, before the owner sees anything.
          </p>
          <div style={{ padding: '16px 20px', borderRadius: '12px', background: LP.greenTint, border: '1px solid ' + LP.green, marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, color: LP.text }}>
              The typo that cost an hour of debugging? TypeScript would have underlined it in red the moment it was typed — right there in the editor.
            </p>
          </div>
          <button type="button" onClick={() => setStep(3)} style={btnPrimary}>So what is this called?</button>
        </>
      )}

      {/* ── Step 3 — name it, proceed ── */}
      {step === 3 && (
        <>
          <div style={{ padding: '20px 24px', borderRadius: '14px', background: 'rgba(0,212,255,0.06)', border: '1.5px solid ' + LP.cyan, marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: LP.cyan, marginBottom: '12px' }}>What we just walked through</div>
            <p style={{ margin: '0 0 12px', fontSize: '15px', lineHeight: 1.65, color: LP.text }}>
              Writing down a fixed shape — field names and their types — and making both sides of your app agree to it is called declaring an <strong>interface</strong>.
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '15px', lineHeight: 1.65, color: LP.text }}>
              An interface is TypeScript's contract language for data shape. It tells every part of your app exactly what the data must look like: <em>"here is the contract — this is exactly what the data must look like."</em>
            </p>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.65, color: LP.text }}>
              Lesson 1 starts with one. You will write it before you write anything else in the component — because the contract comes first.
            </p>
          </div>
          <button type="button" onClick={onCorrect} style={{ ...btnPrimary, padding: '14px 28px', fontSize: '16px' }}>
            Open Lesson 1
          </button>
        </>
      )}

    </div>
  )
}

export default function ReactTsPatternsBridge({ onComplete, onOpenLesson1 }) {
  const [screen, setScreen] = useState(0)
  const [patternPreviewIndex, setPatternPreviewIndex] = useState(null)
  const [wideLayout, setWideLayout] = useState(false)
  const [bridgeMoreBelow, setBridgeMoreBelow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(min-width: 900px)')
    const apply = () => setWideLayout(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    return undefined
  }, [screen])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const refreshMoreBelow = () => {
      const doc = window.document.documentElement
      const moreBelow = window.scrollY + window.innerHeight < doc.scrollHeight - 24
      setBridgeMoreBelow(moreBelow)
    }

    refreshMoreBelow()
    window.addEventListener('scroll', refreshMoreBelow, { passive: true })
    window.addEventListener('resize', refreshMoreBelow)
    const t = window.setTimeout(refreshMoreBelow, 80)

    return () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', refreshMoreBelow)
      window.removeEventListener('resize', refreshMoreBelow)
    }
  }, [screen])

  const markBridgeDismissed = useCallback(() => {
    try { window.localStorage.setItem(REACT_TS_PATTERNS_BRIDGE_STORAGE_KEY, '1') } catch { }
  }, [])

  const finishToCatalog = useCallback(() => { markBridgeDismissed(); onComplete?.() }, [markBridgeDismissed, onComplete])
  const finishToLesson1 = useCallback(() => { markBridgeDismissed(); onOpenLesson1?.() }, [markBridgeDismissed, onOpenLesson1])

  const outerStyle = {
    minHeight: '100vh',
    boxSizing: 'border-box',
    padding: 'clamp(20px, 4vw, 48px)',
    background: 'radial-gradient(100% 60% at 100% 0%, ' + LP.brickTint + ' 0%, transparent 52%), radial-gradient(90% 50% at 0% 100%, rgba(0,212,255,0.06) 0%, transparent 50%), ' + LP.bg,
    color: LP.text,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }

  const innerStyle = {
    width: '100%',
    maxWidth: screen === 0 ? 'min(100%, 1040px)' : 'min(100%, 720px)',
    borderTop: '3px solid ' + LP.cyan,
    boxShadow: 'inset 0 1px 0 0 ' + LP.line,
    paddingTop: '8px',
  }

  return (
    <div style={outerStyle}>
      <div style={innerStyle}>

        {screen === 0 && (
          <>
            <p style={kicker}>The Pattern Map</p>
            <h1 style={{ margin: '0 0 14px', fontSize: 'clamp(24px, 4vw, 32px)', lineHeight: 1.2, fontWeight: 700, color: LP.text }}>
              At its core, every app does one thing: it gets data from a server and puts it in front of the app user at the right moment, in the right shape.
            </h1>
            <p style={{ margin: '0 0 14px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              Before any screen gets built, two things have already happened: the data has been designed — what fields exist, what they mean, what shape they come in — and it has been fetched — retrieved live from a database so the screen always shows what is real, not what was already changed by the time the app loaded.
            </p>
            <p style={{ margin: '0 0 14px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              Everything you see on screen is the presentation layer — the part you will build in this course — and almost every real product screen (banking, logistics, healthcare, e-commerce) is assembled from the same seven patterns.
            </p>
            <p style={{ margin: '0 0 18px', fontSize: '16px', lineHeight: 1.65, fontWeight: 600, color: LP.text }}>Here are the master seven patterns you will use to build real product screens:</p>
            <div onMouseLeave={() => setPatternPreviewIndex(null)}>
              <div style={{ display: 'flex', flexDirection: wideLayout ? 'row' : 'column', gap: wideLayout ? 28 : 0, alignItems: 'flex-start', marginBottom: '22px' }}>
                <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {PATTERN_MAP_BLOCKS.map((p, i) => (
                      <li
                        key={p.title}
                        role="button"
                        tabIndex={0}
                        onMouseEnter={() => setPatternPreviewIndex(i)}
                        onFocus={() => setPatternPreviewIndex(i)}
                        onClick={() => setPatternPreviewIndex(i)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPatternPreviewIndex(i) } }}
                        style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid ' + LP.line, borderLeft: '3px solid ' + (i % 2 === 0 ? LP.cyan : LP.brick), background: LP.card, boxShadow: '0 1px 2px rgba(15,23,42,0.04)', cursor: 'pointer', outline: patternPreviewIndex === i ? '2px solid ' + LP.cyan : 'none', outlineOffset: 2 }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '15px', color: LP.text, marginBottom: '6px' }}>{p.title}</div>
                        <div style={{ fontSize: '14px', lineHeight: 1.55, color: LP.muted, marginBottom: '4px' }}>{p.line}</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.5, color: LP.subtle }}>{p.example}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ width: wideLayout ? 'clamp(260px, 32vw, 420px)' : '100%', maxWidth: 500, flexShrink: 0, position: wideLayout ? 'sticky' : 'static', top: wideLayout ? 24 : undefined, alignSelf: 'flex-start', marginTop: wideLayout ? 0 : 16 }}>
                  <div style={{ marginBottom: '10px', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: LP.cyan, fontWeight: 800 }}>
                    Live preview panel
                  </div>
                  <div style={{ width: '100%', maxHeight: 500, minHeight: wideLayout ? 250 : 170, overflow: 'hidden', border: '2px solid rgba(0,212,255,0.55)', borderRadius: 14, background: 'linear-gradient(160deg, #ffffff 0%, #ecfeff 35%, #f8fafc 100%)', boxShadow: '0 10px 30px rgba(15,23,42,0.12)', padding: 14, boxSizing: 'border-box' }}>
                    {patternPreviewIndex != null ? (
                      <div style={{ transform: wideLayout ? 'scale(0.88)' : 'scale(1)', transformOrigin: 'top center' }}>
                        <PatternBlockMiniPreview title={PATTERN_MAP_BLOCKS[patternPreviewIndex].title} />
                      </div>
                    ) : (
                      <div style={{ border: '2px dashed rgba(0,212,255,0.45)', borderRadius: 12, padding: 20, textAlign: 'center', color: LP.muted, fontSize: 14, lineHeight: 1.5, background: 'rgba(255,255,255,0.9)', minHeight: wideLayout ? 220 : 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: LP.text }}>Hover a block to preview it</div>
                        <div style={{ fontWeight: 700, color: LP.cyanText }}>On touch devices, tap a block to pin the preview.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p style={{ margin: '0 0 26px', fontSize: '15px', lineHeight: 1.65, color: LP.muted }}>
              You do not need to memorize these now. Just notice: almost every screen you will build in this course is one of these — or a combination of two. Once you can build each one, you can build any enterprise app.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <button type="button" onClick={() => setScreen(1)} style={btnPrimary}>Continue</button>
            </div>
          </>
        )}

        {screen === 1 && (
          <>
            <p style={{ margin: '0 0 6px', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 700, color: LP.cyan }}>Screen 2</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(22px, 3.5vw, 28px)', lineHeight: 1.25, fontWeight: 700, color: LP.text }}>Apply it to a real problem</h2>
            <p style={{ margin: '0 0 14px', fontSize: '17px', lineHeight: 1.55, fontWeight: 600, color: LP.text }}>Let us try this on something concrete.</p>
            <p style={{ margin: '0 0 16px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              Imagine a restaurant owner who is losing money because the kitchen team has no idea what is in stock, what is running low, or what expired yesterday.
            </p>
            <p style={{ margin: '0 0 14px', fontSize: '16px', lineHeight: 1.65, fontWeight: 600, color: LP.text }}>Let us see if we could build a fully functional, production-grade app that tracks kitchen inventory using only those seven building blocks.</p>
            <p style={{ margin: '0 0 18px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              Here is how they map to the restaurant problem:
            </p>
            <ul style={{ margin: '0 0 22px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SEVEN_BLOCKS_EXAMPLES.map((line, i) => (
                <li key={line} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid ' + LP.line, borderLeft: '3px solid ' + (i % 2 === 0 ? LP.cyan : LP.brick), background: LP.card, fontSize: '15px', lineHeight: 1.55, color: LP.muted }}>
                  {line}
                </li>
              ))}
            </ul>
            <p style={{ margin: '0 0 26px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              That is the app you are going to build in this course — one building block at a time, starting with a single card.
            </p>
            <p style={{ margin: '0 0 22px', fontSize: '17px', lineHeight: 1.5, fontWeight: 700, color: LP.text }}>Ready to build the first one?</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
              <button type="button" onClick={() => setScreen(2)} style={{ ...btnPrimary, padding: '14px 26px', fontSize: '16px' }}>Continue</button>
              <button type="button" onClick={finishToCatalog} style={btnSecondary}>View all lessons</button>
            </div>
            <button type="button" onClick={() => setScreen(0)} style={{ marginTop: '0', display: 'block', border: 'none', background: 'none', color: LP.brick, fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
              Back to the pattern map
            </button>
          </>
        )}

        {screen === 2 && (
          <>
            <p style={{ margin: '0 0 6px', fontSize: '12px', letterSpacing: '0.1em', fontWeight: 700, color: LP.cyan }}>Screen 3</p>
            <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(22px, 3.5vw, 28px)', lineHeight: 1.25, fontWeight: 700, color: LP.text }}>
              One card. 47 items. Same component.
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              The kitchen inventory changes every hour. Items get used up, restocked, flagged as expired. You cannot bundle that data inside the app — by the time a user opens it, the list would already have changed.
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              So the app fetches it live from a database every time the screen loads. The database sends back a <strong style={{ color: LP.text }}>list of items</strong> — one object per grocery item, each with the same fields: a name, a quantity, an expiry note.
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              The kitchen has 47 items right now. You do not write 47 cards. You write <strong style={{ color: LP.text }}>one card</strong> — and the app hands it one item at a time, repeating until every item on the list has been rendered.
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>Here is what that looks like:</p>
            <DataFlowDiagram />
            <p style={{ margin: '0 0 20px', fontSize: '16px', lineHeight: 1.65, color: LP.muted }}>
              But there is a catch. Your card expects the data in a <strong style={{ color: LP.text }}>specific shape</strong>. It looks for{' '}
              <code style={{ background: LP.card, padding: '1px 5px', borderRadius: '4px', fontSize: '13px', border: '1px solid ' + LP.line }}>name</code> — not{' '}
              <code style={{ background: LP.card, padding: '1px 5px', borderRadius: '4px', fontSize: '13px', border: '1px solid ' + LP.line }}>itemName</code>, not{' '}
              <code style={{ background: LP.card, padding: '1px 5px', borderRadius: '4px', fontSize: '13px', border: '1px solid ' + LP.line }}>title</code>, not{' '}
              <code style={{ background: LP.card, padding: '1px 5px', borderRadius: '4px', fontSize: '13px', border: '1px solid ' + LP.line }}>label</code>.
              If the field name is wrong, the card shows nothing — silently.
            </p>
            <div style={{ border: '2px solid rgba(220,38,38,0.45)', borderRadius: '14px', padding: '24px', marginTop: '8px', background: 'rgba(220,38,38,0.03)' }}>
              <DataFlowGate onCorrect={finishToLesson1} />
            </div>
            <button type="button" onClick={() => setScreen(1)} style={{ marginTop: '16px', display: 'block', border: 'none', background: 'none', color: LP.brick, fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
              Back
            </button>
          </>
        )}

      </div>
      <style>{`
        @keyframes bridgeScrollChevronDown {
          0% { opacity: 0.2; transform: translateY(-4px); }
          35% { opacity: 1; transform: translateY(2px); }
          70% { opacity: 0.45; transform: translateY(8px); }
          100% { opacity: 0.2; transform: translateY(-4px); }
        }
        @keyframes bridgeMouseWheel {
          0% { opacity: 0.95; transform: translateY(0); }
          60% { opacity: 0.35; transform: translateY(7px); }
          100% { opacity: 0.15; transform: translateY(9px); }
        }
        .bridge-scroll-hint-mouse {
          width: 34px;
          height: 54px;
          border-radius: 18px;
          border: 3px solid rgba(8,145,178,0.95);
          background: rgba(255,255,255,0.94);
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          padding-top: 8px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8);
        }
        .bridge-scroll-hint-wheel {
          width: 6px;
          height: 9px;
          border-radius: 999px;
          background: rgba(8,145,178,0.95);
          animation: bridgeMouseWheel 1.15s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .bridge-scroll-hint-chevrons {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          color: rgba(8,145,178,0.95);
          line-height: 1;
        }
        .bridge-scroll-hint-chevron {
          animation: bridgeScrollChevronDown 1.1s ease-in-out infinite;
          will-change: transform, opacity;
          font-weight: 800;
        }
        .bridge-scroll-hint-chevrons .bridge-scroll-hint-chevron:nth-child(1) { animation-delay: 0s; }
        .bridge-scroll-hint-chevrons .bridge-scroll-hint-chevron:nth-child(2) { animation-delay: 0.12s; }
      `}</style>
      {bridgeMoreBelow ? (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '18px',
            transform: 'translateX(-50%)',
            zIndex: 40,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            padding: '0',
          }}
        >
          <div className="bridge-scroll-hint-mouse" aria-hidden>
            <span className="bridge-scroll-hint-wheel" />
          </div>
          <div className="bridge-scroll-hint-chevrons" aria-hidden>
            <span className="bridge-scroll-hint-chevron" style={{ fontSize: '17px' }}>⌄</span>
            <span className="bridge-scroll-hint-chevron" style={{ fontSize: '15px' }}>⌄</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

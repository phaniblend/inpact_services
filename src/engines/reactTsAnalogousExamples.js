/**
 * Infer a short analogous React+TS snippet for "SHOW ME AN EXAMPLE" when a lesson
 * step has no `example_code`. Uses different identifiers than typical lesson answers
 * so learners see the pattern, not copy-paste solutions.
 */

export function inferReactTsAnalogousExample(node) {
  const paal = String(node?.paal || "");
  const hint = String(node?.hint || "");
  const expected = String(node?.expected || "");
  const mcCorrect = String(node?.mc_correct_option || node?.mcCorrectOption || node?.correctOption || "");
  const mcAnchor = String(node?.mc_anchor || node?.mcAnchor || node?.anchor || "");
  const thinkPrompt = String(node?.think_prompt || node?.thinkPrompt || "");
  const anchor = String(node?.anchor || "");
  // Include MCQ text so we can infer what the step *expects* without relying
  // on the instruction text explicitly mentioning the hook name.
  const text = `${paal}\n${hint}\n${expected}\n${mcCorrect}\n${mcAnchor}\n${thinkPrompt}\n${anchor}`;
  const t = text.toLowerCase();

  if (!text.trim()) return null;

  // Import-focused step: show the same import "shape" but with an *analogous hook*.
  // This prevents learners from copying the exact required import line.
  if (/\bimport\b/.test(t) && (/\bfrom\s+['"]react['"]/.test(t) || /\breact\b/.test(t))) {
    // Identify which hook the step is actually teaching from MCQ/anchor text.
    let requiredHook = null;
    if (/\buse\s*state\b/.test(t) && /\buse\s*effect\b/.test(t) === false) requiredHook = "useState";
    else if (/\buse\s*effect\b/.test(t)) requiredHook = "useEffect";
    else if (/\buse\s*ref\b/.test(t)) requiredHook = "useRef";

    const analogMap = {
      useState: "useEffect",
      useEffect: "useState",
      useRef: "useState",
    };
    const analogHook = requiredHook ? analogMap[requiredHook] : null;
    const finalHook = analogHook || ["useEffect", "useRef", "useState"].find((h) => h !== requiredHook) || "useEffect";
    return `import React, { ${finalHook} } from 'react'`;
  }

  // Boolean toggle "function only" (no button wiring yet) — show just the toggle function body.
  // This avoids learners copying a full component when they only need the pattern for setX(prev => !prev).
  const mentionsToggle = /\btoggle\w*\b/.test(t);
  const mentionsFunctionOrHandler = /\bfunction\b/.test(t) || /\bhandler\b/.test(t);
  const mentionsBooleanState = /\bboolean\b/.test(t) && /\bstate\b/.test(t);
  const isToggleLanguage =
    // Most important: "Write a function/handler that toggles boolean state" (includes "toggles")
    (mentionsToggle && mentionsFunctionOrHandler && mentionsBooleanState) ||
    // Keep older language patterns too
    /toggle\s+handler|toggle\s+visibility|flip\s+(display|visibility|flag)|flip\s+the\s+flag|set\w+\([^)]*=>[^)]*!\w+\)/.test(t) ||
    (/\bboolean\b/.test(t) && /\bset\w+\b/.test(t) && /\bprev\b/.test(t) && t.includes("!"));
  const hasButtonWiring = /<button\b/.test(t) || /\bonclick\b/.test(t) || /onClick\s*=/.test(t);
  if (isToggleLanguage && !hasButtonWiring) {
    return `const toggleVisibility = (): void => {\n  setSeeme((prev) => !prev);\n};`;
  }

  // RTK Query / Redux Toolkit slice-style APIs
  if (/\bcreateapi\b|fetchbasequery|builder\.query|builder\.mutation|reducerpath|tagtypes/.test(t)) {
    return `// Different endpoint names; same RTK Query shape:
export const otherApi = createApi({
  reducerPath: 'otherApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (build) => ({
    getItems: build.query<Item[], void>({ query: () => 'items' }),
  }),
})`;
  }

  if (/\busereducer\b/.test(t)) {
    return `type CounterAction = { type: 'inc' } | { type: 'dec' }
function tallyReducer(state: number, action: CounterAction) {
  switch (action.type) {
    case 'inc': return state + 1
    case 'dec': return state - 1
    default: return state
  }
}
const [tally, dispatchTally] = useReducer(tallyReducer, 0)`;
  }

  if (/\busememo\b/.test(t)) {
    return `const sorted = useMemo(() => {
  return [...items].sort((a, b) => a.label.localeCompare(b.label))
}, [items])`;
  }

  if (/\busecallback\b/.test(t)) {
    return `const bump = useCallback(() => {
  setCount((c) => c + 1)
}, [])`;
  }

  if (/\busecontext\b|\bcreatecontext\b|\bcontext\.provider\b/.test(t)) {
    return `const PaletteCtx = createContext<string | null>(null)
// Consumer: const tone = useContext(PaletteCtx)`;
  }

  if (/\buseref\b/.test(t) && !/\buseeffect\b/.test(t)) {
    return `const boxRef = useRef<HTMLDivElement | null>(null)
// boxRef.current?.focus()`;
  }

  // Function component definition (explicit JSX.Element return type — avoid React.FC in new code).
  // Used for steps like "Create a function component... Type it as a React function component."
  if (
    /\bfunction\s+component\b/.test(t) ||
    /\bfunctional\s+component\b/.test(t) ||
    /\breac?t\.fc\b/.test(t) ||
    /\bjsx\.element\b/.test(t)
  ) {
    return `const Scoreboard = (): JSX.Element => {\n  return <div />;\n};`;
  }

  // JSX structure step for toggle UI: provide a concrete code-shaped pattern,
  // not the generic fallback bullets.
  if (
    (/\b(return|render)\b/.test(t) && /\bjsx\b/.test(t)) &&
    /\bbutton\b/.test(t) &&
    (/\bcontent\s+holder\b/.test(t) || /\bcontent\s+(area|element)\b/.test(t) || /\btoggleable\s+content\b/.test(t)) &&
    !/\bonclick\b/.test(t)
  ) {
    return `return (\n  <>\n    <button>Toggle</button>\n    <div>Content</div>\n  </>\n);`;
  }

  // useState + useEffect (count / numeric)
  if (/\buseeffect\b/.test(t) && /\busestate\b/.test(t) && /\b(count|numeric|number)\b/.test(t)) {
    return `const [ticks, setTicks] = useState<number>(0)
useEffect(() => {
  console.log('ticks:', ticks)
}, [ticks])`;
  }

  // Numeric increment/decrement handler (handler-only; no wiring yet).
  // This must trigger even if the task text doesn't explicitly mention `setX`.
  if (
    /\b(increment\w*|increase\w*|add\w*|decrement\w*|decrease\w*|subtract\w*)\b/.test(t) &&
    /\b(handler|function)\b/.test(t) &&
    (/\bcount\b|\bcounter\b|\bstate\b|\buseState\b/.test(t)) &&
    !/\bonclick\b/.test(t) &&
    !/\bonchange\b/.test(t) &&
    !/<button\b/.test(t) &&
    !/\bwire\b/.test(t) &&
    !/\bconnect\b/.test(t) &&
    !/\bwiring\b/.test(t)
  ) {
    const hasInc = /\b(increment\w*|increase\w*|add\w*)\b/.test(t);
    const hasDec = /\b(decrement\w*|decrease\w*|subtract\w*)\b/.test(t);
    // Prefer decrement if both words appear (e.g. "Follow the same pattern as the increment handler"
    // will mention "increment" even for a decreasing step).
    const isInc = hasInc && !hasDec;
    return isInc
      ? `const double: () => void = () => {\n  setValue((p) => p * 2);\n};`
      : `const halve: () => void = () => {\n  setValue((p) => Math.floor(p / 2));\n};`;
  }

  // Wiring step: "pass the handler reference" (no parentheses) — avoid inline callbacks.
  // Trigger using phrasing like "without parentheses" / "don't call them" / "pass your handler".
  if (
    /\bonclick\b/.test(t) &&
    (/\b(without\s+parentheses|no\s+parentheses|dont\s+call|don't\s+call)\b/.test(t) ||
      /\bpass\b.*\bhandler\b/.test(t) ||
      /\bpass\s+your\b.*\bhandler\b/.test(t) ||
      /\bpass\s+the\s+function\b/.test(t) ||
      /\bfunction\s+reference\b/.test(t) ||
      /\breferences?\b/.test(t)) &&
    (/\bbutton\b/.test(t) || /<button\b/.test(t))
  ) {
    const handlerRefs = Array.from(t.matchAll(/onClick\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g)).map((m) => m[1]);
    // Step-specific fallback: different lessons may have different button counts.
    const h1 = handlerRefs[0] || (t.includes("toggle") ? "toggleHandler" : "handleIncrement");
    const hasTwoButtonsHint =
      /\b(increment|decrement|plus|minus)\b/.test(t) || /\btwo\b/.test(t) || /\b1\b.*\b2\b/.test(t);
    if (hasTwoButtonsHint) {
      const h2 = handlerRefs[1] || "handleDecrement";
      return `<button onClick={${h1}}>+</button>\n<button onClick={${h2}}>-</button>`;
    }
    return `<button onClick={${h1}}>Toggle</button>`;
  }

  // Wiring handlers into existing buttons (final counter step).
  if (
    (/\bwire\b|\bconnect\b|\battach\b/.test(t) || /\b(and|then)\b/.test(t)) &&
    /\bonclick\b/.test(t) &&
    (/\b(increment|decrement)\b/.test(t) || /\bplus\b|\bminus\b/.test(t))
  ) {
    return `<button onClick={handleIncrement}>+</button>\n<button onClick={handleDecrement}>-</button>`;
  }

  // JSX display for counter step (buttons exist, but wiring happens later).
  if (
    /\b(return|render)\b/.test(t) &&
    (/\bcount\b|\bcurrent count\b/.test(t) || /\bvalue\b/.test(t)) &&
    /\bbutton\b/.test(t) &&
    (/\b(increment|decrement)\b/.test(t) || /\bplus\b|\bminus\b/.test(t)) &&
    !/\bonclick\b/.test(t)
  ) {
    return `return (\n  <div>\n    <h1>{count}</h1>\n    <button>+</button>\n    <button>-</button>\n  </div>\n);`;
  }

  if (/\buseeffect\b/.test(t) && /\babortcontroller\b|abort\b.*signal|\bfetch\b.*\bsignal\b/.test(t)) {
    return `useEffect(() => {
  const ac = new AbortController()
  fetch('/api/example', { signal: ac.signal }).catch(() => {})
  return () => ac.abort()
}, [])`;
  }

  if (/\buseeffect\b/.test(t) && /\bcleanup\b|\breturn\s*\(\)\s*=>\s*\{/.test(t)) {
    return `useEffect(() => {
  document.title = 'Demo'
  return () => {
    document.title = ''
  }
}, [])`;
  }

  if (/\buseeffect\b/.test(t)) {
    return `useEffect(() => {
  console.log('level:', level)
}, [level])  // deps list every value from state/props the effect reads`;
  }

  // Multiple string fields / forms
  if (/\bname\b.*\bemail\b.*\bpassword\b.*\bconfirm/.test(t)) {
    return `// Fictitious names — same idea as your lesson:
const [alias, setAlias] = useState<string>('')
const [mailbox, setMailbox] = useState<string>('')
const [secret, setSecret] = useState<string>('')
const [secretDup, setSecretDup] = useState<string>('')`;
  }

  if (/\bseparate\b.*\bstring\b|\bemail\b.*\bpassword\b|\btwo\b.*\busestate<string>/.test(t)) {
    return `const [handle, setHandle] = useState<string>('')
const [secret, setSecret] = useState<string>('')`;
  }

  if (/\bfour\b.*\b(controlled|input|string|field)\b/.test(t)) {
    return `const [alias, setAlias] = useState<string>('')
const [mailbox, setMailbox] = useState<string>('')
const [secret, setSecret] = useState<string>('')
const [secretDup, setSecretDup] = useState<string>('')
// Then bind four <input>s with value={...} and onChange={e => set...(e.target.value)}`;
  }

  if (/\btwo\b.*\b(controlled|input)\b/.test(t)) {
    return `<input
  value={handle}
  onChange={(e) => setHandle(e.target.value)}
/>
<input
  type="password"
  value={secret}
  onChange={(e) => setSecret(e.target.value)}
/>`;
  }

  // Wiring-style toggle button (avoid inline callbacks):
  // If the task says "onClick handler" for a toggle/flip boolean state, prefer passing
  // a handler reference rather than an inline `onClick={() => ...}` callback.
  if (
    /\bbutton\b/.test(t) &&
    /\bonclick\b/.test(t) &&
    /\bhandler\b/.test(t) &&
    (/\btoggle\w*\b/.test(t) || /\bflip\w*\b/.test(t) || /\bflips\b/.test(t) || /\bseeme\b/.test(t) || /\bis\s+detail\b/.test(t))
  ) {
    return `<button type="button" onClick={toggleHandler}>Toggle</button>
{isShown && <div>Visible content</div>}`;
  }

  // Button + functional update (before boolean-only state)
  if (
    /\btoggle\b.*\bhandler\b|\bfunctional update\b|\bflip\b.*\b(value|flag|visible)\b/.test(t)
  ) {
    return `<button type="button" onClick={() => setFlag((prev) => !prev)}>
  Toggle
</button>`;
  }

  // Controlled input
  if (
    /\bcontrolled\b/.test(t) ||
    (/\bvalue=\{/.test(hint) && /\bonchange\b/.test(t)) ||
    /\bchangeevent\b.*htmlinputelement|\bonchange=.*target\.value/.test(t)
  ) {
    if (/\bparagraph\b/.test(t) || /\bdisplay\s+the\s+current\b/.test(t) || /\bbelow\s+to\s+display\b/.test(t)) {
      return `<div>
  <input
    value={caption}
    onChange={(e) => setCaption(e.target.value)}
  />
  <p>Current: {caption}</p>
</div>`;
    }
    return `<input
  value={caption}
  onChange={(e) => setCaption(e.target.value)}
/>`;
  }

  // JSX display step (showing a state value in heading/text)
  if (
    (/\binside the div\b|\badd an h1\b|\bheading\b|\bdisplay\b/.test(t) && /\bcount\b|\bvalue\b/.test(t)) ||
    /<h1>|\{count\}|displays the current/.test(t)
  ) {
    return `return (
  <div>
    <h2>{total}</h2>
  </div>
)`;
  }

  // Boolean / visibility / toggle state (fictitious names — not the lesson’s variables)
  if (
    /\busestate<boolean>/.test(t) ||
    ((/\bboolean\b/.test(t) && /\bstate\b/.test(t)) && (/\busestate\b/.test(t) || /\bdeclare\b|\bcreate\b|\binitialize\b|\binitialise\b/.test(t)))
  ) {
    return "const [seeme, setSeeme] = useState<boolean>(true)";
  }

  // String state
  if (
    /\busestate<string>/.test(t) ||
    (/\bstring\b/.test(t) && /\bstate\b/.test(t) && (/\bempty\b|initialize|define\s+and\s+create/.test(t)))
  ) {
    return "const [caption, setCaption] = useState<string>('')";
  }

  // Numeric state
  if (/\busestate<number>|\bnumeric\b.*\bstate\b|\bcount\b.*\b(initialized|initialize)/.test(t)) {
    return "const [total, setTotal] = useState<number>(0)";
  }

  // Password match / conditional message
  if (/\bpasswords\b.*\bmatch\b|\bmatch\b.*\bpassword\b/.test(t)) {
    return `{secret === secretDup ? <p>Aligned</p> : <p>Not aligned</p>}`;
  }

  // Conditional render
  if (
    /\bbutton\b/.test(t) &&
    /\&\&/.test(t) &&
    /\bconditionall\w*\b/.test(t)
  ) {
    return `return (
  <div>
    <button type="button">Toggle</button>
    {show && <p>Visible content</p>}
  </div>
);`;
  }

  if (/\bconditional\b.*\brender\b|only\s+while\s+\w+\s+is|show.*while.*visible/.test(t)) {
    return `{isOpen && <p>You can see this.</p>}`;
  }

  // Dynamic button label via ternary operator (toggle visibility final step).
  if (
    /\bbutton\b/.test(t) &&
    /\bternary\b/.test(t) &&
    (/\bshow\b/.test(t) || /\bhide\b/.test(t) || /\bvisible\b/.test(t) || /\bhidden\b/.test(t))
  ) {
    // Use placeholder boolean name and labels to keep this analogous (pattern-first).
    return `<button type="button">{isShown ? "Hide" : "Show"}</button>`;
  }

  // Props + explicit return type (avoid React.FC)
  if (/\binterface\b.*props|react\.fc<|react\.functionalcomponent/.test(text)) {
    return `type BannerProps = { label: string }
export const Banner = ({ label }: BannerProps): JSX.Element => <header>{label}</header>`;
  }

  // List / keys
  if (/\bmap\b.*\bkey=|\bkeyboard\b.*\blist\b|\bul\b.*\bli\b/.test(t)) {
    return `{items.map((row) => (
  <li key={row.id}>{row.title}</li>
))}`;
  }

  if (/\busetransition\b/.test(t)) {
    return `const [pending, startTransition] = useTransition()
startTransition(() => setFilter(nextFilter))`;
  }

  if (/\busedeferredvalue\b/.test(t)) {
    return `const deferredQuery = useDeferredValue(query)
// Read from deferredQuery in expensive child props`;
  }

  if (/\blazy\b|\bsuspense\b/.test(t)) {
    return `const Panel = lazy(() => import('./Panel'))
// <Suspense fallback={<p>…</p>}><Panel /></Suspense>`;
  }

  if (/\breact\.memo\b|\bmemo\s*\(/.test(t)) {
    return `const Tile = memo(function Tile({ label }: { label: string }) {
  return <span>{label}</span>
})`;
  }

  if (/\bforwardref\b/.test(t)) {
    return `const Box = forwardRef<HTMLDivElement, { label: string }>(function Box({ label }, ref) {
  return <div ref={ref}>{label}</div>
})`;
  }

  if (/\buseimperativehandle\b/.test(t)) {
    return `useImperativeHandle(ref, () => ({
  focus: () => innerRef.current?.focus(),
}), [])`;
  }

  if (/\busesyncexternalstore\b/.test(t)) {
    return `const width = useSyncExternalStore(
  subscribeWindowResize,
  () => window.innerWidth,
  () => 0,
)`;
  }

  // Generic “scaffold” objectives (placeholder lessons)
  if (
    /\binitial setup\b|\bcore implementation\b|\bcomplete\b.*lesson\b/.test(t) ||
    (/\bstructure\b|\btemplate\b/.test(t) && /\bstate\b/.test(t) && /\blesson\b/.test(t))
  ) {
    return `// Small typed slice you can grow:
const [draft, setDraft] = useState<string>('')
// Then wire JSX and handlers to match the task.`;
  }

  return null;
}

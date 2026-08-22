import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #17 (React Patterns)",
    title: "Event Handling — Click",
    body: "In previous lessons you wired onChange to update state and set value from state on the input. That pattern has a name: controlled input. The input's displayed value is always driven by React state — not by the DOM. This makes React the single source of truth for the field's value, enabling instant validation, formatting, conditional disabling, and programmatic reset. In this lesson you'll understand the full controlled input contract, the uncontrolled alternative, and when each is appropriate.",
    usecase:
      "A shipment form must format the ID field as uppercase in real time — whatever the user types, the displayed value is always uppercase. It must also disable the destination field until an ID is entered. Both require controlled inputs: React owns the value, and every keystroke passes through state before rendering.",
  },
},
{
  id: "prereqs",
  type: "prereqs",
  phase: "Prerequisites",
  items: [
    {
      lesson: 1,
      label: "JSX — The Full Language",
      reason: "Complete Lesson 1 (JSX — The Full Language) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 10,
      label: "useState — Primitives",
      reason: "Complete Lesson 10 (useState — Primitives) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Explain the controlled input contract: value from state, updates through onChange",
    "Understand why omitting onChange on a value-bound input makes it read-only",
    "Apply a transformation (uppercase) to the value on every onChange before storing in state",
    "Conditionally disable an input based on another field's value",
    "Build a reusable ControlledInput component with typed props",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Explain the controlled input contract by building a shipmentId input where value comes from state and onChange updates state. Then explain what happens if you set value without onChange.",
  hint: "value={shipmentId} makes React control what the input displays. onChange is what lets the user change it. Without onChange, the input is frozen — every keystroke is overwritten by the state value.",
  example_code: `// Controlled — value from state, onChange updates state
<input value={shipmentId} onChange={e => setShipmentId(e.target.value)} />

// Read-only — value from state, no onChange
<input value={shipmentId} /> // user can't type — every keystroke reset to state value`,
  think_prompt:
    "If value={shipmentId} and you type a character, React re-renders with the state value — not your typed character. What does that mean for the user experience without onChange?",
  mc_options: [
    "Without onChange, the input is uncontrolled — the DOM handles the value",
    "Without onChange, the input is frozen — every keystroke is overwritten by the state value, making it effectively read-only",
    "Without onChange, React throws an error immediately",
  ],
  mc_correct_option:
    "Without onChange, the input is frozen — every keystroke is overwritten by the state value, making it effectively read-only",
  mc_anchor:
    "Setting value without onChange creates a read-only input — React controls the displayed value and nothing updates the state, so every render puts the same state value back. React will also log a warning in development: 'You provided a value prop to a form field without an onChange handler.' The input doesn't become uncontrolled — it stays controlled, just unable to change.",
  why_this_matters:
    "Understanding what value without onChange does is what makes the controlled input contract clear. The contract has two parts: React sets the display value (via value), and the user's input is captured by onChange to update the state, which then flows back to value. Both parts are required for a functional controlled input.",
  answer_keywords: [
    "value", "shipmentId", "onChange", "e.target.value", "setShipmentId",
    "read-only", "frozen",
  ],
  seed_code: `import { useState } from 'react';`,
  starter_code: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');

  return (
    <div>
      {/* controlled input — value from state, onChange updates state */}
      <input
        placeholder="Shipment ID"
      />
      {/* also add a read-only version with value but no onChange */}
      <p>Current value: {shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — value={shipmentId} pins the display, onChange captures keystrokes and updates state, which flows back to value. Without onChange, every re-render resets the input to the state value — the user's typing is overwritten.",
  feedback_partial:
    "Close — make sure you have both: `value={shipmentId}` AND `onChange={e => setShipmentId(e.target.value)}`. Both are required for a functional controlled input.",
  feedback_wrong:
    "The controlled input: `<input value={shipmentId} onChange={e => setShipmentId(e.target.value)} />`. Without onChange: `<input value={shipmentId} />` — the user can't type because every render resets the value.",
  expected: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');

  return (
    <div>
      {/* controlled — value flows both ways */}
      <input
        value={shipmentId}
        onChange={e => setShipmentId(e.target.value)}
        placeholder="Shipment ID"
      />
      {/* read-only — value set but no onChange */}
      <input
        value={shipmentId}
        placeholder="Read-only display"
        readOnly
      />
      <p>Current value: {shipmentId}</p>
    </div>
  );
};`,
  analog_example: `// controlled
<input value={city} onChange={e => setCity(e.target.value)} />

// read-only display
<input value={city} readOnly />`,
  deepDiveLabel:
    "value + onChange = controlled. What is an uncontrolled input — and when would you use one?",
  deepDive: {
    hook: "You set value and wire onChange — controlled. A colleague shows you an input with no value attribute and no state — just a ref. They read the value with `ref.current.value` on submit. TypeScript doesn't complain. It works. 'Uncontrolled', they say. You ask when you'd choose that over controlled.",
    pain: "⚠️ **Lesson:** Controlled inputs store the value in React state on every keystroke. Uncontrolled inputs let the DOM manage the value and read it with a ref only when needed. What are the tradeoffs — and when does uncontrolled make sense?",
    mentalModel:
      "**Controlled**: React state is the single source of truth. Every keystroke updates state → triggers re-render → updates the input. Allows live validation, formatting, derived values, and programmatic reset.\n\n**Uncontrolled**: The DOM manages the value. You read it with a ref only when needed (submit time). No per-keystroke re-renders. Less code.\n\nWhen to use uncontrolled:\n- Simple forms where you only need the value on submit\n- File inputs — they're always uncontrolled (React can't control file selection)\n- Forms in performance-critical paths where per-keystroke renders are a problem\n\nWhen to use controlled (default):\n- Live validation or formatting\n- Derived UI (character count, button enable/disable)\n- Programmatic reset or pre-population\n- Any field whose value affects other fields",
    discover:
      "```tsx\n// ✅ controlled — value from state\nconst [query, setQuery] = useState('');\n<input value={query} onChange={e => setQuery(e.target.value)} />\n\n// ✅ uncontrolled — DOM manages value, ref reads it on submit\nconst inputRef = useRef<HTMLInputElement>(null);\nconst handleSubmit = () => console.log(inputRef.current?.value);\n<input ref={inputRef} defaultValue='NX-001' />\n\n// ⚠️ file input — always uncontrolled\n<input type='file' ref={fileRef} />\n```",
    quickRules:
      "- ✅ controlled: default choice — live validation, formatting, derived UI\n- ✅ uncontrolled: simple read-on-submit forms, file inputs, performance-critical paths\n- ❌ mixing: don't switch a single input between controlled and uncontrolled\n- defaultValue (not value) for uncontrolled inputs with initial values\n- file input is always uncontrolled — React cannot set file input value",
    watchOut:
      "👀 **Watch out:** Switching from controlled to uncontrolled (or vice versa) at runtime causes a React warning and unpredictable behaviour. If shipmentId starts as a string and becomes undefined, the input switches from controlled to uncontrolled. Always initialise state with a defined value ('' not undefined) for controlled inputs.",
    dryRun:
      "🔁 **Think:** `const [id, setId] = useState<string | undefined>(undefined)`. You render `<input value={id} onChange={...} />`. React logs a warning. Why — and what's the fix?",
    build:
      "**Learning focus:** Build a controlled input with the value + onChange contract — understanding that value without onChange creates a frozen read-only input, and that the controlled/uncontrolled choice is a design decision with real tradeoffs.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Apply a real-time transformation: convert the shipmentId value to uppercase on every onChange before storing in state. The input should always display uppercase regardless of what the user types.",
  hint: "Transform the value before calling the setter: `setShipmentId(e.target.value.toUpperCase())`. The state never holds a lowercase string.",
  example_code: `onChange={e => setProductCode(e.target.value.toUpperCase())}`,
  think_prompt:
    "The user types 'nx-001'. The onChange fires. Before storing in state, you want to transform it to 'NX-001'. Where in the data flow do you apply the transformation?",
  mc_options: [
    "Apply toUpperCase() in the JSX: value={shipmentId.toUpperCase()}",
    "Apply toUpperCase() in the onChange before setState: setShipmentId(e.target.value.toUpperCase())",
    "Apply toUpperCase() in a useEffect that watches shipmentId",
  ],
  mc_correct_option:
    "Apply toUpperCase() in the onChange before setState: setShipmentId(e.target.value.toUpperCase())",
  mc_anchor:
    "Transforming in onChange before setState means the state always holds the canonical value. Applying in the JSX value attribute (value={shipmentId.toUpperCase()}) stores lowercase in state and only displays uppercase — state and display diverge. Using useEffect to transform after setState adds an extra render cycle: type → lowercase state → re-render → uppercase state → re-render. Two renders for one keystroke.",
  why_this_matters:
    "Controlled inputs are the right place to enforce data format — because React owns the value. Every transformation applied in onChange before the setter means the state is always in the canonical form, validation is always against clean data, and there's no divergence between what's stored and what's displayed.",
  answer_keywords: [
    "toUpperCase", "e.target.value", "setShipmentId", "onChange",
  ],
  seed_code: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');
  return (
    <input
      value={shipmentId}
      onChange={e => setShipmentId(e.target.value)}
      placeholder="Shipment ID"
    />
  );
};`,
  starter_code: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');

  return (
    <input
      value={shipmentId}
      // update onChange to transform the value to uppercase before storing
      onChange={e => setShipmentId(e.target.value)}
      placeholder="Shipment ID"
    />
  );
};`,
  feedback_correct:
    "Exactly — the transformation happens in onChange before the setter, so state always holds the uppercase string. One render per keystroke, no divergence between stored and displayed value.",
  feedback_partial:
    "Close — make sure toUpperCase() is applied to e.target.value INSIDE the onChange handler before passing to setShipmentId, not in the value attribute.",
  feedback_wrong:
    "Change the onChange to: `onChange={e => setShipmentId(e.target.value.toUpperCase())}` — transform first, store the result.",
  expected: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');

  return (
    <input
      value={shipmentId}
      onChange={e => setShipmentId(e.target.value.toUpperCase())}
      placeholder="Shipment ID (auto-uppercase)"
    />
  );
};`,
  analog_example: `onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}`,
  deepDiveLabel:
    "Transforming in onChange is clean — but what about more complex formatting like phone numbers or dates?",
  deepDive: {
    hook: "toUpperCase() is simple — one method call. Now format a phone number: user types '5551234567' and the input should display '(555) 123-4567'. The formatting logic is 20 lines. Putting it all inline in onChange gets messy fast.",
    pain: "⚠️ **Lesson:** Complex input formatting in onChange — phone numbers, dates, credit card numbers — quickly becomes unwieldy inline. What's the pattern for keeping the handler clean?",
    mentalModel:
      "Extract the formatter to a pure function:\n```tsx\nconst formatPhone = (raw: string): string => {\n  const digits = raw.replace(/\\D/g, '').slice(0, 10);\n  if (digits.length <= 3) return digits;\n  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;\n  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;\n};\n\nconst handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n  setPhone(formatPhone(e.target.value));\n};\n```\n- Pure formatter: easy to unit test independently\n- Handler stays one line\n- State always holds formatted value\n- No side effects in the formatter",
    discover:
      "```tsx\n// ✅ pure formatter + clean handler\nconst formatShipmentId = (raw: string) =>\n  raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 6);\n\nonChange={e => setShipmentId(formatShipmentId(e.target.value))}\n\n// ❌ complex inline — hard to read and test\nonChange={e => setShipmentId(\n  e.target.value.toUpperCase()\n    .replace(/[^A-Z0-9]/g, '')\n    .slice(0, 2) + '-' + ...\n)}\n```",
    quickRules:
      "- ✅ simple transforms (toUpperCase, trim, slice): inline in onChange\n- ✅ complex formats (phone, date, card): extract to a pure formatter function\n- ✅ pure function: no side effects, easy to test, reusable\n- ❌ formatting logic in useEffect — extra render, stale values\n- ❌ formatting in the value attribute — state and display diverge",
    watchOut:
      "👀 **Watch out:** Formatting that changes the length or structure of the string (like inserting dashes in a phone number) can cause cursor position to jump to the end on every keystroke. This is a known UX problem with controlled input formatting. Library solutions like react-imask or react-number-format handle cursor position correctly.",
    dryRun:
      "🔁 **Think:** formatShipmentId removes non-alphanumeric characters and uppercases. User types 'nx-!001'. Walk through: what does toUpperCase give? What does replace(/[^A-Z0-9-]/g, '') give? What does slice(0, 6) give? What is stored in state?",
    build:
      "**Learning focus:** Apply value transformations in onChange before the setter — understanding that the transformation point determines what the state holds, and that complex formatters belong in pure functions outside the handler.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Add a destination input that is disabled until shipmentId has at least 3 characters. Wire the disabled prop conditionally.",
  hint: "disabled={shipmentId.length < 3} — derived from state at render time. No extra state needed.",
  example_code: `<input
  disabled={primaryField.length < 3}
  value={secondaryField}
  onChange={e => setSecondaryField(e.target.value)}
/>`,
  think_prompt:
    "The disabled state of the destination input depends on the length of shipmentId. This is a derived value — you compute it from existing state. What's the simplest expression?",
  mc_options: [
    "const [isDestinationDisabled, setIsDestinationDisabled] = useState(true); // update in onChange",
    "disabled={shipmentId.length < 3}",
    "disabled={!shipmentId}",
  ],
  mc_correct_option: "disabled={shipmentId.length < 3}",
  mc_anchor:
    "disabled={shipmentId.length < 3} derives the disabled state directly from the existing shipmentId string — no extra state needed. Storing isDestinationDisabled in useState requires updating it every time shipmentId changes — synchronisation risk. disabled={!shipmentId} disables when empty but would enable with a single character like 'N' — less precise than the 3-character threshold.",
  why_this_matters:
    "Conditional disabling of form fields based on other fields' values is a common UX requirement — preventing the user from filling step 2 before step 1 is complete. Computing it as a derived boolean at render time means it's always correct and requires no additional state management.",
  answer_keywords: [
    "destination", "disabled", "shipmentId.length", "< 3",
  ],
  seed_code: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <div>
      <input
        value={shipmentId}
        onChange={e => setShipmentId(e.target.value.toUpperCase())}
        placeholder="Shipment ID"
      />
      <input
        value={destination}
        onChange={e => setDestination(e.target.value)}
        placeholder="Destination"
      />
    </div>
  );
};`,
  starter_code: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <div>
      <input
        value={shipmentId}
        onChange={e => setShipmentId(e.target.value.toUpperCase())}
        placeholder="Shipment ID"
      />
      {/* add disabled to destination — disabled until shipmentId has 3+ chars */}
      <input
        value={destination}
        onChange={e => setDestination(e.target.value)}
        placeholder="Destination"
      />
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `disabled={shipmentId.length < 3}` derives the disabled state from existing state. The destination unlocks automatically when the ID reaches 3 characters — no extra state, no synchronisation.",
  feedback_partial:
    "Close — make sure you're using `disabled={shipmentId.length < 3}` as a computed boolean attribute, not storing a separate disabled state variable.",
  feedback_wrong:
    "Add `disabled={shipmentId.length < 3}` to the destination input. This evaluates to true (disabled) when the ID is shorter than 3 characters, and false (enabled) at 3 or more.",
  expected: `import { useState } from 'react';

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');
  const [destination, setDestination] = useState('');

  return (
    <div>
      <input
        value={shipmentId}
        onChange={e => setShipmentId(e.target.value.toUpperCase())}
        placeholder="Shipment ID"
      />
      <input
        value={destination}
        onChange={e => setDestination(e.target.value)}
        placeholder="Destination"
        disabled={shipmentId.length < 3}
      />
    </div>
  );
};`,
  analog_example: `<input
  placeholder="Confirm password"
  disabled={password.length < 8}
  value={confirm}
  onChange={e => setConfirm(e.target.value)}
/>`,
  deepDiveLabel:
    "Disabled input — but what about the user experience when fields become enabled?",
  deepDive: {
    hook: "The destination input is disabled, greyed out. The user types 3 characters in the ID field. The destination suddenly becomes enabled. But the user's cursor is still in the ID field — they may not notice. Should you auto-focus the destination when it becomes enabled?",
    pain: "⚠️ **Lesson:** When a field becomes enabled based on another field's value, how do you programmatically move focus to it — and what React tool handles programmatic focus?",
    mentalModel:
      "useRef + .focus() is the React way to programmatically focus an element:\n```tsx\nconst destRef = useRef<HTMLInputElement>(null);\n\n// In onChange for shipmentId:\nif (newValue.length === 3) {\n  destRef.current?.focus();\n}\n\n<input ref={destRef} disabled={shipmentId.length < 3} ... />\n```\nThis moves focus to the destination input the moment the ID reaches 3 characters, guiding the user to the next field without requiring them to click or tab.",
    discover:
      "```tsx\n// ✅ programmatic focus with useRef\nconst destRef = useRef<HTMLInputElement>(null);\n\nconst handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n  const value = e.target.value.toUpperCase();\n  setShipmentId(value);\n  if (value.length === 3) destRef.current?.focus();\n};\n\n<input ref={destRef} disabled={shipmentId.length < 3} />\n```",
    quickRules:
      "- ✅ useRef + .focus() for programmatic focus management\n- ✅ optional chaining ref.current?.focus() — safe if ref not yet attached\n- ❌ document.getElementById().focus() — bypasses React, fragile\n- ❌ auto-focus on every character — disruptive; only at the threshold",
    watchOut:
      "👀 **Watch out:** You can't focus a disabled element. If you call focus() on the destination ref before shipmentId reaches 3 characters, nothing happens. Always trigger focus AFTER the state update — the disabled attribute will have updated to false by the next render.",
    dryRun:
      "🔁 **Think:** shipmentId is 'NX' (2 chars). User types '-'. The new value is 'NX-' (3 chars). `if (value.length === 3) destRef.current?.focus()`. The destination input has `disabled={shipmentId.length < 3}`. At the point focus() is called, is the destination still disabled — or has React updated the DOM yet?",
    build:
      "**Learning focus:** Derive disabled state from existing field values — and understand how useRef enables programmatic focus for guided multi-field form flows.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Build a reusable ControlledInput component that accepts value, onChange, label, placeholder, and an optional disabled prop. It renders a labelled, accessible input.",
  hint: "The props interface needs: value (string), onChange (React.ChangeEvent<HTMLInputElement> handler), label (string), placeholder (string), disabled? (boolean). The component renders a label element and an input.",
  example_code: `interface ControlledInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}`,
  think_prompt:
    "A reusable input component wraps the label+input pattern. The parent controls the value and onChange — the component just renders them. What props does it need to be fully flexible for any text input?",
  mc_options: [
    "Props: value, label, placeholder — derive onChange inside the component",
    "Props: value, onChange, label, placeholder, disabled? — pass through to the input element",
    "Props: inputRef — let the parent control everything via ref",
  ],
  mc_correct_option:
    "Props: value, onChange, label, placeholder, disabled? — pass through to the input element",
  mc_anchor:
    "Passing value and onChange through as props keeps the parent in full control of the input's state — the controlled input contract lives in the parent. Deriving onChange inside the component would mean the component owns state, making it uncontrolled from the parent's perspective. The ref approach is uncontrolled and loses type safety.",
  why_this_matters:
    "Reusable controlled input components are the building block of every form in enterprise design systems. They handle label positioning, error display, and accessibility attributes — but delegate state ownership to the parent through the value + onChange props.",
  answer_keywords: [
    "ControlledInputProps", "value", "onChange", "React.ChangeEvent", "label",
    "placeholder", "disabled?", "<label>", "<input>",
  ],
  seed_code: ``,
  starter_code: `// Define ControlledInputProps interface
// Build ControlledInput component
// It should render: a <label> with the label text, then an <input> with all props wired`,
  feedback_correct:
    "Exactly — the component receives value and onChange from the parent, passes them to the input, and adds its own label rendering. The parent owns the state; the component owns the presentation.",
  feedback_partial:
    "Close — make sure onChange is typed as `(e: React.ChangeEvent<HTMLInputElement>) => void` and that both value and onChange are passed to the underlying input element.",
  feedback_wrong:
    "Define `interface ControlledInputProps { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; placeholder?: string; disabled?: boolean; }`. Return `<div><label>{label}</label><input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} /></div>`.",
  expected: `interface ControlledInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

const ControlledInput = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
}: ControlledInputProps): JSX.Element => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};`,
  analog_example: `interface TextFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  error?: string;
}`,
  deepDiveLabel:
    "The reusable input passes value and onChange through — but what about spreading all HTML input props?",
  deepDive: {
    hook: "Your ControlledInput component has 5 explicit props. A teammate wants to add maxLength, autoComplete, aria-label, name, id, and type. That's 11 props. They suggest spreading all HTML input attributes instead of listing them one by one.",
    pain: "⚠️ **Lesson:** Explicitly listing every prop vs using rest/spread to pass all HTML attributes — what are the tradeoffs?",
    mentalModel:
      "**Explicit props**: typed, documented, reviewable. TypeScript validates each one. Consumers know exactly what the component accepts.\n\n**Rest/spread with React.InputHTMLAttributes**: passes all native HTML input attributes through. Flexible but loses the ability to document which props are meaningful. Overuse can lead to 'prop drilling everything'.\n\nBest practice:\n```tsx\ninterface ControlledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {\n  label: string; // custom prop on top of all native attributes\n}\n\n// Usage: any native input attribute is now valid\n<ControlledInput\n  label='Shipment ID'\n  value={id}\n  onChange={handleChange}\n  maxLength={6}\n  autoComplete='off'\n/>\n```",
    discover:
      "```tsx\n// ✅ explicit props — typed, documented, narrow API\ninterface Props { value: string; onChange: ...; label: string; disabled?: boolean; }\n\n// ✅ extend HTML attributes — flexible, all native props pass through\ninterface Props extends React.InputHTMLAttributes<HTMLInputElement> {\n  label: string;\n}\nconst { label, ...inputProps } = props;\nreturn <div><label>{label}</label><input {...inputProps} /></div>;\n\n// ❌ spreading without picking — value and onChange come from different sources\n// Be careful not to accidentally override value or onChange from the spread\n```",
    quickRules:
      "- ✅ explicit props: narrow, documented, clear API\n- ✅ extends InputHTMLAttributes: flexible, passes all native attributes\n- ✅ destructure custom props, spread the rest\n- ❌ spreading everything including value/onChange — can accidentally override controlled input contract\n- start explicit, extend when the need for native attributes grows",
    watchOut:
      "👀 **Watch out:** When spreading `...inputProps` onto the input, ensure your custom props (label, error) are destructured first and not included in the spread. Passing a `label` prop to a native input element creates an unknown attribute warning in the browser.",
    dryRun:
      "🔁 **Think:** Props is `{ label: 'ID', value: 'NX-001', onChange: handler, maxLength: 6, autoComplete: 'off' }`. You destructure `const { label, ...inputProps } = props`. What does inputProps contain? What does `<input {...inputProps} />` render?",
    build:
      "**Learning focus:** Build a reusable controlled input component — understanding that the parent owns value and onChange state while the component owns presentation and accessibility.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Use your ControlledInput component to build the full ShipmentForm — with shipmentId (uppercase transform), destination (disabled until 3 chars), and a submit handler that validates and logs.",
  hint: "Pass the onChange that applies toUpperCase to the shipmentId ControlledInput. Pass disabled={shipmentId.length < 3} to the destination ControlledInput.",
  example_code: `<ControlledInput
  label="Shipment ID"
  value={shipmentId}
  onChange={e => setShipmentId(e.target.value.toUpperCase())}
/>`,
  think_prompt:
    "Everything from steps 1–4 comes together here. The ControlledInput handles rendering. The parent handles state, transformation, validation, and submit. How do you wire the uppercase transform and the disabled condition through the component's props?",
  mc_options: [
    "Pass the raw onChange without transformation — let ControlledInput handle it internally",
    "Pass `onChange={e => setShipmentId(e.target.value.toUpperCase())}` and `disabled={shipmentId.length < 3}` as props",
    "Manage toUpperCase inside ControlledInput's internal state",
  ],
  mc_correct_option:
    "Pass `onChange={e => setShipmentId(e.target.value.toUpperCase())}` as the onChange prop and `disabled={shipmentId.length < 3}` as the disabled prop",
  mc_anchor:
    "Transformations live in the parent's onChange — the parent controls the data, the component only presents it. If ControlledInput handled uppercase internally, it would be making a data decision that belongs to the parent. The disabled condition is also the parent's business logic — the component just applies the attribute.",
  why_this_matters:
    "A reusable component that doesn't make data decisions can serve any context — one form transforms to uppercase, another accepts any case, a third applies phone formatting. The component is a presentation shell. The parent is the data owner. This separation is what makes components genuinely reusable.",
  answer_keywords: [
    "ControlledInput", "toUpperCase", "disabled", "shipmentId.length < 3",
    "handleSubmit", "preventDefault",
  ],
  seed_code: `import { useState } from 'react';

interface ControlledInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

const ControlledInput = ({ value, onChange, label, placeholder, disabled }: ControlledInputProps): JSX.Element => (
  <div className="input-group">
    <label>{label}</label>
    <input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
  </div>
);`,
  starter_code: `import { useState } from 'react';

interface ControlledInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

const ControlledInput = ({ value, onChange, label, placeholder, disabled }: ControlledInputProps): JSX.Element => (
  <div className="input-group">
    <label>{label}</label>
    <input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
  </div>
);

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');

  // define handleSubmit — validate, log, reset

  return (
    <form>
      {/* ControlledInput for shipmentId — uppercase transform */}
      {/* ControlledInput for destination — disabled until 3 chars */}
      {error && <p className="error">{error}</p>}
      <button type="submit">Add Shipment</button>
    </form>
  );
};`,
  feedback_correct:
    "Exactly — the form is composed from reusable ControlledInput components. Each parent-controlled concern (transformation, disabled, validation) lives in ShipmentForm, not in ControlledInput. The component just presents what it receives.",
  feedback_partial:
    "Close — check that the uppercase transform is in the onChange prop passed to the first ControlledInput, not inside ControlledInput itself. And that disabled is computed from shipmentId.length < 3.",
  feedback_wrong:
    "Use `<ControlledInput label='Shipment ID' value={shipmentId} onChange={e => setShipmentId(e.target.value.toUpperCase())} />` and `<ControlledInput label='Destination' value={destination} onChange={e => setDestination(e.target.value)} disabled={shipmentId.length < 3} />`.",
  expected: `import { useState } from 'react';

interface ControlledInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

const ControlledInput = ({ value, onChange, label, placeholder, disabled }: ControlledInputProps): JSX.Element => (
  <div className="input-group">
    <label>{label}</label>
    <input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
  </div>
);

const ShipmentForm = (): JSX.Element => {
  const [shipmentId, setShipmentId] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shipmentId.trim() || !destination.trim()) {
      setError('Both fields are required');
      return;
    }
    setError('');
    console.log('New shipment:', { shipmentId, destination });
    setShipmentId('');
    setDestination('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <ControlledInput
        label="Shipment ID"
        value={shipmentId}
        onChange={e => setShipmentId(e.target.value.toUpperCase())}
        placeholder="NX-001"
      />
      <ControlledInput
        label="Destination"
        value={destination}
        onChange={e => setDestination(e.target.value)}
        placeholder="Hamburg"
        disabled={shipmentId.length < 3}
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Add Shipment</button>
    </form>
  );
};`,
  analog_example: `<TextField
  label="Email"
  value={email}
  onChange={e => setEmail(e.target.value.toLowerCase())}
/>`,
  deepDiveLabel:
    "The form works — when do you reach for a form library instead of building manually?",
  deepDive: {
    hook: "Your 2-field form is clean. Then requirements arrive: 10 fields, async validation (check if the shipment ID already exists in the API), per-field touched state (don't show error until the user has touched the field), schema-based validation (Zod or Yup), and a loading state during submission. Your manual useState approach is starting to look like a lot of code.",
    pain: "⚠️ **Lesson:** Manual controlled inputs are clean for simple forms. At what point do form libraries (React Hook Form, Formik) become worth the dependency?",
    mentalModel:
      "**Manual controlled inputs** are right for:\n- 1-4 fields with simple validation\n- Forms where you control the full design\n- Learning React form patterns\n\n**Form libraries** (React Hook Form recommended) add value for:\n- 5+ fields\n- Per-field touched/dirty/error state\n- Async validation (debounced API calls)\n- Schema validation (Zod, Yup)\n- Complex submission states (loading, success, error)\n- Forms that appear many times across the app\n\nReact Hook Form specifically supports both controlled and uncontrolled inputs — it's the most performant option because it can avoid per-keystroke re-renders using refs.",
    discover:
      "```tsx\n// React Hook Form (uncontrolled by default, controlled opt-in)\nimport { useForm } from 'react-hook-form';\n\nconst { register, handleSubmit, formState: { errors } } = useForm();\n\n<input {...register('shipmentId', { required: 'Required', pattern: /^NX-\\d{3}$/ })} />\n{errors.shipmentId && <p>{errors.shipmentId.message}</p>}\n```",
    quickRules:
      "- ✅ manual controlled inputs: 1-4 fields, simple validation, learning\n- ✅ React Hook Form: 5+ fields, touched state, async validation, performance\n- ✅ Formik: similar to RHF, more opinionated, larger bundle\n- ❌ manual controlled inputs for 10+ fields with complex validation — too much boilerplate\n- pick up React Hook Form in Lesson 112",
    watchOut:
      "👀 **Watch out:** React Hook Form works with uncontrolled inputs by default (using refs) — which means no per-keystroke re-renders. When you need controlled inputs (live character count, instant formatting), use the `Controller` wrapper from RHF.",
    dryRun:
      "🔁 **Think:** You have a 3-field form built with manual controlled inputs — 3 useState calls, 3 handlers, validation on submit. The team adds 4 more fields and per-field validation with touched state. How many useState calls do you now need for values alone? How many for errors? How many for touched? What's the total?",
    build:
      "**Learning focus:** Compose a form from reusable ControlledInput components — understanding that data logic (transformation, validation, disabled state) lives in the parent, and knowing when the form complexity warrants a dedicated form library.",
  },
},
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
  { label: "Step 4", id: "step4" },
  { label: "Step 5", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 17,
  title: "Event Handling — Click",
  shortName: "EVENTS — CLICK",
});

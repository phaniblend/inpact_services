import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #10",
      title: "Multiple State Vars",
      body: `Build a registration form tracking: name, email, password, and confirmPassword as separate state variables.

Each field is controlled by its own useState. Display the current values (or a summary) so you can see all four updating as the user types.`,
      usecase: "Real forms often track many fields. Keeping one state variable per field keeps logic simple and avoids one giant object.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Declare four separate useState variables: name, email, password, confirmPassword",
      "Render four controlled inputs, each with value and onChange",
      "Optionally show live feedback (e.g. passwords match / don't match)",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 3",
    paal: "Declare four state variables: name, email, password, confirmPassword. All start as empty strings.",
    hint: "Four useState calls, e.g. const [name, setName] = useState('')",
    answer_keywords: ["usestate", "name", "email", "password", "confirmpassword", "setname", "setemail", "setpassword"],
    seed_code: `import { useState } from 'react'

export default function RegistrationForm() {
  // Step 1: name, email, password, confirmPassword state
  
}`,
    feedback_correct: "✅ Four state variables declared. Next: wire the inputs.",
    feedback_partial: "Use four separate useState calls — one per field.",
    feedback_wrong: "const [name, setName] = useState(''); same for email, password, confirmPassword.",
    expected: `const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 3",
    paal: "In the JSX (inside the return), add four controlled inputs for name, email, password, and confirmPassword. Wire value and onChange for each (e.g. value={name} onChange={(e) => setName(e.target.value)}).",
    hint: "Each input: value={name} onChange={(e) => setName(e.target.value)}",
    answer_keywords: ["input", "value", "onchange", "name", "email", "password", "type"],
    seed_code: `import { useState } from 'react'

export default function RegistrationForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2: four controlled inputs
  
}`,
    feedback_correct: "✅ All four inputs controlled. Optionally add a 'passwords match' message.",
    feedback_partial: "Each input needs value={state} and onChange that updates that state.",
    feedback_wrong: "Four <input> elements with value and onChange for name, email, password, confirmPassword.",
    expected: `<input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
<input type="email" value={email} onChange={e => setEmail(e.target.value)} />
<input type="password" value={password} onChange={e => setPassword(e.target.value)} />
<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm" />`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 3",
    paal: "In the JSX, complete the form: wrap the inputs in a <form> or <div>, and optionally show 'Passwords match' when password === confirmPassword.",
    hint: "Derived value: const match = password === confirmPassword && password !== ''",
    answer_keywords: ["form", "return", "div", "match", "password", "confirmpassword"],
    seed_code: `import { useState } from 'react'

export default function RegistrationForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <>
      {/* Step 3: form with four inputs and optional match message */}
    </>
  )
}`,
    feedback_correct: "✅ Registration form with multiple state vars complete.",
    feedback_partial: "Include all four inputs and optionally display whether passwords match.",
    feedback_wrong: "Wrap inputs in <form> or <div>, wire all four, show match message if you like.",
    expected: `return (
  <form onSubmit={e => e.preventDefault()}>
    <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm" />
    {password && confirmPassword && (password === confirmPassword ? <p>Passwords match</p> : <p>Passwords don't match</p>)}
  </form>
)`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — State", id: "step1" },
  { label: "Step 2 — Inputs", id: "step2" },
  { label: "Step 3 — Form + match", id: "step3" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 10, title: "Multiple State Vars", shortName: "MULTIPLE STATE VARS" });

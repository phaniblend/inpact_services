import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #8",
      title: "Forms & Validation",
      body: `A login form with live validation.

email: ""         →  "Email is required"
email: "notvalid" →  "Enter a valid email"
email: "a@b.com"  →  ✓ valid

password: ""      →  "Password is required"
password: "abc"   →  "Min 6 characters"
password: "abc123" → ✓ valid

Submit button disabled until both fields are valid.
On submit → show "Welcome!" message.`,
      usecase: `Forms are everywhere. Every login, checkout, and signup uses this exact pattern — controlled inputs, live validation, disabled submit, and a success state. Master this once and you've got 80% of real-world forms covered.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Manage multiple form fields with separate useState variables",
      "Write validation functions that return error strings or empty string",
      "Use boolean derived state to enable/disable a submit button",
      "Show inline error messages with conditional rendering",
      "Handle form submission with onSubmit + e.preventDefault()",
      "Show a success state after valid submission",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare two state variables: email (setter: setEmail) and password (setter: setPassword), both starting as empty strings. Also declare a submitted state (setter: setSubmitted) starting as false.",
    hint: `Three useState calls:\nconst [email, setEmail] = useState("")\nconst [password, setPassword] = useState("")\nconst [submitted, setSubmitted] = useState(false)`,
    example_code: `const [name, setName] = useState("")
const [age, setAge] = useState(0)
const [active, setActive] = useState(false)`,
    seed_code: `import { useState } from 'react'

export default function LoginForm() {
  // Step 1: declare email, password, submitted state
  
}`,
    expected: `const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [submitted, setSubmitted] = useState(false)`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasEmail = /const\[email,setemail\]=usestate\(""\)/.test(a) || /const\[email,setemail\]=usestate\(''\)/.test(a);
      const hasPassword = /const\[password,setpassword\]=usestate\(""\)/.test(a) || /const\[password,setpassword\]=usestate\(''\)/.test(a);
      const hasSubmitted = /const\[submitted,setsubmitted\]=usestate\(false\)/.test(a);
      const hasEmailState = a.includes("usestate") && (a.includes('"email"') || /\[email,/.test(a));
      const hasPasswordState = a.includes("usestate") && (a.includes('"password"') || /\[password,/.test(a));
      if (hasEmail && hasPassword && hasSubmitted) return "correct";
      if (hasEmail && hasPassword) return "partial_submitted";
      if (hasEmailState && hasPasswordState) return "partial_names";
      if (a.includes("usestate")) return "partial_count";
      return "wrong";
    },
    feedback_correct: "✅ Three state variables — form fields and submission flag. Ready to wire the inputs.",
    feedback_partial_submitted: "Email and password are declared ✓ — just missing the submitted state:\nconst [submitted, setSubmitted] = useState(false)",
    feedback_partial_names: "You have the right idea — make sure to use these exact names so the steps stay in sync:\nconst [email, setEmail] = useState(\"\")\nconst [password, setPassword] = useState(\"\")",
    feedback_partial_count: "Need three useState calls — one for email, one for password, one for submitted (false).",
    feedback_wrong: `const [email, setEmail] = useState("")\nconst [password, setPassword] = useState("")\nconst [submitted, setSubmitted] = useState(false)`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Write the JSX return. Add a <form> with two controlled inputs (email and password) and a submit button. Wire each input's value and onChange. Don't worry about validation yet — just get the inputs working.",
    hint: `<form onSubmit={handleSubmit}>
  <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
  <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
  <button type="submit">Log in</button>
</form>`,
    example_code: `<input
  type="text"
  value={username}
  onChange={e => setUsername(e.target.value)}
/>`,
    seed_code: `import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Step 2: return JSX — form with email + password inputs and submit button
  
}`,
    expected: `return (
  <form onSubmit={handleSubmit}>
    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button type="submit">Log in</button>
  </form>
)`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasForm = a.includes("<form");
      const hasEmailInput = /value=\{email\}/.test(ans.replace(/\s/g, ""));
      const hasPasswordInput = /value=\{password\}/.test(ans.replace(/\s/g, ""));
      const hasEmailChange = /setemail\(/.test(a) || /onchange=\{handle.*email/i.test(ans.replace(/\s/g,"").toLowerCase()) || /onchange=\{.*email/i.test(ans.replace(/\s/g,"").toLowerCase());
      const hasPasswordChange = /setpassword\(/.test(a) || /onchange=\{handle.*password/i.test(ans.replace(/\s/g,"").toLowerCase()) || /onchange=\{.*password/i.test(ans.replace(/\s/g,"").toLowerCase());
      const hasButton = a.includes("<button") || a.includes("type=\"submit\"") || a.includes("type='submit'");
      const hasReturn = a.includes("return");
      if (hasForm && hasEmailInput && hasPasswordInput && hasEmailChange && hasPasswordChange && hasButton) return "correct";
      if (hasEmailInput && hasPasswordInput && hasEmailChange && hasPasswordChange) return "partial_form";
      if (hasEmailInput && hasPasswordInput) return "partial_onchange";
      if (hasForm && hasReturn) return "partial_inputs";
      return "wrong";
    },
    feedback_correct: "✅ Both inputs controlled and wired. The form captures typing — next step adds validation.",
    feedback_partial_form: "Both inputs are wired ✓ — wrap them in a <form onSubmit={handleSubmit}> and add a <button type=\"submit\">.",
    feedback_partial_onchange: "value= is set for both ✓ — add onChange handlers:\nonChange={e => setEmail(e.target.value)}\nonChange={e => setPassword(e.target.value)}",
    feedback_partial_inputs: "The form structure is there — add controlled inputs with value= and onChange= for both email and password.",
    feedback_wrong: `return (
  <form onSubmit={handleSubmit}>
    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button type="submit">Log in</button>
  </form>
)`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Write two validation functions before the return. emailError() returns a string if invalid, or \"\" if valid. passwordError() does the same. Email must contain @ and a dot. Password must be 6+ characters.",
    hint: `const emailError = () => {
  if (!email) return "Email is required"
  if (!email.includes("@") || !email.includes(".")) return "Enter a valid email"
  return ""
}

const passwordError = () => {
  if (!password) return "Password is required"
  if (password.length < 6) return "Min 6 characters"
  return ""
}`,
    example_code: `const emailError = () => {
  if (!email) return "Email is required"
  if (!email.includes("@") || !email.includes(".")) return "Enter a valid email"
  return ""
}`,
    seed_code: `import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Step 3: write emailError() and passwordError() validation functions

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Log in</button>
    </form>
  )
}`,
    expected: `const emailError = () => {
  if (!email) return "Email is required"
  if (!email.includes("@") || !email.includes(".")) return "Enter a valid email"
  return ""
}
const passwordError = () => {
  if (!password) return "Password is required"
  if (password.length < 6) return "Min 6 characters"
  return ""
}`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasEmailFn = /emailerror/.test(a);
      const hasPasswordFn = /passworderror/.test(a);
      const hasEmailRequired = a.includes('"emailisrequired"') || a.includes("'emailisrequired'") || (a.includes("!email") && a.includes("return"));
      const hasPasswordRequired = a.includes('"passwordisrequired"') || a.includes("'passwordisrequired'") || (a.includes("!password") && a.includes("return"));
      const hasEmailFormat = a.includes("@") && (a.includes("includes") || a.includes("test") || a.includes("match"));
      const hasPasswordLength = a.includes("length") && (a.includes("6") || a.includes("< 6") || a.includes("<6"));
      if (hasEmailFn && hasPasswordFn && hasEmailFormat && hasPasswordLength) return "correct";
      if (hasEmailFn && hasPasswordFn && hasEmailRequired && hasPasswordRequired) return "partial_logic";
      if (hasEmailFn && hasPasswordFn) return "partial_checks";
      if (hasEmailFn || hasPasswordFn) return "partial_one";
      return "wrong";
    },
    feedback_correct: "✅ Both validators written. emailError() catches missing and malformed email. passwordError() catches missing and too-short passwords.",
    feedback_partial_logic: `Both functions exist ✓ — make sure they check format too:\nemailError: check for @ and .\npasswordError: check password.length < 6`,
    feedback_partial_checks: "Both function names are there ✓ — fill in the checks:\n• emailError: !email → \"Email is required\", !includes(\"@\") → \"Enter a valid email\"\n• passwordError: !password → \"Password is required\", length < 6 → \"Min 6 characters\"",
    feedback_partial_one: "You have one validator — write both emailError and passwordError with the same pattern.",
    feedback_wrong: `const emailError = () => {
  if (!email) return "Email is required"
  if (!email.includes("@") || !email.includes(".")) return "Enter a valid email"
  return ""
}
const passwordError = () => {
  if (!password) return "Password is required"
  if (password.length < 6) return "Min 6 characters"
  return ""
}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "In the JSX, add inline error messages below each input. If emailError() returns a string, show it in a <p>. Same for passwordError(). Also disable the submit button when either validator returns a non-empty string.",
    hint: `{emailError() && <p style={{color:"red"}}>{emailError()}</p>}
{passwordError() && <p style={{color:"red"}}>{passwordError()}</p>}

<button type="submit" disabled={!!(emailError() || passwordError())}>
  Log in
</button>`,
    example_code: `{nameError() && <p className="error">{nameError()}</p>}

<button disabled={!!nameError()}>
  Submit
</button>`,
    seed_code: `import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const emailError = () => {
    if (!email) return "Email is required"
    if (!email.includes("@") || !email.includes(".")) return "Enter a valid email"
    return ""
  }
  const passwordError = () => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Min 6 characters"
    return ""
  }

  // Step 4: add inline error messages + disable button when invalid

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Log in</button>
    </form>
  )
}`,
    expected: `{emailError() && <p>{emailError()}</p>}
{passwordError() && <p>{passwordError()}</p>}
<button type="submit" disabled={!!(emailError() || passwordError())}>Log in</button>`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasEmailError = /emailerror\(\)&&/.test(a) || /\{emailerror\(\)\}/.test(a);
      const hasPasswordError = /passworderror\(\)&&/.test(a) || /\{passworderror\(\)\}/.test(a);
      const hasDisabled = a.includes("disabled");
      const hasDisabledLogic = /disabled=\{/.test(ans.replace(/\s/g, ""));
      const showsBothErrors = hasEmailError && hasPasswordError;
      if (showsBothErrors && hasDisabled && hasDisabledLogic) return "correct";
      if (showsBothErrors && !hasDisabled) return "partial_disabled";
      if (hasDisabled && !showsBothErrors) return "partial_errors";
      if (hasEmailError || hasPasswordError) return "partial_one_error";
      return "wrong";
    },
    feedback_correct: "✅ Inline errors showing, button disabled when form is invalid. One step left — wire the submit.",
    feedback_partial_disabled: "Both error messages are showing ✓ — disable the button when invalid:\n<button disabled={!!(emailError() || passwordError())}>",
    feedback_partial_errors: "The disabled attribute is there ✓ — add the error messages below each input:\n{emailError() && <p>{emailError()}</p>}",
    feedback_partial_one_error: "One error message is showing — add both:\n{emailError() && <p>{emailError()}</p>}\n{passwordError() && <p>{passwordError()}</p>}",
    feedback_wrong: `{emailError() && <p>{emailError()}</p>}
{passwordError() && <p>{passwordError()}</p>}
<button disabled={!!(emailError() || passwordError())}>Log in</button>`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Write the handleSubmit function. It should call e.preventDefault(), then set submitted to true. In the JSX, show a success message when submitted is true, otherwise show the form.",
    hint: `const handleSubmit = (e) => {
  e.preventDefault()
  setSubmitted(true)
}

// In JSX:
if (submitted) return <div>Welcome!</div>
// Or: {submitted ? <div>Welcome!</div> : <form>...</form>}`,
    example_code: `const handleSubmit = (e) => {
  e.preventDefault()
  setSuccess(true)
}

<form onSubmit={handleSubmit}>`,
    seed_code: `import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const emailError = () => {
    if (!email) return "Email is required"
    if (!email.includes("@") || !email.includes(".")) return "Enter a valid email"
    return ""
  }
  const passwordError = () => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Min 6 characters"
    return ""
  }

  // Step 5: write handleSubmit + show success message when submitted

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      {emailError() && <p>{emailError()}</p>}
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {passwordError() && <p>{passwordError()}</p>}
      <button type="submit" disabled={!!(emailError() || passwordError())}>Log in</button>
    </form>
  )
}`,
    expected: `const handleSubmit = (e) => {
  e.preventDefault()
  setSubmitted(true)
}`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasHandleSubmit = a.includes("handlesubmit");
      const hasPreventDefault = a.includes("preventdefault");
      const hasSetSubmitted = a.includes("setsubmitted(true)");
      const hasSuccessUI = a.includes("submitted") && (a.includes("welcome") || a.includes("success") || a.includes("submitted?") || a.includes("submitted&&"));
      if (hasHandleSubmit && hasPreventDefault && hasSetSubmitted && hasSuccessUI) return "correct";
      if (hasHandleSubmit && hasPreventDefault && hasSetSubmitted) return "partial_ui";
      if (hasHandleSubmit && hasSetSubmitted && !hasPreventDefault) return "partial_prevent";
      if (hasHandleSubmit && hasPreventDefault) return "partial_setter";
      return "wrong";
    },
    feedback_correct: "✅ handleSubmit stops the default, sets submitted, and the UI swaps to a success message. That's a complete form.",
    feedback_partial_ui: "handleSubmit is complete ✓ — add the success state in JSX:\n{submitted ? <div>Welcome!</div> : <form>...</form>}",
    feedback_partial_prevent: `setSubmitted(true) is there ✓ — don't forget e.preventDefault() to stop the page from reloading:\nconst handleSubmit = (e) => {\n  e.preventDefault()\n  setSubmitted(true)\n}`,
    feedback_partial_setter: "e.preventDefault() is there ✓ — call setSubmitted(true) to trigger the success state.",
    feedback_wrong: `const handleSubmit = (e) => {
  e.preventDefault()
  setSubmitted(true)
}

// JSX:
{submitted ? <div>Welcome!</div> : <form>...</form>}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Form state", id: "step1" },
  { label: "Step 2 — Wire inputs", id: "step2" },
  { label: "Step 3 — Validators", id: "step3" },
  { label: "Step 4 — Errors + disabled", id: "step4" },
  { label: "Step 5 — Submit", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 8, title: "Forms & Validation", shortName: "FORMS & VALIDATION" });

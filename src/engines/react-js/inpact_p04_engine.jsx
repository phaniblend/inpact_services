import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #4",
      title: "Multiple State Variables",
      body: `A profile card form with two independent inputs — name and age.

Each input has its own state. Changing one doesn't affect the other.

Example:
  name: [ Alice     ]
  age:  [ 30        ]

  → Hello, Alice! You are 30 years old.`,
      usecase: `Every real form has multiple fields — name, email, age, address. Each field has its own value; changing one doesn't affect the others. Signup forms, filters, and settings panels all work this way.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Call useState multiple times in one component — each call is independent",
      "Understand that updating one state variable never affects another",
      "Write separate onChange handlers for each input",
      "Render both values in a live output paragraph",
      "Understand why we don't put both values in one useState object",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: `Declare two state variables: one called name (setter: setName) starting as an empty string, and one called age (setter: setAge) also starting as an empty string. Both inputs start blank.`,
    hint: `Call useState twice — once for each field. They're completely independent:\nconst [name, setName] = useState("")\nconst [age, setAge] = useState("")`,
    example_code: `const [email, setEmail] = useState("")
const [password, setPassword] = useState("")`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasName = a.includes("usestate") && /const\[name,/.test(ans.replace(/\s/g, ""));
      const hasAge = a.includes("usestate") && /const\[age,/.test(ans.replace(/\s/g, ""));
      const hasTwoUseState = (a.match(/usestate/g) || []).length >= 2;
      const hasSomeName = /const\[\w+,/.test(ans.replace(/\s/g, ""));
      const hasEmpty = (a.match(/usestate\(""\)/g) || a.match(/usestate\(''\)/g) || []).length >= 1;
      if (hasName && hasAge && hasTwoUseState) return "correct";
      if (hasTwoUseState && hasEmpty) return "naming";
      if (hasTwoUseState) return "partial";
      if (a.includes("usestate")) return "partial";
      return "wrong";
    },
    feedback_correct: `✅ Two independent useState("") calls. Updating name never touches age — they're completely separate pieces of state.`,
    feedback_naming: (ans) => {
      return `✅ Good — two useState("") calls is right.\n\nFor this tutorial use name/setName and age/setAge so the steps stay in sync:\n\nconst [name, setName] = useState("")\nconst [age, setAge] = useState("")`;
    },
    feedback_partial: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const count = (a.match(/usestate/g) || []).length;
      if (count < 2) return `You need two separate useState calls — one for name, one for age. Each field gets its own state.`;
      return `Almost — make sure both start as "" (empty string) since both inputs start blank.`;
    },
    feedback_wrong: `Declare both like:\nconst [name, setName] = useState("")\nconst [age, setAge] = useState("")\n\nTwo calls — two independent pieces of state.`,
    expected: `const [name, setName] = useState("")\nconst [age, setAge] = useState("")`,
    seed_code: `import { useState } from 'react'

export default function ProfileCard() {
  // Step 1: declare two state variables — name and age, both start empty

}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: `Write two handler functions: handleNameChange and handleAgeChange. Each reads e.target.value and updates its own state variable.`,
    hint: `One handler per field — each calls its own setter:\nconst handleNameChange = (e) => setName(e.target.value)\nconst handleAgeChange = (e) => setAge(e.target.value)`,
    example_code: `const handleEmail = (e) => setEmail(e.target.value)
const handlePassword = (e) => setPassword(e.target.value)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasTwoHandlers = (a.match(/const\w+=\(e\)=>/g) || a.match(/const\w+=e=>/g) || []).length >= 1;
      const hasETargetValue = (a.match(/e\.target\.value/g) || []).length >= 2;
      const hasSetName = a.includes("setname");
      const hasSetAge = a.includes("setage");
      const hasBothSetters = hasSetName && hasSetAge;
      if (hasETargetValue && hasBothSetters) return "correct";
      if (hasETargetValue && (hasSetName || hasSetAge)) return "partial";
      if (a.includes("e.target.value")) return "partial";
      return "wrong";
    },
    feedback_correct: `✅ Two handlers, each reading e.target.value and calling its own setter. Clean separation — name state never touches age state.`,
    feedback_partial: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const count = (a.match(/e\.target\.value/g) || []).length;
      if (count < 2) return `You need two handlers — one calling setName(e.target.value) and one calling setAge(e.target.value).`;
      if (!a.includes("setname")) return `Good — now add a handler for name too: const handleNameChange = (e) => setName(e.target.value)`;
      if (!a.includes("setage")) return `Good — now add a handler for age too: const handleAgeChange = (e) => setAge(e.target.value)`;
      return `Almost — each handler needs e.target.value to read what was typed.`;
    },
    feedback_wrong: `const handleNameChange = (e) => setName(e.target.value)\nconst handleAgeChange = (e) => setAge(e.target.value)\n\nOne handler per field.`,
    expected: `const handleNameChange = (e) => setName(e.target.value)\nconst handleAgeChange = (e) => setAge(e.target.value)`,
    seed_code: `import { useState } from 'react'

export default function ProfileCard() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")

  // Step 2: write handleNameChange and handleAgeChange

}`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: `Write the JSX. Two inputs — one for name (wired to name state + handleNameChange), one for age (wired to age state + handleAgeChange). Add placeholder text to each. No output paragraph yet.`,
    hint: `Each input follows the same controlled pattern:\n<input value={name} onChange={handleNameChange} placeholder="Your name" />\n<input value={age} onChange={handleAgeChange} placeholder="Your age" />`,
    example_code: `return (
  <div>
    <input value={email} onChange={handleEmail} placeholder="Email" />
    <input value={password} onChange={handlePassword} placeholder="Password" />
  </div>
)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasBadReturn = /return\s*\(\s*\{/.test(ans);
      if (hasBadReturn) return "syntax";
      const hasValidReturn = /return\s*\(/.test(ans);
      const inputCount = (a.match(/<input/g) || []).length;
      const valueCount = (a.match(/value=\{/g) || []).length;
      const onChangeCount = (a.match(/onchange=\{/g) || []).length;
      if (hasValidReturn && inputCount >= 2 && valueCount >= 2 && onChangeCount >= 2) return "correct";
      if (inputCount >= 2 && (valueCount < 2 || onChangeCount < 2)) return "partial_wire";
      if (inputCount === 1) return "partial_one";
      if (inputCount === 0) return "wrong";
      return "partial";
    },
    feedback_correct: `✅ Two controlled inputs, each wired independently. value= and onChange= on both. React owns both fields.`,
    feedback_syntax: `Syntax error: return(){\n  is not valid. Use return ( to wrap JSX.`,
    feedback_partial_wire: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const valueCount = (a.match(/value=\{/g) || []).length;
      const onChangeCount = (a.match(/onchange=\{/g) || []).length;
      const inputCount = (a.match(/<input/g) || []).length;
      if (valueCount < inputCount && onChangeCount >= inputCount) return `onChange is wired — but check your value= props. Make sure both inputs have value={name} and value={age} (not the same variable for both).`;
      if (onChangeCount < inputCount && valueCount >= inputCount) return `value= is wired — but both inputs need onChange too.\n\nAdd to the name input:  onChange={handleNameChange}\nAdd to the age input:   onChange={handleAgeChange}`;
      return `Both inputs need value= and onChange=:\n\nName input:  value={name} onChange={handleNameChange}\nAge input:   value={age} onChange={handleAgeChange}`;
    },
    feedback_partial_one: `Good start — but you need two inputs, one for name and one for age. Each gets its own value and onChange.`,
    feedback_partial: `Almost — make sure both inputs have value={} and onChange={} wired to their own state and handler.`,
    feedback_wrong: `return (
  <div>
    <input value={name} onChange={handleNameChange} placeholder="Your name" />
    <input value={age} onChange={handleAgeChange} placeholder="Your age" />
  </div>
)`,
    expected: `return (
  <div>
    <input value={name} onChange={handleNameChange} placeholder="Your name" />
    <input value={age} onChange={handleAgeChange} placeholder="Your age" />
  </div>
)`,
    seed_code: `import { useState } from 'react'

export default function ProfileCard() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")

  const handleNameChange = (e) => setName(e.target.value)
  const handleAgeChange = (e) => setAge(e.target.value)

  // Step 3: write JSX with two controlled inputs (no output yet)

}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: `In the JSX, add a paragraph below the inputs that shows: Hello, {name}! You are {age} years old. Both values should update live as the user types.`,
    hint: `Interpolate both state values in one paragraph:\n<p>Hello, {name}! You are {age} years old.</p>\nBoth update live on every keystroke.`,
    example_code: `<p>Logging in as {email}</p>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasParagraph = a.includes("<p>");
      const hasName = a.includes("{name}");
      const hasAge = a.includes("{age}");
      const hasInputs = (a.match(/<input/g) || []).length >= 2;
      if (hasParagraph && hasName && hasAge && hasInputs) return "correct";
      if (hasParagraph && (hasName || hasAge) && hasInputs) return "partial_one_var";
      if (!hasParagraph && hasInputs) return "partial_no_p";
      return "wrong";
    },
    feedback_correct: `✅ Both {name} and {age} interpolated live. Every keystroke updates that state variable, React re-renders, paragraph reflects the latest values.`,
    feedback_partial_one_var: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      if (!a.includes("{name}")) return `Age is showing — now add {name} to the paragraph too.`;
      return `Name is showing — now add {age} to the paragraph too.`;
    },
    feedback_partial_no_p: `Inputs are wired — now add the output paragraph INSIDE the same div, directly under the two inputs:\n<p>Hello, {name}! You are {age} years old.</p>`,
    feedback_wrong: `Inside the return's <div>, under the two inputs, add:\n<p>Hello, {name}! You are {age} years old.</p>`,
    expected: `<p>Hello, {name}! You are {age} years old.</p>`,
    seed_code: `import { useState } from 'react'

export default function ProfileCard() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")

  const handleNameChange = (e) => setName(e.target.value)
  const handleAgeChange = (e) => setAge(e.target.value)

  return (
    <div>
      <input value={name} onChange={handleNameChange} placeholder="Your name" />
      <input value={age} onChange={handleAgeChange} placeholder="Your age" />
    </div>
  )
}`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: `In the JSX, add the missing output paragraph inside the same <div>, directly under the inputs, then submit the full component.`,
    hint: `Full structure: import → two useState("") → two handlers → return with a single <div> containing: two wired inputs + the output paragraph.`,
    example_code: `import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleEmail = (e) => setEmail(e.target.value)
  const handlePassword = (e) => setPassword(e.target.value)

  return (
    <div>
      <input value={email} onChange={handleEmail} placeholder="Email" />
      <input value={password} onChange={handlePassword} placeholder="Password" />
      <p>Logging in as: {email}</p>
    </div>
  )
}`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const checks = [
        a.includes("import") && a.includes("usestate"),
        (a.match(/usestate\(""\)/g) || a.match(/usestate\(''\)/g) || []).length >= 2,
        (a.match(/e\.target\.value/g) || []).length >= 2,
        (a.match(/<input/g) || []).length >= 2,
        (a.match(/value=\{/g) || []).length >= 2,
        (a.match(/onchange=\{/g) || []).length >= 2,
        a.includes("<p>") && a.includes("{name}") && a.includes("{age}"),
      ];
      const passed = checks.filter(Boolean).length;
      if (passed >= 6) return "correct";
      if (passed >= 4) return "partial";
      return "wrong";
    },
    feedback_correct: `✅ Complete. Two useState("") → two handlers with e.target.value → two controlled inputs → live output paragraph. That's multi-state in React.`,
    feedback_partial: `Almost — check: two useState(""), two handlers with e.target.value, value= and onChange= on both inputs, and {name} + {age} in the paragraph.`,
    feedback_wrong: `Start: import → two useState("") → handleNameChange + handleAgeChange → return with two wired inputs and output paragraph.`,
    expected: `import { useState } from 'react'

export default function ProfileCard() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")

  const handleNameChange = (e) => setName(e.target.value)
  const handleAgeChange = (e) => setAge(e.target.value)

  return (
    <div>
      <input value={name} onChange={handleNameChange} placeholder="Your name" />
      <input value={age} onChange={handleAgeChange} placeholder="Your age" />
      <p>Hello, {name}! You are {age} years old.</p>
    </div>
  )
}`,
    seed_code: `import { useState } from 'react'

export default function ProfileCard() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")

  const handleNameChange = (e) => setName(e.target.value)
  const handleAgeChange = (e) => setAge(e.target.value)

  return (
    <div>
      <input value={name} onChange={handleNameChange} placeholder="Your name" />
      <input value={age} onChange={handleAgeChange} placeholder="Your age" />
    </div>
  )
}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Two state vars", id: "step1" },
  { label: "Step 2 — Two handlers", id: "step2" },
  { label: "Step 3 — Two inputs", id: "step3" },
  { label: "Step 4 — Live output", id: "step4" },
  { label: "Step 5 — Full", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 4, title: "Multiple State Variables", shortName: "MULTIPLE STATE" });

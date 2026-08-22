import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #5",
      title: "Conditional Rendering with Ternary",
      body: `A status card that shows different content based on a boolean.

isLoggedIn = true  →  "Welcome back!"  +  Logout button
isLoggedIn = false →  "Please sign in" +  Login button

One state variable. Two completely different UIs.`,
      usecase: `Nav bars show "Log in" or "Log out" depending on whether the user is signed in; dashboards show different content for guests vs members. Auth flows and feature gating use this pattern everywhere in real apps.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use a ternary operator inside JSX: condition ? A : B",
      "Understand when to use ternary vs && for conditional rendering",
      "Render different text based on a boolean state",
      "Render different button labels based on the same boolean",
      "Wire a toggle function to flip the boolean on click",
      "Explain why if/else doesn't work directly inside JSX return",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare a state variable called isLoggedIn (setter: setIsLoggedIn). The user starts logged out — what should the initial value be?",
    hint: "This is a boolean — true or false. The user starts logged OUT, so the initial value should be false.",
    example_code: `const [isOpen, setIsOpen] = useState(false)`,
    evaluate: (ans) => {
      const a = ans.replace(/\s/g, "").toLowerCase();
      const hasUseState = a.includes("usestate");
      const hasFalse = a.includes("(false)");
      const hasCorrectName = /const\[isloggedin,/i.test(ans.replace(/\s/g, ""));
      const hasBoolName = /const\[\w+,/.test(ans.replace(/\s/g, ""));
      if (hasUseState && hasFalse && hasCorrectName) return "correct";
      if (hasUseState && hasFalse && hasBoolName) return "naming";
      if (hasUseState && a.includes("(true)")) return "wrong_value";
      if (hasUseState) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ useState(false) — starts logged out. isLoggedIn=false means the login UI shows first.",
    feedback_naming: (ans) => {
      const m = ans.match(/const\s*\[(\w+)/);
      const used = m ? m[1] : "your variable";
      return `✅ Good — useState(false) is right.\n\nFor this tutorial use isLoggedIn / setIsLoggedIn so all steps stay in sync:\n\nconst [isLoggedIn, setIsLoggedIn] = useState(false)`;
    },
    feedback_wrong_value: "Almost — but the user starts logged OUT, so the initial value should be false, not true.",
    feedback_partial: "Declare it like:\nconst [isLoggedIn, setIsLoggedIn] = useState(false)\n\nfalse = logged out. The login screen shows first.",
    feedback_wrong: "const [isLoggedIn, setIsLoggedIn] = useState(false)\n\nBoolean state, starts false (logged out).",
    expected: `const [isLoggedIn, setIsLoggedIn] = useState(false)`,
    seed_code: `import { useState } from 'react'

export default function StatusCard() {
  // Step 1: declare boolean state — user starts logged out

}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Write a toggle function called handleAuth that flips isLoggedIn. One click logs in, another logs out. Use the functional update form.",
    hint: "Same toggle pattern as Lesson #2 — flip the boolean using prev:\nconst handleAuth = () => setIsLoggedIn(prev => !prev)",
    example_code: `const toggle = () => setIsVisible(prev => !prev)`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasFn = a.includes("const") && a.includes("=>");
      const hasFlip = /\(\w+\)\s*=>\s*!\w+|\w+\s*=>\s*!\w+/.test(ans.replace(/\s/g, "")) && a.includes("!");
      const hasFunctional = /\(\w+\s*\)\s*=>/.test(ans) || /\(\w+\s*=>\s*!/.test(ans) || /\w+=>\s*!/.test(a);
      const hasNamedParam = /const\s+\w+\s*=\s*\w\s*=>/.test(ans) && !/const\s+\w+\s*=\s*\(\s*\)\s*=>/.test(ans);
      if (hasNamedParam && !hasFunctional) return "named_param";
      if (hasFn && hasFlip) return "correct";
      if (a.includes("!")) return "partial";
      if (hasFn && a.includes("set")) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ prev => !prev — the same safe flip pattern from P02. Works for any boolean toggle.",
    feedback_named_param: "The toggle takes no arguments — use () => not a named param:\nconst handleAuth = () => setIsLoggedIn(prev => !prev)",
    feedback_partial: "Almost — make sure you're using the functional form: setIsLoggedIn(prev => !prev)",
    feedback_wrong: "const handleAuth = () => setIsLoggedIn(prev => !prev)\n\nEmpty parens — no args needed. prev => !prev flips the boolean.",
    expected: `const handleAuth = () => setIsLoggedIn(prev => !prev)`,
    seed_code: `import { useState } from 'react'

export default function StatusCard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Step 2: write handleAuth — flips isLoggedIn with prev => !prev

}`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: `Write the JSX. Use a ternary to show different text:\n• isLoggedIn is true → show "Welcome back!"\n• isLoggedIn is false → show "Please sign in"\n\nJust the text for now — no button yet.`,
    hint: "Ternary syntax inside JSX:\n{isLoggedIn ? 'Welcome back!' : 'Please sign in'}\n\nThe ? separates true case, the : separates false case.",
    example_code: `<p>{isAdmin ? 'Admin Panel' : 'User Dashboard'}</p>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasBadReturn = /return\s*\(\s*\{/.test(ans);
      if (hasBadReturn) return "syntax";
      const hasValidReturn = /return\s*\(/.test(ans);
      const hasTernary = a.includes("?") && a.includes(":");
      const hasIsLoggedIn = a.includes("isloggedin");
      const hasWelcome = a.includes("welcomeback") || a.includes("welcome");
      const hasSignIn = a.includes("signin") || a.includes("sign");
      if (hasValidReturn && hasTernary && hasIsLoggedIn) return "correct";
      if (hasTernary && !hasIsLoggedIn) return "partial_var";
      if (hasIsLoggedIn && !hasTernary) return "partial_ternary";
      if (hasValidReturn) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Ternary inside JSX — condition ? trueOutput : falseOutput. React evaluates this on every render based on current state.",
    feedback_syntax: "Syntax error: return(){ is not valid. Use return ( to wrap JSX.",
    feedback_partial_var: "Good ternary structure — but make sure you're checking isLoggedIn:\n{isLoggedIn ? 'Welcome back!' : 'Please sign in'}",
    feedback_partial_ternary: "isLoggedIn is there — now use a ternary to show different text:\n{isLoggedIn ? 'Welcome back!' : 'Please sign in'}",
    feedback_partial: "Add the ternary inside your return:\n{isLoggedIn ? 'Welcome back!' : 'Please sign in'}",
    feedback_wrong: `return (
  <div>
    <p>{isLoggedIn ? 'Welcome back!' : 'Please sign in'}</p>
  </div>
)`,
    expected: `{isLoggedIn ? 'Welcome back!' : 'Please sign in'}`,
    seed_code: `import { useState } from 'react'

export default function StatusCard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAuth = () => setIsLoggedIn(prev => !prev)

  // Step 3: write JSX with ternary text — no button yet

}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: `In the JSX, add a button below the text. Wire onClick={handleAuth} and use a ternary for the label:\n• isLoggedIn true → label "Logout"\n• isLoggedIn false → label "Login"`,
    hint: "Two ternaries — one for the text, one for the button label:\n<button onClick={handleAuth}>\n  {isLoggedIn ? 'Logout' : 'Login'}\n</button>",
    example_code: `<button onClick={handleFollow}>
  {isFollowing ? 'Unfollow' : 'Follow'}
</button>`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const hasButton = a.includes("<button");
      const hasOnClick = a.includes("onclick={");
      const hasTernaryLabel = a.includes("?") && a.includes(":");
      const hasLogout = a.includes("logout");
      const hasLogin = a.includes("login");
      const hasTextTernary = a.includes("welcomeback") || a.includes("welcome") || a.includes("signin") || a.includes("sign");
      if (hasButton && hasOnClick && hasTernaryLabel && hasLogout && hasLogin) return "correct";
      if (hasButton && !hasOnClick) return "partial_onclick";
      if (hasButton && hasOnClick && !hasTernaryLabel) return "partial_label";
      if (hasButton && hasOnClick && hasTernaryLabel && (!hasLogout || !hasLogin)) return "partial_text";
      return "wrong";
    },
    feedback_correct: "✅ Button wired with onClick + ternary label. Both the message and the button update together on every click.",
    feedback_partial_onclick: "Button is there — but it needs onClick={handleAuth} to actually trigger the toggle.",
    feedback_partial_label: "onClick is wired — now make the label dynamic:\n{isLoggedIn ? 'Logout' : 'Login'}",
    feedback_partial_text: "Almost — use 'Logout' and 'Login' as the two labels:\n{isLoggedIn ? 'Logout' : 'Login'}",
    feedback_wrong: `<button onClick={handleAuth}>\n  {isLoggedIn ? 'Logout' : 'Login'}\n</button>`,
    expected: `<button onClick={handleAuth}>\n  {isLoggedIn ? 'Logout' : 'Login'}\n</button>`,
    seed_code: `import { useState } from 'react'

export default function StatusCard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAuth = () => setIsLoggedIn(prev => !prev)

  // Step 4: add button with onClick + ternary label
  return (
    <div>
      <p>{isLoggedIn ? 'Welcome back!' : 'Please sign in'}</p>
    </div>
  )
}`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "In the JSX, add the wired button with a ternary label (Logout/Login), then submit the full component.",
    hint: "Full structure: useState(false) → handleAuth with prev => !prev → return with ternary text paragraph + wired button with ternary label.",
    example_code: `import { useState } from 'react'

export default function FollowButton() {
  const [isFollowing, setIsFollowing] = useState(false)

  const toggle = () => setIsFollowing(prev => !prev)

  return (
    <div>
      <p>{isFollowing ? 'Following!' : 'Not following'}</p>
      <button onClick={toggle}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  )
}`,
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s/g, "");
      const checks = [
        a.includes("import") && a.includes("usestate"),
        a.includes("(false)"),
        a.includes("prev=>!prev") || a.includes("prev =>!prev") || a.includes("prev => !prev"),
        (a.match(/\?/g) || []).length >= 2,
        a.includes("<button") && a.includes("onclick={"),
        a.includes("<p>"),
        a.includes("exportdefaultfunction") || a.includes("export default function"),
      ];
      const passed = checks.filter(Boolean).length;
      if (passed >= 6) return "correct";
      if (passed >= 4) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Complete. useState(false) → prev => !prev toggle → two ternaries rendering different text and button label. That's conditional rendering with ternary.",
    feedback_partial: "Almost — check: useState(false), prev => !prev in toggle, two ternaries (one for text, one for button label), onClick wired to the button.",
    feedback_wrong: "Structure: import → useState(false) → toggle fn → return with ternary paragraph + ternary button.",
    expected: `import { useState } from 'react'

export default function StatusCard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAuth = () => setIsLoggedIn(prev => !prev)

  return (
    <div>
      <p>{isLoggedIn ? 'Welcome back!' : 'Please sign in'}</p>
      <button onClick={handleAuth}>
        {isLoggedIn ? 'Logout' : 'Login'}
      </button>
    </div>
  )
}`,
    seed_code: `import { useState } from 'react'

export default function StatusCard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAuth = () => setIsLoggedIn(prev => !prev)

  return (
    <div>
      <p>{isLoggedIn ? 'Welcome back!' : 'Please sign in'}</p>
    </div>
  )
}`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Boolean state", id: "step1" },
  { label: "Step 2 — Toggle fn", id: "step2" },
  { label: "Step 3 — Ternary text", id: "step3" },
  { label: "Step 4 — Ternary button", id: "step4" },
  { label: "Step 5 — Full", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 5, title: "Conditional Rendering with Ternary", shortName: "TERNARY" });

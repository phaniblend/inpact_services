import createINPACTEngine from "../inpact_engine_shared";

// ─── helpers ────────────────────────────────────────────────────────────────

function isDeclaredAtModuleScope(raw, declarationStartIndex) {
  if (!Number.isFinite(declarationStartIndex) || declarationStartIndex < 0) return false;
  const firstComponentIndex = raw.search(
    /(?:const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\(|function\s+[A-Z][A-Za-z0-9_]*\s*\()/m,
  );
  if (firstComponentIndex < 0) return true;
  return declarationStartIndex < firstComponentIndex;
}

// ─── evaluators — Lesson 1: interface → typed shell → card JSX → App (1–2 cards) ─

// Step 1 — module-scope interface pattern (four string fields; names are not enforced)
function evalLesson1Step1(answer) {
  const raw = String(answer || "");
  const m = raw.match(/interface\s+[A-Za-z_][A-Za-z0-9_]*\s*\{([\s\S]*?)\}/m);
  if (!m || m.index == null) return "wrong";
  const body = m[1] || "";
  const stringFieldCount = [...body.matchAll(/\b[A-Za-z_][A-Za-z0-9_]*\s*:\s*string\b/gm)].length;
  const moduleScoped = isDeclaredAtModuleScope(raw, m.index);
  if (stringFieldCount >= 4 && moduleScoped) return "correct";
  if (stringFieldCount >= 2 && moduleScoped) return "partial";
  return "wrong";
}

// Step 2 — typed `GroceryItemCard` destructuring + `GroceryItemCardProps`; return empty Fragment only (no App)
function evalLesson1Step2(answer) {
  const raw = String(answer || "");
  const hasApp = /const\s+App\b|function\s+App\b/.test(raw);
  const hasSig =
    /const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\(\s*\{[\s\S]*?\}\s*:\s*[A-Za-z_][A-Za-z0-9_]*\s*\)(\s*:\s*(?:JSX\.Element|React\.ReactElement|React\.JSX\.Element))?\s*=>/m.test(
      raw,
    );
  const hasImg = /<img\b/i.test(raw);
  const hasDiv = /<div\b/i.test(raw);
  const hasEmptyFragment =
    /return\s*<\s*>\s*<\s*\/\s*>/m.test(raw) ||
    /return\s*\(\s*<\s*>\s*<\s*\/\s*>\s*\)/m.test(raw) ||
    (/return\s*\(?/m.test(raw) && /<>\s*<\/>/m.test(raw)) ||
    /<React\.Fragment>\s*<\/React\.Fragment>/.test(raw) ||
    /return\s*\(\s*<React\.Fragment>\s*<\/React\.Fragment>\s*\)/.test(raw);
  if (hasSig && hasEmptyFragment && !hasImg && !hasDiv && !hasApp) return "correct";
  if (hasSig && hasEmptyFragment && hasApp) return "partial";
  if (hasSig && !hasApp && (hasImg || hasDiv)) return "partial";
  if (hasSig && !hasApp) return "partial";
  return "wrong";
}

function extractTypedCardShape(raw) {
  const sig =
    raw.match(
      /const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*\(\s*\{([\s\S]*?)\}\s*:\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)(\s*:\s*(?:JSX\.Element|React\.ReactElement|React\.JSX\.Element))?\s*=>/m,
    ) || null;
  if (!sig) return null;

  const componentName = sig[1];
  const destructuredRaw = sig[2] || "";
  const propsTypeName = sig[3];

  const destructuredNames = destructuredRaw
    .split(",")
    .map((part) =>
      part
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/g, "")
        .trim(),
    )
    .map((part) => part.replace(/[:=].*$/, "").trim())
    .map((part) => part.replace(/^\.\.\./, "").trim())
    .filter((part) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(part));

  const ifaceRe = new RegExp(`interface\\s+${propsTypeName}\\s*\\{([\\s\\S]*?)\\}`, "m");
  const ifaceMatch = raw.match(ifaceRe);
  const ifaceBody = ifaceMatch?.[1] || "";
  const interfaceFields = [...ifaceBody.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*:\s*string\b/gm)].map((m) => m[1]);

  return { componentName, propsTypeName, destructuredNames, interfaceFields };
}

/** Card body checks — tolerate learner-chosen names; enforce internal consistency. */
function lesson1CardBodyFromPropsOk(raw) {
  const shape = extractTypedCardShape(raw);
  if (!shape) return false;

  const destructuredSet = new Set(shape.destructuredNames);
  const interfaceSet = new Set(shape.interfaceFields);
  const hasEnoughProps = shape.destructuredNames.length >= 4;
  const signatureMatchesInterface =
    shape.interfaceFields.length >= 4 &&
    shape.destructuredNames.every((name) => interfaceSet.has(name));

  const srcVar = raw.match(/<img\b[^>]*\bsrc\s*=\s*\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}/m)?.[1] || null;
  const altVar = raw.match(/<img\b[^>]*\balt\s*=\s*\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}/m)?.[1] || null;
  const h2Var =
    raw.match(/<h2\b[^>]*>[\s\S]*?\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}[\s\S]*?<\/h2>/im)?.[1] || null;
  const pVars = [...raw.matchAll(/<p\b[^>]*>[\s\S]*?\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}[\s\S]*?<\/p>/gim)].map((m) => m[1]);

  const hasDivShell = /<div\b/i.test(raw) && /<\/div>/i.test(raw);
  const usesDestructuredBindings =
    Boolean(srcVar && altVar && h2Var) &&
    destructuredSet.has(srcVar) &&
    destructuredSet.has(altVar) &&
    destructuredSet.has(h2Var) &&
    pVars.length >= 2 &&
    pVars.every((name) => destructuredSet.has(name));

  return hasEnoughProps && signatureMatchesInterface && hasDivShell && usesDestructuredBindings;
}

// Step 3 — full card JSX from props (no App)
function evalLesson1Step3(answer) {
  const raw = String(answer || "");
  const hasApp = /const\s+App\b|function\s+App\b/.test(raw);
  const cardOk = lesson1CardBodyFromPropsOk(raw);
  if (cardOk && !hasApp) return "correct";
  if (cardOk && hasApp) return "partial";
  if (!hasApp && /const\s+[A-Z][A-Za-z0-9_]*\b/.test(raw)) return "partial";
  return "wrong";
}

// Step 4 — `App` shell + two `<GroceryItemCard />` with props + default export
function evalLesson1Step4(answer) {
  const raw = String(answer || "");
  const cardOk = lesson1CardBodyFromPropsOk(raw);
  const shape = extractTypedCardShape(raw);
  const hasApp = /const\s+App\b|function\s+App\b/.test(raw);
  const hasExport =
    /export\s+default\s+App\b/m.test(raw) ||
    /export\s+default\s+function\s+App\b/m.test(raw) ||
    /export\s+default\s+const\s+App\b/m.test(raw);
  const hasHeader = /<header\b/i.test(raw) && /<h1\b/i.test(raw);
  const cardTagRe =
    shape?.componentName
      ? new RegExp(`<${shape.componentName}\\b`, "g")
      : /<[A-Z][A-Za-z0-9_]*\b/g;
  const cardMatches = [...raw.matchAll(cardTagRe)];
  const nCards = cardMatches.length;
  const passesSampleData =
    shape?.interfaceFields?.length >= 4
      ? shape.interfaceFields.every((field) => new RegExp(`\\b${field}\\s*=`, "m").test(raw))
      : /[A-Za-z_][A-Za-z0-9_]*\s*=/.test(raw);
  if (cardOk && hasApp && hasExport && hasHeader && nCards >= 2 && passesSampleData) return "correct";
  if (cardOk && hasApp && hasExport && hasHeader && nCards === 1 && passesSampleData) return "partial";
  if (cardOk && hasApp && (!hasExport || !hasHeader)) return "partial";
  if (hasApp && nCards >= 1) return "partial";
  return "wrong";
}

// ─── nodes ───────────────────────────────────────────────────────────────────

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #1 · UI building blocks",
      title: "First inventory screen",
      body: "",
      intro_gate_mcq: {
        scenario:
          "A restaurant owner wants to stop wasting food. They need to glance at the screen and immediately see what is in the kitchen — item name, how much is left, and when it expires.",
        prompt: "Where is the smartest place to start building this screen?",
        options: [
          "Lock every screen in the app to final copy and branding before modeling how one row looks",
          "Build one card that shows a single item",
          "Wait until every backend endpoint exists before rendering any UI for the kitchen",
        ],
        correct: "Build one card that shows a single item",
        footer:
          "Next you will skim the learning objectives, then work through four guided steps: a props interface, a typed component shell, full card JSX, then an `App` shell that mounts two cards.",
      },
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Declare a TypeScript interface for a React component's props",
      "Define a typed arrow-function component that destructures and annotates its props",
      "Embed prop values into JSX using curly-brace expressions",
      "Compose and export a parent component that mounts a child with sample props",
    ],
  },

  // ── Step 1 — props interface (module scope) ─────────────────────────────────
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 4",
    paal:
    "Write a props contract (interface) at the top of the file. \nName it using PascalCase and end it with the suffix Props — for example, \`ShipmentCardProps\` or \`ProductItemProps\`. Type all four fields this card needs as strings. \nEach field name should use camelCase for compound words — so \`imageLink\`, not \`image_link\` or \`imagelink\`.",
    hint:
      "Focus on the checklist, not JSX yet: one named props contract with four required text fields. The syntax pattern is shown in the example panel.",
    example_code: `interface MenuRowProps {
  label: string;
  priceText: string;
}`,
    think_prompt: `You are building a grocery app. You hardcoded an item's display name as \`itemName\` in one place and accidentally type \`itenName\` (a typo) somewhere else. The app compiles, you deploy it — and the owner calls you because item names are blank on screen.

You just spent an hour debugging a typo that a clear data contract could have flagged instantly while coding in TypeScript.

Which of these gives you that contract?`,
    mc_options: [
      "A plain JavaScript object whose values are the literal word `string` — no compile-time checking, just a convention",
      "A TypeScript `interface` that lists each field name and its type — a contract the compiler enforces at every use",
      "Typing the entire props bundle as one plain `string` so any text counts as valid",
    ],
    mc_correct_option:
      "A TypeScript `interface` that lists each field name and its type — a contract the compiler enforces at every use",
    mc_anchor:
      "An `interface` is TypeScript's checklist. The moment a field name is misspelled or missing, the compiler flags it — before the app runs, before you deploy, before the owner calls.",
    mc_think_feedback_correct:
      "Right — the interface is the compile-time contract; typos on prop names surface in the editor instead of as silent blanks.",
    mc_think_feedback_incorrect:
      "Look for the option that names a single type checklist (`interface`) the compiler can enforce at every callsite.",
    why_this_matters:
      "This is the first half of every typed component you will ever write: name the data the component needs before you write a single line of JSX. Get this right and an entire class of bugs becomes impossible.",
    answer_keywords: ["interface", "string"],
    evaluate: evalLesson1Step1,
    seed_code: "",
    starter_code: "// declare your props interface here (four string fields)",
    feedback_correct:
      "Yes — a typed checklist the compiler can verify. No more blank fields from a silent typo.",
    feedback_partial:
      "Close — you have the right idea. Keep it as a module-scope interface and make sure it includes four fields typed as `string`.",
    feedback_wrong:
      "Create one interface at module scope with four properties, and type each property as `string`. We are checking the typed pattern here, not strict field naming.",
    expected: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}`,
  },

  // ── Step 2 — typed component shell, empty Fragment (no App) ─────────────────
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 4",
    paal:
      "Now define the component itself. Write a capitalised arrow function, destructure all four props in the parameter list, and annotate that parameter object with the interface you just declared. Return an empty Fragment `<></>` for now — the JSX comes in the next step.",
    hint: "Shape to aim for: `const YourComponent = ({ …props… }: YourPropsInterface) => { return <></>; }` — the important part is destructuring plus the interface annotation.",
    example_code: `const MenuRow = ({ label, priceText }: MenuRowProps) => {
  return <></>;
};`,
    think_prompt: `The data is fetched. Your app now has a list of grocery items — each grocery item's data is an object in the shape your interface defined. The app loops through the list and renders your card once per item.

But how does each item's data actually get into the card?

In React, you pass data into a component the same way you set attributes on an HTML tag — right where you use it:

\`\`\`html
<GroceryItemCard
  name="Roma tomatoes"
  imageUrl="https://images.unsplash.com/..."
  quantityAvailable="2 cases"
  expiresSummary="Use by Friday"
/>
\`\`\`

These are called **props** — the data a component receives from the parent component that renders it.

Read each line in two parts:
- The left side (\`name\`, \`imageUrl\`, \`quantityAvailable\`, \`expiresSummary\`) is the **prop name**. These names come from the card's props contract (interface) and define what the card expects.
- The right side (\`"Roma tomatoes"\`, \`"2 cases"\`, etc.) is the **prop value**. These values are supplied by the parent at the place where it renders the card.

So the contract defines the names, and the parent fills in the values for each card instance.

Now the question is: how should your component's parameter list be written so each prop becomes a local variable directly — no writing \`props.name\` every time — and TypeScript still enforces the contract from your interface?

**Which parameter style achieves both?**`,
    mc_options: [
      "A single parameter `(props)` with no type annotation — props are accessible but TypeScript cannot verify them",
      "Destructure each field in the parameter list and annotate the object with your interface — props become local variables and TypeScript enforces the contract",
      "Omit the parameter list entirely and let TypeScript figure it out from JSX",
    ],
    mc_correct_option:
      "Destructure each field in the parameter list and annotate the object with your interface — props become local variables and TypeScript enforces the contract",
    mc_anchor:
      "Destructuring pulls each field into its own variable. The interface annotation ties the whole bundle to the contract you declared — so a missing or mistyped prop is caught before the app runs.",
    mc_think_feedback_correct:
      "Right — destructure for ergonomics, annotate with your interface so every callsite is checked.",
    mc_think_feedback_incorrect:
      "Look for the option that combines destructuring in the parameter list with typing that bundle as your props interface.",
    why_this_matters:
      "This two-part signature — destructured props, typed with an interface — is the pattern every React+TS component starts with. Get comfortable with it here and every future component will feel familiar.",
    answer_keywords: [
      "GroceryItemCard",
      "GroceryItemCardProps",
      "=>",
      "name",
      "imageUrl",
      "quantityAvailable",
      "expiresSummary",
      "return",
      "<>",
    ],
    evaluate: evalLesson1Step2,
    seed_code: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}`,
    starter_code: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

// define your component here — destructure props, annotate with the interface, return <></>`,
    feedback_correct:
      "Perfect — typed, destructured props and a Fragment placeholder. The hardest part of a React+TS component is already done.",
    feedback_partial:
      "Check that the component name is capitalised, all four props are destructured in the parameter list, the bundle is annotated with your interface, and the body returns an empty Fragment.",
    feedback_wrong:
      "Write a capitalised arrow function whose parameter list destructures the four fields and annotates that object with your props interface, then return `<></>` inside the body.",
    expected: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

const GroceryItemCard = ({
  name,
  imageUrl,
  quantityAvailable,
  expiresSummary,
}: GroceryItemCardProps) => {
  return <></>;
};`,
  },

  // ── Step 3 — replace Fragment with full card JSX (still no App) ─────────────
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 4",
    paal:
      "Replace the empty Fragment with the real row: return a `div` wrapping `img` (`src={imageUrl}`, `alt={name}`), `h2` with `{name}`, and two `p` lines using `{quantityAvailable}` and `{expiresSummary}`.",
    hint: "Curly braces in JSX mean “evaluate JavaScript here.” Keep the same destructured parameter list and `GroceryItemCardProps` annotation from Step 2.",
    example_code: `const MenuRow = ({ label, priceText }: MenuRowProps) => {
  return (
    <div>
      <p>{label}</p>
      <p>{priceText}</p>
    </div>
  );
};`,
    think_prompt:
      "Your ShipmentCardProps has a field called name. Inside your JSX, how do you display its value — not the word `name`, but what's actually inside it?",
    mc_options: [
      "`<h2>name</h2>`",
      "`<h2>{name}</h2>`",
      "`<h2 ${name}>`",
    ],
    mc_correct_option: "`<h2>{name}</h2>`",
    mc_anchor:
      "Braces evaluate JavaScript in JSX — that is how props reach the screen.",
    mc_think_feedback_correct:
      "Exactly — `{name}` is the live channel from props to UI.",
    mc_think_feedback_incorrect:
      "Remember: plain text inside tags stays literal; braces read variables.",
    why_this_matters:
      "Every field you typed in your props contract is now a live value passed in by the parent. Curly braces {} are the bridge — they tell JSX to step out of markup mode and read a real value. \nThis is called interpolation: embedding a variable's value directly inside your markup, \nso the UI reflects what the parent actually sent, not a hardcoded word.",
    answer_keywords: [
      "GroceryItemCard",
      "GroceryItemCardProps",
      "{name}",
      "{imageUrl}",
      "{quantityAvailable}",
      "{expiresSummary}",
    ],
    evaluate: evalLesson1Step3,
    seed_code: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

const GroceryItemCard = ({
  name,
  imageUrl,
  quantityAvailable,
  expiresSummary,
}: GroceryItemCardProps) => {
  return <></>;
};`,
    starter_code: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

const GroceryItemCard = ({
  name,
  imageUrl,
  quantityAvailable,
  expiresSummary,
}: GroceryItemCardProps) => {
  return (
    <div>
      <img src={imageUrl} alt={name} />
      <h2>{name}</h2>
      <p>Available: {quantityAvailable}</p>
      <p>{expiresSummary}</p>
    </div>
  );
};

// Add the App component below.
// One .tsx file can contain multiple components (for example: GroceryItemCard and App).`,

// Add the App component below.
// One .tsx file can contain multiple components (for example: GroceryItemCard and App).`,
    feedback_correct:
      "The card markup is wired to props — the row is ready for `App` to mount next.",
    feedback_partial:
      "Keep your component typed with your props interface, and bind `img` (`src` / `alt`), `h2`, and both `p` lines to the same destructured prop names you already declared.",
    feedback_wrong:
      "Return a `div` containing `img`, `h2`, and two `p` elements, then bind those elements to your destructured props using `{...}` expressions.",
    expected: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

const GroceryItemCard = ({
  name,
  imageUrl,
  quantityAvailable,
  expiresSummary,
}: GroceryItemCardProps) => {
  return (
    <div>
      <img src={imageUrl} alt={name} />
      <h2>{name}</h2>
      <p>Available: {quantityAvailable}</p>
      <p>{expiresSummary}</p>
    </div>
  );
};`,
  },

  // ── Step 4 — App: shell + two `<GroceryItemCard />` + default export ─────────
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 4",
    paal:
      "Add the `App` component: return a `div` with `header` / `h1`, then mount your card component twice with different sample values for all four props on each. End with `export default App` so the preview mounts `App` as the root. (One card is a good warm-up — you need two to pass this step.)",
    hint:
      "String attributes on JSX (`name=\"…\"`) are fine. TypeScript should error if you omit a required prop — that is the interface from Step 1 paying rent.",
    example_code: `const App = () => (
  <div>
    <header><h1>Kitchen board</h1></header>
    <MenuRow label="Espresso" priceText="$3.50" />
    <MenuRow label="Cold brew" priceText="$4.25" />
  </div>
);

export default App;`,
    think_prompt:
      "Who should own the page title and the decision to mount your card component — the card itself, or the `App` component?",
    mc_options: [
      "The card should import and render the App layout",
      "The `App` component composes the shell and mounts the card component",
      "Neither — exports alone decide what renders",
    ],
    mc_correct_option: "The `App` component composes the shell and mounts the card component",
    mc_anchor:
      "Callers compose screens; presentational pieces stay focused. Here `App` is that caller — twice, with different props, to prove reuse.",
    mc_think_feedback_correct:
      "Right — `App` is the composition root for this file: header chrome plus your cards.",
    mc_think_feedback_incorrect:
      "Think composition: the `App` component builds the page frame and places children inside it.",
    why_this_matters:
      "Lists and dashboards are mostly “the same row, different data.” Mounting the same component twice proves you have a reusable unit instead of a one-off paste.",
    answer_keywords: ["App", "header", "h1", "GroceryItemCard", "export", "default"],
    evaluate: evalLesson1Step4,
    seed_code: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

const GroceryItemCard = ({
  name,
  imageUrl,
  quantityAvailable,
  expiresSummary,
}: GroceryItemCardProps) => {
  return (
    <div>
      <img src={imageUrl} alt={name} />
      <h2>{name}</h2>
      <p>Available: {quantityAvailable}</p>
      <p>{expiresSummary}</p>
    </div>
  );
};`,
    starter_code: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

const GroceryItemCard = ({
  name,
  imageUrl,
  quantityAvailable,
  expiresSummary,
}: GroceryItemCardProps) => {
  return (
    <div>
      <img src={imageUrl} alt={name} />
      <h2>{name}</h2>
      <p>Available: {quantityAvailable}</p>
      <p>{expiresSummary}</p>
    </div>
  );
};

// Add the App component below.
// One .tsx file can contain multiple components (for example: GroceryItemCard and App).`,
    feedback_correct:
      "Two cards, one `App`, zero duplicated markup definitions. That is the reuse win.",
    feedback_partial:
      "Compose `App` with `header` + `h1`, add `export default App`, and mount the same card component you defined above twice, each with different prop values.",
    feedback_wrong:
      "Pattern: `App` returns a page shell (`div` with `header` / `h1`), mounts two instances of your existing card component with distinct props, and ends with `export default App`.",
    expected: `interface GroceryItemCardProps {
  name: string;
  imageUrl: string;
  quantityAvailable: string;
  expiresSummary: string;
}

const GroceryItemCard = ({
  name,
  imageUrl,
  quantityAvailable,
  expiresSummary,
}: GroceryItemCardProps) => {
  return (
    <div>
      <img src={imageUrl} alt={name} />
      <h2>{name}</h2>
      <p>Available: {quantityAvailable}</p>
      <p>{expiresSummary}</p>
    </div>
  );
};

const App = () => (
  <div>
    <header>
      <h1>Supply watch</h1>
    </header>
    <GroceryItemCard
      name="Roma tomatoes"
      imageUrl="https://images.unsplash.com/photo-1546094096-0df3bcbbb700?w=400&q=80"
      quantityAvailable="2 cases (est.)"
      expiresSummary="Use by Friday — color turning fast"
    />
    <GroceryItemCard
      name="Fresh basil"
      imageUrl="https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&q=80"
      quantityAvailable="3 bunches"
      expiresSummary="Peak condition — use within 2 days"
    />
  </div>
);

export default App;`,
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
  { label: "Step 4", id: "step4" },
];

const inpactTs01Engine = createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 1,
  title: "First inventory screen — title + grocery card",
  shortName: "REST — FIRST SCREEN",
});

export default inpactTs01Engine;

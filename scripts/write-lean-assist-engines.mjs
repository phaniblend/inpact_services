/**
 * Write compact, valid Assist Me engines for RIM tags (no Gemini).
 * Safe for eager import.meta.glob — validated via assertValidModule.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { assertValidModule } from "../src/id-module/generateModule.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "../src/engines/assist");

const MODULES = [
  {
    tag: "resource-list-and-form-ui",
    title: "Resource List and Form UI",
    shortName: "List + Form UI",
    concept:
      "Build screens that list a resource and create or edit records with controlled forms wired to CRUD endpoints.",
    steps: [
      {
        paal: "Start with a component that will own list and form state for purchases.",
        think: "Which of these correctly defines a React functional component that returns JSX?",
        why: "Every screen starts as a component — the shell that will hold list and form state.",
        wrong: "Not quite — you need a function that returns JSX.Element (a component), not a class or bare assignment.",
        hint: "Define a functional component named PurchaseLog that returns a root div.",
        seed: "",
        starter: `function PurchaseLog(): JSX.Element {
  // Your code here
}
`,
        expected: `function PurchaseLog(): JSX.Element {
  return (
    <div className="purchase-log">
      {/* list and form go here */}
    </div>
  );
}
`,
        keywords: ["function", "PurchaseLog", "return", "div"],
        mc: [
          "function PurchaseLog(): JSX.Element { return <div />; }",
          "const PurchaseLog = class {}",
          "PurchaseLog = () => null",
        ],
        correct: "function PurchaseLog(): JSX.Element { return <div />; }",
      },
      {
        paal: "Track the list of purchases in component state so the UI can re-render after CRUD.",
        think: "How do you keep a list of purchases in React so the UI updates when it changes?",
        why: "List data must live in state — otherwise add/edit/delete won't re-render the screen.",
        wrong: "Not quite — use useState with a typed array, not a plain let or a bare fetch call.",
        hint: "Use useState with an array typed as Purchase[].",
        seed: `import { useState } from "react";

interface Purchase {
  id: string;
  ingredient: string;
  quantity: number;
}

function PurchaseLog(): JSX.Element {
  return <div className="purchase-log" />;
}
`,
        starter: `import { useState } from "react";

interface Purchase {
  id: string;
  ingredient: string;
  quantity: number;
}

function PurchaseLog(): JSX.Element {
  // add purchases state
  return <div className="purchase-log" />;
}
`,
        expected: `import { useState } from "react";

interface Purchase {
  id: string;
  ingredient: string;
  quantity: number;
}

function PurchaseLog(): JSX.Element {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  return <div className="purchase-log" />;
}
`,
        keywords: ["useState", "purchases", "setPurchases"],
        mc: [
          "const [purchases, setPurchases] = useState<Purchase[]>([]);",
          "let purchases = [];",
          "const purchases = fetch('/purchases');",
        ],
        correct: "const [purchases, setPurchases] = useState<Purchase[]>([]);",
      },
      {
        paal: "Render each purchase in the list with a stable key.",
        think: "How should you render a list of purchases so React can track each row?",
        why: "Keys tell React which row is which when the list changes after CRUD.",
        wrong: "Not quite — map each purchase to an element and set key={purchase.id}.",
        hint: "Map over purchases and use purchase.id as the key.",
        seed: `import { useState } from "react";

interface Purchase {
  id: string;
  ingredient: string;
  quantity: number;
}

function PurchaseLog(): JSX.Element {
  const [purchases] = useState<Purchase[]>([
    { id: "1", ingredient: "flour", quantity: 2 },
  ]);
  return (
    <div className="purchase-log">
      {/* render list */}
    </div>
  );
}
`,
        starter: `import { useState } from "react";

interface Purchase {
  id: string;
  ingredient: string;
  quantity: number;
}

function PurchaseLog(): JSX.Element {
  const [purchases] = useState<Purchase[]>([
    { id: "1", ingredient: "flour", quantity: 2 },
  ]);
  return (
    <div className="purchase-log">
      {/* render list */}
    </div>
  );
}
`,
        expected: `import { useState } from "react";

interface Purchase {
  id: string;
  ingredient: string;
  quantity: number;
}

function PurchaseLog(): JSX.Element {
  const [purchases] = useState<Purchase[]>([
    { id: "1", ingredient: "flour", quantity: 2 },
  ]);
  return (
    <div className="purchase-log">
      <ul>
        {purchases.map((purchase) => (
          <li key={purchase.id}>
            {purchase.ingredient}: {purchase.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
        keywords: ["map", "key", "purchase.id"],
        mc: [
          "purchases.map((purchase) => <li key={purchase.id}>{purchase.ingredient}</li>)",
          "purchases.forEach((p) => <li>{p.ingredient}</li>)",
          "<li>{purchases}</li>",
        ],
        correct: "purchases.map((purchase) => <li key={purchase.id}>{purchase.ingredient}</li>)",
      },
      {
        paal: "Add a controlled ingredient input so the form value lives in React state.",
        think: "Which input pattern keeps the typed value in React state (controlled input)?",
        why: "Controlled inputs make validation and submit use the same source of truth as the UI.",
        wrong: "Not quite — bind both value={...} and onChange that updates state.",
        hint: "Bind value and onChange to ingredient state.",
        seed: `import { useState } from "react";

function PurchaseForm(): JSX.Element {
  // controlled input
  return <form />;
}
`,
        starter: `import { useState } from "react";

function PurchaseForm(): JSX.Element {
  // controlled input
  return <form />;
}
`,
        expected: `import { useState } from "react";

function PurchaseForm(): JSX.Element {
  const [ingredient, setIngredient] = useState("");
  return (
    <form>
      <input
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
        placeholder="Ingredient"
      />
    </form>
  );
}
`,
        keywords: ["value", "onChange", "setIngredient"],
        mc: [
          "<input value={ingredient} onChange={(e) => setIngredient(e.target.value)} />",
          "<input defaultValue={ingredient} />",
          "<input onClick={setIngredient} />",
        ],
        correct: "<input value={ingredient} onChange={(e) => setIngredient(e.target.value)} />",
      },
    ],
  },
  {
    tag: "resource-list-and-detail-frontend",
    title: "Resource List and Detail Frontend",
    shortName: "List + Detail",
    concept: "Browse a resource list and open a detail view with related activity.",
    steps: [
      {
        paal: "Create an InventoryBoard component that will host list and detail views.",
        think: "Which snippet correctly defines InventoryBoard as a typed React component?",
        why: "The board is the shell that will switch between list and detail.",
        wrong: "Not quite — use a function component that returns JSX.Element.",
        hint: "Return a root div from a typed functional component.",
        seed: "",
        starter: `function InventoryBoard(): JSX.Element {
  // Your code here
}
`,
        expected: `function InventoryBoard(): JSX.Element {
  return <div className="inventory-board" />;
}
`,
        keywords: ["function", "InventoryBoard", "return"],
        mc: [
          "function InventoryBoard(): JSX.Element { return <div />; }",
          "class InventoryBoard {}",
          "InventoryBoard()",
        ],
        correct: "function InventoryBoard(): JSX.Element { return <div />; }",
      },
      {
        paal: "Keep selectedIngredientId in state so clicking a row can open detail.",
        think: "How do you store which ingredient is selected (or none yet)?",
        why: "Selection state drives whether the learner sees the list or the detail panel.",
        wrong: "Not quite — use useState<string | null>(null) for an optional selection.",
        hint: "useState with string | null.",
        seed: `import { useState } from "react";

function InventoryBoard(): JSX.Element {
  return <div className="inventory-board" />;
}
`,
        starter: `import { useState } from "react";

function InventoryBoard(): JSX.Element {
  // selection state
  return <div className="inventory-board" />;
}
`,
        expected: `import { useState } from "react";

function InventoryBoard(): JSX.Element {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  return <div className="inventory-board" />;
}
`,
        keywords: ["useState", "selectedIngredientId"],
        mc: [
          "const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);",
          "let selectedIngredientId = null;",
          "const selectedIngredientId = document.getElementById('id');",
        ],
        correct: "const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);",
      },
      {
        paal: "Show either the list or the detail panel based on selection.",
        think: "Which pattern shows detail when an id is selected, otherwise the list?",
        why: "List-to-detail navigation is just conditional UI from selection state.",
        wrong: "Not quite — use a ternary: selected id ? detail : list.",
        hint: "Use a ternary: selected id present means detail, otherwise list.",
        seed: `import { useState } from "react";

function InventoryBoard(): JSX.Element {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  return (
    <div className="inventory-board">
      {/* conditional view */}
    </div>
  );
}
`,
        starter: `import { useState } from "react";

function InventoryBoard(): JSX.Element {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  return (
    <div className="inventory-board">
      {/* conditional view */}
    </div>
  );
}
`,
        expected: `import { useState } from "react";

function InventoryBoard(): JSX.Element {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  return (
    <div className="inventory-board">
      {selectedIngredientId ? (
        <div className="detail">Detail for {selectedIngredientId}</div>
      ) : (
        <div className="list">Ingredient list</div>
      )}
    </div>
  );
}
`,
        keywords: ["selectedIngredientId", "?", ":"],
        mc: [
          "selectedIngredientId ? <div className=\"detail\" /> : <div className=\"list\" />",
          "if selectedIngredientId show detail",
          "selectedIngredientId && list && detail",
        ],
        correct: "selectedIngredientId ? <div className=\"detail\" /> : <div className=\"list\" />",
      },
      {
        paal: "Render an empty state when the ingredient list has no rows.",
        think: "What should you check before mapping ingredients to rows?",
        why: "Empty states tell the user there is nothing to show yet — better than a blank list.",
        wrong: "Not quite — if ingredients.length === 0, return an empty message instead of mapping.",
        hint: "Check ingredients.length === 0 before mapping.",
        seed: `interface Ingredient { id: string; name: string; quantity: number; }

function IngredientList({ ingredients }: { ingredients: Ingredient[] }): JSX.Element {
  // empty or list
  return <div />;
}
`,
        starter: `interface Ingredient { id: string; name: string; quantity: number; }

function IngredientList({ ingredients }: { ingredients: Ingredient[] }): JSX.Element {
  // empty or list
  return <div />;
}
`,
        expected: `interface Ingredient { id: string; name: string; quantity: number; }

function IngredientList({ ingredients }: { ingredients: Ingredient[] }): JSX.Element {
  if (ingredients.length === 0) {
    return <p className="empty">No ingredients yet</p>;
  }
  return (
    <ul>
      {ingredients.map((item) => (
        <li key={item.id}>{item.name}: {item.quantity}</li>
      ))}
    </ul>
  );
}
`,
        keywords: ["length", "empty", "map"],
        mc: [
          "if (ingredients.length === 0) return <p>No ingredients yet</p>;",
          "ingredients || <p>empty</p>",
          "return null always",
        ],
        correct: "if (ingredients.length === 0) return <p>No ingredients yet</p>;",
      },
    ],
  },
  {
    tag: "form-submit-and-adjustment",
    title: "Form Submit and Inventory Adjustment",
    shortName: "Adjust Form",
    concept: "Submit a form that adjusts a numeric quantity with validation and feedback.",
    steps: [
      {
        paal: "Create AdjustForm with local state for the delta amount.",
        think: "How do you hold the numeric adjustment amount in React state?",
        why: "The delta lives in state so the input and submit handler share one value.",
        wrong: "Not quite — use useState(0) for a number, not a bare var or prompt().",
        hint: "useState for a number starting at 0.",
        seed: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  return <form />;
}
`,
        starter: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  return <form />;
}
`,
        expected: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  const [delta, setDelta] = useState(0);
  return <form />;
}
`,
        keywords: ["useState", "delta", "setDelta"],
        mc: [
          "const [delta, setDelta] = useState(0);",
          "var delta;",
          "const delta = prompt('delta');",
        ],
        correct: "const [delta, setDelta] = useState(0);",
      },
      {
        paal: "Bind a number input to delta with onChange parsing.",
        think: "How do you keep a number input controlled and update delta from the typed value?",
        why: "Number inputs still emit strings — parse them when updating state.",
        wrong: "Not quite — use value={delta} and onChange that calls setDelta(Number(...)).",
        hint: "Use Number(e.target.value) or parseFloat when updating state.",
        seed: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  const [delta, setDelta] = useState(0);
  return <form><input type="number" /></form>;
}
`,
        starter: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  const [delta, setDelta] = useState(0);
  return <form><input type="number" /></form>;
}
`,
        expected: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  const [delta, setDelta] = useState(0);
  return (
    <form>
      <input
        type="number"
        value={delta}
        onChange={(e) => setDelta(Number(e.target.value))}
      />
    </form>
  );
}
`,
        keywords: ["value", "onChange", "Number"],
        mc: [
          "onChange={(e) => setDelta(Number(e.target.value))}",
          "onChange={setDelta}",
          "onSubmit={delta}",
        ],
        correct: "onChange={(e) => setDelta(Number(e.target.value))}",
      },
      {
        paal: "Reject zero adjustments before calling the API.",
        think: "What should onSubmit do if the user enters a zero adjustment?",
        why: "Validate before the network call — zero adjustments waste an API round-trip.",
        wrong: "Not quite — if delta === 0, set an error and return before posting.",
        hint: "Guard submit when delta === 0 and set an error message.",
        seed: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  const [delta, setDelta] = useState(0);
  const [error, setError] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // validate
  }
  return <form onSubmit={onSubmit} />;
}
`,
        starter: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  const [delta, setDelta] = useState(0);
  const [error, setError] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // validate
  }
  return <form onSubmit={onSubmit} />;
}
`,
        expected: `import { useState } from "react";

function AdjustForm(): JSX.Element {
  const [delta, setDelta] = useState(0);
  const [error, setError] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (delta === 0) {
      setError("Enter a non-zero adjustment");
      return;
    }
    setError("");
  }
  return <form onSubmit={onSubmit} />;
}
`,
        keywords: ["delta === 0", "setError", "preventDefault"],
        mc: [
          "if (delta === 0) { setError(\"Enter a non-zero adjustment\"); return; }",
          "if (delta) alert('bad');",
          "throw delta;",
        ],
        correct: "if (delta === 0) { setError(\"Enter a non-zero adjustment\"); return; }",
      },
      {
        paal: "POST the adjustment and show success feedback after a good response.",
        think: "Which call sends the delta to the server and then shows success?",
        why: "After a successful POST, tell the user stock was updated.",
        wrong: "Not quite — POST JSON { delta } to the adjust endpoint, then set a success message when res.ok.",
        hint: "await fetch to the adjust endpoint, then set a success message.",
        seed: `import { useState } from "react";

function AdjustForm({ ingredientId }: { ingredientId: string }): JSX.Element {
  const [delta, setDelta] = useState(0);
  const [message, setMessage] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // post adjustment
  }
  return <form onSubmit={onSubmit}><p>{message}</p></form>;
}
`,
        starter: `import { useState } from "react";

function AdjustForm({ ingredientId }: { ingredientId: string }): JSX.Element {
  const [delta, setDelta] = useState(0);
  const [message, setMessage] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // post adjustment
  }
  return <form onSubmit={onSubmit}><p>{message}</p></form>;
}
`,
        expected: `import { useState } from "react";

function AdjustForm({ ingredientId }: { ingredientId: string }): JSX.Element {
  const [delta, setDelta] = useState(0);
  const [message, setMessage] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/inventory/" + ingredientId + "/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    if (res.ok) setMessage("Stock updated");
  }
  return <form onSubmit={onSubmit}><p>{message}</p></form>;
}
`,
        keywords: ["fetch", "POST", "delta", "setMessage"],
        mc: [
          "await fetch(\"/inventory/\" + ingredientId + \"/adjust\", { method: \"POST\", body: JSON.stringify({ delta }) })",
          "location.href = '/adjust'",
          "console.log(delta)",
        ],
        correct:
          "await fetch(\"/inventory/\" + ingredientId + \"/adjust\", { method: \"POST\", body: JSON.stringify({ delta }) })",
      },
    ],
  },
  {
    tag: "resource-crud-api",
    title: "Resource CRUD API",
    shortName: "CRUD API",
    concept: "Implement REST CRUD for a resource with validation and persistence.",
    steps: [
      {
        paal: "Define a Purchase shape the API will accept and return.",
        think: "Which TypeScript definition correctly describes a Purchase record the API stores?",
        why: "A clear Purchase type keeps request bodies, responses, and the store aligned.",
        wrong: "Not quite — Purchase needs id, ingredient, quantity, and unitCost fields — not a string alias or Array subclass.",
        hint: "Interface with id, ingredient, quantity, unitCost.",
        seed: "",
        starter: `// define Purchase
`,
        expected: `interface Purchase {
  id: string;
  ingredient: string;
  quantity: number;
  unitCost: number;
}
`,
        keywords: ["interface", "Purchase", "id", "quantity"],
        mc: [
          "interface Purchase { id: string; ingredient: string; quantity: number; unitCost: number; }",
          "type Purchase = string;",
          "class Purchase extends Array {}",
        ],
        correct: "interface Purchase { id: string; ingredient: string; quantity: number; unitCost: number; }",
      },
      {
        paal: "Reject create payloads missing ingredient or with non-positive quantity.",
        think: "What should validatePurchase return when ingredient is missing?",
        why: "Bad creates must fail with a clear validation error before anything is stored.",
        wrong: "Not quite — return an error string like \"ingredient is required\", not throw 500 or return true.",
        hint: "Return a 400-shaped error object from validatePurchase.",
        seed: `interface PurchaseInput {
  ingredient?: string;
  quantity?: number;
}

function validatePurchase(input: PurchaseInput): string | null {
  // validate
  return null;
}
`,
        starter: `interface PurchaseInput {
  ingredient?: string;
  quantity?: number;
}

function validatePurchase(input: PurchaseInput): string | null {
  // validate
  return null;
}
`,
        expected: `interface PurchaseInput {
  ingredient?: string;
  quantity?: number;
}

function validatePurchase(input: PurchaseInput): string | null {
  if (!input.ingredient) return "ingredient is required";
  if (!input.quantity || input.quantity <= 0) return "quantity must be positive";
  return null;
}
`,
        keywords: ["ingredient", "quantity", "return"],
        mc: [
          "if (!input.ingredient) return \"ingredient is required\";",
          "throw 500;",
          "return true;",
        ],
        correct: "if (!input.ingredient) return \"ingredient is required\";",
      },
      {
        paal: "Implement listPurchases that returns the in-memory store.",
        think: "How should listPurchases expose the store without letting callers mutate it accidentally?",
        why: "List endpoints return current records — a shallow copy avoids accidental shared mutation.",
        wrong: "Not quite — return a copy of the store (e.g. [...store]), not null or delete.",
        hint: "Return a copy of the purchases array.",
        seed: `const store: { id: string; ingredient: string }[] = [];

function listPurchases() {
  // return store
}
`,
        starter: `const store: { id: string; ingredient: string }[] = [];

function listPurchases() {
  // return store
}
`,
        expected: `const store: { id: string; ingredient: string }[] = [];

function listPurchases() {
  return [...store];
}
`,
        keywords: ["return", "store"],
        mc: ["return [...store];", "return null;", "delete store;"],
        correct: "return [...store];",
      },
      {
        paal: "Implement createPurchase that assigns an id and pushes into the store.",
        think: "What does createPurchase do after validating a new purchase?",
        why: "Create assigns an id, persists the record, and returns it to the client.",
        wrong: "Not quite — build a record with a new id, push it into the store, then return that record.",
        hint: "Generate an id, push, then return the new record.",
        seed: `const store: { id: string; ingredient: string; quantity: number }[] = [];

function createPurchase(input: { ingredient: string; quantity: number }) {
  // create
}
`,
        starter: `const store: { id: string; ingredient: string; quantity: number }[] = [];

function createPurchase(input: { ingredient: string; quantity: number }) {
  // create
}
`,
        expected: `const store: { id: string; ingredient: string; quantity: number }[] = [];

function createPurchase(input: { ingredient: string; quantity: number }) {
  const record = { id: String(Date.now()), ...input };
  store.push(record);
  return record;
}
`,
        keywords: ["push", "id", "return"],
        mc: [
          "const record = { id: String(Date.now()), ...input }; store.push(record); return record;",
          "return input;",
          "store = input;",
        ],
        correct:
          "const record = { id: String(Date.now()), ...input }; store.push(record); return record;",
      },
    ],
  },
];

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function buildEngine(mod) {
  const stepNodes = mod.steps.map((step, i) => {
    const n = i + 1;
    const total = mod.steps.length;
    return `{
    id: "step${n}",
    type: "question",
    phase: "Step ${n} of ${total}",
    paal: \`${esc(step.paal)}\`,
    hint: \`${esc(step.hint)}\`,
    example_code: \`${esc(step.expected)}\`,
    think_prompt: \`${esc(step.think || step.paal)}\`,
    mc_options: ${JSON.stringify(step.mc)},
    mc_correct_option: ${JSON.stringify(step.correct)},
    mc_anchor: ${JSON.stringify(String(step.correct).slice(0, 40))},
    why_this_matters: \`${esc(step.why || mod.concept)}\`,
    answer_keywords: ${JSON.stringify(step.keywords)},
    seed_code: \`${esc(step.seed)}\`,
    starter_code: \`${esc(step.starter)}\`,
    feedback_correct: ${JSON.stringify(step.ok || "Correct — keep going.")},
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: ${JSON.stringify(step.wrong || "Not quite — re-read the question and pick the matching option.")},
    expected: \`${esc(step.expected)}\`,
    analog_example: \`// same idea in plain logic\\nconst ok = true;\\n\`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      hook: \`${esc(step.paal)}\`,
      pain: "Without this pattern, UI and data drift apart or APIs accept bad input.",
      mentalModel: \`${esc(mod.concept)}\`,
      discover: \`${esc(step.expected)}\`,
      quickRules: "- Prefer explicit state\\n- Validate before mutate\\n- Re-render from data",
      watchOut: "Do not leave uncontrolled inputs or unvalidated writes in the happy path.",
      dryRun: "Trace one happy path and one validation failure.",
      build: \`${esc(step.hint)}\`,
    },
  }`;
  });

  const side = [
    `{ label: "Lesson", id: "intro" }`,
    `{ label: "Objectives", id: "objectives" }`,
    ...mod.steps.map((_, i) => `{ label: "Step ${i + 1}", id: "step${i + 1}" }`),
  ];

  return `import createINPACTEngine from "../inpact_engine_shared";

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: ${JSON.stringify(mod.tag)},
      title: ${JSON.stringify(mod.title)},
      body: \`${esc(mod.concept)}\`,
      usecase: "Restaurant Inventory Manager delivery tasks that need this building block.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: ${JSON.stringify(mod.steps.map((s) => s.paal))},
  },
  ${stepNodes.join(",\n  ")},
];

const sideItems = [
  ${side.join(",\n  ")},
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 0,
  title: ${JSON.stringify(mod.title)},
  shortName: ${JSON.stringify(mod.shortName)},
});
`;
}

fs.mkdirSync(ASSIST_DIR, { recursive: true });

for (const mod of MODULES) {
  const code = buildEngine(mod);
  try {
    assertValidModule(code);
  } catch (err) {
    console.error("INVALID", mod.tag, err.message);
    process.exitCode = 1;
    continue;
  }
  const file = path.join(ASSIST_DIR, `inpact_assist_${mod.tag}_engine.tsx`);
  fs.writeFileSync(file, code, "utf8");
  console.log("wrote", path.basename(file));
}

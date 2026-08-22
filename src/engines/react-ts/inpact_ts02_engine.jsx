import createINPACTEngine from "../inpact_engine_shared";

// ─── evaluators — Lesson 2: inventory row types (readonly, unions, nesting, &) ─

function isDeclaredAtModuleScope(raw, declarationStartIndex) {
  if (!Number.isFinite(declarationStartIndex) || declarationStartIndex < 0) return false;
  const firstComponentIndex = raw.search(
    /(?:const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\(|function\s+[A-Z][A-Za-z0-9_]*\s*\()/m,
  );
  if (firstComponentIndex < 0) return true;
  return declarationStartIndex < firstComponentIndex;
}

function evalLesson2Step1(answer) {
  const raw = String(answer || "");
  const m = raw.match(/interface\s+StockLineAudit\s*\{([\s\S]*?)\}/m);
  if (!m || m.index == null) return "wrong";
  const body = m[1] || "";
  const hasReadonlyId = /\breadonly\s+id\s*:\s*string\b/.test(body);
  const hasReadonlyStamp = /\breadonly\s+lastVerifiedAt\s*:\s*string\b/.test(body);
  const moduleScoped = isDeclaredAtModuleScope(raw, m.index);
  if (hasReadonlyId && hasReadonlyStamp && moduleScoped) return "correct";
  if ((hasReadonlyId || hasReadonlyStamp) && moduleScoped) return "partial";
  return "wrong";
}

function evalLesson2Step2(answer) {
  const raw = String(answer || "");
  if (!/\btype\s+ShelfBand\b/.test(raw)) return "wrong";
  const after = raw.split(/\btype\s+ShelfBand\s*=\s*/)[1];
  if (!after) return "wrong";
  const segment = after.split(/;/)[0] || "";
  const hasOk = /'ok'|"ok"/.test(segment);
  const hasLow = /'low'|"low"/.test(segment);
  const hasOut = /'out'|"out"/.test(segment);
  const isUnion = segment.includes("|");
  if (hasOk && hasLow && hasOut && isUnion) return "correct";
  if (isUnion && (hasOk || hasLow || hasOut)) return "partial";
  return "wrong";
}

/** Body inside matching `{` … `}` starting at openBraceIndex (depth 0 at that `{`). */
function sliceBraceBlock(raw, openBraceIndex) {
  if (raw[openBraceIndex] !== "{") return null;
  let depth = 1;
  let i = openBraceIndex + 1;
  const innerStart = i;
  while (i < raw.length && depth > 0) {
    const c = raw[i];
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return raw.slice(innerStart, i);
    }
    i += 1;
  }
  return null;
}

/** Step 3 — pattern only: location (interface or object type alias with city + stall), row extends StockLineAudit, string + ShelfBand + nested ref. */
function evalLesson2Step3(answer) {
  const raw = String(answer || "");
  if (!/\binterface\s+StockLineAudit\b/.test(raw) || !/\btype\s+ShelfBand\b/.test(raw)) return "wrong";

  const interfaces = [];
  for (const dm of raw.matchAll(/\binterface\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g)) {
    const name = dm[1];
    const ext = dm[2] || null;
    const open = dm.index + dm[0].length - 1;
    const inner = sliceBraceBlock(raw, open);
    if (inner == null) continue;
    interfaces.push({ name, extends: ext, body: inner });
  }

  const rows = interfaces.filter((x) => x.extends === "StockLineAudit");
  const locations = interfaces.filter(
    (x) =>
      x.name !== "StockLineAudit" &&
      x.extends !== "StockLineAudit" &&
      /\bcity\s*:\s*string\b/.test(x.body) &&
      /\bstall\s*:\s*string\b/.test(x.body),
  );
  const locationNames = new Set(locations.map((x) => x.name));

  // Location as `type Where = { city: string; stall: string }` (no nested braces inside body).
  for (const tm of raw.matchAll(/\btype\s+(\w+)\s*=\s*\{([^}]*)\}\s*;?/g)) {
    const body = tm[2] || "";
    if (/\bcity\s*:\s*string\b/.test(body) && /\bstall\s*:\s*string\b/.test(body)) {
      locationNames.add(tm[1]);
    }
  }

  const fieldString = /\b(?:readonly\s+)?[A-Za-z_$][\w$]*\s*:\s*string\b/;
  const fieldShelf = /\b(?:readonly\s+)?[A-Za-z_$][\w$]*\s*:\s*ShelfBand\b/;
  for (const row of rows) {
    const b = row.body;
    const hasShelf = fieldShelf.test(b);
    const hasString = fieldString.test(b);
    const usesNested = [...locationNames].some((ln) =>
      new RegExp(`\\b(?:readonly\\s+)?[A-Za-z_$][\\w$]*\\s*:\\s*${ln}\\b`).test(b),
    );
    if (hasShelf && hasString && usesNested) return "correct";
  }

  if (rows.length > 0 || locations.length > 0 || locationNames.size > locations.length) return "partial";
  return "wrong";
}

/** Step 4 — PantryItemWithNote + kitchenNote; row side may be any identifier that extends StockLineAudit in this file. */
function evalLesson2Step4(answer) {
  const raw = String(answer || "");
  let m = raw.match(
    /\btype\s+PantryItemWithNote\s*=\s*([A-Za-z_$][\w$]*)\s*&\s*\{\s*kitchenNote\s*:\s*string\s*\}\s*;?/m,
  );
  if (!m) {
    m = raw.match(
      /\btype\s+PantryItemWithNote\s*=\s*\{\s*kitchenNote\s*:\s*string\s*\}\s*&\s*([A-Za-z_$][\w$]*)\s*;?/m,
    );
  }
  if (!m) return "wrong";
  const rowName = m[1];
  const rowDecl = new RegExp(`\\binterface\\s+${rowName}\\s+extends\\s+StockLineAudit\\b`);
  if (!rowDecl.test(raw)) return "wrong";
  return "correct";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #2 · Shapes behind the row",
      title: "Inventory row — readonly fields, unions, nested types",
      body: `In Lesson 1 you built a visible card — interface, component, JSX, done. That card is now part of the app.

Before the next screen gets built, the app needs richer data. Not just four plain strings — but fields that should never change, states that only allow three possible values, and locations that are objects nested inside objects.

This lesson does not add any new UI. \n**You will not write a single JSX tag. Instead, you are going to sharpen the one tool that every screen in this app depends on**: \"the ability to describe data precisely in TypeScript.\"

Think of it as equipping your toolbelt before the next build sprint. Every interface pattern you write here will show up in a real component before this course is done.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Mark fields as `readonly` so TypeScript prevents accidental reassignment after an object is created",
      "Define a string literal union that restricts a field to a fixed set of allowed values",
      "Declare a nested interface and use `extends` to build a richer type without repeating shared fields",
      "Use a type intersection to combine an existing type with an extra field without modifying the original",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 4",
    paal:
      "Declare an interface named `StockLineAudit` with two string fields — `id` and `lastVerifiedAt` — and mark both as `readonly`.",
    hint: "Pattern: put the word `readonly` before the field name. Everything else stays the same as a normal interface field.",
    example_code: `interface AuditStamp {
  readonly createdAt: string;
  readonly createdBy: string;
}`,
    think_prompt: `You are working in a team. A developer is fixing a bug late at night and accidentally writes:

\`\`\`
row.id = "temp-fix-123";
\`\`\`

The row now has a corrupted ID. It gets saved. The owner's data is wrong and nobody knows why.

Which option stops that line from compiling in the first place?`,
    mc_options: [
      "Leave `id` typed as `string` — TypeScript will warn at runtime",
      "Mark `id` as `readonly` — any reassignment becomes a compile-time error",
      "Rename the field to `_id` so developers know not to touch it by convention",
    ],
    mc_correct_option:
      "Mark `id` as `readonly` — any reassignment becomes a compile-time error",
    mc_anchor:
      "`readonly` moves the guardrail from convention ('please don't touch this') to enforcement ('the compiler won't let you'). The field can still be read and passed anywhere — it just cannot be overwritten.",
    why_this_matters:
      "Some fields should be set once and never changed — unique identifiers, creation timestamps, audit trails. `readonly` makes that intention part of the type itself, not a comment someone can ignore.",
    answer_keywords: ["interface", "StockLineAudit", "readonly", "id", "lastVerifiedAt", "string"],
    evaluate: evalLesson2Step1,
    seed_code: "",
    starter_code: "// declare interface StockLineAudit here — two readonly string fields: id and lastVerifiedAt",
    feedback_correct:
      "Yes — both fields are locked at the type level. No teammate can reassign them without the compiler objecting.",
    feedback_partial:
      "Close — make sure both fields are marked `readonly`, typed as `string`, and spelled exactly `id` and `lastVerifiedAt`.",
    feedback_wrong:
      "Declare `interface StockLineAudit` with two fields — `id` and `lastVerifiedAt` — and put the word `readonly` before each field name.",
    expected: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 4",
    paal:
      "Declare a type alias named `ShelfBand` that only allows three values: `'ok'`, `'low'`, and `'out'`.",
    hint: "Pattern: `type SomeName = 'value1' | 'value2' | 'value3'` — each allowed value is a quoted string literal joined by `|`.",
    example_code: `type OrderStatus = 'pending' | 'shipped' | 'delivered';`,
    think_prompt: `You are building a component that colors a row green, amber, or red depending on stock level. A teammate writes:

\`\`\`
band: "lo"
\`\`\`

The row never turns amber. Nobody notices until the customer reports the bug. The typo was one character.

Which option catches that before the app runs?`,
    mc_options: [
      "Type the field as `string` — any text is valid, typos only show up at runtime",
      "Type the field as a union of string literals — only `'ok'`, `'low'`, and `'out'` compile, everything else is an error",
      "Add a comment next to the field explaining the three allowed values",
    ],
    mc_correct_option:
      "Type the field as a union of string literals — only `'ok'`, `'low'`, and `'out'` compile, everything else is an error",
    mc_anchor:
      "A string literal union closes the vocabulary. The compiler rejects anything outside it — no runtime surprises, no one-character bugs slipping through.",
    why_this_matters:
      "Whenever a field can only ever be one of a small fixed set of values, a literal union is almost always the right choice over `string`. It makes impossible states impossible to compile.",
    answer_keywords: ["type", "ShelfBand", "'ok'", "'low'", "'out'"],
    evaluate: evalLesson2Step2,
    seed_code: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}`,
    starter_code: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

// declare type ShelfBand here — three string literals joined by |`,
    feedback_correct:
      "Good — the vocabulary is now closed. Any value outside those three literals will not compile.",
    feedback_partial:
      "Check that the alias is named `ShelfBand` and all three literals — `'ok'`, `'low'`, and `'out'` — appear in a single union expression.",
    feedback_wrong:
      "Declare a `type` alias named `ShelfBand` equal to exactly three string literals — `'ok'`, `'low'`, and `'out'` — joined by `|`.",
    expected: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

type ShelfBand = 'ok' | 'low' | 'out';`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 4",
    paal:
      "You have the StockLineAudit interface already; \nNow do these two things:\n1. Create an interface called PantryLocation with two fields: city (string) and stall (string).\n2. Create an interface called PantryItem that extends StockLineAudit and adds three fields: label (string), shelfState (ShelfBand), and location (use PantryLocation as its type).",
    example_code: `interface Address {
  street: string;
  zip: string;
}

interface Employee extends AuditStamp {
  name: string;
  address: Address;
}`,
    think_prompt: `You need to store a pantry item's location. The location has two parts: a city and a stall number.

A teammate suggests adding \`locationCity: string\` and \`locationStall: string\` directly onto the item interface — just flatten it all into one place.

What breaks down as the app grows if you always flatten nested data instead of giving it its own interface?`,
    mc_options: [
      "Nothing — flat interfaces are always easier to read and maintain",
      "The interface becomes harder to read, reuse, or update — changing location means hunting through every flat interface that copied those fields",
      "TypeScript does not allow more than five fields on one interface",
    ],
    mc_correct_option:
      "The interface becomes harder to read, reuse, or update — changing location means hunting through every flat interface that copied those fields",
    mc_anchor:
      "When a group of fields belongs together and describes one concept, give it its own interface. Then any interface that needs that concept just references it by name — one change propagates everywhere.",
    why_this_matters:
      "Real data is nested. Addresses, locations, authors, suppliers — these are all groups of fields that belong together. Giving each group its own interface keeps your types readable and your changes contained.",
    answer_keywords: ["interface", "extends", "StockLineAudit", "city", "stall", "ShelfBand", "string"],
    evaluate: evalLesson2Step3,
    seed_code: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

type ShelfBand = 'ok' | 'low' | 'out';`,
    starter_code: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

type ShelfBand = 'ok' | 'low' | 'out';

// 1. location interface — group city + stall (any interface name you like)
// 2. row interface extends StockLineAudit — add a string label, a ShelfBand field, and a field typed as your location interface`,
    feedback_correct:
      "Good — location lives in its own interface, and your row type extends `StockLineAudit` without copying audit fields.",
    feedback_partial:
      "Check the pattern: one interface with `city` and `stall` as strings; one interface `extends StockLineAudit` with a plain `string` field, a `ShelfBand` field, and a field whose type is your location interface.",
    feedback_wrong:
      "Give the location its own interface with `city` and `stall` as strings. Declare a second interface that `extends StockLineAudit` and adds exactly three new fields: a string (label), a `ShelfBand` (shelf state), and a property typed as your location interface.",
    expected: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

type ShelfBand = 'ok' | 'low' | 'out';

interface KitchenHall {
  city: string;
  stall: string;
}

interface PantryItem extends StockLineAudit {
  skuLabel: string;
  hall: KitchenHall;
  band: ShelfBand;
}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 4",
    paal:
      "Add a type alias `PantryItemWithNote` that intersects your Step 3 row interface ( `PantryItem`) with `{ kitchenNote: string }` — same pattern as `Row & { kitchenNote: string }`, using whatever you named that row interface.",
    hint: "Intersections merge two object shapes. The anonymous side is a one-field object type. The memo field name for this step is `kitchenNote`.",
    analogousExample: `interface BinLot {
  code: string;
  kilograms: number;
}

type BinLotWithShiftNote = BinLot & { shiftNote: string };`,
    think_prompt:
      "You already have a row interface that extends `StockLineAudit`. The head chef sometimes adds a free-text memo for tonight's service only. When should you reach for `& { … }` instead of editing that row interface itself?",
    mc_options: [
      "When the extra field is universal for every row in the database forever",
      "When a temporary or situational field should combine with an existing type without mutating the base interface",
      "When you want to delete fields from the row interface",
    ],
    mc_correct_option:
      "When a temporary or situational field should combine with an existing type without mutating the base interface",
    mc_anchor:
      "`RowType & { kitchenNote: string }` is the lightweight pattern for “same row, plus an overlay.” Promotion to a first-class field belongs in the base type only if every consumer needs it.",
    why_this_matters:
      "UI-only overlays (flags, memos, optimistic badges) come and go. Intersections let you experiment without destabilising the canonical row type the API team owns.",
    answer_keywords: ["type", "PantryItemWithNote", "&", "kitchenNote", "StockLineAudit"],
    evaluate: evalLesson2Step4,
    seed_code: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

type ShelfBand = "ok" | "low" | "out";

interface KitchenHall {
  city: string;
  stall: string;
}

interface PantryItem extends StockLineAudit {
  skuLabel: string;
  hall: KitchenHall;
  band: ShelfBand;
}`,
    starter_code: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

type ShelfBand = "ok" | "low" | "out";

interface KitchenHall {
  city: string;
  stall: string;
}

interface PantryItem extends StockLineAudit {
  skuLabel: string;
  hall: KitchenHall;
  band: ShelfBand;
}

// add: type PantryItemWithNote = <YourRowInterface> & { kitchenNote: string }`,
    feedback_correct:
      "Exactly — you combined the existing row with a memo overlay using `&`, which is the idiomatic escape hatch for situational fields.",
    feedback_partial:
      "Check the alias name `PantryItemWithNote`, the intersection with your Step 3 row interface (the one that `extends StockLineAudit`), and the memo field `kitchenNote` typed as `string`.",
    feedback_wrong:
      "Declare a type alias `PantryItemWithNote` as your row interface intersected (`&`) with a one-field object type whose only property is `kitchenNote: string`.",
    expected: `interface StockLineAudit {
  readonly id: string;
  readonly lastVerifiedAt: string;
}

type ShelfBand = "ok" | "low" | "out";

interface KitchenHall {
  city: string;
  stall: string;
}

interface PantryItem extends StockLineAudit {
  skuLabel: string;
  hall: KitchenHall;
  band: ShelfBand;
}

type PantryItemWithNote = PantryItem & { kitchenNote: string };`,
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

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 2,
  title: "Inventory row — readonly fields, unions, nested types",
  shortName: "REST — ROW TYPES",
});

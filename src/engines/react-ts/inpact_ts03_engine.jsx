import createINPACTEngine from "../inpact_engine_shared";

function evaluateUtilityAlias(answer, utilityName, sourceTypeName, requiredTokens = []) {
  const raw = String(answer || "");
  const normalized = raw.replace(/\s+/g, " ").trim();
  const strictPattern = new RegExp(
    `\\btype\\s+[A-Za-z_$][\\w$]*\\s*=\\s*${utilityName}\\s*<\\s*${sourceTypeName}\\b`,
    "i"
  );
  const hasRequiredTokens = requiredTokens.every((token) =>
    new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(normalized)
  );
  if (strictPattern.test(normalized) && hasRequiredTokens) return "correct";

  const loosePattern = new RegExp(
    `\\btype\\s+[A-Za-z_$][\\w$]*\\b[\\s\\S]*\\b${utilityName}\\s*<\\s*${sourceTypeName}\\b`,
    "i"
  );
  if (loosePattern.test(normalized)) return "partial";
  return "wrong";
}

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #3 (TypeScript)",
    title: "TypeScript — Utility Types",
    body: "You already know how to define interfaces and extend them. Utility types take that further — they let you derive new types from existing ones without rewriting them. In this lesson you'll use Partial, Pick, Omit, and Readonly to produce four different type shapes from a single source interface, then build a component that renders the result safely.",
    usecase:
      "A single shipment record drives many different contexts in an enterprise app — a filter form, a list summary, a create form, a frozen API payload. Each context needs a different shape. Utility types let you derive all four from one source so they stay in sync automatically when the source changes.",
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
      reason: "The final step of this lesson builds ShipmentFilterPanel — a component that renders optional values using {destination?.city} and {status ?? 'All statuses'} inside JSX. You need to know how curly brace expressions work and how a component returns JSX.Element before the component step makes sense.",
    },
    {
      lesson: 2,
      label: "Inventory row — readonly fields, unions, nested types",
      reason: "Every utility type in this lesson — Partial, Pick, Omit, Readonly — transforms a type you already have. That source type is ShipmentRecord, which extends BaseRecord and uses a nested Location interface — both defined in Lesson 2. Without knowing how to read interfaces and extends, the transformations here have nothing meaningful to operate on.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Use Partial to make every field of an existing interface optional for filter form types",
    "Use Pick to extract a named subset of fields from an existing interface",
    "Use Omit to derive a new type by removing specific fields from an existing interface",
    "Use Readonly to freeze a type so no field can be reassigned after creation",
    "Build a component that accepts a derived utility type as props and renders the active filter values",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  strictLocalValidation: true,
  evaluate: (answer) => evaluateUtilityAlias(answer, "Partial", "ShipmentRecord"),
  paal: "Create a ShipmentFilterParams type using Partial<ShipmentRecord> — a filter form where the user can fill in any combination of fields, but none are required.",
  hint: "Partial wraps an existing type and makes every field optional. You don't redefine the fields — you transform the whole shape in one line.",
  example_code: `type OrderFilterParams = Partial<OrderRecord>;`,
  think_prompt:
    "A filter form is different from a data record — the user might filter by status only, or destination only, or both. How do you express a type where every field from ShipmentRecord exists but none of them are mandatory?",
  mc_options: [
    "type ShipmentFilterParams = { status?: string; destination?: string; origin?: string }",
    "type ShipmentFilterParams = Partial<ShipmentRecord>",
    "type ShipmentFilterParams = ShipmentRecord | undefined",
  ],
  mc_correct_option: "type ShipmentFilterParams = Partial<ShipmentRecord>",
  mc_anchor:
    "Partial<ShipmentRecord> transforms every field on ShipmentRecord into an optional field — exactly one line, no field redeclaration. The first option manually makes some fields optional but has to be updated every time ShipmentRecord changes. The third option makes the whole object optional, not the fields inside it. Notice that ShipmentFilterParams is a type alias, not an interface — utility types like Partial return a transformed type, not an extendable interface shape. That's the pattern: interface for things you define and extend, type for things you derive.",
  why_this_matters:
    "Filter forms in enterprise apps never require every field — users filter by what they care about. Partial lets you derive the filter type directly from the data type, so when ShipmentRecord gains a new field, ShipmentFilterParams automatically gains an optional version of it. One source of truth, zero drift.",
  answer_keywords: ["type", "ShipmentFilterParams", "Partial", "ShipmentRecord"],
  seed_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}`,
  starter_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

// define ShipmentFilterParams using Partial here`,
  feedback_correct:
    "Exactly — Partial<ShipmentRecord> makes every field optional in one line. The filter form can now accept any combination of fields and TypeScript won't complain about missing ones.",
  feedback_partial:
    "Close — make sure you're using Partial<ShipmentRecord> as the full transformation, not manually declaring optional fields.",
  feedback_wrong:
    "The pattern is: `type ShipmentFilterParams = Partial<ShipmentRecord>` — Partial wraps the existing type and makes every field optional automatically.",
  expected: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;`,
  analog_example: `type OrderFilterParams = Partial<OrderRecord>;`,
  deepDiveLabel:
    "Partial makes every field optional — but does it go all the way down into nested objects?",
  deepDive: {
    hook: "You define `type ShipmentFilterParams = Partial<ShipmentRecord>`. You feel confident — every field is optional now. You build the filter form. A user submits with only a status selected. The filter works.\n\nThen a teammate tries to filter by city only — they pass `{ origin: { city: 'Hamburg' } }`. TypeScript errors. They stare at it. `origin` is optional on ShipmentFilterParams — but once they provide it, TypeScript expects the full `Location` shape: both `city` and `country`. The `country` field isn't optional inside the nested object.\n\nPartial is shallow. It made `origin` optional — but it didn't make the fields *inside* `origin` optional. This is the same shallow behaviour you saw with readonly in lesson 2. One level deep. No further.",
    pain: "⚠️ **Lesson:** You use `Partial<ShipmentRecord>` for a filter form. Filtering by status alone works fine. But filtering by origin city alone errors — TypeScript wants the full Location object. Why does Partial not make nested object fields optional too?",
    mentalModel:
      "**Mental model:** Think of Partial as a **one-floor renovation** — it only works on the floor you're standing on.\n- `Partial<ShipmentRecord>` walks through ShipmentRecord's fields and puts a `?` on each one: `id?`, `createdAt?`, `origin?`, `status?`.\n- But `origin` is a `Location` object. Partial doesn't walk *into* Location and make `city?` and `country?` optional too — it stops at the reference.\n- So `origin` becomes optional — you can omit it entirely. But if you provide it, you must provide a complete `Location`.\n- Deep partial — making nested fields optional too — requires a recursive utility type. That's an advanced pattern. For now: Partial = one level, always.",
    discover:
      "**Pattern — Partial:**\n```tsx\n// ✅ Partial makes top-level fields optional\ntype ShipmentFilterParams = Partial<ShipmentRecord>;\n// result: { id?: string; createdAt?: string; origin?: Location; status?: '...' }\n\n// ✅ valid — origin omitted entirely\nconst filter: ShipmentFilterParams = { status: 'active' };\n\n// ❌ invalid — origin provided but incomplete\nconst filter: ShipmentFilterParams = { origin: { city: 'Hamburg' } };\n// TypeScript: Property 'country' is missing in type\n\n// ✅ valid — origin provided in full\nconst filter: ShipmentFilterParams = { origin: { city: 'Hamburg', country: 'DE' } };\n```\n- Partial = shallow, one level only\n- optional field = can be omitted entirely\n- if provided, the value must still satisfy its original type completely\n- deep partial requires a custom recursive type — not a built-in",
    quickRules:
      "**Quick rules:**\n- ✅ `Partial<T>` — every top-level field becomes optional\n- ✅ omit any field entirely — TypeScript won't complain\n- ❌ provide a nested object partially — the nested type is still fully required\n- ❌ `T | undefined` — makes the whole object optional, not the fields inside it\n- Partial is shallow — same rule as readonly from lesson 2",
    watchOut:
      "👀 **Watch out:** `Partial<ShipmentRecord>` also makes `id`, `createdAt`, and `updatedAt` optional — even though those are readonly fields on the original. readonly and optional are independent modifiers. Partial removes the required constraint but keeps readonly. If you don't want audit fields on the filter type at all, Omit is the right tool — that's Step 3.",
    dryRun:
      "🔁 **Think:** You have `type ShipmentFilterParams = Partial<ShipmentRecord>`. A teammate adds a new required field `carrierId: string` to ShipmentRecord. What automatically happens to ShipmentFilterParams — does carrierId become required or optional there too? (Hint: Partial transforms every field it finds — including new ones added to the source type.)",
    build:
      "**Learning focus:** Use Partial to derive a filter type from an existing interface — making every top-level field optional in one line, with the understanding that Partial is shallow and nested object shapes remain fully required if provided.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  strictLocalValidation: true,
  evaluate: (answer) => evaluateUtilityAlias(answer, "Pick", "ShipmentRecord", ["status", "destination"]),
  paal: "Create a ShipmentSummary type using Pick<ShipmentRecord, ...> that extracts only the status and destination fields — a lightweight shape for list views that don't need the full record.",
  hint: "Pick takes two arguments — the source type and a union of the field names you want to keep, as string literals.",
  example_code: `type OrderPreview = Pick<OrderRecord, 'status' | 'deliveryDate'>;`,
  think_prompt:
    "A shipment list view only needs to show status and destination — not the full record with audit fields and origin. How do you create a type that has exactly those two fields and nothing else?",
  mc_options: [
    "type ShipmentSummary = { status: ShipmentRecord['status']; destination: ShipmentRecord['destination'] }",
    "type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>",
    "type ShipmentSummary = Partial<ShipmentRecord> & { status: string; destination: Location }",
  ],
  mc_correct_option:
    "type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>",
  mc_anchor:
    "Pick<ShipmentRecord, 'status' | 'destination'> extracts exactly those two fields — with their original types intact — in one line. The first option works but manually re-references each type, creating drift risk. The third option starts from Partial and then overrides fields, which is roundabout and adds noise. Pick is the precise tool for extracting a named subset.",
  why_this_matters:
    "Enterprise apps render the same data in many contexts — a full detail view, a summary card, a table row. Each context needs a different slice of the data. Pick lets you derive that slice from the source type so the field types stay in sync automatically. If ShipmentRecord's status union gains a new value, ShipmentSummary picks it up without any change.",
  answer_keywords: [
    "type", "ShipmentSummary", "Pick", "ShipmentRecord", "status", "destination",
  ],
  seed_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;`,
  starter_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

// define ShipmentSummary using Pick here`,
  feedback_correct:
    "Exactly — Pick extracts status and destination with their original types intact. The list view gets exactly what it needs and nothing it doesn't.",
  feedback_partial:
    "Close — make sure you're passing the field names as a union of string literals inside Pick: `'status' | 'destination'`.",
  feedback_wrong:
    "The pattern is: `type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>` — Pick takes the source type first, then a union of the field names to keep.",
  expected: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;`,
  analog_example: `type OrderPreview = Pick<OrderRecord, 'status' | 'deliveryDate'>;`,
  deepDiveLabel:
    "Pick keeps named fields — but what's the difference between Pick and just writing the interface manually?",
  deepDive: {
    hook: "You define `type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>`. A month later the team changes `status` on ShipmentRecord from `'active' | 'delayed' | 'delivered'` to also include `'cancelled'`. You update ShipmentRecord in one place.\n\nShipmentSummary automatically reflects the change — it picked `status` by reference, not by value. Every component typed as ShipmentSummary now knows about `'cancelled'` without a single extra edit.\n\nNow imagine you'd written the manual version instead: `type ShipmentSummary = { status: 'active' | 'delayed' | 'delivered'; destination: Location }`. You update ShipmentRecord. ShipmentSummary still has the old union. TypeScript doesn't flag it — the manual type is its own separate definition. You ship. A component typed as ShipmentSummary renders a cancelled shipment — and hits the unhandled case silently.",
    pain: "⚠️ **Lesson:** You write ShipmentSummary manually instead of using Pick. ShipmentRecord's status union changes. ShipmentSummary doesn't update. TypeScript doesn't error. A component silently handles a status value it was never designed for. How does Pick prevent this class of bug?",
    mentalModel:
      "**Mental model:** Think of Pick as a **live reference to specific shelves in the toolbox**.\n- A manual type is a photocopy of those shelves — it was accurate when you made it, but it never updates when the original changes.\n- Pick keeps a live pointer — `'status'` on ShipmentRecord, whatever that field currently is. When ShipmentRecord changes, the pointer follows.\n- The field names in the union are checked at compile time — if you Pick a field that doesn't exist on the source type, TypeScript errors immediately. The manual approach has no such check.\n- Pick is also self-documenting: `Pick<ShipmentRecord, 'status' | 'destination'>` tells every reader exactly where this type came from and which fields it contains.",
    discover:
      "**Pattern — Pick:**\n```tsx\n// ✅ Pick — live reference, stays in sync\ntype ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;\n\n// ✅ picking a single field\ntype ShipmentStatus = Pick<ShipmentRecord, 'status'>;\n\n// ❌ manual copy — drifts when source changes\ntype ShipmentSummary = {\n  status: 'active' | 'delayed' | 'delivered';\n  destination: Location;\n};\n\n// ❌ picking a field that doesn't exist — TypeScript errors immediately\ntype BadPick = Pick<ShipmentRecord, 'trackingNumber'>;\n// Type '\"trackingNumber\"' does not satisfy the constraint\n```\n- field names are string literals in a union — `'field1' | 'field2'`\n- picked fields keep their original types including readonly modifiers\n- picking a non-existent field is a compile-time error — the manual approach would just silently be wrong",
    quickRules:
      "**Quick rules:**\n- ✅ `Pick<T, 'field1' | 'field2'>` — extracts named fields with original types\n- ✅ picked fields stay in sync when the source type changes\n- ❌ manual subset type — accurate at creation, drifts silently after\n- ❌ `Pick<T, 'nonExistentField'>` — compile-time error, TypeScript catches invalid field names\n- readonly modifiers on picked fields are preserved — if `id` is readonly on the source, it stays readonly in the Pick",
    watchOut:
      "👀 **Watch out:** Pick and Omit are inverses — Pick keeps the fields you name, Omit removes them. For a small subset of a large type, Pick is cleaner. For a large subset where you only want to remove one or two fields, Omit is cleaner. Choosing the wrong one means listing far more field names than necessary.",
    dryRun:
      "🔁 **Think:** You have `type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>`. A teammate adds `carrierId: string` to ShipmentRecord. Does ShipmentSummary automatically include carrierId — or does it stay as status and destination only? (Hint: Pick keeps exactly the fields you named — no more, no less. New fields on the source don't appear unless you add them to the Pick union.)",
    build:
      "**Learning focus:** Use Pick to extract a named subset of fields from an existing type — keeping those fields live and in sync with the source, rather than copying them manually into a new type that will drift over time.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  strictLocalValidation: true,
  evaluate: (answer) => evaluateUtilityAlias(answer, "Omit", "ShipmentRecord", ["id", "createdAt", "updatedAt"]),
  paal: "Create a ShipmentCreateInput type using Omit<ShipmentRecord, ...> that removes the three readonly audit fields — id, createdAt, and updatedAt — leaving only the fields the user actually fills in.",
  hint: "Omit is the inverse of Pick — you name the fields to remove, not the fields to keep.",
  example_code: `type OrderCreateInput = Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>;`,
  think_prompt:
    "A create form should never ask the user for an ID or timestamps — those come from the database. You already have ShipmentRecord with all fields. How do you derive a type that has everything except those three audit fields?",
  mc_options: [
    "type ShipmentCreateInput = Pick<ShipmentRecord, 'origin' | 'destination' | 'status'>",
    "type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>",
    "type ShipmentCreateInput = ShipmentRecord & { id?: string; createdAt?: string; updatedAt?: string }",
  ],
  mc_correct_option:
    "type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>",
  mc_anchor:
    "Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'> removes exactly those three fields and keeps everything else — origin, destination, status. Pick would also work here but you'd have to name every field you want to keep. When you're removing a small number of fields from a large type, Omit is always the cleaner choice. Notice again that the result is a type alias — utility types derive, they don't define. That's why they're always type, never interface.",
  why_this_matters:
    "Create and update forms in enterprise apps always work with a subset of the full record — the database generates audit fields, the user fills in the rest. Omit lets you derive exactly that subset from the source type without rewriting it. When ShipmentRecord gains a new user-facing field, ShipmentCreateInput picks it up automatically.",
  answer_keywords: [
    "type", "ShipmentCreateInput", "Omit", "ShipmentRecord", "id", "createdAt", "updatedAt",
  ],
  seed_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;`,
  starter_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

// define ShipmentCreateInput using Omit here`,
  feedback_correct:
    "Exactly — Omit removes the three audit fields and leaves origin, destination, and status. The create form now has exactly what the user fills in and nothing the database generates.",
  feedback_partial:
    "Close — check that you're omitting all three audit fields: id, createdAt, and updatedAt.",
  feedback_wrong:
    "The pattern is: `type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>` — Omit takes the source type first, then a union of the field names to remove.",
  expected: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;`,
  analog_example: `type OrderCreateInput = Omit<OrderRecord, 'id' | 'createdAt' | 'updatedAt'>;`,
  deepDiveLabel:
    "Omit removes fields — but does it also remove the readonly modifier from the ones it keeps?",
  deepDive: {
    hook: "You define `type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>`. The remaining fields are origin, destination, and status. None of those were readonly on ShipmentRecord — so the create form type looks clean.\n\nBut a teammate defines a different Omit on a different type. Their source type has a readonly field they want to keep. They use Omit to remove a different field and keep the readonly one. They assume Omit strips the readonly modifier since it's 'transforming' the type. It doesn't. The readonly carries through.\n\nThen they try to mutate the field in a form handler — a standard pattern for updating form state. TypeScript errors. They spend twenty minutes wondering why a 'create input' type has readonly fields. The answer: Omit is a field remover, not a modifier remover. It keeps whatever the source field had.",
    pain: "⚠️ **Lesson:** You use Omit to derive a create form type. The fields that remain are readonly on the source. TypeScript rejects your form handler trying to update them. Why does Omit preserve readonly — and what's the right tool to strip it?",
    mentalModel:
      "**Mental model:** Think of Omit as **removing rows from a table** — it deletes the rows you name, but every remaining row keeps all its original properties unchanged.\n- readonly is a property of a field, like a sticky label attached to that row.\n- Omit removes rows — it never touches the labels on the rows that stay.\n- If a field was readonly before Omit, it's readonly after Omit.\n- To strip readonly from remaining fields, you'd combine Omit with another utility type — `{ -readonly [K in keyof T]: T[K] }` — a mapped type that explicitly removes readonly. That's an advanced pattern. For now: Omit keeps all modifiers intact on the fields that survive.",
    discover:
      "**Pattern — Omit:**\n```tsx\n// ✅ Omit removes named fields, keeps the rest with original modifiers\ntype ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;\n// result: { origin: Location; destination: Location; status: 'active' | 'delayed' | 'delivered' }\n\n// ✅ Omit vs Pick — choose based on which list is shorter\n// removing 3 fields from 6 → Omit is cleaner\ntype CreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;\n// keeping 2 fields from 6 → Pick is cleaner\ntype Summary = Pick<ShipmentRecord, 'status' | 'destination'>;\n\n// ❌ omitting a field that doesn't exist — TypeScript errors\ntype BadOmit = Omit<ShipmentRecord, 'trackingNumber'>;\n```\n- Omit and Pick are inverses — use whichever requires the shorter field list\n- readonly and optional modifiers survive Omit unchanged\n- omitting a non-existent field name is a compile-time error",
    quickRules:
      "**Quick rules:**\n- ✅ `Omit<T, 'field1' | 'field2'>` — removes named fields, keeps everything else\n- ✅ use Omit when removing fewer fields than you're keeping\n- ✅ use Pick when keeping fewer fields than you're removing\n- ❌ Omit does not strip readonly — modifiers on remaining fields are preserved\n- ❌ `Omit<T, 'nonExistentField'>` — compile-time error, TypeScript validates field names",
    watchOut:
      "👀 **Watch out:** `Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>` removes those fields entirely — they won't appear on the derived type at all. If you want them optional instead of absent, Partial is the right tool. If you want them absent from the create form but present as optional on the filter form, you need both — and that's exactly what this lesson is building toward.",
    dryRun:
      "🔁 **Think:** You have `type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>`. A teammate adds `readonly assignedAt: string` to ShipmentRecord — a timestamp set when a driver is assigned. Does ShipmentCreateInput automatically include assignedAt — and if so, is it readonly or mutable? (Hint: Omit only removes the fields you name. New fields on the source appear in the derived type with all their original modifiers.)",
    build:
      "**Learning focus:** Use Omit to derive a type by removing specific fields from a source — understanding that Omit keeps all modifiers on the remaining fields intact, and that Omit and Pick are inverses where you choose based on which field list is shorter to write.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  strictLocalValidation: true,
  evaluate: (answer) => evaluateUtilityAlias(answer, "Readonly", "ShipmentFilterParams"),
  paal: "Create a FrozenFilterParams type using Readonly<ShipmentFilterParams> — a frozen snapshot of the filter state that gets passed to the API call and must not be mutated.",
  hint: "Readonly wraps an existing type and adds the readonly modifier to every top-level field.",
  example_code: `type FrozenOrderFilter = Readonly<OrderFilterParams>;`,
  think_prompt:
    "Once the user submits the filter form, the params are handed to the API call. Nothing should mutate them mid-flight. How do you derive a type that takes ShipmentFilterParams and makes every field readonly?",
  mc_options: [
    "type FrozenFilterParams = { readonly status?: string; readonly destination?: Location; readonly origin?: Location }",
    "type FrozenFilterParams = Readonly<ShipmentFilterParams>",
    "type FrozenFilterParams = Required<ShipmentFilterParams>",
  ],
  mc_correct_option: "type FrozenFilterParams = Readonly<ShipmentFilterParams>",
  mc_anchor:
    "Readonly<ShipmentFilterParams> adds the readonly modifier to every field in one line — including the optional ones from Partial. The first option manually redeclares every field with readonly, which will drift when ShipmentFilterParams changes. The third option — Required — does the opposite of Partial, making every field mandatory, which is not what a frozen snapshot needs.",
  why_this_matters:
    "API call params should never be mutated after submission — mutating them mid-flight causes race conditions and unpredictable UI state. Readonly makes that contract enforceable by TypeScript. Combined with Partial from Step 1, you now have two derived types from one source: a flexible form type and a frozen API type.",
  answer_keywords: ["type", "FrozenFilterParams", "Readonly", "ShipmentFilterParams"],
  seed_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;`,
  starter_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;

// define FrozenFilterParams using Readonly here`,
  feedback_correct:
    "Exactly — Readonly<ShipmentFilterParams> freezes every field including the optional ones. The API call now receives a type it can read but never modify.",
  feedback_partial:
    "Close — make sure you're wrapping ShipmentFilterParams with Readonly, not ShipmentRecord directly.",
  feedback_wrong:
    "The pattern is: `type FrozenFilterParams = Readonly<ShipmentFilterParams>` — Readonly wraps the existing type and adds readonly to every top-level field automatically.",
  expected: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;

type FrozenFilterParams = Readonly<ShipmentFilterParams>;`,
  analog_example: `type FrozenOrderFilter = Readonly<OrderFilterParams>;`,
  deepDiveLabel:
    "Readonly<T> and readonly fields on an interface — are they the same thing?",
  deepDive: {
    hook: "You've now seen readonly in two forms across two lessons. In lesson 2 you put `readonly` directly on interface fields: `readonly id: string`. In this step you wrapped a whole type with `Readonly<T>`. They look related. They produce the same modifier on each field. But they work at different points in the type system — and knowing the difference tells you which tool to reach for.\n\nA teammate asks: 'if Readonly<T> does the same thing as writing readonly on every field, why do both exist?' You pause. You've used both but never thought about why. The answer is about *when* you know you need readonly — at definition time, or at the point of use.",
    pain: "⚠️ **Lesson:** You already put `readonly` on `id`, `createdAt`, and `updatedAt` in BaseRecord. Now you're adding `Readonly<ShipmentFilterParams>` in Step 4. Both use readonly — so what's the actual difference between them, and when do you choose one over the other?",
    mentalModel:
      "**Mental model:** Think of the two readonly approaches as **different points in a pipeline**.\n- `readonly` on an interface field: you're making a design decision at definition time — this field should *never* be mutable, in any context, by anyone. It's baked into the type permanently.\n- `Readonly<T>`: you're making a contextual decision at the point of use — this type is mutable in general, but *in this specific context* (an API call, a config object, a frozen snapshot) it should not be touched. The original type stays flexible; you freeze it only when needed.\n- Interface readonly = permanent constraint. `Readonly<T>` = contextual constraint.\n- They produce the same field modifier — but they express different intent. Use interface readonly for data that is *never* mutable. Use `Readonly<T>` for data that is mutable by default but should be frozen in a specific context.",
    discover:
      "**Pattern — Readonly<T> vs interface readonly:**\n```tsx\n// ✅ interface readonly — permanent, never mutable in any context\ninterface BaseRecord {\n  readonly id: string; // id should never change, ever\n}\n\n// ✅ Readonly<T> — contextual, frozen at the point of use\ntype FrozenFilterParams = Readonly<ShipmentFilterParams>;\n// ShipmentFilterParams itself stays mutable — only FrozenFilterParams is frozen\n\n// ✅ combining both — a frozen snapshot of an already-partially-readonly type\nconst params: FrozenFilterParams = { status: 'active' };\nparams.status = 'delayed'; // ❌ TypeScript: cannot assign to readonly property\n\n// ✅ the original stays mutable\nconst draft: ShipmentFilterParams = { status: 'active' };\ndraft.status = 'delayed'; // ✅ fine — ShipmentFilterParams is not frozen\n```\n- interface readonly: design-time decision, permanent\n- `Readonly<T>`: use-time decision, contextual\n- both are shallow — neither protects nested object contents",
    quickRules:
      "**Quick rules:**\n- ✅ interface `readonly` — for fields that must never be mutated in any context\n- ✅ `Readonly<T>` — for freezing a type at a specific point of use without changing the source\n- ❌ `Readonly<T>` does not deep-freeze — nested objects are still mutable\n- ❌ `Required<T>` — opposite of Partial, makes all fields mandatory — not the same as Readonly\n- both readonly approaches are compile-time only — JavaScript has no runtime equivalent",
    watchOut:
      "👀 **Watch out:** `Readonly<ShipmentFilterParams>` freezes the fields of ShipmentFilterParams — but ShipmentFilterParams was already derived from `Partial<ShipmentRecord>`, which made everything optional. So FrozenFilterParams has fields that are both optional AND readonly. That means: you don't have to provide them, but if you do, you can't change them afterwards. Optional and readonly are independent modifiers — they stack.",
    dryRun:
      "🔁 **Think:** You have `type FrozenFilterParams = Readonly<ShipmentFilterParams>`. A function receives a `FrozenFilterParams` param and tries to do `params.status = undefined` to clear a filter. Does TypeScript error? Now the same function creates a new object instead: `const cleared = { ...params, status: undefined }`. Does that error? (Hint: same pattern as lesson 2 — readonly guards the original, spread creates a new unfrozen object.)",
    build:
      "**Learning focus:** Use Readonly<T> to freeze a type at the point of use — understanding the difference between readonly baked into an interface at definition time and Readonly<T> applied contextually, and that both are shallow and stack with other modifiers like optional.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Build ShipmentFilterPanel that accepts FrozenFilterParams as props. It should display the active status filter and the active destination city. When either value is missing, show a meaningful fallback label instead of leaving it blank.",
  hint: "Required for pass: (1) component typed with `FrozenFilterParams`, (2) destructure `status` and `destination`, (3) render `<p>{status ?? 'All statuses'}</p>` and `<p>{destination?.city ?? 'All cities'}</p>`.",
  example_code: `const OrderFilterPanel = ({ status, delivery }: FrozenOrderFilter): JSX.Element => {
  return (
    <div>
      <p>{status ?? 'All statuses'}</p>
      <p>{delivery?.city ?? 'All cities'}</p>
    </div>
  );
};`,
  think_prompt:
    "FrozenFilterParams fields are optional — destination might be undefined. If you write {destination.city} and destination is undefined, the app crashes. How do you safely reach into a nested field that may not exist?",
  mc_options: [
    "Use {destination.city} — TypeScript will warn if destination is undefined",
    "Use {destination?.city} — optional chaining returns undefined instead of crashing",
    "Use {destination && destination.city} — short circuit prevents the crash",
  ],
  mc_correct_option:
    "Use {destination?.city} — optional chaining returns undefined instead of crashing",
  mc_anchor:
    "Optional chaining `?.` short-circuits and returns undefined if the left side is undefined — no crash, no noise. TypeScript does not warn about undefined access on optional fields at runtime — it only checks types at compile time. The short circuit `&&` also works but is more verbose and doesn't chain as cleanly through multiple levels.",
  why_this_matters:
    "Filter params are always partial — most fields will be undefined most of the time. Every component that renders optional nested data in a real enterprise app uses optional chaining as a matter of course. Without it, a single undefined field in a nested object crashes the entire component.",
  answer_keywords: [
    "ShipmentFilterPanel", "FrozenFilterParams", "JSX.Element",
    "status", "destination", "destination?.city",
  ],
  seed_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;

type FrozenFilterParams = Readonly<ShipmentFilterParams>;`,
  starter_code: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;

type FrozenFilterParams = Readonly<ShipmentFilterParams>;

// Build ShipmentFilterPanel here
// It receives filter state as props and renders two values:
// the current status filter and the current destination city`,
  feedback_correct:
    "Exactly — optional chaining on destination?.city returns undefined safely instead of crashing. The component handles the absence of a filter value without an error.",
  feedback_partial:
    "Close — check that you're using optional chaining ?. on the nested destination field. Writing destination.city directly will crash when destination is undefined.",
  feedback_wrong:
    "Check that your props are destructured from FrozenFilterParams. Then think about what happens when destination was never set — can you safely access .city on something that might not exist?",
  expected: `interface BaseRecord {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface Location {
  city: string;
  country: string;
}

interface ShipmentRecord extends BaseRecord {
  origin: Location;
  destination: Location;
  status: 'active' | 'delayed' | 'delivered';
}

type ShipmentFilterParams = Partial<ShipmentRecord>;

type ShipmentSummary = Pick<ShipmentRecord, 'status' | 'destination'>;

type ShipmentCreateInput = Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>;

type FrozenFilterParams = Readonly<ShipmentFilterParams>;

const ShipmentFilterPanel = ({
  status,
  destination,
}: FrozenFilterParams): JSX.Element => {
  return (
    <div>
      <p>{status ?? 'All statuses'}</p>
      <p>{destination?.city ?? 'All cities'}</p>
    </div>
  );
};`,
  analog_example: `const OrderFilterPanel = ({ status, delivery }: FrozenOrderFilter): JSX.Element => {
  return (
    <div>
      <p>{status ?? 'All statuses'}</p>
      <p>{delivery?.city ?? 'All cities'}</p>
    </div>
  );
};`,
  deepDiveLabel:
    "Optional chaining returns undefined — but the JSX renders nothing. How do you show a fallback instead?",
  deepDive: {
    hook: "You render `{destination?.city}` in your filter panel. When destination is set, the city shows. When it isn't, the JSX renders nothing — a blank space where the filter value should be. A designer flags it in review: 'it should say All cities when no destination is selected, not just be empty'.\n\nYou add a conditional. Then another. By the third optional field you have a tangle of ternaries. A senior engineer looks over your shoulder and points at the `??` operator — two characters that replace the whole pattern. You'd seen it before but never connected it to this use case.",
    pain: "⚠️ **Lesson:** `{destination?.city}` renders nothing when destination is undefined. The UI shows a blank. You need it to show 'All cities' instead. What's the cleanest way to express 'show this value, or fall back to this string if it's undefined'?",
    mentalModel:
      "**Mental model:** Think of `??` as a **fallback gate**.\n- The left side is evaluated first. If it's `null` or `undefined`, the gate opens and the right side is used instead.\n- `{destination?.city ?? 'All cities'}` reads as: *reach into destination for city — if that's undefined, show 'All cities'*.\n- This is different from `||` — the OR operator also falls back, but it falls back on any falsy value including `0`, `''`, and `false`. `??` only falls back on `null` and `undefined` — making it safer for form values where `0` or an empty string is a valid user input.\n- The two operators chain naturally with optional chaining: `destination?.city ?? 'All cities'` is a single expression that handles both the missing object and the missing string in one line.",
    discover:
      "**Pattern — optional chaining + nullish coalescing:**\n```tsx\n// ✅ optional chaining — safely reaches into optional nested field\n<p>{destination?.city}</p>\n// renders: city string, or nothing if destination is undefined\n\n// ✅ nullish coalescing — provides a fallback for undefined/null\n<p>{destination?.city ?? 'All cities'}</p>\n// renders: city string, or 'All cities' if destination or city is undefined\n\n// ✅ chaining multiple levels\n<p>{order?.address?.city ?? 'Unknown'}</p>\n\n// ⚠️ OR operator — falls back on any falsy value, not just undefined\n<p>{destination?.city || 'All cities'}</p>\n// renders 'All cities' even if city is '' — may not be intended\n\n// ❌ no optional chaining — crashes when destination is undefined\n<p>{destination.city}</p>\n```\n- `?.` short-circuits to undefined if the left side is nullish\n- `??` provides a fallback only for null and undefined — not for 0 or ''\n- `||` provides a fallback for any falsy value — use with caution on form data",
    quickRules:
      "**Quick rules:**\n- ✅ `value?.nested` — safe access, returns undefined instead of crashing\n- ✅ `value ?? 'fallback'` — shows fallback only when value is null or undefined\n- ✅ `value?.nested ?? 'fallback'` — chain both for safe access with a fallback\n- ❌ `value.nested` when value might be undefined — runtime crash\n- ❌ `value || 'fallback'` for numeric or string form values — 0 and '' trigger the fallback unintentionally",
    watchOut:
      "👀 **Watch out:** `destination?.city ?? 'All cities'` renders the string 'All cities' in the DOM — JSX treats it as a text node. But `{undefined}` renders nothing at all — no DOM node. If your layout depends on a consistent number of elements being present, a missing filter value and a fallback string are not equivalent. Design your layout to handle both.",
    dryRun:
      "🔁 **Think:** You have `{status ?? 'All statuses'}`. The user selects 'active' — renders 'active'. The user clears the filter — status becomes undefined — renders 'All statuses'. Now status becomes an empty string `''` instead of undefined. What does `??` render — 'All statuses' or an empty string? What does `||` render? (Hint: `??` only catches null and undefined — `''` is falsy but not nullish.)",
    build:
      "**Learning focus:** Combine optional chaining and nullish coalescing to safely render optional nested values in JSX — understanding that ?. prevents crashes on undefined objects and ?? provides a fallback only for null and undefined, making the two operators natural partners for optional data.",
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
  lessonNum: 3,
  title: "TypeScript — Utility Types",
  shortName: "TS — FILTER PANEL",
});
import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #5 (TypeScript)",
      title: "TypeScript — Enums",
      body: "Enums give a set of related constants a single name in the type system. String enums are especially common in React apps — they model fixed sets like shipment lifecycle states, filter modes, or API error codes. In this lesson you declare enums, use them in props and unions, and see how they compare to string-literal unions so you can pick the right tool.",
      usecase:
        "A logistics dashboard labels every shipment as Draft, Submitted, In Transit, or Delivered. Those labels appear in dropdowns, badges, and API payloads. An enum (or a disciplined union) keeps every screen and every handler aligned on the exact same spellings — refactors rename in one place, and TypeScript blocks impossible states at compile time.",
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
        reason: "You render enum values inside JSX and pass them as props. You need JSX expressions, attributes, and the component shell from Lesson 1 before wiring enum-typed props into the UI.",
      },
      {
        lesson: 2,
        label: "Inventory row — readonly fields, unions, nested types",
        reason: "Enums are often combined with interfaces — for example a ShipmentCard props interface with status: ShipmentLifecycle. Lesson 2 is where interfaces and type aliases become fluent.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Declare a string enum that names a fixed set of domain states",
      "Use an enum member as a prop type and pass it from JSX",
      "Explain when a string enum is preferable to a union of string literals",
      "Use Object.values with a string enum in a type-safe way for UI lists",
      "Recognise that numeric enums behave differently at runtime than string enums",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare a string enum called ShipmentLifecycle with exactly these members: Draft = 'draft', Submitted = 'submitted', InTransit = 'in_transit', Delivered = 'delivered'.",
    hint: "String enums assign a string literal to each member. The enum name is PascalCase; member names follow TypeScript identifier rules — use InTransit for the multi-word state.",
    example_code: `enum OrderPhase {
  Pending = 'pending',
  Paid = 'paid',
}`,
    think_prompt:
      "You want every comparison and every API payload to use the same four spellings. What TypeScript construct groups those constants and exposes them as both values and a type?",
    mc_options: [
      "type ShipmentLifecycle = 'draft' | 'submitted' | 'in_transit' | 'delivered'",
      "enum ShipmentLifecycle { Draft = 'draft', Submitted = 'submitted', InTransit = 'in_transit', Delivered = 'delivered' }",
      "const ShipmentLifecycle = ['draft', 'submitted', 'in_transit', 'delivered']",
    ],
    mc_correct_option:
      "enum ShipmentLifecycle { Draft = 'draft', Submitted = 'submitted', InTransit = 'in_transit', Delivered = 'delivered' }",
    mc_anchor:
      "A union of literals is a valid alternative, but the question asks for an enum declaration. A bare string array is a runtime value only — it does not create a ShipmentLifecycle type for props.",
    why_this_matters:
      "String enums compile to a real JavaScript object you can iterate for dropdowns while still giving a distinct type name for props and function parameters.",
    answer_keywords: ["enum", "ShipmentLifecycle", "Draft", "Submitted", "InTransit", "Delivered", "string"],
    seed_code: "",
    starter_code: "// declare ShipmentLifecycle string enum here",
    feedback_correct:
      "Correct — a string enum ties readable member names to stable string values your API and CSS can share.",
    feedback_partial: "Check spelling of InTransit and the underscore value 'in_transit' — string enums use the exact runtime strings you assign.",
    feedback_wrong:
      "Use `enum ShipmentLifecycle { Draft = 'draft', Submitted = 'submitted', InTransit = 'in_transit', Delivered = 'delivered' }`.",
    expected: `enum ShipmentLifecycle {
  Draft = 'draft',
  Submitted = 'submitted',
  InTransit = 'in_transit',
  Delivered = 'delivered',
}`,
    analog_example: `enum RouteKind {
  Sea = 'sea',
  Air = 'air',
  Road = 'road',
}`,
    deepDiveLabel: "String enum vs union of literals — when does either win?",
    deepDive: {
      hook: "Your team bans enums because bundle size. Another team swears by them for refactor safety. Both ship production TypeScript.",
      pain: "⚠️ **Lesson:** A string enum generates a runtime object; a union type erases completely. What do you lose if you only use a union?",
      mentalModel:
        "**Mental model:** A string enum is both a **type** and a **value namespace**. A union is **only a type** — you repeat string literals at call sites unless you centralise constants yourself.",
      discover:
        "**Pattern:**\n```ts\nenum Status { On = 'on', Off = 'off' }\nconst x: Status = Status.On;\n```\nvs\n```ts\nconst Status = { On: 'on', Off: 'off' } as const;\ntype Status = typeof Status[keyof typeof Status];\n```",
      quickRules:
        "**Quick rules:**\n- ✅ String enum when you want Status.Delivered everywhere\n- ✅ Union when the set is tiny and literals are obvious\n- ❌ Numeric enum for API string fields — easy mismatch",
      watchOut: "👀 **Watch out:** `const enum` inlines and can surprise you across package boundaries — many codebases stick to string enums or `as const` objects.",
      dryRun: "🔁 If you rename enum member `InTransit` to `EnRoute`, what breaks at compile time vs runtime?",
      build: "**Learning focus:** Declare a string enum as a named set of stable string constants shared by types and runtime code.",
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Given ShipmentLifecycle from step 1, write a props interface ShipmentBadgeProps with one field: lifecycle of type ShipmentLifecycle (the enum type, not string).",
    hint: "The enum's name is both a value and a type — ShipmentLifecycle as a type means 'any member of that enum'.",
    example_code: `interface BadgeProps {
  phase: OrderPhase;
}`,
    think_prompt: "You want parents to pass only valid lifecycle members. How do you reference the enum as a type inside an interface?",
    mc_options: [
      "interface ShipmentBadgeProps { lifecycle: 'draft' | 'submitted' }",
      "interface ShipmentBadgeProps { lifecycle: ShipmentLifecycle }",
      "interface ShipmentBadgeProps { lifecycle: enum ShipmentLifecycle }",
    ],
    mc_correct_option: "interface ShipmentBadgeProps { lifecycle: ShipmentLifecycle }",
    mc_anchor:
      "The enum identifier without quotes is the type of all its members. You cannot write `enum ShipmentLifecycle` inside a field type.",
    why_this_matters:
      "Props typed to the enum reject arbitrary strings — only ShipmentLifecycle.* values type-check.",
    answer_keywords: ["interface", "ShipmentBadgeProps", "lifecycle", "ShipmentLifecycle"],
    seed_code: `enum ShipmentLifecycle {
  Draft = 'draft',
  Submitted = 'submitted',
  InTransit = 'in_transit',
  Delivered = 'delivered',
}`,
    starter_code: `enum ShipmentLifecycle {
  Draft = 'draft',
  Submitted = 'submitted',
  InTransit = 'in_transit',
  Delivered = 'delivered',
}

// interface ShipmentBadgeProps here`,
    feedback_correct: "Yes — `lifecycle: ShipmentLifecycle` ties the prop to the enum type.",
    feedback_partial: "Make sure you use the enum name as the type, not a subset of string literals, unless you intentionally want a narrower union.",
    feedback_wrong: "Use `interface ShipmentBadgeProps { lifecycle: ShipmentLifecycle }`.",
    expected: `enum ShipmentLifecycle {
  Draft = 'draft',
  Submitted = 'submitted',
  InTransit = 'in_transit',
  Delivered = 'delivered',
}

interface ShipmentBadgeProps {
  lifecycle: ShipmentLifecycle;
}`,
    analog_example: "",
    deepDiveLabel: "Enum as type vs typeof enum",
    deepDive: {
      hook: "Someone writes `lifecycle: typeof ShipmentLifecycle` on props. Does that type the same thing?",
      pain: "⚠️ **Lesson:** `typeof EnumName` is the type of the enum object itself, not a member.",
      mentalModel: "**Mental model:** Use `ShipmentLifecycle` for a member value; use `typeof ShipmentLifecycle` when you mean the object with `.Draft`, `.Submitted`, … keys.",
      discover: "```ts\nconst x: ShipmentLifecycle = ShipmentLifecycle.Draft;\nconst y: typeof ShipmentLifecycle = ShipmentLifecycle;\n```",
      quickRules: "- ✅ prop: ShipmentLifecycle\n- ❌ prop: typeof ShipmentLifecycle (unless you really want the object)",
      watchOut: "",
      dryRun: "",
      build: "",
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "In JSX, pass the Submitted member into ShipmentBadge: `<ShipmentBadge lifecycle={...} />` — pick the correct expression inside the braces.",
    hint: "Enum members are values on the enum object — use the same identifier you declared, with dot syntax.",
    example_code: `<StatusToggle enabled={SwitchState.On} />`,
    think_prompt: "Which expression evaluates to the runtime string 'submitted' and is typed as ShipmentLifecycle?",
    mc_options: [
      "`'submitted'`",
      "`ShipmentLifecycle.Submitted`",
      "`ShipmentLifecycle['Submitted']`",
    ],
    mc_correct_option: "`ShipmentLifecycle.Submitted`",
    mc_anchor:
      "The raw string might match at runtime but skips the enum type unless contextually typed. Dot access is idiomatic and checked.",
    why_this_matters:
      "Using `ShipmentLifecycle.Submitted` survives renames — find-all-references updates enum members together.",
    answer_keywords: ["ShipmentLifecycle", "Submitted"],
    seed_code: `enum ShipmentLifecycle {
  Draft = 'draft',
  Submitted = 'submitted',
  InTransit = 'in_transit',
  Delivered = 'delivered',
}

interface ShipmentBadgeProps {
  lifecycle: ShipmentLifecycle;
}

const ShipmentBadge = ({ lifecycle }: ShipmentBadgeProps): JSX.Element => (
  <span>{lifecycle}</span>
);`,
    starter_code: `// fill JSX: <ShipmentBadge lifecycle={???} />`,
    feedback_correct: "Right — enum members are values accessed through the enum object.",
    feedback_partial: "Bracket access works but dot syntax is the default style in most codebases.",
    feedback_wrong: "Use `lifecycle={ShipmentLifecycle.Submitted}`.",
    expected: `lifecycle={ShipmentLifecycle.Submitted}`,
    analog_example: "",
    deepDiveLabel: "Enum members in JSX",
    deepDive: {
      hook: "Enum members are values — import or scope the enum where you render.",
      pain: "⚠️ Mixing raw strings and enums loses rename safety.",
      mentalModel: "Treat `ShipmentLifecycle.Submitted` as the canonical value at call sites.",
      discover: "```tsx\n<ShipmentBadge lifecycle={ShipmentLifecycle.Submitted} />\n```",
      quickRules: "- ✅ Dot member for props\n- ❌ Magic strings on enum-typed props",
      watchOut: "",
      dryRun: "",
      build: "",
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "You need an array of all ShipmentLifecycle values for a `<select>`. Which expression is the usual type-safe approach in modern TypeScript?",
    hint: "String enums compile to objects mapping keys to string values — `Object.values` returns the value side.",
    example_code: `const all = Object.values(SomeEnum) as SomeEnum[];`,
    think_prompt: "You want `['draft','submitted',...]` at runtime with elements typed as ShipmentLifecycle.",
    mc_options: [
      "`Object.keys(ShipmentLifecycle)`",
      "`Object.values(ShipmentLifecycle) as ShipmentLifecycle[]`",
      "`ShipmentLifecycle.map(...)`",
    ],
    mc_correct_option: "`Object.values(ShipmentLifecycle) as ShipmentLifecycle[]`",
    mc_anchor:
      "`Object.keys` mixes reverse mapping noise on numeric enums and string keys for string enums. Enums are not arrays — no `.map`. Casting values tells TypeScript the string array is only enum members.",
    why_this_matters:
      "Driving UI lists from the enum keeps new states appearing everywhere automatically.",
    answer_keywords: ["Object.values", "ShipmentLifecycle", "as"],
    seed_code: "",
    starter_code: "",
    feedback_correct: "Good — values + assertion is the common pattern for string enums.",
    feedback_partial: "If you skip the cast, TypeScript may infer `string[]` — losing exhaustiveness checks downstream.",
    feedback_wrong: "Use `Object.values(ShipmentLifecycle) as ShipmentLifecycle[]`.",
    expected: `Object.values(ShipmentLifecycle) as ShipmentLifecycle[]`,
    analog_example: "",
    deepDiveLabel: "Object.values + string enums",
    deepDive: {
      hook: "Build select options from the enum so new states appear automatically.",
      pain: "⚠️ TypeScript may infer `string[]` without a cast.",
      mentalModel: "`Object.values` reads the runtime object the enum becomes.",
      discover: "`const options = Object.values(ShipmentLifecycle) as ShipmentLifecycle[];`",
      quickRules: "- ✅ Cast to enum array for selects\n- ❌ Assuming keys === values",
      watchOut: "",
      dryRun: "",
      build: "",
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Pick the statement that best describes numeric enums in TypeScript at runtime.",
    hint: "Numeric enums reverse-map from value to name — string enums do not.",
    example_code: "",
    think_prompt: "Why do many API-facing codebases prefer string enums for persisted state?",
    mc_options: [
      "Numeric enums erase completely — there is no JavaScript output",
      "Numeric enums emit a reverse lookup object; string enums behave like plain string maps",
      "Numeric enums cannot be used as React prop types",
    ],
    mc_correct_option:
      "Numeric enums emit a reverse lookup object; string enums behave like plain string maps",
    mc_anchor:
      "Numeric enums compile to bidirectional objects; string enums compile to simple key→string objects without reverse mapping.",
    why_this_matters:
      "Serialising numeric enums across services is fragile unless everyone agrees on the integer mapping — strings are self-describing.",
    answer_keywords: ["numeric", "reverse", "string", "enum"],
    seed_code: "",
    starter_code: "",
    feedback_correct: "Exactly — this is why domain state exposed to APIs is usually string-backed.",
    feedback_partial: "",
    feedback_wrong: "Choose the option about reverse lookup vs plain string maps.",
    expected: "Numeric enums emit a reverse lookup object; string enums behave like plain string maps",
    analog_example: "",
    deepDiveLabel: "Numeric vs string enums",
    deepDive: {
      hook: "Numeric enums add reverse mappings — know the runtime shape.",
      pain: "⚠️ Serialising numbers across services is harder than strings.",
      mentalModel: "String enums map names to stable wire values in one object.",
      discover: "Prefer string enums (or const objects) for persisted domain state.",
      quickRules: "- ✅ String enum for API payloads\n- ⚠️ Numeric enum for tight internal flags only",
      watchOut: "",
      dryRun: "",
      build: "",
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
  lessonNum: 5,
  title: "TypeScript — Enums",
  shortName: "TS — ENUMS",
});

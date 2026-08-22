import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #4 (TypeScript)",
    title: "TypeScript — Generics in Components",
    body: "You already know how to type a component for a specific shape. Generics take that further — they let you write one component that works for any shape, while TypeScript still enforces full type safety on whatever shape you pass in. You'll build a reusable list component that can render shipments, drivers, warehouses, or any record type without being rewritten.",
    usecase:
      "When data comes from an API, you often don't know the exact shape at component design time — but you know something about it. Generics let you say 'I don't know the full shape yet, but I know it has at least these fields' — and TypeScript enforces that contract at every callsite. This is the pattern behind every truly reusable data component in a real enterprise app.",
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
      reason: "The DataList component you build here maps over an array in JSX — {items.map((item) => <div key={item.id}>{renderItem(item)}</div>)} — and the renderItem function returns JSX.Element. You need to know JSX expressions, the component shell, and what JSX.Element means before the generic component you build here makes sense.",
    },
    {
      lesson: 2,
      label: "Inventory row — readonly fields, unions, nested types",
      reason: "The type constraint T extends BaseRecord is what lets DataList use item.id as the key prop — because BaseRecord guarantees that field exists. BaseRecord was defined in Lesson 2. Without knowing what extends means and how BaseRecord is structured, the constraint in this lesson looks like magic rather than a deliberate contract.",
    },
    {
      lesson: 3,
      label: "TypeScript — Utility Types",
      reason: "Generics and utility types are both about transforming or constraining a type rather than defining one from scratch. Lesson 3 builds that mental model — deriving a new type from an existing one in one line. The T extends BaseRecord constraint here is the same idea: you are not defining what T is, you are constraining what it must include. Without Lesson 3, this distinction between defining and constraining is much harder to grasp.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Define a generic props interface that accepts a type parameter to describe the shape of each list item",
    "Constrain a generic type parameter with extends so TypeScript guarantees minimum required fields",
    "Build a generic component that works for any record type without being rewritten",
    "Map over a generic array in JSX using a constrained field as the key prop",
    "Call a generic component with a specific type argument and a matching renderItem function",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Define a generic props interface called DataListProps that accepts a type parameter T. It needs two fields — items as an array of T, and renderItem as a function that receives one T and returns JSX.Element.",
  hint: "A generic interface uses angle brackets after the name: interface DataListProps<T>. The type parameter T then flows into the field types inside.",
  example_code: `interface TableProps<T> {
  rows: T[];
  renderRow: (row: T) => JSX.Element;
}`,
  think_prompt:
    "DataList needs to work for shipments, drivers, warehouses — any record type. The items array and the renderItem function both depend on the same unknown shape. How do you define an interface that stays flexible on the shape but still enforces that items and renderItem agree on the same type?",
  mc_options: [
    "interface DataListProps { items: object[]; renderItem: (item: object) => JSX.Element }",
    "interface DataListProps<T> { items: T[]; renderItem: (item: T) => JSX.Element }",
    "interface DataListProps { items: unknown[]; renderItem: (item: unknown) => JSX.Element }",
  ],
  mc_correct_option:
    "interface DataListProps<T> { items: T[]; renderItem: (item: T) => JSX.Element }",
  mc_anchor:
    "The type parameter T flows through both fields — items is an array of T and renderItem receives one T. This means TypeScript guarantees that whatever type the caller passes in for items, renderItem will receive exactly that same type. The object and unknown options both lose that connection — the array and the function are no longer guaranteed to agree on the same shape.",
  why_this_matters:
    "A generic props interface is the foundation of every reusable data component. The T parameter is a placeholder that gets filled in at the callsite — when someone uses DataList with ShipmentRecord, TypeScript replaces every T with ShipmentRecord and checks the whole component against that shape. One interface definition, infinite reuse.",
  answer_keywords: [
    "interface", "DataListProps", "<T>", "items", "T[]", "renderItem", "JSX.Element",
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

// define DataListProps<T> interface here`,
  feedback_correct:
    "Exactly — T flows through both fields, locking items and renderItem to the same shape. Whatever the caller passes in for items, TypeScript guarantees renderItem will receive the exact same type.",
  feedback_partial:
    "Close — check that T appears in both fields: items as T[] and renderItem as a function that receives T and returns JSX.Element.",
  feedback_wrong:
    "The pattern is: `interface DataListProps<T> { items: T[]; renderItem: (item: T) => JSX.Element }` — the angle bracket T after the interface name is the type parameter that flows into both fields.",
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

interface DataListProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}`,
  analog_example: `interface TableProps<T> {
  rows: T[];
  renderRow: (row: T) => JSX.Element;
}`,
  deepDiveLabel:
    "T is just a placeholder — so why not use any or object instead?",
  deepDive: {
    hook: "You show your generic interface to a teammate. They squint at the `<T>` and say: 'why not just use `any[]` for items? It's simpler and it works for any type.' You pause. They're right that it works. But something feels wrong about it.\n\nYou try it. `items: any[]` and `renderItem: (item: any) => JSX.Element`. The component compiles. You pass a ShipmentRecord array for items and write a renderItem that accesses `item.status`. TypeScript says nothing. Then you accidentally pass a DriverRecord array but forget to update renderItem — it still tries to access `item.status`. TypeScript still says nothing. The component renders garbage data at runtime and you spend an hour debugging.\n\nWith `T`, that bug is impossible. TypeScript sees that items is `DriverRecord[]` and renderItem expects `ShipmentRecord` — the types don't match and it errors immediately at the callsite.",
    pain: "⚠️ **Lesson:** You replace T with any in DataListProps. Everything compiles. But you pass a DriverRecord array for items and a ShipmentRecord renderItem function — TypeScript raises no objection. The component renders wrong data silently. How does T prevent this class of bug that any cannot?",
    mentalModel:
      "**Mental model:** Think of T as a **matching wristband system at an event**.\n- When someone enters (calls the component), they get a wristband with a colour — that's T being resolved to a specific type like ShipmentRecord.\n- Every door inside the event checks for that exact wristband colour — items must be ShipmentRecord[], renderItem must accept ShipmentRecord. Wrong colour, you don't get in.\n- `any` removes the wristband check entirely. Anyone gets in anywhere. The system looks secure but enforces nothing.\n- `object` and `unknown` are different kinds of vague — they don't connect items and renderItem to each other. You could pass a ShipmentRecord array and a DriverRecord renderItem and TypeScript would shrug.\n- T is the wristband. It connects every use of the same type parameter to the same resolved type — across every field, every function parameter, every return value.",
    discover:
      "**Pattern — generic vs any:**\n```tsx\n// ✅ generic — T connects items and renderItem to the same type\ninterface DataListProps<T> {\n  items: T[];\n  renderItem: (item: T) => JSX.Element;\n}\n\n// ❌ any — items and renderItem are disconnected, no safety\ninterface DataListProps {\n  items: any[];\n  renderItem: (item: any) => JSX.Element;\n}\n\n// ❌ object — too broad, loses all field information\ninterface DataListProps {\n  items: object[];\n  renderItem: (item: object) => JSX.Element;\n  // item.status ❌ — TypeScript: property does not exist on object\n}\n```\n- T = placeholder resolved at callsite, enforced throughout\n- any = opt out of TypeScript entirely for that value\n- object = valid type but too broad — you lose access to specific fields",
    quickRules:
      "**Quick rules:**\n- ✅ `<T>` — type parameter, resolved at callsite, enforced everywhere T appears\n- ✅ T connects multiple fields to the same resolved type automatically\n- ❌ `any` — disables type checking, silent runtime bugs\n- ❌ `object` — too broad, field access fails at compile time\n- ❌ `unknown` — requires type narrowing before every use — useful in other contexts, not for generic components",
    watchOut:
      "👀 **Watch out:** T is just a name — convention uses single uppercase letters (T, K, V) but you can name it anything. `interface DataListProps<Item>` is valid and sometimes more readable than `<T>`. The name doesn't matter — what matters is that it's consistent within the interface. Every place you write `Item` inside the interface refers to the same resolved type.",
    dryRun:
      "🔁 **Think:** You have `interface DataListProps<T> { items: T[]; renderItem: (item: T) => JSX.Element }`. A caller passes `items={shipments}` where shipments is `ShipmentRecord[]`. TypeScript resolves T as ShipmentRecord. Now what type does renderItem expect for its item parameter — and what happens if the caller passes a function that expects a DriverRecord instead? (Hint: T is resolved once per callsite — every use of T in that call must match the resolved type.)",
    build:
      "**Learning focus:** Define a generic interface with a type parameter T — understanding that T is a placeholder resolved at the callsite that connects multiple fields to the same concrete type, providing type safety that any and object cannot.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Update DataListProps<T> to constrain T so it must extend BaseRecord. This guarantees that every item in the list always has an id, createdAt, and updatedAt field — regardless of what specific record type the caller passes in.",
  hint: "A constraint uses the extends keyword inside the angle brackets: <T extends BaseRecord>.",
  example_code: `interface TableProps<T extends BaseEntity> {
  rows: T[];
  renderRow: (row: T) => JSX.Element;
}`,
  think_prompt:
    "DataList will use item.id as the key prop when rendering the list. But T is currently unconstrained — it could be anything, including a type with no id field. How do you tell TypeScript that T must always have at least the fields from BaseRecord?",
  mc_options: [
    "interface DataListProps<T> { items: T[]; renderItem: (item: T) => JSX.Element; keyField: string }",
    "interface DataListProps<T extends BaseRecord> { items: T[]; renderItem: (item: T) => JSX.Element }",
    "interface DataListProps<T extends object> { items: T[]; renderItem: (item: T) => JSX.Element }",
  ],
  mc_correct_option:
    "interface DataListProps<T extends BaseRecord> { items: T[]; renderItem: (item: T) => JSX.Element }",
  mc_anchor:
    "T extends BaseRecord is a constraint — it tells TypeScript that T can be any type, as long as it has at least the fields from BaseRecord. That guarantees item.id is always available for the key prop. The first option adds a separate keyField string which loses type safety. The third option constrains to object which is too broad — object has no id field.",
  why_this_matters:
    "This is the pattern behind safe API data components. When data comes from an API you don't control, you know some things about the shape — every record has an id — but not everything. T extends BaseRecord says exactly that: 'I don't know the full shape, but I know it has at least these fields.' TypeScript enforces that at every callsite — no record without an id can ever be passed to DataList.",
  answer_keywords: [
    "interface", "DataListProps", "<T extends BaseRecord>", "items", "T[]", "renderItem", "JSX.Element",
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

interface DataListProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
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

// update DataListProps to constrain T to extend BaseRecord
interface DataListProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}`,
  feedback_correct:
    "Exactly — T extends BaseRecord means TypeScript guarantees item.id is always available, no matter which record type the caller passes in. The constraint is the minimum contract.",
  feedback_partial:
    "Close — make sure the constraint is inside the angle brackets: <T extends BaseRecord>, not added as a separate field or condition.",
  feedback_wrong:
    "The pattern is: `interface DataListProps<T extends BaseRecord>` — the extends keyword inside the angle brackets constrains what T is allowed to be.",
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}`,
  analog_example: `interface TableProps<T extends BaseEntity> {
  rows: T[];
  renderRow: (row: T) => JSX.Element;
}`,
  deepDiveLabel:
    "extends on an interface means inheritance — but extends inside angle brackets means something different. What's the distinction?",
  deepDive: {
    hook: "You've now seen extends in two completely different contexts across these lessons.\n\nIn lesson 2: `interface ShipmentRecord extends BaseRecord` — ShipmentRecord inherits all of BaseRecord's fields. That's classical inheritance — child gets everything from the parent.\n\nNow: `<T extends BaseRecord>` — T doesn't inherit anything from BaseRecord. T is still a placeholder. extends here is a constraint — it's saying T must be compatible with BaseRecord, meaning it must have at least those fields. T could be ShipmentRecord, DriverRecord, or any other type — as long as it satisfies the BaseRecord shape.\n\nSame keyword. Two completely different jobs. One copies fields down. The other sets a minimum requirement.",
    pain: "⚠️ **Lesson:** You remove the constraint and use plain `<T>`. You pass a custom object `{ name: 'test' }` as an item. TypeScript accepts it. Then the component tries to use `item.id` as the key prop — and errors because id doesn't exist on `{ name: string }`. How does `T extends BaseRecord` prevent this at the callsite rather than inside the component?",
    mentalModel:
      "**Mental model:** Think of `T extends BaseRecord` as a **bouncer at the component door with a checklist**.\n- The checklist has three items: id, createdAt, updatedAt.\n- Any type that wants to be T must show all three. ShipmentRecord passes — it has all three inherited from BaseRecord. DriverRecord passes — same. A plain `{ name: string }` object fails — no id, turned away at the door.\n- The bouncer checks at the *callsite* — before the component even runs. The error appears where DataList is used, not inside DataList itself.\n- Unconstrained T has no bouncer — anything gets in, and the component crashes when it tries to access id on something that doesn't have it.",
    discover:
      "**Pattern — constrained generic:**\n```tsx\n// ✅ constrained — T must have at least BaseRecord's fields\ninterface DataListProps<T extends BaseRecord> {\n  items: T[];\n  renderItem: (item: T) => JSX.Element;\n}\n\n// ✅ ShipmentRecord passes the constraint — it extends BaseRecord\nconst shipmentList: DataListProps<ShipmentRecord> = { ... };\n\n// ❌ plain object fails the constraint — no id field\nconst badList: DataListProps<{ name: string }> = { ... };\n// TypeScript: { name: string } does not satisfy constraint BaseRecord\n\n// ✅ extends in interface = inheritance — copies fields down\ninterface ShipmentRecord extends BaseRecord { ... }\n\n// ✅ extends in angle brackets = constraint — sets minimum requirement\ninterface DataListProps<T extends BaseRecord> { ... }\n```\n- `extends` in interface definition = inheritance\n- `extends` in angle brackets = constraint, minimum shape requirement\n- same keyword, different context, different meaning",
    quickRules:
      "**Quick rules:**\n- ✅ `<T extends BaseRecord>` — T can be any type that satisfies BaseRecord's shape\n- ✅ constraint is checked at the callsite — wrong types are caught where DataList is used\n- ❌ unconstrained `<T>` — no guarantee item.id exists, crashes inside the component\n- ❌ `<T extends object>` — too broad, object has no fields, id is still not guaranteed\n- extends in angle brackets = minimum contract, not inheritance",
    watchOut:
      "👀 **Watch out:** `T extends BaseRecord` doesn't mean T *is* BaseRecord — it means T has *at least* the fields of BaseRecord. ShipmentRecord satisfies the constraint even though it has additional fields. TypeScript uses structural typing — if the shape fits, the type fits. The constraint is a floor, not a ceiling.",
    dryRun:
      "🔁 **Think:** You have `interface DataListProps<T extends BaseRecord>`. A teammate creates a new type `interface WarehouseRecord extends BaseRecord { capacity: number }` and tries to use it with DataList. Does it pass the constraint? Now they create `type RawApiResponse = { data: string }` and try to use that. Does it pass? (Hint: the constraint checks for id, createdAt, updatedAt — does each type have all three?)",
    build:
      "**Learning focus:** Constrain a generic type parameter with extends to set a minimum shape requirement — understanding that T extends BaseRecord means T must have at least those fields, that the constraint is checked at the callsite not inside the component, and that extends in angle brackets means constraint not inheritance.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Define the DataList component shell — a generic arrow function that accepts DataListProps<T> and returns JSX.Element. The type parameter T must carry the same BaseRecord constraint as the interface.",
  hint: "A generic component uses the type parameter on the function itself: const DataList = <T extends BaseRecord>(...). The constraint must be repeated on the function — it doesn't carry over automatically from the interface.",
  example_code: `const DataTable = <T extends BaseEntity>({
  rows,
  renderRow,
}: TableProps<T>): JSX.Element => {
  return <></>;
};`,
  think_prompt:
    "The interface is generic — but the component function itself also needs to declare the same type parameter so TypeScript can flow T through both the props and the JSX. How do you put a constrained type parameter on an arrow function component?",
  mc_options: [
    "const DataList = ({ items, renderItem }: DataListProps<ShipmentRecord>): JSX.Element => { return <></>; }",
    "const DataList = <T extends BaseRecord>({ items, renderItem }: DataListProps<T>): JSX.Element => { return <></>; }",
    "const DataList = <T>({ items, renderItem }: DataListProps<T>): JSX.Element => { return <></>; }",
  ],
  mc_correct_option:
    "const DataList = <T extends BaseRecord>({ items, renderItem }: DataListProps<T>): JSX.Element => { return <></>; }",
  mc_anchor:
    "The type parameter <T extends BaseRecord> on the function is what makes this component generic — it's resolved fresh at every callsite. Hardcoding ShipmentRecord in the first option makes the component specific, not reusable. The third option drops the constraint — T is unconstrained and item.id is no longer guaranteed inside the component.",
  why_this_matters:
    "A generic component is one definition that works for any compatible type. The type parameter on the function is what makes that possible — TypeScript resolves T differently for each callsite, checking the full type safety of each call independently. One component, many record types, zero code duplication.",
  answer_keywords: [
    "const", "DataList", "<T extends BaseRecord>", "DataListProps<T>", "JSX.Element", "=>", "return", "<>", "</>",
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

// define the DataList generic component shell here`,
  feedback_correct:
    "Exactly — the type parameter on the function mirrors the constraint on the interface. TypeScript now resolves T independently at each callsite and checks full type safety for each one.",
  feedback_partial:
    "Close — check two things: is the type parameter on the function itself with the BaseRecord constraint, and is DataListProps<T> used in the parameter with T flowing through?",
  feedback_wrong:
    "The pattern is: `const DataList = <T extends BaseRecord>({ items, renderItem }: DataListProps<T>): JSX.Element => { return <></>; }` — the constraint on the function must match the constraint on the interface.",
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

const DataList = <T extends BaseRecord>({
  items,
  renderItem,
}: DataListProps<T>): JSX.Element => {
  return <></>;
};`,
  analog_example: `const DataTable = <T extends BaseEntity>({
  rows,
  renderRow,
}: TableProps<T>): JSX.Element => {
  return <></>;
};`,
  deepDiveLabel:
    "In a .tsx file, <T> on an arrow function is ambiguous — the parser thinks it might be JSX. How do you fix that?",
  deepDive: {
    hook: "You write your generic component perfectly:\n\n```tsx\nconst DataList = <T>({ items }: DataListProps<T>): JSX.Element => {\n  return <></>;\n};\n```\n\nThe editor red-squiggles the whole thing. The error is cryptic — something about JSX element implicitly having type any. You haven't changed the logic. The types look right. You stare at it for ten minutes.\n\nThe problem isn't your types. It's the parser. In a `.tsx` file, the compiler sees `<T>` and doesn't know if it's a JSX opening tag or a generic type parameter. It guesses JSX — and then gets confused when the rest doesn't look like a JSX element.\n\nThe fix is one character: `<T extends BaseRecord>`. The `extends` keyword is not valid in a JSX tag — so the parser immediately knows it's a type parameter, not JSX. The ambiguity disappears.",
    pain: "⚠️ **Lesson:** You write `<T>` on your arrow function in a .tsx file. TypeScript errors with a confusing JSX-related message even though your logic is correct. Why does the parser misread `<T>` — and why does adding `extends BaseRecord` fix it?",
    mentalModel:
      "**Mental model:** Think of the `.tsx` parser as a **reader who sees angle brackets and has to guess**.\n- In a `.ts` file, angle brackets always mean generics — there's no JSX. No ambiguity.\n- In a `.tsx` file, angle brackets could mean JSX tags OR generic type parameters. The parser has to decide based on context.\n- `<T>` alone looks exactly like a JSX opening tag — `<T>` could be a component called T. The parser guesses JSX and gets confused.\n- `<T extends BaseRecord>` is unambiguous — `extends` is not valid inside a JSX tag. The parser immediately knows it's a generic. Problem solved.\n- This is why the constraint isn't just semantically useful — in `.tsx` files it's also syntactically necessary for unconstrained generics on arrow functions.",
    discover:
      "**Pattern — generic arrow function in .tsx:**\n```tsx\n// ❌ ambiguous in .tsx — parser may read <T> as a JSX tag\nconst DataList = <T>({ items }: DataListProps<T>): JSX.Element => {\n  return <></>;\n};\n\n// ✅ unambiguous — extends keyword signals generic, not JSX\nconst DataList = <T extends BaseRecord>({ items }: DataListProps<T>): JSX.Element => {\n  return <></>;\n};\n\n// ✅ also works — trailing comma disambiguates (less common)\nconst DataList = <T,>({ items }: DataListProps<T>): JSX.Element => {\n  return <></>;\n};\n\n// ✅ no ambiguity in .ts files — but we use .tsx for JSX support\n```\n- `.tsx` files need disambiguation for generic arrow functions\n- `extends` is the cleanest fix — it's also semantically correct\n- trailing comma `<T,>` also works but reads strangely\n- function declarations (`function DataList<T>`) have no ambiguity — only arrow functions",
    quickRules:
      "**Quick rules:**\n- ✅ `<T extends BaseRecord>` on arrow functions in .tsx — unambiguous and semantically correct\n- ✅ `<T,>` trailing comma — also disambiguates but less readable\n- ❌ `<T>` alone on an arrow function in .tsx — parser may misread as JSX\n- function declarations `function DataList<T extends BaseRecord>` — no ambiguity, also valid\n- this issue only occurs in .tsx files — .ts files have no JSX and no ambiguity",
    watchOut:
      "👀 **Watch out:** The JSX ambiguity error message from TypeScript is notoriously unhelpful — it mentions JSX implicitly having type any, not 'your generic is ambiguous'. If you ever see a strange JSX error on a line that doesn't look like JSX, check whether you have a bare `<T>` on an arrow function in a .tsx file. Adding the constraint is almost always the right fix.",
    dryRun:
      "🔁 **Think:** You write `const DataList = <T extends BaseRecord>(...)` in a .tsx file and TypeScript is happy. A teammate copies your component into a .ts file and removes the JSX. They also change the constraint to just `<T>`. Does removing `extends` cause any ambiguity in a .ts file — and does the component still work? (Hint: .ts files have no JSX parser ambiguity — the constraint is only syntactically required in .tsx.)",
    build:
      "**Learning focus:** Define a generic arrow function component with a constrained type parameter — understanding that the constraint must be on the function itself (not inherited from the interface), and that in .tsx files the extends keyword serves double duty: semantic constraint and parser disambiguation.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Fill in the DataList return — replace the empty fragment with a div wrapping items.map(). Each mapped item should be wrapped in a div with key={item.id}, and renderItem(item) should produce the row content.",
  hint: "items.map() returns an array of JSX elements. Each element needs a key prop — use item.id, which is guaranteed by the BaseRecord constraint.",
  example_code: `return (
  <div>
    {rows.map((row) => (
      <div key={row.id}>
        {renderRow(row)}
      </div>
    ))}
  </div>
);`,
  think_prompt:
    "You have items as T[] and renderItem as a function that takes one T and returns JSX. How do you map over items and produce a keyed div for each one — using the guaranteed id field from the BaseRecord constraint?",
  mc_options: [
    "items.map((item) => renderItem(item))",
    "items.map((item) => <div key={item.id}>{renderItem(item)}</div>)",
    "items.map((item, index) => <div key={index}>{renderItem(item)}</div>)",
  ],
  mc_correct_option:
    "items.map((item) => <div key={item.id}>{renderItem(item)}</div>)",
  mc_anchor:
    "item.id is the correct key — it's stable, unique, and guaranteed by the BaseRecord constraint. The first option has no key prop at all — React will warn and reconciliation will break. The third option uses the array index as key — it works but causes subtle bugs when the list reorders or items are inserted, because index-based keys don't track identity.",
  why_this_matters:
    "The key prop is how React tracks which item is which across re-renders. A stable unique id from the database is always the right key — it survives reordering, insertion, and deletion. The BaseRecord constraint is what makes item.id available here — without it, TypeScript would error because T might not have an id field.",
  answer_keywords: ["items.map", "item", "key={item.id}", "renderItem", "div"],
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

const DataList = <T extends BaseRecord>({
  items,
  renderItem,
}: DataListProps<T>): JSX.Element => {
  return <></>;
};`,
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

const DataList = <T extends BaseRecord>({
  items,
  renderItem,
}: DataListProps<T>): JSX.Element => {
  // replace the empty fragment with a div wrapping a mapped list
  // use item.id as the key prop on each wrapper div
  // call renderItem(item) to produce each row
  return <></>;
};`,
  feedback_correct:
    "Exactly — item.id as the key, renderItem(item) for the content. The BaseRecord constraint is what makes item.id available here without any extra type assertion.",
  feedback_partial:
    "Close — check two things: does each mapped element have a key prop using item.id, and are you calling renderItem(item) to produce the row content?",
  feedback_wrong:
    "The pattern is: `items.map((item) => <div key={item.id}>{renderItem(item)}</div>)` — item.id for the key, renderItem for the content, wrapped in a div.",
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

const DataList = <T extends BaseRecord>({
  items,
  renderItem,
}: DataListProps<T>): JSX.Element => {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};`,
  analog_example: `return (
  <div>
    {rows.map((row) => (
      <div key={row.id}>
        {renderRow(row)}
      </div>
    ))}
  </div>
);`,
  deepDiveLabel:
    "item.id works as a key — but what actually breaks when you use the array index instead?",
  deepDive: {
    hook: "Your list renders ten shipments. You used array index as the key — `key={index}`. Everything looks fine. Then a user deletes the third shipment. React re-renders. The list now has nine items. React uses the keys to decide what changed.\n\nWith index keys: item 0 is still 0, item 1 is still 1 — but item 2 is now a different shipment than it was before. React thinks item 2 just changed its data. It patches the existing DOM node instead of removing one and shifting the rest. If that item had local state — an expanded accordion, a selected checkbox — that state now belongs to the wrong shipment. The user sees the wrong row expanded.\n\nWith id keys: React sees that id `NX-003` is gone and ids `NX-004` through `NX-010` shifted. It removes exactly the right DOM node and leaves the rest untouched. State stays with the right items.",
    pain: "⚠️ **Lesson:** You use `key={index}` and the list works perfectly — until a user deletes an item from the middle. The item below it now shows the wrong expanded state. No error. No warning. Just wrong UI. Why does React's reconciliation break with index keys when the list order changes?",
    mentalModel:
      "**Mental model:** Think of React's key as a **name tag on a seat at a conference**.\n- With id keys: each seat has the attendee's actual name. If one attendee leaves, React finds their empty seat by name and removes it. Everyone else stays exactly where they are.\n- With index keys: each seat is numbered 1, 2, 3. If seat 2 leaves, seat 3 gets renumbered to 2. React sees seat 2 has new data and patches it — it doesn't know a different person is now sitting there. Any sticky notes on that seat (local state) now belong to the wrong person.\n- The key is React's identity system for list items. A stable unique id is an identity. An array index is a position. Positions change when items are added or removed. Identities don't.",
    discover:
      "**Pattern — key prop:**\n```tsx\n// ✅ stable unique id — survives reorder, insert, delete\nitems.map((item) => (\n  <div key={item.id}>{renderItem(item)}</div>\n))\n\n// ⚠️ index key — works for static lists, breaks on mutation\nitems.map((item, index) => (\n  <div key={index}>{renderItem(item)}</div>\n))\n\n// ❌ no key — React warns, reconciliation is unpredictable\nitems.map((item) => (\n  <div>{renderItem(item)}</div>\n))\n\n// ❌ random key — new key on every render, React remounts every item\nitems.map((item) => (\n  <div key={Math.random()}>{renderItem(item)}</div>\n))\n```\n- stable unique id = correct choice for any list that can change\n- index = acceptable only for truly static lists that never reorder or mutate\n- no key = React warning and unpredictable DOM updates\n- random key = worst case — forces full remount on every render",
    quickRules:
      "**Quick rules:**\n- ✅ `key={item.id}` — stable, unique, correct\n- ⚠️ `key={index}` — only safe for static lists that never change order or length\n- ❌ no key prop — React will warn, reconciliation breaks\n- ❌ `key={Math.random()}` — new key every render, React remounts every item every time\n- the key must be unique among siblings — not globally unique across the whole app",
    watchOut:
      "👀 **Watch out:** React's key warning only appears in development mode — it's silently absent in production builds. If you ship with missing or index-based keys on mutable lists, you'll see state bugs in production with no console warning to guide you. The BaseRecord constraint in DataList makes the correct pattern the only available pattern — item.id is always there.",
    dryRun:
      "🔁 **Think:** You have a list of 5 shipments with ids NX-001 through NX-005, all using `key={item.id}`. The user filters the list — NX-002 and NX-004 are removed. React re-renders with 3 items: NX-001, NX-003, NX-005. What does React do with the existing DOM nodes for NX-002 and NX-004 — and what happens to the DOM nodes for NX-003 and NX-005? (Hint: React matches by key identity — nodes with matching keys are updated in place, nodes with no match are removed.)",
    build:
      "**Learning focus:** Map over a generic array using item.id as the key prop — understanding that the BaseRecord constraint makes id available inside the component, and that stable unique ids are the correct key choice because they track item identity across reorders, insertions, and deletions.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Use DataList with ShipmentRecord — pass a hardcoded array of two shipments as items and write an inline renderItem function that displays the shipment status and destination city.",
  hint: "When you use a generic component in JSX, TypeScript infers T from the items prop automatically — you don't need to write the type argument explicitly.",
  example_code: `<DataTable
  rows={[
    { id: '1', createdAt: '...', updatedAt: '...', total: 99 },
  ]}
  renderRow={(row) => <p>{row.total}</p>}
/>`,
  think_prompt:
    "You're calling DataList with ShipmentRecord data. TypeScript will infer T as ShipmentRecord from the items array. Inside renderItem, what type does item have — and which fields can you safely access without any type assertion?",
  mc_options: [
    "TypeScript infers T as ShipmentRecord — item inside renderItem is fully typed as ShipmentRecord",
    "TypeScript infers T as BaseRecord — item inside renderItem only has id, createdAt, updatedAt",
    "TypeScript can't infer T from JSX props — you must write DataList<ShipmentRecord> explicitly",
  ],
  mc_correct_option:
    "TypeScript infers T as ShipmentRecord — item inside renderItem is fully typed as ShipmentRecord",
  mc_anchor:
    "TypeScript infers T from the items prop — if items is ShipmentRecord[], T resolves to ShipmentRecord. Inside renderItem, item is fully typed as ShipmentRecord, not just BaseRecord. You get access to status, origin, destination, and all inherited fields. Explicit type arguments are supported but rarely needed when inference works.",
  why_this_matters:
    "Generic inference at the callsite is what makes generic components feel seamless. You write DataList as if it's a specific component for ShipmentRecord — full autocomplete, full type safety — without ever having written a ShipmentRecord-specific list component. The same DataList works identically for any record type that satisfies the BaseRecord constraint.",
  answer_keywords: [
    "DataList", "items", "id", "createdAt", "updatedAt", "status", "destination", "renderItem", "item",
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

const DataList = <T extends BaseRecord>({
  items,
  renderItem,
}: DataListProps<T>): JSX.Element => {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};`,
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

const DataList = <T extends BaseRecord>({
  items,
  renderItem,
}: DataListProps<T>): JSX.Element => {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

// use DataList here with two hardcoded ShipmentRecord items
// renderItem should display status and destination.city`,
  feedback_correct:
    "Exactly — TypeScript inferred T as ShipmentRecord from the items array. Inside renderItem, item is fully typed as ShipmentRecord — status, origin, destination, and all inherited fields are available with full autocomplete.",
  feedback_partial:
    "Close — check that your items array contains valid ShipmentRecord objects with all required fields, and that renderItem accesses ShipmentRecord-specific fields like status and destination.city.",
  feedback_wrong:
    "Pass a ShipmentRecord array to items and write an inline renderItem that receives item and renders item.status and item.destination.city — TypeScript infers T automatically from the items array.",
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

interface DataListProps<T extends BaseRecord> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}

const DataList = <T extends BaseRecord>({
  items,
  renderItem,
}: DataListProps<T>): JSX.Element => {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

<DataList
  items={[
    {
      id: 'NX-001',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
      origin: { city: 'Hamburg', country: 'DE' },
      destination: { city: 'Rotterdam', country: 'NL' },
      status: 'active',
    },
    {
      id: 'NX-002',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-04',
      origin: { city: 'Antwerp', country: 'BE' },
      destination: { city: 'Felixstowe', country: 'GB' },
      status: 'delayed',
    },
  ]}
  renderItem={(item) => (
    <div>
      <p>{item.status}</p>
      <p>{item.destination.city}</p>
    </div>
  )}
/>`,
  analog_example: `<DataTable
  rows={[
    { id: '1', createdAt: '...', updatedAt: '...', total: 99 },
  ]}
  renderRow={(row) => <p>{row.total}</p>}
/>`,
  deepDiveLabel:
    "TypeScript inferred T automatically — so when would you ever need to write the type argument explicitly?",
  deepDive: {
    hook: "You've just used DataList without writing `DataList<ShipmentRecord>` anywhere. TypeScript figured it out from the items array. It feels almost magical — and it works perfectly most of the time.\n\nThen a teammate hits a case where inference breaks. They pass an empty array for items: `items={[]}`. TypeScript can't infer T from an empty array — there are no elements to examine. T falls back to the constraint minimum: BaseRecord. Inside renderItem, item only has id, createdAt, updatedAt — no status, no destination. Their renderItem tries to access item.status and TypeScript errors.\n\nThe fix is one addition: `DataList<ShipmentRecord>` — an explicit type argument that tells TypeScript what T should be even though the array is empty. Inference works when there's data to infer from. When there isn't, you take the wheel.",
    pain: "⚠️ **Lesson:** You pass `items={[]}` to DataList. TypeScript infers T as BaseRecord — the constraint minimum. Your renderItem tries to access item.status and errors. How does an explicit type argument fix this — and why can't TypeScript infer the correct type from an empty array?",
    mentalModel:
      "**Mental model:** Think of TypeScript's inference as a **detective working from evidence**.\n- A full array is a crime scene full of evidence — the detective examines the items and concludes T must be ShipmentRecord.\n- An empty array is a blank crime scene — no evidence, no conclusion. The detective falls back to the only thing they know for certain: T satisfies BaseRecord. That's the minimum.\n- An explicit type argument is you handing the detective the answer directly: 'T is ShipmentRecord, trust me'. The detective stops guessing and applies that knowledge everywhere T appears.\n- Inference is a convenience, not a requirement. When it works, use it. When it can't — empty arrays, ambiguous data, complex conditional types — write the type argument explicitly.",
    discover:
      "**Pattern — explicit vs inferred type argument:**\n```tsx\n// ✅ inferred — TypeScript reads T from the items array\n<DataList\n  items={shipments}  // ShipmentRecord[]\n  renderItem={(item) => <p>{item.status}</p>}\n/>\n\n// ✅ explicit — necessary when inference can't work\n<DataList<ShipmentRecord>\n  items={[]}  // empty array, T can't be inferred\n  renderItem={(item) => <p>{item.status}</p>}\n/>\n\n// ✅ explicit — also useful for documentation clarity\n<DataList<DriverRecord>\n  items={drivers}\n  renderItem={(item) => <p>{item.driverName}</p>}\n/>\n\n// ❌ inferred from empty array — T falls back to BaseRecord\n<DataList\n  items={[]}\n  renderItem={(item) => <p>{item.status}</p>}  // ❌ status not on BaseRecord\n/>\n```\n- inference works when items has at least one element TypeScript can examine\n- explicit type argument overrides inference — always wins\n- empty arrays, undefined initial state, and complex union types are the most common inference failure cases",
    quickRules:
      "**Quick rules:**\n- ✅ let TypeScript infer T when items has data — cleaner callsite\n- ✅ write the type argument explicitly when items might be empty or inference is ambiguous\n- ✅ explicit type argument is also good for readability on complex components\n- ❌ never assume inference will work for empty arrays — it always falls back to the constraint\n- the explicit type argument goes between the component name and the props: `DataList<ShipmentRecord>`",
    watchOut:
      "👀 **Watch out:** TypeScript inference is resolved at compile time from the static type of the items prop — not from the runtime values inside it. If items is typed as `ShipmentRecord[]` but happens to be empty at runtime, TypeScript still infers T correctly because the array type is known. The empty array inference problem only occurs when the array literal itself has no type annotation — like `items={[]}` with no context.",
    dryRun:
      "🔁 **Think:** You use `DataList<ShipmentRecord>` with an explicit type argument and pass `items={[]}`. Inside renderItem, what type does item have — BaseRecord or ShipmentRecord? Now you remove the explicit type argument and keep `items={[]}`. What type does item have now — and why? (Hint: explicit type argument always wins over inference. Without it, TypeScript has no evidence to go on.)",
    build:
      "**Learning focus:** Use a generic component at the callsite — understanding that TypeScript infers T from the items prop automatically, that inference fails for empty arrays requiring an explicit type argument, and that the inferred type flows fully into renderItem giving complete access to the resolved type's fields.",
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
  lessonNum: 4,
  title: "TypeScript — Generics in Components",
  shortName: "TS — DATA LIST",
});

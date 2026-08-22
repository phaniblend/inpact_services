import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #10 (TypeScript)",
    title: "useState — Primitives",
    body: "Required props guarantee a component always has what it needs — but not every parent needs to supply every value. Optional props give callers flexibility, and default values let the component handle that flexibility gracefully without defensive checks scattered through the JSX. In this lesson you'll extend ShipmentCard with optional props, wire defaults in the destructure, and understand the rules for when to make a prop optional versus required.",
    usecase:
      "A shipment card in a dashboard might show a carrier name on the full detail view — but not on the compact list. The same component handles both cases cleanly if carrier is optional with a sensible default. That's the pattern: one component, flexible enough to serve every context without duplicating code.",
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
      reason: "Complete Lesson 1 (JSX — The Full Language) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Add optional fields to an existing props interface using the ? modifier",
    "Render an optional string prop conditionally using the && operator",
    "Provide a destructuring default for an optional prop so the component always has a usable value",
    "Decide which props should be required and which should be optional based on rendering logic",
    "Understand why defaults belong in the destructure, not in the interface",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Extend ShipmentCardProps with two optional fields: carrier as an optional string, and eta as an optional string representing the estimated arrival time.",
  hint: "Optional fields use ? after the field name and before the colon. The rest of the interface stays the same.",
  example_code: `interface RouteCardProps {
  routeId: string;
  destination: string;
  estimatedDuration?: string;
  assignedDriver?: string;
}`,
  think_prompt:
    "ShipmentCard already has three required fields. Not every parent will have carrier or eta data to pass. How do you add these fields to the interface while making clear they're not mandatory?",
  mc_options: [
    "interface ShipmentCardProps { shipmentId: string; destination: string; status: ShipmentStatus; carrier: string; eta: string }",
    "interface ShipmentCardProps { shipmentId: string; destination: string; status: ShipmentStatus; carrier?: string; eta?: string }",
    "interface ShipmentCardProps { shipmentId: string; destination: string; status: ShipmentStatus; carrier: string | null; eta: string | null }",
  ],
  mc_correct_option:
    "interface ShipmentCardProps { shipmentId: string; destination: string; status: ShipmentStatus; carrier?: string; eta?: string }",
  mc_anchor:
    "The ? modifier marks a field as optional — TypeScript will not require the parent to supply it, and the field's type inside the component becomes `string | undefined`. Using `string | null` is a different contract — it requires the parent to explicitly pass null when they have no value, which is more work for no benefit. ? is the idiomatic way to express 'this field may or may not be present'.",
  why_this_matters:
    "Optional props are how a single component serves multiple contexts in an enterprise app without splitting into separate components. The detail view passes carrier and eta. The compact list omits them. The component handles both — the interface is what makes that safe.",
  answer_keywords: ["interface", "ShipmentCardProps", "carrier?", "string", "eta?"],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
      </div>
    </>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

// add carrier? and eta? optional fields to this interface
interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
      </div>
    </>
  );
};`,
  feedback_correct:
    "Exactly — carrier? and eta? are now part of the contract but not required. TypeScript will not complain if a parent omits them, and inside the component their type is string | undefined.",
  feedback_partial:
    "Close — make sure both carrier and eta have the ? modifier. Missing it on one field makes that field required.",
  feedback_wrong:
    "Add `carrier?: string` and `eta?: string` to the interface — the ? before the colon marks the field as optional without changing its value type.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
      </div>
    </>
  );
};`,
  analog_example: `interface DriverCardProps {
  driverId: string;
  region: string;
  vehicleType?: string;
  licenseExpiry?: string;
}`,
  deepDiveLabel:
    "? makes a field optional — but how is that different from typing it as string | undefined?",
  deepDive: {
    hook: "You have two colleagues arguing over optional prop syntax. One writes `carrier?: string`. The other writes `carrier: string | undefined`. Both compile. Both allow the value to be absent or a string. A senior engineer says they're not the same — then keeps walking.\n\nThe difference is subtle but real, and it shows up at the callsite. One allows the key to be completely missing from the props object. The other requires the key to exist — even if its value is undefined.",
    pain: "⚠️ **Lesson:** You define `carrier: string | undefined` instead of `carrier?: string`. A parent renders `<ShipmentCard shipmentId='NX-1' destination='Hamburg' status='active' />` with no carrier prop. TypeScript errors. But you thought `string | undefined` allowed the field to be absent. What's the difference?",
    mentalModel:
      "**Mental model:** Think of the two as **different promises about the key itself**.\n- `carrier?: string` — the key carrier may or may not exist on the object. If it doesn't exist, TypeScript is fine. If it does exist, the value must be a string.\n- `carrier: string | undefined` — the key carrier MUST exist on the object. But its value is allowed to be undefined. So `{ carrier: undefined }` is valid — `{}` without the key is not.\n- For optional props: `?` is almost always what you want. It lets callers omit the field entirely.\n- `string | undefined` is useful only when you need to distinguish 'field was omitted' from 'field was explicitly cleared to undefined' — a rare pattern.",
    discover:
      "**Pattern — ? vs string | undefined:**\n```tsx\n// ✅ ? — field may be omitted entirely\ninterface Props { carrier?: string; }\n<ShipmentCard shipmentId='NX-1' status='active' destination='Hamburg' /> // ✅ valid\n\n// ⚠️ string | undefined — field must be present, value can be undefined\ninterface Props { carrier: string | undefined; }\n<ShipmentCard shipmentId='NX-1' status='active' destination='Hamburg' /> // ❌ carrier missing\n<ShipmentCard shipmentId='NX-1' status='active' destination='Hamburg' carrier={undefined} /> // ✅ valid\n```\n- `?` = key may be absent — use this for optional props\n- `string | undefined` = key must be present, value may be undefined\n- inside the component, both produce `string | undefined` as the value type\n- `?` is the convention for optional props in every React codebase",
    quickRules:
      "**Quick rules:**\n- ✅ `carrier?: string` — field is optional, parent can omit it entirely\n- ❌ `carrier: string | undefined` for optional props — forces parent to pass `carrier={undefined}` explicitly\n- inside the component both produce the same `string | undefined` value type\n- `?` is the idiomatic React pattern\n- `string | undefined` has a narrow use case for explicit undefined signalling",
    watchOut:
      "👀 **Watch out:** TypeScript's `exactOptionalPropertyTypes` compiler option makes this distinction even stricter. With it enabled, `carrier?: string` truly means the key may be absent — you can't assign `undefined` to it at all. Most codebases don't enable this flag, but it explains why some teams are deliberate about which syntax they use.",
    dryRun:
      "🔁 **Think:** You change `carrier?: string` to `carrier: string | undefined` in ShipmentCardProps. A parent renders `<ShipmentCard shipmentId='NX-1' destination='Hamburg' status='active' />` with no carrier. Does TypeScript error? Now the parent adds `carrier={undefined}` explicitly. Does that satisfy the contract?",
    build:
      "**Learning focus:** Mark optional props with ? in the interface — understanding that ? means the key may be absent entirely, which is the idiomatic React pattern for fields the parent is not required to supply.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Update the component signature to destructure carrier and eta from the props. Then render carrier conditionally — show it in a paragraph only when the parent passed a value.",
  hint: "Add carrier and eta to the destructure. Use && to conditionally render carrier — it short-circuits and renders nothing when the value is undefined.",
  example_code: `const RouteCard = ({ routeId, destination, assignedDriver }: RouteCardProps): JSX.Element => {
  return (
    <div>
      <p>{routeId}</p>
      {assignedDriver && <p>Driver: {assignedDriver}</p>}
    </div>
  );
};`,
  think_prompt:
    "carrier is optional — it might be undefined. How do you render a paragraph with the carrier name only when it actually has a value — and nothing at all when it doesn't?",
  mc_options: [
    "{carrier}",
    "{carrier && <p>Carrier: {carrier}</p>}",
    "{carrier ? <p>Carrier: {carrier}</p> : <p>No carrier</p>}",
  ],
  mc_correct_option: "{carrier && <p>Carrier: {carrier}</p>}",
  mc_anchor:
    "The && pattern renders the right side only when the left side is truthy. When carrier is undefined, the expression short-circuits and nothing renders — no DOM node, no empty tag. When carrier is a string, the paragraph renders with its value. The ternary is valid but adds a 'No carrier' fallback that wasn't asked for.",
  why_this_matters:
    "Optional data rendering with && is one of the most common patterns in enterprise apps — detail panels, summary cards, notification badges. Wherever a piece of data may or may not be present, && keeps the JSX clean without branching into separate components.",
  answer_keywords: ["carrier", "eta", "&&", "<p>"],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
      </div>
    </>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

// add carrier and eta to the destructure
// render carrier conditionally with &&
const ShipmentCard = ({ shipmentId, destination, status }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
      </div>
    </>
  );
};`,
  feedback_correct:
    "Exactly — carrier and eta are now in scope, and carrier renders only when it has a value. Parents that omit carrier see no trace of the paragraph in the DOM.",
  feedback_partial:
    "Close — check that carrier is in the destructure list and that you're using && to guard the render, not just embedding {carrier} directly.",
  feedback_wrong:
    "Add `carrier` and `eta` to the destructure alongside the existing fields. Then use `{carrier && <p>Carrier: {carrier}</p>}` in the JSX — the && ensures nothing renders when carrier is undefined.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, carrier, eta }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
      </div>
    </>
  );
};`,
  analog_example: `const DriverCard = ({ driverId, region, vehicleType }: DriverCardProps): JSX.Element => {
  return (
    <div>
      <p>{driverId}</p>
      {vehicleType && <p>Vehicle: {vehicleType}</p>}
    </div>
  );
};`,
  deepDiveLabel:
    "carrier is a string so && is safe — but why would && silently break for a number prop?",
  deepDive: {
    hook: "You use && everywhere for optional data. It's clean and readable. Then a new component receives an optional itemCount prop typed as `number | undefined`. You write `{itemCount && <span>{itemCount}</span>}` — the same pattern. It works for 1, 5, 100.\n\nThen a user empties their cart. itemCount becomes 0. You expect nothing to render. Instead, the number 0 appears on screen — floating alone with no span around it. The && pattern that works perfectly for strings just betrayed you for numbers.",
    pain: "⚠️ **Lesson:** `{itemCount && <span>{itemCount}</span>}` renders 0 on screen when itemCount is 0. `{carrier && <p>{carrier}</p>}` renders nothing when carrier is undefined. Why does && behave differently — and what's the fix for numbers?",
    mentalModel:
      "**Mental model:** && returns the last evaluated value — not true or false.\n- If the left side is falsy, && returns the left side value and React renders it.\n- undefined is falsy → && returns undefined → React renders nothing. ✅\n- '' (empty string) is falsy → && returns '' → React renders nothing. ✅\n- 0 (zero) is falsy → && returns 0 → React renders the number 0 as text. ❌\n- Fix for numbers: `{itemCount > 0 && <span>{itemCount}</span>}` — force the left side to be a real boolean.",
    discover:
      "**Pattern — safe conditional rendering:**\n```tsx\n// ✅ string prop — && is safe\n{carrier && <p>Carrier: {carrier}</p>}\n\n// ✅ boolean prop — && is safe\n{isExpress && <span>Express</span>}\n\n// ❌ number prop — renders 0 when count is 0\n{itemCount && <span>{itemCount}</span>}\n\n// ✅ number prop — explicit comparison\n{itemCount > 0 && <span>{itemCount}</span>}\n\n// ✅ ternary — always safe regardless of type\n{itemCount > 0 ? <span>{itemCount}</span> : null}\n```\n- && is safe for string and boolean optional props\n- && needs an explicit comparison for number props\n- ternary with null is always the safest fallback",
    quickRules:
      "**Quick rules:**\n- ✅ `{carrier && <p>{carrier}</p>}` — safe for string props\n- ✅ `{isExpress && <span>Express</span>}` — safe for boolean props\n- ✅ `{count > 0 && <span>{count}</span>}` — safe for number props\n- ❌ `{count && <span>{count}</span>}` — renders 0 when count is 0\n- ternary with null is always the safest fallback",
    watchOut:
      "👀 **Watch out:** The 0 rendering bug is invisible to TypeScript — it's a JavaScript evaluation quirk, not a type error. The only defence is knowing the rule: whenever the left side of && could be the number 0, use an explicit boolean comparison instead.",
    dryRun:
      "🔁 **Think:** carrier is `string | undefined`. A parent passes `carrier=''` — an empty string. Walk through `{carrier && <p>Carrier: {carrier}</p>}` — what does && evaluate to, what does React render? Now carrier is `'Maersk'`. Walk through — what renders?",
    build:
      "**Learning focus:** Use && to conditionally render optional string props — understanding that && is safe for strings because undefined and empty string both short-circuit cleanly, but requires an explicit comparison for number props to avoid the 0 rendering bug.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Add a default value for eta in the destructure — if the parent doesn't pass eta, it should show 'ETA unknown'. Then render eta directly without a && guard.",
  hint: "Defaults live in the destructure using = after the field name. Once a default is set, the value is always a string inside the component — the && guard is no longer needed.",
  example_code: `const RouteCard = ({ routeId, destination, estimatedDuration = 'Duration unknown' }: RouteCardProps): JSX.Element => {
  return (
    <div>
      <p>{routeId}</p>
      <p>Duration: {estimatedDuration}</p>
    </div>
  );
};`,
  think_prompt:
    "Once eta has a default value in the destructure, what is its type inside the component body — `string | undefined` or always `string`? And what does that mean for conditional rendering?",
  mc_options: [
    "Keep the && guard — the default only applies when eta is undefined, it could still be falsy",
    "Remove any guard and render eta directly — the default guarantees eta is always a string inside the component",
    "Change eta to required in the interface since it now always has a value",
  ],
  mc_correct_option:
    "Remove any guard and render eta directly — the default guarantees eta is always a string inside the component",
  mc_anchor:
    "A destructuring default means eta is always a string inside the component — either the parent's value or 'ETA unknown'. TypeScript narrows the type from `string | undefined` to `string` the moment the default is added. The interface stays as `eta?: string` because the parent contract hasn't changed — parents can still omit it. Any && guard becomes dead code.",
  why_this_matters:
    "Default values keep the component body clean and predictable. Instead of defensive checks in the JSX, the component promises internally: 'I always have a value for eta'. The parent stays flexible — they can still omit it — but the component never has to worry about undefined.",
  answer_keywords: ["eta", "=", "'ETA unknown'", "<p>ETA:"],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, carrier, eta }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
      </div>
    </>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

// add eta = 'ETA unknown' as a default in the destructure
// then render eta directly as <p>ETA: {eta}</p> — no guard needed
const ShipmentCard = ({ shipmentId, destination, status, carrier, eta }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
      </div>
    </>
  );
};`,
  feedback_correct:
    "Exactly — the default in the destructure means eta is always a string, so you render it directly. The interface stays optional — the default is the component's private fallback, invisible to the parent.",
  feedback_partial:
    "Close — check two things: is the default set in the destructure parameter (not in the body), and are you rendering eta directly without a && guard since it's now always a string?",
  feedback_wrong:
    "Set `eta = 'ETA unknown'` in the destructure: `{ ..., eta = 'ETA unknown' }`. Then render `<p>ETA: {eta}</p>` directly — no && needed.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, carrier, eta = 'ETA unknown' }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
        <p>ETA: {eta}</p>
      </div>
    </>
  );
};`,
  analog_example: `const DriverCard = ({ driverId, region, licenseExpiry = 'Not recorded' }: DriverCardProps): JSX.Element => {
  return (
    <div>
      <p>{driverId}</p>
      <p>License expires: {licenseExpiry}</p>
    </div>
  );
};`,
  deepDiveLabel:
    "The default lives in the destructure — but could you set it in the interface instead?",
  deepDive: {
    hook: "You add `eta = 'ETA unknown'` to the destructure and everything works. A teammate asks why the default isn't in the interface instead — after all, the interface describes the component's props, so shouldn't defaults live there too? You try adding a default to the interface. TypeScript throws a syntax error immediately. Interfaces describe types, not runtime values.",
    pain: "⚠️ **Lesson:** You try `eta?: string = 'ETA unknown'` in the interface definition. TypeScript errors. Why can't interface fields have default values — and where does the default actually belong?",
    mentalModel:
      "**Mental model:** Types describe shape, destructuring sets runtime values.\n\nA TypeScript interface is a compile-time contract. It is erased entirely before the JavaScript runs — there is nothing left at runtime to apply a default.\n\nThe destructure parameter is runtime JavaScript. The `=` in `{ eta = 'ETA unknown' }` runs at call time and sets the variable if the incoming value is undefined.\n\nThis is why the default belongs in the destructure: it is a runtime operation, not a type operation. The interface stays as `eta?: string` — the parent contract hasn't changed.",
    discover:
      "**Pattern — default values:**\n```tsx\n// ✅ default in destructure — correct, modern standard\nconst ShipmentCard = ({ eta = 'ETA unknown' }: ShipmentCardProps): JSX.Element => {\n  return <p>ETA: {eta}</p>; // eta is always a string here\n};\n\n// ❌ defaultProps — class component pattern, retired in modern React\nShipmentCard.defaultProps = { eta: 'ETA unknown' };\n\n// ❌ default in interface — TypeScript syntax error\ninterface ShipmentCardProps {\n  eta?: string = 'ETA unknown'; // invalid\n}\n\n// ✅ ?? in the body — works but adds a variable; destructure default is cleaner\nconst resolvedEta = eta ?? 'ETA unknown';\n```\n- destructure default is the modern standard\n- defaultProps is retired — do not use in functional components\n- interfaces are compile-time only — no runtime defaults possible",
    quickRules:
      "**Quick rules:**\n- ✅ `{ eta = 'ETA unknown' }` in the destructure — correct, modern, clean\n- ✅ interface stays as `eta?: string` — parent contract unchanged\n- ✅ remove any guard once a default is in place — undefined is no longer possible\n- ❌ defaultProps — retired pattern\n- ❌ default values in interface definitions — TypeScript syntax error",
    watchOut:
      "👀 **Watch out:** Adding a default does not change the interface. The parent still sees `eta?: string` and can still omit it. Never change `eta?: string` to `eta: string` in the interface just because you added a default — that would force every parent to supply a value they don't need to think about.",
    dryRun:
      "🔁 **Think:** The destructure is `{ eta = 'ETA unknown' }`. A parent passes `eta='Tomorrow 14:00'`. What value does eta have inside the component? A parent omits eta entirely. What value does eta have? A parent passes `eta=''` — an empty string. Does the default apply?",
    build:
      "**Learning focus:** Add a destructuring default for an optional prop so the component always has a usable value — removing any conditional guard in JSX and keeping the parent interface unchanged.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "You're adding three more fields to ShipmentCard. Decide which should be required and which should be optional: priority as 'standard' | 'express' | 'urgent', notes as an admin-only annotation string, and warehouseCode as a string used for internal routing.",
  hint: "Ask: can the component render correctly and meaningfully without this field? If no — required. If yes — optional.",
  example_code: `interface WarehouseCardProps {
  warehouseId: string;    // required — card identity
  location: string;       // required — always in the data
  capacity?: number;      // optional — not all warehouses have this
  notes?: string;         // optional — admin field, often absent
}`,
  think_prompt:
    "A shipment card on a customer-facing dashboard always shows priority — the customer needs to know if their shipment is express. Notes are internal-only and frequently absent. warehouseCode is used for routing but isn't displayed to customers. Which of these three fields must a parent always supply?",
  mc_options: [
    "All three required — the component should always have complete data",
    "priority required, notes and warehouseCode optional",
    "All three optional — give callers maximum flexibility",
  ],
  mc_correct_option:
    "priority required, notes and warehouseCode optional",
  mc_anchor:
    "priority drives visible UI — a badge colour, a sort order, a label. A component that can't render meaningfully without it should require it. notes is an admin annotation that frequently doesn't exist — making it required would break every non-admin callsite. warehouseCode is internal routing data — display components rarely need it and it's often absent from API responses. Required means the component can't function without it. Optional means the component degrades gracefully.",
  why_this_matters:
    "The required vs optional decision is a design contract. Get it wrong and you either break callers (too many required fields) or scatter defensive checks through the component body (too many optional fields with no defaults). The rule is: make a field required only if the component cannot render correctly without it.",
  answer_keywords: ["priority", "required", "notes?", "warehouseCode?"],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, carrier, eta = 'ETA unknown' }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
        <p>ETA: {eta}</p>
      </div>
    </>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type ShipmentPriority = 'standard' | 'express' | 'urgent';

// add priority (required), notes (optional), warehouseCode (optional) to the interface
interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  carrier?: string;
  eta?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, carrier, eta = 'ETA unknown' }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
        <p>ETA: {eta}</p>
      </div>
    </>
  );
};`,
  feedback_correct:
    "Exactly — priority is required because every card must show it, notes and warehouseCode are optional because the component renders correctly without them.",
  feedback_partial:
    "Close — check priority specifically. A customer-facing badge that drives visible UI should be required, not optional.",
  feedback_wrong:
    "Add `priority: ShipmentPriority` (no ?) as a required field, and `notes?: string` and `warehouseCode?: string` as optional fields. Priority drives the visible badge — the component can't render correctly without it.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type ShipmentPriority = 'standard' | 'express' | 'urgent';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  carrier?: string;
  eta?: string;
  notes?: string;
  warehouseCode?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, carrier, eta = 'ETA unknown' }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
        <p>ETA: {eta}</p>
      </div>
    </>
  );
};`,
  analog_example: `interface InvoiceCardProps {
  invoiceId: string;       // required — identity
  amount: number;          // required — core display data
  currency: string;        // required — can't render amount without it
  notes?: string;          // optional — often absent
  approvedBy?: string;     // optional — may not be approved yet
}`,
  deepDiveLabel:
    "Everything optional is tempting for flexibility — but what does it cost the component body?",
  deepDive: {
    hook: "You've seen codebases where every prop is optional. `interface ButtonProps { label?: string; onClick?: () => void; disabled?: boolean; }` — nothing required. Callers have complete flexibility. Nobody ever gets a TypeScript error for missing props.\n\nThen you look at the component body. It's full of `{label ?? 'Click me'}` and `{onClick ? onClick : () => {}}` and `if (!disabled)` checks. Every optional field is a defensive check somewhere. The component has traded callsite flexibility for internal complexity.\n\nNow imagine a parent renders `<Button />` with no props. It renders a button labeled 'Click me' that does nothing when clicked. Is that a feature or a bug? If label is truly required for the component to communicate its purpose, making it optional moved a compile-time error to a runtime surprise.",
    pain: "⚠️ **Lesson:** You make label optional on a Button component to be flexible. A parent renders `<Button />` with no label. The component renders a button with no visible text. No TypeScript error. No runtime crash. Just a silent accessibility failure. How would making label required have prevented this?",
    mentalModel:
      "**Mental model:** Required props are a **compile-time guarantee**. Optional props are a **runtime responsibility**.\n- Required: TypeScript catches the missing field before the code runs. The component body can assume the value exists and focus on its core logic.\n- Optional: TypeScript allows the field to be absent. The component body must handle undefined — either with a default or with a conditional. This is work the component didn't need if the field was truly always needed.\n- The decision rule: if the component can render correctly and meaningfully without the field — make it optional. If it can't — make it required and let TypeScript enforce that at every callsite.",
    discover:
      "**Pattern — required vs optional:**\n```tsx\n// ✅ required — component can't render meaningfully without it\ninterface ShipmentCardProps {\n  shipmentId: string;     // identity\n  status: ShipmentStatus; // drives badge colour and sorting\n  priority: ShipmentPriority; // drives visible urgency indicator\n}\n\n// ✅ optional — component degrades gracefully without it\ninterface ShipmentCardProps {\n  carrier?: string;    // shown when available\n  eta?: string;        // has a sensible default\n  notes?: string;      // admin-only, often absent\n}\n\n// ❌ everything optional — shifts enforcement burden to the component body\ninterface ShipmentCardProps {\n  shipmentId?: string; // now the component must handle missing identity\n  status?: ShipmentStatus; // now the badge has no reliable value to show\n}\n```\n- required = TypeScript enforces at callsite, component body stays clean\n- optional = component body must handle undefined, callsite has flexibility\n- make a field required only when the component cannot render correctly without it",
    quickRules:
      "**Quick rules:**\n- ✅ required for: identity fields, fields that drive visible UI, fields always present in the data model\n- ✅ optional for: supplementary data, admin fields, fields with sensible defaults\n- ❌ making everything optional — moves errors from compile time to runtime\n- ❌ making everything required — breaks callers that legitimately don't have every field\n- when in doubt: if the component body needs a defensive check for undefined, consider making it required",
    watchOut:
      "👀 **Watch out:** Making a prop optional is a promise to the component body that it must handle undefined. If you add `notes?: string` but never add a guard or default for notes in the JSX, you'll eventually render `undefined` — which React renders as nothing, not an error. Silent, not safe.",
    dryRun:
      "🔁 **Think:** You make status optional on ShipmentCard. A parent renders `<ShipmentCard shipmentId='NX-1' destination='Hamburg' />` with no status. Inside the component, `className={\\`card--${status}\\`}` evaluates. What className does the div get — and what does `{status}` render in the paragraph?",
    build:
      "**Learning focus:** Decide which props are required and which are optional based on whether the component can render correctly without them — understanding that required props are a compile-time guarantee while optional props are a runtime responsibility the component body must handle.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Update the component to destructure priority from the new interface and render it as a badge span with a dynamic className. Render notes conditionally if present.",
  hint: "priority drives a className — use the template literal pattern from Lesson 1. notes is optional — use &&.",
  example_code: `const OrderCard = ({ orderId, status, priority, notes }: OrderCardProps): JSX.Element => {
  return (
    <div>
      <p>{orderId}</p>
      <span className={\`badge--\${priority}\`}>{priority}</span>
      {notes && <p>{notes}</p>}
    </div>
  );
};`,
  think_prompt:
    "priority is a required union type — you can build its className with a template literal exactly like status. notes is optional — which rendering pattern handles a value that may or may not exist?",
  mc_options: [
    "Render priority with {priority} and notes with {notes}",
    "Render priority as <span className={`priority--${priority}`}>{priority}</span> and notes with {notes && <p>{notes}</p>}",
    "Render priority and notes both conditionally with &&",
  ],
  mc_correct_option:
    "Render priority as <span className={`priority--${priority}`}>{priority}</span> and notes with {notes && <p>{notes}</p>}",
  mc_anchor:
    "priority is required — you never need to guard it, and its className is built with a template literal exactly like status was in Lesson 1. notes is optional — && renders it only when present. Never guard a required field with && — it's always defined, and the guard misleads future readers into thinking it might be absent.",
  why_this_matters:
    "The rendering pattern for a prop should match its optionality. Required props render directly — no guards, no defaults needed. Optional props with defaults render directly too. Optional props without defaults render conditionally. Reading the JSX should tell you immediately which category each field falls into.",
  answer_keywords: [
    "priority", "className", "priority--", "notes", "&&",
  ],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type ShipmentPriority = 'standard' | 'express' | 'urgent';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  carrier?: string;
  eta?: string;
  notes?: string;
  warehouseCode?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, carrier, eta = 'ETA unknown' }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
        <p>ETA: {eta}</p>
      </div>
    </>
  );
};`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type ShipmentPriority = 'standard' | 'express' | 'urgent';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  carrier?: string;
  eta?: string;
  notes?: string;
  warehouseCode?: string;
}

// add priority and notes to the destructure
// render priority as a span with dynamic className
// render notes conditionally
const ShipmentCard = ({ shipmentId, destination, status, carrier, eta = 'ETA unknown' }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        {carrier && <p>Carrier: {carrier}</p>}
        <p>ETA: {eta}</p>
      </div>
    </>
  );
};`,
  feedback_correct:
    "Exactly — priority renders directly with a dynamic className, notes renders conditionally with &&. The JSX communicates the optionality of each field through the rendering pattern used.",
  feedback_partial:
    "Close — check priority specifically. It's a required field, so no && guard is needed. Its className should be built with a template literal like `priority--${priority}`.",
  feedback_wrong:
    "Add `priority` and `notes` to the destructure. Render priority as `<span className={\\`priority--${priority}\\`}>{priority}</span>` directly — it's required, no guard needed. Render notes as `{notes && <p>{notes}</p>}` — it's optional.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';
type ShipmentPriority = 'standard' | 'express' | 'urgent';

interface ShipmentCardProps {
  shipmentId: string;
  destination: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  carrier?: string;
  eta?: string;
  notes?: string;
  warehouseCode?: string;
}

const ShipmentCard = ({ shipmentId, destination, status, priority, carrier, eta = 'ETA unknown', notes }: ShipmentCardProps): JSX.Element => {
  return (
    <>
      <span>Shipment</span>
      <div className={\`card--\${status}\`}>
        <p>{shipmentId}</p>
        <p>{destination}</p>
        <p>{status}</p>
        <span className={\`priority--\${priority}\`}>{priority}</span>
        {carrier && <p>Carrier: {carrier}</p>}
        <p>ETA: {eta}</p>
        {notes && <p>{notes}</p>}
      </div>
    </>
  );
};`,
  analog_example: `const InvoiceCard = ({ invoiceId, amount, currency, notes }: InvoiceCardProps): JSX.Element => {
  return (
    <div>
      <p>{invoiceId}</p>
      <p>{amount} {currency}</p>
      {notes && <p>{notes}</p>}
    </div>
  );
};`,
  deepDiveLabel:
    "warehouseCode is in the interface but never rendered — is it safe to leave unused props in the destructure?",
  deepDive: {
    hook: "You add warehouseCode to ShipmentCardProps because the parent passes it. But the display component doesn't render it — it's used elsewhere for routing logic. You include it in the destructure anyway because it's in the interface. Your linter flags it: 'warehouseCode is defined but never used'.\n\nA teammate suggests removing it from the destructure entirely. But then the component accepts it silently via props — TypeScript allows it through the interface — and you have a prop that exists contractually but is never touched. Is that right? Or should it not be on the interface at all?",
    pain: "⚠️ **Lesson:** warehouseCode is in ShipmentCardProps and the parent passes it, but ShipmentCard never renders it. Should warehouseCode be on this interface? Should it be in the destructure? What's the right relationship between 'accepted by the interface' and 'used by the component'?",
    mentalModel:
      "**Mental model:** The interface defines **what the component accepts**. The destructure defines **what the component uses**.\n- If warehouseCode is on the interface but not in the destructure, the parent can pass it and TypeScript won't error — but the component silently ignores it. This is fine if the prop flows through to a child or is used in a hook.\n- If warehouseCode is on the interface and in the destructure but never used in JSX or logic, it's dead code. Remove it from the destructure.\n- If warehouseCode isn't needed by this component at all — not for rendering, not for logic, not for children — it shouldn't be on the interface. The parent is passing data the component has no use for.\n- The principle: the interface should describe what the component needs, not everything the parent has available.",
    discover:
      "**Pattern — interface vs destructure:**\n```tsx\n// ✅ in interface AND destructure — used in the component\nconst ShipmentCard = ({ shipmentId, status }: ShipmentCardProps) => {\n  return <p className={`card--${status}`}>{shipmentId}</p>;\n};\n\n// ✅ in interface but not destructure — accepted but passed to a child\nconst ShipmentCard = ({ shipmentId, warehouseCode }: ShipmentCardProps) => {\n  return <WarehouseRoute code={warehouseCode} />;\n};\n\n// ❌ in destructure but never used — dead code, linter warning\nconst ShipmentCard = ({ shipmentId, warehouseCode }: ShipmentCardProps) => {\n  return <p>{shipmentId}</p>; // warehouseCode is declared but never touched\n};\n\n// ❌ on interface but never used anywhere — remove from interface\n```\n- interface = accepted contract\n- destructure = what's actually used\n- if a prop is accepted and used: in both\n- if a prop is accepted and passed through: in interface only\n- if a prop is in the destructure but unused: remove from destructure",
    quickRules:
      "**Quick rules:**\n- ✅ if the component uses the prop — include in destructure\n- ✅ if the component passes the prop to a child — in interface, out of destructure\n- ❌ in destructure but unused — dead code, remove from destructure\n- ❌ in interface but never needed anywhere — remove from interface\n- the linter's 'variable defined but never used' warning is your signal to clean up",
    watchOut:
      "👀 **Watch out:** Rest syntax `const { shipmentId, ...rest } = props` is sometimes used to pass all remaining props to a child — like spreading onto a native element. This is a legitimate pattern but makes the component's dependencies opaque. Prefer explicit destructuring when the prop list is small enough to name.",
    dryRun:
      "🔁 **Think:** warehouseCode is on ShipmentCardProps. ShipmentCard never uses it. A parent passes `warehouseCode='WH-42'`. TypeScript: error or no error? The component renders — does warehouseCode appear anywhere in the output? Now remove warehouseCode from the interface. The parent still passes `warehouseCode='WH-42'`. TypeScript: error or no error?",
    build:
      "**Learning focus:** Understand the relationship between what the interface accepts and what the destructure uses — keeping the interface accurate to what the component needs, not a mirror of everything the parent has available.",
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
  lessonNum: 10,
  title: "useState — Primitives",
  shortName: "HOOKS — USE STATE",
});

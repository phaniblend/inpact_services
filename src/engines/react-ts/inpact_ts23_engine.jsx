import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #23 (React Styling)",
    title: "CSS Modules",
    body: "Global CSS class names collide. A class called 'card' in one file overrides 'card' in another. CSS Modules solve this by scoping class names to the file they're defined in — the class 'card' in ShipmentCard.module.css becomes a unique generated name at build time, never conflicting with any other component's 'card' class. In this lesson you'll import and use CSS Modules, understand how they integrate with TypeScript, and combine them with the conditional class patterns from Lesson 19.",
    usecase:
      "A large enterprise app has 50 components each with their own card class. Without CSS Modules, the last one to load wins — silently overriding all others. With CSS Modules, each component's card class is isolated: ShipmentCard gets '.ShipmentCard_card__x7y2z', DriverCard gets '.DriverCard_card__a3b8c'. They coexist without collision.",
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
    {
      lesson: 10,
      label: "useState — Primitives",
      reason: "Complete Lesson 10 (useState — Primitives) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 16,
      label: "List Rendering + key",
      reason: "Complete Lesson 16 (List Rendering + key) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Import a CSS Module and apply its class names using the styles object",
    "Understand how CSS Modules scope class names to prevent global collisions",
    "Combine CSS Module classes with conditional class logic using filter+join or clsx",
    "Understand the TypeScript configuration needed for CSS Module type safety",
    "Know the tradeoffs between CSS Modules, global CSS, and CSS-in-JS",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Show how a CSS Module is imported and its classes applied to a component. Import styles from ShipmentCard.module.css and apply styles.card to the wrapper div.",
  hint: "CSS Modules are imported as an object: `import styles from './ShipmentCard.module.css'`. Each class name is a property: `styles.card`. TypeScript needs a declaration file or module typings to understand this import.",
  example_code: `import styles from './ShipmentCard.module.css';

const ShipmentCard = (): JSX.Element => (
  <div className={styles.card}>
    content
  </div>
);`,
  think_prompt:
    "A CSS Module import returns an object where each key is a CSS class name from the file and each value is the generated unique class string. How do you access a specific class from that object?",
  mc_options: [
    "className='card'  // global class name",
    "className={styles.card}  // module-scoped class name",
    "className={styles['card']}  // bracket notation — required",
  ],
  mc_correct_option: "className={styles.card}  // module-scoped class name",
  mc_anchor:
    "Both `styles.card` and `styles['card']` access the same property. Dot notation is cleaner and is the standard convention. Global 'card' bypasses the module entirely and is subject to name collision. Bracket notation is technically correct but unnecessary unless the class name contains a hyphen (like 'card-header' — dot notation can't access this, bracket notation can).",
  why_this_matters:
    "Understanding that CSS Modules return an object of class name strings is what makes the rest of the pattern clear. Every class from the module is a property of the imported object — you access it with dot or bracket notation, exactly like any JavaScript object.",
  answer_keywords: [
    "import", "styles", "ShipmentCard.module.css",
    "className", "styles.card",
  ],
  seed_code: `// ShipmentCard.module.css (content):
// .card {
//   padding: 16px;
//   border: 1px solid #ddd;
//   border-radius: 8px;
// }`,
  starter_code: `// import styles from './ShipmentCard.module.css'

const ShipmentCard = ({ shipmentId }: { shipmentId: string }): JSX.Element => {
  return (
    // apply styles.card to the wrapper div
    <div>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `styles.card` accesses the scoped class name from the module object. At runtime this becomes something like 'ShipmentCard_card__x7y2z', unique across the entire application.",
  feedback_partial:
    "Close — make sure the import line is `import styles from './ShipmentCard.module.css'` and that you're using `className={styles.card}` (object access, not a string).",
  feedback_wrong:
    "Add `import styles from './ShipmentCard.module.css'` at the top. Use `className={styles.card}` on the wrapper div — dot notation accesses the scoped class name from the module object.",
  expected: `import styles from './ShipmentCard.module.css';

const ShipmentCard = ({ shipmentId }: { shipmentId: string }): JSX.Element => {
  return (
    <div className={styles.card}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `import styles from './Button.module.css';

<button className={styles.button}>Click me</button>`,
  deepDiveLabel:
    "CSS Modules import returns an object — but TypeScript doesn't know the shape. How do you get type safety?",
  deepDive: {
    hook: "You write `styles.card` and TypeScript types styles as `{ [key: string]: string }` — an index signature that allows any string key. TypeScript accepts `styles.typo` without error. The typo silently produces undefined as the class name, and the class is not applied. No red underline, no error.",
    pain: "⚠️ **Lesson:** The default CSS Module TypeScript type is `{ [key: string]: string }` — it accepts any key. How do you get precise types that error on unknown class names?",
    mentalModel:
      "Three approaches for CSS Module type safety:\n\n1. **Declaration file** (manual): Create `ShipmentCard.module.css.d.ts` with explicit class names.\n   ```ts\n   declare const styles: { card: string; selected: string; };\n   export default styles;\n   ```\n   Precise but manual — must be kept in sync with the CSS file.\n\n2. **typed-css-modules / css-modules-typescript-loader** (auto-generated): Build tool generates declaration files from CSS files automatically.\n   Run `tcm src/` → generates `.d.ts` files per module.\n\n3. **Vite with `vite-plugin-dts-css-modules`** or CRA default: Framework handles it, styles is typed as `{ [key: string]: string }` — permissive but no typo protection.\n\nFor enterprise projects: auto-generated declaration files (option 2) give typo protection without manual maintenance.",
    discover:
      "```ts\n// ShipmentCard.module.css.d.ts (auto-generated or manual)\ndeclare const styles: {\n  readonly card: string;\n  readonly selected: string;\n  readonly urgent: string;\n};\nexport default styles;\n\n// Now TypeScript catches:\nstyles.typo // ❌ Property 'typo' does not exist\nstyles.card // ✅\n```",
    quickRules:
      "- ✅ declaration file: precise types, manual or auto-generated\n- ✅ auto-generation: typed-css-modules, postcss-modules + dts\n- ⚠️ `{ [key: string]: string }`: permissive default — typos not caught\n- ❌ no typing at all: TypeScript treats styles as any\n- in large teams, auto-generated types prevent class name drift between CSS and component",
    watchOut:
      "👀 **Watch out:** When using auto-generated types, they need to be regenerated whenever you add or rename a CSS class. In CI pipelines, include the type generation step before TypeScript compilation to catch mismatches.",
    dryRun:
      "🔁 **Think:** styles is typed as `{ [key: string]: string }`. You access `styles.card` — TypeScript: error or no error? You access `styles.typo` — TypeScript: error or no error? Now styles has a precise declaration with only `card` and `selected`. You access `styles.typo` — TypeScript: error or no error?",
    build:
      "**Learning focus:** Import and use CSS Module class names via the styles object — understanding the TypeScript typing options and how to get typo protection.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Apply a conditional module class — add styles.selected to the card when isSelected is true, alongside the always-present styles.card.",
  hint: "Use the filter+join pattern from Lesson 19, but with module class name properties instead of string literals. `styles.card` and `styles.selected` are both strings — they work the same way in the array.",
  example_code: `const className = [
  styles.card,
  isSelected && styles.selected,
].filter(Boolean).join(' ');`,
  think_prompt:
    "styles.card and styles.selected are strings — the generated unique class names. How do you combine them conditionally using the same filter+join pattern you used in Lesson 19?",
  mc_options: [
    "className={`${styles.card} ${isSelected ? styles.selected : ''}`}",
    "className={[styles.card, isSelected && styles.selected].filter(Boolean).join(' ')}",
    "className={styles.card + isSelected ? styles.selected : ''}",
  ],
  mc_correct_option:
    "className={[styles.card, isSelected && styles.selected].filter(Boolean).join(' ')}",
  mc_anchor:
    "The filter+join pattern works identically with module class names — styles.card and styles.selected are just strings. The template literal also works but has the same multi-condition readability issues as with plain strings. The operator precedence in option 3 is wrong — `+ isSelected` evaluates first (concatenating a boolean to a string), then ternary — producing incorrect class names.",
  why_this_matters:
    "CSS Modules don't change the conditional class pattern — they just change where the class name strings come from (module object properties rather than string literals). Everything you learned in Lesson 19 applies directly.",
  answer_keywords: [
    "styles.card", "styles.selected", "filter", "Boolean", "join",
    "isSelected",
  ],
  seed_code: `import styles from './ShipmentCard.module.css';
// .card { padding: 16px; border-radius: 8px; }
// .selected { border: 2px solid blue; }

interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
}`,
  starter_code: `import styles from './ShipmentCard.module.css';

interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
}

const ShipmentCard = ({ shipmentId, isSelected }: ShipmentCardProps): JSX.Element => {
  // compute className — styles.card always, styles.selected when isSelected
  return (
    <div className={/* computed className */}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — module class names are just strings. The filter+join pattern is identical to Lesson 19, with `styles.card` and `styles.selected` as the string values.",
  feedback_partial:
    "Close — use the filter+join pattern: `[styles.card, isSelected && styles.selected].filter(Boolean).join(' ')`. The template literal also works for two conditions.",
  feedback_wrong:
    "Build the array: `[styles.card, isSelected && styles.selected]`. Chain `.filter(Boolean).join(' ')`. Assign to a variable before the return.",
  expected: `import styles from './ShipmentCard.module.css';

interface ShipmentCardProps {
  shipmentId: string;
  isSelected: boolean;
}

const ShipmentCard = ({ shipmentId, isSelected }: ShipmentCardProps): JSX.Element => {
  const className = [
    styles.card,
    isSelected && styles.selected,
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `const btnClass = [
  styles.button,
  isDisabled && styles.disabled,
  isPrimary && styles.primary,
].filter(Boolean).join(' ');`,
  deepDiveLabel:
    "filter+join with module classes — how does clsx work with CSS Modules?",
  deepDive: {
    hook: "You use filter+join. A new teammate joins and uses clsx. You want to confirm they're compatible before reviewing the PR.",
    pain: "⚠️ **Lesson:** Does clsx work with CSS Module class name objects — and is there any difference from plain string class names?",
    mentalModel:
      "clsx works identically with CSS Module class names — they're just strings:\n\n```tsx\nimport clsx from 'clsx';\nimport styles from './ShipmentCard.module.css';\n\n// ✅ clsx with CSS Module classes\nconst className = clsx(\n  styles.card,                      // always\n  isSelected && styles.selected,    // conditional\n  isUrgent && styles.urgent,        // conditional\n  { [styles.loading]: isLoading },  // object syntax\n);\n```\n\nThe computed property key `[styles.loading]` uses the dynamic module class name as the key — this is the clsx object syntax applied to module classes.",
    discover:
      "```tsx\n// ✅ clsx with CSS Modules\nclsx(\n  styles.card,\n  isSelected && styles.selected,\n  { [styles.urgent]: isUrgent }\n)\n\n// ✅ filter+join with CSS Modules\n[styles.card, isSelected && styles.selected].filter(Boolean).join(' ')\n\n// Both produce the same result\n// Choose based on project convention\n```",
    quickRules:
      "- ✅ clsx works identically with module class names — they're just strings\n- ✅ computed property key `[styles.className]` for clsx object syntax\n- ✅ filter+join: no library, works anywhere\n- choose one approach per project for consistency",
    watchOut:
      "👀 **Watch out:** `clsx(styles)` — passing the entire styles object, not a property — adds all class names from the module to the element. That's almost certainly not what you want. Always access specific properties: `clsx(styles.card)`, not `clsx(styles)`.",
    dryRun:
      "🔁 **Think:** `clsx(styles.card, isSelected && styles.selected, { [styles.urgent]: isUrgent })` where isSelected is true and isUrgent is false. What does clsx receive for each argument? What is the final className string (using the generated names)?",
    build:
      "**Learning focus:** Apply conditional CSS Module classes using filter+join or clsx — confirming that module class names are plain strings and all conditional class patterns apply identically.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Apply a dynamic status-based module class — styles[`status--${status}`] — alongside the base styles.card. The CSS file defines .status--active, .status--delayed, .status--delivered.",
  hint: "Bracket notation with a template literal: `styles[\\`status--${status}\\`]`. This accesses a dynamic property name on the styles object. If the class doesn't exist in the module, the value is undefined — which filter(Boolean) safely removes.",
  example_code: `const className = [
  styles.card,
  styles[\`status--\${status}\`],
].filter(Boolean).join(' ');`,
  think_prompt:
    "The class name depends on a runtime value (status). You can't use dot notation for dynamic property names. How do you access a styles object property whose name is computed at runtime?",
  mc_options: [
    "className={`${styles.card} ${styles.status}--${status}`}",
    "className={[styles.card, styles[`status--${status}`]].filter(Boolean).join(' ')}",
    "className={styles.card + styles[status]}",
  ],
  mc_correct_option:
    "className={[styles.card, styles[`status--${status}`]].filter(Boolean).join(' ')}",
  mc_anchor:
    "Bracket notation with a template literal is the correct way to access a dynamic property on the styles object — `styles[\\`status--${status}\\`]` resolves to `styles['status--active']` when status is 'active'. The first option tries to concatenate a module class name string with a suffix — the generated name like 'ShipmentCard_status__abc123' is already a complete string, not a prefix. The third option accesses `styles[status]` which doesn't match any class name in the module.",
  why_this_matters:
    "Dynamic class names from module objects using bracket notation is how CSS Modules handle BEM modifier patterns — `.status--active`, `.status--delayed` — where the modifier suffix is computed at runtime. This is the exact same need as `card--${status}` from Lesson 19, now applied to module-scoped classes.",
  answer_keywords: [
    "styles", "status--", "template literal", "bracket notation",
    "filter", "Boolean", "join",
  ],
  seed_code: `import styles from './ShipmentCard.module.css';
// CSS file defines:
// .card { ... }
// .status--active { border-left: 3px solid green; }
// .status--delayed { border-left: 3px solid amber; }
// .status--delivered { border-left: 3px solid grey; }

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}`,
  starter_code: `import styles from './ShipmentCard.module.css';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, status }: ShipmentCardProps): JSX.Element => {
  const className = [
    styles.card,
    // add dynamic status class using bracket notation + template literal
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — `styles[\\`status--${status}\\`]` computes the property name at runtime. For status 'delayed', it accesses `styles['status--delayed']` which holds the generated scoped class name.",
  feedback_partial:
    "Close — the bracket notation needs a template literal: `styles[\\`status--${status}\\`]`. Dot notation can't access dynamic property names.",
  feedback_wrong:
    "Add `styles[\\`status--${status}\\`]` to the array. Bracket notation with a template literal computes the property name at runtime: `styles['status--active']`, `styles['status--delayed']`, etc.",
  expected: `import styles from './ShipmentCard.module.css';

type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface ShipmentCardProps {
  shipmentId: string;
  status: ShipmentStatus;
}

const ShipmentCard = ({ shipmentId, status }: ShipmentCardProps): JSX.Element => {
  const className = [
    styles.card,
    styles[\`status--\${status}\`],
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `const rowClass = [
  styles.row,
  styles[\`priority--\${priority}\`],
].filter(Boolean).join(' ');`,
  deepDiveLabel:
    "Dynamic bracket access on styles object — what if the class name doesn't exist in the module?",
  deepDive: {
    hook: "You access `styles['status--pending']` but your CSS file only defines `status--active`, `status--delayed`, and `status--delivered`. 'pending' was added to the union but the CSS wasn't updated. TypeScript says nothing — bracket access on `{ [key: string]: string }` accepts any string. undefined silently makes it into your class list.",
    pain: "⚠️ **Lesson:** Dynamic bracket access bypasses TypeScript's key checking. What happens when the class name doesn't exist in the module — and how do you detect this drift between CSS and TypeScript?",
    mentalModel:
      "Three things happen when `styles['status--pending']` doesn't exist:\n1. The value is `undefined`\n2. filter(Boolean) removes `undefined` from the array\n3. No class is applied — the element uses whatever default styling it has\n\nThe bug is silent — no error, no warning, wrong appearance.\n\n**Detection strategies**:\n1. Auto-generated declaration files: if 'status--pending' isn't in the CSS, it won't be in the `.d.ts` — TypeScript errors on `styles['status--pending']`.\n2. Runtime validation: `if (!styles[className]) console.warn('Missing class:', className)`\n3. CSS-side: use a CSS preprocessor that generates variants from a list, ensuring CSS and TypeScript stay in sync.",
    discover:
      "```tsx\n// ❌ silent failure — class doesn't exist, nothing applied\nstyles['status--pending'] // undefined, filtered out by filter(Boolean)\n\n// ✅ detection with runtime warn\nconst statusClass = styles[`status--${status}`];\nif (!statusClass) console.warn(`CSS Module missing class: status--${status}`);\n\n// ✅ declaration file prevents it at compile time\n// (requires precise typing, not { [key: string]: string })\n```",
    quickRules:
      "- ✅ filter(Boolean) safely removes undefined class names — no crash\n- ❌ but silent failure: element looks wrong, no error\n- ✅ auto-generated declaration files: compile-time detection\n- ✅ runtime console.warn: development-time detection\n- when adding a union value: always update the CSS module AND the declaration file",
    watchOut:
      "👀 **Watch out:** In production, console.warn is often suppressed. Add runtime checks in development mode only: `if (process.env.NODE_ENV === 'development' && !statusClass) { ... }`",
    dryRun:
      "🔁 **Think:** status is 'pending'. CSS module has status--active, status--delayed, status--delivered but NOT status--pending. `styles['status--pending']` returns undefined. Walk through filter(Boolean) — what happens to undefined? What className does the div receive?",
    build:
      "**Learning focus:** Access dynamic CSS Module class names with bracket notation — understanding that missing classes silently produce undefined and how to detect this drift between CSS and TypeScript.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Use composes in a CSS Module to share styles between classes — explain how .selected composes .card and what that produces in the className output.",
  hint: "The `composes` keyword in CSS Modules lets one class inherit another's styles. `.selected { composes: card; border: 2px solid blue; }` — an element with className={styles.selected} gets both the card styles and the selected border.",
  example_code: `/* In the CSS file: */
.card {
  padding: 16px;
  border-radius: 8px;
}

.selected {
  composes: card;
  border: 2px solid blue;
}`,
  think_prompt:
    "When .selected composes .card, does an element with className={styles.selected} need both styles.card and styles.selected in the className — or just styles.selected?",
  mc_options: [
    "className={[styles.card, styles.selected].filter(Boolean).join(' ')} — both needed even with composes",
    "className={styles.selected} — composes makes card styles apply automatically; no need to also add styles.card",
    "composes doesn't affect className — it only copies the CSS properties into the selected class",
  ],
  mc_correct_option:
    "className={styles.selected} — composes makes card styles apply automatically; no need to also add styles.card",
  mc_anchor:
    "CSS Modules `composes` works by adding the composed class name to the generated className string — not by copying CSS properties. When you apply `styles.selected`, CSS Modules automatically also includes the generated class name for `.card`. The element receives both generated class names without you needing to list both. It does NOT copy properties — both original class rules still apply via their respective class names.",
  why_this_matters:
    "CSS Modules `composes` is a powerful but misunderstood feature. Understanding that it adds class names (not copies properties) clarifies when to use it — it's composition, not inheritance. It reduces the need to manually combine multiple module classes in component code.",
  answer_keywords: ["composes", "styles.selected", "card", "className"],
  seed_code: `/* ShipmentCard.module.css:
.card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.selected {
  composes: card;
  border: 2px solid #2196f3;
  box-shadow: 0 0 0 2px rgba(33,150,243,0.3);
}
*/

import styles from './ShipmentCard.module.css';`,
  starter_code: `/* CSS Module defines:
.card { padding: 16px; border-radius: 8px; }
.selected { composes: card; border: 2px solid blue; }
*/

import styles from './ShipmentCard.module.css';

const ShipmentCard = ({ shipmentId, isSelected }: { shipmentId: string; isSelected: boolean }): JSX.Element => {
  // When isSelected: apply only styles.selected (composes handles card)
  // When not selected: apply styles.card

  return (
    <div className={/* which class(es) to apply? */}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — when selected, `styles.selected` is enough. CSS Modules composes automatically includes the card class name. When not selected, `styles.card` alone. No manual combination of both classes needed.",
  feedback_partial:
    "Close — with `composes: card` in the CSS, applying `styles.selected` already includes the card styles. You don't need to manually add `styles.card` alongside `styles.selected`.",
  feedback_wrong:
    "When isSelected is true: `className={styles.selected}` — composes handles card automatically. When false: `className={styles.card}`. Use a ternary: `className={isSelected ? styles.selected : styles.card}`.",
  expected: `import styles from './ShipmentCard.module.css';

const ShipmentCard = ({ shipmentId, isSelected }: { shipmentId: string; isSelected: boolean }): JSX.Element => {
  return (
    <div className={isSelected ? styles.selected : styles.card}>
      <p>{shipmentId}</p>
    </div>
  );
};`,
  analog_example: `/* .primary-button composes .button and adds primary styles */
className={isPrimary ? styles.primaryButton : styles.button}`,
  deepDiveLabel:
    "composes adds class names — but how is that different from just duplicating the CSS properties?",
  deepDive: {
    hook: "You understand composes adds class names. A colleague says: 'why not just duplicate the card properties inside selected? Then you'd only ever apply one class.' You think about it. Both produce the same visual result. But there's a meaningful difference.",
    pain: "⚠️ **Lesson:** composes: card adds the card class name to any element using selected. Duplicating card's properties inside selected copies them. Both look the same in the browser. What's the real difference — and why does it matter for maintenance?",
    mentalModel:
      "**Duplication** (`selected` copies card's properties):\n- Two copies of the same CSS properties\n- Change card's padding → selected's padding doesn't update automatically\n- Drift: card and selected diverge over time\n\n**composes** (selected adds card's class name):\n- Only one definition of each property — in `.card`\n- Change card's padding → selected automatically gets the new padding (it's the same class)\n- No drift: selected is always card + extra styles\n\ncomposes is composition in CSS — the same principle as function composition in code. It's the Single Responsibility Principle applied to CSS classes.",
    discover:
      "```css\n/* ✅ composes — no duplication, card updates propagate */\n.card { padding: 16px; border-radius: 8px; }\n.selected { composes: card; border: 2px solid blue; }\n\n/* ❌ duplication — card updates don't propagate to selected */\n.card { padding: 16px; border-radius: 8px; }\n.selected { padding: 16px; border-radius: 8px; border: 2px solid blue; }\n```",
    quickRules:
      "- ✅ composes: share base styles without duplication, changes propagate\n- ✅ composes from another file: `composes: card from './base.module.css'`\n- ❌ duplicating properties: drift risk, maintenance cost\n- composes only works in CSS Modules — it's not standard CSS\n- composes generates multiple class names on the element — inspect in DevTools",
    watchOut:
      "👀 **Watch out:** composes must appear at the top of the rule, before other properties. Properties before composes are allowed by some processors but is non-standard and may cause unexpected specificity behaviour.",
    dryRun:
      "🔁 **Think:** `.card` has `padding: 16px`. `.selected { composes: card; border: 2px solid blue; }`. In DevTools, an element with `className={styles.selected}` shows two classes — the generated card class and the generated selected class. The card class contributes `padding: 16px`. The selected class contributes `border: 2px solid blue`. Now card's padding changes to `24px`. Does the selected element update automatically?",
    build:
      "**Learning focus:** Use CSS Modules `composes` to share base styles — understanding that it adds class names (composition) rather than duplicating properties (which would cause drift).",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Compare CSS Modules against global CSS and CSS-in-JS for three criteria: scope isolation, dynamic values, and developer experience. Then state which you'd recommend for an enterprise React app and why.",
  hint: "Consider: global CSS has no scope isolation but no build tooling required. CSS Modules have file-level scope. CSS-in-JS has full JavaScript integration but a runtime cost.",
  example_code: `// Global CSS — no isolation
<div className="card">  // 'card' might clash

// CSS Modules — file-level isolation
<div className={styles.card}>  // unique generated name

// CSS-in-JS (styled-components) — JS integration
const Card = styled.div\`padding: 16px;\`;`,
  think_prompt:
    "Each approach has a different tradeoff profile. Which matters most for a large enterprise app with 50+ components built by multiple teams?",
  mc_options: [
    "Global CSS — simplest, works everywhere, no build tooling",
    "CSS Modules — isolated by default, integrates with existing CSS skills, TypeScript-compatible",
    "CSS-in-JS — maximum power, colocated with components, full dynamic value support",
  ],
  mc_correct_option:
    "CSS Modules — isolated by default, integrates with existing CSS skills, TypeScript-compatible",
  mc_anchor:
    "For enterprise teams where multiple developers work on many components simultaneously, CSS Modules provide isolation without the build complexity of CSS-in-JS or the discipline required for global CSS naming conventions. Global CSS at scale requires strict naming conventions (BEM) enforced by code review — one mistake causes cascading overrides. CSS-in-JS is powerful but adds a runtime dependency and requires team familiarity with a specific library. CSS Modules require standard CSS skills and solve the collision problem at the tooling level.",
  why_this_matters:
    "The choice of styling approach is an architectural decision that affects every developer on the team, the app's performance, the onboarding experience for new developers, and the maintenance cost for years. Understanding the tradeoffs makes you a better architectural thinker, not just a better styler.",
  answer_keywords: [
    "isolation", "scope", "global", "modules", "CSS-in-JS",
    "dynamic", "performance", "enterprise",
  ],
  seed_code: `// Compare the three approaches across three criteria`,
  starter_code: `// Document your comparison:
// Criterion 1 — Scope Isolation:
//   Global CSS:
//   CSS Modules:
//   CSS-in-JS:

// Criterion 2 — Dynamic Values:
//   Global CSS:
//   CSS Modules:
//   CSS-in-JS:

// Criterion 3 — Developer Experience:
//   Global CSS:
//   CSS Modules:
//   CSS-in-JS:

// Recommendation for enterprise React app:`,
  feedback_correct:
    "Exactly — CSS Modules are the balanced choice for enterprise teams: isolation without a runtime cost, standard CSS skills apply, TypeScript-compatible, and no vendor lock-in to a specific library.",
  feedback_partial:
    "Close — make sure you address all three criteria for each approach and give a reasoned recommendation based on the tradeoffs, not just a preference.",
  feedback_wrong:
    "Global CSS: no isolation, no build tooling, cascades. CSS Modules: file-level isolation, build step required, TypeScript-compatible. CSS-in-JS: full isolation, dynamic values in JS, runtime cost. Enterprise recommendation: CSS Modules — best balance of isolation and standard CSS skills.",
  expected: `// Criterion 1 — Scope Isolation:
//   Global CSS: none — .card in file A overrides .card in file B
//   CSS Modules: file-level — .card → 'ShipmentCard_card__x7y2z', unique
//   CSS-in-JS: component-level — generated class per component instance

// Criterion 2 — Dynamic Values:
//   Global CSS: none — values must be in the CSS file at build time
//   CSS Modules: via inline style or CSS custom properties for runtime values
//   CSS-in-JS: full — any JS expression in the template literal

// Criterion 3 — Developer Experience:
//   Global CSS: simplest, standard CSS, no build tooling
//   CSS Modules: standard CSS + import, build step (Vite/Webpack), TypeScript-compatible
//   CSS-in-JS: library API to learn, colocated with component, powerful but adds runtime

// Enterprise recommendation: CSS Modules
// Reasons: isolation by default prevents team collision at scale;
//          standard CSS skills apply (no library to learn);
//          zero runtime cost vs CSS-in-JS;
//          TypeScript-compatible with auto-generated declarations;
//          escapes global name convention enforcement burden`,
  analog_example: `// Project decision framework:
// Solo project: global CSS — simplest
// Small team (2-5): CSS Modules — isolation without complexity
// Large team (10+): CSS Modules or CSS-in-JS with team alignment
// Performance-critical: CSS Modules or zero-runtime CSS-in-JS (linaria)`,
  deepDiveLabel:
    "CSS Modules are the recommendation — but when would you choose CSS-in-JS instead?",
  deepDive: {
    hook: "You recommend CSS Modules. A colleague who just joined from a company using styled-components pushes back. They say CSS-in-JS gives them colocated styles, TypeScript-typed props in styles, and no separate CSS file to manage. They're not wrong. When IS CSS-in-JS the better choice?",
    pain: "⚠️ **Lesson:** CSS Modules are the balanced default. In what specific situations would CSS-in-JS be the clearly better architectural choice?",
    mentalModel:
      "CSS-in-JS wins when:\n1. **Design tokens in JS are primary**: The design system is fully JS-defined — no separate CSS variables. Sharing values between component logic and styles without a CSS variable layer is cleaner in CSS-in-JS.\n2. **Theme switching is complex**: CSS custom properties handle simple light/dark themes, but CSS-in-JS (with ThemeProvider) handles multi-brand, multi-tenant theming more cleanly.\n3. **Styles depend heavily on state or props**: Many style decisions are computed from component logic — CSS-in-JS keeps this collocated and avoids awkward prop-based class name mapping.\n4. **Team is already productive in CSS-in-JS**: Migrating a team comfortable with styled-components to CSS Modules has a cost that the marginal benefits may not justify.\n\nCSS Modules wins when:\n- Team has strong CSS expertise but limited JS-in-CSS experience\n- Performance budget is tight (no runtime style generation)\n- Long-term maintenance with minimal dependencies is a priority",
    discover:
      "```tsx\n// CSS-in-JS wins — styles heavily depend on many props\nconst StatusCard = styled.div<{ status: Status; priority: Priority; isSelected: boolean }>`\n  background: ${p => STATUS_COLORS[p.status]};\n  border: ${p => p.priority === 'high' ? '2px solid red' : '1px solid grey'};\n  opacity: ${p => p.isSelected ? 1 : 0.7};\n  &:hover { transform: translateY(-2px); }\n`;\n\n// CSS Modules wins — static styles, conditional classes\n// Less inline logic, easier to read the CSS separately\n```",
    quickRules:
      "- ✅ CSS Modules: most enterprise apps, team with CSS expertise, performance budget\n- ✅ CSS-in-JS: complex theming, many style-affecting props, design token-heavy system\n- ✅ zero-runtime CSS-in-JS (linaria): CSS-in-JS DX without runtime cost\n- ❌ global CSS at scale: requires BEM discipline, collision risk\n- the best choice is the one your team will maintain correctly for years",
    watchOut:
      "👀 **Watch out:** CSS-in-JS has seen pushback in the React ecosystem — React server components don't support runtime CSS injection, and Next.js has moved toward CSS Modules as the recommended approach for server-rendered apps. For new projects using React server components, CSS Modules or zero-runtime solutions are the safe choice.",
    dryRun:
      "🔁 **Think:** Your team is building a multi-tenant SaaS where each enterprise customer can configure their own brand colours, typography, and spacing. CSS Modules provide isolation but can't easily handle runtime-configured brand values. What styling approach would you recommend — and what specific CSS Modules limitation makes you choose otherwise?",
    build:
      "**Learning focus:** Compare CSS Modules against global CSS and CSS-in-JS across scope, dynamic values, and DX — making a reasoned recommendation based on the specific context of an enterprise React application.",
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
  lessonNum: 23,
  title: "CSS Modules",
  shortName: "STYLING — CSS MODULES",
});

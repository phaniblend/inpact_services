import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
{
  id: "intro",
  type: "reveal",
  phase: "Lesson",
  content: {
    tag: "LESSON #22 (React Styling)",
    title: "Inline Styles + CSSProperties",
    body: "CSS classes handle most styling — but sometimes a value is only known at runtime: a progress bar width from a percentage, a chart bar height from data, a custom colour from user preferences. Inline styles in React are typed objects using React.CSSProperties, not strings. This gives you autocomplete, catches typos at compile time, and handles camelCase property names automatically. In this lesson you'll apply inline styles correctly, understand when they're appropriate, and know their limitations.",
    usecase:
      "A shipment timeline shows each step as a bar whose width represents the percentage of the route completed — a value that changes per shipment. No CSS class can express '73% width' for a specific runtime value. Inline style is the right tool for values that only exist at render time.",
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
      lesson: 2,
      label: "Inventory row — readonly fields, unions, nested types",
      reason: "Complete Lesson 2 (Inventory row — readonly fields, unions, nested types) first — it is a prerequisite on the React-TS track for this lesson.",
    },
    {
      lesson: 10,
      label: "useState — Primitives",
      reason: "Complete Lesson 10 (useState — Primitives) first — it is a prerequisite on the React-TS track for this lesson.",
    },
  ],
},
{
  id: "objectives",
  type: "objectives",
  phase: "Objectives",
  items: [
    "Apply inline styles using the style attribute with a React.CSSProperties object",
    "Use camelCase CSS property names correctly in style objects",
    "Type a style object explicitly with React.CSSProperties for autocomplete and safety",
    "Compute dynamic inline style values from props or state at render time",
    "Know when inline styles are appropriate and when to prefer CSS classes",
  ],
},
{
  id: "step1",
  type: "question",
  phase: "Step 1 of 5",
  paal: "Apply a static inline style to a div — set backgroundColor to 'coral' and padding to '16px' using the style attribute.",
  hint: "The style attribute in React takes a JavaScript object with camelCase property names, not a CSS string. backgroundColor not background-color.",
  example_code: `<div style={{ color: 'navy', fontSize: '14px' }}>`,
  think_prompt:
    "HTML's style attribute is a string: `style=\"color: navy\"`. React's style attribute is an object. What's different about the syntax — and what happens to hyphenated CSS property names?",
  mc_options: [
    `style="background-color: coral; padding: 16px"`,
    `style={{ backgroundColor: 'coral', padding: '16px' }}`,
    `style={{ 'background-color': 'coral', padding: '16px' }}`,
  ],
  mc_correct_option: `style={{ backgroundColor: 'coral', padding: '16px' }}`,
  mc_anchor:
    "React's style attribute takes a JavaScript object — not a CSS string. Hyphenated CSS properties become camelCase: background-color → backgroundColor, font-size → fontSize. The double braces are JSX expression outer braces plus object literal inner braces. Using a CSS string errors in React. Using quoted hyphenated keys works in plain JavaScript but TypeScript/React will not autocomplete them and treats them as string index access rather than typed properties.",
  why_this_matters:
    "Understanding that React styles are objects — not strings — is foundational. It's why you get TypeScript type checking on CSS properties, why camelCase is required, and why values must be strings or numbers (not CSS shorthand strings with units mixed in).",
  answer_keywords: ["style", "backgroundColor", "coral", "padding", "16px"],
  seed_code: `const ShipmentCard = (): JSX.Element => {
  return (
    <div>
      <p>NX-001</p>
    </div>
  );
};`,
  starter_code: `const ShipmentCard = (): JSX.Element => {
  return (
    // add style attribute: backgroundColor coral, padding 16px
    <div>
      <p>NX-001</p>
    </div>
  );
};`,
  feedback_correct:
    "Exactly — a JavaScript object with camelCase properties. React converts these to the correct CSS property names when rendering to the DOM.",
  feedback_partial:
    "Close — make sure you're using an object `{{ }}` not a string, and that backgroundColor is camelCase (not background-color).",
  feedback_wrong:
    "The pattern: `style={{ backgroundColor: 'coral', padding: '16px' }}` — object syntax with camelCase properties.",
  expected: `const ShipmentCard = (): JSX.Element => {
  return (
    <div style={{ backgroundColor: 'coral', padding: '16px' }}>
      <p>NX-001</p>
    </div>
  );
};`,
  analog_example: `<header style={{ backgroundColor: '#1a1a2e', color: 'white', padding: '12px 24px' }}>`,
  deepDiveLabel:
    "Style is an object in React — but what is React.CSSProperties and why use it?",
  deepDive: {
    hook: "You write `style={{ backgroundColor: 'coral' }}` and it works. TypeScript doesn't complain. Then you write `style={{ backgroundColour: 'coral' }}` — a British English typo. TypeScript also doesn't complain, because the object type is inferred as `{ backgroundColour: string }` — an arbitrary object, not a CSS properties type. The typo silently applies nothing to the DOM.",
    pain: "⚠️ **Lesson:** How does React.CSSProperties prevent CSS property name typos — and when does TypeScript catch them?",
    mentalModel:
      "React.CSSProperties is a TypeScript interface that defines all valid CSS property names as camelCase keys with their allowed value types. When you annotate a style object with React.CSSProperties, TypeScript errors on any unknown property.\n\n```tsx\n// Without annotation — typos silently pass\nconst style = { backgroundColour: 'coral' }; // no error, arbitrary object\n\n// With annotation — typos caught\nconst style: React.CSSProperties = { backgroundColour: 'coral' }; // ❌ TypeScript error\nconst style: React.CSSProperties = { backgroundColor: 'coral' }; // ✅\n```\n\nFor inline objects directly in JSX, TypeScript infers the type from the style attribute context — React.CSSProperties is the expected type, so typos ARE caught inline. But for style objects defined as separate variables without annotation, you need the explicit type.",
    discover:
      "```tsx\n// ✅ inline — TypeScript infers React.CSSProperties from context\n<div style={{ backgroundColur: 'coral' }} /> // ❌ TypeScript error — unknown property\n\n// ✅ variable — explicit annotation needed\nconst cardStyle: React.CSSProperties = {\n  backgroundColor: 'coral',\n  padding: '16px',\n  borderRadius: '8px',\n};\n\n// ❌ variable without annotation — typos not caught\nconst cardStyle = { backgroundColour: 'coral' }; // no error\n<div style={cardStyle} /> // silently applies nothing\n```",
    quickRules:
      "- ✅ inline style objects: TypeScript infers CSSProperties from the style attribute context\n- ✅ extracted style variables: annotate explicitly with `: React.CSSProperties`\n- ❌ extracted style variables without annotation: typos not caught by TypeScript\n- ✅ camelCase: backgroundColor, fontSize, borderRadius, zIndex\n- ❌ kebab-case: background-color, font-size — valid as string keys but not typed",
    watchOut:
      "👀 **Watch out:** Number values in React styles have implicit 'px' appended for properties that accept pixel values. `style={{ fontSize: 14 }}` renders as `font-size: 14px`. This does NOT apply to unitless properties like `zIndex`, `opacity`, or `flexGrow`.",
    dryRun:
      "🔁 **Think:** `const cardStyle = { backgroundColur: 'coral' }`. You pass this to `<div style={cardStyle}>`. TypeScript errors or no error? What does the browser apply? Now add `: React.CSSProperties` annotation. TypeScript errors or no error — and what does it say?",
    build:
      "**Learning focus:** Apply inline styles as a JavaScript object with camelCase properties — and annotate extracted style variables with React.CSSProperties to catch typos.",
  },
},
{
  id: "step2",
  type: "question",
  phase: "Step 2 of 5",
  paal: "Build a ShipmentProgressBar component that accepts a percentage (number, 0–100) prop and renders a progress bar div whose width is set via inline style.",
  hint: "The width must be a runtime value — it's different for every shipment. Set `width: \\`${percentage}%\\`` in the style object. This is the canonical use case for inline styles.",
  example_code: `<div
  style={{ width: \`\${progress}%\`, height: '8px', backgroundColor: 'green' }}
  role="progressbar"
/>`,
  think_prompt:
    "A progress bar's width depends on the percentage prop — it's a different value for every shipment and can't be a CSS class. What is the style property and value that makes a div's width equal to the percentage?",
  mc_options: [
    `className={\`bar--\${percentage}\`}`,
    `style={{ width: \`\${percentage}%\` }}`,
    `style={{ width: percentage }}`,
  ],
  mc_correct_option: `style={{ width: \`\${percentage}%\` }}`,
  mc_anchor:
    "A CSS class per percentage (bar--73, bar--28) is impractical — you'd need 101 classes. `width: percentage` sets width to a unitless number, which React appends 'px' to — 73px, not 73%. The template literal `\\`${percentage}%\\`` produces the correct percentage string like '73%'.",
  why_this_matters:
    "Progress bars, chart bars, timeline segments, loading indicators — any width or height derived from a numeric value at runtime needs inline style. This is the primary legitimate use case for inline styles in React.",
  answer_keywords: ["percentage", "width", "style", "template literal", "%"],
  seed_code: `interface ProgressBarProps {
  percentage: number;
}`,
  starter_code: `interface ProgressBarProps {
  percentage: number;
}

const ShipmentProgressBar = ({ percentage }: ProgressBarProps): JSX.Element => {
  return (
    <div
      // set width via inline style using the percentage prop
      style={{
        height: '8px',
        backgroundColor: '#4caf50',
        borderRadius: '4px',
      }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
};`,
  feedback_correct:
    "Exactly — `width: \\`${percentage}%\\`` produces the runtime percentage string. Every shipment gets its own specific width based on its data.",
  feedback_partial:
    "Close — make sure width is set as a template literal string with % unit: `` `${percentage}%` `` not as a plain number (which would add px).",
  feedback_wrong:
    "Add `width: \\`${percentage}%\\`` to the style object alongside height and backgroundColor.",
  expected: `interface ProgressBarProps {
  percentage: number;
}

const ShipmentProgressBar = ({ percentage }: ProgressBarProps): JSX.Element => {
  return (
    <div
      style={{
        width: \`\${percentage}%\`,
        height: '8px',
        backgroundColor: '#4caf50',
        borderRadius: '4px',
      }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
};`,
  analog_example: `<div style={{ width: \`\${score}%\`, height: '12px', backgroundColor: 'blue' }} />`,
  deepDiveLabel:
    "Inline style for width — but could CSS custom properties (variables) be a cleaner alternative?",
  deepDive: {
    hook: "Inline styles for dynamic values work. But your tech lead shows you an alternative: set a CSS variable via the style attribute, then use it in a class. The bar stays styled by CSS, not inline — you get hover effects, transitions, and media query support.",
    pain: "⚠️ **Lesson:** `style={{ width: '73%' }}` works but inline styles can't be targeted by CSS pseudo-classes or transitions. What's the CSS custom property alternative — and when is it better?",
    mentalModel:
      "CSS custom properties (variables) bridge React's dynamic values and CSS's full feature set:\n\n```tsx\n// Set the variable via inline style\n<div\n  style={{ '--progress': `${percentage}%` } as React.CSSProperties}\n  className=\"progress-bar\"\n/>\n```\n\n```css\n/* Use it in CSS */\n.progress-bar {\n  width: var(--progress);\n  transition: width 0.3s ease; /* transitions work! */\n}\n.progress-bar:hover { opacity: 0.8; } /* pseudo-classes work! */\n```\n\nInline style sets the variable value (dynamic, per-instance). CSS uses it (with full CSS capabilities).",
    discover:
      "```tsx\n// ✅ CSS custom property — dynamic value, CSS styling\n<div\n  style={{ '--progress': `${percentage}%` } as React.CSSProperties}\n  className=\"progress-bar\"\n/>\n\n// ✅ pure inline — simple, no CSS file needed\n<div style={{ width: `${percentage}%`, height: '8px', backgroundColor: 'green' }} />\n\n// Choose based on: do you need transitions/hover/media queries? → CSS variable\n// Simple static style + dynamic width? → inline\n```",
    quickRules:
      "- ✅ inline style: simple dynamic values, no transitions needed, one-off\n- ✅ CSS custom property: dynamic value + transitions/hover/media query needed\n- ❌ inline style for transitions — `transition` in inline style works but is awkward\n- CSS custom properties in React need `as React.CSSProperties` to satisfy TypeScript",
    watchOut:
      "👀 **Watch out:** TypeScript's React.CSSProperties doesn't include custom property names (--my-var). Use `as React.CSSProperties` type assertion when setting custom properties via the style attribute.",
    dryRun:
      "🔁 **Think:** percentage is 73. Inline style: `width: \\`${73}%\\`` — what string does this produce? CSS custom property: `'--progress': \\`${73}%\\`` — what CSS variable is set? The CSS rule `width: var(--progress)` — what width does the browser apply?",
    build:
      "**Learning focus:** Compute dynamic width from a prop using inline style — and understand CSS custom properties as the alternative when CSS capabilities like transitions are needed.",
  },
},
{
  id: "step3",
  type: "question",
  phase: "Step 3 of 5",
  paal: "Extract the style object for ShipmentProgressBar into a typed constant outside JSX. Annotate it with React.CSSProperties.",
  hint: "Extract the static parts (height, backgroundColor, borderRadius) to a base constant. Apply width separately in the JSX since it's dynamic.",
  example_code: `const BASE_BAR_STYLE: React.CSSProperties = {
  height: '8px',
  backgroundColor: '#4caf50',
  borderRadius: '4px',
};

<div style={{ ...BASE_BAR_STYLE, width: \`\${percentage}%\` }} />`,
  think_prompt:
    "The static style properties (height, backgroundColor, borderRadius) are the same for every progress bar. The width changes per instance. How do you separate static and dynamic parts — and why extract at all?",
  mc_options: [
    "Extract everything including width to a constant — compute width as a variable",
    "Extract only static properties to a typed constant, spread them in JSX and add width separately",
    "Keep everything inline — extraction is unnecessary for a small style object",
  ],
  mc_correct_option:
    "Extract only static properties to a typed constant, spread them in JSX and add width separately",
  mc_anchor:
    "Extracting the static parts to a constant outside the component means they're created once — not a new object on every render. The dynamic width belongs inline because it's per-instance. Spreading the base and adding width merges them at render time. Keeping everything inline works but creates a new object on every render and loses the CSSProperties type annotation if not explicitly typed.",
  why_this_matters:
    "Separating static and dynamic style properties is a common pattern in design system components — a base style object defines the fixed appearance (height, border, background) and dynamic values (width, color from data) are merged in at render time.",
  answer_keywords: [
    "BASE_BAR_STYLE", "React.CSSProperties", "height", "backgroundColor",
    "borderRadius", "spread", "width",
  ],
  seed_code: `interface ProgressBarProps {
  percentage: number;
}

const ShipmentProgressBar = ({ percentage }: ProgressBarProps): JSX.Element => {
  return (
    <div
      style={{
        width: \`\${percentage}%\`,
        height: '8px',
        backgroundColor: '#4caf50',
        borderRadius: '4px',
      }}
      role="progressbar"
    />
  );
};`,
  starter_code: `interface ProgressBarProps {
  percentage: number;
}

// extract static style properties here as BASE_BAR_STYLE: React.CSSProperties

const ShipmentProgressBar = ({ percentage }: ProgressBarProps): JSX.Element => {
  return (
    <div
      // spread BASE_BAR_STYLE and add dynamic width
      style={{}}
      role="progressbar"
    />
  );
};`,
  feedback_correct:
    "Exactly — static properties in a typed constant outside the component, dynamic width added at render time via spread. TypeScript validates the constant against React.CSSProperties.",
  feedback_partial:
    "Close — make sure BASE_BAR_STYLE is defined outside the component (not inside), has the `: React.CSSProperties` annotation, and that width is added separately in the spread.",
  feedback_wrong:
    "Define `const BASE_BAR_STYLE: React.CSSProperties = { height: '8px', backgroundColor: '#4caf50', borderRadius: '4px' }` outside the component. In JSX: `style={{ ...BASE_BAR_STYLE, width: \\`${percentage}%\\` }}`.",
  expected: `interface ProgressBarProps {
  percentage: number;
}

const BASE_BAR_STYLE: React.CSSProperties = {
  height: '8px',
  backgroundColor: '#4caf50',
  borderRadius: '4px',
};

const ShipmentProgressBar = ({ percentage }: ProgressBarProps): JSX.Element => {
  return (
    <div
      style={{ ...BASE_BAR_STYLE, width: \`\${percentage}%\` }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
};`,
  analog_example: `const BASE_CHIP_STYLE: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '12px',
};

<span style={{ ...BASE_CHIP_STYLE, backgroundColor: chipColor }}>`,
  deepDiveLabel:
    "Static style constant outside the component — but what about a theme object with many shared values?",
  deepDive: {
    hook: "BASE_BAR_STYLE has three properties. Your design system has 20 components each with their own style constants. They share values — the same border radius, the same spacing unit, the same font size scale. Duplicating these values across 20 constants means a single design change requires 20 edits.",
    pain: "⚠️ **Lesson:** Style constants per component work for simple cases. How do enterprise design systems share values across components without duplicating them in every constant?",
    mentalModel:
      "**Design tokens** — a central object of values that all components reference:\n\n```tsx\n// tokens.ts\nexport const tokens = {\n  spacing: { sm: '8px', md: '16px', lg: '24px' },\n  radius: { sm: '4px', md: '8px', full: '999px' },\n  colors: { primary: '#4caf50', danger: '#f44336' },\n};\n\n// In components:\nconst PROGRESS_STYLE: React.CSSProperties = {\n  height: tokens.spacing.sm,\n  backgroundColor: tokens.colors.primary,\n  borderRadius: tokens.radius.sm,\n};\n```\n\nChange `tokens.colors.primary` once — every component that references it updates automatically.",
    discover:
      "```tsx\n// ✅ design tokens — shared values, single change point\nexport const tokens = {\n  spacing: { sm: '8px', md: '16px' },\n  colors: { primary: '#4caf50', error: '#f44336' },\n};\n\nconst PROGRESS_STYLE: React.CSSProperties = {\n  height: tokens.spacing.sm,      // shared value\n  backgroundColor: tokens.colors.primary, // shared value\n};\n\n// ❌ duplicated values — 20 components all hardcode '8px'\nconst STYLE_A: React.CSSProperties = { height: '8px' };\nconst STYLE_B: React.CSSProperties = { padding: '8px' };\n// Changing spacing requires finding every '8px' across 20 files\n```",
    quickRules:
      "- ✅ design tokens: shared values for spacing, color, typography, radius\n- ✅ component constants reference tokens — one change propagates everywhere\n- ❌ hardcoded values duplicated across components\n- CSS custom properties are the native CSS equivalent of design tokens\n- Tailwind, MUI, and Chakra all implement design token systems",
    watchOut:
      "👀 **Watch out:** Design tokens in JavaScript (like the tokens object above) don't automatically sync with CSS variables used in class-based styling. For full token consistency, either use all-JS styling or define tokens as CSS variables in a global stylesheet and reference them in both CSS classes and inline styles.",
    dryRun:
      "🔁 **Think:** tokens.colors.primary changes from '#4caf50' to '#2e7d32'. How many files need to change if 10 components all reference `tokens.colors.primary`? How many if each hardcodes '#4caf50'?",
    build:
      "**Learning focus:** Extract static style properties to a typed constant — understanding that design tokens centralise shared values for maintainable scaling.",
  },
},
{
  id: "step4",
  type: "question",
  phase: "Step 4 of 5",
  paal: "Build a ShipmentStatusDot component that accepts a status (ShipmentStatus) prop and applies a background colour derived from a status-to-colour lookup object.",
  hint: "Define a `STATUS_COLORS: Record<ShipmentStatus, string>` object mapping each status to a hex color. Use it in the inline style: `backgroundColor: STATUS_COLORS[status]`.",
  example_code: `const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#8bc34a',
  medium: '#ff9800',
  high: '#f44336',
};

<div style={{ backgroundColor: PRIORITY_COLORS[priority], width: 10, height: 10 }} />`,
  think_prompt:
    "Each status has a distinct colour — active is green, delayed is amber, delivered is grey. A switch or ternary chain could work. What's the cleaner data-driven alternative for mapping a union value to a colour?",
  mc_options: [
    "status === 'active' ? '#4caf50' : status === 'delayed' ? '#ff9800' : '#9e9e9e'",
    "const STATUS_COLORS: Record<ShipmentStatus, string> = { active: '#4caf50', delayed: '#ff9800', delivered: '#9e9e9e' }; then backgroundColor: STATUS_COLORS[status]",
    "className={`dot dot--${status}`} with a CSS file that sets colors",
  ],
  mc_correct_option:
    "const STATUS_COLORS: Record<ShipmentStatus, string> = { active: '#4caf50', delayed: '#ff9800', delivered: '#9e9e9e' }; then backgroundColor: STATUS_COLORS[status]",
  mc_anchor:
    "A Record lookup is the cleanest pattern for mapping a union to a value — it's declarative, readable, and TypeScript ensures it covers every status. The ternary chain works but is verbose and doesn't leverage TypeScript's exhaustiveness check. The CSS class approach is valid for static colour choices — but if colours come from a data source or theme, inline style is required.",
  why_this_matters:
    "Status-to-colour mapping via Record is a pattern that appears across every enterprise dashboard — shipment status dots, priority badges, health indicators, alert levels. The Record type ensures every union member has a value, preventing missing-case bugs.",
  answer_keywords: [
    "STATUS_COLORS", "Record", "ShipmentStatus", "string",
    "active", "delayed", "delivered", "backgroundColor",
  ],
  seed_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface StatusDotProps {
  status: ShipmentStatus;
}`,
  starter_code: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface StatusDotProps {
  status: ShipmentStatus;
}

// define STATUS_COLORS: Record<ShipmentStatus, string> here

const ShipmentStatusDot = ({ status }: StatusDotProps): JSX.Element => {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        // add backgroundColor from STATUS_COLORS lookup
      }}
      aria-label={status}
    />
  );
};`,
  feedback_correct:
    "Exactly — Record<ShipmentStatus, string> maps every status to a colour, TypeScript validates exhaustiveness, and the lookup at render time applies the correct colour.",
  feedback_partial:
    "Close — make sure STATUS_COLORS is typed as `Record<ShipmentStatus, string>` (not just an object literal) and that backgroundColor references `STATUS_COLORS[status]`.",
  feedback_wrong:
    "Define `const STATUS_COLORS: Record<ShipmentStatus, string> = { active: '#4caf50', delayed: '#ff9800', delivered: '#9e9e9e' }`. In the style: `backgroundColor: STATUS_COLORS[status]`.",
  expected: `type ShipmentStatus = 'active' | 'delayed' | 'delivered';

interface StatusDotProps {
  status: ShipmentStatus;
}

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  active: '#4caf50',
  delayed: '#ff9800',
  delivered: '#9e9e9e',
};

const ShipmentStatusDot = ({ status }: StatusDotProps): JSX.Element => {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: STATUS_COLORS[status],
      }}
      aria-label={status}
    />
  );
};`,
  analog_example: `const SEVERITY_COLORS: Record<Severity, string> = {
  low: '#8bc34a',
  medium: '#ff9800',
  critical: '#f44336',
};`,
  deepDiveLabel:
    "Record lookup for colours — but what if colours come from a user's theme preferences?",
  deepDive: {
    hook: "STATUS_COLORS is hardcoded. The product team adds brand customisation — enterprise customers can set their own status colours. The colours now come from an API response: `{ active: '#customGreen', delayed: '#customAmber', delivered: '#customGrey' }`. Your static Record no longer works.",
    pain: "⚠️ **Lesson:** Static colour maps work for fixed design systems. When colours come from dynamic data, how do you safely apply them — and what TypeScript typing handles a record whose values are unknown at compile time?",
    mentalModel:
      "When colours are dynamic (from API, user preferences, or a theme), use a typed partial record with a fallback:\n\n```tsx\ninterface ThemeColors {\n  active?: string;\n  delayed?: string;\n  delivered?: string;\n}\n\nconst getStatusColor = (\n  status: ShipmentStatus,\n  theme: ThemeColors,\n): string => theme[status] ?? STATUS_COLORS[status]; // fallback to defaults\n\nstyle={{ backgroundColor: getStatusColor(status, userTheme) }}\n```\n\nThe function merges user overrides with safe defaults — unknown statuses or missing theme keys fall back to the static map.",
    discover:
      "```tsx\n// ✅ static — compile-time certainty\nconst STATUS_COLORS: Record<ShipmentStatus, string> = { active: '#4caf50', ... };\n\n// ✅ dynamic with fallback — runtime theme applied safely\nconst getStatusColor = (status: ShipmentStatus, overrides: Partial<Record<ShipmentStatus, string>>): string =>\n  overrides[status] ?? STATUS_COLORS[status];\n```",
    quickRules:
      "- ✅ Record<Status, string>: static colours, TypeScript exhaustiveness\n- ✅ Partial<Record<Status, string>>: user overrides with ?? fallback\n- ❌ applying unvalidated API colour strings directly — validate hex format first\n- always have a default fallback for missing theme values",
    watchOut:
      "👀 **Watch out:** User-provided colour strings from an API should be validated before being applied to innerHTML or style attributes — an injected `expression(...)` in old IE or `javascript:` in href are XSS vectors. For backgroundColor, valid CSS colour strings are safe — but validate the format (hex, rgb, named) if the source is user input.",
    dryRun:
      "🔁 **Think:** STATUS_COLORS is the static default. userTheme is `{ active: '#customGreen' }` (no delayed or delivered). `getStatusColor('delayed', userTheme)` — what does `userTheme['delayed']` return? What does `?? STATUS_COLORS['delayed']` produce?",
    build:
      "**Learning focus:** Use a Record lookup for status-to-colour mapping — understanding TypeScript exhaustiveness and how to extend to dynamic theme overrides with fallbacks.",
  },
},
{
  id: "step5",
  type: "question",
  phase: "Step 5 of 5",
  paal: "Explain the three situations where inline styles are appropriate and three where they are not. Then demonstrate each appropriate case with a code example.",
  hint: "Appropriate: runtime-computed values (width from %), user-specific values (theme colour from preferences), animation values (transform from scroll position). Not appropriate: static colours, hover states, responsive breakpoints.",
  example_code: `// ✅ runtime value — can't be a class
style={{ width: \`\${percentage}%\` }}

// ✅ user preference — comes from data
style={{ backgroundColor: userTheme.primary }}

// ❌ static value — use a class
style={{ color: 'red' }} // use className="text-error" instead`,
  think_prompt:
    "Inline styles have genuine use cases — and genuine limitations. What test tells you whether a style value should be inline or in a CSS class?",
  mc_options: [
    "Inline styles are always fine — they're more explicit than classes",
    "Use inline style when the value is only known at runtime; use classes when the value is fixed",
    "Use classes for everything — inline styles are a React anti-pattern",
  ],
  mc_correct_option:
    "Use inline style when the value is only known at runtime; use classes when the value is fixed",
  mc_anchor:
    "The deciding question: is this value known at build time or only at render time? Static colours, spacing, and typography belong in CSS classes — they don't change per instance. Runtime values (data-driven widths, user preferences, calculated positions) belong in inline styles. Neither is always right — the choice depends on the source of the value.",
  why_this_matters:
    "Misusing inline styles leads to CSS-in-JS soup that can't be overridden, can't use media queries, can't use :hover, and creates larger HTML payloads. Misusing classes leads to impossible combinatorial explosion of every possible runtime value. Knowing when each belongs keeps your styling architecture clean.",
  answer_keywords: [
    "runtime", "static", "class", "percentage", "user preference",
    "hover", "media query",
  ],
  seed_code: `// Demonstrate 3 appropriate and 3 inappropriate inline style uses`,
  starter_code: `// Document your understanding:
// Appropriate inline style use cases (3):
// 1.
// 2.
// 3.

// Not appropriate — use CSS classes instead (3):
// 1.
// 2.
// 3.

// Demonstrate each appropriate case with a code example:`,
  feedback_correct:
    "Exactly — runtime values that change per instance are the canonical use case for inline styles. Static values belong in CSS classes, which support hover, media queries, transitions, and browser override.",
  feedback_partial:
    "Close — make sure your appropriate cases all involve values that are only known at render time (from props, state, or API data), not values that could be expressed as a named CSS class.",
  feedback_wrong:
    "Appropriate: (1) width/height from numeric data (progress, chart bars), (2) colours from user themes or API data, (3) transform/position from scroll or drag calculations. Not appropriate: (1) fixed colours — use class, (2) hover states — not possible in inline style, (3) responsive sizes — media queries not available in inline style.",
  expected: `// ✅ Appropriate inline style use cases:
// 1. Runtime numeric value — data-driven width/height
const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div style={{ width: \`\${percentage}%\`, height: '8px' }} />
);

// 2. User preference — theme colour from API or settings
const ThemedButton = ({ color }: { color: string }) => (
  <button style={{ backgroundColor: color }}>Click</button>
);

// 3. Calculated position — scroll or drag state
const Tooltip = ({ x, y }: { x: number; y: number }) => (
  <div style={{ position: 'absolute', left: x, top: y }}>Tip</div>
);

// ❌ Not appropriate — use CSS classes:
// 1. Static colour: style={{ color: 'red' }} → className="text-error"
// 2. Hover state: not possible inline → use CSS :hover pseudo-class
// 3. Responsive sizes: no media query support → use CSS @media rules`,
  analog_example: `// ✅ chart bar height from data
<div style={{ height: \`\${value}%\` }} className="chart-bar" />

// ❌ static typography — use class
style={{ fontWeight: 'bold' }} // → className="font-bold"`,
  deepDiveLabel:
    "Inline styles can't do hover or media queries — what about CSS-in-JS libraries that can?",
  deepDive: {
    hook: "Pure inline styles can't handle :hover or @media. But you've seen libraries like styled-components, Emotion, and Tailwind that seem to apply dynamic styles while supporting hover and responsive breakpoints. How do they do it?",
    pain: "⚠️ **Lesson:** CSS-in-JS libraries like styled-components go beyond inline styles. How do they support :hover, @media, and animations with dynamic values — and what's the architectural difference from React's style attribute?",
    mentalModel:
      "CSS-in-JS libraries don't use inline styles at runtime. They generate CSS class names dynamically and inject them into a `<style>` tag in the document:\n\n1. You write: `background: ${props => props.color}`\n2. At runtime, they compute: `background: #4caf50`\n3. They generate a unique class: `.sc-abc123 { background: #4caf50; }`\n4. They inject that class into `<style>` in the document head\n5. They apply className='sc-abc123' to the element\n\nThe element appears to have an inline style — but it's actually a generated CSS class. This means :hover, @media, and transitions all work.",
    discover:
      "```tsx\n// styled-components — generates real CSS classes dynamically\nconst ProgressBar = styled.div<{ percentage: number }>`\n  width: ${p => p.percentage}%;\n  height: 8px;\n  background: green;\n  transition: width 0.3s ease;  /* ✅ transitions work */\n  &:hover { opacity: 0.8; }     /* ✅ hover works */\n  @media (max-width: 768px) {   /* ✅ media queries work */\n    height: 4px;\n  }\n`;\n\n// Tailwind with arbitrary values — generates utility classes\n<div className={`w-[${percentage}%] h-2 bg-green-500`} />\n```",
    quickRules:
      "- ✅ React style attribute: simple dynamic values, no CSS features needed\n- ✅ CSS custom properties: dynamic value + full CSS features\n- ✅ styled-components/Emotion: full CSS in JS with dynamic values\n- ✅ Tailwind arbitrary values: utility-first with dynamic values\n- choose based on project's existing styling approach",
    watchOut:
      "👀 **Watch out:** CSS-in-JS libraries that inject styles at runtime have a runtime cost — class generation and style injection on every render. For high-frequency animations or very large lists, this overhead can be significant. Zero-runtime CSS-in-JS (linaria, vanilla-extract) solves this by extracting CSS at build time.",
    dryRun:
      "🔁 **Think:** styled-components generates class `.sc-abc` for `background: #4caf50`. The user changes the theme to `#2e7d32`. styled-components generates class `.sc-def` for `background: #2e7d32`. What happens to `.sc-abc` — does it stay in the document?",
    build:
      "**Learning focus:** Know the three inline style use cases and three non-use cases — understanding that CSS-in-JS libraries solve the hover/media limitation by generating real CSS classes dynamically.",
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
  lessonNum: 22,
  title: "Inline Styles + CSSProperties",
  shortName: "STYLING — INLINE STYLES",
});

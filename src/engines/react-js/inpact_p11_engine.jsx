import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #11",
      title: "Reusable Button",
      body: `Build a Button component that accepts: label, onClick, variant (primary / secondary / danger), and disabled. Render a <button> whose styles change based on variant and disabled.`,
      usecase: "Reusable buttons with variants are the backbone of design systems.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Accept label, onClick, variant, disabled as props",
      "Apply different styles or classes per variant",
      "Disable the button when disabled is true",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 3",
    paal: "Create a Button component that accepts props: label, onClick, variant, disabled. In the return (JSX), render a <button> that shows label and calls onClick when clicked.",
    hint: "function Button({ label, onClick, variant, disabled }) { return <button onClick={onClick} disabled={disabled}>{label}</button> }",
    answer_keywords: ["button", "label", "onclick", "variant", "disabled", "props"],
    seed_code: `export default function Button({ label, onClick, variant, disabled }) {
  // Step 1: return <button> with label and onClick
}`,
    example_code: `function Link({ text, onClick }) {
  return <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}>{text}</a>
}`,
    feedback_correct: "✅ Button renders and responds to click.",
    feedback_partial: "Ensure you pass label and onClick to the button.",
    feedback_wrong: "Return <button onClick={onClick} disabled={disabled}>{label}</button>",
    expected: "return <button onClick={onClick} disabled={disabled}>{label}</button>",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 3",
    paal: "Apply different styles based on variant. Use inline styles: primary = blue, secondary = gray, danger = red.",
    hint: "const styles = { primary: { background: '#3b82f6' }, secondary: { background: '#6b7280' }, danger: { background: '#ef4444' } }; style={styles[variant] || styles.primary}",
    answer_keywords: ["variant", "style", "primary", "secondary", "danger", "background"],
    seed_code: `export default function Button({ label, onClick, variant = 'primary', disabled }) {
  // Step 2: apply style based on variant
  return <button onClick={onClick} disabled={disabled}>{label}</button>
}`,
    example_code: `const sizes = { sm: { fontSize: '12px' }, md: { fontSize: '14px' }, lg: { fontSize: '18px' } };
return <span style={sizes[size] || sizes.md}>{label}</span>`,
    feedback_correct: "✅ Variant drives button appearance.",
    feedback_partial: "Use variant to pick a style object for the button.",
    feedback_wrong: "Map variant to style object and pass to style={}.",
    expected: "const styles = { primary: { background: '#3b82f6', color: '#fff' }, secondary: { background: '#6b7280', color: '#fff' }, danger: { background: '#ef4444', color: '#fff' } }; return <button style={styles[variant] || styles.primary} ...>",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 3",
    paal: "When disabled is true, the button should be disabled and look muted (e.g. opacity 0.6). Export the component.",
    hint: "disabled={disabled} and style={{ ...style, opacity: disabled ? 0.6 : 1 }}",
    answer_keywords: ["disabled", "opacity", "export"],
    seed_code: `export default function Button({ label, onClick, variant = 'primary', disabled = false }) {
  const styles = { primary: { background: '#3b82f6', color: '#fff' }, secondary: { background: '#6b7280', color: '#fff' }, danger: { background: '#ef4444', color: '#fff' } }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...(styles[variant] || styles.primary), opacity: disabled ? 0.6 : 1 }}>
      {label}
    </button>
  )
}`,
    example_code: "// Similar: input that looks muted when disabled\n<input disabled={disabled} style={{ opacity: disabled ? 0.5 : 1 }} value={value} />",
    feedback_correct: "✅ Reusable Button with variant and disabled complete.",
    feedback_partial: "Add disabled prop and muted style when disabled.",
    feedback_wrong: "Ensure disabled is passed to <button> and optionally reduce opacity when disabled.",
    expected: "Pass disabled to <button> and optionally style when disabled (e.g. opacity: disabled ? 0.5 : 1).",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 11, title: "Reusable Button", shortName: "REUSABLE BUTTON" });

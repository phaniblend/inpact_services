import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #23", title: "CSS Modules", body: `Convert a component from global CSS to CSS Modules. Create a .module.css file, import it as styles, and use className={styles.box} instead of class=\"box\". Explain why modules scope class names.`, usecase: "CSS Modules avoid global name collisions and keep styles with the component." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Create a .module.css file with a class (e.g. .container)", "Import it: import styles from './Component.module.css'", "Use className={styles.container} in the component"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Write a simple component that has a div with inline styles (e.g. padding, border). We'll replace that with a CSS Module in the next step.", hint: "For now: <div style={{ padding: 16, border: '1px solid #333' }}>Content</div>", answer_keywords: ["div", "style", "padding", "border"], seed_code: `export default function Card() {
  // Step 1: div with inline styles
  return <div style={{ padding: 16, border: '1px solid #333' }}>Content</div>
}`, feedback_correct: "✅ Component with inline styles.", feedback_partial: "div with padding and border.", feedback_wrong: "A div with some inline styles.", expected: "div with style object." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In a real project you'd create Card.module.css with .card { padding: 16px; border: 1px solid #333; }. Here, simulate: define a styles object in the same file: const styles = { card: 'card_xyz' }. Use className={styles.card} and add a <style> tag or keep inline for the rules.", hint: "Since we can't create .module.css in this editor, use an object: const styles = { card: 'card' }; and className={styles.card} with a global or inline style.", answer_keywords: ["styles", "classname", "card"], seed_code: `// Simulate CSS Module: const styles = { card: 'Card_card__abc123' }
export default function Card() {
  const styles = { card: 'card' }
  return (
    <div className={styles.card} style={{ padding: 16, border: '1px solid #333' }}>
      Content
    </div>
  )
}`, feedback_correct: "✅ Using a styles object like CSS Modules.", feedback_partial: "className={styles.something} pattern.", feedback_wrong: "Import or object styles and use className={styles.card}.", expected: "styles object and className={styles.card}." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a comment: CSS Modules scope class names (e.g. .Card_card__hash) so they don't clash with other components. Export the component.", hint: "Comment that modules generate unique class names.", answer_keywords: ["//", "scope", "export"], seed_code: `// CSS Modules scope class names to avoid global clashes
export default function Card() {
  const styles = { card: 'card' }
  return <div className={styles.card} style={{ padding: 16, border: '1px solid #333' }}>Content</div>
}`, feedback_correct: "✅ CSS Modules pattern and explanation complete.", feedback_partial: "Comment about scoping.", feedback_wrong: "Comment: modules scope class names.", expected: "Comment: modules scope class names." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 23, title: "CSS Modules", shortName: "CSS MODULES" });

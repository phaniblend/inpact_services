import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Component Library Theming (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #84 (Angular)", title: TITLE, body: "Theme a component library in Angular using CSS variables (custom properties): define --primary-color, --border-radius on :host or a theme wrapper and have buttons/cards read var(--primary-color); support light/dark and overrides.", usecase: "Angular component styles with CSS variables and :host enable theming without duplicating components." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: [":host { --btn-bg: var(--primary-color, #333); --btn-radius: 4px; } .btn { background: var(--btn-bg); border-radius: var(--btn-radius); }", "Parent or global: .theme-light { --primary-color: blue; } .theme-dark { --primary-color: #222; }", "Override per instance: <app-button style=\"--primary-color: red\">", "Document theme variables in component"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a ButtonComponent with styles: :host { --btn-bg: var(--primary-color, #333); --btn-radius: 4px; } .btn { background: var(--btn-bg); border-radius: var(--btn-radius); padding: 8px 16px; }. Template: <button class=\"btn\"><ng-content></ng-content></button>.", answer_keywords: [":host", "var(--primary-color)", "btn"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-lib-button',
  standalone: true,
  styles: [\`
    :host { --btn-bg: var(--primary-color, #333); --btn-radius: 4px; }
    .btn { background: var(--btn-bg); border-radius: var(--btn-radius); padding: 8px 16px; color: #fff; border: none; }
  \`],
  template: \`<button class="btn"><ng-content></ng-content></button>\`,
})
export class LibButtonComponent {}`, feedback_correct: "✅ CSS variables in :host.", feedback_partial: "var(--primary-color).", feedback_wrong: "btn-bg", expected: ":host with --btn-bg and .btn using var()" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Parent applies theme: <div class=\"theme-light\"><app-lib-button>Click</app-lib-button></div>. In global or parent styles: .theme-light { --primary-color: #1976d2; } .theme-dark { --primary-color: #121212; }.", answer_keywords: ["theme-light", "theme-dark", "primary-color"], seed_code: `/* In styles or parent component */
.theme-light { --primary-color: #1976d2; }
.theme-dark { --primary-color: #121212; }

/* Usage: <div class="theme-light"><app-lib-button>Click</app-lib-button></div> */`, feedback_correct: "✅ Theme classes.", feedback_partial: "theme-light.", feedback_wrong: "primary-color", expected: ".theme-light and .theme-dark with --primary-color" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Override per instance: <app-lib-button style=\"--primary-color: red\">Red</app-lib-button>. Export LibButtonComponent.", answer_keywords: ["style", "override", "export"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-lib-button',
  standalone: true,
  styles: [\`
    :host { --btn-bg: var(--primary-color, #333); --btn-radius: 4px; }
    .btn { background: var(--btn-bg); border-radius: var(--btn-radius); padding: 8px 16px; color: #fff; border: none; }
  \`],
  template: \`<button class="btn"><ng-content></ng-content></button>\`,
})
export class LibButtonComponent {}`, feedback_correct: "✅ Component Library Theming (Angular) complete.", feedback_partial: "override.", feedback_wrong: "Export", expected: "CSS vars and per-instance style override" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 84, title: TITLE, shortName: "A — LIB THEMING" });

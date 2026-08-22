import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Component Composition (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #19 (Angular)", title: TITLE, body: "Compose a UI from smaller components: a parent template that uses multiple child components (e.g. app-header, app-sidebar, app-content). Each child is a standalone component.", usecase: "Angular apps are built by composing standalone or module-declared components." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Create 2–3 small components (Header, Sidebar, Content)", "Parent template: place them in a layout with selectors", "Pass inputs and handle outputs as needed", "Import child components in parent's imports array"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a HeaderComponent with selector 'app-header' and template <header>Header</header>. Create a ContentComponent with selector 'app-content' and template <main>Content</main>.", answer_keywords: ["selector", "template", "component"], seed_code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: \`<header>Header</header>\`,
})
export class HeaderComponent {}

@Component({
  selector: 'app-content',
  standalone: true,
  template: \`<main>Content</main>\`,
})
export class ContentComponent {}
`, feedback_correct: "✅ Child components created.", feedback_partial: "Two components.", feedback_wrong: "app-header and app-content", expected: "HeaderComponent and ContentComponent with selectors" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create a LayoutComponent that imports HeaderComponent and ContentComponent. Template: <app-header></app-header><app-content></app-content>.", answer_keywords: ["imports", "app-header", "app-content"], seed_code: `import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';
import { ContentComponent } from './content.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, ContentComponent],
  template: \`
    <app-header></app-header>
    <app-content></app-content>
  \`,
})
export class LayoutComponent {}
`, feedback_correct: "✅ Composition in layout.", feedback_partial: "imports and template.", feedback_wrong: "imports: [HeaderComponent, ContentComponent]", expected: "LayoutComponent imports both and uses <app-header> and <app-content>" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export LayoutComponent. Optional: pass @Input() to header (e.g. title) and display in header template. Export all components.", answer_keywords: ["export", "Input"], seed_code: `import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';
import { ContentComponent } from './content.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, ContentComponent],
  template: \`
    <app-header></app-header>
    <app-content></app-content>
  \`,
})
export class LayoutComponent {}
`, feedback_correct: "✅ Component Composition (Angular) complete.", feedback_partial: "Export.", feedback_wrong: "Export LayoutComponent", expected: "Export LayoutComponent and child components." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 19, title: TITLE, shortName: "A — COMPOSITION" });

import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Compound Component (Tabs) (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #47 (Angular)", title: TITLE, body: "Build a tabs UI as a compound component: a parent TabsComponent holds selectedIndex signal and provides it (or uses content children); Tab and TabPanel children coordinate via the parent or a shared service.", usecase: "Angular compound components use content projection (ng-content), @ContentChildren, and optional provide/inject for parent-child coordination." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["TabsComponent: selectedIndex = signal(0); template has ng-content for tab headers and panels", "Tab directive or component: (click) calls parent or service to set selectedIndex", "TabPanel: *ngIf=\"index === selectedIndex()\" or use @ContentChildren and index", "Or inject parent via optional host and call parent.select(i)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create TabsComponent with selectedIndex = signal(0). Template: <div class=\"headers\"><ng-content select=\"[tab-header]\"></ng-content></div><div class=\"panels\"><ng-content select=\"[tab-panel]\"></ng-content></div>.", answer_keywords: ["ng-content", "selectedIndex", "signal"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: true,
  template: \`
    <div class="headers"><ng-content select="[tab-header]"></ng-content></div>
    <div class="panels"><ng-content select="[tab-panel]"></ng-content></div>
  \`,
})
export class TabsComponent {
  selectedIndex = signal(0);
}`, feedback_correct: "✅ Tabs with ng-content.", feedback_partial: "ng-content.", feedback_wrong: "selectedIndex", expected: "selectedIndex signal and ng-content" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Use @ContentChildren to get tab panels. In template use *ngFor with index and show only the panel where index === selectedIndex(). Or give each panel an index and *ngIf.", answer_keywords: ["ContentChildren", "selectedIndex", "ngIf"], seed_code: `import { Component, signal, contentChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="headers"><ng-content select="[tab-header]"></ng-content></div>
    <div class="panels"><ng-content select="[tab-panel]"></ng-content></div>
  \`,
})
export class TabsComponent {
  selectedIndex = signal(0);
  select(i: number) { this.selectedIndex.set(i); }
}`, feedback_correct: "✅ select method.", feedback_partial: "selectedIndex.set.", feedback_wrong: "select", expected: "select(i) that sets selectedIndex" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Usage: <app-tabs><button tab-header (click)=\"tabs.select(0)\">Tab 1</button><button tab-header (click)=\"tabs.select(1)\">Tab 2</button><div tab-panel>Content 1</div><div tab-panel>Content 2</div></app-tabs>. Get reference to TabsComponent with #tabs. Export TabsComponent.", answer_keywords: ["tab-header", "tab-panel", "export"], seed_code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: true,
  template: \`
    <div class="headers"><ng-content select="[tab-header]"></ng-content></div>
    <div class="panels"><ng-content select="[tab-panel]"></ng-content></div>
  \`,
})
export class TabsComponent {
  selectedIndex = signal(0);
  select(i: number) { this.selectedIndex.set(i); }
}`, feedback_correct: "✅ Compound Component (Tabs) (Angular) complete.", feedback_partial: "select.", feedback_wrong: "Export", expected: "tab-header/tab-panel and select(i)" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 47, title: TITLE, shortName: "A — TABS" });

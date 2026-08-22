import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Theme Context (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #41 (Angular)", title: TITLE, body: "Provide theme (e.g. 'light' | 'dark') via an injectable service or InjectionToken; inject it in children and use signals or RxJS for reactive theme switching.", usecase: "Angular uses injectable services or InjectionToken with provide/inject instead of React Context for theme." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Create ThemeService with theme = signal<'light'|'dark'>('light') and setTheme(t)", "provide(ThemeService) at root or in route; inject(ThemeService) in components", "Child reads themeService.theme() and binds [class.dark] or uses class on host", "Optional: provide at component level for scoped theme"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create ThemeService: theme = signal<'light'|'dark'>('light'); setTheme(t: 'light'|'dark') { this.theme.set(t); }. Provide it in app config or providers.", answer_keywords: ["ThemeService", "signal", "setTheme"], seed_code: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'light' | 'dark'>('light');
  setTheme(t: 'light' | 'dark') { this.theme.set(t); }
}`, feedback_correct: "✅ ThemeService with signal.", feedback_partial: "theme signal.", feedback_wrong: "ThemeService", expected: "theme = signal and setTheme" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create a component that injects ThemeService. Template: [class.dark]=\"themeService.theme() === 'dark'\" on host or a div. Add a button (click)=\"themeService.setTheme(themeService.theme() === 'light' ? 'dark' : 'light')\".", answer_keywords: ["inject", "ThemeService", "setTheme"], seed_code: `import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-consumer',
  standalone: true,
  template: \`
    <div [class.dark]="themeService.theme() === 'dark'">
      <button (click)="themeService.setTheme(themeService.theme() === 'light' ? 'dark' : 'light')">Toggle</button>
    </div>
  \`,
})
export class ThemeConsumerComponent {
  themeService = inject(ThemeService);
}`, feedback_correct: "✅ Inject and toggle theme.", feedback_partial: "themeService.theme().", feedback_wrong: "inject ThemeService", expected: "inject(ThemeService) and setTheme toggle" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use host binding: host: { '[class.dark]': \"themeService.theme() === 'dark'\" }. Export ThemeService and consumer component.", answer_keywords: ["host", "class.dark", "export"], seed_code: `import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-consumer',
  standalone: true,
  host: { '[class.dark]': 'themeService.theme() === "dark"' },
  template: \`<button (click)="themeService.setTheme(themeService.theme() === \'light\' ? \'dark\' : \'light\')">Toggle</button>\`,
})
export class ThemeConsumerComponent {
  themeService = inject(ThemeService);
}`, feedback_correct: "✅ Theme Context (Angular) complete.", feedback_partial: "host binding.", feedback_wrong: "Export", expected: "host [class.dark] and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 41, title: TITLE, shortName: "A — THEME CONTEXT" });

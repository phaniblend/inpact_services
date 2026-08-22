import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "useLayoutEffect vs useEffect (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #75 (Angular)", title: TITLE, body: "In Angular, effect() runs after view updates (like useEffect). For DOM measurements or synchronous layout work use AfterViewChecked, or run the logic in a microtask (queueMicrotask) or in the same tick; NgZone.runOutsideAngular + requestAnimationFrame can approximate layout timing.", usecase: "Angular effect timing and AfterViewChecked/AfterViewInit map to React useEffect vs useLayoutEffect." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["effect() runs after change detection; for 'layout' run in afterNextRender or AfterViewChecked", "afterNextRender(() => { measure DOM }) runs after view is painted", "Use runOutsideAngular for non-Angular tasks; requestAnimationFrame for before paint", "Documentation: effect = async after render; afterNextRender = sync after render"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with an effect that reads offsetHeight of a div: use ViewChild to get the element and in effect() or ngAfterViewInit read this.divRef.nativeElement.offsetHeight and store in a signal.", answer_keywords: ["effect", "offsetHeight", "ViewChild"], seed_code: `import { Component, signal, effect, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-layout-effect',
  standalone: true,
  template: \`<div #box>Content</div><p>Height: {{ height() }}</p>\`,
})
export class LayoutEffectComponent {
  @ViewChild('box') boxRef!: ElementRef<HTMLDivElement>;
  height = signal(0);
  constructor() {
    effect(() => {
      const el = this.boxRef?.nativeElement;
      if (el) this.height.set(el.offsetHeight);
    });
  }
}`, feedback_correct: "✅ effect and offsetHeight.", feedback_partial: "offsetHeight.", feedback_wrong: "height.set", expected: "effect that reads offsetHeight" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Use afterNextRender from @angular/core: afterNextRender(() => { this.height.set(this.boxRef.nativeElement.offsetHeight); }) so measurement runs after the view is committed (layout effect timing).", answer_keywords: ["afterNextRender", "measurement"], seed_code: `import { Component, signal, ViewChild, ElementRef, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-layout-effect',
  standalone: true,
  template: \`<div #box>Content</div><p>Height: {{ height() }}</p>\`,
})
export class LayoutEffectComponent {
  @ViewChild('box') boxRef!: ElementRef<HTMLDivElement>;
  height = signal(0);
  constructor() {
    afterNextRender(() => {
      if (this.boxRef?.nativeElement) this.height.set(this.boxRef.nativeElement.offsetHeight);
    });
  }
}`, feedback_correct: "✅ afterNextRender.", feedback_partial: "afterNextRender.", feedback_wrong: "afterNextRender", expected: "afterNextRender for DOM read" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Compare: keep one effect() that runs when a dependency changes (like useEffect) and one afterNextRender that runs once after first paint (like useLayoutEffect for initial measure). Export the component.", answer_keywords: ["effect", "afterNextRender", "export"], seed_code: `import { Component, signal, ViewChild, ElementRef, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-layout-effect',
  standalone: true,
  template: \`<div #box>Content</div><p>Height: {{ height() }}</p>\`,
})
export class LayoutEffectComponent {
  @ViewChild('box') boxRef!: ElementRef<HTMLDivElement>;
  height = signal(0);
  constructor() {
    afterNextRender(() => {
      if (this.boxRef?.nativeElement) this.height.set(this.boxRef.nativeElement.offsetHeight);
    });
  }
}`, feedback_correct: "✅ useLayoutEffect vs useEffect (Angular) complete.", feedback_partial: "comparison.", feedback_wrong: "Export", expected: "afterNextRender for layout and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 75, title: TITLE, shortName: "A — LAYOUT EFFECT" });

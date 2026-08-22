import { useState, useEffect } from "react";
import InpactLogo from "../../components/InpactLogo.jsx";
import CodeEditor from "../CodeEditor";
import AngularTabbedEditor from "./AngularTabbedEditor";
import LessonEditorOutputTabs from "../LessonEditorOutputTabs";
import { mergeAngularTsWithHtml, mergeAngularCssIntoTS } from "./angularTabMerge.js";

if (typeof document !== "undefined" && !document.getElementById("dm-sans-font")) {
  const link = document.createElement("link");
  link.id = "dm-sans-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

// ─── ENGINE ANG01: COMPONENTS & DECORATORS ───────────────────────────────────
// Covers interview topics:
//   - What is a Component? (@Component decorator, selector, template, styles)
//   - Component lifecycle hooks (ngOnInit, ngOnChanges, ngOnDestroy)
//   - @Input and @Output — parent ↔ child communication
//   - ViewEncapsulation
//   - Standalone Components (Angular 14+)
//   - Smart vs Dumb component pattern
// ─────────────────────────────────────────────────────────────────────────────

const NODES = [
  // ── PROBLEM REVEAL ──────────────────────────────────────────────────────────
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "ANG01 — COMPONENTS",
      title: "Status Card",
      body: `Build a reusable FlightStatusCard component that:

  • Receives a flight object as an @Input (flightNumber, origin, destination, status)
  • Displays the flight info in a card layout
  • Shows different styling based on status ("ON TIME" | "DELAYED" | "CANCELLED")
  • Emits an event when the user clicks "View Details"
  • Logs "Component ready" to console when it mounts
  • Cleans up any resources when it unmounts

This is the exact type of component United Airlines builds
for their internal operations dashboard.`,
      usecase:
        "Every Angular interview starts here. Components are the atoms of Angular. If you can explain @Component, @Input, @Output, and lifecycle hooks cold — you pass the first screen.",
    },
  },

  // ── OBJECTIVES ──────────────────────────────────────────────────────────────
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Explain what the @Component decorator does and its three key metadata properties",
      "Define selector and explain how Angular uses it to render components in templates",
      "Distinguish between templateUrl vs template and styleUrls vs styles",
      "Use @Input() to receive data from a parent component",
      "Use @Output() and EventEmitter to send events to a parent component",
      "Implement ngOnInit for setup logic and explain why not to use the constructor",
      "Implement ngOnDestroy for cleanup and explain why it matters",
      "Explain the difference between ngOnInit and ngOnChanges",
      "Describe ViewEncapsulation and its three modes",
      "Explain what a Standalone Component is (Angular 14+) and how it differs from module-based",
    ],
  },

  // ── STEP 1: @Component decorator ────────────────────────────────────────────
  {
    id: "step1",
    type: "question",
    editor: "tabbed",
    phase: "Step 1 of 8",
    paal: "Declare the @Component decorator with a selector of 'ua-flight-card' and an external template file.",
    hint: "You need two imports: Component from @angular/core, and you need both selector and templateUrl in the decorator.",
    answer_keywords: ["@component", "selector", "templateurl", "ua-flight-card"],
    seed_code: `// Step 1: Add the @Component decorator
// selector should be: 'ua-flight-card'
// templateUrl should point to: './flight-card.component.html'

import { Component } from '@angular/core';

export class FlightCardComponent {

}`,
    analogy: {
      title: "Similar pattern — a React component with metadata",
      code: `// React: you just export a function — no metadata needed
export default function FlightCard() { return <div /> }

// Angular: the CLASS needs metadata to tell Angular
// "what HTML tag activates me" and "where is my template"
@Component({
  selector: 'app-product-card',     // ← <app-product-card> in templates
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {}`,
      explain:
        "In React, a component IS a function. In Angular, a component is a TypeScript class PLUS metadata. The @Component decorator IS that metadata — it tells Angular what HTML tag renders this class, and where to find the template HTML.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasDecorator = a.includes("@component");
      const hasSelector = a.includes("selector:") && a.includes("ua-flight-card");
      const hasTemplate = a.includes("templateurl:");
      if (hasDecorator && hasSelector && hasTemplate) return "correct";
      if (hasDecorator && (hasSelector || hasTemplate)) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Correct. @Component is a decorator — a TypeScript function that attaches metadata to a class. selector: 'ua-flight-card' means wherever Angular sees <ua-flight-card> in a template, it renders this component. templateUrl is a relative path to the HTML file.",
    feedback_partial:
      "Close — you need all three: @Component decorator, selector: 'ua-flight-card', and templateUrl pointing to the HTML file.",
    feedback_wrong: `@Component({
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html'
})
export class FlightCardComponent {}

The decorator wraps the class definition — placed directly above the class keyword.`,
    expected: `@Component({
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.scss']
})
export class FlightCardComponent {}`,
    type_input: "code",
  },

  // ── STEP 2: @Input ───────────────────────────────────────────────────────────
  {
    id: "step2",
    type: "question",
    editor: "tabbed",
    phase: "Step 2 of 8",
    paal: "Add an @Input property called 'flight' typed as a Flight interface with flightNumber, origin, destination, and status fields.",
    hint: "Define the interface above the class. Then use @Input() inside the class body. You need to import Input from @angular/core.",
    answer_keywords: ["@input", "flight", "flightnumber", "origin", "destination", "status", "interface"],
    seed_code: `import { Component, Input } from '@angular/core';

// Step 2: Define the Flight interface here
// Then add an @Input() property to the class

@Component({
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html'
})
export class FlightCardComponent {
  // add @Input here
}`,
    analogy: {
      title: "Similar pattern — React props",
      code: `// React: props passed as function argument
function FlightCard({ flight }: { flight: Flight }) {
  return <div>{flight.flightNumber}</div>
}

// Angular: props passed via @Input() decorator on class property
export class FlightCardComponent {
  @Input() flight!: Flight  // ← parent binds: [flight]="myFlight"
}`,
      explain:
        "@Input() is Angular's equivalent of React props. The parent template writes [flight]=\"myFlightObject\" and Angular passes the value into the child's @Input() property. The ! (non-null assertion) tells TypeScript 'I promise this will be set before use'.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasInput = a.includes("@input()") || a.includes("@input");
      const hasFlight = a.includes("flight");
      const hasInterface =
        a.includes("interface") &&
        a.includes("flightnumber") &&
        a.includes("status");
      if (hasInput && hasFlight && hasInterface) return "correct";
      if (hasInput && hasFlight) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Perfect. The Flight interface gives you TypeScript type safety — Angular will enforce that only correctly-shaped objects can be passed. @Input() flight!: Flight means the parent MUST provide this value.",
    feedback_partial:
      "Good start — make sure you have BOTH the interface definition (with all four fields) AND the @Input() decorator on the flight property inside the class.",
    feedback_wrong: `interface Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  status: 'ON TIME' | 'DELAYED' | 'CANCELLED';
}

export class FlightCardComponent {
  @Input() flight!: Flight;
}`,
    expected: `interface Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  status: 'ON TIME' | 'DELAYED' | 'CANCELLED';
}

@Component({ selector: 'ua-flight-card', templateUrl: './flight-card.component.html' })
export class FlightCardComponent {
  @Input() flight!: Flight;
}`,
    type_input: "code",
  },

  // ── STEP 3: @Output ──────────────────────────────────────────────────────────
  {
    id: "step3",
    type: "question",
    editor: "tabbed",
    phase: "Step 3 of 8",
    paal: "Add an @Output() called 'viewDetails' that emits the flightNumber string when the user clicks 'View Details'. Write the emitter property and the handler method.",
    hint: "You need EventEmitter from @angular/core. The emitter is typed as EventEmitter<string>. The handler calls this.viewDetails.emit(this.flight.flightNumber).",
    answer_keywords: ["@output", "eventemitter", "viewdetails", "emit"],
    seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html'
})
export class FlightCardComponent {
  @Input() flight!: Flight;

  // Step 3: Add @Output and the handler method here

}`,
    analogy: {
      title: "Similar pattern — React callback prop",
      code: `// React: pass a callback function as prop
function FlightCard({ flight, onViewDetails }) {
  return <button onClick={() => onViewDetails(flight.flightNumber)}>
    View Details
  </button>
}

// Angular: @Output + EventEmitter replaces the callback prop
export class FlightCardComponent {
  @Input() flight!: Flight;
  @Output() viewDetails = new EventEmitter<string>();

  onViewDetailsClick() {
    this.viewDetails.emit(this.flight.flightNumber);
  }
}
// Parent template: (viewDetails)="handleDetails($event)"`,
      explain:
        "@Output() is Angular's equivalent of a callback prop in React. The parent listens with (viewDetails)=\"myHandler($event)\" — the parentheses mean 'event binding'. $event is whatever value you passed to .emit().",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasOutput = a.includes("@output()") || a.includes("@output");
      const hasEmitter = a.includes("eventemitter");
      const hasEmit = a.includes(".emit(");
      if (hasOutput && hasEmitter && hasEmit) return "correct";
      if (hasOutput && hasEmitter) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Correct. @Output() viewDetails = new EventEmitter<string>() declares the output. The handler calls .emit() with the value to send up. The parent listens with (viewDetails)=\"handleIt($event)\".",
    feedback_partial:
      "You have the emitter — now add the handler method that calls this.viewDetails.emit(this.flight.flightNumber).",
    feedback_wrong: `@Output() viewDetails = new EventEmitter<string>();

onViewDetailsClick(): void {
  this.viewDetails.emit(this.flight.flightNumber);
}`,
    expected: `@Output() viewDetails = new EventEmitter<string>();

onViewDetailsClick(): void {
  this.viewDetails.emit(this.flight.flightNumber);
}`,
    type_input: "code",
  },

  // ── STEP 4: ngOnInit ─────────────────────────────────────────────────────────
  {
    id: "step4",
    type: "question",
    editor: "tabbed",
    phase: "Step 4 of 8",
    paal: "Implement ngOnInit to log 'FlightCardComponent ready' to the console. The class must implement the OnInit interface.",
    hint: "Import OnInit from @angular/core. The class declaration becomes: export class FlightCardComponent implements OnInit",
    answer_keywords: ["implements", "oninit", "ngoninit", "console.log"],
    seed_code: `import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({ selector: 'ua-flight-card', templateUrl: './flight-card.component.html' })
export class FlightCardComponent {  // ← add 'implements OnInit' here

  @Input() flight!: Flight;
  @Output() viewDetails = new EventEmitter<string>();

  // Step 4: Add ngOnInit here

}`,
    analogy: {
      title: "Similar pattern — React useEffect with empty deps",
      code: `// React: runs once after mount
useEffect(() => {
  console.log('Component ready');
}, []);  // ← empty array = run once

// Angular: ngOnInit runs once after @Inputs are set
export class FlightCardComponent implements OnInit {
  ngOnInit(): void {
    console.log('Component ready');  // @Inputs are available here
  }
}
// KEY DIFFERENCE: constructor runs BEFORE @Inputs are set
// ngOnInit runs AFTER — so always use ngOnInit for setup logic`,
      explain:
        "The constructor in Angular runs BEFORE @Input() values are set. ngOnInit runs AFTER — meaning this.flight is available. This is the most common interview trap: 'Why not use the constructor?' Answer: because @Inputs haven't been set yet.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasImplements = a.includes("implementsoninit");
      const hasNgOnInit = a.includes("ngoninit()");
      const hasLog = a.includes("console.log");
      if (hasImplements && hasNgOnInit && hasLog) return "correct";
      if (hasNgOnInit && hasLog) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Correct. implements OnInit is a TypeScript contract — it forces you to define ngOnInit(). Angular calls it automatically after the component is initialized and @Input() values have been set. This is why you use ngOnInit, not the constructor, for setup logic.",
    feedback_partial:
      "Good — but make sure the class declaration includes 'implements OnInit'. This is a TypeScript interface that enforces the contract.",
    feedback_wrong: `export class FlightCardComponent implements OnInit {

  ngOnInit(): void {
    console.log('FlightCardComponent ready');
  }

}`,
    expected: `export class FlightCardComponent implements OnInit {

  ngOnInit(): void {
    console.log('FlightCardComponent ready');
  }

}`,
    type_input: "code",
  },

  // ── STEP 5: ngOnDestroy ──────────────────────────────────────────────────────
  {
    id: "step5",
    type: "question",
    editor: "tabbed",
    phase: "Step 5 of 8",
    paal: "Add ngOnDestroy to clean up. Create a destroy$ Subject, implement ngOnDestroy to call next() and complete() on it. This is the takeUntil cleanup pattern.",
    hint: "Import Subject from rxjs and OnDestroy from @angular/core. The Subject acts as a signal — anything that takeUntil(this.destroy$) will auto-unsubscribe.",
    answer_keywords: ["ondestroy", "ngondestroy", "subject", "destroy", "complete"],
    seed_code: `import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({ selector: 'ua-flight-card', templateUrl: './flight-card.component.html' })
export class FlightCardComponent implements OnInit, OnDestroy {

  @Input() flight!: Flight;
  @Output() viewDetails = new EventEmitter<string>();

  // Step 5: Add the destroy$ Subject and ngOnDestroy here

  ngOnInit(): void {
    console.log('FlightCardComponent ready');
  }

}`,
    analogy: {
      title: "Similar pattern — React useEffect cleanup",
      code: `// React: return a cleanup function from useEffect
useEffect(() => {
  const sub = someObservable.subscribe(handler);
  return () => sub.unsubscribe();  // ← cleanup
}, []);

// Angular: takeUntil pattern — cleaner for multiple subscriptions
private destroy$ = new Subject<void>();

ngOnInit() {
  someObservable
    .pipe(takeUntil(this.destroy$))  // ← auto-unsubscribes
    .subscribe(handler);
}

ngOnDestroy() {
  this.destroy$.next();     // ← signals "stop everything"
  this.destroy$.complete(); // ← closes the Subject
}`,
      explain:
        "Memory leaks are a top Angular interview topic. If you subscribe to an Observable and never unsubscribe, the callback keeps running even after the component is destroyed. takeUntil(this.destroy$) is the canonical Angular pattern — any subscription using it will auto-cancel when ngOnDestroy fires.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasDestroy = a.includes("destroy$") || a.includes("destroy");
      const hasSubject = a.includes("subject");
      const hasNgOnDestroy = a.includes("ngondestroy");
      const hasComplete = a.includes(".complete()") || a.includes(".next()");
      if (hasDestroy && hasSubject && hasNgOnDestroy && hasComplete) return "correct";
      if (hasNgOnDestroy && hasComplete) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Perfect. This is the canonical Angular cleanup pattern. destroy$.next() broadcasts the signal; destroy$.complete() closes the Subject itself. Any Observable piped through takeUntil(this.destroy$) will automatically unsubscribe when ngOnDestroy fires.",
    feedback_partial:
      "Almost — make sure you have: private destroy$ = new Subject<void>() declared as a class property, AND ngOnDestroy calling both .next() and .complete().",
    feedback_wrong: `private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}`,
    expected: `private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}`,
    type_input: "code",
  },

  // ── STEP 6: ngOnChanges ──────────────────────────────────────────────────────
  {
    id: "step6",
    type: "question",
    editor: "tabbed",
    phase: "Step 6 of 8",
    paal: "Add ngOnChanges to detect when the flight @Input changes. Log the previous and current flightNumber values. Use the SimpleChanges type.",
    hint: "Import OnChanges and SimpleChanges from @angular/core. ngOnChanges fires BEFORE ngOnInit on first run, then again whenever an @Input value changes.",
    answer_keywords: ["onchanges", "ngonchanges", "simplechanges", "previousvalue", "currentvalue"],
    seed_code: `import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

@Component({ selector: 'ua-flight-card', templateUrl: './flight-card.component.html' })
export class FlightCardComponent implements OnInit, OnDestroy, OnChanges {

  @Input() flight!: Flight;
  @Output() viewDetails = new EventEmitter<string>();
  private destroy$ = new Subject<void>();

  // Step 6: Implement ngOnChanges here

  ngOnInit(): void { console.log('FlightCardComponent ready'); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}`,
    analogy: {
      title: "Similar pattern — React useEffect with dependency",
      code: `// React: watch a prop for changes
useEffect(() => {
  console.log('flight changed:', flight);
}, [flight]);  // ← re-runs whenever flight changes

// Angular: ngOnChanges fires for every @Input change
ngOnChanges(changes: SimpleChanges): void {
  if (changes['flight']) {
    const prev = changes['flight'].previousValue;
    const curr = changes['flight'].currentValue;
    console.log('flight changed from', prev, 'to', curr);
  }
}
// ALSO: changes['flight'].firstChange === true on first run`,
      explain:
        "ngOnChanges fires BEFORE ngOnInit on first load, then again whenever any @Input() changes. The SimpleChanges object gives you previousValue, currentValue, and firstChange for each changed input. Key interview point: ngOnInit fires only once; ngOnChanges fires every time an Input changes.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasMethod = a.includes("ngonchanges");
      const hasChanges = a.includes("simplechanges") || a.includes("changes:");
      const accessesChange = a.includes("previousvalue") || a.includes("currentvalue") || a.includes("changes[");
      if (hasMethod && hasChanges && accessesChange) return "correct";
      if (hasMethod && hasChanges) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Correct. SimpleChanges is an object where each key is an @Input() property name. You check changes['flight'] to know if that specific input changed, and access .previousValue / .currentValue. The firstChange flag is true only on the very first run.",
    feedback_partial:
      "Good — now access the actual previous and current values from the SimpleChanges object: changes['flight'].previousValue and changes['flight'].currentValue.",
    feedback_wrong: `ngOnChanges(changes: SimpleChanges): void {
  if (changes['flight']) {
    console.log('Previous:', changes['flight'].previousValue?.flightNumber);
    console.log('Current:', changes['flight'].currentValue?.flightNumber);
  }
}`,
    expected: `ngOnChanges(changes: SimpleChanges): void {
  if (changes['flight']) {
    console.log('Previous:', changes['flight'].previousValue?.flightNumber);
    console.log('Current:', changes['flight'].currentValue?.flightNumber);
  }
}`,
    type_input: "code",
  },

  // ── ANCHOR CARD ──────────────────────────────────────────────────────────────
  {
    id: "anchor1",
    type: "anchor",
    phase: "Anchor Card",
    rule: "Constructor ≠ ngOnInit. @Inputs are NOT set in the constructor.",
    when: "Any time you need to use @Input() values for setup logic — use ngOnInit, not constructor.",
    mistake: "Accessing this.flight in the constructor → it will be undefined. Always use ngOnInit for anything that depends on @Input values.",
  },

  // ── STEP 7: Standalone Component (Angular 14+) ───────────────────────────────
  {
    id: "step7",
    type: "question",
    editor: "tabbed",
    phase: "Step 7 of 8",
    paal: "Refactor FlightCardComponent to be a Standalone Component (Angular 14+). It should import CommonModule for *ngIf and *ngFor support.",
    hint: "Add standalone: true to the @Component decorator and add an imports array. Standalone components don't need to be declared in an NgModule.",
    answer_keywords: ["standalone", "true", "imports", "commonmodule"],
    seed_code: `import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Step 7: Make this a Standalone Component
// Add standalone: true and an imports array to @Component

@Component({
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html'
})
export class FlightCardComponent implements OnInit {
  @Input() flight!: Flight;
  @Output() viewDetails = new EventEmitter<string>();
  ngOnInit() { console.log('ready'); }
}`,
    analogy: {
      title: "The difference — Module-based vs Standalone",
      code: `// OLD WAY (Angular 2–13): must declare in NgModule
@NgModule({
  declarations: [FlightCardComponent],  // ← must list every component
  imports: [CommonModule]
})
export class FlightModule {}

// NEW WAY (Angular 14+): component imports its own dependencies
@Component({
  standalone: true,          // ← I am self-contained
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html',
  imports: [CommonModule]    // ← I import what I need directly
})
export class FlightCardComponent {}`,
      explain:
        "Standalone components (Angular 14+) are self-contained — they declare their own imports without needing an NgModule. This is the direction Angular is moving. United's JD mentions Angular 14+ specifically — they're using standalones. Key interview line: 'Standalone components remove the need for NgModule boilerplate and enable better tree-shaking.'",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasStandalone = a.includes("standalone:true");
      const hasImports = a.includes("imports:") && a.includes("commonmodule");
      if (hasStandalone && hasImports) return "correct";
      if (hasStandalone) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Standalone: true + imports array — this is the Angular 14+ pattern. The component is now self-contained. No NgModule required. This is what United's Angular codebase is moving toward.",
    feedback_partial:
      "standalone: true is correct — now add the imports array with CommonModule so the template can use *ngIf and *ngFor.",
    feedback_wrong: `@Component({
  standalone: true,
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html',
  imports: [CommonModule]
})`,
    expected: `@Component({
  standalone: true,
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html',
  imports: [CommonModule]
})`,
    type_input: "code",
  },

  // ── STEP 8: ViewEncapsulation ────────────────────────────────────────────────
  {
    id: "step8",
    type: "question",
    editor: "tabbed",
    phase: "Step 8 of 8",
    paal: "This component uses ViewEncapsulation.None so its status styles (red for CANCELLED, amber for DELAYED) can bleed into child components. Add that to the decorator and explain in a comment why you chose None over Emulated.",
    hint: "Import ViewEncapsulation from @angular/core. Add encapsulation: ViewEncapsulation.None to the @Component decorator.",
    answer_keywords: ["viewencapsulation", "none", "encapsulation"],
    seed_code: `import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';

// Step 8: Add encapsulation: ViewEncapsulation.None
// And add a comment explaining the tradeoff vs Emulated

@Component({
  standalone: true,
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html',
  imports: [CommonModule],
  // add encapsulation here
})
export class FlightCardComponent implements OnInit {
  @Input() flight!: Flight;
}`,
    analogy: {
      title: "The 3 ViewEncapsulation modes",
      code: `// Emulated (DEFAULT) — Angular scopes styles to this component only
// adds _ngcontent-xxx attributes to CSS selectors automatically
encapsulation: ViewEncapsulation.Emulated  ← safest, default

// ShadowDom — uses native browser Shadow DOM
// true isolation, but limited browser support concerns
encapsulation: ViewEncapsulation.ShadowDom

// None — styles are global, no scoping
// your component's CSS affects the whole page
encapsulation: ViewEncapsulation.None  ← use sparingly`,
      explain:
        "Emulated (default) is what 99% of components use — Angular adds unique attributes to CSS so styles don't leak. None makes styles global — useful for a design system base component or a theme that intentionally needs to cascade. Key interview answer: 'I always default to Emulated and only use None when I explicitly need global style propagation, like a status badge library.'",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasEncapsulation = a.includes("encapsulation:");
      const hasNone = a.includes("viewencapsulation.none") || a.includes(".none");
      if (hasEncapsulation && hasNone) return "correct";
      if (hasEncapsulation) return "partial";
      return "wrong";
    },
    feedback_correct:
      "✅ Correct. ViewEncapsulation.None removes all CSS scoping — styles from this component become global. The interview answer: 'I use None only when I intentionally need styles to cascade, like a shared status-badge library. Default is always Emulated.'",
    feedback_partial:
      "You have the encapsulation property — make sure the value is ViewEncapsulation.None (the enum value, not a string).",
    feedback_wrong: `@Component({
  standalone: true,
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html',
  imports: [CommonModule],
  // None = styles are global (no Angular scoping)
  // Emulated (default) = styles scoped to this component only
  encapsulation: ViewEncapsulation.None
})`,
    expected: `@Component({
  standalone: true,
  selector: 'ua-flight-card',
  templateUrl: './flight-card.component.html',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None
})`,
    type_input: "code",
  },

  // ── ANCHOR CARD 2 ────────────────────────────────────────────────────────────
  {
    id: "anchor2",
    type: "anchor",
    phase: "Anchor Card",
    rule: "Emulated encapsulation is the safe default. None = global styles. Only use None when you mean it.",
    when: "Building a shared component library or theme tokens that must cascade — use None. Everything else — Emulated.",
    mistake: "Using ViewEncapsulation.None on a regular component and accidentally overriding global styles elsewhere in the app.",
  },

  // ── WFS ──────────────────────────────────────────────────────────────────────
  {
    id: "wfs",
    type: "wfs",
    phase: "Write From Scratch",
    rubric: [
      "@Component decorator with selector, templateUrl, standalone: true, and imports array",
      "Flight interface with flightNumber, origin, destination, status fields",
      "@Input() flight!: Flight property",
      "@Output() viewDetails = new EventEmitter<string>() property",
      "onViewDetailsClick() method calling this.viewDetails.emit(this.flight.flightNumber)",
      "implements OnInit, OnDestroy, OnChanges on the class",
      "private destroy$ = new Subject<void>() property",
      "ngOnInit() logging 'ready' (uses OnInit, not constructor)",
      "ngOnDestroy() calling destroy$.next() and destroy$.complete()",
      "ngOnChanges(changes: SimpleChanges) accessing previousValue and currentValue",
      "Can explain: why not constructor? why takeUntil? what does standalone: true do?",
    ],
  },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  wrap: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#ffffff",
    minHeight: "100vh",
    minWidth: "1000px",
    overflow: "hidden",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 24px",
    height: "96px",
    background: "#ffffff",
    borderBottom: "1px solid #0f172a",
    flexShrink: 0,
  },
  logo: {
    fontWeight: 700,
    fontSize: "13px",
    letterSpacing: "0.15em",
    color: "#7c3aed",
    marginRight: "8px",
  },
  engineTag: {
    fontWeight: 700,
    fontSize: "10px",
    letterSpacing: "0.12em",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  progressTrack: {
    flex: 1,
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
    borderRadius: "2px",
    transition: "width 0.4s ease",
  }),
  progressLabel: {
    fontSize: "11px",
    color: "#0f172a",
    fontWeight: 600,
    minWidth: "32px",
    textAlign: "right",
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: "200px",
    flexShrink: 0,
    background: "#ffffff",
    borderRight: "1px solid #0f172a",
    padding: "20px 12px",
    overflowY: "auto",
  },
  sidebarLabel: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#0f172a",
    textTransform: "uppercase",
    marginBottom: "12px",
    paddingLeft: "8px",
  },
  sideItem: (active, done) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 8px",
    borderRadius: "6px",
    marginBottom: "2px",
    cursor: "pointer",
    background: active ? "rgba(124,58,237,0.15)" : "transparent",
    border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
    transition: "all 0.15s",
  }),
  sideItemDot: (active, done) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
    background: done ? "#10b981" : active ? "#7c3aed" : "#0f172a",
  }),
  sideItemText: (active, done) => ({
    fontSize: "11px",
    color: done ? "#10b981" : active ? "#7c3aed" : "#0f172a",
    fontWeight: active ? 600 : 400,
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  main: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    padding: "24px 40px 24px 40px",
    maxWidth: "720px",
  },
  mainScroll: {
    flex: 1,
    minHeight: 0,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
  },
  phase: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#7c3aed",
    marginBottom: "10px",
  },
  h1: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "20px",
    lineHeight: 1.3,
  },
  tag: (color) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    background: color === "purple" ? "rgba(124,58,237,0.2)" : "rgba(6,182,212,0.2)",
    color: color === "purple" ? "#7c3aed" : "#06b6d4",
    border: `1px solid ${color === "purple" ? "rgba(124,58,237,0.4)" : "rgba(6,182,212,0.4)"}`,
    marginBottom: "14px",
  }),
  pre: {
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    background: "#f8fafc",
    border: "1px solid #0f172a",
    borderRadius: "8px",
    padding: "16px 20px",
    lineHeight: 1.7,
    color: "#0f172a",
    whiteSpace: "pre-wrap",
    marginBottom: "20px",
  },
  usecase: {
    fontSize: "13px",
    color: "#0f172a",
    borderLeft: "2px solid #7c3aed",
    paddingLeft: "14px",
    lineHeight: 1.7,
    marginBottom: "24px",
  },
  objList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "28px",
  },
  objItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    fontSize: "13px",
    color: "#0f172a",
    lineHeight: 1.5,
  },
  objDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#7c3aed",
    flexShrink: 0,
    marginTop: "6px",
  },
  paalLabel: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#7c3aed",
    marginBottom: "8px",
  },
  paalText: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.5,
    marginBottom: "6px",
  },
  hint: {
    fontSize: "12px",
    color: "#0f172a",
    fontStyle: "italic",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    minHeight: "140px",
    background: "#f8fafc",
    border: "1px solid #0f172a",
    borderRadius: "8px",
    padding: "14px",
    color: "#0f172a",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    marginBottom: "12px",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
  btn: (variant) => ({
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    letterSpacing: "0.05em",
    ...(variant === "primary"
      ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "#fff" }
      : variant === "secondary"
      ? { background: "#f1f5f9", border: "1px solid #0f172a", color: "#0f172a" }
      : { background: "transparent", border: "1px solid #0f172a", color: "#0f172a", fontSize: "11px" }),
  }),
  feedback: (type) => ({
    padding: "14px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    marginBottom: "16px",
    ...(type === "correct"
      ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#059669" }
      : type === "partial"
      ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#d97706" }
      : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#dc2626" }),
  }),
  analogyCard: {
    background: "#f8fafc",
    border: "1px solid #0f172a",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
  },
  analogyTitle: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#7c3aed",
    marginBottom: "10px",
  },
  anchorCard: {
    background: "rgba(124,58,237,0.08)",
    border: "1px solid rgba(124,58,237,0.3)",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "24px",
  },
  anchorTitle: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#7c3aed",
    marginBottom: "12px",
  },
  anchorRule: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "16px",
    lineHeight: 1.4,
  },
  anchorRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "10px",
    alignItems: "flex-start",
  },
  anchorLabel: {
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#0f172a",
    minWidth: "60px",
    paddingTop: "2px",
  },
  anchorValue: {
    fontSize: "13px",
    color: "#0f172a",
    lineHeight: 1.5,
  },
  wfsRubric: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "24px",
  },
  rubricItem: (checked) => ({
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "10px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    background: checked ? "rgba(16,185,129,0.08)" : "#f8fafc",
    border: `1px solid ${checked ? "rgba(16,185,129,0.3)" : "#0f172a"}`,
    transition: "all 0.15s",
  }),
  rubricText: (checked) => ({
    fontSize: "13px",
    color: checked ? "#059669" : "#0f172a",
    lineHeight: 1.5,
    textDecoration: checked ? "line-through" : "none",
  }),
  completeBanner: {
    textAlign: "center",
    padding: "60px 20px",
  },
};

// ─── SIDEBAR ITEMS ─────────────────────────────────────────────────────────────
const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "@Component" },
  { id: "step2", label: "@Input" },
  { id: "step3", label: "@Output" },
  { id: "step4", label: "ngOnInit" },
  { id: "step5", label: "ngOnDestroy" },
  { id: "step6", label: "ngOnChanges" },
  { id: "anchor1", label: "Anchor 1" },
  { id: "step7", label: "Standalone" },
  { id: "step8", label: "ViewEncap" },
  { id: "anchor2", label: "Anchor 2" },
  { id: "wfs", label: "Write From Scratch" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AngularA01Components({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // keyed by node.id
  const [result, setResult] = useState(null); // 'correct' | 'partial' | 'wrong'
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [wfsChecked, setWfsChecked] = useState([]);
  const [mainTab, setMainTab] = useState("editor");

  const node = NODES[nodeIndex];

  useEffect(() => {
    setMainTab("editor");
  }, [nodeIndex]);
  const progress = Math.round((completedNodes.length / NODES.length) * 100);

  const isTabbedStep = node.type === "question" && node.editor === "tabbed";
  function normalizeTabbedAnswer(raw) {
    if (raw == null) return { ts: "", html: "", css: "" };
    if (typeof raw === "object" && "ts" in raw) return { ts: raw.ts ?? "", html: raw.html ?? "", css: raw.css ?? "" };
    return { ts: String(raw || ""), html: "", css: "" };
  }
  const rawAnswer = (() => {
    if (answers[node.id] !== undefined) return answers[node.id];
    if (node.type === "question") {
      for (let i = nodeIndex - 1; i >= 0; i--) {
        const prev = NODES[i];
        if (prev.type === "question" && answers[prev.id] !== undefined) {
          return answers[prev.id];
        }
      }
    }
    return node.seed_code || "";
  })();
  const currentAnswer = isTabbedStep ? normalizeTabbedAnswer(rawAnswer) : rawAnswer;
  const setCurrentAnswer = (val) => setAnswers((prev) => ({ ...prev, [node.id]: val }));
  const tabbedHasContent = isTabbedStep && (currentAnswer.ts?.trim() || currentAnswer.html?.trim() || currentAnswer.css?.trim());

  function next() {
    if (!completedNodes.includes(node.id)) {
      setCompletedNodes((p) => [...p, node.id]);
    }
    setNodeIndex((i) => i + 1);
    setResult(null);
    setShowAnalogy(false);
    setShowExpected(false);
  }

  function evaluate() {
    let toEval;
    if (isTabbedStep) {
      const ts = (currentAnswer?.ts ?? "").trim();
      const html = (currentAnswer?.html ?? "").trim();
      const css = (currentAnswer?.css ?? "").trim();
      if (!ts && !html && !css) return;
      toEval = mergeAngularTsWithHtml(ts, html);
      toEval = mergeAngularCssIntoTS(toEval, css);
    } else {
      toEval = typeof currentAnswer === "string" ? currentAnswer : "";
    }
    if (!(typeof toEval === "string" && toEval.trim())) return;
    const evalFn = node.evaluate;
    let res;
    if (evalFn) {
      res = evalFn(toEval);
    } else {
      const a = toEval.toLowerCase();
      const keywords = node.answer_keywords || [];
      const hits = keywords.filter((k) => a.includes(k.toLowerCase())).length;
      if (hits === keywords.length) res = "correct";
      else if (hits >= keywords.length * 0.6) res = "partial";
      else res = "wrong";
    }
    setResult(res);
    if (node.hint || node[`feedback_${res}`]) setShowFeedbackModal(true);
    if (res === "correct") {
      if (!completedNodes.includes(node.id)) {
        setCompletedNodes((p) => [...p, node.id]);
      }
    }
  }

  function getFeedback() {
    if (!result) return null;
    const fb = node[`feedback_${result}`];
    let toEval;
    if (isTabbedStep) {
      const ts = (currentAnswer?.ts ?? "").trim();
      const html = (currentAnswer?.html ?? "").trim();
      const css = (currentAnswer?.css ?? "").trim();
      toEval = mergeAngularCssIntoTS(mergeAngularTsWithHtml(ts, html), css);
    } else {
      toEval = currentAnswer;
    }
    if (typeof fb === "function") return fb(toEval);
    return fb;
  }

  // ── RENDERERS ─────────────────────────────────────────────────────────────
  function renderReveal() {
    const c = node.content;
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <div style={s.tag("purple")}>{c.tag}</div>
        <h1 style={s.h1}>{c.title}</h1>
        <div style={s.pre}>{c.body}</div>
        <div style={s.usecase}>{c.usecase}</div>
        <div style={s.btnRow}>
          <button style={s.btn("primary")} onClick={next}>LET'S BUILD IT →</button>
        </div>
      </div>
    );
  }

  function renderObjectives() {
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>By the end of this engine, you will be able to:</h1>
        <ul style={s.objList}>
          {node.items.map((item, i) => (
            <li key={i} style={s.objItem}>
              <div style={s.objDot} />
              {item}
            </li>
          ))}
        </ul>
        <div style={s.btnRow}>
          <button style={s.btn("primary")} onClick={next}>START →</button>
        </div>
      </div>
    );
  }

  function renderQuestion() {
    const feedback = getFeedback();
    const editorContent = (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden", width: "100%" }}>
        <div style={s.phase}>{node.phase}</div>
        {showAnalogy && node.analogy ? (
          <div style={s.analogyCard}>
            <div style={s.analogyTitle}>💡 ANALOGY — {node.analogy.title}</div>
            <pre style={{ ...s.pre, marginBottom: "12px" }}>{node.analogy.code}</pre>
            <div style={{ fontSize: "13px", color: "#0f172a", lineHeight: 1.7, borderLeft: "2px solid #7c3aed", paddingLeft: "14px", marginBottom: "20px" }}>
              {node.analogy.explain}
            </div>
            <button style={{ ...s.btn("primary"), width: "100%" }} onClick={() => setShowAnalogy(false)}>
              GOT IT — LET ME TRY →
            </button>
          </div>
        ) : (
          <>
            <div style={{ flexShrink: 0, fontSize: "11px", color: "#00d4ff", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "4px" }}>CODE BUILT SO FAR — edit below</div>
            <div style={{ flex: 1, minHeight: 280, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {isTabbedStep ? (
                <AngularTabbedEditor
                  value={currentAnswer}
                  onChange={setCurrentAnswer}
                  height="100%"
                />
              ) : (
                <CodeEditor
                  value={currentAnswer}
                  onChange={setCurrentAnswer}
                  height="100%"
                />
              )}
            </div>
            <div style={{ flexShrink: 0, paddingTop: "12px", borderTop: "1px solid #e2e8f0", marginTop: "8px" }}>
              {(node.hint || feedback) && (
                <button type="button" style={{ ...s.btn("secondary"), marginBottom: "12px" }} onClick={() => setShowFeedbackModal(true)}>💡 VIEW HINT & FEEDBACK</button>
              )}
              {showExpected && node.expected && (
                <div style={{ ...s.pre, borderLeft: "2px solid #10b981", marginBottom: "16px" }}>
                  <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#10b981", marginBottom: "8px" }}>MODEL ANSWER</div>
                  {node.expected}
                </div>
              )}
              <div style={s.btnRow}>
                <button style={s.btn("primary")} onClick={evaluate} disabled={isTabbedStep ? !tabbedHasContent : !currentAnswer.trim()}>CHECK →</button>
                {node.analogy && <button style={s.btn("secondary")} onClick={() => setShowAnalogy(true)}>SEE ANALOGY</button>}
                {result && result !== "correct" && <button style={s.btn("ghost")} onClick={() => setShowExpected(true)}>SHOW ANSWER</button>}
                {result === "correct" && <button style={s.btn("primary")} onClick={next}>NEXT →</button>}
                {result && result !== "correct" && <button style={{ ...s.btn("ghost"), marginLeft: "auto" }} onClick={next}>SKIP →</button>}
              </div>
            </div>
            {showFeedbackModal && (node.hint || feedback) && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.5)", padding: "24px", boxSizing: "border-box" }}
                onClick={() => setShowFeedbackModal(false)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-modal-title"
              >
                <div
                  style={{ background: "#ffffff", borderRadius: "12px", padding: "24px", maxWidth: "520px", width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div id="feedback-modal-title" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", color: "#64748b", marginBottom: "16px" }}>HINT & FEEDBACK</div>
                  {node.hint && <div style={{ ...s.hint, marginBottom: feedback ? "16px" : 0 }}>💡 {node.hint}</div>}
                  {feedback && <div style={s.feedback(result)}>{feedback}</div>}
                  <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                    <button type="button" style={s.btn("primary")} onClick={() => setShowFeedbackModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
    const getOutputPreview = isTabbedStep
      ? (ans) => {
          const a = typeof ans === "string" ? (() => { try { const p = JSON.parse(ans); return p && typeof p === "object" ? p : {}; } catch (_) { return {}; } })() : (ans && typeof ans === "object" ? ans : {});
          const html = (a.html ?? "").trim();
          const css = (a.css ?? "").trim();
          return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || "<p>Add markup in the HTML tab to see a preview.</p>"}</body></html>`;
        }
      : undefined;

    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <LessonEditorOutputTabs
          node={node}
          nodes={NODES}
          mainTab={mainTab}
          setMainTab={setMainTab}
          answer={isTabbedStep ? JSON.stringify(currentAnswer) : (currentAnswer || "")}
          getOutputPreview={getOutputPreview}
        >
          {editorContent}
        </LessonEditorOutputTabs>
      </div>
    );
  }

  function renderAnchor() {
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>Save this to memory</h1>
        <div style={s.anchorCard}>
          <div style={s.anchorTitle}>⚓ ANCHOR CARD</div>
          <div style={s.anchorRule}>{node.rule}</div>
          <div>
            <div style={s.anchorRow}>
              <div style={s.anchorLabel}>WHEN</div>
              <div style={s.anchorValue}>{node.when}</div>
            </div>
            <div style={s.anchorRow}>
              <div style={s.anchorLabel}>MISTAKE</div>
              <div style={s.anchorValue}>{node.mistake}</div>
            </div>
          </div>
        </div>
        <div style={s.btnRow}>
          <button style={s.btn("primary")} onClick={next}>GOT IT →</button>
        </div>
      </div>
    );
  }

  function renderWFS() {
    const allChecked = wfsChecked.length === node.rubric.length;
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>Write From Scratch</h1>
        <div style={s.pre}>{`Close this panel. Open a blank file.
Reproduce the full FlightCardComponent from memory.
No hints. No looking back. Check each item as you write it.`}</div>
        <div style={{ ...s.paalLabel, marginBottom: "12px" }}>SELF-CHECK RUBRIC</div>
        <div style={s.wfsRubric}>
          {node.rubric.map((item, i) => {
            const checked = wfsChecked.includes(i);
            return (
              <div key={i} style={s.rubricItem(checked)} onClick={() =>
                setWfsChecked((p) => checked ? p.filter((x) => x !== i) : [...p, i])
              }>
                <div style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}>
                  {checked
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <div style={{ width: 14, height: 14, border: "1px solid #0f172a", borderRadius: "3px" }} />}
                </div>
                <div style={s.rubricText(checked)}>{item}</div>
              </div>
            );
          })}
        </div>
        {allChecked && (
          <div>
            <div style={s.feedback("correct")}>
              {`✅ Engine ANG01 Complete — Components & Decorators mastered.\nNext: ANG02 — Data Binding (all 4 types)`}
            </div>
            <div style={s.btnRow}>
              <button style={s.btn("primary")} onClick={onNextLesson ?? next}>
                NEXT ENGINE →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderComplete() {
    return (
      <div style={s.completeBanner}>
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>🎯</div>
        <h1 style={{ ...s.h1, textAlign: "center" }}>Engine ANG01 Complete</h1>
        <p style={{ color: "#0f172a", fontSize: "13px" }}>
          Components & Decorators — mastered.
        </p>
        {onNextLesson && (
          <div style={{ ...s.btnRow, justifyContent: "center", marginTop: "24px" }}>
            <button style={s.btn("primary")} onClick={onNextLesson}>NEXT ENGINE →</button>
          </div>
        )}
      </div>
    );
  }

  function renderNode() {
    if (nodeIndex >= NODES.length) return renderComplete();
    switch (node.type) {
      case "reveal": return renderReveal();
      case "objectives": return renderObjectives();
      case "question": return renderQuestion();
      case "anchor": return renderAnchor();
      case "wfs": return renderWFS();
      default: return renderReveal();
    }
  }

  return (
    <div style={s.wrap}>
      {/* TOP BAR */}
      <div style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <InpactLogo height={80} style={{ marginRight: "8px" }} />
        </div>
        <div style={s.engineTag}>ANG01 — COMPONENTS</div>
        <div style={s.progressTrack}>
          <div style={s.progressFill(progress)} />
        </div>
        <div style={s.progressLabel}>{progress}%</div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .inpact-sidebar { display: none !important; }
          .inpact-main { min-width: 100vw !important; max-width: 100vw !important; padding: 16px !important; }
        }
      `}</style>
      <div style={s.body}>
        {/* SIDEBAR */}
        <div className="inpact-sidebar" style={s.sidebar}>
          <div style={s.sidebarLabel}>PROGRESS</div>
          {sideItems.map((item, i) => {
            const isActive = NODES[nodeIndex]?.id === item.id;
            const isDone = completedNodes.includes(item.id);
            return (
              <div
                key={item.id}
                style={s.sideItem(isActive, isDone)}
                onClick={() => setNodeIndex(i)}
                role="button"
                tabIndex={0}
              >
                <div style={s.sideItemDot(isActive, isDone)} />
                <div style={s.sideItemText(isActive, isDone)}>{item.label}</div>
                {isDone && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* MAIN */}
        <div className="inpact-main" style={s.main}>
          <div style={s.mainScroll}>{renderNode()}</div>
        </div>
      </div>
    </div>
  );
}

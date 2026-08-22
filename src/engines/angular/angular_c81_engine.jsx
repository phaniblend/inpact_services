import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Feature Flag Hook (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #81 (Angular)", title: TITLE, body: "Expose feature flags in Angular via an injectable FeatureFlagService: flags = signal<Record<string, boolean>>({}); isOn(name: string) { return this.flags()[name] ?? false; }. Load flags from API or config and inject the service in components.", usecase: "Angular service with signals provides feature flags for *ngIf and conditional logic." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["FeatureFlagService: flags = signal<Record<string, boolean>>({}); isOn(name) { return !!this.flags()[name]; }", "Load from http.get and flags.set(response) in ngOnInit or constructor", "Component: *ngIf=\"featureFlags.isOn('newUI')\"", "Optional: environment-based defaults before API load"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create FeatureFlagService with flags = signal<Record<string, boolean>>({ newUI: false }). isOn(name: string): boolean { return !!this.flags()[name]; }. providedIn: 'root'.", answer_keywords: ["flags", "signal", "isOn"], seed_code: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  flags = signal<Record<string, boolean>>({ newUI: false });
  isOn(name: string): boolean {
    return !!this.flags()[name];
  }
}`, feedback_correct: "✅ FeatureFlagService.", feedback_partial: "flags signal.", feedback_wrong: "isOn", expected: "flags signal and isOn(name)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In a component inject FeatureFlagService. Template: *ngIf=\"flags.isOn('newUI')\">New UI</div> and *ngIf=\"!flags.isOn('newUI')\">Old UI</div>.", answer_keywords: ["isOn", "ngIf", "newUI"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureFlagService } from './feature-flag.service';

@Component({
  selector: 'app-feature-demo',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngIf="flags.isOn('newUI')">New UI</div>
    <div *ngIf="!flags.isOn('newUI')">Old UI</div>
  \`,
})
export class FeatureFlagDemoComponent {
  flags = inject(FeatureFlagService);
}`, feedback_correct: "✅ *ngIf with isOn.", feedback_partial: "flags.isOn.", feedback_wrong: "newUI", expected: "*ngIf=\"flags.isOn('newUI')\"" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Load flags from API: inject HttpClient and in constructor or ngOnInit call this.http.get<Record<string, boolean>>('/api/flags').subscribe(r => this.flags.set(r)). Export the service.", answer_keywords: ["HttpClient", "get", "export"], seed_code: `import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private http = inject(HttpClient);
  flags = signal<Record<string, boolean>>({});
  constructor() {
    this.http.get<Record<string, boolean>>('/api/flags').subscribe(r => this.flags.set(r));
  }
  isOn(name: string): boolean { return !!this.flags()[name]; }
}`, feedback_correct: "✅ Feature Flag Hook (Angular) complete.", feedback_partial: "http.get flags.", feedback_wrong: "Export", expected: "http.get and flags.set" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 81, title: TITLE, shortName: "A — FEATURE FLAG" });

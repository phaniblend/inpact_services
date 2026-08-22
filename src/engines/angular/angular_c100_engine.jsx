import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Design Real-Time Dashboard (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #100 (Angular)", title: TITLE, body: "Design a real-time dashboard in Angular: use WebSocket or Server-Sent Events to push data; hold metrics in signals (e.g. metrics = signal({ users: 0, orders: 0 })); update signals when messages arrive; layout with grid or cards that bind to metrics().", usecase: "Angular WebSocket/SSE service and signals power a real-time dashboard that updates live." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["DashboardService: metrics = signal({}); connect to WebSocket or SSE and on message parse and metrics.set(newState)", "DashboardComponent: inject service; template binds {{ metrics().users }}, {{ metrics().orders }}", "Optional: charts or tables that take metrics() as input; use computed for derived values", "Reconnect logic and loading state"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create DashboardService with metrics = signal<{ users?: number; orders?: number }>({}). connect() { const ws = new WebSocket('wss://example.com/stream'); ws.onmessage = (e) => { const data = JSON.parse(e.data); this.metrics.set(data); }; }. providedIn: 'root'.", answer_keywords: ["metrics", "signal", "WebSocket"], seed_code: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  metrics = signal<{ users?: number; orders?: number }>({});
  connect() {
    const ws = new WebSocket('wss://example.com/stream');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data as string);
      this.metrics.set(data);
    };
  }
}`, feedback_correct: "✅ DashboardService with WebSocket.", feedback_partial: "metrics.set.", feedback_wrong: "onmessage", expected: "metrics signal and WebSocket onmessage" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create DashboardComponent that injects DashboardService. In ngOnInit call dashboard.connect(). Template: <div class=\"grid\"><div>Users: {{ dashboard.metrics().users ?? 0 }}</div><div>Orders: {{ dashboard.metrics().orders ?? 0 }}</div></div>.", answer_keywords: ["dashboard.metrics()", "connect", "ngOnInit"], seed_code: `import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: \`
    <div class="grid">
      <div>Users: {{ dashboard.metrics().users ?? 0 }}</div>
      <div>Orders: {{ dashboard.metrics().orders ?? 0 }}</div>
    </div>
  \`,
})
export class DashboardComponent implements OnInit {
  dashboard = inject(DashboardService);
  ngOnInit() {
    this.dashboard.connect();
  }
}`, feedback_correct: "✅ Dashboard template and connect.", feedback_partial: "metrics().", feedback_wrong: "connect", expected: "dashboard.metrics() in template and connect()" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add loading = signal(true). Set loading.set(false) on first message. Show *ngIf=\"!dashboard.loading()\" for content and a spinner when loading(). Add computed total = computed(() => (dashboard.metrics().users ?? 0) + (dashboard.metrics().orders ?? 0)). Export DashboardService and DashboardComponent.", answer_keywords: ["loading", "computed", "export"], seed_code: `import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p *ngIf="dashboard.loading()">Loading...</p>
    <div *ngIf="!dashboard.loading()" class="grid">
      <div>Users: {{ dashboard.metrics().users ?? 0 }}</div>
      <div>Orders: {{ dashboard.metrics().orders ?? 0 }}</div>
      <div>Total: {{ total() }}</div>
    </div>
  \`,
})
export class DashboardComponent implements OnInit {
  dashboard = inject(DashboardService);
  total = computed(() => (this.dashboard.metrics().users ?? 0) + (this.dashboard.metrics().orders ?? 0));
  ngOnInit() {
    this.dashboard.connect();
  }
}`, feedback_correct: "✅ Design Real-Time Dashboard (Angular) complete.", feedback_partial: "loading.", feedback_wrong: "Export", expected: "loading state, computed total, and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 100, title: TITLE, shortName: "A — REAL-TIME DASHBOARD" });

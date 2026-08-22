import { useState, useEffect } from "react";
import InpactLogo from "../../components/InpactLogo.jsx";
import CodeEditor from "../CodeEditor";
import LessonEditorOutputTabs from "../LessonEditorOutputTabs";

if (typeof document !== "undefined" && !document.getElementById("dm-sans-font")) {
  const link = document.createElement("link");
  link.id = "dm-sans-font";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
  document.head.appendChild(link);
}

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "ANG03 — SERVICES & DI",
      title: "Data Service",
      body: `Build a FlightService that:

  • Is injectable application-wide as a singleton
  • Uses HttpClient to fetch flights from an API
  • Has searchFlights(origin, destination) returning Observable<Flight[]>
  • Caches results so repeat calls don't hit the API
  • Uses an InjectionToken for the API base URL config value
  • Can explain all three provider scopes and what happens at each`,
      usecase: "Services and DI are asked in every Angular interview. 'Where do you provide a service?', 'What is providedIn root?', 'When do you get multiple instances?' If you can answer these cold you've cleared the foundational bar.",
    },
  },

  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Create a service using @Injectable and explain what the decorator does",
      "Explain providedIn: 'root' and why it is the preferred registration method",
      "Explain the difference between root, module-level, and component-level providers",
      "Inject a service via the constructor and explain how Angular resolves it",
      "Explain what a singleton is and how Angular DI enforces it",
      "Create and use an InjectionToken for a non-class dependency",
      "Explain useClass, useValue, and useFactory with a use case for each",
      "Make an HTTP GET call inside a service using HttpClient",
    ],
  },

  {
    id: "step1", type: "question", phase: "Step 1 of 7",
    paal: "Create FlightService with @Injectable provided in root. Add a private flights array and a getFlights() method.",
    hint: "providedIn: 'root' registers the service with the root injector — one singleton for the whole app. No NgModule providers array needed.",
    answer_keywords: ["@injectable", "providedin", "root", "flightservice"],
    seed_code: `// Step 1: Create FlightService as an app-wide singleton
import { Injectable } from '@angular/core';

`,
    analogy: {
      title: "Service vs Component",
      code: `// Component: controls a VIEW
@Component({ selector: 'app-root', template: '<h1>Hello</h1>' })
export class AppComponent {}

// Service: shared LOGIC and DATA (no template)
@Injectable({ providedIn: 'root' })
export class FlightService {
  private flights: Flight[] = [];
  getFlights(): Flight[] { return this.flights; }
}

// providedIn: 'root' = one instance, tree-shakeable
// No need to add to NgModule providers array`,
      explain: "Services are singleton objects — Angular creates one instance and shares it everywhere. Components own the VIEW, services own the LOGIC and DATA. providedIn: 'root' is the modern way — no need to manually add to NgModule providers.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasDecorator = a.includes("@injectable");
      const hasRoot = a.includes("providedin") && a.includes("root");
      const hasClass = a.includes("flightservice");
      if (hasDecorator && hasRoot && hasClass) return "correct";
      if (hasDecorator && hasRoot) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. @Injectable({ providedIn: 'root' }) registers with the root injector — one shared instance for the entire app. This is the preferred modern approach.",
    feedback_partial: "Good — you have @Injectable. Make sure you have providedIn: 'root' in the config and the class is named FlightService.",
    feedback_wrong: `@Injectable({ providedIn: 'root' })\nexport class FlightService {\n  private flights: Flight[] = [];\n  getFlights(): Flight[] { return this.flights; }\n}`,
    expected: `@Injectable({ providedIn: 'root' })\nexport class FlightService {\n  private flights: Flight[] = [];\n  getFlights(): Flight[] { return this.flights; }\n}`,
    type_input: "code",
  },

  {
    id: "step2", type: "question", phase: "Step 2 of 7",
    paal: "Inject HttpClient into FlightService via the constructor. Add searchFlights(origin, destination) that makes a GET request to '/api/flights' with query params and returns Observable<Flight[]>.",
    hint: "HttpClient is injected the same way as any service — constructor with private. Use this.http.get<Flight[]>() with an HttpParams object.",
    answer_keywords: ["httpclient", "constructor", "private", "http.get", "observable"],
    seed_code: `import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FlightService {
  // Step 2: inject HttpClient, add searchFlights method
}`,
    analogy: {
      title: "Constructor injection — how Angular resolves it",
      code: `@Injectable({ providedIn: 'root' })
export class FlightService {

  constructor(private http: HttpClient) {}
  // Angular reads the TypeScript type annotation
  // looks up HttpClient in the injector
  // provides the singleton instance automatically

  searchFlights(origin: string, dest: string): Observable<Flight[]> {
    const params = new HttpParams()
      .set('origin', origin)
      .set('destination', dest);
    return this.http.get<Flight[]>('/api/flights', { params });
    // NOTE: returns Observable — HTTP call doesn't fire until subscribed
  }
}`,
      explain: "Angular reads TypeScript type annotations in the constructor and resolves each dependency from the injector tree. You declare what you need — Angular wires it up. http.get() returns an Observable — the HTTP call does NOT execute until someone subscribes.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasConstructor = a.includes("constructor") && a.includes("httpclient");
      const hasGet = a.includes("http.get") || a.includes("this.http.get");
      const hasReturn = a.includes("observable") || a.includes("return");
      if (hasConstructor && hasGet && hasReturn) return "correct";
      if (hasConstructor && hasGet) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Angular reads the constructor type annotations and resolves HttpClient from the injector. http.get() returns an Observable — the HTTP call doesn't fire until someone subscribes.",
    feedback_partial: "Good — you have HttpClient injected. Now add searchFlights that calls this.http.get<Flight[]>() and returns the Observable.",
    feedback_wrong: `constructor(private http: HttpClient) {}\n\nsearchFlights(origin: string, destination: string): Observable<Flight[]> {\n  const params = new HttpParams().set('origin', origin).set('destination', destination);\n  return this.http.get<Flight[]>('/api/flights', { params });\n}`,
    expected: `constructor(private http: HttpClient) {}\n\nsearchFlights(origin: string, destination: string): Observable<Flight[]> {\n  const params = new HttpParams().set('origin', origin).set('destination', destination);\n  return this.http.get<Flight[]>('/api/flights', { params });\n}`,
    type_input: "code",
  },

  {
    id: "step3", type: "question", phase: "Step 3 of 7",
    paal: "Inject FlightService into FlightSearchComponent. In ngOnInit, assign searchFlights('LAX','ORD') to a flights$ Observable property. Do NOT subscribe manually.",
    hint: "Assign the Observable to a property — don't call .subscribe(). Let the async pipe in the template handle subscription.",
    answer_keywords: ["flightservice", "constructor", "flights$", "searchflights", "ngoninit"],
    seed_code: `import { Component, OnInit } from '@angular/core';
import { FlightService } from './flight.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'ua-flight-search',
  template: \`<li *ngFor="let f of flights$ | async">{{ f.flightNumber }}</li>\`
})
export class FlightSearchComponent implements OnInit {
  // Step 3: inject FlightService, set up flights$ Observable
}`,
    analogy: {
      title: "Inject → assign Observable → async pipe subscribes",
      code: `export class FlightSearchComponent implements OnInit {
  flights$!: Observable<Flight[]>;

  constructor(private flightService: FlightService) {}
  // Angular provides the SAME singleton every component gets

  ngOnInit(): void {
    this.flights$ = this.flightService.searchFlights('LAX', 'ORD');
    // NOT subscribed yet — just an Observable on a property
    // The template async pipe does the subscribing + cleanup
  }
}

// WHY NOT .subscribe() here?
// async pipe auto-unsubscribes on destroy — no memory leak
// .subscribe() requires manual takeUntil cleanup`,
      explain: "The pattern: inject in constructor → assign Observable to property → async pipe handles subscription. Never manually subscribe in ngOnInit unless you have a specific reason. This is the clean Angular data flow.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasInjection = a.includes("flightservice") && a.includes("constructor");
      const hasFlights$ = a.includes("flights$");
      const hasSearch = a.includes("searchflights");
      if (hasInjection && hasFlights$ && hasSearch) return "correct";
      if (hasInjection && hasFlights$) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Perfect. Inject → assign Observable → async pipe subscribes. This is the canonical Angular data flow. No manual subscribe, no takeUntil needed.",
    feedback_partial: "Good — FlightService injected. Now assign the result of searchFlights() to flights$ in ngOnInit (don't subscribe).",
    feedback_wrong: `flights$!: Observable<Flight[]>;\n\nconstructor(private flightService: FlightService) {}\n\nngOnInit(): void {\n  this.flights$ = this.flightService.searchFlights('LAX', 'ORD');\n}`,
    expected: `flights$!: Observable<Flight[]>;\n\nconstructor(private flightService: FlightService) {}\n\nngOnInit(): void {\n  this.flights$ = this.flightService.searchFlights('LAX', 'ORD');\n}`,
    type_input: "code",
  },

  {
    id: "step4", type: "question", phase: "Step 4 of 7",
    paal: "Show all three provider scopes with comments: (1) providedIn root, (2) NgModule providers array, (3) Component providers array. Explain instance count for each.",
    hint: "Component-level providers create a NEW instance per component — not the shared singleton. This is the most commonly misunderstood DI concept.",
    answer_keywords: ["providedin", "root", "providers", "component"],
    seed_code: `// Step 4: Show all 3 provider scopes with instance count comments

// WAY 1: root level

// WAY 2: module level

// WAY 3: component level
`,
    analogy: {
      title: "Provider scopes — the most misunderstood DI concept",
      code: `// WAY 1: ONE instance for whole app
@Injectable({ providedIn: 'root' })
export class FlightService {}
// Singleton. Tree-shakeable.

// WAY 2: ONE instance per module
@NgModule({ providers: [FlightService] })
export class FlightModule {}
// All components in this module share ONE instance.

// WAY 3: NEW instance per component
@Component({ providers: [FlightService] })
export class FlightSearchComponent {}
// Each FlightSearchComponent gets its OWN FlightService.
// TRAP: breaks singleton assumption silently.`,
      explain: "This is a top interview topic. The key: providedIn root = one instance app-wide. Component providers = new instance per component. Interviewers love asking: 'If you add a service to a component's providers array, how many instances do you get?' Answer: one per component instance.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasRoot = a.includes("providedin") && a.includes("root");
      const hasModule = a.includes("providers") && (a.includes("ngmodule") || a.includes("module"));
      const hasComponent = a.includes("providers") && a.includes("component");
      if (hasRoot && hasModule && hasComponent) return "correct";
      if (hasRoot && (hasModule || hasComponent)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Three scopes: root (app-wide singleton), module (one per module), component (one per component instance). Key interview line: 'Adding a service to component providers breaks the singleton — each component gets its own isolated copy.'",
    feedback_partial: "Good — make sure all three are shown: providedIn root, NgModule providers, and Component providers.",
    feedback_wrong: `// WAY 1 — app-wide singleton\n@Injectable({ providedIn: 'root' })\nexport class FlightService {}\n\n// WAY 2 — one per module\n@NgModule({ providers: [FlightService] })\nexport class FlightModule {}\n\n// WAY 3 — new instance per component\n@Component({ providers: [FlightService] })\nexport class FlightSearchComponent {}`,
    expected: `// WAY 1 — app-wide singleton\n@Injectable({ providedIn: 'root' }) export class FlightService {}\n\n// WAY 2 — one per module\n@NgModule({ providers: [FlightService] }) export class FlightModule {}\n\n// WAY 3 — new instance per component\n@Component({ providers: [FlightService] }) export class FlightSearchComponent {}`,
    type_input: "code",
  },

  {
    id: "step5", type: "question", phase: "Step 5 of 7",
    paal: "Create an InjectionToken called API_BASE_URL for a string value. Provide it with 'https://api.united.com'. Inject it into FlightService using @Inject.",
    hint: "InjectionToken is for non-class values. Use @Inject(TOKEN) as a constructor parameter decorator.",
    answer_keywords: ["injectiontoken", "api_base_url", "@inject", "inject"],
    seed_code: `import { Injectable, InjectionToken, Inject } from '@angular/core';

// Step 5: Create InjectionToken, provide it, inject it

`,
    analogy: {
      title: "InjectionToken — for non-class dependencies",
      code: `// PROBLEM: Angular DI uses TypeScript TYPES to identify deps
// A 'string' type would conflict with every other string dep

// SOLUTION: InjectionToken creates a unique identity
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

// Provide it:
{ provide: API_BASE_URL, useValue: 'https://api.united.com' }

// Inject it with @Inject:
constructor(
  private http: HttpClient,
  @Inject(API_BASE_URL) private baseUrl: string
) {}
// @Inject tells Angular: "use API_BASE_URL token, not 'string' type"`,
      explain: "InjectionToken solves the lesson of injecting primitive values. Angular's DI uses TypeScript types to match dependencies — 'string' is too generic. InjectionToken creates a unique named token. Common: API URLs, feature flags, environment config.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasToken = a.includes("injectiontoken");
      const hasName = a.includes("api_base_url");
      const hasInject = a.includes("@inject") || a.includes("inject(");
      if (hasToken && hasName && hasInject) return "correct";
      if (hasToken && hasName) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. InjectionToken gives a unique identity to a non-class value. @Inject(API_BASE_URL) tells Angular which token to resolve. Interview line: 'InjectionToken is how you inject config values that don't have a unique class type.'",
    feedback_partial: "Good — you have the InjectionToken. Now add @Inject(API_BASE_URL) in the FlightService constructor to consume it.",
    feedback_wrong: `export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');\n\n// Provider:\n{ provide: API_BASE_URL, useValue: 'https://api.united.com' }\n\n// Constructor:\nconstructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}`,
    expected: `export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');\n{ provide: API_BASE_URL, useValue: 'https://api.united.com' }\nconstructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}`,
    type_input: "code",
  },

  {
    id: "step6", type: "question", phase: "Step 6 of 7",
    paal: "Write three provider configs: useClass to swap MockFlightService for testing, useValue for a config object, useFactory for an environment-dependent service.",
    hint: "All three go in a providers array. useClass swaps implementations. useValue provides static value. useFactory runs a function.",
    answer_keywords: ["useclass", "usevalue", "usefactory"],
    seed_code: `// Step 6: Three provider configurations
const providers = [
  // useClass: swap implementation

  // useValue: static config

  // useFactory: runtime logic

];`,
    analogy: {
      title: "useClass vs useValue vs useFactory",
      code: `const providers = [
  // Swap real with mock — great for testing
  { provide: FlightService, useClass: MockFlightService },

  // Static config value
  { provide: APP_CONFIG, useValue: { apiUrl: '/api', timeout: 3000 } },

  // Runtime logic — value depends on something at runtime
  {
    provide: LoggerService,
    useFactory: (env: Environment) =>
      env.production ? new SilentLogger() : new ConsoleLogger(),
    deps: [Environment]  // inject deps into the factory fn
  }
];`,
      explain: "useClass is most common in testing — swap real service for mock without changing component code. useValue for config. useFactory when you need runtime conditional logic. The deps array tells Angular what to inject into the factory function.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasClass = a.includes("useclass");
      const hasValue = a.includes("usevalue");
      const hasFactory = a.includes("usefactory");
      if (hasClass && hasValue && hasFactory) return "correct";
      if ([hasClass, hasValue, hasFactory].filter(Boolean).length === 2) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. useClass swaps implementations, useValue provides static config, useFactory runs logic at runtime. Interview line: 'useFactory is the escape hatch when you need runtime logic to determine what to provide.'",
    feedback_partial: "You have two of the three — make sure all three are present: useClass, useValue, and useFactory.",
    feedback_wrong: `{ provide: FlightService, useClass: MockFlightService },\n{ provide: APP_CONFIG, useValue: { apiUrl: '/api' } },\n{ provide: LoggerService, useFactory: (env) => new LoggerService(env), deps: [Environment] }`,
    expected: `{ provide: FlightService, useClass: MockFlightService },\n{ provide: APP_CONFIG, useValue: { apiUrl: '/api' } },\n{ provide: LoggerService, useFactory: (env) => env.production ? new SilentLogger() : new ConsoleLogger(), deps: [Environment] }`,
    type_input: "code",
  },

  {
    id: "step7", type: "question", phase: "Step 7 of 7",
    paal: "Add caching to searchFlights using a private Map. Store each result Observable in the map by key and use shareReplay(1) so multiple subscribers share one HTTP call.",
    hint: "Key = `${origin}-${destination}`. Check cache before making request. shareReplay(1) multicasts and caches the last emitted value.",
    answer_keywords: ["map", "cache", "sharereplay", "has", "set"],
    seed_code: `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FlightService {
  constructor(private http: HttpClient) {}

  // Step 7: Add cache Map + shareReplay(1)
  searchFlights(origin: string, destination: string): Observable<Flight[]> {

  }
}`,
    analogy: {
      title: "shareReplay — multicast and cache in one operator",
      code: `private cache = new Map<string, Observable<Flight[]>>();

searchFlights(origin: string, destination: string): Observable<Flight[]> {
  const key = \`\${origin}-\${destination}\`;

  if (this.cache.has(key)) return this.cache.get(key)!;

  const request$ = this.http
    .get<Flight[]>('/api/flights', { params: { origin, destination } })
    .pipe(shareReplay(1));
    // shareReplay(1):
    // 1. One HTTP call regardless of subscriber count
    // 2. Late subscribers get cached last value immediately
    // 3. Buffers 1 value in memory

  this.cache.set(key, request$);
  return request$;
}`,
      explain: "Without shareReplay, every subscriber triggers a new HTTP call. With shareReplay(1), the first subscriber triggers the call and the response is cached — all subsequent subscribers get the cached value instantly. Combined with a Map, this prevents redundant API calls across the entire app.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasMap = a.includes("new map") || a.includes("cache");
      const hasShareReplay = a.includes("sharereplay");
      const hasCacheCheck = a.includes(".has(") || a.includes(".get(");
      if (hasMap && hasShareReplay && hasCacheCheck) return "correct";
      if (hasMap && hasShareReplay) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Perfect. Map for cache key lookup, shareReplay(1) to multicast and cache. Interview line: 'shareReplay(1) means one HTTP call regardless of how many components subscribe — late subscribers get the value immediately.'",
    feedback_partial: "Good — you have the cache structure. Make sure you pipe through shareReplay(1) before caching, and check the cache before making a new request.",
    feedback_wrong: `private cache = new Map<string, Observable<Flight[]>>();\n\nsearchFlights(origin: string, destination: string): Observable<Flight[]> {\n  const key = \`\${origin}-\${destination}\`;\n  if (this.cache.has(key)) return this.cache.get(key)!;\n  const req$ = this.http.get<Flight[]>('/api/flights').pipe(shareReplay(1));\n  this.cache.set(key, req$);\n  return req$;\n}`,
    expected: `private cache = new Map<string, Observable<Flight[]>>();\n\nsearchFlights(origin: string, destination: string): Observable<Flight[]> {\n  const key = \`\${origin}-\${destination}\`;\n  if (this.cache.has(key)) return this.cache.get(key)!;\n  const req$ = this.http.get<Flight[]>('/api/flights').pipe(shareReplay(1));\n  this.cache.set(key, req$);\n  return req$;\n}`,
    type_input: "code",
  },

  {
    id: "anchor1", type: "anchor", phase: "Anchor Card",
    rule: "providedIn: 'root' = one singleton. Component providers = new instance per component.",
    when: "Always use providedIn: 'root' unless you explicitly need isolated state per component instance.",
    mistake: "Adding a service to a component's providers array expecting the shared singleton — you get a fresh isolated instance instead.",
  },

  {
    id: "anchor2", type: "anchor", phase: "Anchor Card",
    rule: "InjectionToken for non-class values. useClass to swap. useValue for config. useFactory for runtime logic.",
    when: "Injecting a string or config object — use InjectionToken. Testing with mocks — useClass. Environment-based setup — useFactory.",
    mistake: "Trying to inject a string directly without InjectionToken — Angular can't resolve it because 'string' is not a unique type.",
  },

  {
    id: "wfs", type: "wfs", phase: "Write From Scratch",
    rubric: [
      "@Injectable({ providedIn: 'root' }) on the service class",
      "HttpClient injected via constructor — can explain how Angular resolves it",
      "searchFlights() returning Observable<Flight[]> from http.get()",
      "Three provider scopes: root singleton, module-level, component-level",
      "Can explain: adding service to component providers breaks singleton",
      "InjectionToken created and used with @Inject() in constructor",
      "useClass, useValue, useFactory — can explain each with a use case",
      "Cache Map + shareReplay(1) pattern for HTTP result caching",
      "Can explain: why assign Observable to property instead of subscribing",
    ],
  },
];

const s = {
  wrap: { fontFamily: "'DM Sans', sans-serif", background: "#0f1117", minHeight: "100vh", minWidth: "1000px", overflow: "hidden", color: "#e2e8f0", display: "flex", flexDirection: "column" },
  topbar: { display: "flex", alignItems: "center", gap: "12px", padding: "0 24px", height: "96px", background: "#1a1d2e", borderBottom: "1px solid #2d3748", flexShrink: 0 },
  logo: { fontWeight: 700, fontSize: "13px", letterSpacing: "0.15em", color: "#7c3aed", marginRight: "8px" },
  engineTag: { fontWeight: 700, fontSize: "10px", letterSpacing: "0.12em", color: "#4a5568", textTransform: "uppercase" },
  progressTrack: { flex: 1, height: "4px", background: "#2d3748", borderRadius: "2px", overflow: "hidden" },
  progressFill: (pct) => ({ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#06b6d4)", borderRadius: "2px", transition: "width 0.4s ease" }),
  progressLabel: { fontSize: "11px", color: "#4a5568", fontWeight: 600, minWidth: "32px", textAlign: "right" },
  body: { display: "flex", flex: 1, overflow: "hidden" },
  sidebar: { width: "200px", flexShrink: 0, background: "#13151f", borderRight: "1px solid #2d3748", padding: "20px 12px", overflowY: "auto" },
  sidebarLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", color: "#4a5568", textTransform: "uppercase", marginBottom: "12px", paddingLeft: "8px" },
  sideItem: (active, done) => ({ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "6px", marginBottom: "2px", cursor: "pointer", background: active ? "rgba(124,58,237,0.15)" : "transparent", border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent" }),
  sideItemDot: (active, done) => ({ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: done ? "#10b981" : active ? "#7c3aed" : "#2d3748" }),
  sideItemText: (active, done) => ({ fontSize: "11px", color: done ? "#10b981" : active ? "#c4b5fd" : "#4a5568", fontWeight: active ? 600 : 400, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
  main: { flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: "720px" },
  phase: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "10px" },
  h1: { fontSize: "26px", fontWeight: 700, color: "#f1f5f9", marginBottom: "20px", lineHeight: 1.3 },
  tag: (color) => ({ display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: color === "purple" ? "rgba(124,58,237,0.2)" : "rgba(6,182,212,0.2)", color: color === "purple" ? "#c4b5fd" : "#67e8f9", border: `1px solid ${color === "purple" ? "rgba(124,58,237,0.4)" : "rgba(6,182,212,0.4)"}`, marginBottom: "14px" }),
  pre: { fontFamily: "'Courier New', monospace", fontSize: "13px", background: "#1a1d2e", border: "1px solid #2d3748", borderRadius: "8px", padding: "16px 20px", lineHeight: 1.7, color: "#94a3b8", whiteSpace: "pre-wrap", marginBottom: "20px" },
  usecase: { fontSize: "13px", color: "#64748b", borderLeft: "2px solid #7c3aed", paddingLeft: "14px", lineHeight: 1.7, marginBottom: "24px" },
  objList: { listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" },
  objItem: { display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 },
  objDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0, marginTop: "6px" },
  paalLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "8px" },
  paalText: { fontSize: "16px", fontWeight: 600, color: "#f1f5f9", lineHeight: 1.5, marginBottom: "6px" },
  hint: { fontSize: "12px", color: "#4a5568", fontStyle: "italic", marginBottom: "16px" },
  textarea: { width: "100%", minHeight: "140px", background: "#1a1d2e", border: "1px solid #2d3748", borderRadius: "8px", padding: "14px", color: "#e2e8f0", fontFamily: "'Courier New', monospace", fontSize: "13px", lineHeight: 1.6, resize: "vertical", outline: "none", marginBottom: "12px" },
  btnRow: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" },
  btn: (variant) => ({ padding: "10px 20px", borderRadius: "6px", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "12px", cursor: "pointer", letterSpacing: "0.05em", ...(variant === "primary" ? { background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "#fff" } : { background: "#1a1d2e", border: "1px solid #2d3748", color: "#94a3b8" }) }),
  feedback: (type) => ({ padding: "14px 18px", borderRadius: "8px", fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: "16px", ...(type === "correct" ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" } : type === "partial" ? { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" } : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }) }),
  analogyCard: { background: "#13151f", border: "1px solid #2d3748", borderRadius: "10px", padding: "20px", marginBottom: "20px" },
  analogyTitle: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "10px" },
  anchorCard: { background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" },
  anchorTitle: { fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "12px" },
  anchorRule: { fontSize: "18px", fontWeight: 700, color: "#f1f5f9", marginBottom: "16px", lineHeight: 1.4 },
  anchorRow: { display: "flex", gap: "12px", marginBottom: "10px", alignItems: "flex-start" },
  anchorLabel: { fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a5568", minWidth: "60px", paddingTop: "2px" },
  anchorValue: { fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 },
  wfsRubric: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" },
  rubricItem: (checked) => ({ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 14px", borderRadius: "6px", cursor: "pointer", background: checked ? "rgba(16,185,129,0.08)" : "#1a1d2e", border: `1px solid ${checked ? "rgba(16,185,129,0.3)" : "#2d3748"}` }),
  rubricText: (checked) => ({ fontSize: "13px", color: checked ? "#6ee7b7" : "#64748b", lineHeight: 1.5, textDecoration: checked ? "line-through" : "none" }),
  completeBanner: { textAlign: "center", padding: "60px 20px" },
};

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "@Injectable" },
  { id: "step2", label: "HttpClient inject" },
  { id: "step3", label: "Service in Component" },
  { id: "step4", label: "Provider scopes" },
  { id: "step5", label: "InjectionToken" },
  { id: "step6", label: "use Class/Value/Factory" },
  { id: "step7", label: "Cache + shareReplay" },
  { id: "anchor1", label: "Anchor 1" },
  { id: "anchor2", label: "Anchor 2" },
  { id: "wfs", label: "Write From Scratch" },
];

export default function AngularA03Services({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [wfsChecked, setWfsChecked] = useState([]);
  const [mainTab, setMainTab] = useState("editor");

  const node = NODES[nodeIndex];
  useEffect(() => { setMainTab("lesson"); }, [nodeIndex]);
  const progress = Math.round((completedNodes.length / NODES.length) * 100);

  const currentAnswer = (() => {
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

  const setCurrentAnswer = (val) =>
    setAnswers((prev) => ({
      ...prev,
      [node.id]: val,
    }));

  function next() {
    if (!completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
    setNodeIndex((i) => i + 1);
    setResult(null);
    setShowAnalogy(false);
    setShowExpected(false);
  }

  function evaluate() {
    if (!currentAnswer.trim()) return;
    let res;
    if (node.evaluate) {
      res = node.evaluate(currentAnswer);
    } else {
      const a = currentAnswer.toLowerCase();
      const hits = (node.answer_keywords || []).filter((k) => a.includes(k.toLowerCase())).length;
      res = hits === node.answer_keywords.length ? "correct" : hits >= node.answer_keywords.length * 0.6 ? "partial" : "wrong";
    }
    setResult(res);
    if (res === "correct" && !completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
  }

  function getFeedback() {
    if (!result) return null;
    const fb = node[`feedback_${result}`];
    return typeof fb === "function" ? fb(currentAnswer) : fb;
  }

  function renderReveal() {
    const c = node.content;
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <div style={s.tag("purple")}>{c.tag}</div>
        <h1 style={s.h1}>{c.title}</h1>
        <div style={s.pre}>{c.body}</div>
        <div style={s.usecase}>{c.usecase}</div>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>LET'S BUILD IT →</button></div>
      </div>
    );
  }

  function renderObjectives() {
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>By the end of this engine, you will be able to:</h1>
        <ul style={s.objList}>
          {node.items.map((item, i) => <li key={i} style={s.objItem}><div style={s.objDot} />{item}</li>)}
        </ul>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>START →</button></div>
      </div>
    );
  }

  function renderQuestion() {
    const feedback = getFeedback();
    const editorContent = (
      <div>
        <div style={s.phase}>{node.phase}</div>
        {showAnalogy && node.analogy ? (
          <div style={s.analogyCard}>
            <div style={s.analogyTitle}>💡 ANALOGY — {node.analogy.title}</div>
            <pre style={{ ...s.pre, marginBottom: "12px" }}>{node.analogy.code}</pre>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, borderLeft: "2px solid #7c3aed", paddingLeft: "14px", marginBottom: "20px" }}>{node.analogy.explain}</div>
            <button style={{ ...s.btn("primary"), width: "100%" }} onClick={() => setShowAnalogy(false)}>GOT IT — LET ME TRY →</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "11px", color: "#00d4ff", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "8px" }}>CODE BUILT SO FAR — edit below</div>
            <div style={s.hint}>💡 {node.hint}</div>
            <CodeEditor value={currentAnswer} onChange={setCurrentAnswer} height="320px" />
            {feedback && <div style={s.feedback(result)}>{feedback}</div>}
            {showExpected && node.expected && (
              <div style={{ ...s.pre, borderLeft: "2px solid #10b981", marginBottom: "16px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: "#10b981", marginBottom: "8px" }}>MODEL ANSWER</div>
                {node.expected}
              </div>
            )}
            <div style={s.btnRow}>
              <button style={s.btn("primary")} onClick={evaluate} disabled={!currentAnswer.trim()}>CHECK →</button>
              {node.analogy && <button style={s.btn("secondary")} onClick={() => setShowAnalogy(true)}>SEE ANALOGY</button>}
              {result && result !== "correct" && <button style={s.btn("secondary")} onClick={() => setShowExpected(true)}>SHOW ANSWER</button>}
              {result === "correct" && <button style={s.btn("primary")} onClick={next}>NEXT →</button>}
              {result && result !== "correct" && <button style={{ ...s.btn("secondary"), marginLeft: "auto" }} onClick={next}>SKIP →</button>}
            </div>
          </>
        )}
      </div>
    );
    return (
      <LessonEditorOutputTabs node={node} nodes={NODES} mainTab={mainTab} setMainTab={setMainTab} answer={currentAnswer || ""}>
        {editorContent}
      </LessonEditorOutputTabs>
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
            <div style={s.anchorRow}><div style={s.anchorLabel}>WHEN</div><div style={s.anchorValue}>{node.when}</div></div>
            <div style={s.anchorRow}><div style={s.anchorLabel}>MISTAKE</div><div style={s.anchorValue}>{node.mistake}</div></div>
          </div>
        </div>
        <div style={s.btnRow}><button style={s.btn("primary")} onClick={next}>GOT IT →</button></div>
      </div>
    );
  }

  function renderWFS() {
    const allChecked = wfsChecked.length === node.rubric.length;
    return (
      <div>
        <div style={s.phase}>{node.phase}</div>
        <h1 style={s.h1}>Write From Scratch</h1>
        <div style={s.pre}>{"Close this panel. Open a blank file.\nWrite FlightService from memory — @Injectable, HttpClient, searchFlights(), caching with shareReplay, InjectionToken for base URL, and explain all three provider scopes."}</div>
        <div style={{ ...s.paalLabel, marginBottom: "12px" }}>SELF-CHECK RUBRIC</div>
        <div style={s.wfsRubric}>
          {node.rubric.map((item, i) => {
            const checked = wfsChecked.includes(i);
            return (
              <div key={i} style={s.rubricItem(checked)} onClick={() => setWfsChecked((p) => checked ? p.filter((x) => x !== i) : [...p, i])}>
                <div style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}>
                  {checked ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <div style={{ width: 14, height: 14, border: "1px solid #4a5568", borderRadius: "3px" }} />}
                </div>
                <div style={s.rubricText(checked)}>{item}</div>
              </div>
            );
          })}
        </div>
        {allChecked && (
          <div>
            <div style={s.feedback("correct")}>{"✅ Engine ANG03 Complete — Services & DI mastered.\nNext: ANG04 — RxJS Essentials"}</div>
            <div style={s.btnRow}><button style={s.btn("primary")} onClick={onNextLesson ?? next}>NEXT ENGINE →</button></div>
          </div>
        )}
      </div>
    );
  }

  function renderComplete() {
    return (
      <div style={s.completeBanner}>
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>🎯</div>
        <h1 style={{ ...s.h1, textAlign: "center" }}>Engine ANG03 Complete</h1>
        <p style={{ color: "#4a5568", fontSize: "13px" }}>Services & Dependency Injection — mastered.</p>
        {onNextLesson && <div style={{ ...s.btnRow, justifyContent: "center", marginTop: "24px" }}><button style={s.btn("primary")} onClick={onNextLesson}>NEXT ENGINE →</button></div>}
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
      <div style={s.topbar}>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <InpactLogo height={80} style={{ marginRight: "8px" }} />
        </div>
        <div style={s.engineTag}>ANG03 — SERVICES & DI</div>
        <div style={s.progressTrack}><div style={s.progressFill(progress)} /></div>
        <div style={s.progressLabel}>{progress}%</div>
      </div>
      <div style={s.body}>
        <div style={s.sidebar}>
          <div style={s.sidebarLabel}>PROGRESS</div>
          {sideItems.map((item, i) => {
            const isActive = NODES[nodeIndex]?.id === item.id;
            const isDone = completedNodes.includes(item.id);
            return (
              <div key={item.id} style={s.sideItem(isActive, isDone)} onClick={() => setNodeIndex(i)} role="button" tabIndex={0}>
                <div style={s.sideItemDot(isActive, isDone)} />
                <div style={s.sideItemText(isActive, isDone)}>{item.label}</div>
                {isDone && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            );
          })}
        </div>
        <div style={s.main}>{renderNode()}</div>
      </div>
    </div>
  );
}

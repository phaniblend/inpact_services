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

// ─── ENGINE ANG06: ROUTING & GUARDS ───────────────────────────────────────────
// Covers: Routes array, RouterLink vs navigate(), route params vs query params,
// CanActivate, CanDeactivate, Resolve, lazy loading with loadChildren,
// PreloadAllModules, ActivatedRoute, auxiliary routes

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "ANG06 — ROUTING & GUARDS",
      title: "Portal Navigation",
      body: `Wire up the routing layer for a multi-page flight portal:

  • Routes: / (home), /flights (list), /flights/:id (detail), /admin (lazy loaded)
  • Protect /admin with an AuthGuard (CanActivate)
  • Protect the flight detail form from accidental navigation away (CanDeactivate)
  • Pre-fetch flight data before the detail page renders (Resolve)
  • Lazy load the AdminModule to reduce initial bundle
  • Read route params and query params on the detail page
  • Navigate programmatically after a form submission`,
      usecase: "Routing questions are in every Angular screen. Lazy loading, guards, and Resolve come up constantly at senior level. If you can explain the difference between CanActivate and CanDeactivate, and implement a Resolver, you're ahead of most candidates.",
    },
  },

  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Define a Routes array with path, component, children, and canActivate",
      "Explain RouterLink vs router.navigate() — when to use each",
      "Explain the difference between route params (:id) and query params (?key=val)",
      "Read route params using ActivatedRoute — snapshot vs observable",
      "Implement CanActivate to protect a route",
      "Implement CanDeactivate to prevent accidental navigation",
      "Implement a Resolver to pre-fetch data before a route activates",
      "Lazy load a feature module using loadChildren",
      "Explain PreloadAllModules and when to use it",
    ],
  },

  {
    id: "step1", type: "question", phase: "Step 1 of 7",
    paal: "Define the Routes array with four routes: home (/), flight list (/flights), flight detail (/flights/:id), and admin (/admin) with an AuthGuard. Add a wildcard redirect for unknown paths.",
    hint: "canActivate takes an array of guard classes. The wildcard route '**' must be last. Route params use :paramName syntax.",
    answer_keywords: ["routes", "/flights/:id", "canactivate", "authguard", "**"],
    seed_code: `import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

// Step 1: Define the full Routes array
// Include: home, /flights, /flights/:id (with guard), /admin, wildcard

export const routes: Routes = [
  // define routes here
];`,
    analogy: {
      title: "Routes array — Angular's routing table",
      code: `export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'flights', component: FlightListComponent },
  {
    path: 'flights/:id',          // :id = route parameter
    component: FlightDetailComponent,
    canActivate: [AuthGuard]      // array of guards
  },
  {
    path: 'admin',
    loadChildren: () =>           // lazy loaded (covered in step 6)
      import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' } // wildcard MUST be last
];

// RULE: Angular matches routes top to bottom, first match wins
// Put specific routes before generic ones
// Wildcard (**) always last — catches everything unmatched`,
      explain: "The Routes array is Angular's routing table. Angular matches top to bottom — first match wins. Route params use :paramName syntax. canActivate takes an array of guard classes. The wildcard route (**) must be last — it catches everything not matched above.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasParam = a.includes(":id") || a.includes("flights/:id");
      const hasGuard = a.includes("canactivate") && a.includes("authguard");
      const hasWildcard = a.includes("**");
      if (hasParam && hasGuard && hasWildcard) return "correct";
      if (hasParam && (hasGuard || hasWildcard)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Routes array with :id param, canActivate guard, and ** wildcard last. Interview line: 'Angular matches routes top to bottom — first match wins. Always put wildcard last or it swallows every route.'",
    feedback_partial: "Good — you have most of it. Make sure you have all three: :id param route, canActivate: [AuthGuard], and ** wildcard as the last route.",
    feedback_wrong: `export const routes: Routes = [\n  { path: '', component: HomeComponent },\n  { path: 'flights', component: FlightListComponent },\n  { path: 'flights/:id', component: FlightDetailComponent, canActivate: [AuthGuard] },\n  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },\n  { path: '**', redirectTo: '' }\n];`,
    expected: `export const routes: Routes = [\n  { path: '', component: HomeComponent },\n  { path: 'flights', component: FlightListComponent },\n  { path: 'flights/:id', component: FlightDetailComponent, canActivate: [AuthGuard] },\n  { path: '**', redirectTo: '' }\n];`,
    type_input: "code",
  },

  {
    id: "step2", type: "question", phase: "Step 2 of 7",
    paal: "In a FlightDetailComponent, read the :id route parameter AND a 'tab' query parameter using ActivatedRoute. Show both the snapshot approach and the Observable approach, with a comment on when to use each.",
    hint: "snapshot is one-time read. paramMap Observable is needed when the route can change without destroying the component (same route, different params).",
    answer_keywords: ["activatedroute", "parammap", "snapshot", "queryparammap"],
    seed_code: `import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Step 2: Read route param :id AND query param 'tab'
// Show BOTH snapshot and Observable approaches
// Comment when to use each

@Component({ selector: 'ua-flight-detail', template: '' })
export class FlightDetailComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // implement here
  }
}`,
    analogy: {
      title: "snapshot vs paramMap Observable — the key distinction",
      code: `ngOnInit(): void {

  // SNAPSHOT: read once on init — simple, no subscription needed
  const id = this.route.snapshot.paramMap.get('id');
  const tab = this.route.snapshot.queryParamMap.get('tab');
  // Use when: component is always destroyed/recreated on navigation

  // OBSERVABLE: live updates — reacts to param changes
  this.route.paramMap.subscribe(params => {
    const id = params.get('id');
    // Use when: same component instance reused with different params
    // Example: flight/UA100 → flight/UA200 (no destroy/recreate)
  });

  this.route.queryParamMap.subscribe(params => {
    const tab = params.get('tab'); // ?tab=details or ?tab=history
  });
}

// Route params: /flights/:id  → part of the URL path
// Query params: /flights?tab=details → after the ? sign
// Use route params for required identity (what item to show)
// Use query params for optional state (sort, filter, tab)`,
      explain: "snapshot is fine when the component is always destroyed and recreated on navigation. paramMap Observable is needed when Angular reuses the same component instance for different param values (e.g. navigating from flight/UA100 to flight/UA200 with RouteReuseStrategy). Senior Angular devs know this distinction.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasRoute = a.includes("activatedroute") || a.includes("this.route");
      const hasSnapshot = a.includes("snapshot");
      const hasParamMap = a.includes("parammap");
      const hasQuery = a.includes("queryparammap") || a.includes("queryparam");
      if (hasRoute && hasSnapshot && hasParamMap && hasQuery) return "correct";
      if (hasRoute && hasParamMap && hasQuery) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. snapshot for one-time read, paramMap Observable when the component can be reused. Route params for identity (:id), query params for optional state (?tab=details). Interview line: 'I use snapshot unless the route can change without destroying the component.'",
    feedback_partial: "Good — you have ActivatedRoute. Make sure you show BOTH snapshot AND paramMap Observable, and cover BOTH route params AND query params.",
    feedback_wrong: `const id = this.route.snapshot.paramMap.get('id'); // snapshot — one-time\nconst tab = this.route.snapshot.queryParamMap.get('tab');\n\n// Observable — when component is reused across param changes\nthis.route.paramMap.subscribe(params => {\n  const id = params.get('id');\n});`,
    expected: `const id = this.route.snapshot.paramMap.get('id');\nconst tab = this.route.snapshot.queryParamMap.get('tab');\n\nthis.route.paramMap.subscribe(params => {\n  const id = params.get('id');\n});`,
    type_input: "code",
  },

  {
    id: "step3", type: "question", phase: "Step 3 of 7",
    paal: "Implement an AuthGuard using CanActivate. If the user is authenticated (authService.isLoggedIn()), return true. Otherwise navigate to /login and return false.",
    hint: "CanActivate is now a function (Angular 14+ functional guards) OR a class implementing CanActivate interface. Show the class-based approach.",
    answer_keywords: ["canactivate", "authservice", "isloggedin", "router.navigate", "return false"],
    seed_code: `import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Step 3: Implement AuthGuard
// Check isLoggedIn() — redirect to /login if not authenticated

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // implement here
  }
}`,
    analogy: {
      title: "CanActivate — gating access to routes",
      code: `@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;  // allow navigation
    }
    this.router.navigate(['/login']); // redirect
    return false;                     // block navigation
  }
}

// Angular 14+ functional guard (no class needed):
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

// Use in routes:
{ path: 'admin', component: AdminComponent, canActivate: [authGuard] }`,
      explain: "CanActivate returns boolean (or Observable<boolean> for async checks). If false, navigation is cancelled. You can also return a UrlTree (as shown in the functional version) — Angular navigates to that URL instead. The functional guard approach (Angular 14+) is cleaner but class-based is still widely used and valid.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasCanActivate = a.includes("canactivate");
      const hasCheck = a.includes("isloggedin") || a.includes("authservice");
      const hasRedirect = a.includes("router.navigate") || a.includes("navigate");
      const hasReturn = a.includes("return true") && a.includes("return false");
      if (hasCanActivate && hasCheck && hasRedirect && hasReturn) return "correct";
      if (hasCanActivate && hasCheck && hasRedirect) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Check auth → return true to allow, navigate and return false to block. Interview bonus: mention Angular 14+ functional guards with inject() — they're the modern approach.",
    feedback_partial: "Good — you have the guard structure. Make sure canActivate() returns true when authenticated AND navigates to /login and returns false when not.",
    feedback_wrong: `canActivate(): boolean {\n  if (this.authService.isLoggedIn()) {\n    return true;\n  }\n  this.router.navigate(['/login']);\n  return false;\n}`,
    expected: `canActivate(): boolean {\n  if (this.authService.isLoggedIn()) return true;\n  this.router.navigate(['/login']);\n  return false;\n}`,
    type_input: "code",
  },

  {
    id: "step4", type: "question", phase: "Step 4 of 7",
    paal: "Implement a CanDeactivate guard for the flight booking form. Prompt the user 'You have unsaved changes. Leave anyway?' if the form is dirty. The component must implement a HasUnsavedChanges interface.",
    hint: "CanDeactivate<T> is generic — T is the component type. The guard calls a method on the component. Define an interface the component implements.",
    answer_keywords: ["candeactivate", "haschanges", "dirty", "confirm"],
    seed_code: `import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';

// Step 4: CanDeactivate guard for the booking form
// Component must implement an interface with a canDeactivate() method
// Show: interface, guard class, and component implementation

`,
    analogy: {
      title: "CanDeactivate — prevent losing unsaved work",
      code: `// 1. Interface the component implements
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

// 2. The guard — calls the method on the component
@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {
  canDeactivate(component: HasUnsavedChanges): boolean {
    if (component.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Leave anyway?');
    }
    return true;
  }
}

// 3. Component implements the interface
export class BookingFormComponent implements HasUnsavedChanges {
  bookingForm = this.fb.group({ ... });

  hasUnsavedChanges(): boolean {
    return this.bookingForm.dirty;  // true if user changed anything
  }
}

// 4. Wire in routes:
{ path: 'book', component: BookingFormComponent, canDeactivate: [UnsavedChangesGuard] }`,
      explain: "CanDeactivate fires when the user tries to navigate AWAY from a route. The guard calls a method on the component — the component knows its own dirty state. The interface ensures type safety. confirm() is simple but you could return an Observable<boolean> from a dialog instead.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasGuard = a.includes("candeactivate");
      const hasInterface = a.includes("interface") || a.includes("hasunsavedchanges") || a.includes("haschanges");
      const hasDirty = a.includes("dirty") || a.includes("confirm");
      if (hasGuard && hasInterface && hasDirty) return "correct";
      if (hasGuard && hasInterface) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. CanDeactivate pattern: interface → guard calls component method → component checks its own dirty state. Interview line: 'The guard calls a method on the component so the component owns the logic of whether it can be left.'",
    feedback_partial: "Good — you have CanDeactivate. Add the interface that the component implements (HasUnsavedChanges with a hasUnsavedChanges() method) and show the dirty check.",
    feedback_wrong: `export interface HasUnsavedChanges { hasUnsavedChanges(): boolean; }\n\n@Injectable({ providedIn: 'root' })\nexport class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {\n  canDeactivate(component: HasUnsavedChanges): boolean {\n    return component.hasUnsavedChanges() ? confirm('Leave? Changes will be lost.') : true;\n  }\n}`,
    expected: `export interface HasUnsavedChanges { hasUnsavedChanges(): boolean; }\n\n@Injectable({ providedIn: 'root' })\nexport class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {\n  canDeactivate(c: HasUnsavedChanges): boolean {\n    return c.hasUnsavedChanges() ? confirm('Leave?') : true;\n  }\n}`,
    type_input: "code",
  },

  {
    id: "step5", type: "question", phase: "Step 5 of 7",
    paal: "Implement a Resolve guard called FlightResolver that fetches a flight by ID before the route activates. The component receives it via this.route.snapshot.data['flight'].",
    hint: "Resolve<T> is generic with the data type. Inject FlightService and ActivatedRouteSnapshot. Return the Observable from the service — Angular subscribes automatically.",
    answer_keywords: ["resolve", "flightresolver", "activatedroutesnapshot", "flightservice"],
    seed_code: `import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

// Step 5: FlightResolver — pre-fetch flight before route activates
// Wire it in routes: { path: 'flights/:id', resolve: { flight: FlightResolver } }
// Component reads: this.route.snapshot.data['flight']

@Injectable({ providedIn: 'root' })
export class FlightResolver implements Resolve<Flight> {
  constructor(private flightService: FlightService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Flight> {
    // implement here
  }
}`,
    analogy: {
      title: "Resolve — data ready before the component loads",
      code: `@Injectable({ providedIn: 'root' })
export class FlightResolver implements Resolve<Flight> {
  constructor(private flightService: FlightService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Flight> {
    const id = route.paramMap.get('id')!;
    return this.flightService.getFlightById(id);
    // Angular subscribes and waits for the Observable to emit
    // Then activates the route with the data
  }
}

// Wire in routes:
{
  path: 'flights/:id',
  component: FlightDetailComponent,
  resolve: { flight: FlightResolver }  // key 'flight' → data['flight']
}

// Component reads pre-fetched data:
ngOnInit(): void {
  this.flight = this.route.snapshot.data['flight'];
  // Data is already available — no loading spinner needed
}

// WHY Resolve? Component renders with data immediately
// No empty state → loading → populated state transition`,
      explain: "A Resolver pre-fetches data before the component renders. The route doesn't activate until the Observable completes. The component receives the resolved data via route.snapshot.data. This eliminates the loading spinner in the component — the data is there from frame one. Use when you can't show any useful UI without the data.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasResolve = a.includes("resolve");
      const hasRoute = a.includes("activatedroutesnapshot") || a.includes("routesnapshot");
      const hasService = a.includes("flightservice") || a.includes("getflight");
      const hasReturn = a.includes("return") && (a.includes("observable") || a.includes("getflight"));
      if (hasResolve && hasRoute && hasService && hasReturn) return "correct";
      if (hasResolve && hasRoute && hasService) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Resolver pre-fetches data — component gets it from route.snapshot.data immediately on render. Interview line: 'I use Resolve when the component can't render anything useful without the data — eliminates the loading state entirely.'",
    feedback_partial: "Good — you have the Resolver. Make sure resolve() uses ActivatedRouteSnapshot to get the :id param and returns the Observable from the service.",
    feedback_wrong: `resolve(route: ActivatedRouteSnapshot): Observable<Flight> {\n  const id = route.paramMap.get('id')!;\n  return this.flightService.getFlightById(id);\n}`,
    expected: `resolve(route: ActivatedRouteSnapshot): Observable<Flight> {\n  const id = route.paramMap.get('id')!;\n  return this.flightService.getFlightById(id);\n}`,
    type_input: "code",
  },

  {
    id: "step6", type: "question", phase: "Step 6 of 7",
    paal: "Lazy load the AdminModule using loadChildren. Then configure PreloadAllModules as the preloading strategy so lazy modules are loaded in the background after the app starts.",
    hint: "loadChildren uses a dynamic import() returning the module class. PreloadAllModules is set in RouterModule.forRoot options.",
    answer_keywords: ["loadchildren", "import(", "adminmodule", "preloadallmodules"],
    seed_code: `import { RouterModule, PreloadAllModules } from '@angular/router';

// Step 6: Lazy load AdminModule + configure preloading

// Route definition with lazy loading:

// RouterModule.forRoot config with preloading:
`,
    analogy: {
      title: "Lazy loading — reduce initial bundle, load on demand",
      code: `// Lazy route — module only loaded when user navigates to /admin
{
  path: 'admin',
  loadChildren: () =>
    import('./admin/admin.module')    // dynamic import
      .then(m => m.AdminModule),      // return the module class
  canActivate: [AuthGuard]
}

// Wire in AppModule:
RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules
  // PreloadAllModules: after app loads, fetch all lazy modules
  // in background so they're instant when needed
  // NoPreloading (default): load only when navigated to
  // Custom strategy: implement PreloadingStrategy interface
})

// BENEFIT: initial bundle = only what's needed on first load
// /admin code is never downloaded by anonymous users
// With PreloadAllModules: lazy chunks preloaded silently after init`,
      explain: "Lazy loading splits the app into chunks — the admin bundle is never downloaded unless the user navigates there. PreloadAllModules starts downloading lazy chunks immediately after the app initialises, so they're cached and instant when needed. Best of both worlds: fast initial load, fast subsequent navigation.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasLazy = a.includes("loadchildren") && a.includes("import(");
      const hasModule = a.includes("adminmodule");
      const hasPreload = a.includes("preloadallmodules");
      if (hasLazy && hasModule && hasPreload) return "correct";
      if (hasLazy && hasModule) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. loadChildren with dynamic import = lazy loading. PreloadAllModules = background preload after init. Interview line: 'Lazy loading reduces initial bundle — users never download code for routes they never visit. PreloadAllModules makes subsequent navigation instant.'",
    feedback_partial: "Good — you have lazy loading with loadChildren. Now add PreloadAllModules to RouterModule.forRoot options.",
    feedback_wrong: `// Route:\n{ path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }\n\n// RouterModule:\nRouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })`,
    expected: `{ path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }\n\nRouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })`,
    type_input: "code",
  },

  {
    id: "step7", type: "question", phase: "Step 7 of 7",
    paal: "After a successful booking form submission, navigate programmatically to /flights/:id/confirmation with a query param ?booked=true. Show how to use Router.navigate() with both route params and query params.",
    hint: "router.navigate() takes an array of path segments. Query params are passed as NavigationExtras: { queryParams: { key: value } }.",
    answer_keywords: ["router.navigate", "queryparams", "confirmation", "navigationextras"],
    seed_code: `import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Step 7: Programmatic navigation after form submit
// Navigate to: /flights/UA100/confirmation?booked=true

@Component({ selector: 'ua-booking-form', template: '' })
export class BookingFormComponent {
  constructor(private router: Router) {}

  onSubmit(flightId: string): void {
    // implement navigation here
  }
}`,
    analogy: {
      title: "RouterLink vs router.navigate() — when to use each",
      code: `// RouterLink: use in TEMPLATES for static/simple navigation
<a [routerLink]="['/flights', flight.id]">View Flight</a>
<a [routerLink]="['/flights']" [queryParams]="{ sort: 'price' }">Sort by price</a>

// router.navigate(): use in COMPONENT CLASS for dynamic/conditional nav
// After form submit, API response, or conditional logic
this.router.navigate(
  ['/flights', flightId, 'confirmation'],  // path segments array
  {
    queryParams: { booked: true },          // ?booked=true
    replaceUrl: true                        // replace history (no back button)
  }
);

// router.navigateByUrl() — single URL string (less flexible)
this.router.navigateByUrl('/flights');

// Rule: RouterLink in templates, router.navigate() in class`,
      explain: "RouterLink is for templates — declarative, Angular handles it. router.navigate() is for component class logic — after an API call, form submission, or conditional flow. Always use the path segments array form (not a string URL) so TypeScript can catch typos. NavigationExtras object adds query params, fragment, replaceUrl, etc.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasNavigate = a.includes("router.navigate") || a.includes("this.router.navigate");
      const hasSegments = a.includes("confirmation") || a.includes("flightid");
      const hasQuery = a.includes("queryparams") || a.includes("booked");
      if (hasNavigate && hasSegments && hasQuery) return "correct";
      if (hasNavigate && hasSegments) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. router.navigate() with segments array + NavigationExtras queryParams. Interview line: 'RouterLink in templates, router.navigate() in class. I always use the array form — never a string URL — so Angular validates the path.'",
    feedback_partial: "Good — you have router.navigate(). Now add the queryParams: { booked: true } as part of the NavigationExtras second argument.",
    feedback_wrong: `this.router.navigate(\n  ['/flights', flightId, 'confirmation'],\n  { queryParams: { booked: true } }\n);`,
    expected: `this.router.navigate(['/flights', flightId, 'confirmation'], { queryParams: { booked: true } });`,
    type_input: "code",
  },

  {
    id: "anchor1", type: "anchor", phase: "Anchor Card",
    rule: "CanActivate = can you enter? CanDeactivate = can you leave? Resolve = fetch data before entering.",
    when: "Protecting a route → CanActivate. Protecting unsaved form state → CanDeactivate. Pre-fetching data → Resolve.",
    mistake: "Using CanActivate when you need CanDeactivate — CanActivate fires on the destination route, not the source. If you want to protect the user leaving a form, you need CanDeactivate on THAT route.",
  },

  {
    id: "anchor2", type: "anchor", phase: "Anchor Card",
    rule: "Route params (:id) for identity. Query params (?key=val) for optional state. snapshot for one-time. paramMap$ when component is reused.",
    when: "Identifying WHAT to show → route param. Sorting/filtering/tab state → query param. Route always destroyed on nav → snapshot. Component reused across params → paramMap Observable.",
    mistake: "Using snapshot when the same component can be navigated to with different params — paramMap doesn't fire, component shows stale data.",
  },

  {
    id: "wfs", type: "wfs", phase: "Write From Scratch",
    rubric: [
      "Routes array: :id param, canActivate guard, ** wildcard last",
      "ActivatedRoute: snapshot vs paramMap$ — and when to use each",
      "Route params vs query params — can explain the difference",
      "CanActivate: auth check, navigate to /login, return false",
      "CanDeactivate: component interface + hasUnsavedChanges() check",
      "Resolve: fetch by :id from ActivatedRouteSnapshot, return Observable",
      "loadChildren with dynamic import() — lazy loading",
      "PreloadAllModules in RouterModule.forRoot options",
      "router.navigate() with segments array + NavigationExtras queryParams",
      "Can explain: RouterLink in templates vs router.navigate() in class",
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
  { id: "step1", label: "Routes array" },
  { id: "step2", label: "Route & query params" },
  { id: "step3", label: "CanActivate" },
  { id: "step4", label: "CanDeactivate" },
  { id: "step5", label: "Resolve" },
  { id: "step6", label: "Lazy loading" },
  { id: "step7", label: "Programmatic nav" },
  { id: "anchor1", label: "Anchor 1" },
  { id: "anchor2", label: "Anchor 2" },
  { id: "wfs", label: "Write From Scratch" },
];

export default function AngularA06Routing({ onNextLesson }) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [wfsChecked, setWfsChecked] = useState([]);
  const [mainTab, setMainTab] = useState("editor");

  const node = NODES[nodeIndex];
  useEffect(() => { setMainTab("editor"); }, [nodeIndex]);
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
  const setCurrentAnswer = (val) => setAnswers((prev) => ({ ...prev, [node.id]: val }));

  function next() {
    if (!completedNodes.includes(node.id)) setCompletedNodes((p) => [...p, node.id]);
    setNodeIndex((i) => i + 1);
    setResult(null); setShowAnalogy(false); setShowExpected(false);
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
        <div style={s.pre}>{"Close this panel. Open a blank file.\nWrite the full routing layer from memory — routes array, guards, resolver, lazy loading, and programmatic navigation."}</div>
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
            <div style={s.feedback("correct")}>{"✅ Engine A06 Complete — Routing & Guards mastered.\nNext: Engine A07 — Change Detection & Signals"}</div>
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
        <h1 style={{ ...s.h1, textAlign: "center" }}>Engine ANG06 Complete</h1>
        <p style={{ color: "#4a5568", fontSize: "13px" }}>Routing & Guards — mastered.</p>
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
        <div style={s.engineTag}>ANG06 — ROUTING & GUARDS</div>
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

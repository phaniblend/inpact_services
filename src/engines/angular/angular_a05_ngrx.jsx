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

// ─── ENGINE ANG05: NgRx STATE MANAGEMENT ──────────────────────────────────────
// Covers: Store, Actions (createAction), Reducers (createReducer/on),
// Selectors (createSelector, memoization), Effects (createEffect, ofType),
// NgRx Entity (EntityAdapter), dispatch vs select,
// Facade pattern, ComponentStore

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "ANG05 — NgRx STATE",
      title: "Board State",
      body: `Build the NgRx state layer for a flight status board:

  • State shape: { flights: Flight[], loading: boolean, error: string | null, selectedId: string | null }
  • Actions: loadFlights, loadFlightsSuccess, loadFlightsFailure, selectFlight
  • Reducer handles each action immutably
  • Selector: selectSelectedFlight derived from flights + selectedId
  • Effect: intercepts loadFlights, calls the API, dispatches success/failure
  • Component dispatches loadFlights on init, selects data with async pipe`,
      usecase: "NgRx comes up in every senior Angular interview at scale companies. United, Comcast, Broadridge-level codebases all use it. Even if you're not building it from scratch, you need to read and modify it confidently. The five building blocks — Store, Actions, Reducers, Selectors, Effects — must be second nature.",
    },
  },

  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Name the five NgRx building blocks and explain each in one sentence",
      "Create typed Actions using createAction with and without props",
      "Write a Reducer using createReducer and on() — explain immutability rule",
      "Write a Selector using createSelector and explain memoization",
      "Write an Effect that intercepts an Action, calls an API, dispatches success/failure",
      "Inject Store, dispatch an action, and select state using async pipe",
      "Explain NgRx Entity and what EntityAdapter provides",
      "Explain the Facade pattern and why it simplifies component code",
    ],
  },

  {
    id: "step1", type: "question", phase: "Step 1 of 8",
    paal: "Define the FlightState interface and its initial state. Fields: flights (Flight array), loading (boolean), error (string or null), selectedId (string or null).",
    hint: "The state interface is a plain TypeScript interface. initialState is a const that satisfies it with safe default values.",
    answer_keywords: ["flightstate", "loading", "error", "selectedid", "initialstate"],
    seed_code: `// Step 1: Define state shape and initial state
// This is the single source of truth for flight data

`,
    analogy: {
      title: "NgRx state — the Redux mental model",
      code: `// State = plain TypeScript interface
export interface FlightState {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

// initialState = safe defaults
export const initialState: FlightState = {
  flights: [],
  loading: false,
  error: null,
  selectedId: null,
};

// This object lives in the Store (a global in-memory database)
// Components READ from it via Selectors
// Components WRITE to it by dispatching Actions
// Reducers define HOW Actions transform the state`,
      explain: "The state interface is your contract. Every field has a type. initialState is what the store starts with before any actions fire. Key rule: state is IMMUTABLE — you never mutate it, you always return a new object with the changes.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasInterface = a.includes("flightstate") || a.includes("interface");
      const hasLoading = a.includes("loading");
      const hasError = a.includes("error");
      const hasInitial = a.includes("initialstate");
      if (hasInterface && hasLoading && hasError && hasInitial) return "correct";
      if (hasInterface && hasLoading && hasError) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. State interface defines the shape; initialState provides safe defaults. Interview line: 'State is immutable — reducers never mutate, they always return a new object.'",
    feedback_partial: "Good — you have the interface. Now add the initialState const with all four fields set to their safe defaults.",
    feedback_wrong: `export interface FlightState {\n  flights: Flight[];\n  loading: boolean;\n  error: string | null;\n  selectedId: string | null;\n}\n\nexport const initialState: FlightState = {\n  flights: [],\n  loading: false,\n  error: null,\n  selectedId: null,\n};`,
    expected: `export interface FlightState {\n  flights: Flight[];\n  loading: boolean;\n  error: string | null;\n  selectedId: string | null;\n}\n\nexport const initialState: FlightState = {\n  flights: [], loading: false, error: null, selectedId: null\n};`,
    type_input: "code",
  },

  {
    id: "step2", type: "question", phase: "Step 2 of 8",
    paal: "Define four Actions using createAction: loadFlights (no props), loadFlightsSuccess (props: flights array), loadFlightsFailure (props: error string), selectFlight (props: flightId string).",
    hint: "Actions with data use props<{ fieldName: Type }>(). Actions without data use just createAction('type string').",
    answer_keywords: ["createaction", "loadflights", "loadflightssuccess", "loadflightsfailure", "props"],
    seed_code: `import { createAction, props } from '@ngrx/store';

// Step 2: Define the four Actions
// Use '[Flights]' prefix convention for the type string

`,
    analogy: {
      title: "Actions — events that describe what happened",
      code: `// No payload — just signals an intent
export const loadFlights = createAction('[Flights] Load Flights');

// With payload — carries data the reducer needs
export const loadFlightsSuccess = createAction(
  '[Flights] Load Flights Success',
  props<{ flights: Flight[] }>()
);

export const loadFlightsFailure = createAction(
  '[Flights] Load Flights Failure',
  props<{ error: string }>()
);

export const selectFlight = createAction(
  '[Flights] Select Flight',
  props<{ flightId: string }>()
);

// The string type is like an event name — unique, descriptive
// Convention: '[FeatureName] Event Description'
// This shows up in Redux DevTools — be descriptive`,
      explain: "Actions are plain objects that describe what happened — not how state should change. That's the reducer's job. The type string is like an event name — it shows up in DevTools. props<T>() adds type-safe payload. The '[Flights]' prefix is a convention that groups related actions in DevTools.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasCreate = a.includes("createaction");
      const hasSuccess = a.includes("loadflightssuccess");
      const hasFailure = a.includes("loadflightsfailure");
      const hasProps = a.includes("props");
      if (hasCreate && hasSuccess && hasFailure && hasProps) return "correct";
      if (hasCreate && (hasSuccess || hasFailure)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Four actions: one trigger (no props), one success (flights array), one failure (error string), one selection (flightId). The type string convention '[Feature] Description' is important for DevTools readability.",
    feedback_partial: "Good — you have some actions. Make sure all four are defined and the ones with data use props<{ ... }>(). ",
    feedback_wrong: `export const loadFlights = createAction('[Flights] Load Flights');\nexport const loadFlightsSuccess = createAction('[Flights] Load Success', props<{ flights: Flight[] }>());\nexport const loadFlightsFailure = createAction('[Flights] Load Failure', props<{ error: string }>());\nexport const selectFlight = createAction('[Flights] Select Flight', props<{ flightId: string }>());`,
    expected: `export const loadFlights = createAction('[Flights] Load Flights');\nexport const loadFlightsSuccess = createAction('[Flights] Load Success', props<{ flights: Flight[] }>());\nexport const loadFlightsFailure = createAction('[Flights] Load Failure', props<{ error: string }>());\nexport const selectFlight = createAction('[Flights] Select', props<{ flightId: string }>());`,
    type_input: "code",
  },

  {
    id: "step3", type: "question", phase: "Step 3 of 8",
    paal: "Write the Reducer using createReducer and on(). Handle all four actions: loadFlights sets loading=true, success sets flights and loading=false, failure sets error and loading=false, selectFlight sets selectedId.",
    hint: "createReducer(initialState, on(action, (state, action) => ({...state, changes}))). Always spread the existing state and override only what changes.",
    answer_keywords: ["createreducer", "on(", "loading", "...state"],
    seed_code: `import { createReducer, on } from '@ngrx/store';
import { loadFlights, loadFlightsSuccess, loadFlightsFailure, selectFlight } from './flights.actions';

// Step 3: Write the Reducer
// Handle all four actions
// RULE: never mutate state — always return a new object

export const flightsReducer = createReducer(
  initialState,
  // add on() handlers here
);`,
    analogy: {
      title: "Reducer — the only place state changes",
      code: `export const flightsReducer = createReducer(
  initialState,

  // Trigger: set loading flag
  on(loadFlights, (state) => ({
    ...state,           // spread ALL existing state
    loading: true,      // override only what changes
    error: null         // clear previous error
  })),

  // Success: store data, clear loading
  on(loadFlightsSuccess, (state, { flights }) => ({
    ...state,
    flights,            // shorthand: flights: flights
    loading: false
  })),

  // Failure: store error, clear loading
  on(loadFlightsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Selection: just update the ID
  on(selectFlight, (state, { flightId }) => ({
    ...state,
    selectedId: flightId
  }))
);

// KEY RULE: reducers must be pure functions
// Same input → always same output
// No side effects (no HTTP calls, no console.log)`,
      explain: "The reducer is a pure function — given the current state and an action, it returns the next state. Always spread (...state) first, then override only what changed. Never mutate: no state.flights.push(), no state.loading = true. NgRx will warn you if you try to mutate with strictImmutability mode.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasCreateReducer = a.includes("createreducer");
      const hasOn = a.includes("on(");
      const hasSpread = a.includes("...state");
      const hasAll = a.includes("loadflights") && a.includes("loadflightssuccess") && a.includes("loadflightsfailure");
      if (hasCreateReducer && hasOn && hasSpread && hasAll) return "correct";
      if (hasCreateReducer && hasOn && hasSpread) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. createReducer + on() + spread pattern. Interview line: 'Reducers must be pure — same input always same output, no side effects, never mutate state directly. Always spread and override.'",
    feedback_partial: "Good — you have the reducer structure. Make sure all four on() handlers are present and each one spreads ...state before overriding fields.",
    feedback_wrong: `export const flightsReducer = createReducer(\n  initialState,\n  on(loadFlights, (state) => ({ ...state, loading: true, error: null })),\n  on(loadFlightsSuccess, (state, { flights }) => ({ ...state, flights, loading: false })),\n  on(loadFlightsFailure, (state, { error }) => ({ ...state, error, loading: false })),\n  on(selectFlight, (state, { flightId }) => ({ ...state, selectedId: flightId }))\n);`,
    expected: `export const flightsReducer = createReducer(\n  initialState,\n  on(loadFlights, state => ({ ...state, loading: true, error: null })),\n  on(loadFlightsSuccess, (state, { flights }) => ({ ...state, flights, loading: false })),\n  on(loadFlightsFailure, (state, { error }) => ({ ...state, error, loading: false })),\n  on(selectFlight, (state, { flightId }) => ({ ...state, selectedId: flightId }))\n);`,
    type_input: "code",
  },

  {
    id: "step4", type: "question", phase: "Step 4 of 8",
    paal: "Write three Selectors: selectFlightState (feature selector), selectAllFlights, selectLoading. Then write a composed selector selectSelectedFlight that derives from selectAllFlights + selectSelectedId.",
    hint: "createFeatureSelector gets the feature slice. createSelector composes selectors. The composed selector runs the projector only when inputs change — that's memoization.",
    answer_keywords: ["createfeatureselector", "createselector", "selectallflights", "selectloading"],
    seed_code: `import { createFeatureSelector, createSelector } from '@ngrx/store';

// Step 4: Write the selectors
// Feature key is 'flights'
// Compose selectSelectedFlight from flights array + selectedId

`,
    analogy: {
      title: "Selectors — memoized queries against the store",
      code: `// Feature selector — gets the flights slice from global state
const selectFlightState = createFeatureSelector<FlightState>('flights');

// Basic selectors — project one field
export const selectAllFlights = createSelector(
  selectFlightState,
  (state) => state.flights
);

export const selectLoading = createSelector(
  selectFlightState,
  (state) => state.loading
);

export const selectSelectedId = createSelector(
  selectFlightState,
  (state) => state.selectedId
);

// COMPOSED selector — derives from multiple selectors
export const selectSelectedFlight = createSelector(
  selectAllFlights,    // input 1
  selectSelectedId,    // input 2
  (flights, selectedId) =>   // projector — runs only when inputs change
    flights.find(f => f.flightNumber === selectedId) ?? null
);

// MEMOIZATION: projector only re-runs when flights OR selectedId changes
// If other state changes (e.g. loading), projector is NOT called
// This is the performance win — avoids redundant computation`,
      explain: "Selectors are memoized — the projector function only re-runs when its input selectors return different values. If 'loading' changes but 'flights' and 'selectedId' don't, selectSelectedFlight doesn't recompute. At scale with many components subscribed to the store, this is significant.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasFeature = a.includes("createfeatureselector");
      const hasSelector = a.includes("createselector");
      const hasComposed = a.includes("selectselectedflight") || (a.includes("flights") && a.includes("selectedid"));
      if (hasFeature && hasSelector && hasComposed) return "correct";
      if (hasFeature && hasSelector) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Feature selector → basic selectors → composed selector. Interview line: 'The composed selector's projector only runs when its input selectors return new values — that's memoization. Unrelated state changes don't trigger recomputation.'",
    feedback_partial: "Good — you have the selector structure. Now add the composed selectSelectedFlight that takes both selectAllFlights and selectSelectedId as inputs and finds the matching flight.",
    feedback_wrong: `const selectFlightState = createFeatureSelector<FlightState>('flights');\nexport const selectAllFlights = createSelector(selectFlightState, s => s.flights);\nexport const selectLoading = createSelector(selectFlightState, s => s.loading);\nexport const selectSelectedId = createSelector(selectFlightState, s => s.selectedId);\nexport const selectSelectedFlight = createSelector(\n  selectAllFlights, selectSelectedId,\n  (flights, id) => flights.find(f => f.flightNumber === id) ?? null\n);`,
    expected: `const selectFlightState = createFeatureSelector<FlightState>('flights');\nexport const selectAllFlights = createSelector(selectFlightState, s => s.flights);\nexport const selectLoading = createSelector(selectFlightState, s => s.loading);\nexport const selectSelectedFlight = createSelector(\n  selectAllFlights,\n  createSelector(selectFlightState, s => s.selectedId),\n  (flights, id) => flights.find(f => f.flightNumber === id) ?? null\n);`,
    type_input: "code",
  },

  {
    id: "step5", type: "question", phase: "Step 5 of 8",
    paal: "Write an Effect called loadFlights$ that listens for loadFlights action, calls flightService.searchFlights(), dispatches loadFlightsSuccess on success or loadFlightsFailure on error.",
    hint: "Effects use createEffect, actions$.pipe(ofType(...), switchMap(...)). catchError inside switchMap must return of(failureAction) — not outside.",
    answer_keywords: ["createeffect", "oftype", "switchmap", "catcherror", "loadflightssuccess"],
    seed_code: `import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class FlightsEffects {
  constructor(
    private actions$: Actions,
    private flightService: FlightService
  ) {}

  // Step 5: Write the loadFlights$ effect
  // ofType(loadFlights) → switchMap to API → map to success OR catchError to failure

}`,
    analogy: {
      title: "Effects — the bridge between actions and side effects",
      code: `@Injectable()
export class FlightsEffects {

  loadFlights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFlights),          // listen for this specific action
      switchMap(() =>               // cancel previous, call API
        this.flightService.getFlights().pipe(
          map(flights =>            // success: wrap in success action
            loadFlightsSuccess({ flights })
          ),
          catchError(err =>         // failure: wrap in failure action
            of(loadFlightsFailure({ error: err.message }))
          )
          // CRITICAL: catchError INSIDE switchMap
          // If outside, one error kills the whole effect stream
        )
      )
    )
  );
}

// Flow: component dispatches loadFlights
//   → Effect intercepts → calls API
//   → Dispatches loadFlightsSuccess OR loadFlightsFailure
//   → Reducer updates state
//   → Selector emits new value
//   → Component re-renders via async pipe`,
      explain: "Effects are where side effects live — HTTP calls, localStorage, analytics. The critical mistake: put catchError INSIDE the switchMap pipe, not outside. If catchError is outside, an error kills the entire effect stream — no more actions will be handled. Inside switchMap, an error only kills that one inner observable.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasEffect = a.includes("createeffect");
      const hasOfType = a.includes("oftype");
      const hasSwitch = a.includes("switchmap");
      const hasCatch = a.includes("catcherror");
      if (hasEffect && hasOfType && hasSwitch && hasCatch) return "correct";
      if (hasEffect && hasOfType && hasSwitch) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. createEffect → ofType → switchMap → map success / catchError failure. Critical interview point: catchError MUST be inside switchMap — outside it kills the entire effect stream.",
    feedback_partial: "Good — you have the effect structure. Make sure catchError is inside the switchMap pipe (not outside) and it returns of(loadFlightsFailure({...})).",
    feedback_wrong: `loadFlights$ = createEffect(() =>\n  this.actions$.pipe(\n    ofType(loadFlights),\n    switchMap(() =>\n      this.flightService.getFlights().pipe(\n        map(flights => loadFlightsSuccess({ flights })),\n        catchError(err => of(loadFlightsFailure({ error: err.message })))\n      )\n    )\n  )\n);`,
    expected: `loadFlights$ = createEffect(() =>\n  this.actions$.pipe(\n    ofType(loadFlights),\n    switchMap(() =>\n      this.flightService.getFlights().pipe(\n        map(flights => loadFlightsSuccess({ flights })),\n        catchError(err => of(loadFlightsFailure({ error: err.message })))\n      )\n    )\n  )\n);`,
    type_input: "code",
  },

  {
    id: "step6", type: "question", phase: "Step 6 of 8",
    paal: "Wire the Store into a component: inject Store, dispatch loadFlights on ngOnInit, select flights$ and loading$ using the selectors with async pipe in the template.",
    hint: "Store is injected like any service. this.store.dispatch(action()) to write. this.store.select(selector) to read — returns an Observable.",
    answer_keywords: ["store", "dispatch", "select", "loadflights", "async"],
    seed_code: `import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'ua-flight-board',
  template: \`
    <div *ngIf="loading$ | async">Loading...</div>
    <li *ngFor="let f of flights$ | async">{{ f.flightNumber }}</li>
  \`
})
export class FlightBoardComponent implements OnInit {
  // Step 6: inject Store, expose flights$ and loading$, dispatch on init
}`,
    analogy: {
      title: "dispatch = write. select = read.",
      code: `export class FlightBoardComponent implements OnInit {
  flights$: Observable<Flight[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    // READ: select returns an Observable — use async pipe in template
    this.flights$ = this.store.select(selectAllFlights);
    this.loading$ = this.store.select(selectLoading);

    // WRITE: dispatch triggers the Effect → API call → state update
    this.store.dispatch(loadFlights());
  }
}

// Component never calls the service directly
// Component never manages loading state directly
// Component just: dispatch to trigger, select to read
// Store is the single source of truth`,
      explain: "The component is intentionally thin — it dispatches actions and reads from selectors. No HTTP calls, no state management logic. This separation is exactly why NgRx exists — components become dumb consumers of the store. Async pipe handles subscription + unsubscription automatically.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasStore = a.includes("store");
      const hasDispatch = a.includes("dispatch");
      const hasSelect = a.includes("select");
      const hasFlights$ = a.includes("flights$");
      if (hasStore && hasDispatch && hasSelect && hasFlights$) return "correct";
      if (hasStore && hasDispatch && hasSelect) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. Inject Store → select to read (Observable) → dispatch to write. Async pipe handles subscriptions. Interview line: 'The component never knows about HTTP calls — it just dispatches and reads. All async logic lives in Effects.'",
    feedback_partial: "Good — you have the Store injected. Now make sure you're calling both this.store.select(selector) AND this.store.dispatch(loadFlights()) in ngOnInit.",
    feedback_wrong: `flights$!: Observable<Flight[]>;\nloading$!: Observable<boolean>;\n\nconstructor(private store: Store) {}\n\nngOnInit(): void {\n  this.flights$ = this.store.select(selectAllFlights);\n  this.loading$ = this.store.select(selectLoading);\n  this.store.dispatch(loadFlights());\n}`,
    expected: `flights$!: Observable<Flight[]>;\nloading$!: Observable<boolean>;\n\nconstructor(private store: Store) {}\n\nngOnInit(): void {\n  this.flights$ = this.store.select(selectAllFlights);\n  this.loading$ = this.store.select(selectLoading);\n  this.store.dispatch(loadFlights());\n}`,
    type_input: "code",
  },

  {
    id: "step7", type: "question", phase: "Step 7 of 8",
    paal: "Implement the Facade pattern: create a FlightFacade service that wraps all Store interactions. The component injects the Facade, not the Store directly. Show the Facade with flights$, loading$, loadFlights(), and selectFlight() methods.",
    hint: "The Facade is just an @Injectable service that injects Store and exposes clean methods. Components never import actions or selectors directly.",
    answer_keywords: ["facade", "flightfacade", "dispatch", "select", "injectable"],
    seed_code: `// Step 7: Facade pattern
// FlightFacade wraps all NgRx interactions
// Components inject the Facade, not the Store

`,
    analogy: {
      title: "Facade — hide NgRx complexity behind a clean API",
      code: `// WITHOUT Facade: component knows about Store internals
constructor(private store: Store) {}
ngOnInit() {
  this.flights$ = this.store.select(selectAllFlights); // imports selector
  this.store.dispatch(loadFlights());                   // imports action
}

// WITH Facade: component knows nothing about NgRx
constructor(private flightFacade: FlightFacade) {}
ngOnInit() {
  this.flights$ = this.flightFacade.flights$;   // clean Observable
  this.flightFacade.loadFlights();              // clean method call
}

// The Facade:
@Injectable({ providedIn: 'root' })
export class FlightFacade {
  readonly flights$ = this.store.select(selectAllFlights);
  readonly loading$ = this.store.select(selectLoading);

  constructor(private store: Store) {}

  loadFlights(): void { this.store.dispatch(loadFlights()); }
  selectFlight(id: string): void { this.store.dispatch(selectFlight({ flightId: id })); }
}`,
      explain: "The Facade is a common pattern in large Angular apps. It isolates NgRx implementation details — components don't import actions, selectors, or Store directly. Benefits: easier refactoring (change NgRx structure without touching every component), cleaner component code, easier testing (mock the Facade instead of the Store).",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasFacade = a.includes("facade");
      const hasInjectable = a.includes("injectable");
      const hasSelectAndDispatch = a.includes("select") && a.includes("dispatch");
      if (hasFacade && hasInjectable && hasSelectAndDispatch) return "correct";
      if (hasFacade && (hasInjectable || hasSelectAndDispatch)) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Correct. The Facade hides NgRx from components — they get clean Observables and methods. Interview line: 'I use the Facade pattern so components never import NgRx directly. Easier to refactor and test.'",
    feedback_partial: "Good — you have the Facade started. Make sure it's @Injectable, injects Store, exposes Observable properties, and has clean dispatch wrapper methods.",
    feedback_wrong: `@Injectable({ providedIn: 'root' })\nexport class FlightFacade {\n  readonly flights$ = this.store.select(selectAllFlights);\n  readonly loading$ = this.store.select(selectLoading);\n\n  constructor(private store: Store) {}\n\n  loadFlights(): void { this.store.dispatch(loadFlights()); }\n  selectFlight(id: string): void { this.store.dispatch(selectFlight({ flightId: id })); }\n}`,
    expected: `@Injectable({ providedIn: 'root' })\nexport class FlightFacade {\n  readonly flights$ = this.store.select(selectAllFlights);\n  readonly loading$ = this.store.select(selectLoading);\n  constructor(private store: Store) {}\n  loadFlights(): void { this.store.dispatch(loadFlights()); }\n  selectFlight(id: string): void { this.store.dispatch(selectFlight({ flightId: id })); }\n}`,
    type_input: "code",
  },

  {
    id: "step8", type: "question", phase: "Step 8 of 8",
    paal: "Refactor the flights state to use NgRx Entity. Use EntityAdapter to manage the flights collection. Show how EntityAdapter replaces manual array management for add, update, and remove operations.",
    hint: "EntityAdapter provides addMany, upsertOne, removeOne etc. The state extends EntityState<Flight>. Use adapter.getInitialState() for initialState.",
    answer_keywords: ["entityadapter", "entitystate", "createentityadapter", "addmany"],
    seed_code: `import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

// Step 8: Refactor to use NgRx Entity
// EntityAdapter replaces manual array CRUD operations

`,
    analogy: {
      title: "NgRx Entity — normalised state for collections",
      code: `// WITHOUT Entity: manually manage arrays
on(loadFlightsSuccess, (state, { flights }) => ({
  ...state,
  flights: flights  // entire array replacement — ok
}))
// But for add/update/remove:
on(updateFlight, (state, { flight }) => ({
  ...state,
  flights: state.flights.map(f =>  // verbose, error-prone
    f.flightNumber === flight.flightNumber ? flight : f
  )
}))

// WITH NgRx Entity: normalised, fast, simple
export interface FlightState extends EntityState<Flight> {
  loading: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<Flight> = createEntityAdapter<Flight>({
  selectId: (flight) => flight.flightNumber  // unique key
});

export const initialState = adapter.getInitialState({ loading: false, error: null });

// Reducers become trivial:
on(loadFlightsSuccess, (state, { flights }) =>
  adapter.addMany(flights, { ...state, loading: false })
)
on(updateFlight, (state, { flight }) =>
  adapter.upsertOne(flight, state)   // update or insert
)
on(removeFlight, (state, { id }) =>
  adapter.removeOne(id, state)
)

// Entity also provides built-in selectors:
const { selectAll, selectEntities, selectTotal } = adapter.getSelectors();`,
      explain: "NgRx Entity normalises collections into a dictionary (id → entity) plus an ordered ids array. This makes CRUD operations O(1) instead of O(n) array scanning. The adapter provides addOne, addMany, upsertOne, removeOne, updateOne — no more manual map/filter. getSelectors() provides selectAll, selectEntities, selectTotal for free.",
    },
    evaluate: (ans) => {
      const a = ans.toLowerCase().replace(/\s+/g, "");
      const hasAdapter = a.includes("entityadapter") || a.includes("createentityadapter");
      const hasEntity = a.includes("entitystate");
      const hasMethod = a.includes("addmany") || a.includes("upsertone") || a.includes("removeone");
      if (hasAdapter && hasEntity && hasMethod) return "correct";
      if (hasAdapter && hasEntity) return "partial";
      return "wrong";
    },
    feedback_correct: "✅ Perfect. EntityAdapter normalises state into id → entity dictionary. CRUD becomes addOne/upsertOne/removeOne instead of manual array operations. Interview line: 'Entity gives us O(1) lookups and free CRUD reducers — no more map/filter for updates.'",
    feedback_partial: "Good — you have the EntityAdapter and EntityState. Now show how it's used in a reducer: adapter.addMany(), adapter.upsertOne(), etc.",
    feedback_wrong: `export interface FlightState extends EntityState<Flight> { loading: boolean; error: string | null; }\n\nexport const adapter = createEntityAdapter<Flight>({ selectId: f => f.flightNumber });\n\nexport const initialState = adapter.getInitialState({ loading: false, error: null });\n\n// In reducer:\non(loadFlightsSuccess, (state, { flights }) => adapter.addMany(flights, { ...state, loading: false }))`,
    expected: `export interface FlightState extends EntityState<Flight> { loading: boolean; }\nexport const adapter = createEntityAdapter<Flight>({ selectId: f => f.flightNumber });\nexport const initialState = adapter.getInitialState({ loading: false, error: null });\n// reducer: adapter.addMany(flights, state)`,
    type_input: "code",
  },

  {
    id: "anchor1", type: "anchor", phase: "Anchor Card",
    rule: "Actions describe events. Reducers transform state. Effects handle side effects. Selectors query state. Store holds it all.",
    when: "Any time you write NgRx — this is the data flow: Component dispatches → Effect intercepts → API call → Success/Failure action → Reducer updates state → Selector emits → Component re-renders.",
    mistake: "Putting HTTP calls in the Reducer. Reducers must be pure — no side effects. All async work belongs in Effects.",
  },

  {
    id: "anchor2", type: "anchor", phase: "Anchor Card",
    rule: "catchError INSIDE switchMap in Effects — never outside. Facade hides NgRx from components.",
    when: "Writing an Effect — always put catchError inside the inner pipe. Writing a large app — Facade pattern keeps components clean.",
    mistake: "catchError outside switchMap kills the entire effect stream on first error — no more actions handled. Took down a prod app at Comcast because of this exact mistake.",
  },

  {
    id: "wfs", type: "wfs", phase: "Write From Scratch",
    rubric: [
      "FlightState interface with flights, loading, error, selectedId",
      "Four Actions using createAction with correct props<T>() typing",
      "Reducer using createReducer + on() — spreads state, never mutates",
      "Feature selector + basic selectors + composed selector with memoization",
      "Effect: createEffect → ofType → switchMap → map success / catchError failure (inside)",
      "Component: inject Store, dispatch on init, select with async pipe",
      "Facade pattern: @Injectable service wrapping all Store interactions",
      "NgRx Entity: EntityState, createEntityAdapter, adapter CRUD methods",
      "Can explain: why catchError must be inside switchMap in Effects",
      "Can explain: what memoization means in the context of selectors",
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
  { id: "step1", label: "State shape" },
  { id: "step2", label: "Actions" },
  { id: "step3", label: "Reducer" },
  { id: "step4", label: "Selectors" },
  { id: "step5", label: "Effects" },
  { id: "step6", label: "Component wiring" },
  { id: "step7", label: "Facade pattern" },
  { id: "step8", label: "NgRx Entity" },
  { id: "anchor1", label: "Anchor 1" },
  { id: "anchor2", label: "Anchor 2" },
  { id: "wfs", label: "Write From Scratch" },
];

export default function AngularA05NgRx({ onNextLesson }) {
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
        <div style={s.pre}>{"Close this panel. Open a blank file.\nWrite the complete NgRx layer from memory — state, actions, reducer, selectors, effect, component wiring, facade, and Entity."}</div>
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
            <div style={s.feedback("correct")}>{"✅ Engine ANG05 Complete — NgRx State Management mastered.\nNext: ANG06 — Routing & Guards"}</div>
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
        <h1 style={{ ...s.h1, textAlign: "center" }}>Engine ANG05 Complete</h1>
        <p style={{ color: "#4a5568", fontSize: "13px" }}>NgRx State Management — mastered.</p>
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
        <div style={s.engineTag}>ANG05 — NgRx STATE</div>
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

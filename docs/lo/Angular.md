# Angular

Lessons and learning objectives.

**{ENGINE A01 — COMPONENTS :: Flight Status Card}**

LOs:

01
Explain what the @Component decorator does and its three key metadata properties

02
Define selector and explain how Angular uses it to render components in templates

03
Distinguish between templateUrl vs template and styleUrls vs styles

04
Use @Input() to receive data from a parent component

05
Use @Output() and EventEmitter to send events to a parent component

06
Implement ngOnInit for setup logic and explain why not to use the constructor

07
Implement ngOnDestroy for cleanup and explain why it matters

08
Explain the difference between ngOnInit and ngOnChanges

09
Describe ViewEncapsulation and its three modes

10
Explain what a Standalone Component is (Angular 14+) and how it differs from module-based

---

**{ENGINE A02 — DATA BINDING :: Flight Search Form}**

LOs:

01
Name and write the syntax for all 4 types of Angular data binding

02
Explain the difference between {{interpolation}} and [property] binding

03
Explain how [(ngModel)] works internally as [ngModel] + (ngModelChange)

04
Distinguish *ngIf (removes from DOM) vs [hidden] (CSS only)

05
Use *ngFor with trackBy and explain the performance reason

06
Use async pipe and explain why it's preferred over manual subscribe

07
Define pure vs impure pipes and explain why impure pipes are dangerous

08
Explain what FormsModule is needed for

---

**{ENGINE A03 — SERVICES & DI :: Flight Data Service}**

LOs:

01
Create a service using @Injectable and explain what the decorator does

02
Explain providedIn: 'root' and why it is the preferred registration method

03
Explain the difference between root, module-level, and component-level providers

04
Inject a service via the constructor and explain how Angular resolves it

05
Explain what a singleton is and how Angular DI enforces it

06
Create and use an InjectionToken for a non-class dependency

07
Explain useClass, useValue, and useFactory with a use case for each

08
Make an HTTP GET call inside a service using HttpClient

---

**{ENGINE A04 — RxJS ESSENTIALS :: Real-Time Flight Board}**

LOs:

01
Explain Observable vs Promise — lazy vs eager, cancellable, multiple values

02
Distinguish Subject, BehaviorSubject, and ReplaySubject — and when to use each

03
Explain switchMap, mergeMap, concatMap, exhaustMap — and give a real use case for each

04
Use debounceTime vs throttleTime and explain the difference

05
Combine observables with combineLatest, forkJoin, and zip — and explain when each fires

06
Implement the takeUntil cleanup pattern

07
Explain cold vs hot observables with examples

08
Implement retry logic for failed HTTP calls

---

**{ENGINE A05 — NgRx STATE :: Flight Board State}**

LOs:

01
Name the five NgRx building blocks and explain each in one sentence

02
Create typed Actions using createAction with and without props

03
Write a Reducer using createReducer and on() — explain immutability rule

04
Write a Selector using createSelector and explain memoization

05
Write an Effect that intercepts an Action, calls an API, dispatches success/failure

06
Inject Store, dispatch an action, and select state using async pipe

07
Explain NgRx Entity and what EntityAdapter provides

08
Explain the Facade pattern and why it simplifies component code

---

**{ENGINE A06 — ROUTING & GUARDS :: Flight Portal Navigation}**

LOs:

01
Define a Routes array with path, component, children, and canActivate

02
Explain RouterLink vs router.navigate() — when to use each

03
Explain the difference between route params (:id) and query params (?key=val)

04
Read route params using ActivatedRoute — snapshot vs observable

05
Implement CanActivate to protect a route

06
Implement CanDeactivate to prevent accidental navigation

07
Implement a Resolver to pre-fetch data before a route activates

08
Lazy load a feature module using loadChildren

09
Explain PreloadAllModules and when to use it

---

**{ENGINE A07 — CHANGE DETECTION & SIGNALS :: High-Performance Flight Board}**

LOs:

01
Explain Angular's default change detection and why it can be slow at scale

02
Explain OnPush — what triggers it, what doesn't, and why it's faster

03
Distinguish markForCheck() vs detectChanges() — when to use each

04
Explain what Zone.js does and how Angular uses it

05
Create a signal with signal(), update with set() and update()

06
Create a computed() signal and explain when it recalculates

07
Create an effect() and explain its cleanup and when it runs

08
Convert between Observables and Signals with toSignal() and toObservable()

09
Explain zoneless Angular and why it's the future

---

**{ENGINE A08 — MODULE FEDERATION :: United Portal Micro-Frontend Architecture}**

LOs:

01
Explain what Webpack Module Federation is and the lesson it solves

02
Distinguish Host vs Remote — ownership and deployment boundaries

03
Describe how shared singletons work and why Angular must be shared

04
Sketch a Remote webpack config exposing an Angular module

05
Sketch a Host webpack config consuming that Remote

06
Show how to lazy load a Remote with loadRemoteModule() in the router

07
Discuss communication patterns between MFEs (custom events, shared store, shared services)

08
List tradeoffs and when NOT to use Module Federation

---

**{ENGINE A09 — PIPES :: Flight Status Label Pipe}**

LOs:

01
Import Pipe and PipeTransform from @angular/core

02
Add the @Pipe decorator with a name

03
Create a class that implements PipeTransform

04
Implement the transform(value, ...args) method

05
Map status codes to labels and return the result

06
Use the pipe in a template with the | syntax

---

**{LESSON #1 (Angular) :: Counter App}**

LOs:

01
Use signal(0) for the counter value

02
Use computed or direct signal() for reactive state

03
Template: {{ count() }} and (click) handlers

04
Export a standalone component

---

**{LESSON #2 (Angular) :: Toggle Visibility}**

LOs:

01
Use signal(true) or signal(false) for visible state

02
Template: *ngIf or @if (Angular 17+) for conditional paragraph

03
Button (click) handler that toggles the signal

04
Dynamic button label with ternary in template

---

**{LESSON #3 (Angular) :: Controlled Input}**

LOs:

01
Use signal('') for text state

02
Template: [value]="text()" and (input) handler

03
Handler: text.set($event.target.value)

04
Paragraph showing {{ text() }}

---

**{LESSON #4 (Angular) :: Multiple State Variables}**

LOs:

01
Use two signals: name = signal(''), age = signal('')

02
Two inputs with [value] and (input) handlers

03
Two handler methods that call name.set() and age.set()

04
Live paragraph with both {{ name() }} and {{ age() }}

---

**{LESSON #5 (Angular) :: Conditional Rendering with Ternary}**

LOs:

01
Use signal(true) or signal(false) for the condition

02
Template: {{ isLoggedIn() ? 'Welcome back' : 'Please sign in' }}

03
Optional: toggle button that flips the signal

04
Standalone component with CommonModule

---

**{LESSON #6 (Angular) :: List Rendering with map()}**

LOs:

01
Use signal([]) or a plain array for the list

02
Template: *ngFor="let item of items()" on a repeating element

03
Display each item with {{ item }} or {{ item.name }}

04
CommonModule for NgFor

---

**{LESSON #7 (Angular) :: useEffect & Side Effects}**

LOs:

01
Import effect from @angular/core

02
Create effect(() => { ... }) that reads one or more signals

03
Understand effect runs when read signals change

04
Optional: cleanup with effect's return or DestroyRef

---

**{LESSON #8 (Angular) :: Forms & Validation}**

LOs:

01
Use ReactiveFormsModule and FormBuilder

02
Create a FormGroup with FormControl and Validators.required

03
Bind form with [formGroup] and formControlName

04
Display errors when control invalid and touched

---

**{LESSON #9 (Angular) :: Color Picker}**

LOs:

01
Use signal('') or signal<string> for selected color

02
Buttons or select with (click) or (change) to set the signal

03
Template: [style.background] or [style.color] bound to the signal

04
Display selected color name with {{ selectedColor() }}

---

**{LESSON #10 (Angular) :: Multiple State Vars}**

LOs:

01
Declare 3+ signals (e.g. firstName, lastName, email)

02
One input per signal with [value] and (input)

03
One handler per field or a generic handler with a key

04
Summary paragraph with {{ firstName() }} {{ lastName() }}

---

**{LESSON #100 (Angular) :: angular_c100_engine}**

LOs:

01
DashboardService: metrics = signal({}); connect to WebSocket or SSE and on message parse and metrics.set(newState)

02
DashboardComponent: inject service; template binds {{ metrics().users }}, {{ metrics().orders }}

03
Optional: charts or tables that take metrics() as input; use computed for derived values

04
Reconnect logic and loading state

---

**{LESSON #11 (Angular) :: angular_c11_engine}**

LOs:

01
@Input() label: string

02
@Output() clicked = new EventEmitter<void>()

03
Template: <button (click)="clicked.emit()">{{ label }}</button>

04
Parent uses <app-btn [label]="'Save'" (clicked)="onSave()">

---

**{LESSON #12 (Angular) :: angular_c12_engine}**

LOs:

01
@Input() title: string

02
Template: wrapper div, title in header, <ng-content></ng-content> for body

03
Style the card with a border or shadow

04
Use in parent: <app-card [title]="myTitle">content</app-card>

---

**{LESSON #13 (Angular) :: angular_c13_engine}**

LOs:

01
Parent: signal or property passed to child with [prop]="value"

02
Child: @Input() prop and pass to grandchild with [prop]="prop"

03
Grandchild: @Input() prop and display {{ prop }}

04
Avoid drilling with services or signals in a shared context later

---

**{LESSON #14 (Angular) :: angular_c14_engine}**

LOs:

01
@Input() prop = defaultValue for each optional prop

02
Use sensible defaults (e.g. title = 'Untitled', count = 0)

03
Parent can override with [title]="'My Title'" or omit to use default

04
Type the @Input() when needed: @Input() count = 0

---

**{LESSON #15 (Angular) :: angular_c15_engine}**

LOs:

01
Add <ng-content></ng-content> where child content should appear

02
Parent: <app-wrapper><p>Child content</p></app-wrapper>

03
Optional: multiple slots with select (e.g. select="[header]")

04
Single slot projects all content into one ng-content

---

**{LESSON #16 (Angular) :: angular_c16_engine}**

LOs:

01
*ngIf="isVisible()" to show/hide an element

02
Optional: else with ng-template #elseBlock

03
Use a signal or property for the condition

04
CommonModule for NgIf

---

**{LESSON #17 (Angular) :: angular_c17_engine}**

LOs:

01
*ngFor="let item of items()" on the repeated element

02
Optional: trackBy function for stable identity

03
Display {{ item }} or {{ item.name }} per row

04
Use signal or array for the list source

---

**{LESSON #18 (Angular) :: angular_c18_engine}**

LOs:

01
Define interface User { id: number; name: string }

02
@Input() user!: User or @Input() user: User | null = null

03
Use user in template with {{ user.name }} (optional chaining if nullable)

04
Type @Output() with EventEmitter<User> when emitting objects

---

**{LESSON #19 (Angular) :: angular_c19_engine}**

LOs:

01
Create 2–3 small components (Header, Sidebar, Content)

02
Parent template: place them in a layout with selectors

03
Pass inputs and handle outputs as needed

04
Import child components in parent's imports array

---

**{LESSON #20 (Angular) :: angular_c20_engine}**

LOs:

01
(click)="onClick()" or (click)="count.set(count() + 1)"

02
(keyup.enter)="submit()" for Enter key

03
@Output() submit = new EventEmitter() and submit.emit() in child

04
Pass event: (click)="onClick($event)" when you need the DOM event

---

**{LESSON #21 (Angular) :: angular_c21_engine}**

LOs:

01
Use [ngClass]="{ 'active': isActive(), 'disabled': disabled() }" for object syntax

02
Or [ngClass]="['base', isActive() ? 'on' : 'off']" for array

03
CommonModule provides NgClass; or use class binding [class.active]="isActive()"

04
Combine with signals for reactive class toggling

---

**{LESSON #22 (Angular) :: angular_c22_engine}**

LOs:

01
Use [ngStyle]="{ color: color(), fontSize: size() + 'px' }" for object syntax

02
Or [style.color]="color()" and [style.font-size.px]="size()" for single properties

03
CommonModule provides NgStyle; use camelCase in object

04
Units: [style.width.px], [style.opacity] for numbers

---

**{LESSON #23 (Angular) :: angular_c23_engine}**

LOs:

01
Add styleUrls: ['./my.component.css'] or styles: [`...`] in @Component

02
Use :host { } for the component host element

03
Class names in the template get attribute selectors; no global clash

04
ViewEncapsulation.Emulated (default) or .None for global styles

---

**{LESSON #24 (Angular) :: angular_c24_engine}**

LOs:

01
Create a presentational component with its own styles and template

02
Use host: { '[class]': "'btn btn-primary'" } or host bindings for dynamic classes

03
Or [ngClass] / [ngStyle] in template from @Input() props

04
Keep styles in the component; reuse via selector in parent

---

**{LESSON #25 (Angular) :: angular_c25_engine}**

LOs:

01
Parent holds signal or property; pass to child with [value]="state()"

02
Child @Input() value; @Output() valueChange = new EventEmitter()

03
On child change call valueChange.emit(newValue); parent updates state

04
Two-way binding option: [(value)]="state" with model() or EventEmitter pattern

---

**{LESSON #26 (Angular) :: angular_c26_engine}**

LOs:

01
Controlled: signal or property + [value]="value()" and (input)="value.set($any($event.target).value)"

02
Or use ngModel with FormsModule: [(ngModel)]="value"

03
Uncontrolled: <input #in> and in template or (click)="read(in.value)"

04
Choose controlled for validation and single source of truth

---

**{LESSON #27 (Angular) :: angular_c27_engine}**

LOs:

01
todos = signal([{ id: 1, text: '...', done: false }])

02
*ngFor="let todo of todos()" and trackBy or track todo.id

03
Add: input + button; push new item and todos.set([...todos(), newItem]) or update with mutate

04
Toggle: (click) calling a method that updates the signal

---

**{LESSON #28 (Angular) :: angular_c28_engine}**

LOs:

01
@Input() max = 5; value as @Input() + @Output() valueChange or model()

02
*ngFor with range 1..max; show filled/empty based on value

03
(click) on star sets value and emits valueChange.emit(rating)

04
Parent binds [(value)] or [value] and (valueChange)

---

**{LESSON #29 (Angular) :: A}**

LOs:

01
Panels array or list; each has title and content; open state as signal or index

02
Header (click) toggles open state; *ngIf="open()" or *ngIf="expanded === index" for content

03
Optional: single open (only one expanded at a time) by storing expandedIndex

04
Use *ngFor for multiple panels

---

**{LESSON #30 (Angular) :: angular_c30_engine}**

LOs:

01
images = signal([{ src, alt }, ...]); selectedIndex = signal(0)

02
*ngFor="let img of images(); let i = index" with <img [src]="img.src" (click)="selectedIndex.set(i)">

03
Preview: *ngIf="selectedIndex() >= 0" and bind images()[selectedIndex()].src

04
Optional: use NgOptimizedImage for loading

---

**{LESSON #31 (Angular) :: angular_c31_engine}**

LOs:

01
Inject HttpClient; in ngOnInit or effect call this.http.get<T>(url).subscribe(...)

02
Store result in signal: data = signal<T | null>(null); loading = signal(true); error = signal<Error | null>(null)

03
Or use toSignal(this.http.get<T>(url)) for reactive stream-to-signal

04
Provide HttpClient via provideHttpClient() in app config

---

**{LESSON #32 (Angular) :: angular_c32_engine}**

LOs:

01
Create a Subject or use FormControl valueChanges; pipe(debounceTime(ms))

02
Subscribe and update a signal, or use toSignal(obs.pipe(debounceTime(300)))

03
Emit on input: subject.next(value) or bind form control

04
Unsubscribe in ngOnDestroy or use takeUntilDestroyed()

---

**{LESSON #33 (Angular) :: angular_c33_engine}**

LOs:

01
Read on init: signal(JSON.parse(localStorage.getItem(key) ?? 'null'))

02
effect(() => { localStorage.setItem(key, JSON.stringify(signal())); }) to persist on change

03
Or create a LocalStorageService with get/set and inject it

04
Handle SSR: check typeof localStorage !== 'undefined'

---

**{LESSON #34 (Angular) :: angular_c34_engine}**

LOs:

01
on = signal(false); toggle() { this.on.update(v => !v); }

02
Optional: set(value?: boolean) { if (value !== undefined) this.on.set(value); else this.on.update(v => !v); }

03
Template: (click)="toggle()" or (click)="on.set(!on())"

04
Use in *ngIf or [class.open]="on()"

---

**{LESSON #35 (Angular) :: angular_c35_engine}**

LOs:

01
width = signal(window.innerWidth); height = signal(window.innerHeight)

02
Listen: window.addEventListener('resize', () => { width.set(window.innerWidth); height.set(window.innerHeight); })

03
Clean up in ngOnDestroy or use fromEvent(window, 'resize').pipe(map(() => ({ w: window.innerWidth, h: window.innerHeight })), toSignal())

04
Inject PLATFORM_ID and check isPlatformBrowser before using window

---

**{LESSON #36 (Angular) :: angular_c36_engine}**

LOs:

01
previous = signal<T | undefined>(undefined); in effect read current(), then previous.set(prevCurrent) after storing current

02
Or use a wrapper: run effect, store signal() in prev, set previousSignal(prev), then prev = signal()

03
Use previous() in template or in another effect for comparison

04
Handle first run (no previous) with undefined

---

**{LESSON #37 (Angular) :: angular_c37_engine}**

LOs:

01
Inject ElementRef; get nativeElement

02
HostListener('document:click', ['$event']) onDocumentClick(e: MouseEvent)

03
If (!this.el.nativeElement.contains(e.target)) { this.clickedOutside.emit(); } or set a signal

04
Or use a directive with @HostListener and @Output() for reusability

---

**{LESSON #38 (Angular) :: angular_c38_engine}**

LOs:

01
HostListener('document:keydown', ['$event']) and check e.key === 'Escape' or e.key === 'Enter'

02
Or (keydown)="onKey($event)" on input and handle in component

03
lastKey = signal<string | null>(null); set lastKey.set(e.key)

04
Use keydown.key.enter or keydown.key.escape in template (Angular 17+)

---

**{LESSON #39 (Angular) :: angular_c39_engine}**

LOs:

01
isOnline = signal(navigator.onLine)

02
window.addEventListener('online', () => isOnline.set(true)); addEventListener('offline', () => isOnline.set(false))

03
Remove listeners in ngOnDestroy

04
Optional: use fromEvent(window, 'online').pipe(map(() => true)) and merge with offline for toSignal

---

**{LESSON #40 (Angular) :: angular_c40_engine}**

LOs:

01
const mq = window.matchMedia('(min-width: 768px)'); isMatch = signal(mq.matches)

02
mq.addEventListener('change', (e) => isMatch.set(e.matches)); remove in ngOnDestroy

03
Or inject BreakpointObserver (Angular CDK) and use isMatched() with toSignal

04
Use isMatch() in template for *ngIf or [class.mobile]

---

**{LESSON #41 (Angular) :: angular_c41_engine}**

LOs:

01
Create ThemeService with theme = signal<'light'|'dark'>('light') and setTheme(t)

02
provide(ThemeService) at root or in route; inject(ThemeService) in components

03
Child reads themeService.theme() and binds [class.dark] or uses class on host

04
Optional: provide at component level for scoped theme

---

**{LESSON #42 (Angular) :: angular_c42_engine}**

LOs:

01
AuthService: user = signal<User | null>(null); login(u); logout()

02
providedIn: 'root' so same instance app-wide

03
Guards: inject(AuthService); canActivate = () => authService.user() !== null

04
Components: inject(AuthService) and *ngIf="authService.user()" for protected UI

---

**{LESSON #43 (Angular) :: angular_c43_engine}**

LOs:

01
CartService: items = signal<CartItem[]>([]); addItem(item); removeItem(id); total = computed(() => ...)

02
Inject in CartBadgeComponent and ProductComponent

03
Template: *ngFor="item of cart.items()" and (click)="cart.addItem(product)"

04
Optional: use model() for two-way in child

---

**{LESSON #44 (Angular) :: angular_c44_engine}**

LOs:

01
NotificationService: notifications = signal<Notification[]>([]); add(msg, type?); remove(id)

02
Component that injects service and *ngFor notifications(); each has (click) remove or auto-dismiss

03
Optional: use Subject/Observable for add and toSignal for list

04
Provide service in root

---

**{LESSON #45 (Angular) :: angular_c45_engine}**

LOs:

01
Use computed() so derived values don't trigger extra updates

02
ChangeDetectionStrategy.OnPush so component checks only when @Input or signals change

03
inject(ChangeDetectorRef) and markForCheck() only when needed

04
Avoid returning new object/array from getters in templates; use signals/computed

---

**{LESSON #46 (Angular) :: angular_c46_engine}**

LOs:

01
state = signal(initialState); dispatch(action) { this.state.update(s => reducer(s, action)); }

02
Reducer: (state, action) => { switch (action.type) { case 'INC': return { ...state, count: state.count + 1 }; ... } }

03
Use typed actions: type Action = { type: 'INC' } | { type: 'ADD'; payload: number }

04
Template reads state().count and calls dispatch({ type: 'INC' })

---

**{LESSON #47 (Angular) :: angular_c47_engine}**

LOs:

01
TabsComponent: selectedIndex = signal(0); template has ng-content for tab headers and panels

02
Tab directive or component: (click) calls parent or service to set selectedIndex

03
TabPanel: *ngIf="index === selectedIndex()" or use @ContentChildren and index

04
Or inject parent via optional host and call parent.select(i)

---

**{LESSON #48 (Angular) :: angular_c48_engine}**

LOs:

01
Set changeDetection: ChangeDetectionStrategy.OnPush on components

02
Don't use getters that return new {} or [] in template; use computed() or signals

03
Bind to primitive or signal so change detection sees same reference or signal read

04
Use trackBy in *ngFor to avoid list thrashing

---

**{LESSON #49 (Angular) :: angular_c49_engine}**

LOs:

01
expensive = computed(() => { ... heavy work using this.someSignal(); return result; })

02
Use expensive() in template; recomputes only when someSignal changes

03
Don't put side effects in computed; keep it pure

04
For async or external data use toSignal or resource()

---

**{LESSON #50 (Angular) :: angular_c50_engine}**

LOs:

01
Define handler as a class method: onClick = () => { ... } or onClick() { ... } so reference is stable

02
Child with @Input() callback: use it in (click)="callback()"; parent passes [callback]="parentHandler"

03
If handler needs latest signal value, read inside the method; avoid creating new function in template

04
OnPush on child so it only updates when @Input() or events change

---

**{LESSON #51 (Angular) :: angular_c51_engine}**

LOs:

01
Set changeDetection: ChangeDetectionStrategy.OnPush on the child

02
Pass primitive or signal inputs; for objects ensure parent doesn't create new reference every render

03
Use signals for inputs: child reads inputSignal() so change detection is signal-based

04
Or use @Input() and ensure parent passes same reference when value unchanged

---

**{LESSON #52 (Angular) :: angular_c52_engine}**

LOs:

01
Import ScrollingModule; use <cdk-virtual-scroll-viewport itemSize="50">

02
Inside viewport: *cdkVirtualFor="let item of items()"

03
items() should be the data array; viewport height in px so scroll works

04
Optional: use trackBy with cdkVirtualFor for stability

---

**{LESSON #53 (Angular) :: angular_c53_engine}**

LOs:

01
Route: { path: 'lazy', loadComponent: () => import('./lazy/lazy.comp').then(m => m.LazyComp) }

02
No need to add LazyComp in imports of a module; router loads it

03
Use loadChildren for lazy child routes: loadChildren: () => import('./r').then(m => m.routes)

04
Provide routes with provideRouter(routes)

---

**{LESSON #54 (Angular) :: angular_c54_engine}**

LOs:

01
Use <img loading="lazy" [src]="url"> for native lazy load

02
Or use NgOptimizedImage: img ngSrc="url" and set loading="lazy" (default for non-priority)

03
Priority images: ngSrc with priority or fetchpriority

04
NgOptimizedImage requires width/height or fill

---

**{LESSON #55 (Angular) :: angular_c55_engine}**

LOs:

01
Guard: export const authGuard: CanActivateFn = () => inject(AuthService).user() !== null

02
Apply to route: { path: 'admin', canActivate: [authGuard], loadComponent: ... }

03
Redirect: return inject(Router).createUrlTree(['/login']) when not authenticated

04
Optional: WithAuthComponent that *ngIf="auth.user()" and ng-content

---

**{LESSON #56 (Angular) :: angular_c56_engine}**

LOs:

01
Component has @ContentChild(TemplateRef) or @Input() templateRef

02
Or @Input() template: TemplateRef<{ $implicit: { x: number; y: number } }>

03
Track mouse: HostListener('mousemove', ['$event']) and set position = signal({ x: e.clientX, y: e.clientY })

04
Template: <ng-container *ngTemplateOutlet="template; context: { $implicit: position() }"></ng-container>

---

**{LESSON #57 (Angular) :: angular_c57_engine}**

LOs:

01
DatePicker: @Input() value: Date | null = null; @Output() valueChange = new EventEmitter<Date | null>()

02
On date select: valueChange.emit(selectedDate)

03
Parent: date = signal<Date | null>(null); [value]="date()" (valueChange)="date.set($event)"

04
Or use model() for two-way: value = model<Date | null>(null)

---

**{LESSON #58 (Angular) :: angular_c58_engine}**

LOs:

01
Import PortalModule or CdkPortal, DomPortalOutlet from @angular/cdk/portal

02
Create outlet: outlet = new DomPortalOutlet(el, injector, appRef); outlet.attach(componentPortal or templatePortal)

03
Or use overlay: Overlay.create() and overlayRef.attach(ComponentPortal)

04
Detach and dispose on destroy

---

**{LESSON #59 (Angular) :: angular_c59_engine}**

LOs:

01
Implement custom ErrorHandler: handleError(error) { log; show fallback state }

02
Or create a wrapper component that uses *ngIf and catches by not letting child throw into parent

03
Use runInInjectionContext and effect with try/catch to set hasError signal

04
provide ErrorHandler in app config for global handler

---

**{LESSON #60 (Angular) :: angular_c60_engine}**

LOs:

01
TreeNode interface: { label: string; children?: TreeNode[] }

02
Component template: {{ node.label }} and *ngFor="let child of node.children" with <app-tree-node [node]="child">

03
Component declares itself in imports (or use a separate TreeComponent) to allow recursion

04
Base case: *ngIf="node.children?.length" for the recursive block

---

**{LESSON #61 (Angular) :: angular_c61_engine}**

LOs:

01
items = signal([...]); currentPage = signal(1); pageSize = signal(10)

02
pageItems = computed(() => { const i = items(); const p = currentPage(); return i.slice((p-1)*pageSize(), p*pageSize()); })

03
totalPages = computed(() => Math.ceil(items().length / pageSize()))

04
Buttons: (click)="currentPage.update(p => p - 1)" and similar for next; disable when page <= 1 or >= totalPages

---

**{LESSON #62 (Angular) :: angular_c62_engine}**

LOs:

01
items = signal([]); loadMore() appends next page to items

02
On scroll: get scrollTop, scrollHeight, clientHeight; if near bottom call loadMore()

03
Use @HostListener('scroll', ['$event']) on the scroll container or use a directive with ElementRef

04
Debounce or throttle loadMore to avoid duplicate requests

---

**{LESSON #63 (Angular) :: angular_c63_engine}**

LOs:

01
searchSubject = new Subject<string>(); (input)="searchSubject.next($event.target.value)"

02
debouncedSearch = toSignal(searchSubject.pipe(debounceTime(300)), { initialValue: '' })

03
effect(() => { const q = debouncedSearch(); if (q) fetch or filter and set results.set(...) })

04
Or use FormsModule and control.valueChanges.pipe(debounceTime(300))

---

**{LESSON #64 (Angular) :: angular_c64_engine}**

LOs:

01
currentStep = signal(1); totalSteps = 3

02
Step content: *ngIf="currentStep() === 1" etc. or <ng-container [ngSwitch]="currentStep()">

03
FormGroup or signals for each step's fields; next() validates and currentStep.update(s => s + 1)

04
Submit on last step

---

**{LESSON #65 (Angular) :: angular_c65_engine}**

LOs:

01
Component: @Input() items: T[] = []; use *ngFor="let item of items"

02
For custom row: @Input() itemTemplate!: TemplateRef<{ $implicit: T }>; *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"

03
Or accept a key function @Input() keyFn: (item: T) => string for trackBy

04
Declare component as ListComponent<T> or use generic in @Input typings

---

**{LESSON #66 (Angular) :: angular_c66_engine}**

LOs:

01
Define type VariantA = { type: 'a'; label: string }; VariantB = { type: 'b'; count: number }; type Props = VariantA | VariantB

02
@Input() props!: Props; in template use *ngIf="props.type === 'a'" then props.label

03
Switch in class: if (this.props.type === 'a') return this.props.label; else return this.props.count

04
Use @switch in control flow (Angular 17) for exhaustive check

---

**{LESSON #67 (Angular) :: angular_c67_engine}**

LOs:

01
Template: <input #inputRef>; in class @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>

02
Use this.inputRef.nativeElement.value or .focus() with full type safety

03
For components: @ViewChild(MyComp) comp!: MyComp

04
Signal query: inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputRef')

---

**{LESSON #68 (Angular) :: angular_c68_engine}**

LOs:

01
(click)="onClick($event)" and onClick(e: MouseEvent) { }

02
(keydown)="onKey($event)" and onKey(e: KeyboardEvent) { e.key }

03
(input)="onInput($event)" and onInput(e: Event) { (e.target as HTMLInputElement).value }

04
@Output() submit = new EventEmitter<{ id: number }>(); submit.emit({ id: 1 })

---

**{LESSON #69 (Angular) :: angular_c69_engine}**

LOs:

01
this.http.get<T>(url) returns Observable<T>; toSignal(obs, { initialValue: null }) gives Signal<T | null>

02
Define interface User { id: number; name: string }; getUsers(): Observable<User[]>

03
Component: users = toSignal(this.api.getUsers(), { initialValue: [] as User[] })

04
Type the component's data signal as signal<User[] | null>

---

**{LESSON #70 (Angular) :: angular_c70_engine}**

LOs:

01
@Input() options: Partial<Config> so all keys optional

02
type FormValues = Record<string, FormControl> or { name: FormControl; age: FormControl }

03
Pick<User, 'id'|'name'> for list row type; Omit<User, 'id'> for create payload

04
Use in service return types and template context types

---

**{LESSON #71 (Angular) :: angular_c71_engine}**

LOs:

01
Child defines public focus() or submit() method

02
Parent: @ViewChild(ChildComp) child!: ChildComp; then this.child.focus()

03
Or use exportAs: 'inputRef' and #ref="inputRef"; parent gets ref and calls ref.focus()

04
Signal query: child = viewChild.required(ChildComp); child()?.focus()

---

**{LESSON #72 (Angular) :: angular_c72_engine}**

LOs:

01
Store service: private state = new BehaviorSubject(initial); getState() { return this.state.getValue(); } subscribe(cb) { return this.state.subscribe(cb); }

02
Component: data = toSignal(store.getState$(), { initialValue: store.getState() })

03
Or data = toSignal(store.state.asObservable())

04
Update store: store.dispatch(action) and state.next(newState)

---

**{LESSON #73 (Angular) :: angular_c73_engine}**

LOs:

01
isPending = signal(false); startTransition(fn) { this.isPending.set(true); queueMicrotask(() => { fn(); this.isPending.set(false); }); }

02
Or use setTimeout(0) to defer state update so input stays responsive

03
Template: *ngIf="!isPending()" show result; show spinner when isPending()

04
Heavy computation: run in worker or chunk with requestAnimationFrame

---

**{LESSON #74 (Angular) :: angular_c74_engine}**

LOs:

01
query = signal(''); deferredQuery = signal('')

02
effect(() => { const q = query(); requestAnimationFrame(() => this.deferredQuery.set(q)); }) or setTimeout

03
Render heavy list based on deferredQuery() so typing updates query immediately but list updates deferred

04
Optional: use Angular's @defer block for lazy rendering

---

**{LESSON #75 (Angular) :: angular_c75_engine}**

LOs:

01
effect() runs after change detection; for 'layout' run in afterNextRender or AfterViewChecked

02
afterNextRender(() => { measure DOM }) runs after view is painted

03
Use runOutsideAngular for non-Angular tasks; requestAnimationFrame for before paint

04
Documentation: effect = async after render; afterNextRender = sync after render

---

**{LESSON #76 (Angular) :: angular_c76_engine}**

LOs:

01
type State = { count: number }; type Action = { type: 'INC' } | { type: 'SET'; payload: number }

02
reducer(state, action): State; private state = new BehaviorSubject(initialState)

03
dispatch(action) { this.state.next(this.reducer(this.state.getValue(), action)); }

04
getState() and state$ = state.asObservable(); toSignal(store.state$) in components

---

**{LESSON #77 (Angular) :: angular_c77_engine}**

LOs:

01
items = signal([...]); onAdd(item) { const prev = items(); items.set([...prev, item]); this.http.post(...).subscribe({ error: () => items.set(prev) }); }

02
Or use a 'pending' item with id: 'temp' and replace with server id on success

03
Show error state and revert; optionally retry

---

**{LESSON #78 (Angular) :: angular_c78_engine}**

LOs:

01
getUser(id): Observable<User> { return this.http.get<User>(url).pipe(shareReplay(1)); }

02
Multiple components calling getUser(1) share the same request/result

03
Or cache in a Map and return cached observable if present

04
Use shareReplay({ bufferSize: 1, refCount: true }) for cache with ref count

---

**{LESSON #79 (Angular) :: angular_c79_engine}**

LOs:

01
interval(5000).pipe(switchMap(() => this.http.get(url)), takeUntilDestroyed(this.destroyRef))

02
toSignal(obs, { initialValue: null }) so component has signal with latest data

03
Start polling in constructor or ngOnInit; stop when component destroyed

04
Optional: pause/resume with a subject or signal

---

**{LESSON #80 (Angular) :: angular_c80_engine}**

LOs:

01
ws = new WebSocket(url); messages$ = fromEvent(ws, 'message').pipe(map(e => (e as MessageEvent).data))

02
send(data) { this.ws.readyState === WebSocket.OPEN && this.ws.send(JSON.stringify(data)); }

03
On destroy: ws.close(); or use takeUntilDestroyed in pipe

04
Optional: reconnect logic with Subject

---

**{LESSON #81 (Angular) :: angular_c81_engine}**

LOs:

01
FeatureFlagService: flags = signal<Record<string, boolean>>({}); isOn(name) { return !!this.flags()[name]; }

02
Load from http.get and flags.set(response) in ngOnInit or constructor

03
Component: *ngIf="featureFlags.isOn('newUI')"

04
Optional: environment-based defaults before API load

---

**{LESSON #82 (Angular) :: angular_c82_engine}**

LOs:

01
history = signal<State[]>([]); index = signal(0); state = computed(() => history()[index()] ?? initial)

02
On change: push new state to history (slice(0, index()+1) then push), index.set(history().length - 1)

03
undo(): if index() > 0 index.update(i => i - 1); redo(): if index() < history().length - 1 index.update(i => i + 1)

04
Can use signal for current state and sync from history[index()]

---

**{LESSON #83 (Angular) :: angular_c83_engine}**

LOs:

01
FormField: value = signal(''); touched = signal(false); errors = signal<string[]>([]); setValue(v); markTouched()

02
Directive formField that injects the field and binds [value] and (blur) to markTouched

03
Or use FormGroup/FormControl and custom wrapper component

04
Submit: read form value and validate

---

**{LESSON #84 (Angular) :: angular_c84_engine}**

LOs:

01
:host { --btn-bg: var(--primary-color, #333); --btn-radius: 4px; } .btn { background: var(--btn-bg); border-radius: var(--btn-radius); }

02
Parent or global: .theme-light { --primary-color: blue; } .theme-dark { --primary-color: #222; }

03
Override per instance: <app-button style="--primary-color: red">

04
Document theme variables in component

---

**{LESSON #85 (Angular) :: angular_c85_engine}**

LOs:

01
Route: loadComponent: () => import('remote/app').then(m => m.RemoteComponent) for Module Federation

02
Or load script and mount: fetch script, create custom element from Angular component with createCustomElement

03
Shell has router-outlet; remote routes load into outlet

04
Shared dependencies (e.g. Angular core) via shared config

---

**{LESSON #86 (Angular) :: angular_c86_engine}**

LOs:

01
searchTerm$.pipe(switchMap(q => this.http.get('/api?q='+q))).subscribe(...) so new search cancels old

02
Or toSignal(searchTerm$.pipe(debounceTime(300), switchMap(...)))

03
Never assign result of request N to state if a request N+1 has started; use switchMap to enforce

04
takeUntilDestroyed to clean up

---

**{LESSON #87 (Angular) :: angular_c87_engine}**

LOs:

01
Derived from signals => computed() so it only recomputes when dependencies change

02
Expensive filter/sort in template => move to computed() or method called from computed

03
*ngFor with trackBy: trackById to avoid re-creating DOM when list identity changes

04
Pure pipe for date/currency so result is cached per input

---

**{LESSON #88 (Angular) :: angular_c88_engine}**

LOs:

01
Run ng build --configuration=production --stats-json to generate stats.json

02
Use npx webpack-bundle-analyzer stats.json or Angular budget thresholds in angular.json

03
Lazy load routes with loadComponent; avoid barrel imports that pull in whole libraries

04
Check for duplicate dependencies and use path mapping

---

**{LESSON #89 (Angular) :: angular_c89_engine}**

LOs:

01
effect() runs after change detection; don't assume DOM is updated inside effect

02
For DOM read after paint use afterNextRender()

03
Heavy or non-Angular work: inject NgZone and runOutsideAngular(() => { ... })

04
Signals trigger CD when read in template; avoid writing to signals in effect that other effects read (circular)

---

**{LESSON #90 (Angular) :: angular_c90_engine}**

LOs:

01
Observables: .pipe(takeUntilDestroyed(this.destroyRef)) so subscription ends on destroy

02
addEventListener: store handler and in ngOnDestroy removeEventListener

03
DestroyRef.onDestroy(() => { cleanup }) for injectable cleanup

04
Avoid closing over component in long-lived callbacks

---

**{LESSON #91 (Angular) :: Hello}**

LOs:

01
TestBed.configureTestingModule({ imports: [HttpClientTestingModule], ... })

02
const http = TestBed.inject(HttpTestingController); fixture.detectChanges(); const req = http.expectOne('/api/data'); req.flush({ name: 'Test' }); fixture.detectChanges();

03
Assert fixture.nativeElement.textContent to include expected data

04
http.verify() to ensure no outstanding requests

---

**{LESSON #92 (Angular) :: angular_c92_engine}**

LOs:

01
fakeAsync(() => { ... tick(1000); fixture.detectChanges(); expect(...).toContain('Done'); })

02
Or async/await: fixture.whenStable() after triggering async action

03
For Observables: flush or trigger subscribe in test; then fixture.detectChanges()

04
Test loading state: assert before flush; assert result after flush

---

**{LESSON #93 (Angular) :: angular_c93_engine}**

LOs:

01
const btn = fixture.debugElement.query(By.css('button')); btn.nativeElement.click(); fixture.detectChanges()

02
Input: const input = fixture.debugElement.query(By.css('input')); input.nativeElement.value = 'x'; input.nativeElement.dispatchEvent(new Event('input'))

03
Assert: expect(fixture.nativeElement.textContent).toContain('...') after interaction

04
Use By.directive(MyDirective) to query by directive

---

**{LESSON #94 (Angular) :: angular_c94_engine}**

LOs:

01
TestBed.configureTestingModule({ providers: [{ provide: ThemeService, useValue: { theme: signal('dark') } }] })

02
Or create a spy: const themeService = jasmine.createSpyObj('ThemeService', ['getTheme']); themeService.getTheme.and.returnValue('dark');

03
Assert component shows dark UI when theme is dark

04
Test both branches: provide light and dark and assert each

---

**{LESSON #95 (Angular) :: angular_c95_engine}**

LOs:

01
Mock child to throw: override component with a stub that throws in ngOnInit

02
Or provide a failing HTTP: req.flush('error', { status: 500 }) and assert error message

03
Assert boundary template: expect(fixture.nativeElement.textContent).toContain('Something went wrong')

04
Spy on ErrorHandler and expect handleError to have been called

---

**{LESSON #96 (Angular) :: angular_c96_engine}**

LOs:

01
DataTableComponent<T>: @Input() data: T[] = []; @Input() columns: { key: keyof T; header: string }[]

02
sortBy = signal<keyof T | null>(null); sortDir = signal<'asc'|'desc'>('asc'); (click) on header toggles sort

03
sortedData = computed(() => sort the data by sortBy() and sortDir())

04
Optional: page = signal(1); pageSize = signal(10); slice in computed

---

**{LESSON #97 (Angular) :: angular_c97_engine}**

LOs:

01
AuthService: user = signal<User|null>(null); login(creds); logout(); token in memory or storage

02
authGuard: CanActivateFn = () => inject(AuthService).user() ? true : inject(Router).createUrlTree(['/login'])

03
LoginComponent: form submit -> auth.login() -> router.navigateByUrl(returnUrl)

04
Optional: HTTP_INTERCEPTORS that add Authorization header

---

**{LESSON #98 (Angular) :: angular_c98_engine}**

LOs:

01
NotificationService: notifications = signal<Notification[]>([]); add(text, type?: 'info'|'error'); remove(id)

02
Notification: { id: number; text: string; type?: string }

03
ToastContainerComponent: *ngFor="n of notif.notifications()"; (click) remove or setTimeout remove

04
Optional: maxVisible; queue when full

---

**{LESSON #99 (Angular) :: angular_c99_engine}**

LOs:

01
PermissionService: permissions = signal<Set<string>>(new Set()); can(perm: string) { return this.permissions().has(perm); }

02
Load permissions when user logs in or from /api/permissions

03
Directive: @Input() set appCan(perm: string); use *ngIf in template with inject(PermissionService).can(perm)

04
Or component wrapper: <app-can permission="admin"><ng-content></ng-content></app-can>

---

**{PROBLEM :: AngularTabbedEditor}**

LOs:

---

**{ANGULAR #1 :: Components & templates}**

LOs:

01
Use interpolation and bindings

02
Property and event binding

03
Template refs

---

**{ANGULAR #2 :: Directives}**

LOs:

01
Use *ngIf, *ngFor, *ngSwitch

02
Structural vs attribute

03
Create custom directive

---

**{ANGULAR #3 :: Services & dependency injection}**

LOs:

01
@Injectable and providedIn

02
Hierarchical injectors

03
Injection tokens

---

**{ANGULAR #4 :: RxJS & Observables}**

LOs:

01
Use map, filter, switchMap

02
Choose mergeMap vs concatMap vs exhaustMap

03
Subject types

---

**{ANGULAR #5 :: HTTP client}**

LOs:

01
Use HttpClient

02
Add interceptors

03
Retry and error handling

04
Typed responses

---

**{ANGULAR #6 :: Routing & lazy loading}**

LOs:

01
Configure routes

02
Guards and resolvers

03
Lazy load modules

---

**{ANGULAR #7 :: Forms}**

LOs:

01
Reactive forms

02
FormBuilder, FormGroup

03
Custom and async validators

---

**{ANGULAR #8 :: State management with NgRx}**

LOs:

01
Actions and reducers

02
Selectors

03
Effects

04
Entity adapter

---

**{ANGULAR #9 :: Change detection}**

LOs:

01
OnPush strategy

02
markForCheck

03
async pipe

04
zone.js

---

**{ANGULAR #10 :: Signals (Angular 17+)}**

LOs:

01
signal() and computed()

02
effect()

03
Signal-based components

---

**{ANGULAR #11 :: Angular animations}**

LOs:

01
trigger, state, transition

02
animate

03
Staggered lists

---

**{ANGULAR #12 :: Testing Angular}**

LOs:

01
TestBed and fixtures

02
Async testing

03
Marble testing

04
HttpClientTestingModule

---

**{ANGULAR #13 :: Standalone components (Angular 14+)}**

LOs:

01
standalone: true

02
bootstrapApplication

03
importProvidersFrom

---

**{ANGULAR #14 :: Performance optimisation}**

LOs:

01
trackBy for ngFor

02
Virtual scroll

03
@defer

---

**{ANGULAR #15 :: Angular CLI & workspace}**

LOs:

01
Workspace and projects

02
Generate library

03
Custom schematics/builders

---

**{LESSON #1 (Angular) :: Counter App}**

LOs:

01
Use the useState hook to store and manage a changing value inside a React component

02
Destructure the return value of useState into a state variable and a setter function

03
Explain why calling the setter triggers a re-render but reassigning a variable does not

04
Define named callback functions (increment, decrement, reset) inside a React component

05
Assign a callback function to a button's onClick event handler

06
Use the functional update form setCount(prev => prev + 1) when new state depends on old state

07
Distinguish between setCount(0) and setCount(prev => prev + 1) — and know when to use each

08
Structure a complete React component: import → state → handlers → return JSX

09
Export a React component using the export default function syntax

---

**{LESSON #2 (Angular) :: Toggle Visibility}**

LOs:

01
Use useState with a boolean value — not just a number

02
Initialise state to true or false depending on the starting UI

03
Toggle a boolean using the functional update form: setVisible(prev => !prev)

04
Conditionally render JSX using the && operator

05
Dynamically set a button's label based on a state variable

06
Explain why !prev is safer than !isVisible for toggling

07
Structure a complete React component with boolean state

---

**{LESSON #3 (Angular) :: Controlled Input}**

LOs:

01
Use useState with an empty string — the input starts blank

02
Understand why the initial value is "" not true or 0

03
Write an onChange handler that reads e.target.value

04
Wire value={text} to make React control the input

05
Wire onChange={handleChange} to update state on each keystroke

06
Render live text in a paragraph using {text}

07
Explain the difference between controlled and uncontrolled inputs

---

**{LESSON #4 (Angular) :: Multiple State Variables}**

LOs:

01
Call useState multiple times in one component — each call is independent

02
Understand that updating one state variable never affects another

03
Write separate onChange handlers for each input

04
Render both values in a live output paragraph

05
Understand why we don't put both values in one useState object

---

**{LESSON #5 (Angular) :: Conditional Rendering with Ternary}**

LOs:

01
Use a ternary operator inside JSX: condition ? A : B

02
Understand when to use ternary vs && for conditional rendering

03
Render different text based on a boolean state

04
Render different button labels based on the same boolean

05
Wire a toggle function to flip the boolean on click

06
Explain why if/else doesn't work directly inside JSX return

---

**{LESSON #6 (Angular) :: List Rendering with map()}**

LOs:

01
Use useState with an array as initial value

02
Use .map() to transform an array into JSX elements

03
Understand why every mapped element needs a unique key prop

04
Add items to state using the spread operator: [...prev, newItem]

05
Remove items from state using .filter()

06
Understand why you never mutate state directly with .push()

---

**{LESSON #7 (Angular) :: useEffect & Side Effects}**

LOs:

01
Understand what a "side effect" is and why it lives outside render

02
Write a useEffect with a callback function

03
Use the dependency array to control when the effect runs

04
Understand the three dependency array modes: [], [value], no array

05
Update document.title from inside useEffect

06
Explain why setting state directly in render causes infinite loops

---

**{LESSON #8 (Angular) :: Forms & Validation}**

LOs:

01
Manage multiple form fields with separate useState variables

02
Write validation functions that return error strings or empty string

03
Use boolean derived state to enable/disable a submit button

04
Show inline error messages with conditional rendering

05
Handle form submission with onSubmit + e.preventDefault()

06
Show a success state after valid submission

---

**{LESSON #9 (Angular) :: Color Picker}**

LOs:

01
Use useState with a string to hold the selected color value

02
Render a <select> with <option> elements

03
Wire value and onChange to make the select controlled

04
Apply dynamic inline style (e.g. backgroundColor) to a div based on state

---

**{LESSON #10 (Angular) :: Multiple State Vars}**

LOs:

01
Declare four separate useState variables: name, email, password, confirmPassword

02
Render four controlled inputs, each with value and onChange

03
Optionally show live feedback (e.g. passwords match / don't match)

---

**{LESSON #100 (Angular) :: Design Real-Time Dashboard}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #11 (Angular) :: Reusable Button}**

LOs:

01
Accept label, onClick, variant, disabled as props

02
Apply different styles or classes per variant

03
Disable the button when disabled is true

---

**{LESSON #12 (Angular) :: Card Component}**

LOs:

01
Accept title, description, image (URL), footer as props

02
Render image with <img src={image} alt={title} />

03
Use children or a footer prop for the bottom section

---

**{LESSON #13 (Angular) :: Props Drilling}**

LOs:

01
Create Layer1, Layer2, Layer3 components

02
Pass a prop from parent to child through all three

03
Render the prop in Layer3

04
Export the App that wires the three layers

---

**{LESSON #14 (Angular) :: Default Props}**

LOs:

01
Define default values for size and image (placeholder URL)

02
Use Avatar.defaultProps or default parameters

03
Render an img with size as width/height

---

**{LESSON #15 (Angular) :: Children Prop}**

LOs:

01
Accept children as a prop

02
Return a div that wraps {children}

03
Apply inline styles (maxWidth, padding, etc.)

---

**{LESSON #16 (Angular) :: Conditional Rendering}**

LOs:

01
Use state to hold status (loading / error / empty / data)

02
Render different JSX for each status with if/else or ternary

03
Optionally show mock data when status is 'data'

---

**{LESSON #17 (Angular) :: List Rendering}**

LOs:

01
Define an array of items (e.g. products with id, name, price)

02
Use .map() to render one element per item

03
Add key={item.id} (or stable unique key) to the mapped element

---

**{LESSON #18 (Angular) :: PropTypes / TypeScript Interface}**

LOs:

01
Define an interface or PropTypes for UserCard props

02
Apply the type to the component function

03
Render name, age, and optional avatar

---

**{LESSON #19 (Angular) :: Component Composition}**

LOs:

01
Accept header, sidebar, main, footer as props (each can be React nodes)

02
Render a layout grid/flex with four regions

03
Place each prop in the correct region

---

**{LESSON #20 (Angular) :: Event Handling}**

LOs:

01
Add onKeyDown to form or inputs

02
If e.key === 'Enter', call submit handler (e.preventDefault first)

03
If e.key === 'Escape', clear the form state

---

**{LESSON #21 (Angular) :: Conditional Classes}**

LOs:

01
Use state (e.g. isActive) to drive class names

02
Build className as a string: active ? 'btn active' : 'btn' or template literal

03
Apply the result to className={...}

---

**{LESSON #22 (Angular) :: Inline Styles}**

LOs:

01
Use useState for progress (number 0–100)

02
Render a container div and an inner bar div

03
Set the bar's width with style={{ width: `${progress}%` }}

---

**{LESSON #23 (Angular) :: CSS Modules}**

LOs:

01
Create a .module.css file with a class (e.g. .container)

02
Import it: import styles from './Component.module.css'

03
Use className={styles.container} in the component

---

**{LESSON #24 (Angular) :: Styled Component Pattern}**

LOs:

01
Define CSS variables (e.g. --primary, --secondary) on a parent or :root

02
Use var(--primary) in the button's style

03
Render a button that uses the variables

---

**{LESSON #25 (Angular) :: Lifting State Up}**

LOs:

01
Parent holds state (useState)

02
Pass value and setter (or handler) to both children

03
One child displays, one child updates

---

**{LESSON #26 (Angular) :: Controlled vs Uncontrolled}**

LOs:

01
Controlled: value={state}, onChange updates state

02
Uncontrolled: ref on input, read inputRef.current.value on submit

03
Show both in one component or two

---

**{LESSON #27 (Angular) :: Simple Todo List}**

LOs:

01
State: array of { id, text, done }

02
Add: setTodos([...todos, { id: Date.now(), text, done: false }])

03
Toggle: map and flip done for matching id

04
Delete: filter out by id

---

**{LESSON #28 (Angular) :: Star Rating Component}**

LOs:

01
Use useState for rating (number 0–5 or 1–5)

02
Render 5 clickable elements (stars or buttons)

03
Filled for index <= rating, empty otherwise

04
onClick sets rating to that star's value

---

**{LESSON #29 (Angular) :: Accordion}**

LOs:

01
State: openIndex (number or null) for which panel is open

02
Click header: set openIndex to that index (or toggle to null if same)

03
Render panels: show content only when openIndex === index

---

**{LESSON #30 (Angular) :: Image Gallery}**

LOs:

01
State: selectedImage (URL or null) for which image is enlarged

02
Render a grid of thumbnails (e.g. 3–6 images)

03
Click thumbnail: set selectedImage to that image URL

04
Modal: when selectedImage is set, show overlay with large image and close button or click-outside to close

---

**{LESSON #31 (Angular) :: useFetch}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #32 (Angular) :: useDebounce}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #33 (Angular) :: useLocalStorage}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #34 (Angular) :: useToggle}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #35 (Angular) :: useWindowSize}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #36 (Angular) :: usePrevious}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #37 (Angular) :: useClickOutside}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #38 (Angular) :: useKeyPress}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #39 (Angular) :: useOnlineStatus}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #40 (Angular) :: useMediaQuery}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #41 (Angular) :: Theme Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #42 (Angular) :: Auth Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #43 (Angular) :: Cart Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #44 (Angular) :: Notification Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #45 (Angular) :: Context Performance}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #46 (Angular) :: useReducer vs useState}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #47 (Angular) :: Compound Component (Tabs)}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #48 (Angular) :: Unnecessary Re-renders}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #49 (Angular) :: useMemo for Expensive Computation}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #50 (Angular) :: useCallback for Stable References}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #51 (Angular) :: React.memo}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #52 (Angular) :: List Virtualization}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #53 (Angular) :: Lazy Loading Routes}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #54 (Angular) :: Image Lazy Loading}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #55 (Angular) :: HOC withAuth}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #56 (Angular) :: Render Props (MouseTracker)}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #57 (Angular) :: Controlled DatePicker}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #58 (Angular) :: Portal}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #59 (Angular) :: Error Boundary}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #60 (Angular) :: Recursive TreeView}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #61 (Angular) :: Pagination}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #62 (Angular) :: Infinite Scroll}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #63 (Angular) :: Debounced Search}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #64 (Angular) :: Multi-Step Form}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #65 (Angular) :: Generic List<T>}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #66 (Angular) :: Discriminated Union Props}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #67 (Angular) :: useRef Typing}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #68 (Angular) :: Event Typing}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #69 (Angular) :: Generic useFetch<T>}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #70 (Angular) :: Utility Types}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #71 (Angular) :: useImperativeHandle}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #72 (Angular) :: useSyncExternalStore}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #73 (Angular) :: useTransition}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #74 (Angular) :: useDeferredValue}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #75 (Angular) :: useLayoutEffect vs useEffect}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #76 (Angular) :: Mini Redux}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #77 (Angular) :: Optimistic UI}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #78 (Angular) :: Request Deduplication}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #79 (Angular) :: Polling Hook}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #80 (Angular) :: WebSocket Hook}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #81 (Angular) :: Feature Flag Hook}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #82 (Angular) :: Undo/Redo}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #83 (Angular) :: Form Library from Scratch}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #84 (Angular) :: Component Library Theming}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #85 (Angular) :: Micro-frontend Shell}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #86 (Angular) :: Race Condition Fix}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #87 (Angular) :: Memoization Strategy}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #88 (Angular) :: Bundle Analysis}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #89 (Angular) :: Concurrent Mode Gotchas}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #90 (Angular) :: Memory Leak Hunt}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #91 (Angular) :: Test useFetch}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #92 (Angular) :: Test Async Component}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #93 (Angular) :: Test User Interactions}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #94 (Angular) :: Test Context}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #95 (Angular) :: Test Error Boundary}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #96 (Angular) :: Design DataTable API}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #97 (Angular) :: Design Auth Flow}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #98 (Angular) :: Design Notification System}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

**{LESSON #99 (Angular) :: Design Permission System}**

LOs:

01
Explain the purpose of this hook/pattern and when it should be used in real React applications

02
Implement the solution step‑by‑step inside a React component or custom hook

03
Integrate the solution into a working UI example to verify behaviour

04
Handle common edge cases (cleanup, dependency management, or state consistency)

05
Export and reuse the solution in other components or projects

---

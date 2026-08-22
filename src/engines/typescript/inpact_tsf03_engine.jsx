import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #3",
      title: "Interfaces — Contracts for Objects",
      body: `Interfaces define the shape of an object.
They are the primary tool for typing props, API responses, config objects, and class contracts.

interface User {
  id: number
  name: string
  email?: string        // optional
  readonly role: string // immutable after creation
}

Interfaces are open — you can extend and merge them.
This makes them perfect for library-level contracts.`,
      usecase: `Every API response you type, every React props object you define, every database model you validate — all use interfaces (or type aliases). Mastering them is non-negotiable.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Define an interface with required and optional fields",
      "Use readonly to prevent mutation after creation",
      "Extend an interface with extends",
      "Type function signatures inside an interface",
      "Use interface merging (declaration merging)",
      "Know when interface vs type alias is the right choice",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Define a User interface: id (number), name (string), email (optional string), role (readonly string).",
    answer_keywords: ["interface", "readonly", "?", "number", "string"],
    seed_code: `// Step 1: define an interface with required, optional, and readonly fields

interface User {
  id: number
  name: string
  email?: string          // optional — may or may not exist
  readonly role: string   // can be set once, never mutated
}

const user: User = {
  id: 1,
  name: 'Alice',
  role: 'admin',
  // email is omitted — that's fine because it's optional
}

// user.role = 'guest'  ❌ Cannot assign to 'role' because it is a read-only property

export type { User }
export { user }`,
    feedback_correct: "✅ Interface with optional (?) and readonly — the two most-used field modifiers.",
    feedback_partial: "interface User { id: number; name: string; email?: string; readonly role: string }",
    feedback_wrong: "Use ? for optional fields and readonly keyword before the field name.",
    expected: "Interface with optional and readonly",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Extend User into AdminUser using extends. Add extra fields: permissions (string[]) and lastLogin (Date).",
    answer_keywords: ["extends", "interface", "permissions", "date"],
    seed_code: `// Step 2: interface inheritance with extends

interface User {
  id: number
  name: string
  email?: string
  readonly role: string
}

interface AdminUser extends User {
  permissions: string[]   // extends inherits all User fields
  lastLogin: Date
}

const admin: AdminUser = {
  id: 2,
  name: 'Bob',
  role: 'admin',
  permissions: ['read', 'write', 'delete'],
  lastLogin: new Date(),
}

export type { User, AdminUser }`,
    feedback_correct: "✅ extends copies all parent fields into the child — no duplication needed.",
    feedback_partial: "interface AdminUser extends User { /* new fields */ }",
    feedback_wrong: "interface AdminUser extends User { permissions: string[]; lastLogin: Date }",
    expected: "Interface extension",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Add a method signature to an interface: interface Repository<T> { findById(id: number): Promise<T>; save(entity: T): Promise<void> }",
    answer_keywords: ["interface", "promise", "method", "void", "findbyid", "save"],
    seed_code: `// Step 3: method signatures inside interfaces

interface Repository<T> {
  findById(id: number): Promise<T>
  save(entity: T): Promise<void>
  delete(id: number): Promise<boolean>
}

// A concrete implementation must satisfy every method:
class UserRepository implements Repository<User> {
  async findById(id: number): Promise<User> {
    return fetch(\`/api/users/\${id}\`).then(r => r.json())
  }
  async save(entity: User): Promise<void> {
    await fetch('/api/users', { method: 'POST', body: JSON.stringify(entity) })
  }
  async delete(id: number): Promise<boolean> {
    const res = await fetch(\`/api/users/\${id}\`, { method: 'DELETE' })
    return res.ok
  }
}

interface User { id: number; name: string; email?: string; readonly role: string }
export type { Repository }`,
    feedback_correct: "✅ Interface method signatures define contracts — any class implementing it must fulfill each method.",
    feedback_partial: "Inside the interface, write methodName(param: Type): ReturnType",
    feedback_wrong: "findById(id: number): Promise<T>  |  save(entity: T): Promise<void>",
    expected: "Interface with method signatures",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Show declaration merging: declare interface Window twice and both merge. This is how libraries add types to global objects.",
    answer_keywords: ["interface", "window", "merge", "declare"],
    seed_code: `// Step 4: declaration merging — interfaces with the same name merge automatically

interface Window {
  myAnalytics: {
    track: (event: string, data?: Record<string, unknown>) => void
  }
}

// Now window.myAnalytics is typed everywhere in this project
// This is exactly how @types/node, @types/react, etc. extend global types

// Another common pattern — extending Express Request:
// declare global {
//   namespace Express {
//     interface Request {
//       user?: User
//     }
//   }
// }

export {}   // makes this file a module`,
    feedback_correct: "✅ Declaration merging is how DefinitelyTyped packages add types to existing globals.",
    feedback_partial: "Declaring the same interface name twice causes them to merge, not conflict.",
    feedback_wrong: "Two interface Window { ... } blocks — TypeScript merges both into one.",
    expected: "Interface declaration merging",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Explain interface vs type alias: interface for object shapes you'll extend; type for unions, intersections, and computed types.",
    answer_keywords: ["interface", "type", "union", "|", "&"],
    seed_code: `// Step 5: interface vs type — when to use which

// INTERFACE — use when:
// • Defining object shapes (props, API models, class contracts)
// • You need extends or implements
// • Library code that consumers might extend via declaration merging
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

// TYPE ALIAS — use when:
// • Creating union types
// • Creating intersection types
// • Aliasing primitives, tuples, or complex mapped types
type Status = 'idle' | 'loading' | 'success' | 'error'

type AdminUser = User & { permissions: string[] }   // intersection — both shapes combined

type ID = string | number                            // primitive union

type Nullable<T> = T | null                         // generic type alias

interface User { id: number; name: string; email?: string; readonly role: string }
export type { ButtonProps, Status, AdminUser, ID }`,
    feedback_correct: "✅ The golden rule: interface for extendable object shapes; type for everything else.",
    feedback_partial: "interface for object shapes; type for unions (|), intersections (&), and computed types.",
    feedback_wrong: "interface for objects and classes; type alias for unions and intersections.",
    expected: "Interface vs type alias distinction",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Basic interface", id: "step1" },
  { label: "Step 2 — extends", id: "step2" },
  { label: "Step 3 — Methods", id: "step3" },
  { label: "Step 4 — Merging", id: "step4" },
  { label: "Step 5 — vs type", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F03",
  title: "Interfaces",
  shortName: "TS — INTERFACES",
});

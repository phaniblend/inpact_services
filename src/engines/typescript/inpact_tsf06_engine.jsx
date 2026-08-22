import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "TS FUNDAMENTALS #6",
      title: "Utility Types — TypeScript's Built-in Transformers",
      body: `TypeScript ships with a set of generic utility types
that transform existing types into new ones.
You never have to duplicate a type definition again.

Partial<User>       — all fields become optional
Required<User>      — all fields become required
Readonly<User>      — all fields become readonly
Pick<User, 'id' | 'name'>   — only those fields
Omit<User, 'password'>      — all except those fields
Record<string, number>      — dictionary type
ReturnType<typeof fn>       — the return type of a function`,
      usecase: `PATCH request bodies (Partial), form drafts, DTO transformations, component prop subsets — utility types eliminate hundreds of lines of duplicate interface code in real projects.`,
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Use Partial<T> for PATCH request body typing",
      "Use Required<T> to make all fields mandatory",
      "Use Readonly<T> for immutable config objects",
      "Use Pick<T, K> to select a subset of fields",
      "Use Omit<T, K> to exclude fields (e.g. password from response)",
      "Use Record<K, V> for typed dictionaries",
      "Use ReturnType<typeof fn> to extract a function's return type",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Use Partial<User> to type a PATCH request body where all fields are optional. Use Required<User> where all must be present.",
    answer_keywords: ["partial", "required", "patch"],
    seed_code: `// Step 1: Partial and Required

interface User {
  id: number
  name: string
  email: string
  role: string
}

// PATCH body — caller provides only the fields they want to update
type UpdateUserDto = Partial<User>
// equivalent to: { id?: number; name?: string; email?: string; role?: string }

// DB insert — every field is needed
type CreateUserDto = Required<Omit<User, 'id'>>
// equivalent to: { name: string; email: string; role: string }

async function patchUser(id: number, updates: UpdateUserDto): Promise<User> {
  return fetch(\`/api/users/\${id}\`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }).then(r => r.json())
}

patchUser(1, { name: 'Bob' })             // ✅ only name updated
patchUser(1, { email: 'x@y.com', role: 'admin' })  // ✅ partial update

export type { User, UpdateUserDto, CreateUserDto }`,
    feedback_correct: "✅ Partial<User> is the canonical PATCH DTO type — no more manual ? on every field.",
    feedback_partial: "Partial<T> makes all fields optional; Required<T> makes all mandatory.",
    feedback_wrong: "type UpdateDto = Partial<User>  |  type CreateDto = Required<Omit<User, 'id'>>",
    expected: "Partial and Required utility types",
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Use Pick<User, 'id' | 'name'> to create a safe public profile, and Omit<User, 'password'> to strip sensitive fields.",
    answer_keywords: ["pick", "omit", "password", "profile"],
    seed_code: `// Step 2: Pick and Omit — surgical field selection

interface User {
  id: number
  name: string
  email: string
  password: string   // sensitive — never expose this
  role: string
}

// Pick: select ONLY these fields
type PublicProfile = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// Omit: include everything EXCEPT these fields
type SafeUserResponse = Omit<User, 'password'>
// { id: number; name: string; email: string; role: string }

function toPublicProfile(user: User): PublicProfile {
  return { id: user.id, name: user.name }
}

function toSafeResponse(user: User): SafeUserResponse {
  const { password, ...rest } = user   // destructure to drop password
  return rest
}

export type { User, PublicProfile, SafeUserResponse }`,
    feedback_correct: "✅ Omit<User, 'password'> is the standard way to strip sensitive fields from API responses.",
    feedback_partial: "Pick selects fields; Omit excludes fields. Both take the source type and a union of string keys.",
    feedback_wrong: "type SafeUser = Omit<User, 'password'>  |  type Profile = Pick<User, 'id' | 'name'>",
    expected: "Pick and Omit utility types",
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Use Record<string, number> for a score map, and Record<UserId, User> for a typed entity store.",
    answer_keywords: ["record", "string", "number", "dictionary"],
    seed_code: `// Step 3: Record — typed dictionaries

type UserId = string

interface User { id: UserId; name: string }

// Simple dictionary: string keys → number values
type ScoreMap = Record<string, number>
const scores: ScoreMap = { alice: 92, bob: 85 }

// Typed entity store: specific key type → specific value type
type UserStore = Record<UserId, User>
const store: UserStore = {
  'u1': { id: 'u1', name: 'Alice' },
  'u2': { id: 'u2', name: 'Bob' },
}

// Even better — use a string literal union as the key:
type Env = 'development' | 'staging' | 'production'
type Config = Record<Env, { apiUrl: string; debug: boolean }>

const config: Config = {
  development: { apiUrl: 'http://localhost:3000', debug: true },
  staging:     { apiUrl: 'https://staging.api.com', debug: true },
  production:  { apiUrl: 'https://api.com',         debug: false },
}

export type { ScoreMap, UserStore, Config }`,
    feedback_correct: "✅ Record<K, V> — far safer than { [key: string]: V } because you can constrain K to a literal union.",
    feedback_partial: "Record<KeyType, ValueType> — first param is the key type, second is the value type.",
    feedback_wrong: "Record<string, number>  |  Record<'dev' | 'prod', Config>",
    expected: "Record utility type for typed dictionaries",
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Use ReturnType<typeof fn> to extract a function's return type without duplicating it.",
    answer_keywords: ["returntype", "typeof", "extract"],
    seed_code: `// Step 4: ReturnType — extract the return type of any function

function createUser(name: string, email: string) {
  return {
    id: Math.random().toString(36),
    name,
    email,
    createdAt: new Date(),
  }
}

// Don't duplicate — extract it:
type User = ReturnType<typeof createUser>
// { id: string; name: string; email: string; createdAt: Date }

// Now the type stays in sync automatically if createUser changes

// Also works with async functions:
async function fetchConfig() {
  return { theme: 'dark', lang: 'en', notifications: true }
}

type Config = Awaited<ReturnType<typeof fetchConfig>>
// { theme: string; lang: string; notifications: boolean }
// Awaited<> unwraps the Promise — needed for async function return types

export type { User, Config }`,
    feedback_correct: "✅ ReturnType + Awaited is the combination for async function return type extraction.",
    feedback_partial: "ReturnType<typeof fn> extracts the return type. Wrap in Awaited<> for async functions.",
    feedback_wrong: "type User = ReturnType<typeof createUser>  |  type Config = Awaited<ReturnType<typeof fetchConfig>>",
    expected: "ReturnType and Awaited utility types",
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Combine utility types: make a form state type from a model — pick the editable fields, make them partial, add error fields.",
    answer_keywords: ["partial", "pick", "omit", "record", "combined"],
    seed_code: `// Step 5: composing utility types — real-world form state pattern

interface Product {
  id: string
  name: string
  price: number
  description: string
  sku: string          // internal only — not user-editable
  createdAt: Date      // system field — not user-editable
}

// Editable fields only — omit system fields
type EditableProduct = Omit<Product, 'id' | 'sku' | 'createdAt'>

// Form state: all editable fields are optional (incomplete form)
type ProductFormState = Partial<EditableProduct>

// Form errors: one error string per editable field, all optional
type ProductFormErrors = Partial<Record<keyof EditableProduct, string>>

// Combined form state:
interface ProductFormViewModel {
  values: ProductFormState
  errors: ProductFormErrors
  isDirty: boolean
  isSubmitting: boolean
}

const initialState: ProductFormViewModel = {
  values: {},
  errors: {},
  isDirty: false,
  isSubmitting: false,
}

export type { EditableProduct, ProductFormState, ProductFormErrors, ProductFormViewModel }`,
    feedback_correct: "✅ Composing Omit + Partial + Record<keyof T, string> is the canonical typed form pattern.",
    feedback_partial: "Omit system fields → Partial for optional form values → Record<keyof T, string> for errors.",
    feedback_wrong: "type FormState = Partial<Omit<Product, 'id' | 'sku'>>  |  type Errors = Partial<Record<keyof Editable, string>>",
    expected: "Composed utility types for form state",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Partial/Required", id: "step1" },
  { label: "Step 2 — Pick/Omit", id: "step2" },
  { label: "Step 3 — Record", id: "step3" },
  { label: "Step 4 — ReturnType", id: "step4" },
  { label: "Step 5 — Compose", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: "F06",
  title: "Utility Types",
  shortName: "TS — UTILITY TYPES",
});

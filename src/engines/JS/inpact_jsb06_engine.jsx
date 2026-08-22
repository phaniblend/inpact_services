import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS — BLOCK B #6",
      title: "Property Descriptors & Object Internals",
      body: `Every property on a JavaScript object has a descriptor —
a metadata object controlling three behaviours:

writable     — can the value be changed?
enumerable   — does it show in for...in and Object.keys()?
configurable — can the descriptor itself be changed? Can the property be deleted?

Understanding descriptors explains:
• Why Object.freeze works (sets writable+configurable to false)
• How getters/setters work as accessor descriptors
• How class methods are non-enumerable
• How libraries create "hidden" properties

These are the internals every senior dev should be able to read.`,
      usecase: `Writing libraries, implementing immutability, creating non-enumerable internal properties, defining getters/setters programmatically, understanding why Object.assign skips some properties.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Read a property descriptor with getOwnPropertyDescriptor",
      "Define properties with Object.defineProperty",
      "Understand writable, enumerable, configurable in depth",
      "Define accessor properties (get/set) via descriptors",
      "Understand seal vs freeze vs preventExtensions",
      "Know why class methods are non-enumerable and why that matters",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Inspect and define property descriptors with getOwnPropertyDescriptor and defineProperty.",
    answer_keywords: ["defineProperty", "getOwnPropertyDescriptor", "writable", "enumerable", "configurable"],
    seed_code: `// Step 1: reading and writing property descriptors

const user = { name: 'Alice', age: 30 }

// Read the descriptor:
Object.getOwnPropertyDescriptor(user, 'name')
// {
//   value: 'Alice',
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
// Properties added via literal syntax get all three as TRUE

// Define a property with custom descriptor:
Object.defineProperty(user, 'id', {
  value: 42,
  writable: false,      // can't change the value
  enumerable: false,    // won't appear in for...in / Object.keys()
  configurable: false,  // can't delete or redefine
})

user.id = 99    // silent fail in sloppy, TypeError in strict mode
console.log(user.id)   // still 42

Object.keys(user)    // ['name', 'age'] — id is not enumerable ✅
JSON.stringify(user) // '{"name":"Alice","age":30}' — id omitted ✅

// Define multiple at once:
Object.defineProperties(user, {
  createdAt: { value: new Date(), writable: false, enumerable: true,  configurable: false },
  _internal: { value: 'hidden',  writable: true,  enumerable: false, configurable: false },
})

export { user }`,
    feedback_correct: "✅ defineProperty gives you full control over every property's capabilities. Non-enumerable hides from Object.keys/JSON.",
    feedback_partial: "Object.defineProperty(obj, 'key', { value, writable, enumerable, configurable })",
    feedback_wrong: "Object.defineProperty(obj, 'prop', { value: x, writable: false, enumerable: false })",
    expected: "defineProperty and getOwnPropertyDescriptor",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Show each descriptor flag's effect in isolation — writable-false blocks assignment, enumerable-false hides from loops, configurable-false locks the descriptor.",
    answer_keywords: ["writable", "enumerable", "configurable", "effect", "isolated"],
    seed_code: `// Step 2: each flag's effect

const obj = {}

// WRITABLE: false — value cannot be changed:
Object.defineProperty(obj, 'PI', { value: 3.14159, writable: false, enumerable: true, configurable: true })
obj.PI = 99   // silent fail (sloppy) / TypeError (strict)
console.log(obj.PI)  // 3.14159

// ENUMERABLE: false — hidden from iteration:
Object.defineProperty(obj, '_secret', { value: 'hidden', writable: true, enumerable: false, configurable: true })
for (const key in obj) console.log(key)   // only 'PI' — _secret hidden
Object.keys(obj)        // ['PI'] — _secret missing
JSON.stringify(obj)     // '{"PI":3.14159}' — _secret omitted
// BUT directly accessible if you know the name:
obj._secret             // 'hidden' — still readable ✅

// CONFIGURABLE: false — descriptor is frozen, property non-deleteable:
Object.defineProperty(obj, 'LOCKED', { value: 1, writable: false, enumerable: true, configurable: false })
delete obj.LOCKED   // false — can't delete
// Object.defineProperty(obj, 'LOCKED', { writable: true })  // ❌ TypeError

// One exception: configurable:false + writable:true → can change writable to false:
Object.defineProperty(obj, 'LOCKED', { writable: false })  // ✅ this specific change allowed

// DEFAULTS when using defineProperty:
// All three default to FALSE when not specified!
// Very different from literal { x: 1 } which defaults all to TRUE

export { obj }`,
    feedback_correct: "✅ writable=false: can't change value. enumerable=false: hidden from loops/keys/JSON. configurable=false: locked.",
    feedback_partial: "Each flag is independent. Non-enumerable hides from iteration but value still readable. configurable=false locks.",
    feedback_wrong: "defineProperty defaults are FALSE. Literal property defaults are TRUE. Big difference.",
    expected: "writable/enumerable/configurable effects",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Define accessor properties (get/set) via defineProperty — including a computed property with validation.",
    answer_keywords: ["get", "set", "accessor", "defineProperty", "computed"],
    seed_code: `// Step 3: accessor descriptors — get/set via defineProperty

// Accessor descriptor has get/set instead of value/writable:
const person = { _age: 25 }

Object.defineProperty(person, 'age', {
  get() {
    return this._age
  },
  set(value) {
    if (typeof value !== 'number' || value < 0 || value > 150) {
      throw new RangeError(\`Invalid age: \${value}\`)
    }
    this._age = value
  },
  enumerable: true,
  configurable: true,
})

person.age = 30    // calls set(30)
person.age         // calls get() → 30
// person.age = -5  // ❌ RangeError

// Computed property — celsius/fahrenheit pair:
const temperature = { _celsius: 20 }

Object.defineProperty(temperature, 'fahrenheit', {
  get() { return this._celsius * 9/5 + 32 },
  set(f) { this._celsius = (f - 32) * 5/9 },
  enumerable: true,
  configurable: true,
})

temperature.fahrenheit      // 68
temperature.fahrenheit = 98.6
temperature._celsius        // 37

// Note: class get/set syntax uses the SAME accessor descriptor under the hood:
// class Person { get age() { ... } set age(v) { ... } }
// is equivalent to Object.defineProperty on Person.prototype

export { person, temperature }`,
    feedback_correct: "✅ Accessor descriptors use get/set instead of value/writable. Class get/set is syntactic sugar for exactly this.",
    feedback_partial: "Object.defineProperty with { get() {}, set(v) {} } defines a computed property.",
    feedback_wrong: "{ get() { return this._x }, set(v) { this._x = v }, enumerable: true } is an accessor descriptor.",
    expected: "Accessor descriptors via defineProperty",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Compare preventExtensions, seal, and freeze — three levels of object immutability.",
    answer_keywords: ["freeze", "seal", "preventExtensions", "immutable", "configurable"],
    seed_code: `// Step 4: three levels of object locking

const obj = { x: 1, y: { z: 2 } }

// LEVEL 1: preventExtensions — can't add new properties:
Object.preventExtensions(obj)
obj.newProp = 'test'   // silently fails (sloppy) / TypeError (strict)
obj.x = 99             // ✅ can still modify existing
delete obj.y           // ✅ can still delete
Object.isExtensible(obj)  // false

// LEVEL 2: seal — can't add OR delete properties; values still mutable:
const sealed = Object.seal({ a: 1, b: 2 })
sealed.c = 3     // ❌ can't add
delete sealed.a  // ❌ can't delete
sealed.a = 99    // ✅ can still change values
// All properties: configurable: false, but writable unchanged
Object.isSealed(sealed)   // true

// LEVEL 3: freeze — can't add, delete, OR modify:
const frozen = Object.freeze({ a: 1, b: 2 })
frozen.c = 3     // ❌ can't add
delete frozen.a  // ❌ can't delete
frozen.a = 99    // ❌ can't change values either — writable: false
Object.isFrozen(frozen)  // true

// ⚠️  ALL THREE ARE SHALLOW:
const config = Object.freeze({ server: { host: 'localhost' } })
config.server = {}         // ❌ blocked
config.server.host = 'remote'  // ✅ nested object is NOT frozen!

// Deep freeze requires recursion:
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    const val = obj[name]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export { deepFreeze }`,
    feedback_correct: "✅ preventExtensions < seal < freeze. All are shallow — nested objects need explicit deep freeze.",
    feedback_partial: "preventExtensions: no add. seal: no add/delete. freeze: no add/delete/modify. All shallow.",
    feedback_wrong: "Object.freeze prevents add/delete/modify but is shallow — nested objects still mutable.",
    expected: "preventExtensions vs seal vs freeze",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Show that class methods are non-enumerable (unlike plain object methods) and explain why this is important.",
    answer_keywords: ["class", "non-enumerable", "prototype", "for...in", "enumerable"],
    seed_code: `// Step 5: class methods are non-enumerable — and why it matters

class Animal {
  constructor(name) { this.name = name }
  speak() { return \`\${this.name} speaks\` }
  static create(name) { return new Animal(name) }
}

const dog = new Animal('Rex')

// Instance own properties — enumerable (set in constructor):
Object.getOwnPropertyDescriptor(dog, 'name')
// { value: 'Rex', writable: true, enumerable: true, configurable: true }

// Class method on prototype — NON-ENUMERABLE:
Object.getOwnPropertyDescriptor(Animal.prototype, 'speak')
// { value: [Function: speak], writable: true, enumerable: false, configurable: true }

// Effect on for...in (which walks the prototype chain):
for (const key in dog) console.log(key)
// Only 'name' — 'speak' is non-enumerable, so it's hidden ✅

// Plain object method — would be enumerable:
const plainObj = {
  name: 'Rex',
  speak() { return 'speaks' }  // enumerable: true
}
for (const key in plainObj) console.log(key)   // 'name', 'speak' — both

// Why this matters:
// 1. for...in on class instances only shows data, not methods (correct!)
// 2. JSON.stringify only shows own enumerable — correct for class instances
// 3. Object.assign only copies own enumerable — methods on prototype not copied
// 4. Spread {...instance} only copies own enumerable properties

// Reproducing class behaviour manually:
function ManualClass(name) { this.name = name }
Object.defineProperty(ManualClass.prototype, 'speak', {
  value() { return \`\${this.name} speaks\` },
  enumerable: false,   // matches class behaviour
  writable: true,
  configurable: true,
})

export { Animal, ManualClass }`,
    feedback_correct: "✅ Class methods are non-enumerable on the prototype — for...in, Object.assign, and spread don't pick them up.",
    feedback_partial: "class methods: enumerable=false on prototype. Object literal methods: enumerable=true.",
    feedback_wrong: "for(key in classInstance) shows only own enumerable (data). Class methods on prototype are non-enumerable.",
    expected: "Class methods are non-enumerable",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — defineProperty", id: "step1" },
  { label: "Step 2 — Flag effects", id: "step2" },
  { label: "Step 3 — Accessor props", id: "step3" },
  { label: "Step 4 — freeze/seal", id: "step4" },
  { label: "Step 5 — Class methods", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-B06", title: "Property Descriptors & Object Internals", shortName: "JS — DESCRIPTORS" });

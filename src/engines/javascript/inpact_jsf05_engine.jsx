import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "JS FUNDAMENTALS #5",
      title: "Objects, Prototypes & Classes",
      body: `JavaScript's object model is prototype-based at its core.
ES6 classes are syntactic sugar over that model — not true classes.

Understanding both is essential because:
• prototype chains explain how inheritance actually works
• class syntax is what you write every day (React class components,
  TypeScript classes, service classes in Node)
• Object static methods (Object.keys, Object.entries, Object.freeze)
  are daily utilities

You also need: getters/setters, static methods, private fields (#),
and the Symbol-based metaprogramming tools.`,
      usecase: `Repository classes, service classes, data models, React class components (legacy), TypeScript class-based dependency injection — all require confident class + prototype knowledge.`,
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Understand prototype chains — how property lookup works",
      "Write ES6 classes with constructor, methods, static, getters/setters",
      "Use private fields (#) for encapsulation",
      "Extend classes with extends and call super()",
      "Use Object.keys/values/entries/assign/freeze/fromEntries",
      "Understand this binding gotchas in class methods",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 5",
    paal: "Show prototype chain — how properties are looked up from instance → class prototype → Object.prototype.",
    answer_keywords: ["prototype", "object.create", "__proto__", "chain"],
    seed_code: `// Step 1: prototype chain

// Every object has an internal [[Prototype]] link:
const animal = {
  breathe() { return 'breathing' }
}

const dog = Object.create(animal)   // dog's prototype is animal
dog.bark = function() { return 'woof' }

dog.bark()     // found on dog directly
dog.breathe()  // not on dog → look up prototype chain → found on animal ✅

// dog.__proto__ === animal   → true
// animal.__proto__ === Object.prototype → true
// Object.prototype.__proto__ === null   → end of chain

// hasOwnProperty checks only the object itself (not the chain):
dog.hasOwnProperty('bark')    // true
dog.hasOwnProperty('breathe') // false — it's on the prototype

// ES6 class is just cleaner syntax for the same prototype mechanism:
class Animal {
  breathe() { return 'breathing' }
}
class Dog extends Animal {
  bark() { return 'woof' }
}

const d = new Dog()
// d.__proto__ === Dog.prototype
// Dog.prototype.__proto__ === Animal.prototype  (the chain)

export { animal, dog }`,
    feedback_correct: "✅ Prototype chain = the lookup ladder. Understanding it explains how extends and class truly work.",
    feedback_partial: "Object.create(proto) sets the prototype. Property lookup climbs the chain until null.",
    feedback_wrong: "Object.create(proto) | .hasOwnProperty() to check own vs inherited properties.",
    expected: "Prototype chain lookup",
  },
  {
    id: "step2", type: "question", phase: "Step 2 of 5",
    paal: "Write a complete ES6 class: constructor, instance methods, static method, getter, setter, and private field.",
    answer_keywords: ["class", "constructor", "static", "get", "set", "#"],
    seed_code: `// Step 2: full ES6 class anatomy

class BankAccount {
  #balance   // private field — inaccessible outside the class

  constructor(owner, initialBalance = 0) {
    this.owner = owner
    this.#balance = initialBalance
    BankAccount.count++
  }

  // Getter — looks like a property but runs a function:
  get balance() { return this.#balance }

  // Setter — validate before assigning:
  set balance(amount) {
    if (amount < 0) throw new Error('Balance cannot be negative')
    this.#balance = amount
  }

  deposit(amount) {
    this.#balance += amount
    return this   // fluent interface — enables chaining
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds')
    this.#balance -= amount
    return this
  }

  // Static — belongs to the class, not instances:
  static count = 0
  static getCount() { return BankAccount.count }
}

const acc = new BankAccount('Alice', 100)
acc.deposit(50).withdraw(30)   // chaining works because we return this
console.log(acc.balance)       // 120

// acc.#balance  // ❌ SyntaxError — private fields are truly private

export { BankAccount }`,
    feedback_correct: "✅ constructor, get/set, #private, static — all the pieces. Private fields (#) are a hard boundary.",
    feedback_partial: "#field is private; get/set define computed-looking properties; static belongs to the class.",
    feedback_wrong: "class X { #field; get prop() {}; set prop(v) {}; static method() {} }",
    expected: "Full class with private fields and accessors",
  },
  {
    id: "step3", type: "question", phase: "Step 3 of 5",
    paal: "Extend BankAccount into a SavingsAccount with an interest rate. Use super() to call the parent constructor.",
    answer_keywords: ["extends", "super", "override", "inherit"],
    seed_code: `// Step 3: class inheritance with extends and super

class BankAccount {
  #balance
  constructor(owner, balance = 0) {
    this.owner = owner
    this.#balance = balance
  }
  get balance() { return this.#balance }
  deposit(amount) { this.#balance += amount; return this }
  toString() { return \`\${this.owner}: $\${this.#balance}\` }
}

class SavingsAccount extends BankAccount {
  #rate

  constructor(owner, balance, annualRate) {
    super(owner, balance)   // MUST call super() before using this
    this.#rate = annualRate
  }

  applyInterest() {
    const interest = this.balance * this.#rate
    this.deposit(interest)   // inherited method ✅
    return this
  }

  // Override toString:
  toString() {
    return super.toString() + \` (rate: \${this.#rate * 100}%)\`
  }
}

const savings = new SavingsAccount('Bob', 1000, 0.05)
savings.applyInterest()
console.log(savings.toString())   // 'Bob: $1050 (rate: 5%)'

// instanceof walks the prototype chain:
savings instanceof SavingsAccount   // true
savings instanceof BankAccount      // true ✅

export { BankAccount, SavingsAccount }`,
    feedback_correct: "✅ super() in constructor and super.method() in overrides — always required before this.",
    feedback_partial: "extends inherits. super() calls the parent constructor. super.method() calls parent's method.",
    feedback_wrong: "class Child extends Parent { constructor(...) { super(...); /* then this */ } }",
    expected: "extends and super",
  },
  {
    id: "step4", type: "question", phase: "Step 4 of 5",
    paal: "Use Object.keys/values/entries to iterate an object, Object.fromEntries to rebuild it, and Object.freeze for deep immutability.",
    answer_keywords: ["object.keys", "entries", "fromEntries", "freeze"],
    seed_code: `// Step 4: Object static methods

const product = { id: 1, name: 'Laptop', price: 999, stock: 5 }

// Keys, values, entries — all return arrays:
Object.keys(product)    // ['id', 'name', 'price', 'stock']
Object.values(product)  // [1, 'Laptop', 999, 5]
Object.entries(product) // [['id', 1], ['name', 'Laptop'], ...]

// Transform object values (map over entries, rebuild):
const discounted = Object.fromEntries(
  Object.entries(product).map(([k, v]) =>
    k === 'price' ? [k, v * 0.9] : [k, v]
  )
)
// { id: 1, name: 'Laptop', price: 899.1, stock: 5 }

// Object.assign — merge into target (mutates first arg):
const merged = Object.assign({}, product, { stock: 3 })

// Object.freeze — prevent any mutations (shallow):
const CONFIG = Object.freeze({ apiUrl: 'https://api.example.com', timeout: 5000 })
// CONFIG.timeout = 3000   // ❌ silent fail in sloppy mode, throws in strict mode

// Object.freeze is shallow — nested objects still mutable:
const settings = Object.freeze({ db: { host: 'localhost' } })
settings.db.host = 'remote'   // ✅ works! (db is not frozen, only settings is)

export { discounted, merged, CONFIG }`,
    feedback_correct: "✅ entries + fromEntries is the functional transform pattern for objects. freeze is shallow-only.",
    feedback_partial: "Object.entries().map().fromEntries() transforms object values without mutation.",
    feedback_wrong: "Object.fromEntries(Object.entries(obj).map(([k,v]) => [k, transform(v)]))",
    expected: "Object static methods",
  },
  {
    id: "step5", type: "question", phase: "Step 5 of 5",
    paal: "Fix the classic `this` binding lesson in class methods used as callbacks. Show three solutions: bind, arrow, and arrow class field.",
    answer_keywords: ["bind", "this", "class field", "callback"],
    seed_code: `// Step 5: this binding in class methods — the classic gotcha

class Timer {
  seconds = 0

  // PROBLEM: regular method loses 'this' when passed as a callback:
  tickBroken() {
    this.seconds++   // 'this' is undefined when called as a callback
  }

  // SOLUTION 1: bind in constructor
  constructor() {
    this.tickBound = this.tickBound.bind(this)
  }
  tickBound() { this.seconds++ }

  // SOLUTION 2: arrow function class field (most common in React):
  tickArrow = () => {
    this.seconds++   // arrow functions capture 'this' lexically ✅
  }

  // SOLUTION 3: wrap at the call site (inline arrow):
  start() {
    setInterval(() => this.tick(), 1000)   // works but creates a new fn each call
  }

  tick() { this.seconds++ }
}

const timer = new Timer()

// ❌ loses this:
// const t = timer.tickBroken
// setInterval(t, 1000)

// ✅ arrow class field — the React-idiomatic solution:
// handleClick = () => { this.setState(...) }

export { Timer }`,
    feedback_correct: "✅ Arrow class fields capture this permanently — the standard React class component pattern.",
    feedback_partial: "bind() in constructor or arrow class fields both preserve this.",
    feedback_wrong: "tickArrow = () => { ... }  OR  this.method = this.method.bind(this) in constructor",
    expected: "this binding solutions in class methods",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Prototype chain", id: "step1" },
  { label: "Step 2 — Full class", id: "step2" },
  { label: "Step 3 — extends/super", id: "step3" },
  { label: "Step 4 — Object methods", id: "step4" },
  { label: "Step 5 — this binding", id: "step5" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "JS-F05", title: "Objects, Prototypes & Classes", shortName: "JS — CLASSES" });

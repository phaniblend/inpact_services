# TypeScript

Lessons and learning objectives.

**{TS FUNDAMENTALS #1 :: Primitive Types & Variable Annotations}**

LOs:

01
Annotate variables with number, string, boolean

02
Understand null vs undefined — and when to use each

03
Know when any erases type safety (and why to avoid it)

04
Use unknown as the safe alternative to any

05
Understand never — the type of values that never exist

06
Use const vs let and how type inference reduces annotation noise

---

**{TS FUNDAMENTALS #2 :: Typing Functions}**

LOs:

01
Annotate function parameters and return type

02
Use void for functions that return nothing

03
Use optional params (name?: string) and default values

04
Use rest params (...args: string[])

05
Type arrow functions inline and as a named type

06
Write a function overload for different input signatures

---

**{TS FUNDAMENTALS #3 :: Interfaces — Contracts for Objects}**

LOs:

01
Define an interface with required and optional fields

02
Use readonly to prevent mutation after creation

03
Extend an interface with extends

04
Type function signatures inside an interface

05
Use interface merging (declaration merging)

06
Know when interface vs type alias is the right choice

---

**{TS FUNDAMENTALS #4 :: Union Types, Intersections & Type Guards}**

LOs:

01
Create union types with |

02
Create intersection types with &

03
Use typeof for primitive narrowing

04
Use instanceof for class narrowing

05
Use in operator to narrow object shapes

06
Build a discriminated union with a literal 'kind' field

07
Write an exhaustiveness check using never

---

**{TS FUNDAMENTALS #5 :: Generics — Types as Parameters}**

LOs:

01
Write a generic function with <T>

02
Add generic constraints with extends

03
Use multiple type parameters <T, U>

04
Create a generic interface

05
Understand when TypeScript infers T vs when you must provide it

06
Build a real-world generic: ApiResponse<T>

---

**{TS FUNDAMENTALS #6 :: Utility Types — TypeScript}**

LOs:

01
Use Partial<T> for PATCH request body typing

02
Use Required<T> to make all fields mandatory

03
Use Readonly<T> for immutable config objects

04
Use Pick<T, K> to select a subset of fields

05
Use Omit<T, K> to exclude fields (e.g. password from response)

06
Use Record<K, V> for typed dictionaries

07
Use ReturnType<typeof fn> to extract a function's return type

---

**{TS FUNDAMENTALS #7 :: Enums & Tuples — Structured Constants}**

LOs:

01
Define a numeric enum and understand its runtime value

02
Define a string enum — and why they're preferred

03
Use const enum for zero-runtime-cost constants

04
Know when string literal unions beat enums

05
Define a typed tuple with fixed positions

06
Use labeled tuples for documentation

07
See how React's useState returns a tuple

---

**{TS FUNDAMENTALS #8 :: Type Assertions, Non-null & satisfies}**

LOs:

01
Use as to assert a type from a wider one

02
Use the non-null assertion operator ! correctly

03
Know when NOT to use assertions (and use a type guard instead)

04
Use as const to freeze a value to its literal type

05
Use satisfies to validate shape while keeping the inferred type

06
Avoid double assertions (value as unknown as T) — the smell test

---

**{TS FUNDAMENTALS #9 :: Typing Uncertain Output}**

LOs:

01
Use generics to let the caller declare the return type

02
Use unknown for truly opaque outputs — force narrowing downstream

03
Use union return types for finite output possibilities

04
Use conditional types to derive return type from input type

05
Type a fetch wrapper that returns Promise<T> safely

06
Use overloads to give different return types per input

---

**{TS FUNDAMENTALS #10 :: Advanced Patterns — The Senior-Level Toolkit}**

LOs:

01
Write a mapped type to transform all keys of an object type

02
Use template literal types for string-level type manipulation

03
Use infer to extract a nested type from a generic

04
Write a .d.ts ambient declaration for an untyped JS module

05
Use declare module to augment an existing type

06
Combine mapped + conditional types for a real utility

---

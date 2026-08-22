import createINPACTEngine from "../inpact_engine_shared";

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "idt-booking-day-board-filter",
      title: "Day board: filter appointments by provider",
      body: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      usecase: "Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill.",
      designMock: {"kind":"list-and-form","screenTitle":"Day board","caption":"This is the screen you are building. Match the pieces — list, empty message, form, submit — not the brand colors. Try typing and submitting.","listCaption":"LIST — sample rows","emptyCaption":"EMPTY — when there are no rows","emptyMessage":"No appointments for this filter.","rows":[{"title":"Maya","subtitle":"Cut","meta":"10:00"},{"title":"Second row","subtitle":"Another","meta":"10:00"}],"fields":[{"label":"Provider","sample":"Maya"},{"label":"Service","sample":"Cut"},{"label":"Starts at","sample":"10:00"}],"submitLabel":"Add"},
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: ["Define the component function shell this code will live in","Define a TypeScript type for one item in a list","Store a list in React state with useState so the UI re-renders","Filter the list in the UI so only matching rows render","Show an empty message when the list has no items","Wire controlled inputs so form fields live in React state","On submit, preventDefault, append one item to the list, and clear the form"],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 7",
    paal: `Every step from here on adds to one function. Write and export a function named \`DayBoard\` that returns \`<div />\`.

Your task: define and export DayBoard as a function component returning <div />.`,
    hint: `export function DayBoard() {
  return <div />;
}`,
    example_code: `export function BookingsList() {
  return <div />;
}`,
    think_prompt: `This code is not a floating script — it merges into a real component in a real codebase. Every piece you write in the next few steps (the type, the state, the rendered rows, the form) has to live inside one function. What do you name that function, and what is the smallest thing it can return before it has any data at all?`,
    mc_options: ["export function DayBoard() { return <div />; }","Write the JSX first, then wrap it in a function later","Skip the function — a component can be a bare object of props"],
    mc_correct_option: "export function DayBoard() { return <div />; }",
    mc_anchor: "export function DayBoard() { return <div",
    why_this_matters: `A React component is just a function that returns JSX — naming and exporting that shell first is what lets every later step (and a real pull request) attach to something. Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill.`,
    answer_keywords: ["export","function","DayBoard","return"],
    seed_code: `// This becomes a real component in the codebase — start with an empty shell.
`,
    starter_code: `// This becomes a real component in the codebase — start with an empty shell.

`,
    feedback_correct: "Correct — every later step builds inside this shell.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "Start from an empty, exported function component — everything else nests inside it.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `A component is a function that returns JSX. Before it renders any real data, it can return almost nothing at all — an empty element is a perfectly valid starting point.`,
    expected: `export function DayBoard() {
  return <div />;
}
`,
    analog_example: `export function BookingsList() {
  return <div />;
}`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `A component is a function, and a function needs a body before it needs contents. Naming and exporting the shell first — before any data or markup exists — is what turns a lesson's worth of steps into one real, mergeable file instead of loose snippets.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      discover: `export function DayBoard() {
  return <div />;
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `export function DayBoard() {
  return <div />;
}`,
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 7",
    paal: `Define a TypeScript type for one item in a list

MOCK ROW — Day board
  Provider: "Maya"
  Service: "Cut"
  Starts at: "10:00"

Every row also needs a unique \`id\` — not shown in the mock, but required to track, update, and key each item.

Your task: write \`type Appointment\` with \`id\` plus provider, service, startsAt.`,
    hint: `Write a TypeScript type named Appointment with id plus: provider, service, startsAt. Every row also needs id — the mock never shows it, but the list and the API both key off it.`,
    example_code: `export type Guest = {
  id: string;
  name: string;
  note: string;
};`,
    think_prompt: `\`\`\`text
MOCK ROW — Day board
  Provider: "Maya"
  Service: "Cut"
  Starts at: "10:00"
\`\`\`

Every value with a shape needs one type to describe that shape — and a list screen renders many values of the exact same shape, over and over. Looking at the mock row above, what does that shared type need to name — including a field the mock never shows on screen at all?`,
    mc_options: ["Build one type for a single Appointment row (id, provider, service, startsAt)","Lock every screen to final copy and branding before modeling how one row looks","Wait until every backend endpoint exists before rendering any UI"],
    mc_correct_option: "Build one type for a single Appointment row (id, provider, service, startsAt)",
    mc_anchor: "Build one type for a single Appointment ",
    why_this_matters: `Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill. If list rows and form fields do not share one shape, some rows end up missing a field, or the form saves a field the list can never display — a type names that shared shape once, so the compiler catches the mismatch before a user does.`,
    answer_keywords: ["export","type","Appointment","provider","service","startsAt"],
    seed_code: `export function DayBoard() {
  return <div />;
}

// Describe one list item. The list and form will use this type.
`,
    starter_code: `export function DayBoard() {
  return <div />;
}

// Describe one list item. The list and form will use this type.

`,
    feedback_correct: "Correct — one type for one list item.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "Start with a type for one record. Layout and APIs come after the data shape exists.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `A TypeScript type is a contract: it names every field a value must have, so a mismatched shape becomes a compile error instead of a runtime surprise later.`,
    expected: `export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  return <div />;
}
`,
    analog_example: `export type Guest = {
  id: string;
  name: string;
  note: string;
};`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `One shared type is a single source of truth for what a record looks like. When the list, the form, and the API all reference the same type, renaming or removing a field breaks the build immediately — a compiler error, not a bug report from someone who hit it in production. That is the real payoff: refactor safety, not just editor autocomplete.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      discover: `export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  return <div />;
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `Write a TypeScript type named Appointment with id plus: provider, service, startsAt. Every row also needs id — the mock never shows it, but the list and the API both key off it.`,
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 7",
    paal: `Store a list in React state with useState so the UI re-renders

LIST — Day board
  Maya
  Cut

Your task: hold appointments in state that React watches, typed as Appointment[], starting empty.`,
    hint: `useState<Appointment[]>([]). Import useState.`,
    example_code: `const [guests, setGuests] = useState<Guest[]>([]);`,
    think_prompt: `\`\`\`text
LIST — Day board
  Maya
  Cut   (grows by one every time add is used)
\`\`\`

React only redraws a component when the value it reads changes through React itself — a plain variable can change without React ever finding out. Where should this growing array live so the screen actually redraws every time a row is added?`,
    mc_options: ["const [appointments, setAppointments] = useState<Appointment[]>([]);","let appointments = [];","const appointments = fetch('/api');"],
    mc_correct_option: "const [appointments, setAppointments] = useState<Appointment[]>([]);",
    mc_anchor: "const [appointments, setAppointments] = ",
    why_this_matters: `A plain array in a variable will not make React redraw — useState is the list the screen actually watches. Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill.`,
    answer_keywords: ["useState","appointments","setAppointments","Appointment"],
    seed_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  return <div />;
}
`,
    starter_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  // list state here
  return <div />;
}
`,
    feedback_correct: "Correct — keep going.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "List data must live in useState, not a bare let or an un-awaited fetch.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `To re-render a component, we need to update the value it watches through React's own state mechanism — a hook that both holds the current value and gives you a setter to update it.`,
    expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return <div />;
}
`,
    analog_example: `const [guests, setGuests] = useState<Guest[]>([]);`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `A plain variable and a piece of React state can hold the identical value, yet behave completely differently: mutating a variable is invisible to React, while calling a state setter schedules a re-render. State is not just storage — it is storage React is subscribed to.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      discover: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return <div />;
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `useState<Appointment[]>([]). Import useState.`,
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 7",
    paal: `Filter the list in the UI so only matching rows render

LIST (filtered) — Day board
  Maya
  Cut

Your task: render appointments.filter(...) mapped to rows — keep the full array in state, only narrow what's displayed.`,
    hint: `appointments.filter(...).map(...)`,
    example_code: `return (
  <ul>
    {guests.filter((g) => g.note.includes(q)).map((g) => (
      <li key={g.id}>{g.name}</li>
    ))}
  </ul>
);`,
    think_prompt: `\`\`\`text
LIST (filtered) — Day board
  Maya
  Cut   (only rows matching the current filter)
\`\`\`

Filtering for display means computing a smaller array from the full one with .filter() — the state array itself never loses any rows. How do you keep the complete appointments list in state but only render the subset above?`,
    mc_options: ["keep full list in state; filter before map for display","delete non-matching rows from state permanently","hide the list and show only alerts"],
    mc_correct_option: "keep full list in state; filter before map for display",
    mc_anchor: "keep full list in state; filter before m",
    why_this_matters: `Filtering in render (or with a derived array) lets users scan what matters without deleting other rows from state. Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill.`,
    answer_keywords: ["filter","map","appointments"],
    seed_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return <div />;
}
`,
    starter_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <ul>
      {/* map rows */}
    </ul>
  );
}
`,
    feedback_correct: "Correct — keep going.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "Filter for display; do not destroy the source list.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `Filtering an array for display and mutating the array in state are two different operations — .filter() always returns a brand-new array and never touches the one it was called on.`,
    expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <ul>
      {appointments.map((a) => (
        <li key={a.id}>{a.provider}</li>
      ))}
    </ul>
  );
}
`,
    analog_example: `return (
  <ul>
    {guests.filter((g) => g.note.includes(q)).map((g) => (
      <li key={g.id}>{g.name}</li>
    ))}
  </ul>
);`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `.filter() followed by .map() is a pipeline, not a special React trick: narrow the array down to what should render, then turn what's left into rows. The state array underneath never shrinks — only the rendered subset does — so switching or clearing the filter always has the full data to fall back to.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      discover: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <ul>
      {appointments.map((a) => (
        <li key={a.id}>{a.provider}</li>
      ))}
    </ul>
  );
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `appointments.filter(...).map(...)`,
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 7",
    paal: `Show an empty message when the list has no items

EMPTY — Day board
  "No appointments for this filter."

Your task: render the empty message above when appointments.length === 0, and the mapped rows otherwise.`,
    hint: `appointments.length === 0 ? <p>No appointments for this filter.</p> : <ul>...</ul>`,
    example_code: `guests.length === 0 ? <p>No names yet.</p> : <ul>...</ul>`,
    think_prompt: `\`\`\`text
EMPTY — Day board
  "No appointments for this filter."
\`\`\`

An array with zero items is a valid, common state — code that only knows how to map rows renders nothing at all when the array is empty, with no explanation for the user. When should the UI show the empty message above instead of the (empty) list?`,
    mc_options: ["if length === 0 show empty message, else map the list","always show both empty message and the list","throw if the list is empty"],
    mc_correct_option: "if length === 0 show empty message, else map the list",
    mc_anchor: "if length === 0 show empty message, else",
    why_this_matters: `An empty list should not look broken — a clear empty state tells the user they can add the first row. Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill.`,
    answer_keywords: ["length","===","0","No"],
    seed_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments] = useState<Appointment[]>([]);
  return <ul>{appointments.map((a) => <li key={a.id}>{a.provider}</li>)}</ul>;
}
`,
    starter_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments] = useState<Appointment[]>([]);
  return (
    <div>
      {/* empty or list */}
    </div>
  );
}
`,
    feedback_correct: "Correct — keep going.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "Branch on length before mapping.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `Checking a number against zero before deciding what to render is an ordinary conditional — the empty case and the list case are just two branches of the same render.`,
    expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments] = useState<Appointment[]>([]);
  return (
    <div>
      {appointments.length === 0 ? (
        <p>No appointments for this filter.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{a.provider}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
    analog_example: `guests.length === 0 ? <p>No names yet.</p> : <ul>...</ul>`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `An empty state is not a missing feature to bolt on later — it is one of exactly two branches every list render has from the start (zero items, or some items). Treating it as a first-class branch, not an afterthought, is what keeps a brand-new account from looking like a broken one.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      discover: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments] = useState<Appointment[]>([]);
  return (
    <div>
      {appointments.length === 0 ? (
        <p>No appointments for this filter.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{a.provider}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `appointments.length === 0 ? <p>No appointments for this filter.</p> : <ul>...</ul>`,
    },
  },
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 7",
    paal: `Wire controlled inputs so form fields live in React state

FORM — Day board
  [ Provider ]  [ Service ]  [ Starts at ]   → Add

Your task: add one state value per field (provider, service, startsAt), then wire each input's value and onChange to it.`,
    hint: `useState("") per field; value={...} onChange sets that state.`,
    example_code: `const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />`,
    think_prompt: `\`\`\`text
FORM — Day board
  [ Provider ]  [ Service ]  [ Starts at ]   → Add
\`\`\`

A form field's text can live in the DOM itself (uncontrolled) or in React state (controlled) — a controlled input reads its value from state and writes every keystroke back into that same state. Where does each field's typed text need to live so what you type is exactly what submit will save?`,
    mc_options: ["value from state, onChange writes back to state","read the input only on submit via document.getElementById","store the DOM node in a global"],
    mc_correct_option: "value from state, onChange writes back to state",
    mc_anchor: "value from state, onChange writes back t",
    why_this_matters: `Controlled inputs use value from state and onChange to write back, keeping the form and the submit payload in sync. Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill.`,
    answer_keywords: ["useState","value=","onChange","provider","service","startsAt"],
    seed_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return <form />;
}
`,
    starter_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // field state
  return (
    <form>
      {/* inputs */}
    </form>
  );
}
`,
    feedback_correct: "Correct — keep going.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "Controlled inputs: value and onChange both talk to React state.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `In a functional component, a piece of typed text is just another value that can live in state — the input's value prop reads it back out, and onChange is the only place that ever changes it.`,
    expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  return (
    <form>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
    </form>
  );
}
`,
    analog_example: `const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `Controlled vs. uncontrolled is a real, ongoing choice in React forms, not just boilerplate — a controlled input makes React the single source of truth for what is on screen, so validation, clearing, and reading the value on submit are all just state reads, not DOM queries.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      discover: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  return (
    <form>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
    </form>
  );
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `useState("") per field; value={...} onChange sets that state.`,
    },
  },
  {
    id: "step7",
    type: "question",
    phase: "Step 7 of 7",
    paal: `On submit, preventDefault, append one item to the list, and clear the form

FORM — Day board
  [ Provider ]  [ Service ]  [ Starts at ]   → Add

Your task: on submit: call preventDefault, build a new Appointment from the field state, add it to appointments without mutating the old array, then clear the fields.`,
    hint: `e.preventDefault(); setAppointments((prev) => [...prev, { id: String(Date.now()), provider, service, startsAt }]); then clear fields.`,
    example_code: `setGuests((prev) => [...prev, { id: String(Date.now()), name, note }]);`,
    think_prompt: `\`\`\`text
FORM — Day board
  [ Provider ]  [ Service ]  [ Starts at ]   → Add
  (stays on the page — the new row appears in the list above)
\`\`\`

Submitting an HTML form reloads the page by default; canceling that default lets your own handler run instead, and adding to a list in state means building a new array rather than mutating the old one. Given that, what has to happen, in order, when Add is used?`,
    mc_options: ["preventDefault, append one item, clear fields","window.location.reload after every submit","only console.log the form values"],
    mc_correct_option: "preventDefault, append one item, clear fields",
    mc_anchor: "preventDefault, append one item, clear f",
    why_this_matters: `preventDefault stops navigation; copying the old list plus one new item, then clearing fields, matches the design mock behavior. Operators scan one provider's day. Filtering a list without destroying the full dataset is a core frontend skill.`,
    answer_keywords: ["preventDefault","setAppointments","prev","provider","service","startsAt"],
    seed_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  return (
    <div>
      {appointments.length === 0 ? <p>No appointments for this filter.</p> : <ul>{appointments.map((a) => <li key={a.id}>{a.provider} · {a.service} · {a.startsAt}</li>)}</ul>}
      <form>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
      </form>
    </div>
  );
}
`,
    starter_code: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  function onSubmit(e: React.FormEvent) {
    // submit
  }
  return (
    <div>
      {appointments.length === 0 ? <p>No appointments for this filter.</p> : <ul>{appointments.map((a) => <li key={a.id}>{a.provider} · {a.service} · {a.startsAt}</li>)}</ul>}
      <form onSubmit={onSubmit}>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
`,
    feedback_correct: "Correct — submit updates list state without a reload.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "Stay on the page, grow the list, reset the form.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `A submit handler runs in a fixed order: stop the default page reload, build the new record from the current field values, add it to state without mutating the old array, then clear the fields for the next entry.`,
    expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Appointment = { id: String(Date.now()), provider, service, startsAt };
    setAppointments((prev) => [...prev, next]);
    setProvider("");
    setService("");
    setStartsAt("");
  }
  return (
    <div>
      {appointments.length === 0 ? (
        <p>No appointments for this filter.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{a.provider} · {a.service} · {a.startsAt}</li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit}>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
`,
    analog_example: `setGuests((prev) => [...prev, { id: String(Date.now()), name, note }]);`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `Every controlled form in React follows the same submit shape — cancel the default, derive the new record, update state immutably, reset the inputs — regardless of what the record actually contains. Learning that shape once means every future "add to a list" form is the same four moves with different field names.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists appointments and a form to add one:

  List     →  each row is one Appointment
  Empty    →  a message when the list has no items
  Form     →  Provider, Service, Starts at
  Submit   →  the new row appears on the list
  Filter   →  only matching rows render — the full list stays in state
`,
      discover: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function DayBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Appointment = { id: String(Date.now()), provider, service, startsAt };
    setAppointments((prev) => [...prev, next]);
    setProvider("");
    setService("");
    setStartsAt("");
  }
  return (
    <div>
      {appointments.length === 0 ? (
        <p>No appointments for this filter.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{a.provider} · {a.service} · {a.startsAt}</li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit}>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `e.preventDefault(); setAppointments((prev) => [...prev, { id: String(Date.now()), provider, service, startsAt }]); then clear fields.`,
    },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
  { label: "Step 4", id: "step4" },
  { label: "Step 5", id: "step5" },
  { label: "Step 6", id: "step6" },
  { label: "Step 7", id: "step7" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 0,
  title: "Day board: filter appointments by provider",
  shortName: "Day board FE",
});

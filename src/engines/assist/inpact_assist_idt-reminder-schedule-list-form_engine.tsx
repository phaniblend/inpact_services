import createINPACTEngine from "../inpact_engine_shared";

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "idt-reminder-schedule-list-form",
      title: "Reminder schedule list + create form",
      body: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      usecase: "No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites.",
      designMock: {"kind":"list-and-form","screenTitle":"Reminders","caption":"This is the screen you are building. Match the pieces — list, empty message, form, submit — not the brand colors. Try typing and submitting.","listCaption":"LIST — sample rows","emptyCaption":"EMPTY — when there are no rows","emptyMessage":"No reminders scheduled.","rows":[{"title":"Alex","subtitle":"sms","meta":"Fri 9:00"},{"title":"Second row","subtitle":"Another","meta":"Fri 9:00"}],"fields":[{"label":"Client","sample":"Alex"},{"label":"Channel","sample":"sms"},{"label":"Send at","sample":"Fri 9:00"}],"submitLabel":"Schedule"},
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: ["Define the component function shell this code will live in","Define a TypeScript type for one item in a list","Store a list in React state with useState so the UI re-renders","Render each item in a list as a row with a stable key","Show an empty message when the list has no items","Wire controlled inputs so form fields live in React state","On submit, preventDefault, append one item to the list, and clear the form"],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 7",
    paal: `Every step from here on adds to one function. Write and export a function named \`ReminderHub\` that returns \`<div />\`.

Your task: define and export ReminderHub as a function component returning <div />.`,
    hint: `export function ReminderHub() {
  return <div />;
}`,
    example_code: `export function BookingsList() {
  return <div />;
}`,
    think_prompt: `This code is not a floating script — it merges into a real component in a real codebase. Every piece you write in the next few steps (the type, the state, the rendered rows, the form) has to live inside one function. What do you name that function, and what is the smallest thing it can return before it has any data at all?`,
    mc_options: ["export function ReminderHub() { return <div />; }","Write the JSX first, then wrap it in a function later","Skip the function — a component can be a bare object of props"],
    mc_correct_option: "export function ReminderHub() { return <div />; }",
    mc_anchor: "export function ReminderHub() { return <",
    why_this_matters: `A React component is just a function that returns JSX — naming and exporting that shell first is what lets every later step (and a real pull request) attach to something. No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites.`,
    answer_keywords: ["export","function","ReminderHub","return"],
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
    expected: `export function ReminderHub() {
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
      mentalModel: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      discover: `export function ReminderHub() {
  return <div />;
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `export function ReminderHub() {
  return <div />;
}`,
    },
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 7",
    paal: `Define a TypeScript type for one item in a list

MOCK ROW — Reminders
  Client: "Alex"
  Channel: "sms"
  Send at: "Fri 9:00"

Every row also needs a unique \`id\` — not shown in the mock, but required to track, update, and key each item.

Your task: write \`type ScheduledReminder\` with \`id\` plus client, channel, sendAt.`,
    hint: `Write a TypeScript type named ScheduledReminder with id plus: client, channel, sendAt. Every row also needs id — the mock never shows it, but the list and the API both key off it.`,
    example_code: `export type Guest = {
  id: string;
  name: string;
  note: string;
};`,
    think_prompt: `\`\`\`text
MOCK ROW — Reminders
  Client: "Alex"
  Channel: "sms"
  Send at: "Fri 9:00"
\`\`\`

Every value with a shape needs one type to describe that shape — and a list screen renders many values of the exact same shape, over and over. Looking at the mock row above, what does that shared type need to name — including a field the mock never shows on screen at all?`,
    mc_options: ["Build one type for a single ScheduledReminder row (id, client, channel, sendAt)","Lock every screen to final copy and branding before modeling how one row looks","Wait until every backend endpoint exists before rendering any UI"],
    mc_correct_option: "Build one type for a single ScheduledReminder row (id, client, channel, sendAt)",
    mc_anchor: "Build one type for a single ScheduledRem",
    why_this_matters: `No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites. If list rows and form fields do not share one shape, some rows end up missing a field, or the form saves a field the list can never display — a type names that shared shape once, so the compiler catches the mismatch before a user does.`,
    answer_keywords: ["export","type","ScheduledReminder","client","channel","sendAt"],
    seed_code: `export function ReminderHub() {
  return <div />;
}

// Describe one list item. The list and form will use this type.
`,
    starter_code: `export function ReminderHub() {
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
    expected: `export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
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
      mentalModel: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      discover: `export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  return <div />;
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `Write a TypeScript type named ScheduledReminder with id plus: client, channel, sendAt. Every row also needs id — the mock never shows it, but the list and the API both key off it.`,
    },
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 7",
    paal: `Store a list in React state with useState so the UI re-renders

LIST — Reminders
  Alex
  sms

Your task: hold reminders in state that React watches, typed as ScheduledReminder[], starting empty.`,
    hint: `useState<ScheduledReminder[]>([]). Import useState.`,
    example_code: `const [guests, setGuests] = useState<Guest[]>([]);`,
    think_prompt: `\`\`\`text
LIST — Reminders
  Alex
  sms   (grows by one every time schedule is used)
\`\`\`

React only redraws a component when the value it reads changes through React itself — a plain variable can change without React ever finding out. Where should this growing array live so the screen actually redraws every time a row is added?`,
    mc_options: ["const [reminders, setReminders] = useState<ScheduledReminder[]>([]);","let reminders = [];","const reminders = fetch('/api');"],
    mc_correct_option: "const [reminders, setReminders] = useState<ScheduledReminder[]>([]);",
    mc_anchor: "const [reminders, setReminders] = useSta",
    why_this_matters: `A plain array in a variable will not make React redraw — useState is the list the screen actually watches. No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites.`,
    answer_keywords: ["useState","reminders","setReminders","ScheduledReminder"],
    seed_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  return <div />;
}
`,
    starter_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
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

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
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
      mentalModel: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      discover: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  return <div />;
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `useState<ScheduledReminder[]>([]). Import useState.`,
    },
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 7",
    paal: `Render each item in a list as a row with a stable key

LIST — Reminders
  Alex
  sms

Your task: now that you have the data as an array you can iterate over, return the JSX that renders each item as a row with key={item.id}.`,
    hint: `reminders.map((a) => <li key={a.id}>...</li>)`,
    example_code: `return (
  <ul>
    {guests.map((g) => (
      <li key={g.id}>{g.name}</li>
    ))}
  </ul>
);`,
    think_prompt: `\`\`\`text
LIST — Reminders
  Alex
  sms
\`\`\`

Turning an array into UI is a mapping operation — one array item becomes one rendered element — and React needs a stable identifier per element to tell rows apart across re-renders. You already have the array in state. How do you turn it into the stacked rows shown above?`,
    mc_options: ["map each item to a row and set key={item.id}","print the array with JSON.stringify in one <p>","hard-code three <li> tags and ignore state"],
    mc_correct_option: "map each item to a row and set key={item.id}",
    mc_anchor: "map each item to a row and set key={item",
    why_this_matters: `map() walks the array and returns one element per item; a stable key tells React which row is which when the list changes. No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites.`,
    answer_keywords: ["map","key","a.id","reminders"],
    seed_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  return <div />;
}
`,
    starter_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  return (
    <ul>
      {/* map rows */}
    </ul>
  );
}
`,
    feedback_correct: "Correct — keep going.",
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: "Use map + a stable key from the item id.",
    // Fix 2: shown pre-check (before CHECK MY CODE has run on this step) instead of the
    // generic fallback feedback text — a lightweight, non-answer-revealing conceptual hint.
    pre_check_hint: `Now that you have the data as an array you can iterate over, JSX only works inside a return (or an assignment) — so the mapped rows have to be handed back with return, not left as a bare expression.`,
    expected: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  return (
    <ul>
      {reminders.map((a) => (
        <li key={a.id}>{a.client}</li>
      ))}
    </ul>
  );
}
`,
    analog_example: `return (
  <ul>
    {guests.map((g) => (
      <li key={g.id}>{g.name}</li>
    ))}
  </ul>
);`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      // Fix 7: lead with the general concept (why a shared pattern matters), not the task
      // instruction restated verbatim.
      hook: `map() over an array of data and map() over an array of JSX elements are the same operation — the only difference is what you return from the callback. A stable key is what lets React reuse a row's DOM node instead of tearing it down and rebuilding it when the array changes.`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      discover: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  return (
    <ul>
      {reminders.map((a) => (
        <li key={a.id}>{a.client}</li>
      ))}
    </ul>
  );
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `reminders.map((a) => <li key={a.id}>...</li>)`,
    },
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 7",
    paal: `Show an empty message when the list has no items

EMPTY — Reminders
  "No reminders scheduled."

Your task: render the empty message above when reminders.length === 0, and the mapped rows otherwise.`,
    hint: `reminders.length === 0 ? <p>No reminders scheduled.</p> : <ul>...</ul>`,
    example_code: `guests.length === 0 ? <p>No names yet.</p> : <ul>...</ul>`,
    think_prompt: `\`\`\`text
EMPTY — Reminders
  "No reminders scheduled."
\`\`\`

An array with zero items is a valid, common state — code that only knows how to map rows renders nothing at all when the array is empty, with no explanation for the user. When should the UI show the empty message above instead of the (empty) list?`,
    mc_options: ["if length === 0 show empty message, else map the list","always show both empty message and the list","throw if the list is empty"],
    mc_correct_option: "if length === 0 show empty message, else map the list",
    mc_anchor: "if length === 0 show empty message, else",
    why_this_matters: `An empty list should not look broken — a clear empty state tells the user they can add the first row. No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites.`,
    answer_keywords: ["length","===","0","No"],
    seed_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders] = useState<ScheduledReminder[]>([]);
  return <ul>{reminders.map((a) => <li key={a.id}>{a.client}</li>)}</ul>;
}
`,
    starter_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders] = useState<ScheduledReminder[]>([]);
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

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders] = useState<ScheduledReminder[]>([]);
  return (
    <div>
      {reminders.length === 0 ? (
        <p>No reminders scheduled.</p>
      ) : (
        <ul>
          {reminders.map((a) => (
            <li key={a.id}>{a.client}</li>
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
      mentalModel: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      discover: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders] = useState<ScheduledReminder[]>([]);
  return (
    <div>
      {reminders.length === 0 ? (
        <p>No reminders scheduled.</p>
      ) : (
        <ul>
          {reminders.map((a) => (
            <li key={a.id}>{a.client}</li>
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
      build: `reminders.length === 0 ? <p>No reminders scheduled.</p> : <ul>...</ul>`,
    },
  },
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 7",
    paal: `Wire controlled inputs so form fields live in React state

FORM — Reminders
  [ Client ]  [ Channel ]  [ Send at ]   → Schedule

Your task: add one state value per field (client, channel, sendAt), then wire each input's value and onChange to it.`,
    hint: `useState("") per field; value={...} onChange sets that state.`,
    example_code: `const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />`,
    think_prompt: `\`\`\`text
FORM — Reminders
  [ Client ]  [ Channel ]  [ Send at ]   → Schedule
\`\`\`

A form field's text can live in the DOM itself (uncontrolled) or in React state (controlled) — a controlled input reads its value from state and writes every keystroke back into that same state. Where does each field's typed text need to live so what you type is exactly what submit will save?`,
    mc_options: ["value from state, onChange writes back to state","read the input only on submit via document.getElementById","store the DOM node in a global"],
    mc_correct_option: "value from state, onChange writes back to state",
    mc_anchor: "value from state, onChange writes back t",
    why_this_matters: `Controlled inputs use value from state and onChange to write back, keeping the form and the submit payload in sync. No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites.`,
    answer_keywords: ["useState","value=","onChange","client","channel","sendAt"],
    seed_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  return <form />;
}
`,
    starter_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
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

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [client, setClient] = useState("");
  const [channel, setChannel] = useState("");
  const [sendAt, setSendAt] = useState("");
  return (
    <form>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel" />
        <input value={sendAt} onChange={(e) => setSendAt(e.target.value)} placeholder="Send at" />
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
      mentalModel: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      discover: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [client, setClient] = useState("");
  const [channel, setChannel] = useState("");
  const [sendAt, setSendAt] = useState("");
  return (
    <form>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel" />
        <input value={sendAt} onChange={(e) => setSendAt(e.target.value)} placeholder="Send at" />
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

FORM — Reminders
  [ Client ]  [ Channel ]  [ Send at ]   → Schedule

Your task: on submit: call preventDefault, build a new ScheduledReminder from the field state, add it to reminders without mutating the old array, then clear the fields.`,
    hint: `e.preventDefault(); setReminders((prev) => [...prev, { id: String(Date.now()), client, channel, sendAt }]); then clear fields.`,
    example_code: `setGuests((prev) => [...prev, { id: String(Date.now()), name, note }]);`,
    think_prompt: `\`\`\`text
FORM — Reminders
  [ Client ]  [ Channel ]  [ Send at ]   → Schedule
  (stays on the page — the new row appears in the list above)
\`\`\`

Submitting an HTML form reloads the page by default; canceling that default lets your own handler run instead, and adding to a list in state means building a new array rather than mutating the old one. Given that, what has to happen, in order, when Schedule is used?`,
    mc_options: ["preventDefault, append one item, clear fields","window.location.reload after every submit","only console.log the form values"],
    mc_correct_option: "preventDefault, append one item, clear fields",
    mc_anchor: "preventDefault, append one item, clear f",
    why_this_matters: `preventDefault stops navigation; copying the old list plus one new item, then clearing fields, matches the design mock behavior. No-shows and forgotten nudges cost money. A reminder list+form is the light desk before SMS suites.`,
    answer_keywords: ["preventDefault","setReminders","prev","client","channel","sendAt"],
    seed_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [client, setClient] = useState("");
  const [channel, setChannel] = useState("");
  const [sendAt, setSendAt] = useState("");
  return (
    <div>
      {reminders.length === 0 ? <p>No reminders scheduled.</p> : <ul>{reminders.map((a) => <li key={a.id}>{a.client} · {a.channel} · {a.sendAt}</li>)}</ul>}
      <form>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel" />
        <input value={sendAt} onChange={(e) => setSendAt(e.target.value)} placeholder="Send at" />
      </form>
    </div>
  );
}
`,
    starter_code: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [client, setClient] = useState("");
  const [channel, setChannel] = useState("");
  const [sendAt, setSendAt] = useState("");
  function onSubmit(e: React.FormEvent) {
    // submit
  }
  return (
    <div>
      {reminders.length === 0 ? <p>No reminders scheduled.</p> : <ul>{reminders.map((a) => <li key={a.id}>{a.client} · {a.channel} · {a.sendAt}</li>)}</ul>}
      <form onSubmit={onSubmit}>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel" />
        <input value={sendAt} onChange={(e) => setSendAt(e.target.value)} placeholder="Send at" />
        <button type="submit">Schedule</button>
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

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [client, setClient] = useState("");
  const [channel, setChannel] = useState("");
  const [sendAt, setSendAt] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: ScheduledReminder = { id: String(Date.now()), client, channel, sendAt };
    setReminders((prev) => [...prev, next]);
    setClient("");
    setChannel("");
    setSendAt("");
  }
  return (
    <div>
      {reminders.length === 0 ? (
        <p>No reminders scheduled.</p>
      ) : (
        <ul>
          {reminders.map((a) => (
            <li key={a.id}>{a.client} · {a.channel} · {a.sendAt}</li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit}>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel" />
        <input value={sendAt} onChange={(e) => setSendAt(e.target.value)} placeholder="Send at" />
        <button type="submit">Schedule</button>
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
      mentalModel: `Build a screen that lists reminders and a form to add one:

  List     →  each row is one ScheduledReminder
  Empty    →  a message when the list has no items
  Form     →  Client, Channel, Send at
  Submit   →  the new row appears on the list
`,
      discover: `import { useState } from "react";

export type ScheduledReminder = {
  id: string;
  client: string;
  channel: string;
  sendAt: string;
};

export function ReminderHub() {
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [client, setClient] = useState("");
  const [channel, setChannel] = useState("");
  const [sendAt, setSendAt] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: ScheduledReminder = { id: String(Date.now()), client, channel, sendAt };
    setReminders((prev) => [...prev, next]);
    setClient("");
    setChannel("");
    setSendAt("");
  }
  return (
    <div>
      {reminders.length === 0 ? (
        <p>No reminders scheduled.</p>
      ) : (
        <ul>
          {reminders.map((a) => (
            <li key={a.id}>{a.client} · {a.channel} · {a.sendAt}</li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit}>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="Channel" />
        <input value={sendAt} onChange={(e) => setSendAt(e.target.value)} placeholder="Send at" />
        <button type="submit">Schedule</button>
      </form>
    </div>
  );
}
`,
      quickRules: "- One skill per step\n- Name the skill, not the product noun\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: `e.preventDefault(); setReminders((prev) => [...prev, { id: String(Date.now()), client, channel, sendAt }]); then clear fields.`,
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
  title: "Reminder schedule list + create form",
  shortName: "Reminder FE",
});

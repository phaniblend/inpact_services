/**
 * IDT-ordered Coding Assist lessons for the original INPACT engine.
 *
 * Pedagogy:
 *  - Inverse Dependency Tracing decides ORDER (start at the first leaf, climb to the goal).
 *  - The Assist MODULE is one LESSON (a parent chunk — e.g. "shape the domain + use it").
 *  - Deepest leaves (import z, a single interface) are STEPS inside that lesson, like
 *    Vue Counter App (001_Counter_App_lesson.json): import → structure → state → handlers → UI.
 *  - Analogous story uses everyday nouns (name list, one seat, late task), same shape.
 *
 * Run: node scripts/write-idt-inpact-assist-engines.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { assertValidModule } from "../src/id-module/generateModule.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSIST_DIR = path.resolve(__dirname, "../src/engines/assist");

function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const MODULES = [
  {
    tag: "idt-booking-appointment-list-form",
    title: "Appointment list + book form",
    shortName: "Book list+form",
    analog: "Name list (list + add form)",
    concept: `Build a screen that lists appointments and a form to book one:

  List     →  each row is one appointment (provider, service, time)
  Empty    →  a message when the list has no items
  Form     →  provider, service, startsAt
  Submit   →  the new appointment appears on the list`,
    usecase:
      "Most web apps need a screen that lists data as rows you can scan — people, orders, tickets, cities in a table. You also need a form to add a new row, and a clear message when the list is empty. That list-plus-form screen is what you are learning here.",
    designMock: {
      kind: "list-and-form",
      screenTitle: "Bookings",
      caption: "This is the screen you are building. Match the pieces — list, empty message, form, submit — not the brand colors.",
      listCaption: "LIST — two sample rows",
      emptyCaption: "EMPTY — when there are no rows",
      emptyMessage: "No appointments yet.",
      rows: [
        { title: "Color & cut", subtitle: "Maya", meta: "Tue 2:00 PM" },
        { title: "Beard trim", subtitle: "Luis", meta: "Tue 3:30 PM" },
      ],
      fields: [
        { label: "Provider", sample: "Maya" },
        { label: "Service", sample: "Color & cut" },
        { label: "Starts at", sample: "Tue 2:00 PM" },
      ],
      submitLabel: "Book",
    },
    steps: [
      {
        paal: "Define a TypeScript type for one item in a list",
        think: "On the first Lesson screen you saw a picture of the Bookings page (the box labeled DESIGN MOCK). In that picture every row shows the same three facts — who, what service, and when — and the form asks for those same three. How do we lock that so every row (and every submit) uses one shared shape, instead of inventing fields as we go?",
        why: "If list rows and form fields do not share one shape, some rows will be missing a time, or the form will save a field the list cannot show. A type is how we name that shared shape once.",
        hint: "Write a TypeScript type named Appointment with id, provider, service, and startsAt (ISO string).",
        analog: `// Same idea: a type for one name on a list
export type Guest = {
  id: string;
  name: string;
  note: string;
};`,
        seed: `// Describe one list item. The list and form will use this type.
`,
        starter: `// Describe one list item. The list and form will use this type.

`,
        expected: `export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};
`,
        keywords: ["export", "type", "Appointment", "provider", "service", "startsAt"],
        mc: [
          "Build one type for a single appointment row (id, provider, service, startsAt)",
          "Lock every screen to final copy and branding before modeling how one row looks",
          "Wait until every backend endpoint exists before rendering any UI",
        ],
        correct: "Build one type for a single appointment row (id, provider, service, startsAt)",
        wrong: "Start with a type for one record. Layout and APIs come after the data shape exists.",
        ok: "Correct — one type for one list item.",
      },
      {
        paal: "Store a list in React state with useState so the UI re-renders",
        think: "Go back to that Bookings picture on the first Lesson screen. Clicking Book should add another row while you stay on the page — it is not a still photo. Where should that growing list live inside the component so the screen redraws when a booking is added?",
        why: "A plain array in a variable will not make React redraw. useState is the list the screen actually watches.",
        hint: "useState<Appointment[]>([]). Import useState.",
        analog: `const [guests, setGuests] = useState<Guest[]>([]);`,
        seed: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  return <div className="booking-desk" />;
}
`,
        starter: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  // list state here
  return <div className="booking-desk" />;
}
`,
        expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return <div className="booking-desk" />;
}
`,
        keywords: ["useState", "appointments", "setAppointments", "Appointment"],
        mc: [
          "const [appointments, setAppointments] = useState<Appointment[]>([]);",
          "let appointments = [];",
          "const appointments = fetch('/appointments');",
        ],
        correct: "const [appointments, setAppointments] = useState<Appointment[]>([]);",
        wrong: "List data must live in useState, not a bare let or an un-awaited fetch.",
      },
      {
        paal: "Render each item in a list as a row with a stable key",
        think: "In the Bookings picture on the first Lesson screen, the list is not one blob of text — it is one row per appointment, stacked. You already have an array. How do you turn that array into those separate rows on the screen?",
        why: "map() walks the array and returns one element per item. A stable key tells React which row is which when the list changes.",
        hint: "appointments.map((a) => <li key={a.id}>...)</li>",
        analog: `guests.map((g) => <li key={g.id}>{g.name}</li>)`,
        seed: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return <div className="booking-desk" />;
}
`,
        starter: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <div className="booking-desk">
      {/* list rows */}
    </div>
  );
}
`,
        expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <div className="booking-desk">
      <ul>
        {appointments.map((a) => (
          <li key={a.id}>
            {a.service} with {a.provider} at {a.startsAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
        keywords: ["map", "key", "a.id", "appointments"],
        mc: [
          "appointments.map((a) => <li key={a.id}>{a.service}</li>)",
          "appointments.forEach((a) => document.write(a.service))",
          "<li>{appointments}</li>",
        ],
        correct: "appointments.map((a) => <li key={a.id}>{a.service}</li>)",
        wrong: "Use map to produce elements, and key={a.id} so React can track rows.",
      },
      {
        paal: "Show an empty state when the list has no items",
        think: "That same Bookings picture on the first Lesson screen also showed a dashed box: “No appointments yet.” A blank white page would look like a bug. When the array has no items, what should the screen show instead of the list?",
        why: "Empty is a real screen, not a missing screen. Show a short message when length is 0; show the rows when it is not.",
        hint: "If appointments.length === 0, show a short message; else the list.",
        analog: `{guests.length === 0 ? <p>No names yet.</p> : <ul>...</ul>}`,
        seed: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <div className="booking-desk">
      <ul>
        {appointments.map((a) => (
          <li key={a.id}>
            {a.service} with {a.provider} at {a.startsAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
        starter: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <div className="booking-desk">
      {/* empty state + list */}
    </div>
  );
}
`,
        expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <div className="booking-desk">
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>
              {a.service} with {a.provider} at {a.startsAt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
        keywords: ["length", "===", "0", "No appointments"],
        mc: [
          "if length is 0, render a message; otherwise render the list",
          "hide the whole app until data exists",
          "throw if the array is empty",
        ],
        correct: "if length is 0, render a message; otherwise render the list",
        wrong: "Empty is a state you render, not an error and not a blank page.",
      },
      {
        paal: "Bind form inputs to React state with value and onChange",
        think: "In the Bookings picture on the first Lesson screen, the form has three boxes: provider, service, starts at. As someone types, those boxes should keep the text. How do we store what is in each box so Submit can read it?",
        why: "If the input keeps its own value, React cannot see it on submit. value plus onChange keeps the typed text in state — one source of truth.",
        hint: "Three useState strings. Each input: value={...} onChange={(e) => set...(e.target.value)}.",
        analog: `const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />`,
        seed: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  return (
    <div className="booking-desk">
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>
              {a.service} with {a.provider} at {a.startsAt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
        starter: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // form fields
  return (
    <div className="booking-desk">
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{a.service}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
        expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  return (
    <div className="booking-desk">
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>
              {a.service} with {a.provider} at {a.startsAt}
            </li>
          ))}
        </ul>
      )}
      <form>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
      </form>
    </div>
  );
}
`,
        keywords: ["setProvider", "value={provider}", "onChange", "setService", "setStartsAt"],
        mc: [
          "value from state, onChange writes back to state",
          "read the input only on submit via document.getElementById",
          "store the DOM node in a global",
        ],
        correct: "value from state, onChange writes back to state",
        wrong: "Controlled inputs: value and onChange both talk to React state.",
      },
      {
        paal: "On submit, preventDefault, append one item to the list, and clear the form",
        think: "In the Bookings picture on the first Lesson screen, Book does not leave the page. The new appointment should appear as a new row, and the form should clear. What has to happen on submit so the list grows without a reload?",
        why: "preventDefault stops the browser from navigating away. Copying the old list plus one new item, then clearing the fields, is how that Lesson-screen picture behaves.",
        hint: "e.preventDefault(); setAppointments((prev) => [...prev, { id: String(Date.now()), provider, service, startsAt }]); then set fields to \"\".",
        analog: `setGuests((prev) => [...prev, { id: String(Date.now()), name, note }]);`,
        seed: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  return (
    <div className="booking-desk">
      {appointments.length === 0 ? <p>No appointments yet.</p> : <ul>{appointments.map((a) => <li key={a.id}>{a.service}</li>)}</ul>}
      <form>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} />
        <input value={service} onChange={(e) => setService(e.target.value)} />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      </form>
    </div>
  );
}
`,
        starter: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [startsAt, setStartsAt] = useState("");
  function onSubmit(e: React.FormEvent) {
    // book
  }
  return (
    <div className="booking-desk">
      {appointments.length === 0 ? <p>No appointments yet.</p> : <ul>{appointments.map((a) => <li key={a.id}>{a.service}</li>)}</ul>}
      <form onSubmit={onSubmit}>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} />
        <input value={service} onChange={(e) => setService(e.target.value)} />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <button type="submit">Book</button>
      </form>
    </div>
  );
}
`,
        expected: `import { useState } from "react";

export type Appointment = {
  id: string;
  provider: string;
  service: string;
  startsAt: string;
};

export function BookingDesk() {
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
    <div className="booking-desk">
      {appointments.length === 0 ? (
        <p>No appointments yet.</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>
              {a.service} with {a.provider} at {a.startsAt}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit}>
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" />
        <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} placeholder="Starts at" />
        <button type="submit">Book</button>
      </form>
    </div>
  );
}
`,
        keywords: ["preventDefault", "setAppointments", "prev", "Book"],
        mc: [
          "preventDefault, append one Appointment to state, clear fields",
          "window.location.reload() after POST",
          "mutate appointments.push() and hope React notices",
        ],
        correct: "preventDefault, append one Appointment to state, clear fields",
        wrong: "Copy-on-write: setAppointments(prev => [...prev, next]). Don't mutate in place.",
        ok: "Correct — the list updates from state after submit.",
      },
    ],
  },
  {
    tag: "idt-booking-appointments-api",
    title: "Appointments API + slot conflicts",
    shortName: "Book API",
    analog: "One seat, one booking",
    concept: `Build an appointments API with one extra rule: overlapping slots for the same provider are rejected.

  GET   →  list stored appointments as JSON
  POST  →  validate fields, reject overlaps, insert if free`,
    usecase: "Most APIs cannot accept every write. If two people try to take the same time — or the same seat — the server must reject the second request. Learning that rule here is how you keep data honest in any product.",
    designMock: {
      kind: "http-api",
      caption: "This is the API you are building. GET lists rows. POST adds a row or returns 409 when the slot overlaps.",
      getLabel: "GET /appointments  →  200",
      postLabel: "POST /appointments  →  201 or 409",
      getSample: `[
  {
    "id": "1",
    "provider": "Maya",
    "service": "Color & cut",
    "startsAt": "2026-08-20T14:00",
    "endsAt": "2026-08-20T15:00"
  }
]`,
      postSample: `{
  "provider": "Maya",
  "service": "Beard trim",
  "startsAt": "2026-08-20T14:30",
  "endsAt": "2026-08-20T15:00"
}

→ 409 { "error": "slot overlap" }`,
    },
    steps: [
      {
        paal: "Create an in-memory array store and an id helper",
        think: "On the first Lesson screen you saw sample GET JSON (the box labeled DESIGN MOCK) — a list of appointments. Before any route exists, those records still need a home. Where should that list live so later GET and POST can read and write the same data?",
        why: "Routes are just doors. The array is the room behind them. Build the room first, then the doors.",
        hint: "let appointments = []. function nextId() { return String(Date.now()); }",
        analog: `let seats = [];
function nextId() { return String(Date.now()); }`,
        seed: `// Store records in memory before adding HTTP routes\n`,
        starter: `// Store records in memory before adding HTTP routes\n`,
        expected: `let appointments = [];

function nextId() {
  return String(Date.now());
}

export function getStore() {
  return appointments;
}
`,
        keywords: ["let", "appointments", "nextId", "getStore"],
        mc: [
          "Create the in-memory store (array + nextId) before any routes",
          "Write Express routing and CORS first, persist later",
          "Skip storage and return hardcoded JSON forever",
        ],
        correct: "Create the in-memory store (array + nextId) before any routes",
        wrong: "Store first. Routes are a later layer.",
      },
      {
        paal: "Validate required fields on a create payload before writing",
        think: "On that same Lesson screen, the POST sample needs provider, service, startsAt, and endsAt. What should the API do if one of those is missing or empty — save a broken row, or refuse the write?",
        why: "A bad row in the store will break every later check. Reject it before insert, with a clear error.",
        hint: "Return an error string or null. Check typeof === 'string' && trim().",
        analog: `function validateSeat(input) {
  if (!input.seatId || !input.name) return "seatId and name required";
  return null;
}`,
        seed: `let appointments = [];
function nextId() { return String(Date.now()); }
export function getStore() { return appointments; }
`,
        starter: `let appointments = [];
function nextId() { return String(Date.now()); }
export function getStore() { return appointments; }

export function validateAppointment(input) {
  // required fields
}
`,
        expected: `let appointments = [];
function nextId() { return String(Date.now()); }
export function getStore() { return appointments; }

export function validateAppointment(input) {
  const fields = ["provider", "service", "startsAt", "endsAt"];
  for (const f of fields) {
    if (typeof input?.[f] !== "string" || !input[f].trim()) return f + " is required";
  }
  return null;
}
`,
        keywords: ["validateAppointment", "provider", "required"],
        mc: [
          "Reject bodies missing required string fields before touching the store",
          "Insert first, validate in a nightly job",
          "Trust the client because the form had required attributes",
        ],
        correct: "Reject bodies missing required string fields before touching the store",
        wrong: "Validate on the server. HTML required is not a security boundary.",
      },
      {
        paal: "Reject a create when it conflicts with an existing record",
        think: "On the first Lesson screen, the DESIGN MOCK showed POST returning 409 when Maya already has 2:00–3:00 and someone books 2:30–3:00. The fields can all be filled in and still be wrong. When should we still refuse the write?",
        why: "Required fields are not enough. Two bookings for the same person at overlapping times cannot both be true. That is the product rule.",
        hint: "Same provider, existing.startsAt < new.endsAt && new.startsAt < existing.endsAt.",
        analog: `function seatTaken(seatId) {
  return seats.some((s) => s.seatId === seatId);
}`,
        seed: `let appointments = [];
function nextId() { return String(Date.now()); }
export function getStore() { return appointments; }
export function validateAppointment(input) {
  const fields = ["provider", "service", "startsAt", "endsAt"];
  for (const f of fields) {
    if (typeof input?.[f] !== "string" || !input[f].trim()) return f + " is required";
  }
  return null;
}
`,
        starter: `let appointments = [];
function nextId() { return String(Date.now()); }
export function getStore() { return appointments; }
export function validateAppointment(input) { return null; }

export function hasOverlap(candidate) {
  // same provider, time overlap
}
`,
        expected: `let appointments = [];
function nextId() { return String(Date.now()); }
export function getStore() { return appointments; }
export function validateAppointment(input) {
  const fields = ["provider", "service", "startsAt", "endsAt"];
  for (const f of fields) {
    if (typeof input?.[f] !== "string" || !input[f].trim()) return f + " is required";
  }
  return null;
}

export function hasOverlap(candidate) {
  return appointments.some(
    (a) =>
      a.provider === candidate.provider &&
      a.startsAt < candidate.endsAt &&
      candidate.startsAt < a.endsAt
  );
}
`,
        keywords: ["hasOverlap", "provider", "startsAt", "endsAt"],
        mc: [
          "same provider AND existing.startsAt < new.endsAt AND new.startsAt < existing.endsAt",
          "same service name anywhere in the day",
          "any two appointments in the whole salon",
        ],
        correct: "same provider AND existing.startsAt < new.endsAt AND new.startsAt < existing.endsAt",
        wrong: "Overlap is per provider, interval intersection — not 'anyone booked today'.",
      },
      {
        paal: "Implement GET to list records and POST to create with the correct status codes",
        think: "That Lesson-screen DESIGN MOCK had two doors: GET lists the store, POST adds a row or returns 409. How do those routes use the store, the field checks, and the overlap check you just wrote?",
        why: "GET only reads. POST checks fields, then overlap, then inserts. The routes should call those helpers, not copy the rules again.",
        hint: "GET: res.json(appointments). POST: 400 on validate or overlap; else push and 201.",
        analog: `if (seatTaken(body.seatId)) return res.status(409).json({ error: "seat taken" });`,
        seed: `let appointments = [];
function nextId() { return String(Date.now()); }
export function validateAppointment(input) { return null; }
export function hasOverlap(candidate) { return false; }
`,
        starter: `let appointments = [];
function nextId() { return String(Date.now()); }
export function validateAppointment(input) { return null; }
export function hasOverlap(candidate) { return false; }

export function createHandlers() {
  return {
    list(req, res) {},
    create(req, res) {},
  };
}
`,
        expected: `let appointments = [];
function nextId() { return String(Date.now()); }
export function validateAppointment(input) { return null; }
export function hasOverlap(candidate) { return false; }

export function createHandlers() {
  return {
    list(_req, res) {
      res.json(appointments);
    },
    create(req, res) {
      const err = validateAppointment(req.body);
      if (err) return res.status(400).json({ error: err });
      if (hasOverlap(req.body)) return res.status(409).json({ error: "slot conflict" });
      const row = { id: nextId(), ...req.body };
      appointments.push(row);
      res.status(201).json(row);
    },
  };
}
`,
        keywords: ["json", "validateAppointment", "hasOverlap", "409", "201"],
        mc: [
          "GET lists store; POST validates, rejects overlap with 409, else insert 201",
          "POST always 200 and never validates",
          "GET writes to disk; POST only logs",
        ],
        correct: "GET lists store; POST validates, rejects overlap with 409, else insert 201",
        wrong: "GET lists the store. POST validates, returns 409 on conflict, otherwise inserts with 201.",
        ok: "Correct — list and create both go through the store and the conflict rule.",
      },
    ],
  },
  {
    tag: "idt-invoice-list-form",
    title: "Invoice list + create form",
    shortName: "Invoice list+form",
    analog: "Name list (list + add form)",
    concept: `Build a screen that lists invoices and a form to create one:

  List     →  each row is one invoice (client, amount, due date)
  Empty    →  a message when the list has no items
  Form     →  client, amount, dueDate
  Submit   →  the new invoice appears on the list`,
    usecase: "Most web apps need a screen that lists data as rows you can scan — people, orders, tickets, cities in a table. You also need a form to add a new row, and a clear message when the list is empty. That list-plus-form screen is what you are learning here.",
    designMock: {
      kind: "list-and-form",
      screenTitle: "Invoices",
      caption: "This is the screen you are building. Match the pieces — list, empty message, form, submit — not the brand colors.",
      listCaption: "LIST — two sample rows",
      emptyCaption: "EMPTY — when there are no rows",
      emptyMessage: "No invoices yet.",
      rows: [
        { title: "Harbor Cafe", subtitle: "$240.00", meta: "Due Aug 28" },
        { title: "Northside Deli", subtitle: "$86.50", meta: "Due Sep 4" },
      ],
      fields: [
        { label: "Client", sample: "Harbor Cafe" },
        { label: "Amount", sample: "240" },
        { label: "Due date", sample: "2026-08-28" },
      ],
      submitLabel: "Create invoice",
    },
    steps: [
      {
        paal: "Define a TypeScript type for one item in a list",
        think: "On the first Lesson screen you saw a picture of the Invoices page (the box labeled DESIGN MOCK). In that picture every row shows the same three facts — client, amount, and due date — and the form asks for those same three. How do we lock that so every row (and every submit) uses one shared shape, instead of inventing fields as we go?",
        why: "If list rows and form fields do not share one shape, some rows will be missing a due date, or the form will save a field the list cannot show. A type is how we name that shared shape once.",
        hint: "export type Invoice = { id: string; client: string; amount: number; dueDate: string }",
        analog: `export type Guest = { id: string; name: string; note: string };`,
        seed: `// one invoice row\n`,
        starter: `// one invoice row\n`,
        expected: `export type Invoice = {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
};
`,
        keywords: ["export", "type", "Invoice", "client", "amount", "dueDate"],
        mc: [
          "Model one Invoice row (id, client, amount, dueDate)",
          "Design the brand theme before any data shape",
          "Build PDF export before a list exists",
        ],
        correct: "Model one Invoice row (id, client, amount, dueDate)",
        wrong: "Start with a type for one record. Layout and APIs come after the data shape exists.",
        ok: "Correct — one type for one list item.",
      },
      {
        paal: "Store a list in React state with useState so the UI re-renders",
        think: "Go back to that Invoices picture on the first Lesson screen. Clicking Create invoice should add another row while you stay on the page — it is not a still photo. Where should that growing list live inside the component so the screen redraws when an invoice is added?",
        why: "A plain array in a variable will not make React redraw. useState is the list the screen actually watches.",
        hint: "const [invoices, setInvoices] = useState<Invoice[]>([])",
        analog: `const [guests, setGuests] = useState<Guest[]>([]);`,
        seed: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  return <div className="invoice-desk" />;
}
`,
        starter: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  return <div className="invoice-desk" />;
}
`,
        expected: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return <div className="invoice-desk" />;
}
`,
        keywords: ["useState", "invoices", "setInvoices"],
        mc: [
          "const [invoices, setInvoices] = useState<Invoice[]>([]);",
          "window.invoices = []",
          "let invoices: Invoice[]",
        ],
        correct: "const [invoices, setInvoices] = useState<Invoice[]>([]);",
        wrong: "useState owns the list.",
      },
      {
        paal: "Render each item in a list as a row with a stable key",
        think: "In the Invoices picture on the first Lesson screen, the list is not one blob of text — it is one row per invoice, stacked. You already have an array. How do you turn that array into those separate rows on the screen?",
        why: "map() walks the array and returns one element per item. A stable key tells React which row is which when the list changes.",
        hint: "invoices.map((inv) => <li key={inv.id}>...)</li>",
        analog: `guests.map((g) => <li key={g.id}>{g.name}</li>)`,
        seed: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return <div className="invoice-desk" />;
}
`,
        starter: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return (
    <div className="invoice-desk">
      {/* list rows */}
    </div>
  );
}
`,
        expected: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return (
    <div className="invoice-desk">
      <ul>
        {invoices.map((inv) => (
          <li key={inv.id}>
            {inv.client} — {inv.amount} due {inv.dueDate}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
        keywords: ["map", "key", "inv.id", "invoices"],
        mc: [
          "invoices.map((inv) => <li key={inv.id}>{inv.client}</li>)",
          "invoices.forEach((inv) => document.write(inv.client))",
          "<li>{invoices}</li>",
        ],
        correct: "invoices.map((inv) => <li key={inv.id}>{inv.client}</li>)",
        wrong: "Use map to produce elements, and key={inv.id} so React can track rows.",
      },
      {
        paal: "Show an empty state when the list has no items",
        think: "That same Invoices picture on the first Lesson screen also showed a dashed box: “No invoices yet.” A blank white page would look like a bug. When the array has no items, what should the screen show instead of the list?",
        why: "Empty is a real screen, not a missing screen. Show a short message when length is 0; show the rows when it is not.",
        hint: "If invoices.length === 0, show a short message; else the list.",
        analog: `{guests.length === 0 ? <p>No names yet.</p> : <ul>...</ul>}`,
        seed: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return (
    <div className="invoice-desk">
      <ul>
        {invoices.map((inv) => (
          <li key={inv.id}>
            {inv.client} — {inv.amount} due {inv.dueDate}
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
        starter: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return (
    <div className="invoice-desk">
      {/* empty state + list */}
    </div>
  );
}
`,
        expected: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return (
    <div className="invoice-desk">
      {invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>
              {inv.client} — {inv.amount} due {inv.dueDate}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
        keywords: ["length", "===", "0", "No invoices"],
        mc: [
          "if length is 0, render a message; otherwise render the list",
          "hide the whole app until data exists",
          "throw if the array is empty",
        ],
        correct: "if length is 0, render a message; otherwise render the list",
        wrong: "Empty is a state you render, not an error and not a blank page.",
      },
      {
        paal: "Bind form inputs to React state with value and onChange",
        think: "In the Invoices picture on the first Lesson screen, the form has three boxes: client, amount, due date. As someone types, those boxes should keep the text. How do we store what is in each box so Submit can read it?",
        why: "If the input keeps its own value, React cannot see it on submit. value plus onChange keeps the typed text in state — one source of truth.",
        hint: "Three useState values. Each input: value={...} onChange={(e) => set...(e.target.value)}.",
        analog: `const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />`,
        seed: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  return (
    <div className="invoice-desk">
      {invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>{inv.client} — {inv.amount} due {inv.dueDate}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
        starter: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  // form fields
  return (
    <div className="invoice-desk">
      {invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>{inv.client}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
        expected: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  return (
    <div className="invoice-desk">
      {invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>
              {inv.client} — {inv.amount} due {inv.dueDate}
            </li>
          ))}
        </ul>
      )}
      <form>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="Due date" />
      </form>
    </div>
  );
}
`,
        keywords: ["setClient", "value={client}", "onChange", "setAmount", "setDueDate"],
        mc: [
          "value from state, onChange writes back to state",
          "read the input only on submit via document.getElementById",
          "store the DOM node in a global",
        ],
        correct: "value from state, onChange writes back to state",
        wrong: "Controlled inputs: value and onChange both talk to React state.",
      },
      {
        paal: "On submit, preventDefault, append one item to the list, and clear the form",
        think: "In the Invoices picture on the first Lesson screen, Create invoice does not leave the page. The new invoice should appear as a new row, and the form should clear. What has to happen on submit so the list grows without a reload?",
        why: "preventDefault stops the browser from navigating away. Copying the old list plus one new item, then clearing the fields, is how that Lesson-screen picture behaves.",
        hint: "e.preventDefault(); setInvoices((prev) => [...prev, { id: String(Date.now()), client, amount: Number(amount), dueDate }]); then set fields to \"\".",
        analog: `setGuests((prev) => [...prev, { id: String(Date.now()), name, note }]);`,
        seed: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  return (
    <div className="invoice-desk">
      {invoices.length === 0 ? <p>No invoices yet.</p> : <ul>{invoices.map((inv) => <li key={inv.id}>{inv.client}</li>)}</ul>}
      <form>
        <input value={client} onChange={(e) => setClient(e.target.value)} />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </form>
    </div>
  );
}
`,
        starter: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  function onSubmit(e: React.FormEvent) {
    // create
  }
  return (
    <div className="invoice-desk">
      {invoices.length === 0 ? <p>No invoices yet.</p> : <ul>{invoices.map((inv) => <li key={inv.id}>{inv.client}</li>)}</ul>}
      <form onSubmit={onSubmit}>
        <input value={client} onChange={(e) => setClient(e.target.value)} />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit">Create invoice</button>
      </form>
    </div>
  );
}
`,
        expected: `import { useState } from "react";
export type Invoice = { id: string; client: string; amount: number; dueDate: string };
export function InvoiceDesk() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Invoice = { id: String(Date.now()), client, amount: Number(amount), dueDate };
    setInvoices((prev) => [...prev, next]);
    setClient("");
    setAmount("");
    setDueDate("");
  }
  return (
    <div className="invoice-desk">
      {invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>
              {inv.client} — {inv.amount} due {inv.dueDate}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit}>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="Due date" />
        <button type="submit">Create invoice</button>
      </form>
    </div>
  );
}
`,
        keywords: ["preventDefault", "setInvoices", "Number(amount)", "Create invoice"],
        mc: [
          "preventDefault, append Invoice, clear fields",
          "invoices.push and forceUpdate",
          "only console.log the form",
        ],
        correct: "preventDefault, append Invoice, clear fields",
        wrong: "Append with setState copy, not mutate.",
        ok: "Correct — the list updates from state after submit.",
      },
    ],
  },
  {
    tag: "idt-invoice-overdue-api",
    title: "Invoices API + overdue status",
    shortName: "Invoice API",
    analog: "Late task (due date passed, not done)",
    concept: `Build an invoices API where overdue is computed, not sent by the client:

  GET   →  list invoices, each with a derived status
  POST  →  validate fields, insert paid:false, return derived status

Status is overdue when dueDate is in the past and paid is not true.`,
    usecase: "Most APIs compute facts from stored data instead of trusting what the browser sends. Words like overdue, late, or sold out should come from dates and flags on the server — not from a field the client types. That is the habit this lesson builds.",
    designMock: {
      kind: "http-api",
      caption: "This is the API you are building. GET returns each row with a computed status. POST never trusts a client status field.",
      getLabel: "GET /invoices  →  200",
      postLabel: "POST /invoices  →  201",
      getSample: `[
  {
    "id": "1",
    "client": "Harbor Cafe",
    "amount": 240,
    "dueDate": "2026-08-01",
    "paid": false,
    "status": "overdue"
  }
]`,
      postSample: `{
  "client": "Harbor Cafe",
  "amount": 240,
  "dueDate": "2026-08-28"
}

→ 201 { ..., "paid": false, "status": "open" }`,
    },
    steps: [
      {
        paal: "Create an in-memory array store and an id helper",
        think: "On the first Lesson screen you saw sample GET JSON (the box labeled DESIGN MOCK) — a list of invoices, each with a status. Before any route exists, those records still need a home. Where should that list live so later GET and POST can read and write the same data?",
        why: "Routes are just doors. The array is the room behind them. Build the room first, then the doors.",
        hint: "let invoices = []; nextId(); getStore().",
        analog: `let tasks = [];`,
        seed: `// store\n`,
        starter: `// store\n`,
        expected: `let invoices = [];
function nextId() { return String(Date.now()); }
export function getStore() { return invoices; }
`,
        keywords: ["invoices", "nextId", "getStore"],
        mc: [
          "In-memory invoices array and nextId before routes",
          "Open Postgres and skip an in-app model",
          "Put JSON in localStorage from the API process",
        ],
        correct: "In-memory invoices array and nextId before routes",
        wrong: "Create the store before routes. Handlers need somewhere to read and write.",
      },
      {
        paal: "Validate required fields and numeric constraints on a create payload",
        think: "On that same Lesson screen, the POST sample needs a client, an amount, and a due date. Amount must be a number greater than 0. What should the API do if amount is missing, a string, or zero — save a broken row, or refuse the write?",
        why: "A bad row in the store will break every later check. Reject it before insert, with a clear error.",
        hint: "typeof amount === 'number' && amount > 0",
        analog: `if (!(task.points > 0)) return "points must be greater than 0";`,
        seed: `let invoices = [];
function nextId() { return String(Date.now()); }
export function getStore() { return invoices; }
`,
        starter: `let invoices = [];
function nextId() { return String(Date.now()); }
export function validateInvoice(input) {}
`,
        expected: `let invoices = [];
function nextId() { return String(Date.now()); }
export function getStore() { return invoices; }
export function validateInvoice(input) {
  if (typeof input?.client !== "string" || !input.client.trim()) return "client is required";
  if (typeof input?.amount !== "number" || input.amount <= 0) return "amount must be > 0";
  if (typeof input?.dueDate !== "string" || !input.dueDate.trim()) return "dueDate is required";
  return null;
}
`,
        keywords: ["validateInvoice", "amount", ">", "0", "client"],
        mc: [
          "client non-empty, amount number > 0, dueDate non-empty",
          "accept any JSON",
          "amount can be a string dollars like '$12'",
        ],
        correct: "client non-empty, amount number > 0, dueDate non-empty",
        wrong: "Server validates types and amount > 0.",
      },
      {
        paal: "Derive a status from stored data instead of trusting the request body",
        think: "On the first Lesson screen, the GET sample already showed one invoice as \"overdue\". Nobody typed that word in POST — the due date is in the past and paid is false. Should the browser send a status field, or should the server compute it?",
        why: "The browser can send anything. Dates and paid are enough to know overdue. Compute it on the way out so it cannot be faked.",
        hint: "function deriveStatus(inv, now = new Date()) { if (inv.paid) return 'paid'; if (new Date(inv.dueDate) < now) return 'overdue'; return 'open'; }",
        analog: `function taskStatus(item, today) {
  if (item.done) return "done";
  if (new Date(item.due) < today) return "late";
  return "open";
}`,
        seed: `let invoices = [];
export function validateInvoice(input) { return null; }
`,
        starter: `let invoices = [];
export function validateInvoice(input) { return null; }
export function deriveStatus(inv, now = new Date()) {}
`,
        expected: `let invoices = [];
export function validateInvoice(input) { return null; }
export function deriveStatus(inv, now = new Date()) {
  if (inv.paid === true) return "paid";
  if (new Date(inv.dueDate) < now) return "overdue";
  return "open";
}
`,
        keywords: ["deriveStatus", "paid", "dueDate", "overdue"],
        mc: [
          "server derives overdue from dueDate + paid; ignore client status",
          "save req.body.status as-is",
          "mark everything overdue at midnight UTC regardless of dueDate",
        ],
        correct: "server derives overdue from dueDate + paid; ignore client status",
        wrong: "Status is computed. Clients do not get to declare overdue.",
      },
      {
        paal: "Implement GET to list records and POST to create, attaching the derived status",
        think: "That Lesson-screen DESIGN MOCK had two doors: GET returns each row with a status, POST creates a row and comes back with status too. How do those routes use the store, the field checks, and the status helper you just wrote?",
        why: "GET maps each stored row through the status helper. POST checks fields, inserts paid:false, then attaches the computed status. Do not copy those rules into the route by hand twice.",
        hint: "list: invoices.map(i => ({...i, status: deriveStatus(i)})). create: 400 on validate; else push paid:false.",
        analog: `res.json(tasks.map((t) => ({ ...t, status: taskStatus(t) })));`,
        seed: `let invoices = [];
function nextId() { return String(Date.now()); }
export function validateInvoice(input) { return null; }
export function deriveStatus(inv, now = new Date()) { return "open"; }
`,
        starter: `let invoices = [];
function nextId() { return String(Date.now()); }
export function validateInvoice(input) { return null; }
export function deriveStatus(inv, now = new Date()) { return "open"; }
export function createHandlers() {
  return { list() {}, create() {} };
}
`,
        expected: `let invoices = [];
function nextId() { return String(Date.now()); }
export function validateInvoice(input) { return null; }
export function deriveStatus(inv, now = new Date()) {
  if (inv.paid === true) return "paid";
  if (new Date(inv.dueDate) < now) return "overdue";
  return "open";
}
export function createHandlers() {
  return {
    list(_req, res) {
      res.json(invoices.map((i) => ({ ...i, status: deriveStatus(i) })));
    },
    create(req, res) {
      const err = validateInvoice(req.body);
      if (err) return res.status(400).json({ error: err });
      const row = { id: nextId(), client: req.body.client, amount: req.body.amount, dueDate: req.body.dueDate, paid: false };
      invoices.push(row);
      res.status(201).json({ ...row, status: deriveStatus(row) });
    },
  };
}
`,
        keywords: ["deriveStatus", "validateInvoice", "201", "paid"],
        mc: [
          "GET returns rows with derived status; POST validates then insert paid:false",
          "POST stores whatever status the client sent",
          "GET returns the raw array with no status field",
        ],
        correct: "GET returns rows with derived status; POST validates then insert paid:false",
        wrong: "Always attach deriveStatus on the way out.",
        ok: "Correct — list and create both attach the derived status.",
      },
    ],
  },
];

function buildEngine(mod) {
  const stepNodes = mod.steps.map((step, i) => {
    const n = i + 1;
    const total = mod.steps.length;
    return `{
    id: "step${n}",
    type: "question",
    phase: "Step ${n} of ${total}",
    paal: \`${esc(step.paal)}\`,
    hint: \`${esc(step.hint)}\`,
    example_code: \`${esc(step.analog || step.expected)}\`,
    think_prompt: \`${esc(step.think || step.paal)}\`,
    mc_options: ${JSON.stringify(step.mc)},
    mc_correct_option: ${JSON.stringify(step.correct)},
    mc_anchor: ${JSON.stringify(String(step.correct).slice(0, 40))},
    why_this_matters: \`${esc(step.why || mod.concept)}\`,
    answer_keywords: ${JSON.stringify(step.keywords)},
    seed_code: \`${esc(step.seed)}\`,
    starter_code: \`${esc(step.starter)}\`,
    feedback_correct: ${JSON.stringify(step.ok || "Correct — keep going.")},
    feedback_partial: "Close — check the hint and try again.",
    feedback_wrong: ${JSON.stringify(step.wrong || "Not quite — re-read the question and pick the matching option.")},
    expected: \`${esc(step.expected)}\`,
    analog_example: \`${esc(step.analog || "// same pattern, different nouns")}\`,
    deepDiveLabel: "Why this step matters",
    deepDive: {
      hook: \`${esc(step.paal)}\`,
      pain: "Skipping this step leaves later code with no data shape or no source of truth.",
      mentalModel: \`${esc(mod.concept)}\`,
      discover: \`${esc(step.expected)}\`,
      quickRules: "- One skill per step\\n- Name the skill, not the product noun\\n- Example uses the same pattern",
      watchOut: "Do not turn a single import or interface into its own lesson.",
      dryRun: "Write the same step for a different resource with the same shape.",
      build: \`${esc(step.hint)}\`,
    },
  }`;
  });

  const side = [
    `{ label: "Lesson", id: "intro" }`,
    `{ label: "Objectives", id: "objectives" }`,
    ...mod.steps.map((_, i) => `{ label: "Step ${i + 1}", id: "step${i + 1}" }`),
  ];

  return `import createINPACTEngine from "../inpact_engine_shared";

export const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: ${JSON.stringify(mod.tag)},
      title: ${JSON.stringify(mod.title)},
      body: \`${esc(mod.concept)}\`,
      usecase: ${JSON.stringify(mod.usecase)},
      ${mod.designMock ? `designMock: ${JSON.stringify(mod.designMock)},` : ""}
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: ${JSON.stringify(mod.steps.map((s) => s.paal))},
  },
  ${stepNodes.join(",\n  ")},
];

const sideItems = [
  ${side.join(",\n  ")},
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 0,
  title: ${JSON.stringify(mod.title)},
  shortName: ${JSON.stringify(mod.shortName)},
});
`;
}

fs.mkdirSync(ASSIST_DIR, { recursive: true });

for (const mod of MODULES) {
  const code = buildEngine(mod);
  try {
    assertValidModule(code);
  } catch (err) {
    console.error("INVALID", mod.tag, err.message);
    process.exitCode = 1;
    continue;
  }
  const file = path.join(ASSIST_DIR, `inpact_assist_${mod.tag}_engine.tsx`);
  fs.writeFileSync(file, code, "utf8");
  console.log("wrote", path.basename(file), "steps=", mod.steps.length);
}

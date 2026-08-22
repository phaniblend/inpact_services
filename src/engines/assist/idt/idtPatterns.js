/**
 * Reusable IDT curricula — analogous stories for patterns that repeat across products.
 * Product-specific engines import a pattern and overlay goal / productHook / leaf file names.
 */

/** Pattern: list a resource + controlled create form (Booking FE, Invoice FE, future). */
export function resourceListAndFormPattern({ goal, productHook, files }) {
  const f = {
    typeFile: files.typeFile || "src/types.ts",
    listFile: files.listFile || "src/ResourceList.jsx",
    formFile: files.formFile || "src/CreateForm.jsx",
    pageFile: files.pageFile || "src/App.jsx",
    resource: files.resource || "resource",
    resourcePlural: files.resourcePlural || "resources",
  };

  const tree = {
    id: "goal",
    name: goal,
    ref: "goal · list + create form",
    children: [
      {
        id: "1",
        name: "1. Shape the record",
        ref: "what one row means",
        children: [
          {
            id: "1.1",
            name: "1.1 Define the TypeScript type",
            ref: f.typeFile,
            tag: "OUR_WORK",
          },
          {
            id: "1.2",
            name: "1.2 Decide which fields the list shows",
            ref: "product acceptance criteria",
            tag: "OUR_WORK",
          },
        ],
      },
      {
        id: "2",
        name: "2. Hold list state",
        ref: "React state owns the table",
        children: [
          {
            id: "2.1",
            name: "2.1 useState for the list",
            ref: `${f.listFile} · useState`,
            tag: "OUR_WORK",
          },
          {
            id: "2.2",
            name: "2.2 Load or seed initial rows",
            ref: "fetch or seed array",
            tag: "EXISTING",
          },
        ],
      },
      {
        id: "3",
        name: "3. Render the list",
        ref: f.listFile,
        children: [
          {
            id: "3.1",
            name: "3.1 Map rows to UI",
            ref: `${f.listFile} · .map`,
            tag: "OUR_WORK",
          },
          {
            id: "3.2",
            name: "3.2 Empty state when none",
            ref: `${f.listFile} · empty`,
            tag: "OUR_WORK",
          },
        ],
      },
      {
        id: "4",
        name: "4. Controlled create form",
        ref: f.formFile,
        children: [
          {
            id: "4.1",
            name: "4.1 Controlled inputs",
            ref: `${f.formFile} · value/onChange`,
            tag: "OUR_WORK",
          },
          {
            id: "4.2",
            name: "4.2 Submit creates one record",
            ref: `${f.formFile} · onSubmit`,
            tag: "OUR_WORK",
          },
          {
            id: "4.3",
            name: "4.3 Append into list state on success",
            ref: `${f.listFile} ← form`,
            tag: "OUR_WORK",
          },
        ],
      },
      {
        id: "5",
        name: "5. Compose page + submit",
        ref: f.pageFile,
        children: [
          {
            id: "5.1",
            name: "5.1 Mount list + form on the page",
            ref: f.pageFile,
            tag: "OUR_WORK",
          },
          {
            id: "5.2",
            name: "5.2 Open a Pull Request",
            ref: "git branch → OneDev PR",
            tag: "OUR_WORK",
          },
        ],
      },
    ],
  };

  // Bottom-up leaf order (dependency order)
  const chunks = [
    {
      id: "c1",
      tag: "OUR_WORK",
      leafRef: `1.1 · ${f.typeFile}`,
      text: `A ${f.resource} is a typed object — id plus the fields this product cares about.`,
    },
    {
      id: "c2",
      tag: "OUR_WORK",
      leafRef: "1.2 · acceptance criteria",
      text: `The list only shows fields a desk worker needs at a glance — not every column in the type.`,
    },
    {
      id: "c3",
      tag: "OUR_WORK",
      leafRef: `2.1 · ${f.listFile}`,
      text: `The list of ${f.resourcePlural} lives in React state so the UI re-renders when it changes.`,
    },
    {
      id: "c4",
      tag: "EXISTING",
      leafRef: "2.2 · load/seed",
      text: `Initial rows come from an existing fetch helper or a small seed array — we rely on that, we don't reinvent HTTP.`,
    },
    {
      id: "c5",
      tag: "OUR_WORK",
      leafRef: `3.1 · ${f.listFile}`,
      text: `Render by mapping each ${f.resource} to one row/card — one element per record.`,
    },
    {
      id: "c6",
      tag: "OUR_WORK",
      leafRef: `3.2 · ${f.listFile}`,
      text: `When the array is empty, show an empty state — never a blank screen.`,
    },
    {
      id: "c7",
      tag: "OUR_WORK",
      leafRef: `4.1 · ${f.formFile}`,
      text: `Every form field is controlled: value from state, onChange writes back to state.`,
    },
    {
      id: "c8",
      tag: "OUR_WORK",
      leafRef: `4.2 · ${f.formFile}`,
      text: `onSubmit prevents default, builds one ${f.resource} from form state, then calls create.`,
    },
    {
      id: "c9",
      tag: "OUR_WORK",
      leafRef: "4.3 · list ← form",
      text: `On success, append the new ${f.resource} into list state so the table updates without a full reload.`,
    },
    {
      id: "c10",
      tag: "OUR_WORK",
      leafRef: `5.1 · ${f.pageFile}`,
      text: `The page mounts list and form together — one desk surface.`,
    },
    {
      id: "c11",
      tag: "OUR_WORK",
      leafRef: "5.2 · Pull Request",
      text: `Commit on a js/… branch and open a Pull Request into main — that's the submission for this task.`,
    },
  ];

  return { tree, chunks, productHook };
}

/** Pattern: REST CRUD + one domain rule (slot conflict / overdue). */
export function resourceCrudApiPattern({ goal, productHook, files, domainRule }) {
  const f = {
    storeFile: files.storeFile || "src/store.js",
    routesFile: files.routesFile || "src/routes.js",
    validateFile: files.validateFile || "src/validate.js",
    resource: files.resource || "resource",
    resourcePlural: files.resourcePlural || "resources",
  };
  const rule = domainRule || {
    name: "domain rule",
    leafName: "Enforce the domain rule on write",
    leafRef: "validate on create/update",
    chunk: "On create/update, reject payloads that break the domain rule.",
  };

  const tree = {
    id: "goal",
    name: goal,
    ref: "goal · CRUD API + domain rule",
    children: [
      {
        id: "1",
        name: "1. Persistence store",
        ref: f.storeFile,
        children: [
          {
            id: "1.1",
            name: "1.1 In-memory (or file) collection",
            ref: f.storeFile,
            tag: "OUR_WORK",
          },
          {
            id: "1.2",
            name: "1.2 id generator for new rows",
            ref: `${f.storeFile} · id`,
            tag: "OUR_WORK",
          },
        ],
      },
      {
        id: "2",
        name: "2. Validate inputs",
        ref: f.validateFile,
        children: [
          {
            id: "2.1",
            name: "2.1 Required fields + types",
            ref: f.validateFile,
            tag: "OUR_WORK",
          },
          {
            id: "2.2",
            name: `2.2 ${rule.leafName}`,
            ref: rule.leafRef,
            tag: "OUR_WORK",
          },
        ],
      },
      {
        id: "3",
        name: "3. HTTP handlers",
        ref: f.routesFile,
        children: [
          {
            id: "3.1",
            name: "3.1 GET list",
            ref: `${f.routesFile} · GET`,
            tag: "OUR_WORK",
          },
          {
            id: "3.2",
            name: "3.2 POST create",
            ref: `${f.routesFile} · POST`,
            tag: "OUR_WORK",
          },
          {
            id: "3.3",
            name: "3.3 PATCH/DELETE as needed",
            ref: `${f.routesFile}`,
            tag: "OUR_WORK",
          },
        ],
      },
      {
        id: "4",
        name: "4. Wire router + submit",
        ref: "server entry",
        children: [
          {
            id: "4.1",
            name: "4.1 Mount routes on existing server",
            ref: "server bootstrap",
            tag: "EXISTING",
          },
          {
            id: "4.2",
            name: "4.2 Open a Pull Request",
            ref: "git branch → OneDev PR",
            tag: "OUR_WORK",
          },
        ],
      },
    ],
  };

  const chunks = [
    {
      id: "c1",
      tag: "OUR_WORK",
      leafRef: `1.1 · ${f.storeFile}`,
      text: `${f.resourcePlural} live in a store array (or file-backed list) that handlers read and write.`,
    },
    {
      id: "c2",
      tag: "OUR_WORK",
      leafRef: `1.2 · ${f.storeFile}`,
      text: `Every new ${f.resource} gets a unique id from the store — clients don't invent ids.`,
    },
    {
      id: "c3",
      tag: "OUR_WORK",
      leafRef: `2.1 · ${f.validateFile}`,
      text: `Reject bodies missing required fields before touching the store.`,
    },
    {
      id: "c4",
      tag: "OUR_WORK",
      leafRef: `2.2 · ${rule.leafRef}`,
      text: rule.chunk,
    },
    {
      id: "c5",
      tag: "OUR_WORK",
      leafRef: `3.1 · GET`,
      text: `GET returns the current list of ${f.resourcePlural} as JSON.`,
    },
    {
      id: "c6",
      tag: "OUR_WORK",
      leafRef: `3.2 · POST`,
      text: `POST validates, applies the domain rule, then inserts and returns the created ${f.resource}.`,
    },
    {
      id: "c7",
      tag: "OUR_WORK",
      leafRef: `3.3 · PATCH/DELETE`,
      text: `Update/delete handlers load by id, validate, then mutate the store — or 404 if missing.`,
    },
    {
      id: "c8",
      tag: "EXISTING",
      leafRef: "4.1 · server bootstrap",
      text: `Mount these routes on the existing HTTP server — don't start a second process.`,
    },
    {
      id: "c9",
      tag: "OUR_WORK",
      leafRef: "4.2 · Pull Request",
      text: `Push a js/… branch and open a Pull Request into main — that's how this API task is submitted.`,
    },
  ];

  return { tree, chunks, productHook };
}

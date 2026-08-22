import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #6",
      title: "fs module mastery",
      body: `Sync vs async — prefer fs.promises in servers. fs.promises, watch, recursive operations, temp files.`,
      usecase: "Config, static files, uploads, file-based workflows.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use fs.promises over sync", "Use watch for file changes", "Recursive ops and temp files"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Read a directory recursively (fs.promises) and list all .js files. Use fs.watch on a file and log on change.",
    answer_keywords: ["fs.promises", "readdir", "recursive", "watch", "async"],
    seed_code: `import fs from 'fs/promises'
// readdir with { recursive: true } or walk manually
// fs.watch(path, (event, filename) => ...)`,
    feedback_correct: "✅ fs.promises.readdir recursive; fs.watch for change events.",
    feedback_wrong: "fs.promises for async; fs.watch for file change notifications.",
    expected: "fs.promises + watch",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F06", title: "fs module mastery", shortName: "NODE — FS" });

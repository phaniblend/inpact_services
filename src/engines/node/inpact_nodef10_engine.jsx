import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #10",
      title: "Path, URL & OS modules",
      body: `path.join/resolve — cross-platform paths. URL parsing (new URL, url.pathname). os — platform, cpus, env detection.`,
      usecase: "Portable file paths, parsing URLs, environment detection.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use path and URL modules", "Parse URLs and paths", "Use os for platform info"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Parse a full URL (e.g. https://example.com/path?q=1) and get pathname and searchParams. Use path.join for a cross-platform path.",
    answer_keywords: ["new URL", "pathname", "searchParams", "path.join", "url"],
    seed_code: `const url = new URL('https://example.com/path?q=1')
url.pathname  // '/path'
url.searchParams.get('q')  // '1'
path.join(__dirname, 'public', 'index.html')`,
    feedback_correct: "✅ new URL(), pathname, searchParams; path.join for paths.",
    feedback_wrong: "URL class for parsing; path.join for safe path construction.",
    expected: "URL and path",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F10", title: "Path, URL & OS", shortName: "NODE — PATH" });

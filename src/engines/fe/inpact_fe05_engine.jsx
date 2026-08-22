import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "FRONTEND ENG #5", title: "Progressive Web Apps", body: `Service workers, offline strategy, push notifications, Web App Manifest, install prompt.`, usecase: "App-like web experience." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Service workers", "Offline strategy", "Manifest and install"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "What does a service worker do? Offline strategy: cache-first vs network-first? What is in the Web App Manifest?", answer_keywords: ["service worker", "cache", "offline", "manifest", "install"], seed_code: `// SW: intercept fetch; cache API
// Cache-first: static assets; network-first: API
// Manifest: name, icons, start_url, display`, feedback_correct: "✅ SW intercepts fetch; cache strategies; manifest for install.", feedback_wrong: "Service worker; cache strategies; manifest.", expected: "PWA" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "FE-05", title: "Progressive Web Apps", shortName: "FE — PWA" });

import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #11", title: "Nuxt.js essentials", body: `File-based routing, SSR vs SSG vs SPA, server routes, useFetch/useAsyncData, Nuxt modules.`, usecase: "Full-stack Vue with SSR." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["File-based routing", "useFetch and useAsyncData", "SSR vs SSG"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "In Nuxt, how does file-based routing work? When use useFetch vs useAsyncData? What is the difference between SSR and SSG?", answer_keywords: ["pages", "file-based", "useFetch", "useAsyncData", "SSR", "SSG"], seed_code: `// pages/users/[id].vue -> /users/:id
// useFetch: fetches + caches + dedupes; useAsyncData: generic async
// SSR: render on each request; SSG: pre-render at build`, feedback_correct: "✅ pages/ = routes; useFetch for API; useAsyncData generic; SSR per-request, SSG build-time.", feedback_wrong: "File-based routing in pages/; useFetch vs useAsyncData; SSR vs SSG.", expected: "Nuxt" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F11", title: "Nuxt.js essentials", shortName: "VUE — NUXT" });

import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #5", title: "Vue Router", body: `router-link/router-view, navigation guards, dynamic routes, route meta, lazy loading.`, usecase: "SPA routing." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["router-link and router-view", "Navigation guards", "Dynamic routes and meta"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define a route with dynamic segment :id. Add a beforeEnter guard that redirects to /login if not authenticated. Use router-view and router-link.", answer_keywords: ["createRouter", "route", "beforeEnter", "router-link", "router-view"], seed_code: `{ path: '/user/:id', component: User, beforeEnter: (to, from, next) => { if (!auth) next('/login'); else next() } }
<router-link to="/">Home</router-link>
<router-view />`, feedback_correct: "✅ path: '/:id'; beforeEnter; router-link and router-view.", feedback_wrong: "Dynamic path; beforeEnter guard; router-link and router-view.", expected: "Vue Router" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F05", title: "Vue Router", shortName: "VUE — ROUTER" });

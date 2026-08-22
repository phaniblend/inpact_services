import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "VUE.JS #9", title: "Custom directives & plugins", body: `createDirective, plugin install pattern, global properties.`, usecase: "Reusable DOM behaviour." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Custom directive", "directive lifecycle", "Plugin with app.use"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a v-focus directive that focuses the element on mount. Create a plugin that installs it globally.", answer_keywords: ["directive", "mounted", "el.focus", "plugin", "app.use", "app.directive"], seed_code: `app.directive('focus', { mounted(el) { el.focus() } })
const plugin = { install(app) { app.directive('focus', ...) } }
app.use(plugin)`, feedback_correct: "✅ directive with mounted hook; plugin.install(app); app.use(plugin).", feedback_wrong: "Directive with mounted; install(app); app.use(plugin).", expected: "Directives and plugins" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "VUE-F09", title: "Custom directives & plugins", shortName: "VUE — DIRECTIVES" });

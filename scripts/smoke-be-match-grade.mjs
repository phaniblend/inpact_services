import { matchCoreLesson } from "../src/id-module/matchCoreLesson.js";
import { gradeBackendLesson } from "../server/be-lesson-sandbox.js";

const vote = matchCoreLesson("Implement vote up/down API endpoint for posts", { side: "backend" });
console.log(
  "vote match:",
  vote.auto?.lessonKey || vote.curated?.[0]?.lessonKey,
  vote.auto?.score || vote.curated?.[0]?.score,
);

const crud = matchCoreLesson("Build CRUD REST API for notes and products", { side: "backend" });
console.log("crud match:", crud.auto?.lessonKey || crud.curated?.[0]?.lessonKey);

const fe = matchCoreLesson("Add a sortable data table with pagination");
console.log("fe match:", fe.auto?.lessonKey || fe.curated?.[0]?.lessonKey);

const code = [
  'import http from "http";',
  "const server = http.createServer((req, res) => {",
  '  if (req.url === "/healthz") { res.writeHead(200); res.end("ok"); return; }',
  '  res.writeHead(404); res.end("missing");',
  "});",
  "server.listen(3000);",
].join("\n");

const ok = gradeBackendLesson({
  code,
  mustInclude: ["healthz", "listen", "createServer"],
});
console.log("grade healthz:", ok);

const bad = gradeBackendLesson({ code: "console.log(1)", mustInclude: ["healthz", "listen"] });
console.log("grade bad:", bad.status);

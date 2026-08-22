import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const j = JSON.parse(readFileSync(join(__dirname, "reorder-react-ts-output.json"), "utf8"));
const lines = ["export const REACT_TS_CURRICULUM = ["];
for (const row of j.newCurriculum) {
  lines.push(
    `  { title: ${JSON.stringify(row.title)}, prereqs: ${JSON.stringify(row.prereqs)} },`
  );
}
lines.push(
  "];",
  "",
  "export const LESSON_LIST = REACT_TS_CURRICULUM.map((l) => l.title);",
  "export const LESSON_PREREQS = REACT_TS_CURRICULUM.map((l) => l.prereqs);",
  "",
  "export function getLessonPrereqs(lessonNumber) {",
  "  const idx = lessonNumber - 1;",
  "  if (idx < 0 || idx >= LESSON_PREREQS.length) return [];",
  "  return LESSON_PREREQS[idx];",
  "}",
  ""
);
writeFileSync(join(__dirname, "..", "src", "reactTsCurriculum.js"), lines.join("\n"), "utf8");
console.log("lessons", j.newCurriculum.length);

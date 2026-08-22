/**
 * Populate local lesson cache from FUNDA content JSON (same keys as POST /api/lessons/generate).
 * Run: node scripts/cache-funda-lessons.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cacheSet } from "../server/cache.js";
import { FUNDA_ANGULAR_LESSONS, FUNDA_START_INDEX } from "../src/angularFundaLessons.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content/angular");

for (let i = 0; i < FUNDA_ANGULAR_LESSONS.length; i++) {
  const lessonIndex = FUNDA_START_INDEX + i;
  const { title, file } = FUNDA_ANGULAR_LESSONS[i];
  const fp = path.join(contentDir, file);
  const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
  const genKey = `angular:${title}:${lessonIndex}`;
  cacheSet("lesson", genKey, raw);
  const introPayload = {
    success: true,
    intro: raw.config.intro,
    track: "angular",
    lessonTitle: title,
    lessonIndex,
  };
  cacheSet("intro", genKey, introPayload);
  const objPayload = {
    success: true,
    leadIn: "After completing this lesson, you will be able to:",
    objectives: raw.config.objectives,
    track: "angular",
    lessonTitle: title,
    lessonIndex,
  };
  cacheSet("objectives", genKey, objPayload);
  console.log("Cached", genKey);
}

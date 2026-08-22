/**
 * Build scripts/lessons-to-warm.json from all tracks and curricula (full ~1,064 lessons).
 * Run: node scripts/build-lessons-to-warm.js
 * Then: npm run warm-cache-standalone (needs DEEPSEEK_API_KEY). Warm script runs batch per track.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Extract LESSON_LIST titles from LandingPage (same 100 + gap lessons for react-js, react-ts, angular, vue)
function getLessonListTitles() {
  const lpPath = path.join(rootDir, "src", "LandingPage.jsx");
  const content = fs.readFileSync(lpPath, "utf8");
  const start = content.indexOf("export const LESSON_LIST = [");
  if (start === -1) return [];
  const slice = content.slice(start + "export const LESSON_LIST = [".length);
  const end = slice.indexOf("];");
  const arrBody = slice.slice(0, end);
  const titles = [];
  const re = /"([^"]+)"/g;
  let m;
  while ((m = re.exec(arrBody)) !== null) titles.push(m[1]);
  return titles;
}

const ANGULAR_QUICKBITE_5 = [
  "Project Scaffold", "App Shell & Navigation", "Orders List Page",
  "Capacitor GPS + Nearby Restaurants", "Push Notifications",
];
const ANGULAR_FIRST_9 = [
  "Status Card", "Search Form", "Data Service", "Real-Time Board", "Board State",
  "Portal Navigation", "Change Detection & Performance", "Micro-Frontend Architecture", "Pipes — Creation & Usage",
];

// Extract interview titles from interviewEngines.jsx (Node can't import .jsx)
function extractInterviewTitles(jsxPath, arrayName) {
  const content = fs.readFileSync(jsxPath, "utf8");
  const marker = `export const ${arrayName} = [`;
  const start = content.indexOf(marker);
  if (start === -1) return [];
  const after = content.slice(start + marker.length);
  const end = after.indexOf("];");
  const body = after.slice(0, end);
  const titles = [];
  const re = /"([^"]+)"/g;
  let m;
  while ((m = re.exec(body)) !== null) titles.push(m[1]);
  return titles;
}

async function main() {
  const list = [];

  const problemTitles = getLessonListTitles();

  // react-js, react-ts, vue: 120 each (same LESSON_LIST)
  for (const track of ["react-js", "react-ts", "vue"]) {
    problemTitles.forEach((title, i) => {
      list.push({ track, lessonTitle: title, lessonIndex: i });
    });
  }

  // angular: 5 QuickBite + 9 ANG + 120 React (134 total, matches LandingPage)
  ANGULAR_QUICKBITE_5.forEach((title, i) => {
    list.push({ track: "angular", lessonTitle: title, lessonIndex: i });
  });
  ANGULAR_FIRST_9.forEach((title, i) => {
    list.push({ track: "angular", lessonTitle: title, lessonIndex: 5 + i });
  });
  problemTitles.forEach((title, i) => {
    list.push({ track: "angular", lessonTitle: title, lessonIndex: 14 + i });
  });

  const interviewPath = path.join(rootDir, "src", "engines", "interview", "interviewEngines.jsx");
  const jsInterviewTitles = extractInterviewTitles(interviewPath, "JS_INTERVIEW_TITLES");
  const tsInterviewTitles = extractInterviewTitles(interviewPath, "TS_INTERVIEW_TITLES");
  const nodeInterviewTitles = extractInterviewTitles(interviewPath, "NODE_INTERVIEW_TITLES");

  const { JS_FUNDAMENTALS_CURRICULUM } = await import("../src/engines/javascript/inpact_jsf_index.js");
  JS_FUNDAMENTALS_CURRICULUM.forEach((c, i) => {
    list.push({ track: "js", lessonTitle: c.title, lessonIndex: i });
  });
  jsInterviewTitles.forEach((title, i) => {
    list.push({ track: "js", lessonTitle: title, lessonIndex: JS_FUNDAMENTALS_CURRICULUM.length + i });
  });

  const { TS_FUNDAMENTALS_CURRICULUM } = await import("../src/engines/typescript/inpact_tsf_index.js");
  TS_FUNDAMENTALS_CURRICULUM.forEach((c, i) => {
    list.push({ track: "ts", lessonTitle: c.title, lessonIndex: i });
  });
  tsInterviewTitles.forEach((title, i) => {
    list.push({ track: "ts", lessonTitle: title, lessonIndex: TS_FUNDAMENTALS_CURRICULUM.length + i });
  });

  const { NODE_FUNDAMENTALS_CURRICULUM } = await import("../src/engines/node/inpact_nodef_index.js");
  NODE_FUNDAMENTALS_CURRICULUM.forEach((c, i) => {
    list.push({ track: "node", lessonTitle: c.title, lessonIndex: i });
  });
  nodeInterviewTitles.forEach((title, i) => {
    list.push({ track: "node", lessonTitle: title, lessonIndex: NODE_FUNDAMENTALS_CURRICULUM.length + i });
  });

  const { EXPRESS_FUNDAMENTALS_CURRICULUM } = await import("../src/engines/express/inpact_expf_index.js");
  EXPRESS_FUNDAMENTALS_CURRICULUM.forEach((c, i) => {
    list.push({ track: "express", lessonTitle: c.title, lessonIndex: i });
  });

  const { PYTHON_FUNDAMENTALS_CURRICULUM } = await import("../src/engines/python/inpact_pyf_index.js");
  PYTHON_FUNDAMENTALS_CURRICULUM.forEach((c, i) => {
    list.push({ track: "python", lessonTitle: c.title, lessonIndex: i });
  });

  const { SD_CURRICULUM } = await import("../src/engines/sd/inpact_sd_index.js");
  SD_CURRICULUM.forEach((c, i) => {
    list.push({ track: "sd", lessonTitle: c.title, lessonIndex: i });
  });

  const { PE_CURRICULUM } = await import("../src/engines/pe/inpact_pe_index.js");
  PE_CURRICULUM.forEach((c, i) => {
    list.push({ track: "pe", lessonTitle: c.title, lessonIndex: i });
  });

  const { SEC_CURRICULUM } = await import("../src/engines/sec/inpact_sec_index.js");
  SEC_CURRICULUM.forEach((c, i) => {
    list.push({ track: "sec", lessonTitle: c.title, lessonIndex: i });
  });

  const { EL_CURRICULUM } = await import("../src/engines/el/inpact_el_index.js");
  EL_CURRICULUM.forEach((c, i) => {
    list.push({ track: "el", lessonTitle: c.title, lessonIndex: i });
  });

  const { FE_CURRICULUM } = await import("../src/engines/fe/inpact_fe_index.js");
  FE_CURRICULUM.forEach((c, i) => {
    list.push({ track: "fe", lessonTitle: c.title, lessonIndex: i });
  });

  const { CSS_CURRICULUM } = await import("../src/engines/css/inpact_css_index.js");
  CSS_CURRICULUM.forEach((c, i) => {
    list.push({ track: "css", lessonTitle: c.title, lessonIndex: i });
  });

  const { MOBILE_ANGULAR_LESSONS } = await import("../src/mobileAngularLessons.js");
  MOBILE_ANGULAR_LESSONS.forEach((c, i) => {
    list.push({ track: "mobile-angular", lessonTitle: c.title, lessonIndex: i });
  });

  const { ALGO_FULL_LIST } = await import("../src/ai-lessons/algoCurriculumFull.js");
  ALGO_FULL_LIST.forEach((item, i) => {
    list.push({ track: "algorithms", lessonTitle: item.title, lessonIndex: i });
  });

  list.sort((a, b) => {
    if (a.track !== b.track) return a.track.localeCompare(b.track);
    return a.lessonIndex - b.lessonIndex;
  });

  const outPath = path.join(__dirname, "lessons-to-warm.json");
  fs.writeFileSync(outPath, JSON.stringify(list, null, 2), "utf8");
  const byTrack = {};
  list.forEach((item) => { byTrack[item.track] = (byTrack[item.track] || 0) + 1; });
  console.log(`Wrote ${list.length} lessons to ${outPath}`);
  console.log("By track:", byTrack);
  console.log("Run: npm run warm-cache-standalone (requires DEEPSEEK_API_KEY in .env). Runs one track per batch.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

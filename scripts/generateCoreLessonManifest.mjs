#!/usr/bin/env node
/**
 * Generates the core-lesson manifest IPF's task-to-lesson matcher reads — a build-time snapshot,
 * not a runtime scan. Includes FE webapp-blocks AND BE backend-blocks / backend-fundamentals
 * so assignable tasks (e.g. vote up/down) can resolve to analogy lessons (counter API).
 *
 * Run whenever IPAAL-main curricula change; commit the output:
 *   node scripts/generateCoreLessonManifest.mjs
 */
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IPAAL_MAIN = "D:/inpact-assistance-mods/IPAAL-main/IPAAL-main";
const OUT_PATH = path.resolve(__dirname, "..", "src", "id-module", "coreLessonManifest.json");

function entryFromSpec(spec, index, track, extras = {}) {
  const analog = Array.isArray(spec.analogOf) ? spec.analogOf : extras.analogOf || [];
  const matchText = [
    spec.title,
    spec.module,
    spec.conceptInPlainLanguage || spec.concept,
    spec.whatItIs,
    spec.task,
    ...analog,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    schemaVersion: 1,
    lessonKey: `${track}.${spec.id}`,
    track,
    listIndex: index,
    route: `/lessons/${track}/${index}`,
    title: spec.title,
    moduleId: spec.module,
    side: extras.side || (track.startsWith("backend") ? "backend" : "frontend"),
    analogOf: analog,
    matchText,
    published: true,
    // BE mastery lessons grade in the lesson engine via evaluate(); optional server sandbox can re-check.
    grading: extras.grading || (track.startsWith("backend") ? "engine+sandbox" : "engine"),
  };
}

async function loadNamed(rel, exportName) {
  const href = pathToFileURL(path.join(IPAAL_MAIN, rel)).href;
  const mod = await import(href);
  if (!mod[exportName]) throw new Error(`Missing export ${exportName} from ${rel}`);
  return mod[exportName];
}

async function main() {
  const WEB_APP_MASTERY_SPECS = await loadNamed("src/engines/mastery/webAppMasterySpecs.js", "WEB_APP_MASTERY_SPECS");
  const BACKEND_MASTERY_SPECS = await loadNamed("src/engines/mastery/backendMasterySpecs.js", "BACKEND_MASTERY_SPECS");
  const BACKEND_FUNDAMENTALS_LESSON_SPECS = await loadNamed(
    "src/engines/mastery/backendFundamentalsSpecs.js",
    "BACKEND_FUNDAMENTALS_LESSON_SPECS",
  );
  const BACKEND_BUILDING_BLOCKS_CURRICULUM = await loadNamed(
    "src/backendBuildingBlocksCurriculum.js",
    "BACKEND_BUILDING_BLOCKS_CURRICULUM",
  );

  const analogById = Object.fromEntries(
    BACKEND_BUILDING_BLOCKS_CURRICULUM.map((row) => [row.id, row.analogOf || []]),
  );

  const fe = WEB_APP_MASTERY_SPECS.map((spec, index) =>
    entryFromSpec(spec, index, "webapp-blocks", { side: "frontend", grading: "engine" }),
  );

  const beBlocks = BACKEND_MASTERY_SPECS.map((spec, index) =>
    entryFromSpec(spec, index, "backend-blocks", {
      side: "backend",
      analogOf: analogById[spec.id] || [],
      grading: "engine+sandbox",
    }),
  );

  const beFunda = BACKEND_FUNDAMENTALS_LESSON_SPECS.map((spec, index) =>
    entryFromSpec(spec, index, "backend-fundamentals", {
      side: "backend",
      grading: "engine+sandbox",
    }),
  );

  const entries = [...fe, ...beBlocks, ...beFunda];

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceRepo: IPAAL_MAIN,
    count: entries.length,
    tracks: {
      "webapp-blocks": fe.length,
      "backend-blocks": beBlocks.length,
      "backend-fundamentals": beFunda.length,
    },
    entries,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
  console.log(
    `Wrote ${entries.length} lessons to ${OUT_PATH} (fe=${fe.length} be-blocks=${beBlocks.length} be-funda=${beFunda.length})`,
  );
}

main().catch((err) => {
  console.error("Manifest generation failed:", err);
  process.exit(1);
});

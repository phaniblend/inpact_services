/**
 * Static checks for React-TS engine files lessons 1–50 (no JSX runtime).
 * Run: node scripts/validate-react-ts-lessons-1-50.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENG_DIR = path.join(__dirname, "../src/engines/react-ts");
const MAX = 50;

const errors = [];

for (let i = 1; i <= MAX; i++) {
  const num = String(i).padStart(2, "0");
  const rel = `inpact_ts${num}_engine.jsx`;
  const filePath = path.join(ENG_DIR, rel);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing file: ${rel}`);
    continue;
  }
  const src = fs.readFileSync(filePath, "utf8");
  if (!/export\s+default\s+createINPACTEngine/.test(src)) {
    errors.push(`${rel}: expected "export default createINPACTEngine"`);
  }
  const nums = [...src.matchAll(/lessonNum:\s*(\d+)/g)].map((m) => Number(m[1], 10));
  if (!nums.includes(i)) {
    errors.push(`${rel}: expected at least one lessonNum: ${i}, got [${nums.join(", ")}]`);
  }
  if (!/\bNODES\b/.test(src)) {
    errors.push(`${rel}: expected NODES symbol`);
  }
  if (!/\bsideItems\b/.test(src)) {
    errors.push(`${rel}: expected sideItems symbol`);
  }
}

if (errors.length) {
  console.error("Validation failed:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`OK: lessons 1–${MAX} engine files present and structurally sane.`);

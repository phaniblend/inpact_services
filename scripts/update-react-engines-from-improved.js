/**
 * Reads react_100_problems_improved.md and updates each inpact_pNN_engine.jsx
 * with the matching lesson title, description (body), and learning objectives (items).
 * Run: node scripts/update-react-engines-from-improved.js
 * Or: npm run update-react-engines
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const improvedPath = path.join(__dirname, "../react_100_problems_improved.md");
const enginesDir = path.join(__dirname, "../src/engines");
const md = fs.readFileSync(improvedPath, "utf8");

// Parse each lesson block (## P01 — ... up to next --- or ##)
const blocks = md.split(/\n---\s*\n/).filter(B => B.trim());
const lessons = [];

for (const block of blocks) {
  const numMatch = block.match(/^## P(\d+)\s*—\s*(.+?)(?:\n|$)/m);
  if (!numMatch) continue;
  const num = parseInt(numMatch[1], 10);
  const title = numMatch[2].trim();

  const descMatch = block.match(/\*\*description:\*\*\s*(.+?)(?=\n\*\*Learning|\n\n|\n\d{2}\.)/s);
  const description = descMatch ? descMatch[1].trim().replace(/\s+/g, " ") : "";

  const objStart = block.indexOf("**Learning objectives:**");
  let objectives = [];
  if (objStart !== -1) {
    const afterObj = block.slice(objStart);
    const lines = afterObj.split(/\n/);
    for (const line of lines) {
      const m = line.match(/^\s*(\d{2})\.\s+(.+)$/);
      if (m) objectives.push(m[2].trim());
    }
  }

  lessons[num] = { num, title, description, objectives };
}

// Update each engine file
for (let n = 1; n <= 100; n++) {
  const p = lessons[n];
  if (!p || !p.objectives.length) continue;

  const fileName = `inpact_p${String(n).padStart(2, "0")}_engine.jsx`;
  const filePath = path.join(enginesDir, fileName);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf8");

  // 1) Update intro node: content.title and content.body
  const tagRegex = new RegExp(
    `(content:\\s*\\{\\s*tag:\\s*"PROBLEM\\s*#${n}"\\s*,\\s*title:\\s*")[^"]*("\\s*,\\s*body:\\s*)`
  );
  content = content.replace(tagRegex, `$1${p.title.replace(/"/g, '\\"')}$2`);

  // Match body: either `...` (template) or "..."
  const bodyTemplateMatch = content.match(
    /(body:\s*)`([\s\S]*?)`(\s*,\s*usecase:)/
  );
  const bodyDoubleMatch = content.match(
    /(body:\s*)"((?:[^"\\]|\\.)*)"(\s*,\s*usecase:)/
  );

  if (bodyTemplateMatch) {
    const safeBody = p.description.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
    content = content.replace(
      /(body:\s*)`[\s\S]*?`(\s*,\s*usecase:)/,
      (_, g1, g2) => g1 + "`" + safeBody + "`" + g2
    );
  } else if (bodyDoubleMatch) {
    const escaped = p.description.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    content = content.replace(
      /(body:\s*)"((?:[^"\\]|\\.)*)"(\s*,\s*usecase:)/,
      (_, g1, g2) => g1 + '"' + escaped + '"' + g2
    );
  }

  // 2) Update objectives items array
  const objectivesNodeMatch = content.match(
    /id:\s*["']objectives["'][\s\S]*?items:\s*\[([\s\S]*?)\]\s*,/
  );
  if (objectivesNodeMatch) {
    const newItemsStr = p.objectives.map(obj => `      ${JSON.stringify(obj)}`).join(",\n");
    content = content.replace(
      /(id:\s*["']objectives["'][\s\S]*?items:\s*\[)[\s\S]*?(\]\s*,)/,
      `$1\n${newItemsStr}\n    $2`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated ${fileName} (P${String(n).padStart(2, "0")} — ${p.title})`);
}

console.log("Done. Updated all engine files with improved lesson descriptions and learning objectives.");

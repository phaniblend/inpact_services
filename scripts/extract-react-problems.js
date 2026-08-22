const fs = require("fs");
const path = require("path");

const enginesDir = path.join(__dirname, "../src/engines");
const files = fs.readdirSync(enginesDir)
  .filter((f) => /^inpact_p\d+_engine\.jsx$/.test(f) && f !== "inpact_engine_shared.jsx")
  .sort((a, b) => {
    const nA = parseInt(a.replace(/\D/g, ""), 10);
    const nB = parseInt(b.replace(/\D/g, ""), 10);
    return nA - nB;
  });

function extractTitle(raw) {
  const m = raw.match(/content:\s*\{\s*tag:\s*"[^"]*",\s*title:\s*"([^"]*)"/);
  return m ? m[1] : "";
}

function extractBody(raw) {
  // Template literal body: body: `...`
  const backtick = raw.match(/body:\s*`([\s\S]*?)`,\s*usecase:/);
  if (backtick) return backtick[1].trim().replace(/\n/g, " ");
  // Double-quoted body: body: "..."
  const dq = raw.match(/body:\s*"((?:[^"\\]|\\.)*)"/);
  return dq ? dq[1].trim() : "";
}

function extractItems(raw) {
  const objectivesBlock = raw.match(/id:\s*"objectives"[\s\S]*?items:\s*\[([\s\S]*?)\]\s*,/);
  if (!objectivesBlock) return [];
  const inner = objectivesBlock[1];
  const items = [];
  const re = /"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(inner)) !== null) items.push(m[1]);
  return items;
}

const out = [];
out.push("# React (JS) Lessons — Title, Description & Learning Objectives");
out.push("");
out.push("---");
out.push("");

for (const file of files) {
  const num = file.replace(/\D/g, "");
  const raw = fs.readFileSync(path.join(enginesDir, file), "utf8");
  const title = extractTitle(raw);
  const body = extractBody(raw);
  const items = extractItems(raw);

  out.push(`## P${num.padStart(2, "0")} — ${title}`);
  out.push("");
  out.push("**lesson title:** " + title);
  out.push("");
  out.push("**description:** " + (body || "(No description)"));
  out.push("");
  out.push("**Learning objectives:**  ");
  out.push("After completing this Lesson, you'll be able to:");
  items.forEach((item, i) => {
    out.push(String(i + 1).padStart(2, "0") + ". " + item + "  ");
  });
  if (items.length === 0) out.push("(No objectives listed)  ");
  out.push("");
  out.push("---");
  out.push("");
}

fs.writeFileSync(path.join(__dirname, "../REACT_JS_PROBLEMS.md"), out.join("\n"), "utf8");
console.log("Wrote REACT_JS_PROBLEMS.md with", files.length, "lessons.");

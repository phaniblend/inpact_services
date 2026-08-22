#!/usr/bin/env node
/**
 * Rename "Lesson" to "Lesson" in UI titles only (not in body copy).
 * - Sidebar first item: label: "Lesson" -> label: "Lesson"
 * - Button: "Next Lesson" -> "NEXT LESSON"
 * - Complete screen: "Lesson #N Complete" -> "Lesson #N Complete"
 * - Tag in content: "PROBLEM #N" -> "LESSON #N" (and PROBLEM #N (Vue) etc.)
 * - phase: "Lesson" stays or becomes "Lesson" for intro (sidebar shows this)
 */
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src");

function walk(dir, ext, fn) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") walk(full, ext, fn);
    else if (e.isFile() && e.name.endsWith(ext)) fn(full);
  }
}

let filesChanged = 0;
walk(srcDir, ".jsx", (file) => {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  // Sidebar label (first item in progress list)
  if (content.includes('label: "Lesson"')) {
    content = content.replace(/label: "Lesson"/g, 'label: "Lesson"');
    changed = true;
  }
  // Button text
  if (content.includes("Next Lesson")) {
    content = content.replace(/Next Lesson/g, "NEXT LESSON");
    changed = true;
  }
  // Complete screen title: "Lesson #3 Complete" etc.
  if (content.includes("Lesson #") && content.includes("Complete")) {
    content = content.replace(/Lesson #(\d+) Complete/g, "Lesson #$1 Complete");
    changed = true;
  }
  // Tag in intro content: "PROBLEM #3" or "PROBLEM #11" or "PROBLEM #40 (Vue)"
  if (content.includes('tag: "PROBLEM #')) {
    content = content.replace(/tag: "PROBLEM #/g, 'tag: "LESSON #');
    changed = true;
  }
  // phase for intro (sidebar shows "Lesson" / "Lesson" when this is the first node)
  if (content.includes('phase: "Lesson"') && content.includes("intro")) {
    content = content.replace(/phase: "Lesson"/g, 'phase: "Lesson"');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    filesChanged++;
    console.log(file);
  }
});

console.log("\nTotal files updated:", filesChanged);

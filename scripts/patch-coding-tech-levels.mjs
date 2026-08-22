import "dotenv/config";
import { listIssues, updateIssueDescription } from "../server/onedev-client.js";
import { normalizeTechLevel, inferCodingTechLevel } from "../src/cohort-matching/skillLevels.js";

const issues = await listIssues({ count: 500 });
let n = 0;
for (const i of issues) {
  if (i.projectId <= 4) continue;
  if (/^(Match:|Application:|Cohort:|Module:)/i.test(i.title || "")) continue;
  const d = i.description || "";
  if (!/^Trade:\s*Coding/mi.test(d)) continue;
  const focus = /^CodingFocus:\s*(.+)$/mi.exec(d)?.[1]?.trim()?.toLowerCase() || "";
  const techLine = /^TechLevel:\s*(.+)$/mi.exec(d);
  const current = techLine?.[1]?.trim() || "";
  const want =
    focus === "backend" || focus === "frontend"
      ? inferCodingTechLevel({ title: i.title, description: d, focus })
      : inferCodingTechLevel({ title: i.title, description: d, focus: "" });
  if (!want) continue;
  if (techLine && normalizeTechLevel(current) === want) continue;

  let next;
  if (techLine) {
    next = d.replace(/^TechLevel:\s*.+$/mi, `TechLevel: ${want}`);
  } else {
    next = d.replace(/^(Trade:\s*Coding.*)$/mi, `$1\nTechLevel: ${want}`);
  }
  await updateIssueDescription(i.id, next);
  console.log(`#${i.id} ${(i.title || "").slice(0, 48)} ${current || "(none)"} → ${want}`);
  n += 1;
}
console.log("updated", n);

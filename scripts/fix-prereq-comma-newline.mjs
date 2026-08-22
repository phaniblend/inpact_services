import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const d = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/engines/react-ts");
for (const f of fs.readdirSync(d)) {
  const m = f.match(/^inpact_ts(\d+)_engine\.jsx$/);
  if (!m) continue;
  const n = Number(m[1]);
  if (n < 7 || n > 32) continue;
  const p = path.join(d, f);
  let s = fs.readFileSync(p, "utf8");
  const b = s
    .replace(/},\{\n\s*id: "objectives"/g, `},\n{\n  id: "objectives"`)
    .replace(/},\{\s*id: "objectives"/g, `},\n{ id: "objectives"`);
  if (b !== s) fs.writeFileSync(p, b, "utf8");
}

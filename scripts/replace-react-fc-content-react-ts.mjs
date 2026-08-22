import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/** Best-effort: `const Name: React.FC = () =>` → `const Name = (): JSX.Element =>` in content/react-ts legacy JSON. */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "content", "react-ts");

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, "utf8");
  const o = s;
  s = s.replace(/const\s+(\w+)\s*:\s*React\.FC\s*=\s*\(\)\s*=>/g, "const $1 = (): JSX.Element =>");
  if (s !== o) {
    fs.writeFileSync(p, s, "utf8");
    console.log("updated", f);
  }
}

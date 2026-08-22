import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const enginesDir = path.join(__dirname, "../src/engines");

// Angular index
const ngImports = [];
const ngArray = [];
for (let n = 1; n <= 100; n++) {
  const g = `NG${String(n).padStart(2, "0")}`;
  ngImports.push(`import ${g} from "./inpact_ng${String(n).padStart(2, "0")}_engine.jsx";`);
  ngArray.push(g);
}
fs.writeFileSync(
  path.join(enginesDir, "angular", "inpact_ng_index.js"),
  ngImports.join("\n") + "\n\nexport const ENGINES_ANGULAR = [\n  " + ngArray.join(",\n  ") + "\n];\n"
);

// Vue index
const vueImports = [];
const vueArray = [];
for (let n = 1; n <= 100; n++) {
  const v = `VUE${String(n).padStart(2, "0")}`;
  vueImports.push(`import ${v} from "./inpact_vue${String(n).padStart(2, "0")}_engine.jsx";`);
  vueArray.push(v);
}
fs.writeFileSync(
  path.join(enginesDir, "vue", "inpact_vue_index.js"),
  vueImports.join("\n") + "\n\nexport const ENGINES_VUE = [\n  " + vueArray.join(",\n  ") + "\n];\n"
);

console.log("Generated inpact_ng_index.js and inpact_vue_index.js");

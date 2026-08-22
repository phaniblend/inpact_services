import fs from "fs";

const seed = fs.readFileSync("scripts/seed-smb-pipeline.mjs", "utf8");
const assists = [...seed.matchAll(/assist: "(idt-[^"]+)"/g)].map((m) => m[1]);
const products = [...seed.matchAll(/buildProduct\(\s*"([^"]+)"/g)].map((m) => m[1]);
const engines = fs.readdirSync("src/engines/assist").filter((f) => f.startsWith("inpact_assist_idt"));
console.log({
  products: products.length,
  productNames: products,
  seedAssists: assists.length,
  uniqueAssists: new Set(assists).size,
  engineFiles: engines.length,
});

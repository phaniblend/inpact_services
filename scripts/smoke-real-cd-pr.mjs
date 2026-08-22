import "dotenv/config";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const user = process.env.ONEDEV_API_USER;
const pass = process.env.ONEDEV_API_PASS;
const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
const h = {
  Authorization: auth,
  Accept: "application/json",
  "Content-Type": "application/json",
};
const remote =
  "http://" +
  encodeURIComponent(user) +
  ":" +
  encodeURIComponent(pass) +
  "@localhost:6610/DeskNotesSprint.git";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "desknotes-"));

function git(...args) {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${args.join(" ")}\n${r.stderr}${r.stdout}`);
  return r.stdout.trim();
}

git("init");
git("config", "user.email", "bsit.setty@gmail.com");
git("config", "user.name", "Desk Notes JS");
fs.writeFileSync(
  path.join(dir, "README.md"),
  "# Desk Notes\n\nAssist Me dry-run submission for CD Review.\n",
);
fs.writeFileSync(
  path.join(dir, "notes.js"),
  'export function createNote(title){\n  return { id: crypto.randomUUID(), title: String(title || "").trim() };\n}\n',
);
git("add", ".");
git("commit", "-m", "feat: seed Desk Notes Assist Me submission");
git("branch", "-M", "main");
git("remote", "add", "origin", remote);

let r = spawnSync("git", ["push", "-u", "origin", "main"], { cwd: dir, encoding: "utf8" });
console.log("push main", r.status, r.stderr.slice(0, 500), r.stdout.slice(0, 200));
if (r.status !== 0) process.exit(1);

git("checkout", "-b", "assist-me/create-note");
fs.appendFileSync(
  path.join(dir, "notes.js"),
  "\nexport function listNotes(notes){\n  return Array.isArray(notes) ? notes.slice() : [];\n}\n",
);
git("add", "notes.js");
git("commit", "-m", "feat: listNotes helper for Desk Notes Assist Me task");
r = spawnSync("git", ["push", "-u", "origin", "assist-me/create-note"], {
  cwd: dir,
  encoding: "utf8",
});
console.log("push branch", r.status, r.stderr.slice(0, 500), r.stdout.slice(0, 200));
if (r.status !== 0) process.exit(1);

const pullBodies = [
  {
    title: "Assist Me: create-note list helper",
    targetProjectId: 11,
    sourceProjectId: 11,
    targetBranch: "main",
    sourceBranch: "assist-me/create-note",
    description:
      "Dry-run Assist Me submission from Desk Notes JS path for CD Review.\nMatch: #134 / Task: #131 context carried from Desk Notes Sprint.",
  },
  {
    title: "Assist Me: create-note list helper",
    targetProject: "DeskNotesSprint",
    sourceProject: "DeskNotesSprint",
    targetBranch: "main",
    sourceBranch: "assist-me/create-note",
  },
];

for (const body of pullBodies) {
  const res = await fetch("http://localhost:6610/~api/pulls", {
    method: "POST",
    headers: h,
    body: JSON.stringify(body),
  });
  console.log("create pull", res.status, (await res.text()).slice(0, 600));
  if (res.ok) break;
}

const listed = await fetch("http://localhost:6610/~api/pulls?offset=0&count=20", { headers: h });
console.log("pulls", await listed.text());
console.log("workdir", dir);

/**
 * Open a sample JS PR against BookingDepositDesk for CD Review testing.
 * Usage (after seed-smb-pipeline.mjs):
 *   node scripts/js-open-sample-pr.mjs
 */
import "dotenv/config";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { listProjects } from "../server/onedev-client.js";

const PROJECT = "BookingDepositDesk";
const BRANCH = "js/senaga/book-form-sample";
const user = process.env.ONEDEV_API_USER;
const pass = process.env.ONEDEV_API_PASS;
if (!user || !pass) {
  console.error("ONEDEV_API_USER / ONEDEV_API_PASS required");
  process.exit(1);
}

const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
const h = {
  Authorization: auth,
  Accept: "application/json",
  "Content-Type": "application/json",
};

const projects = await listProjects({ count: 100 });
const project = projects.find((p) => p.name === PROJECT || p.path === PROJECT);
if (!project) {
  console.error(`Project ${PROJECT} not found — run seed-smb-pipeline.mjs first`);
  process.exit(1);
}

const remote =
  "http://" +
  encodeURIComponent(user) +
  ":" +
  encodeURIComponent(pass) +
  `@localhost:6610/${PROJECT}.git`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "booking-pr-"));

function git(...args) {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${args.join(" ")}\n${r.stderr}${r.stdout}`);
  return r.stdout.trim();
}

git("clone", remote, ".");
git("config", "user.email", "senagasetty@gmail.com");
git("config", "user.name", "Senaga");
git("checkout", "-b", BRANCH);
fs.mkdirSync(path.join(dir, "src"), { recursive: true });
fs.writeFileSync(
  path.join(dir, "src", "AppointmentBookForm.jsx"),
  `import { useState } from "react";

/** Sample FE for BookingDepositDesk — replace with real implementation. */
export default function AppointmentBookForm() {
  const [service, setService] = useState("");
  const [when, setWhen] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    // POST /api/appointments
    console.log({ service, when });
  }

  return (
    <form onSubmit={onSubmit} className="book-form">
      <label>
        Service
        <input value={service} onChange={(e) => setService(e.target.value)} required />
      </label>
      <label>
        When
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
      </label>
      <button type="submit">Request appointment</button>
    </form>
  );
}
`,
);
git("add", ".");
git("commit", "-m", "feat: sample appointment book form for Assist Me → PR path");
const push = spawnSync("git", ["push", "-u", "origin", BRANCH], { cwd: dir, encoding: "utf8" });
if (push.status !== 0) {
  console.error("push failed", push.stderr || push.stdout);
  process.exit(1);
}

const body = {
  title: "JS: appointment calendar list and book form (sample)",
  targetProjectId: project.id,
  sourceProjectId: project.id,
  targetBranch: "main",
  sourceBranch: BRANCH,
  description:
    "Sample submission for BookingDepositDesk FE task — senagasetty@gmail.com pipeline test.\nCD Review should list this PR.",
};

const res = await fetch("http://localhost:6610/~api/pulls", {
  method: "POST",
  headers: h,
  body: JSON.stringify(body),
});
const text = await res.text();
console.log("create pull", res.status, text.slice(0, 500));
if (!res.ok) process.exit(1);
console.log(`Open CD Review: http://localhost:5173/#/cd-review`);
console.log(`OneDev pulls: http://localhost:6610/${PROJECT}/~pulls`);

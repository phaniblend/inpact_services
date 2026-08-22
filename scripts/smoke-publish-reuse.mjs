/**
 * Prove ensureDeliveryProject reuses an existing OneDev name instead of 500ing.
 * Requires OneDev up (localhost:6610) + ONEDEV_API_USER / ONEDEV_API_PASS in .env.
 */
import "dotenv/config";
import { ensureDeliveryProject, findProjectByName } from "../server/onedev-client.js";

const NAME = `IPF Publish Smoke ${Date.now()}`;

const first = await ensureDeliveryProject({
  name: NAME,
  description: "Temporary smoke project — safe to delete.",
});
if (!first.projectId || first.reused) {
  throw new Error(`expected create on first call, got ${JSON.stringify(first)}`);
}

const second = await ensureDeliveryProject({
  name: NAME,
  description: "Temporary smoke project — safe to delete.",
});
if (!second.reused || second.projectId !== first.projectId) {
  throw new Error(`expected reuse of #${first.projectId}, got ${JSON.stringify(second)}`);
}

const found = await findProjectByName(NAME);
if (!found || found.id !== first.projectId) {
  throw new Error(`findProjectByName missed ${NAME}`);
}

console.log(`PASS  ensureDeliveryProject create→reuse for "${NAME}" (#${first.projectId})`);

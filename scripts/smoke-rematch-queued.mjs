import "dotenv/config";
import { tryRematchQueuedApplicants } from "../server/recruit-router.js";

const result = await tryRematchQueuedApplicants();
console.log({
  rematched: result.rematched.length,
  details: result.rematched,
});

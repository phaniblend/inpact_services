/**
 * WORM evidence vault upload helper — shared by any product that needs to hash-and-archive raw
 * records tied to a confirmed incident (SentinelPOS's SP-01 invariant: "raw transaction receipts
 * linked to confirmed incidents are hashed using SHA-256 and uploaded to an immutable object lock
 * vault for legal admissibility").
 *
 * Honesty note: the R2 bucket this uploads to (`inpact-evidence-vault`) was created through
 * Cloudflare's standard "Create a bucket" flow, which does not expose an Object Lock / retention
 * option — true WORM enforcement (the storage layer itself refusing overwrites/deletes for a
 * retention period) needs that enabled explicitly, which R2 only offers via its own admin API on a
 * bucket created for it. What's real here: content-addressed, SHA-256-verified uploads (the actual
 * hash is the object key, so two uploads of the same evidence always collide to the same object
 * rather than silently duplicating or overwriting with different content) — the application-level
 * half of the invariant. If literal storage-level immutability is needed later, that's a follow-up
 * (recreate the bucket with Object Lock enabled via R2's API, not something this app can flip after
 * the fact on an existing bucket).
 */
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, evidenceVaultBucket } from "./s3.js";

export function sha256Hex(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Uploads `payload` (a Buffer, or anything JSON.stringify-able) content-addressed by its own
 * SHA-256 hash, under `${prefix}/${hash}.json` — the prefix namespaces one product's evidence from
 * another's inside the one shared bucket. Returns { uri, hash } for storage on the owning record
 * (e.g. SpIncident.evidenceVaultUri).
 */
export async function uploadEvidence(prefix, payload) {
  const buffer = Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload, null, 2));
  const hash = sha256Hex(buffer);
  const key = `${prefix}/${hash}.json`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: evidenceVaultBucket,
      Key: key,
      Body: buffer,
      ContentType: "application/json",
      Metadata: { sha256: hash },
    })
  );
  return { uri: `s3://${evidenceVaultBucket}/${key}`, hash };
}

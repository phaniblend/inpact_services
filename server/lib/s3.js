/**
 * Shared S3-compatible client for the WORM evidence vault (Cloudflare R2 — see PRODUCTS_S3_* env
 * vars). R2's S3 API needs `forcePathStyle: true` and `region: "auto"`; virtual-hosted-style bucket
 * URLs (the AWS SDK's default) don't resolve against R2's endpoint. One client, reused across every
 * product that needs object storage, same reasoning as prisma.js/redis.js.
 */
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.PRODUCTS_S3_REGION || "auto",
  endpoint: process.env.PRODUCTS_S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.PRODUCTS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.PRODUCTS_S3_SECRET_ACCESS_KEY,
  },
});

export const evidenceVaultBucket = process.env.PRODUCTS_S3_BUCKET;

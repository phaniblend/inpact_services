import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #9",
      title: "Crypto module",
      body: `Hashing (SHA-256), HMAC, AES encryption/decryption. randomBytes, timing-safe comparison.`,
      usecase: "Passwords, signatures, secrets, tokens.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Hash with crypto.createHash", "HMAC and AES", "randomBytes and timingSafeEqual"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Hash a string with SHA-256. Create an HMAC. Use crypto.timingSafeEqual to compare two buffers safely.",
    answer_keywords: ["createHash", "hmac", "timingSafeEqual", "crypto", "sha256"],
    seed_code: `const crypto = require('crypto')
crypto.createHash('sha256').update(str).digest('hex')
crypto.createHmac('sha256', key).update(str).digest()
crypto.timingSafeEqual(a, b) // same length buffers`,
    feedback_correct: "✅ createHash('sha256'), createHmac, timingSafeEqual for constant-time compare.",
    feedback_wrong: "crypto.createHash, createHmac; use timingSafeEqual instead of === for secrets.",
    expected: "Crypto hash HMAC timingSafeEqual",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F09", title: "Crypto module", shortName: "NODE — CRYPTO" });

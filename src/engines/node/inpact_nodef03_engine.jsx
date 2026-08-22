import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #3",
      title: "Buffer & encoding",
      body: `Buffer.from/alloc/concat — binary data in Node.
UTF-8 vs base64 vs hex — when to use each.
Binary protocols — parsing frames, binary headers.`,
      usecase: "File hashes, binary APIs, protocol implementation.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use Buffer.from/alloc/concat", "Encode/decode UTF-8, base64, hex", "Handle binary protocols safely"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Create a buffer from a string (UTF-8), convert to base64 and hex. Alloc a buffer of 16 bytes and fill with randomBytes.",
    answer_keywords: ["Buffer.from", "Buffer.alloc", "toString", "base64", "hex", "randomBytes", "crypto"],
    seed_code: `const crypto = require('crypto')
// Buffer.from(str, 'utf8'), .toString('base64'), .toString('hex')
// Buffer.alloc(16), crypto.randomFillSync(buf)`,
    feedback_correct: "✅ Buffer.from(str,'utf8'), buf.toString('base64'/'hex'), Buffer.alloc, crypto.randomBytes.",
    feedback_wrong: "Buffer.from, toString('base64'/'hex'), crypto.randomBytes(16).",
    expected: "Buffer and encoding",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F03", title: "Buffer & encoding", shortName: "NODE — BUFFER" });

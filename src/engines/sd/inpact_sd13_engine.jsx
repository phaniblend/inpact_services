import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #13", title: "File storage systems", body: `Object storage vs block vs file, chunked uploads, deduplication, CDN integration.`, usecase: "Storing and serving files at scale." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Object vs block vs file storage", "Chunked uploads", "Deduplication and CDN"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Object vs block vs file storage — when each? How do chunked multipart uploads work? Why deduplicate?", answer_keywords: ["object", "block", "file", "S3", "multipart", "chunk", "dedup"], seed_code: `// Object: S3, flat namespace, HTTP; block: volumes, OS; file: NFS
// Multipart: split file, upload parts, complete with etags
// Dedup: content-addressable; save space`, feedback_correct: "✅ Object for blobs; block for disks; multipart for large uploads; dedup by hash.", feedback_wrong: "Object/block/file; multipart uploads; deduplication.", expected: "File storage" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-13", title: "File storage systems", shortName: "SD — STORAGE" });

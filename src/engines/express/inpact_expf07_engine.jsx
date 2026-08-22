import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #7",
      title: "File uploads",
      body: `multer, disk vs memory storage, file type validation, size limits, S3 upload pipeline.`,
      usecase: "Accepting uploads safely and scaling to object storage.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use multer for uploads", "Validate type and size", "Stream to S3 or disk"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Configure multer: single file, max 5MB, allow only image MIME types. Attach file to req.file and reject with 400 if invalid.",
    answer_keywords: ["multer", "upload", "limits", "fileFilter", "req.file", "memoryStorage"],
    seed_code: `const multer = require('multer')
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\\//.test(file.mimetype)) return cb(new Error('Images only'))
    cb(null, true)
  }
})
app.post('/upload', upload.single('file'), (req, res) => { ... })`,
    feedback_correct: "✅ multer memoryStorage, limits.fileSize, fileFilter by mimetype.",
    feedback_wrong: "multer with limits and fileFilter; upload.single('fieldname').",
    expected: "Multer config",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F07", title: "File uploads", shortName: "EXP — UPLOADS" });

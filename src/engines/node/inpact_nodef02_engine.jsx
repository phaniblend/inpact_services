import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #2",
      title: "Streams — Readable, Writable, Transform",
      body: `Streams are Node's abstraction for handling I/O in chunks.
Readable — data source (file, HTTP body, stdin)
Writable — data sink (file, HTTP response, stdout)
Transform — read → process → write (e.g. gzip)
pipeline() — chains streams and handles errors/backpressure
Backpressure — when consumer is slow, producer must pause
Memory-efficient file processing — never load entire file into RAM.`,
      usecase: "Log processing, file uploads, proxying HTTP, any large data flow.",
    },
  },
  {
    id: "objectives", type: "objectives", phase: "Objectives",
    items: [
      "Use Readable, Writable, Transform streams correctly",
      "Chain streams with pipeline() and handle errors",
      "Understand backpressure and memory-efficient processing",
      "Process large files without loading into memory",
    ],
  },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Create a Readable stream that yields lines from a file using createReadStream and a Transform to split by newlines.",
    answer_keywords: ["createReadStream", "Transform", "pipeline", "stream", "readable"],
    seed_code: `const { createReadStream } = require('fs')
const { pipeline } = require('stream')
const { createInterface } = require('readline')

// Or: fs.createReadStream + transform stream that splits by \\n
// pipeline(readStream, transform, writable) handles backpressure`,
    feedback_correct: "✅ createReadStream + Transform (split by \\n) or readline.createInterface. pipeline() for chaining.",
    feedback_partial: "fs.createReadStream, stream.Transform, pipeline() from 'stream'.",
    feedback_wrong: "Use fs.createReadStream and stream.pipeline for backpressure-safe chaining.",
    expected: "Readable + Transform or readline",
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1 — Streams", id: "step1" },
];

export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F02", title: "Streams", shortName: "NODE — STREAMS" });

# Node

Lessons and learning objectives.

**{NODE.JS #1 :: Node.js Core — fs, path & process}**

LOs:

01
Read and write files with fs.promises

02
Use path.join and path.resolve correctly

03
Access environment variables via process.env

04
Parse process.argv for CLI tools

05
Use os module for system info

06
Build a simple config loader

---

**{NODE.JS #2 :: Streams — Readable, Writable, Transform}**

LOs:

01
Use Readable, Writable, Transform streams correctly

02
Chain streams with pipeline() and handle errors

03
Understand backpressure and memory-efficient processing

04
Process large files without loading into memory

---

**{NODE.JS #3 :: Buffer & encoding}**

LOs:

01
Use Buffer.from/alloc/concat

02
Encode/decode UTF-8, base64, hex

03
Handle binary protocols safely

---

**{NODE.JS #4 :: Child processes — spawn vs exec vs fork}**

LOs:

01
Choose spawn/exec/fork correctly

02
Use IPC for fork

03
Offload CPU-bound work with worker_threads

---

**{NODE.JS #5 :: Cluster module — multi-core scaling}**

LOs:

01
Use cluster.fork() for workers

02
Share a single port across workers

03
Handle graceful restart

---

**{NODE.JS #6 :: fs module mastery}**

LOs:

01
Use fs.promises over sync

02
Use watch for file changes

03
Recursive ops and temp files

---

**{NODE.JS #7 :: HTTP from scratch}**

LOs:

01
Use http.createServer

02
Handle req/res lifecycle

03
Chunked transfer and keep-alive

---

**{NODE.JS #8 :: Net & TCP}**

LOs:

01
Use net.createServer

02
Handle socket data/end/error

03
Frame messages for TCP

---

**{NODE.JS #9 :: Crypto module}**

LOs:

01
Hash with crypto.createHash

02
HMAC and AES

03
randomBytes and timingSafeEqual

---

**{NODE.JS #10 :: Path, URL & OS modules}**

LOs:

01
Use path and URL modules

02
Parse URLs and paths

03
Use os for platform info

---

**{NODE.JS #11 :: Error handling patterns}**

LOs:

01
Create custom Error classes

02
Propagate errors in async

03
Handle uncaughtException and unhandledRejection

---

**{NODE.JS #12 :: Module system deep dive}**

LOs:

01
Understand require() resolution

02
Know module caching and circular deps

03
Use ESM in Node

---

**{NODE.JS #13 :: Environment & config}**

LOs:

01
Use dotenv and validate with Zod

02
Follow 12-factor config

03
Separate secrets from config

---

**{NODE.JS #14 :: Performance & profiling}**

LOs:

01
Use --inspect and DevTools

02
Profile memory and CPU

03
Read flame graphs

---

**{NODE.JS #15 :: Production Node.js}**

LOs:

01
Implement graceful shutdown

02
Handle SIGTERM/SIGINT

03
Add health check endpoint

04
Use PM2 or similar

---

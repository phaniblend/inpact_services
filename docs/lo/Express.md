# Express

Lessons and learning objectives.

**{EXPRESS.JS #1 :: App setup & middleware chain}**

LOs:

01
Use app.use() and order correctly

02
Call next() and next(err)

03
Define error middleware (err, req, res, next)

---

**{EXPRESS.JS #2 :: Routing — Router(), route grouping, param middleware}**

LOs:

01
Use express.Router()

02
Group routes and mount

03
Use param middleware

---

**{EXPRESS.JS #3 :: Request & Response}**

LOs:

01
Read req.body, params, query, headers

02
Use res.json, status, cookie, redirect

---

**{EXPRESS.JS #4 :: Authentication middleware}**

LOs:

01
Verify JWT in middleware

02
Use session middleware

03
Apply auth to routes

---

**{EXPRESS.JS #5 :: Validation & sanitisation}**

LOs:

01
Validate with express-validator or Zod

02
Return 400 with errors

03
Sanitise input

---

**{EXPRESS.JS #6 :: Error handling}**

LOs:

01
Centralise error handler

02
Use asyncHandler for async routes

03
Distinguish 4xx vs 5xx

---

**{EXPRESS.JS #7 :: File uploads}**

LOs:

01
Use multer for uploads

02
Validate type and size

03
Stream to S3 or disk

---

**{EXPRESS.JS #8 :: Rate limiting & security headers}**

LOs:

01
Apply rate limiting

02
Use helmet

03
Configure CORS and body parser limits

---

**{EXPRESS.JS #9 :: Compression & caching}**

LOs:

01
Use compression middleware

02
Set ETag and Cache-Control

03
Support If-None-Match

---

**{EXPRESS.JS #10 :: Testing Express apps}**

LOs:

01
Use supertest for HTTP tests

02
Mock middleware or DB

03
Run integration tests

---

**{EXPRESS.JS #11 :: WebSockets with Express}**

LOs:

01
Integrate ws or socket.io with Express

02
Handle upgrade handshake

03
Use rooms/namespaces

---

**{EXPRESS.JS #12 :: Express performance}**

LOs:

01
Use connection pooling for DB

02
Enable keep-alive

03
Stream responses where possible

04
Avoid blocking the event loop

---

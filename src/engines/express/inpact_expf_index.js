export const EXPRESS_FUNDAMENTALS_CURRICULUM = [
  { id: "expf01", shortName: "EXP — SETUP", title: "App setup & middleware chain", why: "app.use(), middleware order, next(), error middleware (err, req, res, next)." },
  { id: "expf02", shortName: "EXP — ROUTING", title: "Routing", why: "Router(), route grouping, param middleware, route-level vs app-level." },
  { id: "expf03", shortName: "EXP — REQ/RES", title: "Request & Response", why: "req.body/params/query/headers, res.json/send/status/cookie/redirect." },
  { id: "expf04", shortName: "EXP — AUTH", title: "Authentication middleware", why: "JWT verification, session middleware, Passport.js strategies." },
  { id: "expf05", shortName: "EXP — VALIDATION", title: "Validation & sanitisation", why: "express-validator, Zod middleware, DTO pattern, rejecting bad input early." },
  { id: "expf06", shortName: "EXP — ERRORS", title: "Error handling", why: "Centralised error handler, asyncHandler, HTTP error classes, 4xx vs 5xx." },
  { id: "expf07", shortName: "EXP — UPLOADS", title: "File uploads", why: "multer, disk vs memory storage, file type validation, size limits, S3 pipeline." },
  { id: "expf08", shortName: "EXP — RATE/SEC", title: "Rate limiting & security headers", why: "express-rate-limit, helmet, CORS, body size limits." },
  { id: "expf09", shortName: "EXP — COMPRESS", title: "Compression & caching", why: "compression middleware, ETag, Cache-Control, conditional requests." },
  { id: "expf10", shortName: "EXP — TESTING", title: "Testing Express apps", why: "supertest, mocking middleware, integration vs unit, test DB setup." },
  { id: "expf11", shortName: "EXP — WEBSOCKETS", title: "WebSockets with Express", why: "ws, socket.io, upgrade handshake, rooms and namespaces." },
  { id: "expf12", shortName: "EXP — PERF", title: "Express performance", why: "Connection pooling, keep-alive, response streaming, avoiding blocking." },
];
export default EXPRESS_FUNDAMENTALS_CURRICULUM;

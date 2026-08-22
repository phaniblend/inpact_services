/**
 * Backend lesson sandbox grader — runs learner JS in an isolated Node vm with mocked
 * http / pg / queue / cache / crypto primitives. Does NOT open real sockets or DB connections.
 *
 * Full Docker+Postgres live grading is available as compose service `be-grader` (optional);
 * this module is the default path used by POST /api/id/grade-backend so BE lessons can be
 * re-checked server-side with the same evaluate patterns as the in-browser engine.
 */
import vm from "vm";
import crypto from "crypto";

const DEFAULT_TIMEOUT_MS = 800;

/** Lesson examples use ESM import; the sandbox is CommonJS-style require(). */
function rewriteEsmImports(code) {
  return String(code || "")
    .replace(/import\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?/g, 'const $1 = require("$2");')
    .replace(/import\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["']\s*;?/g, 'const $1 = require("$2");')
    .replace(
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["']\s*;?/g,
      (_m, names, mod) => `const { ${names} } = require("${mod}");`,
    );
}

function buildSandbox() {
  const store = { accounts: new Map(), items: [], cache: new Map(), queue: [] };
  const logs = [];

  const pool = {
    async connect() {
      return {
        async query(sql) {
          return this._query(sql);
        },
        _query: pool.query.bind(pool),
        release() {},
      };
    },
    async query(sql, params = []) {
      const s = String(sql);
      if (/^select\s+1/i.test(s.trim())) return { rows: [{ "?column?": 1 }], rowCount: 1 };
      if (/insert into items/i.test(s)) {
        const row = { id: params[0] || crypto.randomUUID(), title: params[1] };
        store.items.push(row);
        return { rows: [row], rowCount: 1 };
      }
      if (/from items where id/i.test(s)) {
        const row = store.items.find((i) => i.id === params[0]);
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }
      return { rows: [], rowCount: 0 };
    },
  };

  const cache = {
    async get(key) {
      return store.cache.has(key) ? store.cache.get(key) : null;
    },
    async set(key, value) {
      store.cache.set(key, value);
    },
    async del(key) {
      store.cache.delete(key);
    },
  };

  const queue = {
    async add(name, payload, opts) {
      store.queue.push({ name, payload, opts });
      return { id: String(store.queue.length) };
    },
  };

  const fakeHttp = {
    createServer(handler) {
      const server = {
        handler,
        listen(port, cb) {
          server.port = port;
          if (typeof cb === "function") cb();
          return server;
        },
      };
      return server;
    },
  };

  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(String).join(" ")),
      error: (...args) => logs.push(args.map(String).join(" ")),
    },
    setTimeout,
    clearTimeout,
    Buffer,
    process: { env: { JWT_SECRET: "sandbox-secret" } },
    crypto,
    require(name) {
      if (name === "http") return fakeHttp;
      if (name === "crypto") return crypto;
      if (name === "pg") return { Pool: function Pool() { return pool; } };
      if (name === "bcrypt") {
        return {
          hash: async (pw) => `hashed:${pw}`,
          compare: async (pw, hash) => hash === `hashed:${pw}`,
        };
      }
      if (name === "jsonwebtoken") {
        return {
          sign: (payload) => Buffer.from(JSON.stringify(payload)).toString("base64url"),
          verify: (token) => JSON.parse(Buffer.from(token, "base64url").toString("utf8")),
        };
      }
      throw new Error(`Module not available in BE sandbox: ${name}`);
    },
    module: { exports: {} },
    exports: {},
    pool,
    query: pool.query.bind(pool),
    cache,
    queue,
    store,
    logs,
    result: undefined,
  };
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  return sandbox;
}

/**
 * @param {string} code learner source
 * @param {{ timeoutMs?: number, invoke?: string }} [opts]
 *   invoke: optional expression evaluated after code loads, e.g. "createTodoApi().create('x')"
 * @returns {{ ok: boolean, value?: unknown, error?: string, logs: string[] }}
 */
export function runBackendSandbox(code, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const sandbox = buildSandbox();
  const rewritten = rewriteEsmImports(code);
  const scriptSource = `
    "use strict";
    ${rewritten}
    ;typeof module !== "undefined" && module.exports && Object.assign(exports, module.exports);
    result = (${opts.invoke ? opts.invoke : "undefined"});
  `;
  try {
    const context = vm.createContext(sandbox, { name: "be-lesson-sandbox" });
    const script = new vm.Script(scriptSource, { filename: "learner-backend.js" });
    script.runInContext(context, { timeout: timeoutMs });
    return { ok: true, value: sandbox.result, logs: sandbox.logs };
  } catch (err) {
    return { ok: false, error: err?.message || String(err), logs: sandbox.logs };
  }
}

/**
 * Grade against simple expectations: required substrings and/or an invoke+assert callback name.
 * Mirrors the FE mastery evaluate() spirit without leaving the machine open to network/disk.
 */
export function gradeBackendLesson({ code, mustInclude = [], invoke, expect }) {
  const patterns = mustInclude.map((p) => (p instanceof RegExp ? p : new RegExp(p, "i")));
  const missing = patterns.filter((re) => !re.test(code || ""));
  if (missing.length === patterns.length && patterns.length > 0) {
    return { status: "wrong", detail: "Required structures not found in code.", missing: missing.map(String) };
  }

  const run = runBackendSandbox(code, { invoke });
  if (!run.ok) {
    return { status: missing.length ? "partial" : "wrong", detail: run.error, logs: run.logs };
  }

  if (typeof expect === "function") {
    try {
      const verdict = expect(run.value, run);
      if (verdict === true || verdict === "correct") return { status: "correct", value: run.value, logs: run.logs };
      if (verdict === "partial") return { status: "partial", value: run.value, logs: run.logs };
      return { status: "wrong", value: run.value, logs: run.logs, detail: String(verdict || "assertion failed") };
    } catch (err) {
      return { status: "wrong", detail: err.message, logs: run.logs };
    }
  }

  if (missing.length) return { status: "partial", value: run.value, logs: run.logs, missing: missing.map(String) };
  return { status: "correct", value: run.value, logs: run.logs };
}

export default { runBackendSandbox, gradeBackendLesson };

# AI lesson cache (file-based)

Responses from the AI lesson pipeline are stored on disk so that:

- **Restarts**: Cache survives server restarts.
- **Deploy**: Bundle `cache/` with your app so users get fast responses. The `cache/` folder is **not** in `.gitignore`, so committing and pushing the repo includes it in the deploy (e.g. Railway). No extra build step needed.
- **Local testing**: Run lessons locally once to fill the cache; same keys on production (or in a pre-warmed bundle) serve from cache.

## Where

- **Directory**: `./cache` at project root (override with env **`CACHE_DIR`**, e.g. `/data/cache` on Railway).
- **Layout**: `cache/intro/`, `cache/objectives/`, `cache/steps/`, `cache/lesson/`, `cache/validation/` — one JSON file per key (key is hashed for the filename). **`VALIDATION_CACHE_VERSION`** in `server/index.js` is part of the validation hash; bump it when changing validation prompts or step fields (e.g. success criteria) so stale entries are not reused.

## Clearing cache for one lesson (to test prompt changes)

To re-fetch a single lesson from the AI (e.g. after changing step-detail or blueprint prompts):

```bash
node scripts/clear-lesson-cache.js "<track>" "<lessonTitle>" <lessonIndex>
```

Example (React JS, 5th lesson “Conditional Rendering with Ternary”, index 4):

```bash
npm run clear-lesson-cache -- "react-js" "Conditional Rendering with Ternary" 4
```

Then restart the server (or leave it running; file cache is read on each request) and open that lesson again. It will be regenerated.

To clear **all** cached lessons, delete the `cache/` folder (or the `intro`, `objectives`, `steps`, and `lesson` subdirs).

### Algorithm lessons (algo-js, algo-ts, algo-python, algo-java)

After fixing algo prompts (e.g. lesson → example → flowchart → code-from-scratch), clear only algo cache and re-warm a few to test:

```bash
npm run clear-algo-cache
ALGO_LIMIT=5 TRACK=algo-js npm run warm-cache-algo
```

- **clear-algo-cache**: Removes all cached entries for the four algo tracks (intro, objectives, steps, lesson).
- **warm-cache-algo**: Warms only algorithm lessons. Use `ALGO_LIMIT=5` (default) to test a few; omit or set higher to warm more. Use `TRACK=algo-js` to warm one language only. Use `ONLY_PENDING=true` to skip already-cached lessons.

## Pre-warming (recommended before deploy)

Fill the cache so users get ready responses without waiting for the AI. You can either run the standalone script (no server) or warm via the running server.

1. Start the server: `npm run server`
2. Run the warm script: `npm run warm-cache`  
   It POSTs intro, objectives, and full lesson for each entry in **`scripts/lessons-to-warm.json`**.
3. Edit **`scripts/lessons-to-warm.json`** so `track` and `lessonTitle` match what the app sends (e.g. `react-js`, `Counter App`). Alternatively run **`npm run warm-cache-standalone`** (no server needed): set `DEEPSEEK_API_KEY` in `.env`; same JSON, script writes directly to `cache/`.
4. Either:
   - **Commit** `cache/` (remove `cache` from `.gitignore` if you want it in the repo), or
   - **Copy** `cache/` into your Docker image / deploy artifact so it’s available at runtime.

## Railway / hosted env

- Set **`CACHE_DIR`** to a path that is persisted (e.g. a volume), or leave default and include `cache/` in the image after running `warm-cache` in CI or locally and copying the folder into the build.
- Same app (UI + server + cache dir) then serves cached responses to users without calling the AI again for those lessons.

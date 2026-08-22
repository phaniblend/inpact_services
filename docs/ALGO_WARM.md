# Warming the Algorithms Cache (110 lessons, 24 partitions)

The Algorithms tab shows 110 lessons (Arrays/HashMap → Two Pointers → … → DP). Lessons are served from **content** (if a file exists), then **cache**, then **AI**. To pre-fill the cache so every click is fast:

## 1. Rebuild the warm list (includes algorithms)

```bash
node scripts/build-lessons-to-warm.js
```

This updates `scripts/lessons-to-warm.json` and adds 110 entries for `track: "algorithms"` (plus all other tracks).

## 2. Warm only algorithms, 24 parallel workers

From the project root, with your API key set (e.g. in `.env`):

```bash
# Optional: skip lessons already in cache (e.g. after a previous partial run)
set ONLY_PENDING=true

# Run 24 workers; each warms a disjoint 1/24 of the algorithms list
TRACK=algorithms TOTAL_PARTITIONS=24 node scripts/warm-cache-parallel.js
```

- **Windows (CMD):** `set ONLY_PENDING=true` then `set TRACK=algorithms` then `set TOTAL_PARTITIONS=24` then `node scripts/warm-cache-parallel.js`
- **Windows (PowerShell):** `$env:ONLY_PENDING="true"; $env:TRACK="algorithms"; $env:TOTAL_PARTITIONS="24"; node scripts/warm-cache-parallel.js`
- **Linux/macOS:** `ONLY_PENDING=true TRACK=algorithms TOTAL_PARTITIONS=24 node scripts/warm-cache-parallel.js`

Each of the 24 child processes runs `warm-cache-standalone.js` with:

- `TRACK=algorithms` (only algorithms lessons)
- `PARTITION_INDEX=0` … `23` and `TOTAL_PARTITIONS=24`

So each worker warms about 5 lessons (110 ÷ 24). Same cache dir; no overlap.

## 3. When ready to test

1. Start the backend: `npm run server`
2. Start the frontend: `npm run dev`
3. Open the app → **Algorithms**. You should see **110 lessons** (Two Sum, Contains Duplicate, … through Unique Paths).
4. Click any lesson. If it’s in cache or content, it loads immediately; otherwise the server generates it on demand (slower).

Lesson 1 (Two Sum) is already in **content** (`content/algorithms/001_Two_Sum_lesson.json`), so it never hits cache/AI. The rest are filled by the warm run.

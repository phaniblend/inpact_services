# AI lessons — environment variables

Used when `VITE_USE_AI_LESSONS=true`. **Do not hardcode secrets.** AI is **DeepSeek only**.

## Client (Vite / project root `.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_USE_AI_LESSONS` | No (default: off) | Set to `"true"` to route lesson card clicks to the AI pipeline. |
| `VITE_AI_USE_SERVER` | **Recommended for real AI** | Set to `"true"` to call the Node server for lessons (API key stays on server, no CORS). Run `npm run server` in a separate terminal. |
| `VITE_DEEPSEEK_API_KEY` | Only if not using server | Your DeepSeek API key for **client-side** AI (browser; may hit CORS). Not needed when `VITE_AI_USE_SERVER=true`. |
| `VITE_AI_USE_MOCK_ONLY` | No | Set to `"true"` to force mock only (no real API calls). |

## Server (same `.env` or env when running `npm run server`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | For real AI | DeepSeek API key. Server also accepts `VITE_DEEPSEEK_API_KEY`. Key never sent to the browser. |
| `PORT` | No (default: 3000) | Port for the AI server. Vite proxies `/api` to `http://localhost:3000` by default. |

## Runtime behavior

1. **Server path (recommended):** Set `VITE_AI_USE_SERVER=true` and run `npm run server`. Frontend POSTs to `/api/lessons/generate`; Vite proxies to the Node server; server uses DeepSeek. No key in the browser, no CORS.
2. **Client path:** Set `VITE_DEEPSEEK_API_KEY` and do **not** set `VITE_AI_USE_SERVER`. Browser calls DeepSeek directly (may hit CORS).
3. **Mock path:** If real AI fails or `VITE_AI_USE_MOCK_ONLY=true`, the app uses the mock lesson service.
4. **Local path:** User clicks "Use local lesson instead" or AI is off → existing hardcoded lesson engine.

## Example setup (server — recommended)

**Project root `.env`:**
```env
VITE_USE_AI_LESSONS=true
VITE_AI_USE_SERVER=true

# Server only (not exposed to client)
DEEPSEEK_API_KEY=sk-...
```

**Terminal 1:** `npm run server`  
**Terminal 2:** `npm run dev`

Then open a lesson; the app will call the server, which uses DeepSeek.

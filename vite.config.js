import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { vitePluginLocalReview } from './vite-plugin-local-review.js'

// vite.config.js runs before Vite's own env loading applies to process.env,
// so load .env here explicitly (same pattern as server/index.js).
dotenv.config()

// https://vite.dev/config/
// AI server port must match where you run npm run server (default 3000; if you change it, set
// VITE_AI_SERVER_PORT to match — NOT plain PORT, which is ambiguous with whatever launches Vite
// itself. A dev-server launcher setting PORT=5173 for its own bookkeeping would otherwise make
// this proxy target itself (silent self-loop, dressed up as random ECONNREFUSED/ENOBUFS noise).
const aiServerPort = process.env.VITE_AI_SERVER_PORT || 3000

export default defineConfig({
  plugins: [react(), vitePluginLocalReview()],
  resolve: {
    // One React instance for the whole app (avoids "Invalid hook call" / useRef on null in HashRouter).
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router', 'react-router-dom'],
  },
  server: {
    // Found live 2026-08-09: with no `host` set, Vite's dev server ended up bound only to
    // [::1]:5173 (IPv6 loopback) in this environment — "localhost:5173" worked (resolved to ::1),
    // but "127.0.0.1:5173" got ERR_CONNECTION_REFUSED, which broke the Google OAuth redirect target
    // (IPF_FRONTEND_URL) AND anyone who just happens to browse via the literal IPv4 address, as the
    // founder does here. `host: true` binds all interfaces so both hostnames reach the same server.
    host: true,
    proxy: {
      // 127.0.0.1, not "localhost" — Node's dual-stack resolution of "localhost" (racing ::1
      // against 127.0.0.1) is flaky under some environments' network stacks, surfacing as
      // intermittent ECONNREFUSED/EADDRINUSE/ENOBUFS from the proxy for no code-level reason.
      // Pinning to the literal IPv4 address sidesteps the race entirely.
      // OneDev and Mattermost pass-through now live server-side at /api/onedev and
      // /api/mattermost (server/index.js) — gated by a real session check instead of this
      // dev-only proxy injecting admin credentials with no auth. This one rule covers both,
      // same as every other /api/* route, as long as `npm run server` is running locally.
      '/api': { target: `http://127.0.0.1:${aiServerPort}`, changeOrigin: true },
    },
  },
})

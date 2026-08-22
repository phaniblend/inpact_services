# Google Sign-In (Firebase) — test locally

## Does it work?

- **In code:** Yes. When all `VITE_FIREBASE_*` variables are set (see `.env.example`), `isFirebaseConfigured` is true, the **Google** button is enabled, and `signInWithGoogle()` runs `signInWithPopup` with `GoogleAuthProvider`.
- **In your workspace:** There is **no committed `.env`** — without it, the UI shows **“Google (set up Firebase)”** disabled. That is expected until you add secrets locally.
- **Quick check:** Create `.env` from `.env.example`, paste your Firebase web config, restart `npm run dev`, open **Log in** → **Google**. The popup should open; after sign-in the modal closes and your name appears in the header.

## 1. Create a Firebase project (free)

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. **Add project** (or use an existing one). No Blaze plan needed.
3. **Build → Authentication** → **Get started** → **Sign-in method** → enable **Google** (support email), save.

## 2. Register your web app

1. Project overview → **</>** (Web).
2. Register app (e.g. `inpact-web`).
3. Copy the `firebaseConfig` values into `.env` as in `.env.example`.

## 3. Env vars

Restart the dev server after changing `.env` (`npm run dev`).

## 4. Lesson access rules (browser `localStorage`)

| Milestone | Behavior |
|-----------|----------|
| Unique lessons 1–5 | No register prompt |
| Unique 6–8 | Soft register modal; can **Continue without registering** or use Google / form |
| Unique 9 (unregistered) | **Must** register — modal cannot be dismissed without signing in |
| Unique 10–15 (registered) | Free |
| Unique 16+ | **$1** per new lesson (balance + fund buckets UI; payment integration later) |

**Localhost:** Firebase allows `localhost` by default. For production, add your domain under **Authentication → Settings → Authorized domains**.

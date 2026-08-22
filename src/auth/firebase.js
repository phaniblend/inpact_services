/**
 * Firebase Auth (optional). If VITE_FIREBASE_* env vars are set, Google sign-in is enabled.
 * Get config: Firebase Console → Project settings → Your apps → Add app → Web (config object).
 */

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured =
  config.apiKey && config.authDomain && config.projectId;

let auth = null;

export async function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null;
  if (auth) return auth;
  const { initializeApp } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const app = initializeApp(config);
  auth = getAuth(app);
  return auth;
}

export async function signInWithGoogle() {
  const a = await getFirebaseAuth();
  if (!a) throw new Error("Firebase not configured");
  const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(a, provider);
  return result.user; // { displayName, email, uid, photoURL, ... }
}

/** Call on log out so Google sessions do not stay active when the user leaves. */
export async function signOutFirebase() {
  const a = await getFirebaseAuth();
  if (!a) return;
  const { signOut } = await import("firebase/auth");
  await signOut(a);
}

/** Shape used across the app after any sign-in. */
export function profileFromFirebaseUser(u) {
  if (!u) return null;
  return {
    id: u.uid,
    name: u.displayName || u.email?.split("@")[0] || "Learner",
    emailOrPhone: u.email || "",
    avatarUrl: u.photoURL || "",
  };
}

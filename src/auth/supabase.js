import { createClient } from "@supabase/supabase-js";
import { isEduEmail } from "./lessonAccess.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);

function getEmailRedirectTo() {
  if (typeof window === "undefined") return undefined;
  // Site URL in Supabase should match this origin (hash routes load from /).
  return `${window.location.origin}/`;
}

export async function signUpWithEmail(email, password, displayName) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: getEmailRedirectTo(),
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/** Passwordless sign-in / sign-up email; only for .edu (student pricing). Same tab must finish the link (PKCE). */
export async function sendStudentEduMagicLink(email) {
  if (!supabase) throw new Error("Supabase not configured");
  const trimmed = (email || "").trim();
  if (!isEduEmail(trimmed)) {
    throw new Error("Magic links for the student rate are only sent to .edu addresses.");
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
}

/** Sends Supabase “reset password” email; link must match URL allow list + Site URL. */
export async function sendPasswordResetEmail(email) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getEmailRedirectTo(),
  });
  if (error) throw error;
}

export async function updateUserPassword(newPassword) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

/** Supabase Auth user ids are UUIDs. Firebase (or local demo) ids must not hit `profiles` / RLS keyed on `auth.users`. */
export function isSupabaseAuthUserId(id) {
  if (typeof id !== "string" || !id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/** Upsert profile row after sign-in (called from auth listener). */
export async function upsertProfile(user) {
  if (!supabase || !user || !isSupabaseAuthUserId(user.id)) return;
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      avatar_url: user.user_metadata?.avatar_url || "",
    },
    { onConflict: "id" }
  );
}

/** Record that a user started a lesson (idempotent — won't overwrite completion). */
export async function recordLessonStart(userId, track, lessonIndex, lessonTitle) {
  if (!supabase || !userId || !isSupabaseAuthUserId(userId)) return;
  await supabase.from("lesson_activity").upsert(
    {
      user_id: userId,
      track,
      lesson_index: lessonIndex,
      lesson_title: lessonTitle || "",
    },
    { onConflict: "user_id,track,lesson_index", ignoreDuplicates: true }
  );
}

/** Mark a lesson as completed with time spent. */
export async function recordLessonComplete(userId, track, lessonIndex, timeSpentSeconds = 0) {
  if (!supabase || !userId || !isSupabaseAuthUserId(userId)) return;
  await supabase
    .from("lesson_activity")
    .update({ completed_at: new Date().toISOString(), time_spent_seconds: timeSpentSeconds })
    .eq("user_id", userId)
    .eq("track", track)
    .eq("lesson_index", lessonIndex);
}

/** Get count of completed lessons for a user. */
export async function getCompletedCount(userId) {
  if (!supabase || !userId || !isSupabaseAuthUserId(userId)) return 0;
  const { count } = await supabase
    .from("lesson_activity")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("completed_at", "is", null);
  return count || 0;
}

/** Get all lesson activity for a user. */
export async function getLessonActivity(userId) {
  if (!supabase || !userId || !isSupabaseAuthUserId(userId)) return [];
  const { data } = await supabase
    .from("lesson_activity")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: true });
  return data || [];
}

/** Get user balance in cents. */
export async function getProfileBalance(userId) {
  if (!supabase || !userId || !isSupabaseAuthUserId(userId)) return 0;
  const { data } = await supabase
    .from("profiles")
    .select("balance_cents")
    .eq("id", userId)
    .single();
  return data?.balance_cents || 0;
}

/** Update user balance. */
export async function setProfileBalance(userId, cents) {
  if (!supabase || !userId || !isSupabaseAuthUserId(userId)) return;
  await supabase
    .from("profiles")
    .update({ balance_cents: Math.max(0, cents) })
    .eq("id", userId);
}

/** Record a payment event. */
export async function recordPayment(userId, amountCents, type = "fund_load") {
  if (!supabase || !userId || !isSupabaseAuthUserId(userId)) return;
  await supabase.from("payments").insert({
    user_id: userId,
    amount_cents: amountCents,
    type,
  });
}

import { useState, useEffect } from "react";
import {
  setRegistered,
  FREE_LESSONS_AFTER_REGISTER,
  hasEverRegistered,
} from "./lessonAccess.js";
import {
  isSupabaseConfigured,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordResetEmail,
  updateUserPassword,
  getUser,
} from "./supabase.js";
import {
  isFirebaseConfigured,
  signInWithGoogle,
  profileFromFirebaseUser,
} from "./firebase.js";

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  fontFamily: "'DM Sans', sans-serif",
};
const card = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "28px 32px",
  maxWidth: "420px",
  width: "90%",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};
const titleStyle = { fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "8px" };
const sub = { fontSize: "13px", color: "#64748b", marginBottom: "20px", lineHeight: 1.5 };
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  fontSize: "14px",
  marginBottom: "12px",
};
const btn = (primary) => ({
  width: "100%",
  padding: "12px 16px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  background: primary ? "#00d4ff" : "transparent",
  color: primary ? "#052545" : "#64748b",
  border: primary ? "none" : "1px solid #e2e8f0",
  marginTop: "8px",
});
const hardCallout = {
  marginBottom: "20px",
  padding: "14px 16px",
  background: "rgba(0,212,255,0.12)",
  borderLeft: "4px solid #00d4ff",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#0f172a",
  lineHeight: 1.55,
};
const errText = { fontSize: "12px", color: "#dc2626", marginTop: "-8px", marginBottom: "8px" };
const successBox = {
  textAlign: "center",
  padding: "20px 0",
};
const successIcon = {
  fontSize: "48px",
  marginBottom: "16px",
};
const successTitle = {
  fontSize: "18px",
  fontWeight: 600,
  color: "#0f172a",
  marginBottom: "8px",
};
const successSub = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: 1.6,
  marginBottom: "20px",
};
const tabRow = {
  display: "flex",
  gap: "0",
  marginBottom: "20px",
  borderBottom: "2px solid #e2e8f0",
};
const tab = (active) => ({
  flex: 1,
  padding: "10px 0",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  background: "none",
  border: "none",
  borderBottom: active ? "2px solid #00d4ff" : "2px solid transparent",
  color: active ? "#0f172a" : "#94a3b8",
  marginBottom: "-2px",
});
const linkBtn = {
  background: "none",
  border: "none",
  color: "#0369a1",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
  marginTop: "10px",
  padding: 0,
  textAlign: "left",
  textDecoration: "underline",
};

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());
}

function getDismissButtonText(dismissCount) {
  if (dismissCount >= 1) return "I'll create an account before my next lesson";
  return "Not now — remind me later";
}

function mapGoogleSignInError(err) {
  const code = err?.code || "";
  const msg = (err?.message || "").trim();
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request")
    return "Sign-in was closed before it finished. Try again when you’re ready.";
  if (code === "auth/popup-blocked") return "Your browser blocked the pop-up. Allow pop-ups for this site and try again.";
  if (code === "auth/network-request-failed") return "Network error. Check your connection and try again.";
  return msg || "Google sign-in didn’t complete. Please try again.";
}

/** Map Supabase Auth errors to a short line + optional setup hint for operators. */
function mapSignUpError(err) {
  const raw = (err?.message || "").trim();
  const lower = raw.toLowerCase();
  if (
    lower.includes("confirmation email") ||
    lower.includes("error sending") ||
    (lower.includes("send") && lower.includes("email")) ||
    lower.includes("smtp") ||
    lower === "email rate limit exceeded"
  ) {
    return {
      message: "Couldn\u2019t send the confirmation email.",
      hint:
        "Email delivery isn\u2019t working for this install. Try again later, or ask an operator to check outbound mail settings. For local testing, registration can be allowed without email confirmation.",
    };
  }
  return { message: raw || "Sign-up failed. Please try again.", hint: "" };
}

export default function RegisterModal({
  onSuccess,
  onClose,
  variant = "soft",
  voluntary = false,
  dismissCount = 0,
  softGateKind = null,
  passwordRecovery = false,
  onPasswordRecoveryComplete,
}) {
  const isHard = variant === "hard";
  const isLoginWall = variant === "loginWall";
  const isStartFree = variant === "startFree";
  const [startFreeStep, setStartFreeStep] = useState("pick");
  const [mode, setMode] = useState(() =>
    isLoginWall || isStartFree ? "login" : "register"
  );

  useEffect(() => {
    if (isStartFree) {
      setStartFreeStep("pick");
      setMode("login");
    }
  }, [isStartFree, variant]);
  const [loginAux, setLoginAux] = useState("form"); // form | forgot | forgotSent
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitErrorHint, setSubmitErrorHint] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const handleGoogleSignIn = async () => {
    setSubmitError("");
    setSubmitErrorHint("");
    if (!isFirebaseConfigured) {
      setSubmitError("Google sign-in isn’t set up on this install yet.");
      return;
    }
    setSubmitLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      const profile = profileFromFirebaseUser(fbUser);
      if (profile) setRegistered(profile);
      onSuccess?.({ flow: "google" });
    } catch (err) {
      setSubmitError(mapGoogleSignInError(err));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitErrorHint("");
    const n = name.trim();
    const em = email.trim();
    if (n.length < 2) {
      setSubmitError("Name must be at least 2 characters.");
      return;
    }
    if (!isValidEmail(em)) {
      setSubmitError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters.");
      return;
    }
    if (!isSupabaseConfigured) {
      setRegistered({ name: n, emailOrPhone: em });
      onSuccess?.({ flow: "register" });
      return;
    }
    setSubmitLoading(true);
    try {
      const data = await signUpWithEmail(em, password, n);
      if (data?.user?.identities?.length === 0) {
        setSubmitError("An account with this email already exists. Try logging in.");
        setSubmitLoading(false);
        return;
      }
      // If "Confirm email" is off in Supabase, you get a session immediately.
      if (data?.session?.user) {
        const user = data.session.user;
        setRegistered({
          id: user.id,
          name: user.user_metadata?.display_name || user.user_metadata?.full_name || n,
          emailOrPhone: user.email || em,
          avatarUrl: user.user_metadata?.avatar_url || "",
        });
        onSuccess?.({ flow: "register" });
        return;
      }
      setConfirmationEmail(em);
      setConfirmationSent(true);
    } catch (err) {
      const { message, hint } = mapSignUpError(err);
      setSubmitError(message);
      setSubmitErrorHint(hint);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitErrorHint("");
    const em = email.trim();
    if (!isValidEmail(em)) {
      setSubmitError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setSubmitError("Enter your password.");
      return;
    }
    if (!isSupabaseConfigured) {
      setRegistered({ name: em.split("@")[0], emailOrPhone: em });
      onSuccess?.({ flow: "login" });
      return;
    }
    setSubmitLoading(true);
    try {
      const data = await signInWithEmail(em, password);
      const user = data?.user;
      setRegistered({
        id: user?.id,
        name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || em.split("@")[0],
        emailOrPhone: user?.email || em,
        avatarUrl: user?.user_metadata?.avatar_url || "",
      });
      onSuccess?.();
    } catch (err) {
      const msg = err?.message || "Login failed.";
      if (msg.includes("Email not confirmed")) {
        setSubmitError("Please confirm your email first. Check your inbox (and spam) for the confirmation link.");
      } else if (msg.includes("Invalid login credentials")) {
        setSubmitError("Invalid email or password.");
        setSubmitErrorHint(
          "Passwords are case-sensitive. If you already confirmed your email, try Forgot password. If you have not confirmed yet, use the link in your signup email first."
        );
      } else {
        setSubmitError(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const dismissText = getDismissButtonText(dismissCount);

  const handleContinueWithoutRegistering = () => {
    onClose?.();
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitErrorHint("");
    const em = email.trim();
    if (!isValidEmail(em)) {
      setSubmitError("Enter a valid email address.");
      return;
    }
    setSubmitLoading(true);
    try {
      await sendPasswordResetEmail(em);
      setLoginAux("forgotSent");
    } catch (err) {
      setSubmitError(err?.message || "Could not send reset email.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePasswordRecoverySubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitErrorHint("");
    if (newPassword.length < 8) {
      setSubmitError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }
    setSubmitLoading(true);
    try {
      await updateUserPassword(newPassword);
      const user = await getUser();
      if (user) {
        setRegistered({
          id: user.id,
          name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          emailOrPhone: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
        });
      }
      onSuccess?.({ flow: "login" });
      onPasswordRecoveryComplete?.();
    } catch (err) {
      setSubmitError(err?.message || "Could not update password.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const softGateFirstSub =
    "Create a free account to sync progress across devices and unlock the rest of your included lessons — no spam, just fewer interruptions later.";
  const softGateSecondSub =
    "You’re on a streak. A free account holds your place and opens everything that comes with registration — a fair trade for under a minute.";
  const extraFreeLabel =
    FREE_LESSONS_AFTER_REGISTER === 1 ? "one more included lesson" : `${FREE_LESSONS_AFTER_REGISTER} more included lessons`;
  const softVoluntarySub = hasEverRegistered()
    ? "You already have an account. Log in to pick up any remaining included lessons on this browser."
    : `Use your email, or sign in with Google. After your guest previews, registering unlocks ${extraFreeLabel} and saved progress.`;
  const hardGateCallout = `You’ve had two commitment-free previews in this browser. To open the next lesson — and the rest of your free tier — sign in or create an account. We’ve saved a seat for you.`;
  const loginWallCallout =
    "You’ve used your guest previews on this browser. Log in with the account you created to continue and use any remaining included lessons.";
  const startFreeSub =
    "Sign in with Google for the fastest path, or use your email if you already have an account. Want to look around first? You can continue without signing in.";

  if (passwordRecovery) {
    return (
      <div style={overlay} onClick={(e) => e.stopPropagation()}>
        <div style={card} onClick={(e) => e.stopPropagation()}>
          <div style={titleStyle}>Set a new password</div>
          <div style={sub}>Choose a password for your Inpact account, then you&apos;ll be signed in.</div>
          <form onSubmit={handlePasswordRecoverySubmit}>
            <input
              type="password"
              placeholder="New password (8+ characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={inputStyle}
              autoComplete="new-password"
            />
            {submitError && <div style={errText} role="alert">{submitError}</div>}
            <button type="submit" style={btn(true)} disabled={submitLoading || !newPassword || !confirmNewPassword}>
              {submitLoading ? "Saving\u2026" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (confirmationSent) {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={successBox}>
            <div style={successIcon}>&#9993;</div>
            <div style={successTitle}>Check your email</div>
            <div style={successSub}>
              We sent a confirmation link to <strong>{confirmationEmail}</strong>.
              <br />
              Click the link in the email to verify your account, then come back and log in.
              <br />
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Didn&apos;t get it? Check your spam folder.
              </span>
            </div>
            <button
              type="button"
              style={btn(true)}
              onClick={() => {
                setConfirmationSent(false);
                setMode("login");
                setPassword("");
              }}
            >
              Got it &mdash; take me to log in
            </button>
            {!isHard && !isLoginWall && (
              <button type="button" style={btn(false)} onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isStartFree && startFreeStep === "pick") {
    return (
      <div
        style={overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        <div style={card} onClick={(e) => e.stopPropagation()}>
          <div style={titleStyle}>Start learning free</div>
          <div style={sub}>{startFreeSub}</div>
          {submitError && <div style={errText}>{submitError}</div>}
          <button
            type="button"
            style={{
              ...btn(true),
              background: "#ffffff",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
            onClick={handleGoogleSignIn}
            disabled={submitLoading || !isFirebaseConfigured}
          >
            {submitLoading ? "\u2026" : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          {!isFirebaseConfigured ? (
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
              Google sign-in is not available on this install yet.
            </div>
          ) : null}
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#94a3b8",
              margin: "14px 0",
            }}
          >
            or
          </div>
          <button type="button" style={btn(true)} onClick={() => { setStartFreeStep("email"); setSubmitError(""); }} disabled={submitLoading}>
            I already use Inpact with email
          </button>
          <button type="button" style={btn(false)} onClick={onClose} disabled={submitLoading}>
            Continue without signing in
          </button>
        </div>
      </div>
    );
  }

  const modalTitle = isLoginWall
    ? "Log in to continue"
    : isHard
      ? "Unlock your next lesson"
      : voluntary
        ? "Log in or register"
        : softGateKind === "second"
          ? "Ready whenever you are"
          : "Save your progress for free";

  const modalSub = isLoginWall ? (
    <div style={hardCallout} role="alert">
      {loginWallCallout}
    </div>
  ) : isHard ? (
    <div style={hardCallout} role="alert">
      {hardGateCallout}
    </div>
  ) : voluntary ? (
    <div style={sub}>{softVoluntarySub}</div>
  ) : softGateKind === "second" ? (
    <div style={sub}>{softGateSecondSub}</div>
  ) : (
    <div style={sub}>{softGateFirstSub}</div>
  );

  const showGoogleOnForm = isFirebaseConfigured && !isLoginWall && !passwordRecovery && !isStartFree;
  const showGoogleOnStartFreeEmail = isFirebaseConfigured && isStartFree && startFreeStep === "email";

  return (
    <div
      style={overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isHard && !isLoginWall && onClose) onClose();
      }}
    >
      <div style={card} onClick={(e) => e.stopPropagation()}>
        {isStartFree && startFreeStep === "email" ? (
          <button
            type="button"
            style={{ ...linkBtn, marginBottom: "12px" }}
            onClick={() => {
              setStartFreeStep("pick");
              setSubmitError("");
              setSubmitErrorHint("");
            }}
          >
            &larr; Other sign-in options
          </button>
        ) : null}
        <div style={titleStyle}>{isStartFree && startFreeStep === "email" ? "Sign in or create an account" : modalTitle}</div>
        {isStartFree && startFreeStep === "email" ? <div style={sub}>{startFreeSub}</div> : modalSub}

        {showGoogleOnForm || showGoogleOnStartFreeEmail ? (
          <>
            <button
              type="button"
              style={{
                ...btn(true),
                background: "#ffffff",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
              onClick={handleGoogleSignIn}
              disabled={submitLoading}
            >
              {submitLoading ? "\u2026" : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#94a3b8",
                margin: "14px 0",
              }}
            >
              or use email
            </div>
          </>
        ) : null}

        {!isSupabaseConfigured && (
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginBottom: "16px",
              padding: "10px 12px",
              background: "#f8fafc",
              borderRadius: "8px",
            }}
          >
            Account sync is not configured on this install. You can still register locally for testing.
          </div>
        )}

        {!isLoginWall ? (
          <div style={tabRow}>
            <button
              type="button"
              style={tab(mode === "register")}
              onClick={() => {
                setMode("register");
                setLoginAux("form");
                setSubmitError("");
                setSubmitErrorHint("");
              }}
            >
              Register
            </button>
            <button
              type="button"
              style={tab(mode === "login")}
              onClick={() => {
                setMode("login");
                setLoginAux("form");
                setSubmitError("");
                setSubmitErrorHint("");
              }}
            >
              Log in
            </button>
          </div>
        ) : null}

        {mode === "register" && !isLoginWall ? (
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} autoComplete="name" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
            <input type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoComplete="new-password" />
            {submitError && (
              <div role="alert">
                <div style={errText}>{submitError}</div>
                {submitErrorHint ? (
                  <div style={{ ...errText, color: "#64748b", marginTop: "4px", lineHeight: 1.5 }}>{submitErrorHint}</div>
                ) : null}
              </div>
            )}
            <button type="submit" style={btn(true)} disabled={submitLoading || !name.trim() || !email.trim() || !password}>
              {submitLoading ? "Creating account\u2026" : "Register"}
            </button>
            {!isHard && !isLoginWall && !voluntary && !isStartFree && (
              <button type="button" style={btn(false)} onClick={handleContinueWithoutRegistering}>
                {dismissText}
              </button>
            )}
          </form>
        ) : loginAux === "forgot" ? (
          <form onSubmit={handleForgotSubmit}>
            <div style={{ ...sub, marginTop: 0 }}>We&apos;ll email you a link to reset your password.</div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
            {submitError && <div style={errText} role="alert">{submitError}</div>}
            <button type="submit" style={btn(true)} disabled={submitLoading || !email.trim()}>
              {submitLoading ? "Sending\u2026" : "Send reset link"}
            </button>
            <button type="button" style={linkBtn} onClick={() => { setLoginAux("form"); setSubmitError(""); }}>
              Back to log in
            </button>
          </form>
        ) : loginAux === "forgotSent" ? (
          <div>
            <div style={successSub}>
              If an account exists for <strong>{email.trim()}</strong>, we sent a reset link. Check inbox and spam, then open the link on this same device/browser.
            </div>
            <button type="button" style={btn(true)} onClick={() => { setLoginAux("form"); setSubmitError(""); }}>
              Back to log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoComplete="current-password" />
            {isSupabaseConfigured && (
              <button type="button" style={linkBtn} onClick={() => { setLoginAux("forgot"); setSubmitError(""); setSubmitErrorHint(""); }}>
                Forgot password?
              </button>
            )}
            {submitError && (
              <div role="alert">
                <div style={errText}>{submitError}</div>
                {submitErrorHint ? (
                  <div style={{ ...errText, color: "#64748b", marginTop: "4px", lineHeight: 1.5 }}>{submitErrorHint}</div>
                ) : null}
              </div>
            )}
            <button type="submit" style={btn(true)} disabled={submitLoading || !email.trim() || !password}>
              {submitLoading ? "Logging in\u2026" : "Log in"}
            </button>
            {!isHard && !isLoginWall && !voluntary && !isStartFree && (
              <button type="button" style={btn(false)} onClick={handleContinueWithoutRegistering}>
                {dismissText}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

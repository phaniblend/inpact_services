import { useState, useEffect, useCallback } from "react";

/** Current session, polled once on mount from /api/auth/me — the same endpoint the backend's
 * requireRole() middleware checks against, so "can the UI show this" and "will the API actually
 * allow it" never disagree. { session, status: 'loading'|'signedIn'|'signedOut', refresh, logout } */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");

  // Deliberately doesn't flip to "loading" synchronously before the fetch — the initial useState
  // already starts there for the first render, and re-checking later (e.g. right after a login
  // form succeeds) reads better showing the previous state until the new one resolves than a
  // flash back to "Checking session…". Also sidesteps calling setState synchronously inside the
  // mount effect below, which React's own lint rule flags for good reason (cascading renders).
  const refresh = useCallback(() => {
    return fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSession(data);
        setStatus(data ? "signedIn" : "signedOut");
        return data;
      })
      .catch(() => {
        setSession(null);
        setStatus("signedOut");
        return null;
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setStatus("signedOut");
  }

  return { session, status, refresh, logout };
}

/** True if `session` (from useAuth) satisfies one of `allowedRoles` — same rule the backend's
 * requireRole() uses: a -core account's coreRole (e.g. "PD-core") also satisfies its bare role
 * name ("PD"), since a -core employee already IS their role rather than needing it explicitly
 * granted. Kept as a plain function (not a hook) so it's usable both inside components and in
 * plain conditionals without violating hook rules. */
export function hasRole(session, allowedRoles) {
  if (!session) return false;
  const coreRoleBare = session.coreRole?.replace(/-core$/, "");
  const effective = new Set([...(session.roles || []), ...(coreRoleBare ? [coreRoleBare] : [])]);
  return allowedRoles.some((r) => effective.has(r));
}

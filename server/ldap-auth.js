/**
 * LDAP-backed authentication for `-core` roles (PD-core, PMGT-core, ID-core, ...) — IPF's own
 * salaried employees, per the identity design in docs/IPF_DEVGUIDE.md §5a. Points at a local dev
 * LDAP container (ipf-ldap, seeded via scripts, docs in §5a) for now — swapping to a real
 * corporate directory later is only a connection-string change (LDAP_URL/LDAP_BASE_DN/LDAP_CORE_OU),
 * nothing here is dev-server-specific.
 *
 * Auth strategy: bind as the user with their own password (never read/compare a password hash
 * ourselves — LDAP's own bind operation is the authority on whether credentials are valid), then a
 * second bind as admin to fetch profile attributes (name, email, core role) for the session.
 */
import ldap from "ldapjs";

// Read lazily (function, not top-level const) — this module loads before server/index.js's own
// dotenv.config() call runs (ES imports always evaluate before the importing file's top-level
// code), so a top-level read here would always see undefined. Same class of bug found and fixed
// in auth-session.js; see that file's comment for the full story.
function config() {
  const baseDn = process.env.LDAP_BASE_DN || "dc=inpact,dc=live";
  return {
    url: process.env.LDAP_URL || "ldap://127.0.0.1:389",
    baseDn,
    coreOu: process.env.LDAP_CORE_OU || `ou=core,${baseDn}`,
    // This dev LDAP container doesn't allow anonymous reads (a sane default, not misconfiguration)
    // — discovered live: an unbound search silently returned "No Such Object" instead of a clear
    // permission error. The lookup-by-uid step needs *some* bound identity; a low-privilege
    // read-only service account is the real-world answer, but for this local dev container the
    // admin bind it already ships with is the pragmatic stand-in. Swap for a dedicated bind DN
    // before anything beyond local dev.
    adminDn: process.env.LDAP_ADMIN_DN || `cn=admin,${baseDn}`,
    adminPassword: process.env.LDAP_ADMIN_PASSWORD || "",
  };
}

function createClient() {
  return ldap.createClient({ url: config().url, timeout: 5000, connectTimeout: 5000 });
}

function bind(client, dn, password) {
  return new Promise((resolve, reject) => {
    client.bind(dn, password, (err) => (err ? reject(err) : resolve()));
  });
}

function searchOne(client, base, filter, attributes) {
  return new Promise((resolve, reject) => {
    const results = [];
    client.search(base, { scope: "sub", filter, attributes }, (err, res) => {
      if (err) return reject(err);
      res.on("searchEntry", (entry) => results.push(entry.pojo ?? entry.object));
      res.on("error", reject);
      res.on("end", () => resolve(results[0] || null));
    });
  });
}

/** Authenticates a -core employee by uid + password. Returns their profile (name, email, dn,
 * coreRole parsed from the `description` attribute — e.g. "PD-core") on success, or throws with a
 * message safe to show the user ("Invalid username or password" — never leaks *which* part was
 * wrong, standard practice regardless of how informative LDAP's own error is). */
export async function authenticateCoreUser(uid, password) {
  if (!uid || !password) throw new Error("Username and password are required");
  const { adminDn, adminPassword, coreOu } = config();
  const client = createClient();
  try {
    // Look up the DN by uid first (bind needs a full DN, not a bare username). Bound as the admin
    // service identity purely to read a DN + public-ish profile fields — userPassword is
    // deliberately never in the requested attribute list, so this lookup can't leak a credential
    // even though it's running with elevated read access.
    await bind(client, adminDn, adminPassword);
    const entry = await searchOne(client, coreOu, `(uid=${escapeFilter(uid)})`, ["cn", "mail", "description", "dn"]);
    if (!entry) throw new Error("Invalid username or password");
    const dn = entry.objectName || entry.dn;

    // The real check: bind AS the user with the password they gave us. A second client, since a
    // client can only be bound as one identity at a time and we don't want to downgrade the
    // anonymous search connection's state.
    const authClient = createClient();
    try {
      await bind(authClient, dn, password);
    } catch {
      throw new Error("Invalid username or password");
    } finally {
      authClient.unbind();
    }

    const attrs = Object.fromEntries((entry.attributes || []).map((a) => [a.type, a.values?.[0] ?? a.vals?.[0]]));
    return {
      dn,
      uid,
      name: attrs.cn || uid,
      email: attrs.mail || null,
      coreRole: attrs.description || null, // e.g. "PD-core", "PMGT-core", "ID-core"
    };
  } finally {
    client.unbind();
  }
}

function escapeFilter(value) {
  // Minimal LDAP filter escaping (RFC 4515) — this app only ever puts a login-form uid here, but
  // never trust that as a reason to skip it.
  return String(value).replace(/[\\*()\0]/g, (c) => `\\${c.charCodeAt(0).toString(16).padStart(2, "0")}`);
}

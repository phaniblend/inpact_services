/**
 * Server-side Team Messaging helper — same webhook as src/team-messaging/notify.js,
 * but called directly (no Vite dev-proxy available from a plain Node process).
 */
export async function notifyTeamServer(text) {
  const webhookId = process.env.VITE_MATTERMOST_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("[team-messaging] VITE_MATTERMOST_WEBHOOK_ID not set — skipping notification:", text);
    return;
  }
  try {
    // Local dev: Mattermost's Docker container on localhost. Production: set
    // MATTERMOST_INTERNAL_URL to the private-network address of the Mattermost service.
    const base = (process.env.MATTERMOST_INTERNAL_URL || "http://localhost:8065").replace(/\/+$/, "");
    await fetch(`${base}/hooks/${webhookId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.warn("[team-messaging] notify failed:", err.message);
  }
}

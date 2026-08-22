/**
 * Team Messaging — posts to Mattermost's Town Square via the incoming webhook created for IPF.
 * Self-hosted, no per-seat cost (see design doc). This is the one place any module should call
 * to notify the team — Contribution Monitor's warnings/votes should reuse this too.
 */
const WEBHOOK_ID = import.meta.env.VITE_MATTERMOST_WEBHOOK_ID;

export async function notifyTeam(text) {
  if (!WEBHOOK_ID) {
    console.warn("[team-messaging] VITE_MATTERMOST_WEBHOOK_ID not set — skipping notification:", text);
    return;
  }
  try {
    await fetch(`/api/mattermost/hooks/${WEBHOOK_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    // Notification failure shouldn't block the action that triggered it.
    console.warn("[team-messaging] notify failed:", err.message);
  }
}

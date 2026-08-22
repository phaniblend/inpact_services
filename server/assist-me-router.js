/**
 * Assist Me workspace — a minimal standalone "ask mentor" endpoint.
 * Deliberately bypasses server/mentor/mentor-router.js's session-based lesson-progress
 * plumbing (built for the main track UI) and calls the same underlying DeepSeek client
 * directly — reusing the AI, not the session machinery that doesn't apply outside a track.
 */
import express from "express";
import { completeWithDeepSeek } from "../src/ai-lessons/providers/deepseekClient.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { moduleTag, node, question, thread } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "DEEPSEEK_API_KEY is not set in D:\\IPAAL\\.env" });
    }

    const system = `You are the Ask Mentor assistant inside an assistance module ("${moduleTag}") on Inpact.
The learner is stuck on this step, not asking for the finished answer to be handed over — coach them toward
it. Current step's task: "${node?.paal || ""}". Hint already available to them: "${node?.hint || ""}".
Keep replies short (2-4 sentences), specific to what they actually asked, never just repeat the hint verbatim.`;

    const history = Array.isArray(thread)
      ? thread.map((m) => `${m.role === "user" ? "Learner" : "Mentor"}: ${m.content}`).join("\n")
      : "";
    const user = `${history ? history + "\n" : ""}Learner: ${question}`;

    const reply = await completeWithDeepSeek({ system, user, maxTokens: 400, apiKey });
    res.json({ reply });
  } catch (err) {
    console.error("[assist-me] /ask:", err);
    res.status(500).json({ error: err?.message ?? "Mentor unavailable" });
  }
});

export default router;

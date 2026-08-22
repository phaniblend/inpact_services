import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "SYSTEM DESIGN #12", title: "Real-time systems", body: `WebSocket vs SSE vs long-polling, pub/sub at scale, presence systems, collaborative editing.`, usecase: "Live updates and collaboration." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["WebSocket, SSE, long-polling", "Pub/sub at scale", "Presence and CRDTs"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "When WebSocket vs SSE? How scale pub/sub? How implement presence (who is online)?", answer_keywords: ["WebSocket", "SSE", "pub/sub", "presence", "Redis", "scaling"], seed_code: `// WebSocket: bidirectional; SSE: server->client only
// Pub/sub: Redis Streams, Kafka; scale with partitions
// Presence: heartbeat + last_seen; Redis sorted set`, feedback_correct: "✅ WebSocket bidirectional; SSE one-way; pub/sub scale with partitions; presence via heartbeat.", feedback_wrong: "WebSocket vs SSE; scale pub/sub; presence with heartbeats.", expected: "Real-time" },
];
const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "SD-12", title: "Real-time systems", shortName: "SD — REALTIME" });

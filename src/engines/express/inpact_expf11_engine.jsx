import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "EXPRESS.JS #11",
      title: "WebSockets with Express",
      body: `ws library, socket.io, upgrade handshake, rooms and namespaces.`,
      usecase: "Real-time features alongside HTTP API.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Integrate ws or socket.io with Express", "Handle upgrade handshake", "Use rooms/namespaces"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Attach a WebSocket server (ws) to the same HTTP server as Express. On connection, broadcast to all clients. How does socket.io differ from raw ws?",
    answer_keywords: ["WebSocket", "ws", "server", "upgrade", "socket.io", "broadcast"],
    seed_code: `const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ server: httpServer })
wss.on('connection', (ws) => {
  ws.on('message', (data) => wss.clients.forEach(c => c.send(data)))
})
// socket.io: rooms, fallbacks, reconnection`,
    feedback_correct: "✅ WebSocketServer({ server }); connection/message; broadcast to clients. socket.io adds rooms, fallbacks.",
    feedback_wrong: "Attach WebSocketServer to same server; broadcast on message; socket.io adds rooms and reconnection.",
    expected: "WebSocket with Express",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "EXP-F11", title: "WebSockets with Express", shortName: "EXP — WEBSOCKET" });

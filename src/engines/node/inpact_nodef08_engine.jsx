import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro", type: "reveal", phase: "Lesson",
    content: {
      tag: "NODE.JS #8",
      title: "Net & TCP",
      body: `net.createServer, socket events. Building a raw TCP server. Framing messages (length-prefix, delimiter).`,
      usecase: "Custom protocols, real-time services, non-HTTP servers.",
    },
  },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use net.createServer", "Handle socket data/end/error", "Frame messages for TCP"] },
  {
    id: "step1", type: "question", phase: "Step 1 of 3",
    paal: "Create a TCP server with net.createServer that echoes back received data. How would you frame variable-length messages?",
    answer_keywords: ["net.createServer", "socket", "data", "write", "length-prefix", "frame"],
    seed_code: `const net = require('net')
net.createServer(socket => {
  socket.on('data', data => socket.write(data))
}).listen(7000)
// Framing: 4-byte length header + payload, or delimiter (e.g. \\n)`,
    feedback_correct: "✅ net.createServer, socket.on('data'), socket.write. Length-prefix or delimiter for framing.",
    feedback_wrong: "net.createServer; socket.on('data') and socket.write; frame with length prefix or newline.",
    expected: "TCP server + framing",
  },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: "NODE-F08", title: "Net & TCP", shortName: "NODE — TCP" });

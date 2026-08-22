import createINPACTEngine from "../inpact_engine_shared";

function normalizeCode(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function evalL42Step1(answer) {
  const raw = String(answer || "");
  const hasRef = /const\s+wsRef\s*=\s*useRef\s*<\s*WebSocket\s*\|\s*null\s*>\s*\(\s*null\s*\)/m.test(raw);
  const hasStatusState = /const\s+\[\s*status\s*,\s*setStatus\s*\]\s*=\s*useState\s*<\s*['"]connecting['"]\s*\|\s*['"]open['"]\s*\|\s*['"]closed['"]\s*\|\s*['"]error['"]\s*>/m.test(raw);
  return hasRef && hasStatusState ? "correct" : hasRef || hasStatusState ? "partial" : "wrong";
}

function evalL42Step2(answer) {
  const raw = String(answer || "");
  const hasEffect = /useEffect\s*\(/m.test(raw);
  const hasNew = /new\s+WebSocket\s*\(\s*url\s*\)/m.test(raw);
  const hasAssign = /wsRef\.current\s*=\s*ws/m.test(raw);
  return hasEffect && hasNew && hasAssign ? "correct" : hasEffect && hasNew ? "partial" : "wrong";
}

function evalL42Step3(answer) {
  const raw = String(answer || "");
  const hasOnOpen = /ws\.onopen\s*=/m.test(raw);
  const hasOnClose = /ws\.onclose\s*=/m.test(raw);
  const hasOnError = /ws\.onerror\s*=/m.test(raw);
  const hasSetStatus = /setStatus\s*\(/m.test(raw);
  return hasOnOpen && hasOnClose && hasOnError && hasSetStatus ? "correct"
    : hasOnOpen && hasSetStatus ? "partial" : "wrong";
}

function evalL42Step4(answer) {
  const raw = String(answer || "");
  const hasOnMessage = /ws\.onmessage\s*=/m.test(raw);
  const hasSetMessages = /setMessages\s*\(/m.test(raw);
  const hasParse = /JSON\.parse\s*\(/m.test(raw);
  const hasSpread = /\.\.\.prev/m.test(raw);
  return hasOnMessage && hasSetMessages && hasParse && hasSpread ? "correct"
    : hasOnMessage && hasSetMessages ? "partial" : "wrong";
}

function evalL42Step5(answer) {
  const raw = String(answer || "");
  const hasReturn = /return\s*\(\s*\)/m.test(raw) || /return\s*\{/m.test(raw);
  const hasSendFn = /const\s+send\s*=\s*(?:useCallback)?\s*\(/m.test(raw) || /function\s+send\s*\(/m.test(raw);
  const hasReadyCheck = /wsRef\.current(?:\.readyState|\?\.readyState)/m.test(raw);
  const hasCleanup = /return\s*\(\s*\)\s*=>\s*\{[\s\S]*?wsRef\.current\?\.close\s*\(\s*\)/m.test(raw) ||
    /wsRef\.current\?\.close/m.test(raw);
  return hasSendFn && hasReadyCheck && hasCleanup ? "correct"
    : hasSendFn && hasCleanup ? "partial" : "wrong";
}

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Lesson",
    content: {
      tag: "LESSON #42 (CUSTOM HOOKS)",
      title: "Custom Hook — useWebSocket",
      body: "Build a production-grade useWebSocket hook that manages a WebSocket connection lifecycle, tracks connection status, accumulates incoming messages, and exposes a safe send function — all through a single, reusable hook.",
      usecase:
        "Real-time shipment tracking, live driver location updates, warehouse event feeds — any enterprise UI that needs live data uses WebSockets. Wrapping this complexity in a custom hook means every consumer gets lifecycle safety, status tracking, and cleanup for free.",
    },
  },
  {
    id: "prereqs",
    type: "prereqs",
    phase: "Prerequisites",
    items: [
      {
        lesson: 1,
        label: "JSX — The Full Language",
        reason: "The hook's return value is consumed inside JSX. The status-driven className pattern from Step 6 of Lesson 1 appears in the ShipmentFeed component that uses this hook.",
      },
      {
        lesson: 10,
        label: "useState — Primitives",
        reason: "Step 1 uses useState<'connecting' | 'open' | 'closed' | 'error'>('connecting') to track connection status, and Step 4 uses useState<ShipmentEvent[]>([]) to accumulate incoming messages.",
      },
      {
        lesson: 24,
        label: "useEffect — Mount",
        reason: "Step 2 wraps the WebSocket constructor inside useEffect so the connection opens after mount, not during render.",
      },
      {
        lesson: 25,
        label: "useEffect — Dependencies",
        reason: "Step 2's effect depends on [url] so the connection is torn down and re-established whenever the URL changes — the dependency array is what makes that reactive.",
      },
      {
        lesson: 28,
        label: "fetch + Loading + Error State",
        reason: "The status state in Step 1 mirrors the loading/error state pattern from Lesson 28. The mental model of tracking async lifecycle (pending → success | error) directly transfers to the WebSocket status union.",
      },
      {
        lesson: 33,
        label: "Custom Hook — Extract Logic",
        reason: "The entire lesson is a custom hook. The pattern of extracting state + effects into a useSomething function and returning a named tuple is established in Lesson 33 and applied directly here.",
      },
    ],
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Store a WebSocket instance in a ref so it persists across renders without triggering re-renders",
      "Open a WebSocket connection inside useEffect with a url dependency",
      "Track connection lifecycle using a union status state ('connecting' | 'open' | 'closed' | 'error')",
      "Accumulate incoming JSON messages into state using a functional update",
      "Expose a safe send function that checks readyState before calling ws.send()",
      "Clean up the WebSocket connection in the effect's return function",
    ],
  },

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5",
    paal: "Declare the useWebSocket hook shell. It accepts a url string. Inside, create a wsRef typed as WebSocket | null (initialised to null) and a status state typed as the union 'connecting' | 'open' | 'closed' | 'error' (initialised to 'connecting').",
    hint: "useRef needs an explicit generic when the ref holds a DOM type or class instance — WebSocket | null is the type, null is the initial value.",
    example_code: `function useNotifications(endpoint: string) {
  const socketRef = useRef<EventSource | null>(null);
  const [readyState, setReadyState] = useState<'init' | 'live' | 'dead'>('init');
}`,
    think_prompt:
      "A WebSocket instance needs to survive re-renders without causing them. useState would trigger a re-render every time the instance is reassigned. What React primitive stores a mutable value across renders without re-rendering?",
    mc_options: [
      "useState<WebSocket | null>(null) — so React re-renders when the socket is assigned",
      "useRef<WebSocket | null>(null) — persists across renders without triggering a re-render",
      "a module-level variable outside the hook — so all hook instances share the same socket",
    ],
    mc_correct_option:
      "useRef<WebSocket | null>(null) — persists across renders without triggering a re-render",
    mc_anchor:
      "useRef stores the WebSocket instance in .current — reads and writes don't trigger re-renders. useState would cause a render every time the socket is created or replaced, which is wasteful and potentially unsafe. A module-level variable would be shared across all hook consumers — a bug waiting to happen in any app with multiple feeds.",
    why_this_matters:
      "In enterprise real-time dashboards, a WebSocket ref pattern is standard. The socket is infrastructure, not UI state — it should never cause a render by itself. Only the data arriving on it (messages, status) should drive the UI.",
    answer_keywords: ["useRef", "WebSocket | null", "null", "useState", "'connecting'"],
    evaluate: evalL42Step1,
    seed_code: "",
    starter_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  // 1. create wsRef typed as WebSocket | null, initialised to null
  // 2. create status state typed as the connection union, initialised to 'connecting'
}`,
    feedback_correct:
      "Exactly — useRef for the instance (no re-renders), useState for status (UI cares about this). The union type makes status exhaustive and safe to switch on.",
    feedback_partial:
      "One of the two is right. Check: is the ref typed WebSocket | null? Is the status state typed as the full union and initialised to 'connecting'?",
    feedback_wrong:
      "Pattern: `const wsRef = useRef<WebSocket | null>(null)` for the instance; `const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting')` for UI state.",
    expected: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
}`,
    analog_example: `function useLiveAuction(endpoint: string) {
  const feedRef = useRef<EventSource | null>(null);
  const [connectionState, setConnectionState] = useState<'init' | 'live' | 'failed'>('init');
}`,
    deepDiveLabel:
      "status is in useState and the socket is in useRef — why doesn't the socket go in useState too?",
    deepDive: {
      hook: "You put the WebSocket instance in useState because it felt natural — it's a value that changes. The connection opens, the instance is assigned, React re-renders. So far, fine. Then you add a send function that reads `wsInstance` from state. But there's a closure: the send function that was created before the instance was assigned still holds a reference to null. The instance is in state, but the old closure doesn't see the new value. You call send — nothing happens. No error. Just silence.",
      pain: "⚠️ **Lesson:** You store the WebSocket in useState. The send function closes over the state value at creation time. When the socket is later assigned, the send function still sees null. Why does useState create this stale closure problem while useRef doesn't?",
      mentalModel:
        "**Mental model: The Whiteboard vs The Notepad.**\n- **useState** is a whiteboard — every time it changes, everyone in the room (the component) gets notified and the room is repainted. Old notes (closures) from before the repaint don't update automatically.\n- **useRef** is a notepad with a fixed address. The address never changes. Any function that has the address can always walk over and read the current value — no staleness possible.\n- The socket is infrastructure. Its address (the ref) is fixed. Its value changes once. Functions that need the socket should hold the address (the ref), not a snapshot of the value (state).",
      discover: `// ✅ Correct — ref holds the instance, state holds the UI-relevant signal
const wsRef = useRef<WebSocket | null>(null);
const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

// send can always read wsRef.current — never stale
const send = (data: unknown) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify(data));
  }
};

// ❌ Wrong — instance in state causes stale closure in send
const [ws, setWs] = useState<WebSocket | null>(null);
const send = (data: unknown) => {
  if (ws?.readyState === WebSocket.OPEN) { // ws is the old closure value
    ws.send(JSON.stringify(data)); // fires against null or the old socket
  }
};

// ❌ Wrong — module variable shared across ALL hook consumers
let globalSocket: WebSocket | null = null; // every component using the hook shares this`,
      quickRules:
        "✅ useRef for object instances that persist but don't drive UI (WebSocket, timers, AbortController)\n✅ useState for values that the UI needs to respond to (status, messages, error)\n❌ Don't put class instances in useState — re-renders create stale closures\n❌ Don't use module-level variables for per-component state — they're shared across all instances\n✅ When a function needs to read a value without causing a re-render — reach for a ref",
      watchOut:
        "👀 **Watch out:** The most common mistake is putting the WebSocket in useState and then wondering why the send function doesn't work right after mount. The component re-renders when the socket is assigned, but any closure that captured `ws` before the render still holds null. The ref eliminates this entire class of bug — the address never changes, so closures always see the current socket.",
      dryRun:
        "🔁 **Think:** Your hook is used by two components on the same page — `<WarehouseAFeed url='ws://...' />` and `<WarehouseBFeed url='ws://...' />`. If you had stored the socket in a module-level variable instead of a ref, what would happen when Warehouse A's socket opens and Warehouse B's component calls send? Would it send to Warehouse B's socket or Warehouse A's?",
      build:
        "**Learning focus:** Store the WebSocket instance in a useRef (not useState) so it persists across renders without triggering them, and so closures like send always read the current socket via .current.",
    },
  },

  // ── STEP 2 ────────────────────────────────────────────────────────────────
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5",
    paal: "Add a useEffect that creates a new WebSocket(url), assigns it to wsRef.current, and depends on [url] so a new connection is established whenever the URL changes.",
    hint: "Create the socket first, then assign it to wsRef.current — not the other way around. The dependency array determines when the effect re-runs.",
    example_code: `useEffect(() => {
  const feed = new EventSource(endpoint);
  sourceRef.current = feed;
}, [endpoint]);`,
    think_prompt:
      "If you put url in the dependency array, the effect re-runs whenever url changes. What happens to the old WebSocket connection when a new one is created — does React clean it up automatically?",
    mc_options: [
      "React closes the old WebSocket automatically before running the next effect",
      "The old WebSocket stays open — each url change stacks another connection on top",
      "new WebSocket() throws if a connection is already open on the same url",
    ],
    mc_correct_option:
      "The old WebSocket stays open — each url change stacks another connection on top",
    mc_anchor:
      "React runs the cleanup function (if you return one) before re-running the effect. Without a cleanup, the old socket stays open. That's why Step 5 adds the return teardown — without it, every url change leaks a connection. React does not know about WebSocket — it only knows about the cleanup function you give it.",
    why_this_matters:
      "In a logistics dashboard where operators can switch between live route feeds, leaking WebSocket connections means server-side channel subscriptions pile up per client. A fleet of 500 operators switching feeds twice each creates 1,000 zombie connections — server load, data leaks, billing.",
    answer_keywords: ["useEffect", "new WebSocket", "url", "wsRef.current", "[url]"],
    evaluate: evalL42Step2,
    seed_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
}`,
    starter_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  useEffect(() => {
    // create new WebSocket(url) and assign to wsRef.current
  }, [/* add the dependency */]);
}`,
    feedback_correct:
      "Exactly — create the socket, store it in the ref, depend on url. The cleanup in Step 5 will close the old socket before this effect re-runs.",
    feedback_partial:
      "Almost — check: is wsRef.current actually assigned the socket? Is url in the dependency array?",
    feedback_wrong:
      "Pattern: `useEffect(() => { const ws = new WebSocket(url); wsRef.current = ws; }, [url]);`",
    expected: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
  }, [url]);
}`,
    analog_example: `useEffect(() => {
  const stream = new BroadcastChannel(channelName);
  channelRef.current = stream;
}, [channelName]);`,
    deepDiveLabel:
      "The dependency array is [url] — but what actually happens between the old socket closing and the new one opening?",
    deepDive: {
      hook: "Your useWebSocket hook is wired to a dropdown that lets operators switch between route feeds. When an operator switches from the Chicago feed to the Denver feed, you see both feeds arriving simultaneously for about 200ms — updates from Chicago mixed in with Denver data. Your cleanup runs, but the old socket's onmessage fires one last time after the cleanup, writing stale Chicago events into your Denver messages state.",
      pain: "⚠️ **Lesson:** The cleanup runs synchronously, but a WebSocket's close isn't instantaneous — inflight messages can still arrive after ws.close() is called. How do you prevent those stale messages from landing in state after a url change?",
      mentalModel:
        "**Mental model: The Post Office and Forwarding Orders.**\nWhen you move (new url), you file a forwarding order (cleanup). But mail already in transit (inflight WebSocket frames) can still arrive at the old address for a few days (frames). The post office doesn't intercept those — they arrive anyway.\n- Solution: use a boolean `isActive` flag inside the effect. Set it true on entry, false in cleanup. All event handlers check `if (!isActive) return` before writing to state. The message still arrives — you just choose to ignore it.",
      discover: `// ✅ isActive flag prevents stale message writes after cleanup
useEffect(() => {
  let isActive = true;
  const ws = new WebSocket(url);
  wsRef.current = ws;

  ws.onmessage = (e) => {
    if (!isActive) return; // ← guard: socket closed, ignore this message
    setMessages(prev => [...prev, JSON.parse(e.data)]);
  };

  return () => {
    isActive = false;   // ← mark as inactive FIRST
    ws.close();         // ← then close (inflight frames still trigger onmessage)
  };
}, [url]);

// ❌ No guard — stale messages from the closed socket still write to state
useEffect(() => {
  const ws = new WebSocket(url);
  wsRef.current = ws;
  ws.onmessage = (e) => {
    setMessages(prev => [...prev, JSON.parse(e.data)]); // no isActive check
  };
  return () => { ws.close(); };
}, [url]);`,
      quickRules:
        "✅ Always put values used inside the effect in the dependency array\n✅ Create and assign the socket inside the effect, not outside\n✅ Use an isActive flag when handlers might fire after cleanup\n❌ Never create the socket outside the effect and close it inside — ownership is ambiguous\n❌ Empty dependency array [] means the effect never re-runs — the hook won't respond to url changes",
      watchOut:
        "👀 **Watch out:** `[url]` in the dependency array means the effect re-runs on every url change — but if url is computed inline in the parent (e.g., `useWebSocket(`ws://${host}/feed`)`) it creates a new string on every render. The effect re-runs on every parent render, opening and closing WebSockets constantly. Memoize or stabilize the url before passing it to the hook.",
      dryRun:
        "🔁 **Think:** Your hook has `[url]` as the dependency. An operator switches from Chicago feed to Denver feed. Trace the sequence: (1) React calls the cleanup for the Chicago effect, (2) React runs the Denver effect. At what point in this sequence is wsRef.current pointing to the Denver socket? What does it point to between cleanup completing and the new effect running?",
      build:
        "**Learning focus:** Create a WebSocket inside useEffect and depend on [url] so the connection is re-established on url change — understanding that cleanup must be returned explicitly because React has no knowledge of WebSocket lifecycle.",
    },
  },

  // ── STEP 3 ────────────────────────────────────────────────────────────────
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5",
    paal: "Wire ws.onopen, ws.onclose, and ws.onerror to call setStatus with the appropriate union value: 'open', 'closed', and 'error' respectively.",
    hint: "All three handlers are assigned inside the same useEffect, right after wsRef.current is assigned. onopen and onclose receive an Event; onerror also receives an Event.",
    example_code: `const feed = new EventSource(endpoint);
sourceRef.current = feed;

feed.onopen = () => setConnectionState('live');
feed.onerror = () => setConnectionState('failed');`,
    think_prompt:
      "The WebSocket spec has four readyState values: CONNECTING, OPEN, CLOSING, CLOSED. Your union has four values too. Which event maps to which status — and does onerror always mean the connection is gone?",
    mc_options: [
      "onerror fires and the connection is automatically closed — setStatus('error') is enough",
      "onerror fires but the socket may still be open — you may need to check readyState separately",
      "onerror only fires for network errors — authentication failures use a different event",
    ],
    mc_correct_option:
      "onerror fires but the socket may still be open — you may need to check readyState separately",
    mc_anchor:
      "onerror does not guarantee the socket closes — it fires for parsing errors and certain protocol errors where the socket may remain OPEN. For production hooks, checking ws.readyState inside onerror or listening to onclose (which always fires when the connection ends) is more reliable. In this lesson, setting 'error' on onerror is a pragmatic starting point — onclose will fire afterward if the connection drops.",
    why_this_matters:
      "Status-driven UI is what makes enterprise dashboards trustworthy. A shipper watching a live route map needs to know immediately if the feed is down — not discover it when data stops updating. Accurate status state powers connection banners, retry buttons, and audit logs.",
    answer_keywords: ["ws.onopen", "ws.onclose", "ws.onerror", "setStatus"],
    evaluate: evalL42Step3,
    seed_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;
  }, [url]);
}`,
    starter_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    // wire onopen → 'open', onclose → 'closed', onerror → 'error'
  }, [url]);
}`,
    feedback_correct:
      "Exactly — all three lifecycle events wired, each calling setStatus with the matching union value. The UI can now reflect exactly where the connection stands.",
    feedback_partial:
      "Some handlers are wired. Check that onopen, onclose, and onerror are all present and each calls setStatus with the correct union value.",
    feedback_wrong:
      "Pattern: `ws.onopen = () => setStatus('open'); ws.onclose = () => setStatus('closed'); ws.onerror = () => setStatus('error');` — assign all three inside the useEffect, after wsRef.current = ws.",
    expected: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('error');
  }, [url]);
}`,
    analog_example: `const peer = new RTCPeerConnection(config);
peerRef.current = peer;

peer.onconnectionstatechange = () => {
  if (peer.connectionState === 'connected') setCallState('active');
  if (peer.connectionState === 'disconnected') setCallState('ended');
  if (peer.connectionState === 'failed') setCallState('failed');
};`,
    deepDiveLabel:
      "onopen fires once — but onclose fires for both clean disconnects and crashes. How do you tell them apart?",
    deepDive: {
      hook: "Your shipment feed disconnects. The onclose handler fires and you show a 'Disconnected' banner. The operator hits Retry. But you've lost the reason for the disconnect — was it a clean server-initiated close (code 1000), a network drop (code 1006), or a server restart (code 1012)? Your retry logic should wait 30s for a server restart but reconnect immediately for a network blip. You can't differentiate because you only stored 'closed'.",
      pain: "⚠️ **Lesson:** onclose fires for every kind of disconnect. The CloseEvent carries a code and reason. How do you use that information to build smarter reconnect logic without over-engineering the status union?",
      mentalModel:
        "**Mental model: Close Codes as Exit Codes.**\nLike a Unix process exit code, a WebSocket CloseEvent.code tells you why the connection ended.\n- `1000` = normal closure (server said goodbye intentionally)\n- `1001` = endpoint going away (server restart, page unload)\n- `1006` = abnormal closure (network dropped — no close frame was sent)\n- `1008` = policy violation (auth failure, rate limit)\nFor production retry logic: codes 1006, 1001, 1012 → retry with backoff. Code 1000 → closed intentionally, don't retry. Code 1008 → auth problem, retry won't help.",
      discover: `// ✅ Capture close code for smart retry decisions
ws.onclose = (e: CloseEvent) => {
  setStatus('closed');
  if (e.code === 1006 || e.code === 1001) {
    scheduleReconnect(); // network drop or restart — retry makes sense
  }
  // code 1000 = intentional close, no retry
};

// ✅ Minimal — correct for basic status tracking
ws.onclose = () => setStatus('closed');

// ❌ Only checking onerror for disconnects — misses network drops
// Network drops (1006) fire onclose only, NOT onerror
ws.onerror = () => setStatus('error'); // 1006 never reaches here
// ws.onclose not wired — operator never sees 'closed' status`,
      quickRules:
        "✅ Wire onopen, onclose, and onerror as a set — all three lifecycle events are distinct\n✅ onclose always fires when the connection ends (even after onerror)\n✅ Use CloseEvent.code to differentiate intentional close from network drop\n❌ Don't rely on onerror alone to detect disconnects — 1006 (network drop) only fires onclose\n❌ Don't swallow the CloseEvent — log code and reason in production for observability",
      watchOut:
        "👀 **Watch out:** Code 1006 (abnormal closure) is the most common disconnect in the wild — a mobile user's network drops, a load balancer kills the connection, a server crashes. Code 1006 fires onclose but NOT onerror. If your 'connection lost' logic is only in onerror, you will silently miss the most common real-world disconnect.",
      dryRun:
        "🔁 **Think:** A user opens the shipment dashboard on a mobile device. The device goes through a tunnel — the TCP connection is dropped without a proper close handshake. What CloseEvent code arrives? Does onerror fire? Does onclose fire? What does your status state show, and does it accurately reflect what happened?",
      build:
        "**Learning focus:** Wire the three WebSocket lifecycle events — onopen, onclose, onerror — to drive a union status state, understanding that onclose is the authoritative end-of-connection signal and carries a code that reveals why the connection ended.",
    },
  },

  // ── STEP 4 ────────────────────────────────────────────────────────────────
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5",
    paal: "Add a messages state (ShipmentEvent[], initialised to []) and wire ws.onmessage to parse the event data as JSON and append the result to messages using a functional update.",
    hint: "A functional update — setMessages(prev => [...prev, newItem]) — ensures you're always appending to the latest array, even if multiple messages arrive before a re-render.",
    example_code: `feed.onmessage = (e) => {
  const packet = JSON.parse(e.data) as AuctionBid;
  setBids(prev => [...prev, packet]);
};`,
    think_prompt:
      "Multiple WebSocket messages can arrive in rapid succession before React processes a re-render. If you call setMessages(messages => ...) using the current state variable instead of the functional form, what do you risk?",
    mc_options: [
      "Nothing — React batches state updates so the final state is always correct",
      "Each rapid message overwrites the previous one — you end up with only the last message",
      "Stale closure: each setMessages call sees the same snapshot of messages, dropping all but one update",
    ],
    mc_correct_option:
      "Stale closure: each setMessages call sees the same snapshot of messages, dropping all but one update",
    mc_anchor:
      "The functional update form `prev => [...prev, newItem]` receives the *latest committed state* from React — not the closed-over value of `messages` at the time the handler was created. If five messages arrive before a re-render and you use the state variable directly, all five calls see the same initial array and each overwrites the others. The functional form chains correctly: each call sees the output of the previous update.",
    why_this_matters:
      "A live shipment feed during peak hours can fire 20–30 events per second. Without functional updates, status changes for multiple shipments are silently dropped. An operator sees a clean feed but misses critical delay notifications — a compliance and trust problem in regulated logistics.",
    answer_keywords: ["messages", "ShipmentEvent[]", "useState", "ws.onmessage", "JSON.parse", "prev", "...prev"],
    evaluate: evalL42Step4,
    seed_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('error');
  }, [url]);
}`,
    starter_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  // add messages state here

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('error');
    // wire ws.onmessage to parse and append
  }, [url]);
}`,
    feedback_correct:
      "Exactly — functional update guarantees correct accumulation even under rapid-fire messages. JSON.parse extracts the payload, and the spread creates a new array reference so React detects the change.",
    feedback_partial:
      "Close — check: is the functional form used (`prev => [...prev, item]`)? Is the event data parsed as JSON? Is the messages state typed as ShipmentEvent[]?",
    feedback_wrong:
      "Pattern: declare `const [messages, setMessages] = useState<ShipmentEvent[]>([])`. Then: `ws.onmessage = (e) => { const event = JSON.parse(e.data) as ShipmentEvent; setMessages(prev => [...prev, event]); };`",
    expected: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const [messages, setMessages] = useState<ShipmentEvent[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('error');

    ws.onmessage = (e) => {
      const event = JSON.parse(e.data) as ShipmentEvent;
      setMessages(prev => [...prev, event]);
    };
  }, [url]);
}`,
    analog_example: `auction.onmessage = (e) => {
  const bid = JSON.parse(e.data) as AuctionBid;
  setBids(prev => [...prev, bid]);
};`,
    deepDiveLabel:
      "You're accumulating every message forever — what happens to this array after 8 hours of live tracking?",
    deepDive: {
      hook: "Your ShipmentFeed component has been running in a logistics control room for 6 hours. It started showing 200ms render lag. A developer opens DevTools and finds the messages array has 87,000 entries. Each re-render spreads that entire array to append one item. The component that displays the last 20 messages is causing 87,000-item array copies on every event.",
      pain: "⚠️ **Lesson:** Unbounded accumulation in state is a memory and performance leak. The onmessage handler appends forever. What are the practical strategies for bounding the messages array without losing important data?",
      mentalModel:
        "**Mental model: The River, Not the Lake.**\nA WebSocket feed is a river — data flows through it continuously. Storing every message in state turns the river into a lake that fills indefinitely.\nThree patterns for bounding the lake:\n1. **Sliding window** — keep only the last N messages: `prev => [...prev.slice(-99), newItem]`\n2. **Reduce to aggregates** — count, average, last-seen — don't keep raw events\n3. **External store** — pipe messages to Zustand, Redux, or a local IndexedDB — the React component only holds a view slice",
      discover: `// ✅ Sliding window — keep last 100 messages
ws.onmessage = (e) => {
  const event = JSON.parse(e.data) as ShipmentEvent;
  setMessages(prev => [...prev.slice(-99), event]); // max 100 items always
};

// ✅ Aggregation — don't accumulate raw events
ws.onmessage = (e) => {
  const event = JSON.parse(e.data) as ShipmentEvent;
  setLastEvent(event);       // only care about latest
  setEventCount(n => n + 1); // only care about count
};

// ❌ Unbounded — grows without limit for long-running sessions
ws.onmessage = (e) => {
  const event = JSON.parse(e.data) as ShipmentEvent;
  setMessages(prev => [...prev, event]); // no bound — 87k items after 8h
};`,
      quickRules:
        "✅ Use functional updates for all append operations — `prev => [...prev, item]`\n✅ Bound the array length for long-running feeds: `prev.slice(-N)` keeps the last N\n✅ For high-frequency feeds, consider throttling or aggregating in the handler\n❌ Never accumulate raw events indefinitely in useState for persistent sessions\n✅ For audit requirements, persist to IndexedDB or server — don't keep in component state",
      watchOut:
        "👀 **Watch out:** `[...prev, event]` creates a new array on every message. For 20 messages/second over 8 hours = 576,000 array copies. The old arrays are GC'd, but the GC pressure is real. Use `prev.slice(-N)` to both bound length and reduce allocation — `[...prev.slice(-99), event]` is the idiomatic production pattern.",
      dryRun:
        "🔁 **Think:** You change the onmessage handler to `setMessages(prev => [...prev.slice(-49), event])` — keeping the last 50 messages. The feed fires 10 messages per second. After 30 seconds, how many items are in the messages array? After 60 seconds? What is the maximum memory footprint of the array, and does it grow over time?",
      build:
        "**Learning focus:** Wire ws.onmessage to accumulate parsed JSON messages with a functional update, understanding why the functional form is required for rapid-fire events and why unbounded accumulation is a production liability.",
    },
  },

  // ── STEP 5 ────────────────────────────────────────────────────────────────
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5",
    paal: "Add a send function that checks wsRef.current?.readyState === WebSocket.OPEN before calling wsRef.current.send(JSON.stringify(data)). Add the effect cleanup that calls wsRef.current?.close(). Return { status, messages, send } from the hook.",
    hint: "The cleanup is the return value of the useEffect callback — a function that React calls before the next run or on unmount. The send function reads wsRef.current — not ws — because send is defined outside the effect.",
    example_code: `const broadcast = (payload: unknown) => {
  if (channelRef.current?.readyState === 1) {
    channelRef.current.send(JSON.stringify(payload));
  }
};

// inside useEffect:
return () => { channelRef.current?.close(); };`,
    think_prompt:
      "The send function is defined outside the useEffect but needs to call the socket. If send closed over the local ws variable inside the effect, what would happen to send after the effect runs and ws goes out of scope?",
    mc_options: [
      "ws goes out of scope so send would throw a ReferenceError when called",
      "send would still hold a reference to ws via closure — but it would be the socket from the last effect run, which may be stale after a url change",
      "send reads wsRef.current — which is always the current socket — so it's safe regardless of when it's called",
    ],
    mc_correct_option:
      "send reads wsRef.current — which is always the current socket — so it's safe regardless of when it's called",
    mc_anchor:
      "wsRef.current is always the current socket. The ref object itself never changes — only .current changes. So any function that holds a reference to the ref object (not to a snapshot of .current) always reads the latest value. This is why send is defined outside the effect using wsRef, not inside using ws — it stays valid across url changes and re-renders.",
    why_this_matters:
      "The readyState guard prevents silent dropped messages. Calling ws.send() when the socket is CONNECTING (readyState 0) throws a DOMException in some browsers. The guard also provides the hook consumer with a safe, fire-and-forget API — they don't need to know anything about WebSocket lifecycle to use it.",
    answer_keywords: ["send", "wsRef.current", "WebSocket.OPEN", "readyState", "wsRef.current?.close", "return", "status", "messages"],
    evaluate: evalL42Step5,
    seed_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const [messages, setMessages] = useState<ShipmentEvent[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('error');

    ws.onmessage = (e) => {
      const event = JSON.parse(e.data) as ShipmentEvent;
      setMessages(prev => [...prev, event]);
    };
  }, [url]);
}`,
    starter_code: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const [messages, setMessages] = useState<ShipmentEvent[]>([]);

  // define send here — reads wsRef.current, checks readyState before sending

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('error');

    ws.onmessage = (e) => {
      const event = JSON.parse(e.data) as ShipmentEvent;
      setMessages(prev => [...prev, event]);
    };

    // return cleanup that closes the socket
  }, [url]);

  // return the hook API
}`,
    feedback_correct:
      "Complete — readyState guard, cleanup on url change and unmount, and a clean { status, messages, send } API. This hook is production-ready.",
    feedback_partial:
      "Almost there — check: does send check wsRef.current?.readyState === WebSocket.OPEN? Does the effect return a cleanup that calls wsRef.current?.close()? Does the hook return all three values?",
    feedback_wrong:
      "Three things: (1) `const send = (data: unknown) => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(data)); };` (2) inside useEffect: `return () => { wsRef.current?.close(); };` (3) at the bottom: `return { status, messages, send };`",
    expected: `import { useRef, useState, useEffect } from 'react';

interface ShipmentEvent {
  shipmentId: string;
  event: string;
  timestamp: string;
}

function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const [messages, setMessages] = useState<ShipmentEvent[]>([]);

  const send = (data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('error');

    ws.onmessage = (e) => {
      const event = JSON.parse(e.data) as ShipmentEvent;
      setMessages(prev => [...prev, event]);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [url]);

  return { status, messages, send };
}`,
    analog_example: `const publish = (payload: unknown) => {
  if (peerRef.current?.signalingState === 'stable') {
    peerRef.current.send(JSON.stringify(payload));
  }
};

// inside useEffect:
return () => { peerRef.current?.close(); };`,
    deepDiveLabel:
      "readyState === WebSocket.OPEN — but what are the other three states and when does send fail silently?",
    deepDive: {
      hook: "Your send function has the OPEN guard. A junior developer on the team calls send from a button handler as soon as the component mounts — before onopen fires. Nothing happens. No error. The message is lost. They add a console.log and see the socket is in CONNECTING state. They don't understand why the send didn't queue the message until OPEN.",
      pain: "⚠️ **Lesson:** WebSocket.OPEN is readyState 1 of 4. What are the other states, and what happens if you call send in CONNECTING (0), CLOSING (2), or CLOSED (3)?",
      mentalModel:
        "**Mental model: The Runway and Air Traffic Control.**\nA WebSocket connection is like a plane on a runway:\n- **0 CONNECTING** — taxiing. You can't take off yet. Calling send here: browser throws DOMException (InvalidStateError)\n- **1 OPEN** — airborne. Safe to transmit.\n- **2 CLOSING** — approach to land. Too late to queue new cargo (send throws or drops silently)\n- **3 CLOSED** — gate. No connection. send throws InvalidStateError.\nThe guard `readyState === WebSocket.OPEN` is your air traffic control — it only authorizes transmission when the channel is confirmed open.",
      discover: `// ✅ Guard against non-OPEN states
const send = (data: unknown) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify(data));
  }
  // silently drops if not OPEN — caller should check status before sending
};

// ✅ With queuing — buffer messages until open
const pendingRef = useRef<unknown[]>([]);
ws.onopen = () => {
  setStatus('open');
  pendingRef.current.forEach(msg => ws.send(JSON.stringify(msg)));
  pendingRef.current = [];
};
const send = (data: unknown) => {
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify(data));
  } else {
    pendingRef.current.push(data); // queue for when OPEN arrives
  }
};

// ❌ No guard — throws DOMException in CONNECTING and CLOSED states
const send = (data: unknown) => {
  wsRef.current?.send(JSON.stringify(data)); // throws if not OPEN
};`,
      quickRules:
        "✅ Always guard send with readyState === WebSocket.OPEN (value 1)\n✅ Use WebSocket.OPEN constant — not the magic number 1 — for readability\n✅ For messages that must be delivered, implement a pending queue drained in onopen\n❌ Never call send without a readyState check — CONNECTING throws DOMException in modern browsers\n✅ Return the cleanup from useEffect — not calling close on unmount leaks the server-side channel",
      watchOut:
        "👀 **Watch out:** The cleanup `return () => { wsRef.current?.close(); }` is inside useEffect. If you return the cleanup at the wrong level — from the hook function itself, not from the effect — it won't run on url change. It will only run on unmount. Url changes will leak the old connection. Always verify that the cleanup is returned from inside the `() => { ... }` passed to useEffect.",
      dryRun:
        "🔁 **Think:** A user clicks a 'Request Update' button that calls send({ type: 'REQUEST_UPDATE', shipmentId: 'NX-1042' }) immediately on component mount. At mount time, the useEffect has run but onopen has not fired yet — the socket is in readyState 0 (CONNECTING). Walk through: does send transmit the message? Does it throw? Does it silently drop? What would the user experience be, and what would you need to add to guarantee the message is delivered?",
      build:
        "**Learning focus:** Expose a safe send function that guards on WebSocket.OPEN and return the effect cleanup that closes the socket — completing a production-grade hook that manages the full WebSocket lifecycle without leaking connections.",
    },
  },
];

const sideItems = [
  { label: "Lesson", id: "intro" },
  { label: "Prereqs", id: "prereqs" },
  { label: "Objectives", id: "objectives" },
  { label: "Step 1", id: "step1" },
  { label: "Step 2", id: "step2" },
  { label: "Step 3", id: "step3" },
  { label: "Step 4", id: "step4" },
  { label: "Step 5", id: "step5" },
];

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 42,
  title: "Custom Hook — useWebSocket",
  shortName: "HOOK — useWebSocket",
});

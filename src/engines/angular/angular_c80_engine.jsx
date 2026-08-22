import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "WebSocket Hook (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #80 (Angular)", title: TITLE, body: "Connect to a WebSocket in Angular: create a service that opens new WebSocket(url), exposes messages as Observable (fromEvent(ws, 'message').pipe(map(e => e.data))), and closes the socket in ngOnDestroy or takeUntilDestroyed.", usecase: "Angular uses RxJS fromEvent and WebSocket for reactive socket streams with cleanup." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["ws = new WebSocket(url); messages$ = fromEvent(ws, 'message').pipe(map(e => (e as MessageEvent).data))", "send(data) { this.ws.readyState === WebSocket.OPEN && this.ws.send(JSON.stringify(data)); }", "On destroy: ws.close(); or use takeUntilDestroyed in pipe", "Optional: reconnect logic with Subject"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a service that opens ws = new WebSocket('wss://echo.websocket.org'). messages$ = fromEvent(this.ws, 'message').pipe(map((e: MessageEvent) => e.data)). Inject DestroyRef and in pipe use takeUntilDestroyed so subscription ends on destroy.", answer_keywords: ["WebSocket", "fromEvent", "message"], seed_code: `import { Injectable, inject, DestroyRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, takeUntilDestroyed } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private destroyRef = inject(DestroyRef);
  private ws = new WebSocket('wss://echo.websocket.org');
  messages$ = fromEvent<MessageEvent>(this.ws, 'message').pipe(
    map(e => e.data),
    takeUntilDestroyed(this.destroyRef)
  );
}`, feedback_correct: "✅ WebSocket and messages$.", feedback_partial: "fromEvent.", feedback_wrong: "WebSocket", expected: "WebSocket and fromEvent('message')" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add send(data: string) { if (this.ws.readyState === WebSocket.OPEN) this.ws.send(data); }. In component use lastMessage = toSignal(wsService.messages$, { initialValue: null }) and a button that sends a message.", answer_keywords: ["send", "readyState", "toSignal"], seed_code: `import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WebSocketService } from './websocket.service';

@Component({
  selector: 'app-websocket',
  standalone: true,
  template: \`
    <p>Last: {{ lastMessage() }}</p>
    <button (click)="ws.send('Hello')">Send</button>
  \`,
})
export class WebSocketComponent {
  ws = inject(WebSocketService);
  lastMessage = toSignal(this.ws.messages$, { initialValue: null });
}`, feedback_correct: "✅ send and toSignal.", feedback_partial: "lastMessage.", feedback_wrong: "send", expected: "send() and toSignal(messages$)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Close socket on destroy: inject DestroyRef and in constructor run destroyRef.onDestroy(() => this.ws.close()). Export service and component.", answer_keywords: ["onDestroy", "close", "export"], seed_code: `import { Injectable, inject, DestroyRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, takeUntilDestroyed } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private destroyRef = inject(DestroyRef);
  private ws = new WebSocket('wss://echo.websocket.org');
  messages$ = fromEvent<MessageEvent>(this.ws, 'message').pipe(
    map(e => e.data),
    takeUntilDestroyed(this.destroyRef)
  );
  constructor() {
    this.destroyRef.onDestroy(() => this.ws.close());
  }
  send(data: string) { if (this.ws.readyState === WebSocket.OPEN) this.ws.send(data); }
}`, feedback_correct: "✅ WebSocket Hook (Angular) complete.", feedback_partial: "onDestroy close.", feedback_wrong: "Export", expected: "onDestroy and ws.close()" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 80, title: TITLE, shortName: "A — WEBSOCKET" });

import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Notification Context (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #44 (Angular)", title: TITLE, body: "Provide a global notification list and add/remove methods via an injectable NotificationService; render toasts in a single outlet component that injects the service.", usecase: "Angular uses a root NotificationService and a toast container component instead of React Context for notifications." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["NotificationService: notifications = signal<Notification[]>([]); add(msg, type?); remove(id)", "Component that injects service and *ngFor notifications(); each has (click) remove or auto-dismiss", "Optional: use Subject/Observable for add and toSignal for list", "Provide service in root"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create NotificationService with notifications = signal<{ id: number; text: string }[]>([]). add(text: string) { this.notifications.update(n => [...n, { id: Date.now(), text }]); }. remove(id: number) { this.notifications.update(n => n.filter(x => x.id !== id)); }. providedIn: 'root'.", answer_keywords: ["NotificationService", "notifications", "add", "remove"], seed_code: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<{ id: number; text: string }[]>([]);
  add(text: string) {
    this.notifications.update(n => [...n, { id: Date.now(), text }]);
  }
  remove(id: number) {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }
}`, feedback_correct: "✅ NotificationService.", feedback_partial: "notifications signal.", feedback_wrong: "NotificationService", expected: "notifications signal, add, remove" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create ToastContainerComponent that injects NotificationService. Template: *ngFor=\"let n of notif.notifications()\" with {{ n.text }} and <button (click)=\"notif.remove(n.id)\">Dismiss</button>.", answer_keywords: ["ngFor", "notifications", "remove"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let n of notif.notifications()">
      {{ n.text }} <button (click)="notif.remove(n.id)">Dismiss</button>
    </div>
  \`,
})
export class ToastContainerComponent {
  notif = inject(NotificationService);
}`, feedback_correct: "✅ Toast container with list.", feedback_partial: "notif.notifications().", feedback_wrong: "ngFor", expected: "*ngFor and notif.remove(n.id)" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "From another component inject NotificationService and add a button (click)=\"notif.add('Hello')\". Export NotificationService and ToastContainerComponent.", answer_keywords: ["notif.add", "export"], seed_code: `import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-demo',
  standalone: true,
  template: \`<button (click)="notif.add('Hello')">Notify</button>\`,
})
export class DemoComponent {
  notif = inject(NotificationService);
}`, feedback_correct: "✅ Notification Context (Angular) complete.", feedback_partial: "notif.add.", feedback_wrong: "Export", expected: "notif.add('Hello') and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 44, title: TITLE, shortName: "A — NOTIFICATION" });

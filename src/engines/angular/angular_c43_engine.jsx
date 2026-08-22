import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Cart Context (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #43 (Angular)", title: TITLE, body: "Manage shopping cart state with an injectable CartService: items signal, addItem, removeItem, total; inject the service in header and product components.", usecase: "Angular uses a single CartService (providedIn: 'root') instead of React Context for cart state." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["CartService: items = signal<CartItem[]>([]); addItem(item); removeItem(id); total = computed(() => ...)", "Inject in CartBadgeComponent and ProductComponent", "Template: *ngFor=\"item of cart.items()\" and (click)=\"cart.addItem(product)\"", "Optional: use model() for two-way in child"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create CartService with items = signal<{ id: number; name: string; price: number }[]>([]). addItem(item) { this.items.update(i => [...i, item]); }. removeItem(id) { this.items.update(i => i.filter(x => x.id !== id)); }. providedIn: 'root'.", answer_keywords: ["CartService", "items", "addItem", "removeItem"], seed_code: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<{ id: number; name: string; price: number }[]>([]);
  addItem(item: { id: number; name: string; price: number }) {
    this.items.update(i => [...i, item]);
  }
  removeItem(id: number) {
    this.items.update(i => i.filter(x => x.id !== id));
  }
}`, feedback_correct: "✅ CartService with items.", feedback_partial: "items signal.", feedback_wrong: "CartService", expected: "items signal, addItem, removeItem" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0)). Export CartService.", answer_keywords: ["computed", "total", "reduce"], seed_code: `import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<{ id: number; name: string; price: number }[]>([]);
  total = computed(() => this.items().reduce((sum, i) => sum + i.price, 0));
  addItem(item: { id: number; name: string; price: number }) {
    this.items.update(i => [...i, item]);
  }
  removeItem(id: number) {
    this.items.update(i => i.filter(x => x.id !== id));
  }
}`, feedback_correct: "✅ computed total.", feedback_partial: "computed.", feedback_wrong: "total", expected: "computed(() => items().reduce(...))" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Create a component that injects CartService. Template: show items().length and total(); list items with *ngFor and a remove button. Export the component.", answer_keywords: ["ngFor", "total()", "export"], seed_code: `import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <p>Items: {{ cart.items().length }} Total: {{ cart.total() }}</p>
    <ul>
      <li *ngFor="let item of cart.items()">
        {{ item.name }} <button (click)="cart.removeItem(item.id)">Remove</button>
      </li>
    </ul>
  \`,
})
export class CartComponent {
  cart = inject(CartService);
}`, feedback_correct: "✅ Cart Context (Angular) complete.", feedback_partial: "cart.items().", feedback_wrong: "Export", expected: "*ngFor cart.items() and cart.total()" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 43, title: TITLE, shortName: "A — CART CONTEXT" });

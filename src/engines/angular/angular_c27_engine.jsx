import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Simple Todo List (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #27 (Angular)", title: TITLE, body: "Build a small todo list with a signal array of items, *ngFor to render them, and methods to add and toggle completion using Angular signals and template syntax.", usecase: "Angular signals and *ngFor are the core for list state and rendering." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["todos = signal([{ id: 1, text: '...', done: false }])", "*ngFor=\"let todo of todos()\" and trackBy or track todo.id", "Add: input + button; push new item and todos.set([...todos(), newItem]) or update with mutate", "Toggle: (click) calling a method that updates the signal"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with todos = signal([{ id: 1, text: 'First', done: false }]). Template: <ul><li *ngFor=\"let todo of todos()\">{{ todo.text }}</li></ul>. Import CommonModule.", answer_keywords: ["ngFor", "todos", "signal"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <ul>
      <li *ngFor="let todo of todos()">{{ todo.text }}</li>
    </ul>
  \`,
})
export class TodoComponent {
  todos = signal([{ id: 1, text: 'First', done: false }]);
}`, feedback_correct: "✅ *ngFor with todos.", feedback_partial: "ngFor and signal.", feedback_wrong: "*ngFor", expected: "*ngFor=\"let todo of todos()\"" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an input and button. On button click add new todo: todos.update(t => [...t, { id: Date.now(), text: newText, done: false }]). Use a signal or ref for newText.", answer_keywords: ["update", "todos", "add"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <input [(ngModel)]="newText" (keyup.enter)="add()" />
    <button (click)="add()">Add</button>
    <ul><li *ngFor="let todo of todos()">{{ todo.text }}</li></ul>
  \`,
})
export class TodoComponent {
  newText = '';
  todos = signal([{ id: 1, text: 'First', done: false }]);
  add() {
    if (!this.newText.trim()) return;
    this.todos.update(t => [...t, { id: Date.now(), text: this.newText.trim(), done: false }]);
    this.newText = '';
  }
}`, feedback_correct: "✅ Add todo.", feedback_partial: "todos.update.", feedback_wrong: "add method", expected: "todos.update(t => [...t, newItem])" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Toggle done: add (click) on each li that calls toggle(id) and in toggle use todos.update to flip the done flag for that id. Export the component.", answer_keywords: ["toggle", "done", "update"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <input [(ngModel)]="newText" (keyup.enter)="add()" />
    <button (click)="add()">Add</button>
    <ul>
      <li *ngFor="let todo of todos()" (click)="toggle(todo.id)" [class.done]="todo.done">{{ todo.text }}</li>
    </ul>
  \`,
})
export class TodoComponent {
  newText = '';
  todos = signal([{ id: 1, text: 'First', done: false }]);
  add() {
    if (!this.newText.trim()) return;
    this.todos.update(t => [...t, { id: Date.now(), text: this.newText.trim(), done: false }]);
    this.newText = '';
  }
  toggle(id: number) {
    this.todos.update(t => t.map(item => item.id === id ? { ...item, done: !item.done } : item));
  }
}`, feedback_correct: "✅ Simple Todo List (Angular) complete.", feedback_partial: "toggle and done.", feedback_wrong: "toggle", expected: "toggle(id) and todos.update with map" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 27, title: TITLE, shortName: "A — TODO LIST" });

import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Controlled DatePicker (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #57 (Angular)", title: TITLE, body: "Build a controlled date picker: parent owns a signal (date value) and passes it to the picker via @Input(); picker emits date changes via @Output() or model() so the parent stays in sync.", usecase: "Angular controlled components use @Input() for value and @Output() or model() for valueChange." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["DatePicker: @Input() value: Date | null = null; @Output() valueChange = new EventEmitter<Date | null>()", "On date select: valueChange.emit(selectedDate)", "Parent: date = signal<Date | null>(null); [value]=\"date()\" (valueChange)=\"date.set($event)\"", "Or use model() for two-way: value = model<Date | null>(null)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create DatePickerComponent with @Input() value: Date | null = null and @Output() valueChange = new EventEmitter<Date | null>(). Template: show value (or 'Pick date') and a button that emits valueChange.emit(new Date()).", answer_keywords: ["Input", "Output", "valueChange"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  template: \`
    <span>{{ value ? value.toLocaleDateString() : 'Pick date' }}</span>
    <button (click)="valueChange.emit(new Date())">Today</button>
  \`,
})
export class DatePickerComponent {
  @Input() value: Date | null = null;
  @Output() valueChange = new EventEmitter<Date | null>();
}`, feedback_correct: "✅ value and valueChange.", feedback_partial: "valueChange.emit.", feedback_wrong: "valueChange", expected: "@Input value, @Output valueChange, emit" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an input type=\"date\" and bind (change) to read the input value and emit new Date($event.target.value). So user can type or use native picker.", answer_keywords: ["input", "date", "change"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  template: \`
    <input type="date" [value]="value ? value.toISOString().slice(0,10) : ''" (change)="onChange($event)" />
    <span>{{ value ? value.toLocaleDateString() : 'Pick date' }}</span>
  \`,
})
export class DatePickerComponent {
  @Input() value: Date | null = null;
  @Output() valueChange = new EventEmitter<Date | null>();
  onChange(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.valueChange.emit(v ? new Date(v) : null);
  }
}`, feedback_correct: "✅ input type=date and onChange.", feedback_partial: "onChange.", feedback_wrong: "change", expected: "(change) and valueChange.emit(new Date(v))" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Parent: selectedDate = signal<Date | null>(null). <app-date-picker [value]=\"selectedDate()\" (valueChange)=\"selectedDate.set($event)\"></app-date-picker>. Export DatePickerComponent.", answer_keywords: ["selectedDate", "valueChange", "export"], seed_code: `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  template: \`
    <input type="date" [value]="value ? value.toISOString().slice(0,10) : ''" (change)="onChange($event)" />
  \`,
})
export class DatePickerComponent {
  @Input() value: Date | null = null;
  @Output() valueChange = new EventEmitter<Date | null>();
  onChange(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.valueChange.emit(v ? new Date(v) : null);
  }
}`, feedback_correct: "✅ Controlled DatePicker (Angular) complete.", feedback_partial: "Parent binding.", feedback_wrong: "Export", expected: "[value] and (valueChange) and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 57, title: TITLE, shortName: "A — DATE PICKER" });

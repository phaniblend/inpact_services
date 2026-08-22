import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #9 (Angular)", title: "Color Picker", body: "A dropdown or set of buttons that let the user choose a color. Display the selected color name and apply it (e.g. as background or text color). Use a signal for the selected color.", usecase: "Binding user choice to a signal and using it in [style] or class is common in Angular." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use signal('') or signal<string> for selected color", "Buttons or select with (click) or (change) to set the signal", "Template: [style.background] or [style.color] bound to the signal", "Display selected color name with {{ selectedColor() }}"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with selectedColor = signal('red'). Define a list of colors, e.g. ['red', 'green', 'blue'].", answer_keywords: ["signal", "selectedColor", "colors"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: \`<!-- Step 2: add buttons -->\`,
})
export class ColorPickerComponent {
  colors = ['red', 'green', 'blue'];
  selectedColor = signal('red');
}`, feedback_correct: "✅ selectedColor signal.", feedback_partial: "signal and array.", feedback_wrong: "selectedColor = signal('red')", expected: "selectedColor = signal('red') and colors array" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "In the template add buttons for each color: *ngFor=\"let c of colors\" and (click)=\"selectedColor.set(c)\". Show current selection: {{ selectedColor() }}.", answer_keywords: ["ngFor", "click", "set"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let c of colors">
      <button (click)="selectedColor.set(c)">{{ c }}</button>
    </div>
    <p>Selected: {{ selectedColor() }}</p>
  \`,
})
export class ColorPickerComponent {
  colors = ['red', 'green', 'blue'];
  selectedColor = signal('red');
}`, feedback_correct: "✅ Buttons and display.", feedback_partial: "*ngFor and (click).", feedback_wrong: "selectedColor.set(c)", expected: "buttons (click)=\"selectedColor.set(c)\" and {{ selectedColor() }}" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Apply the color visually: e.g. a div with [style.background]=\"selectedColor()\" or [style.color]=\"selectedColor()\". Export the component.", answer_keywords: ["style", "background", "selectedColor()"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let c of colors">
      <button (click)="selectedColor.set(c)">{{ c }}</button>
    </div>
    <p>Selected: {{ selectedColor() }}</p>
    <div [style.background]="selectedColor()" style="width:100px;height:100px"></div>
  \`,
})
export class ColorPickerComponent {
  colors = ['red', 'green', 'blue'];
  selectedColor = signal('red');
}`, feedback_correct: "✅ Color Picker (Angular) complete.", feedback_partial: "[style.background].", feedback_wrong: "[style.background]=\"selectedColor()\"", expected: "div with [style.background]=\"selectedColor()\"" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 9, title: "Color Picker (Angular)", shortName: "A — COLOR PICKER" });

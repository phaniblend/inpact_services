import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Image Gallery (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #30 (Angular)", title: TITLE, body: "Display a list of images with *ngFor; track selected index with a signal; show a large preview when one is clicked using *ngIf or a detail view.", usecase: "Angular *ngFor, signals, and *ngIf build image galleries with selection state." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["images = signal([{ src, alt }, ...]); selectedIndex = signal(0)", "*ngFor=\"let img of images(); let i = index\" with <img [src]=\"img.src\" (click)=\"selectedIndex.set(i)\">", "Preview: *ngIf=\"selectedIndex() >= 0\" and bind images()[selectedIndex()].src", "Optional: use NgOptimizedImage for loading"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with images = signal([{ src: '/a.jpg', alt: 'A' }, { src: '/b.jpg', alt: 'B' }]). Template: *ngFor with <img [src]=\"img.src\" [alt]=\"img.alt\">.", answer_keywords: ["ngFor", "images", "src"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let img of images()">
      <img [src]="img.src" [alt]="img.alt" />
    </div>
  \`,
})
export class GalleryComponent {
  images = signal([{ src: '/a.jpg', alt: 'A' }, { src: '/b.jpg', alt: 'B' }]);
}`, feedback_correct: "✅ *ngFor images.", feedback_partial: "[src] binding.", feedback_wrong: "*ngFor images", expected: "*ngFor and [src] [alt]" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add selectedIndex = signal(0). On img (click)=\"selectedIndex.set(i)\" (use let i = index). Show selected image in a preview area: current image = images()[selectedIndex()].", answer_keywords: ["selectedIndex", "click", "set"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let img of images(); let i = index">
      <img [src]="img.src" [alt]="img.alt" (click)="selectedIndex.set(i)" />
    </div>
    <div class="preview">
      <img [src]="images()[selectedIndex()]?.src" [alt]="images()[selectedIndex()]?.alt" />
    </div>
  \`,
})
export class GalleryComponent {
  images = signal([{ src: '/a.jpg', alt: 'A' }, { src: '/b.jpg', alt: 'B' }]);
  selectedIndex = signal(0);
}`, feedback_correct: "✅ Selection and preview.", feedback_partial: "selectedIndex.set(i).", feedback_wrong: "selectedIndex", expected: "(click)=\"selectedIndex.set(i)\" and preview binding" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add [class.selected]=\"selectedIndex() === i\" on thumbnails. Export the component.", answer_keywords: ["class.selected", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div *ngFor="let img of images(); let i = index">
      <img [src]="img.src" [alt]="img.alt" (click)="selectedIndex.set(i)" [class.selected]="selectedIndex() === i" />
    </div>
    <div class="preview"><img [src]="images()[selectedIndex()]?.src" [alt]="images()[selectedIndex()]?.alt" /></div>
  \`,
})
export class GalleryComponent {
  images = signal([{ src: '/a.jpg', alt: 'A' }, { src: '/b.jpg', alt: 'B' }]);
  selectedIndex = signal(0);
}`, feedback_correct: "✅ Image Gallery (Angular) complete.", feedback_partial: "class.selected.", feedback_wrong: "Export", expected: "[class.selected] and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 30, title: TITLE, shortName: "A — IMAGE GALLERY" });

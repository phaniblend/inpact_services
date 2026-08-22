import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Image Lazy Loading (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #54 (Angular)", title: TITLE, body: "Defer loading images until they're near the viewport using the native loading=\"lazy\" attribute or Angular's NgOptimizedImage directive with priority and loading attributes.", usecase: "Angular NgOptimizedImage and loading=\"lazy\" provide image lazy loading for better performance." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use <img loading=\"lazy\" [src]=\"url\"> for native lazy load", "Or use NgOptimizedImage: img ngSrc=\"url\" and set loading=\"lazy\" (default for non-priority)", "Priority images: ngSrc with priority or fetchpriority", "NgOptimizedImage requires width/height or fill"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a component with images = signal(['/1.jpg', '/2.jpg', '/3.jpg']). Template: *ngFor over images() with <img [src]=\"img\" loading=\"lazy\">.", answer_keywords: ["loading", "lazy", "ngFor"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lazy-img',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <img *ngFor="let img of images()" [src]="img" loading="lazy" alt="" />
  \`,
})
export class LazyImageComponent {
  images = signal(['/1.jpg', '/2.jpg', '/3.jpg']);
}`, feedback_correct: "✅ loading=\"lazy\".", feedback_partial: "loading.", feedback_wrong: "lazy", expected: "loading=\"lazy\" on img" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Import NgOptimizedImage. Replace one img with <img ngSrc=\"/hero.jpg\" width=\"800\" height=\"600\" priority>. For others use ngSrc with width/height and no priority (lazy by default).", answer_keywords: ["NgOptimizedImage", "ngSrc", "priority"], seed_code: `import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-lazy-img',
  standalone: true,
  imports: [NgOptimizedImage],
  template: \`
    <img ngSrc="/hero.jpg" width="800" height="600" priority alt="Hero" />
    <img ngSrc="/2.jpg" width="400" height="300" alt="Second" />
  \`,
})
export class LazyImageComponent {}`, feedback_correct: "✅ NgOptimizedImage.", feedback_partial: "ngSrc.", feedback_wrong: "NgOptimizedImage", expected: "ngSrc, width, height, priority" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use *ngFor with images() and ngSrc; set loading=\"lazy\" explicitly on non-hero images. Export the component.", answer_keywords: ["ngFor", "ngSrc", "export"], seed_code: `import { Component, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-lazy-img',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: \`
    <img *ngFor="let img of images()" [ngSrc]="img" width="400" height="300" loading="lazy" alt="" />
  \`,
})
export class LazyImageComponent {
  images = signal(['/1.jpg', '/2.jpg', '/3.jpg']);
}`, feedback_correct: "✅ Image Lazy Loading (Angular) complete.", feedback_partial: "ngFor and ngSrc.", feedback_wrong: "Export", expected: "*ngFor with ngSrc and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 54, title: TITLE, shortName: "A — LAZY IMAGE" });

import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Recursive TreeView (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #60 (Angular)", title: TITLE, body: "Render a tree of nodes where each node can have children: create a recursive component that has a template with *ngFor for children and includes itself (or a tree-node component) for each child so the tree is recursive.", usecase: "Angular recursive components use the same component in its own template with *ngFor over children." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["TreeNode interface: { label: string; children?: TreeNode[] }", "Component template: {{ node.label }} and *ngFor=\"let child of node.children\" with <app-tree-node [node]=\"child\">", "Component declares itself in imports (or use a separate TreeComponent) to allow recursion", "Base case: *ngIf=\"node.children?.length\" for the recursive block"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Define interface TreeNode { label: string; children?: TreeNode[] }. Create TreeComponent with @Input() node!: TreeNode. Template: {{ node.label }}.", answer_keywords: ["TreeNode", "Input", "node"], seed_code: `import { Component, Input } from '@angular/core';

export interface TreeNode {
  label: string;
  children?: TreeNode[];
}

@Component({
  selector: 'app-tree-node',
  standalone: true,
  template: \`<span>{{ node.label }}</span>\`,
})
export class TreeNodeComponent {
  @Input() node!: TreeNode;
}`, feedback_correct: "✅ TreeNode and Input.", feedback_partial: "TreeNode.", feedback_wrong: "node", expected: "TreeNode interface and @Input() node" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add *ngFor for children: <div *ngFor=\"let child of node.children\"><app-tree-node [node]=\"child\"></app-tree-node></div>. Import TreeNodeComponent in the same component's imports array (recursive).", answer_keywords: ["ngFor", "app-tree-node", "children"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreeNode {
  label: string;
  children?: TreeNode[];
}

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [CommonModule, TreeNodeComponent],
  template: \`
    <span>{{ node.label }}</span>
    <div *ngFor="let child of node.children">
      <app-tree-node [node]="child"></app-tree-node>
    </div>
  \`,
})
export class TreeNodeComponent {
  @Input() node!: TreeNode;
}`, feedback_correct: "✅ Recursive template.", feedback_partial: "app-tree-node.", feedback_wrong: "ngFor", expected: "*ngFor and <app-tree-node [node]=\"child\">" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wrap children in *ngIf=\"node.children?.length\" so leaf nodes don't render an empty div. Export TreeNodeComponent and TreeNode.", answer_keywords: ["ngIf", "children?.length", "export"], seed_code: `import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreeNode {
  label: string;
  children?: TreeNode[];
}

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [CommonModule, TreeNodeComponent],
  template: \`
    <span>{{ node.label }}</span>
    <div *ngIf="node.children?.length" *ngFor="let child of node.children">
      <app-tree-node [node]="child"></app-tree-node>
    </div>
  \`,
})
export class TreeNodeComponent {
  @Input() node!: TreeNode;
}`, feedback_correct: "✅ Recursive TreeView (Angular) complete.", feedback_partial: "ngIf children.", feedback_wrong: "Export", expected: "*ngIf node.children?.length and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 60, title: TITLE, shortName: "A — TREE VIEW" });

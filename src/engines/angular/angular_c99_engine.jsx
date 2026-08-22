import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Design Permission System (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #99 (Angular)", title: TITLE, body: "Design a permission system in Angular: PermissionService with permissions = signal<Set<string>>(new Set()) and can(permission: string); load permissions from API or with user; directive *appCan=\"'admin'\" that *ngIf=\"permissionService.can('admin')\" to show/hide elements.", usecase: "Angular PermissionService and structural directive provide role/permission-based UI." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["PermissionService: permissions = signal<Set<string>>(new Set()); can(perm: string) { return this.permissions().has(perm); }", "Load permissions when user logs in or from /api/permissions", "Directive: @Input() set appCan(perm: string); use *ngIf in template with inject(PermissionService).can(perm)", "Or component wrapper: <app-can permission=\"admin\"><ng-content></ng-content></app-can>"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create PermissionService with permissions = signal<Set<string>>(new Set()). can(perm: string): boolean { return this.permissions().has(perm); }. setPermissions(perms: string[]) { this.permissions.set(new Set(perms)); }. providedIn: 'root'.", answer_keywords: ["PermissionService", "permissions", "can"], seed_code: `import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  permissions = signal<Set<string>>(new Set());
  can(perm: string): boolean {
    return this.permissions().has(perm);
  }
  setPermissions(perms: string[]) {
    this.permissions.set(new Set(perms));
  }
}`, feedback_correct: "✅ PermissionService.", feedback_partial: "can(perm).", feedback_wrong: "permissions()", expected: "permissions signal and can(perm)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Create a structural directive CanDirective: @Input() set appCan(perm: string) { this.perm = perm; }. Inject PermissionService and ViewContainerRef, TemplateRef. In ngOnInit or setter: if (permissionService.can(this.perm)) viewContainer.createEmbeddedView(templateRef); else viewContainer.clear().", answer_keywords: ["directive", "appCan", "createEmbeddedView"], seed_code: `import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { PermissionService } from './permission.service';

@Directive({ selector: '[appCan]', standalone: true })
export class CanDirective {
  private perm = '';
  private permissionService = inject(PermissionService);
  private vcr = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);
  @Input() set appCan(perm: string) {
    this.perm = perm;
    this.vcr.clear();
    if (this.permissionService.can(perm)) this.vcr.createEmbeddedView(this.templateRef);
  }
}`, feedback_correct: "✅ CanDirective.", feedback_partial: "createEmbeddedView.", feedback_wrong: "appCan", expected: "Structural directive with appCan and can()" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Usage: <button *appCan=\"'admin'\">Admin only</button>. When permissions change (e.g. setPermissions(['admin'])), directive should re-evaluate—use effect in directive or re-set appCan when service updates. Export PermissionService and CanDirective.", answer_keywords: ["*appCan", "export"], seed_code: `import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { PermissionService } from './permission.service';

@Directive({ selector: '[appCan]', standalone: true })
export class CanDirective {
  private perm = '';
  private permissionService = inject(PermissionService);
  private vcr = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef);
  @Input() set appCan(perm: string) {
    this.perm = perm;
    this.updateView();
  }
  private updateView() {
    this.vcr.clear();
    if (this.permissionService.can(this.perm)) this.vcr.createEmbeddedView(this.templateRef);
  }
}`, feedback_correct: "✅ Design Permission System (Angular) complete.", feedback_partial: "updateView.", feedback_wrong: "Export", expected: "*appCan usage and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 99, title: TITLE, shortName: "A — PERMISSION SYSTEM" });

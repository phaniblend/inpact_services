import createINPACTEngine from "../inpact_engine_shared";

const TITLE = "Portal (Angular)";
const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #58 (Angular)", title: TITLE, body: "Render component content into a different DOM node (e.g. document.body for modals) using Angular CDK Portal: DomPortalOutlet or CdkPortal and PortalOutlet so content is attached outside the component tree.", usecase: "Angular CDK Portal (DomPortal, ComponentPortal) renders content into an outlet outside the host for modals and overlays." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Import PortalModule or CdkPortal, DomPortalOutlet from @angular/cdk/portal", "Create outlet: outlet = new DomPortalOutlet(el, injector, appRef); outlet.attach(componentPortal or templatePortal)", "Or use overlay: Overlay.create() and overlayRef.attach(ComponentPortal)", "Detach and dispose on destroy"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Import CdkPortal and PortalModule (or standalone CdkPortal). In template wrap content in <ng-template cdkPortal>. Get reference #portal=\"cdkPortal\".", answer_keywords: ["cdkPortal", "ng-template", "CdkPortal"], seed_code: `import { Component } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';

@Component({
  selector: 'app-portal-demo',
  standalone: true,
  imports: [PortalModule],
  template: \`<ng-template cdkPortal #portal="cdkPortal"><p>Portal content</p></ng-template>\`,
})
export class PortalDemoComponent {}`, feedback_correct: "✅ cdkPortal template.", feedback_partial: "PortalModule.", feedback_wrong: "cdkPortal", expected: "ng-template cdkPortal and #portal" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Inject ViewContainerRef and Injector. In ngAfterViewInit create DomPortalOutlet(document.body, this.injector, this.appRef) and outlet.attach(this.portal). Store outlet and detach in ngOnDestroy.", answer_keywords: ["DomPortalOutlet", "attach", "detach"], seed_code: `import { Component, ViewContainerRef, Injector, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { DomPortalOutlet, PortalModule } from '@angular/cdk/portal';

@Component({
  selector: 'app-portal-demo',
  standalone: true,
  imports: [PortalModule],
  template: \`<ng-template cdkPortal #portal="cdkPortal"><p>Portal content</p></ng-template>\`,
})
export class PortalDemoComponent implements AfterViewInit, OnDestroy {
  private vcr = inject(ViewContainerRef);
  private injector = inject(Injector);
  private outlet: DomPortalOutlet | null = null;
  ngAfterViewInit() {
    // Attach portal to body
  }
  ngOnDestroy() {
    this.outlet?.detach();
  }
}`, feedback_correct: "✅ Outlet and lifecycle.", feedback_partial: "DomPortalOutlet.", feedback_wrong: "attach", expected: "DomPortalOutlet and attach/detach" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Use CdkPortalOutlet in a sibling or body: create a div in body and use ViewContainerRef to create the outlet there, or use Overlay from CDK. Export the component.", answer_keywords: ["CdkPortalOutlet", "export"], seed_code: `import { Component } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';

@Component({
  selector: 'app-portal-demo',
  standalone: true,
  imports: [PortalModule],
  template: \`
    <ng-template cdkPortal #portal="cdkPortal"><p>Portal content</p></ng-template>
    <ng-container [cdkPortalOutlet]="portal"></ng-container>
  \`,
})
export class PortalDemoComponent {}`, feedback_correct: "✅ Portal (Angular) complete.", feedback_partial: "cdkPortalOutlet.", feedback_wrong: "Export", expected: "cdkPortalOutlet and export" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];
export default createINPACTEngine({ NODES, sideItems, lessonNum: 58, title: TITLE, shortName: "A — PORTAL" });

import {
  Component, Renderer2, ElementRef, Inject, HostListener/*, ElementRef, ViewChild, OnInit, DoCheck, AfterViewInit, OnDestroy,
  AfterContentInit, ComponentFactoryResolver, Input, Injectable, Compiler, 
  ComponentRef, Injector, NgModule, NgModuleRef, ViewContainerRef*/
} from '@angular/core';
//import { BrowserModule } from '@angular/platform-browser';
import { ProjectService } from '../service/project.service';
//import { DataService } from '../service/data.service';

//import { CommonModule } from "@angular/common";
//import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-help',
  templateUrl: './HelpComponent.html',
  styleUrls: []
})

// https://stackblitz.com/edit/angular-dynamic-content-viewer?file=app%2Fdynamic-content-viewer.ts
export class HelpComponent {

  // constructor(public ps: ProjectService) {

  // }

  // async ngOnInit() { 

  // }

  //@ViewChild('vc', { read: ViewContainerRef, static: false }) vc: ViewContainerRef;

  //private cmpRef: ComponentRef<any>;
  elementRef: ElementRef;
  constructor(private ps: ProjectService,/*, private dataService: DataService*/
    private renderer: Renderer2, @Inject(ElementRef) elementRef: ElementRef
  ) {
    this.elementRef = elementRef;
    ps.helpContentSubject.subscribe((helpContent) => {
     // this.elementRef.nativeElement.querySelector('a').addEventListener('click', this.onClick.bind(this));
      /*for (var i = 0; i < anchors.length; i++) {
        this.renderer.listen(anchors[i], 'onclick', function ($event) {
          this.functionToCall($event.target);
        });
      };*/
      //this.addComponent(helpContent, this.ps, this.dataService);
      console.log("helpContent changed");
    }
    );
    //this.renderer.listen()
  }
  onClick(target) {
    console.log("click:" + target);

  }

  /*@HostListener('document:click', ['$event'])
  clickout(event) {
    console.log("clicked " + event); 
  }*/

  // Here we create the component.
  /*private addComponent(template: string, ps: ProjectService, dataService: DataService) {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
    // Let's say your template looks like `<h2><some-component [data]="data"></some-component>`
    // As you see, it has an (existing) angular component `some-component` and it injects it [data]

    // Now we create a new component. It has that template, and we can even give it data.
    @Component({ 
      template: template
    })
    class DynamicComponent {
      constructor() { }
      /*async onClick(t1, t2) {
        console.log(t1);
        console.log(t2);
        ps.helpContent = await dataService.getObjectHelpAsHtml(t1, t2).toPromise();
      };*/
  /*}
  // Now, also create a dynamic module.
  @NgModule({
    imports: [BrowserModule],
    declarations: [DynamicComponent /*, HelloComponent *///],
  // providers: [] - e.g. if your dynamic component needs any service, provide it here.
  /* })
   class DynamicComponentModule { }

   // Now compile this module and component, and inject it into that #vc in your current component template.
   const mod = this.compiler.compileModuleAndAllComponentsSync(DynamicComponentModule);
   const factory = mod.componentFactories.find((comp) =>
     comp.componentType === DynamicComponent
   );
   this.cmpRef = this.vc.createComponent(factory);
 }

 // Cleanup properly. You can add more cleanup-related stuff here.
 ngOnDestroy() {
   if (this.cmpRef) {
     this.cmpRef.destroy();
   }
 }*/

}
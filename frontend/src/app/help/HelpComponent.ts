import { Component, ElementRef, ViewChild, OnInit, DoCheck, AfterViewInit } from '@angular/core';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';

import { Compiler, ComponentRef, Injector, NgModule, NgModuleRef, ViewContainerRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-help',
  templateUrl: './HelpComponent.html',
  styleUrls: []
})
export class HelpComponent {

  // constructor(public ps: ProjectService) {

  // }

  // async ngOnInit() { 

  // }

  @ViewChild('vc', { read: ViewContainerRef, static: false }) vc: ViewContainerRef;

  private cmpRef: ComponentRef<any>;

  constructor(private compiler: Compiler,
    private injector: Injector,
    private moduleRef: NgModuleRef<any>, private ps: ProjectService, private dataService: DataService
  ) {

    ps.helpContentSubject.subscribe((helpContent) => {
      this.createComponentFromRaw(helpContent);
      console.log("helpContent changed");
    }
    );

  }

  // ngAfterViewInit() {
  //   // Here, get your HTML from backend.
  //   this.createComponentFromRaw(`<!DOddfsdfCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0Strict//EN\"  \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\"><html><head></head>
  //   <body><div style="border: 1px solid blue; margin: 5px; padding: 5px">
  //   <h3>Start Raw Component ... </h3> 

  //   <a (click)="onC('test')" href="#">test</a> &nbsp; &nbsp;&nbsp;&nbsp;
  //   <a (click)="onC('test2')" href="#">test2</a> 

  //   </div></body></html>`);

  //   // console.log("this.ps.helpContent : " + this.ps.helpContent);

  //   // // this.createComponentFromRaw("`" + this.ps.helpContent + "`"); 

  //   // this.createComponentFromRaw(this.ps.helpContent);
  // }

  // Here we create the component.
  private createComponentFromRaw(template: string) {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
    // Let's say your template looks like `<h2><some-component [data]="data"></some-component>`
    // As you see, it has an (existing) angular component `some-component` and it injects it [data]

    // Now we create a new component. It has that template, and we can even give it data.
    const styles = [];
    function TmpCmpConstructor() {
      // this.data = { some: 'data' };
      // this.getX = () => 'X';
      this.onClick = (t1, t2) => {
        console.log(t1);
        console.log(t2);
        this.dataService.getObjectHelpAsHtml(t1, t2).toPromise().then((help) => this.ps.helpContent=help);
      };
    }
    const tmpCmp = Component({ template, styles })(new TmpCmpConstructor().constructor);

    // Now, also create a dynamic module.
    const tmpModule = NgModule({
      imports: [CommonModule],
      declarations: [tmpCmp /*, HelloComponent */],
      providers: [DataService]  // - e.g. if your dynamic component needs any service, provide it here.
    })(class { });

    // Now compile this module and component, and inject it into that #vc in your current component template.
    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        this.cmpRef = f.create(this.injector, [], null, this.moduleRef);
        this.cmpRef.instance.name = 'my-dynamic-component';
        this.vc.insert(this.cmpRef.hostView);
      });
  }

  // Cleanup properly. You can add more cleanup-related stuff here.
  ngOnDestroy() {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
  }

}
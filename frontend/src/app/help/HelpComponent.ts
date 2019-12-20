import { Component, Directive, HostListener, SecurityContext, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }
  transform(value: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Directive({
  selector: "[htmlContent]"
})
export class HTMLContentHandler {
  constructor(private ps: ProjectService, private dataService: DataService) { }
  @HostListener("click", ["$event.target"]) onClick(t: any) {
    if ((t.tagName == "A") && t.attributes["href"] != null) {
      let href = t.attributes["href"].value;
      console.log("HREF:" + href);
      // infer param1 and param 2 from "../../param1/html/param2"
      var matches = href.match(/\.\.\/\.\.\/(.*?)\/html\/(.*?)\.html/ig);
      if (matches != null && matches.length == 1) {
        var firstSplits = matches[0].split("/");
        var parameter1 = firstSplits[2];
        var lastInSplits = firstSplits[4];
        var secondSplits = lastInSplits.split(".");
        var parameter2 = secondSplits[0];
      }
      this.dataService.getObjectHelpAsHtml(parameter1, parameter2).toPromise().then(s =>
        this.ps.helpContent = s) // async update of helpcontent via then operator
      //this.ps.helpContent = await ;
      return false; // prevent default and stop propagation in a synchr. manner
    }
  }
}
@Component({
  selector: 'app-help',
  templateUrl: './HelpComponent.html',
  styleUrls: [],

})

// https://stackblitz.com/edit/angular-dynamic-content-viewer?file=app%2Fdynamic-content-viewer.ts
export class HelpComponent {

  constructor(private ps: ProjectService, ) {
    /*ps.helpContentSubject.subscribe((helpContent) => {
      this.addComponent(helpContent, this.ps, this.dataService);
      console.log("helpContent changed");
    }
    );*/
    //this.renderer.listen()
  }

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
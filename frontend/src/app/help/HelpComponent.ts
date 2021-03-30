import { Component, Directive, HostListener, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';

/**
 * Declare a angular sanitizing pipe to bypass trusted html, and skip sanitizing and warning.
 * This is ok for help html that is trusted through APIs.
 */
@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }

  transform(value: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }
}

/**
 * Help Content Handler class representing div with directive helpContent and innerhtml
 * This class will listen on DOM event click at the innerhtml.
 * Clicking hrefs will be prevented by default and stopped propagation in a synch. onClick handler
 * The help content will be updated based on packagename and objectName. Since the onClick must be synch,
 * the api route must handle the result asynch, and not synch as in async/await.
 */
@Directive({
  selector: "[helpContent]"
})
export class HelpContentHandler {

  constructor(private ps: ProjectService, private dataService: DataService) {
  }

  /**
   * DOM click event handler. The HOST is the element the helpContent directive is attached to.
   * @param elm 
   */
  @HostListener("click", ["$event.target"]) onClick(elm: HTMLElement) {
    if (elm.tagName.toUpperCase() == "A") { // handle element <a>
      let hRefAttr : Attr = elm.attributes["href"]; 
      if (hRefAttr != null) {
          var stringToMatch = hRefAttr.value;     
          var matches = stringToMatch.match(/\.\.\/\.\.\/(.*?)\/html\/(.*?)\.html/ig);
          if (matches != null && matches.length == 1) {
            this.updateHelpContentByHref(matches[0]);
            return false; // prevent default and stop propagation in a synchr. manner
          } 
          else {  // else if(!stringToMatch.startsWith(".."))
            // open url using node
            this.dataService.openUrl(stringToMatch).toPromise().then(st => console.log(st)); 
            return false;
          }
      }
    }
    return true; // allow default handler and up-propagation
  }

  /**
   * Rstox help hyper links contains package/object info.
   * When the href is clicked, this function will call the API and update help content.
   * async update of helpcontent via then operator
   * @param hRef on the form ../../packageName/html/objectName.html
   */
  private updateHelpContentByHref(oneMatch: string) {
    var splitElms = oneMatch.split("/");
    var packageName = splitElms[2];
    var fileName = splitElms[4];
    var fileNameElms = fileName.split(".");
    var objectName = fileNameElms[0];
    this.dataService.getObjectHelpAsHtml(packageName, objectName).toPromise().then(s =>this.ps.helpContent = s);
  }
}

@Component({
  selector: 'app-help',
  templateUrl: './HelpComponent.html',
  styleUrls: ['./HelpComponent.scss'],
})
export class HelpComponent {
  constructor(private ps: ProjectService, ) { }

  hasNext(): boolean {
    return this.ps.helpCache.hasNext();
  }

  hasPrevious(): boolean {
    return this.ps.helpCache.hasPrevious();
  } 

  previous() {
    this.ps.helpCache.previous();
  }

  next() {
    this.ps.helpCache.next();
  }
}
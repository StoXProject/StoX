import { Component, Directive, HostListener } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { DataService } from '../service/data.service';
import { CheckForUpdatesDialogService } from './CheckForUpdatesDialogService';

@Component({
  selector: 'CheckForUpdatesDialog',
  templateUrl: './CheckForUpdatesDialog.html',
  styleUrls: [],
})
export class CheckForUpdatesDialog {
  projectRootPath: string;

  constructor(
    public service: CheckForUpdatesDialogService
  ) {}

  async ngOnInit() {  
  }
}

/**
 * Declare a angular sanitizing pipe to bypass trusted html, and skip sanitizing and warning.
 * This is ok for update html that is trusted in this application.
 */
@Pipe({
  name: 'sanitizeUpdateHtml',
})
export class SanitizeUpdateHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(value);
  }
}

/**
 * Update Content Handler class representing div with directive updateContent and innerhtml
 * This class will listen on DOM event click from the innerhtml.
 * Clicking hrefs will be prevented by default and stopped propagation in a synch. 
 */
@Directive({
  selector: '[updateContent]',
})
export class UpdateContentHandler {
  constructor(
    private dataService: DataService
  ) {}

  /**
   * DOM click event handler. The HOST is the element the updateContent directive is attached to.
   * @param elm
   */
  @HostListener('click', ['$event.target']) onClick(elm: HTMLElement) {
    if (elm.tagName.toUpperCase() == 'A') {
      // handle element <a>
      const hRefAttr: Attr = elm.attributes['href'];

      if (hRefAttr != null) {
        const stringToMatch = hRefAttr.value;

        this.dataService
        .openUrl(stringToMatch)
        .toPromise()
        .then(st => console.log('> ' + st));

        return false;
      }
    }

    return true; // allow default handler and up-propagation
  }
}
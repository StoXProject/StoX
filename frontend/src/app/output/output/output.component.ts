import { Component, ElementRef, ViewChild, OnInit, Input } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { ProjectService } from '../../service/project.service';
import { DataService } from '../../service/data.service';
import { MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { SubjectAction } from 'src/app/data/subjectaction';
import { ContextMenu, MenuItem } from 'primeng';
import { OutputElement } from 'src/app/data/outputelement';
@Component({
    selector: 'output',
    templateUrl: './output.component.html',
    styleUrls: ['./output.component.scss']
})

export class OutputComponent implements OnInit {
    @Input() cm: ContextMenu;

    @ViewChild(MatMenuTrigger)
    @ViewChild("outputTableGroup") outputTableGroup: MatTabGroup;

    /*onContextMenu(event: MouseEvent, item: Object) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'item': item };
        this.contextMenu.menu.focusFirstItem('mouse');
        this.contextMenu.openMenu();
    }*/
    async prepCm(oe: OutputElement) {
        // comment: add list of outputtablenames to runModel result. 
        let m: MenuItem[] = [];
        m.push(
          { label: 'Close', icon: 'rib absa closeicon', command: (event) => { this.closeElement(oe) } }
        );
        if(this.ps.outputElements.length > 1) {
        m.push(
            { label: 'Close others', icon: 'rib absa emptyicon', command: (event) => { this.closeOtherElements(oe) } },
            { label: 'Close all', icon: 'rib absa emptyicon', command: (event) => { this.closeAllElements() } }
          );
        }
          this.cm.model = m;
      }

      async openCm(event: MouseEvent, oe: OutputElement) {
        event.preventDefault();
        event.stopPropagation();
        await this.prepCm(oe);
        this.cm.show(event);
        return false;
      }
    
    closeElement(oe) {
        let idx = this.ps.outputElements.findIndex(e => e.element.elementName == oe.element.elementName);
        this.ps.outputElements.splice(idx, 1);
        if(this.ps.outputElements.length > 0) {
            this.outputTableGroup.selectedIndex = Math.max(idx + 1, this.ps.outputElements.length - 1);
        }
    }

    closeOtherElements(oe) {
        let idx = this.ps.outputElements.findIndex(e => e.element.elementName == oe.element.elementName);
        let l : number = this.ps.outputElements.length;
        if(idx < l - 1) {
            this.ps.outputElements.splice(idx + 1, l - 1 - idx)
        }
        if(idx > 0) {
            this.ps.outputElements.splice(0, idx - 0)
        }
    }

    closeAllElements() {
        let l : number = this.ps.outputElements.length;
        if(l > 0 ) {
            this.ps.outputElements.splice(0, l)
        }
        (this.outputTableGroup?._tabHeader as MatTabHeader).updatePagination();
    }

    refreshData(processId: string) {
        this.ps.outputElements.filter(oe => oe.processId == processId).forEach(async oe => {
            await this.ps.resolveElementOutput(oe);
        });
    }

    removeData(processId: string) {
        this.ps.outputElements = this.ps.outputElements.filter(t => t.processId !== processId);
    }

    constructor(public ps: ProjectService, public ds: DataService, private sanitizer: DomSanitizer) {
        ps.outputTableActivator.subscribe({
            next: (idx) => {
                this.outputTableGroup.selectedIndex = idx;
            }
        });
        this.ps.processSubject.subscribe({
            next: (action: SubjectAction) => {
                switch (action.action) {
                    case "activate": {
                        //console.log("ActiveProcessId: " + action.data);
                        this.refreshData(action.data);
                        break;
                    }
                    case "remove": {
                        this.removeData(action.data);
                        break;
                    }
                }
            }
        });
    }
    ngOnInit() {
    }
    private getLines(s: string[]): string {
        return s.join("\n");
    }
    getItemOutput(item) {
        console.log(JSON.stringify(item.outputjson)); 
        return item.outputjson;
    }

    bypassURL(base64 : string) {
        return base64 == null ? "" : this.sanitizer.bypassSecurityTrustResourceUrl(
            `data:image/png;base64, ${base64}`
          );        
    }

}


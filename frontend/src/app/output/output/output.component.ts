import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { ProjectService } from '../../service/project.service';
import { DataService } from '../../service/data.service';
import { MatTabGroup } from '@angular/material/tabs';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { SubjectAction } from 'src/app/data/subjectaction';
@Component({
    selector: 'output',
    templateUrl: './output.component.html',
    styleUrls: ['./output.component.scss']
})

export class OutputComponent implements OnInit {

    @ViewChild(MatMenuTrigger)
    contextMenu: MatMenuTrigger;
    contextMenuPosition = { x: '0px', y: '0px' };
    @ViewChild("outputTableGroup") outputTableGroup: MatTabGroup;

    onContextMenu(event: MouseEvent, item: Object) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'item': item };
        this.contextMenu.menu.focusFirstItem('mouse');
        this.contextMenu.openMenu();
    }
    onContextMenuAction1() {
        let item: any = this.contextMenu.menuData;
        let idx = this.ps.outputElements.findIndex(e => e.element.elementFullName == item.item.table);
        console.log("index" + idx)
        this.ps.outputElements.splice(idx, 1)
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


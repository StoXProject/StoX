import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { MatTabGroup } from '@angular/material/tabs';


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
        let idx = this.ps.outputTables.findIndex(t => t.table == item.item.table);
        console.log("index" + idx)
        this.ps.outputTables.splice(idx, 1)
    }

    constructor(public ps: ProjectService) {
        ps.outputTableActivator.subscribe({
            next: (idx) => {
                this.outputTableGroup.selectedIndex = idx; 
            }
        });
    }
    ngOnInit() {
    }
    private getLines(s: string[]): string {
        return s.join("\n");
    }
    getItemOutput(item) {
        return item.output.data != null && Object.keys(item.output.data).length > 0 ? item.output.data.join('\n') : '';
    }
    onResize(event) {
        console.log(event);
    }
}


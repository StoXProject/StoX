import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';


@Component({
    selector: 'output',
    templateUrl: './output.component.html',
    styleUrls: ['./output.component.scss']
})

export class OutputComponent implements OnInit {

    @ViewChild(MatMenuTrigger)
    contextMenu: MatMenuTrigger;
    contextMenuPosition = { x: '0px', y: '0px' }; 

    onContextMenu(event: MouseEvent, item: Object) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'item': item };
        this.contextMenu.menu.focusFirstItem('mouse');
        this.contextMenu.openMenu();
    }
    onContextMenuAction1(item: any) {
        this.ps.outputTables.splice(this.ps.outputTables.findIndex(item), 1)
    }

    constructor(public ps: ProjectService) {
    }
    ngOnInit() {
    }
    private getLines(s: string[]): string {
        return s.join("\n");
    }
    getItemOutput(item) {
        return Object.keys(item.output.data).length > 0 ? item.output.data.join('\n') : '';
    }
}


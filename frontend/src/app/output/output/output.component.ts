import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { getListeners } from 'ol/events';


@Component({
    selector: 'output',
    templateUrl: './output.component.html',
    styleUrls: ['./output.component.scss']
})

export class OutputComponent implements OnInit {
    constructor(private ps : ProjectService){
    }
    ngOnInit() {
    }
   private getLines(s : string[]) : string {
       return s.join("\n");
   }
}


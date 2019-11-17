import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';


@Component({
    selector: 'output',
    templateUrl: './output.component.html',
    styleUrls: ['./output.component.scss']
})

export class OutputComponent implements OnInit {
    ngOnInit() {
    }
}

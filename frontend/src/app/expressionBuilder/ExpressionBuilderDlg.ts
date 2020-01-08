import { ExpressionBuilderDlgService } from './ExpressionBuilderDlgService';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'ExpressionBuilderDlg',
    templateUrl: './ExpressionBuilderDlg.html',
    styleUrls: []
  })
export class ExpressionBuilderDlg  implements OnInit {

    expression: string = "";

    @Output() messageEvent = new EventEmitter<string>();

    constructor(public service: ExpressionBuilderDlgService) {
        console.log("start ExpressionBuilderDlg constructor");
    }

    ngOnInit() {
        console.log("start ngOnInit in ExpressionBuilderDlg");
        //console.log("end ngOnInit");
    }    

    async apply() {
        console.log("start ExpressionBuilderDlg.apply()");

        // this.messageEvent.emit(this.expression);

        this.service.display = false;
    }
}

import { ExpressionBuilderDlgService } from './ExpressionBuilderDlgService';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { TableExpression } from '../data/tableexpression';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'ExpressionBuilderDlg',
    templateUrl: './ExpressionBuilderDlg.html',
    styleUrls: ['./ExpressionBuilderDlg.css']
  })
export class ExpressionBuilderDlg  implements OnInit {

    tableExpressions: TableExpression[] = [];
    combinedExpression: string = "";

    // tableName: string = "";
    // expression: string = "";

    displayedColumns = ['select', 'tableName', 'expression'];
    dataSource: MatTableDataSource<TableExpression>;
    selection = new SelectionModel<TableExpression>(true, []);

    @Output() messageEvent = new EventEmitter<string>();

    constructor(public service: ExpressionBuilderDlgService, ) {
        console.log("start ExpressionBuilderDlg constructor");
        // this.tableExpressions = Object.assign( ELEMENT_DATA);
        this.dataSource = new MatTableDataSource(this.tableExpressions);
    }

    async ngOnInit() {
        // console.log("start ngOnInit in ExpressionBuilderDlg");

     
    }    

    // deleteRecordAtIndex(index) {
    //     this.tableExpressions.splice(index, 1);
    // }

    // addRecord() {
    //     this.tableExpressions.push({tableName: this.tableName, expression: this.expression});
    // }

    addRow() {
        this.dataSource.data.push({tableName: "new table", expression: "new expression"});
        this.dataSource.filter = "";
    }    

    removeSelectedRows() {
        this.selection.selected.forEach(item => {
          let index: number = this.tableExpressions.findIndex(d => d === item);
          console.log(this.tableExpressions.findIndex(d => d === item));
          this.tableExpressions.splice(index,1)
          this.dataSource = new MatTableDataSource<TableExpression>(this.tableExpressions);
        });
        this.selection = new SelectionModel<TableExpression>(true, []);
    }   

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
    }

    async apply() {
        console.log("start ExpressionBuilderDlg.apply()");

        // check for uniqueness of tableName in array
        // combine all expressions in array tableExpressions into combinedExpression
        // emit combinedExpression to other components
        // this.messageEvent.emit(this.combinedExpression);

        this.service.display = false;
    }
}

const ELEMENT_DATA: TableExpression[] = [
    { tableName: 'Table 1', expression: 'Expression 1' },
    { tableName: 'Table 2', expression: 'Expression 2' },
    { tableName: 'Table 3', expression: 'Expression 3' },
     
  ];
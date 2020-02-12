
import { ExpressionBuilderDlgService } from './ExpressionBuilderDlgService';
import { QueryBuilderDlgService } from '../querybuilder/dlg/QueryBuilderDlgService';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { TableExpression } from '../data/tableexpression';
import { SelectionModel } from '@angular/cdk/collections';
import { MessageService } from '../message/MessageService';

@Component({
    selector: 'ExpressionBuilderDlg',
    templateUrl: './ExpressionBuilderDlg.html',
    styleUrls: ['./ExpressionBuilderDlg.css']
  })
export class ExpressionBuilderDlg  implements OnInit {

    // tableExpressions: TableExpression[] = [];
    combinedExpression: string = "";

    // tableName: string = "";
    // expression: string = "";

    displayedColumns = ['select', 'tableName', 'expression'];
    dataSource: MatTableDataSource<TableExpression>;
    selection = new SelectionModel<TableExpression>(true, []);

    @Output() messageEvent = new EventEmitter<string>();

    constructor(public service: ExpressionBuilderDlgService, private msgService: MessageService
        , private quBuilderService: QueryBuilderDlgService ) {
        // console.log("start ExpressionBuilderDlg constructor");
        // this.tableExpressions = Object.assign( ELEMENT_DATA);
        this.dataSource = new MatTableDataSource(this.service.tableExpressions);
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
        this.dataSource.data.push({tableName: null, expression: null});
        this.dataSource.filter = "";
    }    

    removeSelectedRows() {
        this.selection.selected.forEach(item => {
          let index: number = this.service.tableExpressions.findIndex(d => d === item);
          console.log(this.service.tableExpressions.findIndex(d => d === item));
          this.service.tableExpressions.splice(index,1)
          this.dataSource = new MatTableDataSource<TableExpression>(this.service.tableExpressions);
        });
        this.selection = new SelectionModel<TableExpression>(true, []);
    }   

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    atLeastOneSelected() {
        return this.selection.selected.length > 0;
    }

    isOnlyOneSelected() {
        return this.selection.selected.length === 1;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
    }

    areTableNamesUnique() {
        var tmpArr = [];
        for(var obj in this.service.tableExpressions) {
          if(tmpArr.indexOf(this.service.tableExpressions[obj].tableName) < 0){ 
            tmpArr.push(this.service.tableExpressions[obj].tableName);
          } else {
            return false; // Duplicate value for tableName found
          }
        }
        return true; // No duplicate values found for tableName
     }

     short(param: string): string {
        if(param.length > 43) {
            let i = param.indexOf('/');
            return param.substr(0, 27) + "..." + param.substr(i+1);
        } else {
            return param;
        }
     }

     buildExpression() {

        // check if current table name is given in the current row
        let currentTableExpression: TableExpression;
        currentTableExpression = this.selection.selected[0];

        if(currentTableExpression != null && currentTableExpression.tableName == null) {
            this.msgService.setMessage("Table name is not given in selected row!");
            this.msgService.showMessage();
            return;            
        }

        console.log("current table name : " + currentTableExpression.tableName);

        this.service.setCurrentTableExpression(currentTableExpression);

        // get current configuration from R using currentTableExpression.tableName as param

        this.service.updateQueryBuilderConfig();

        // set it as a property to QueryBuilderDlg

        // let the user get a new page of QueryBuilderDlg shown on screen

        // show query builder
        this.quBuilderService.showDialog();

     }

    async apply() {
        console.log("start ExpressionBuilderDlg.apply()");

        // check if there is empty field in dialog
        for(let i=0; i< this.service.tableExpressions.length; i++) {
            if(this.service.tableExpressions[i].tableName == null || this.service.tableExpressions[i].expression == null) {
                // show the message that one or more fields are empty
                this.msgService.setMessage("One or more fields are empty!");
                this.msgService.showMessage();
                return;
            }
        }

        // check for uniqueness of tableName in array
        if(!this.areTableNamesUnique()) {
            this.msgService.setMessage("Table or file names are not unique!");
            this.msgService.showMessage();
            return;
        }


        // combine all expressions in array tableExpressions into combinedExpression
        // emit combinedExpression to other components
        // this.messageEvent.emit(this.combinedExpression);

        // this.service.getCurrentPropertyItem().value = combinedExpression;

        this.service.display = false;
    }
}

// const ELEMENT_DATA: TableExpression[] = [
//     { tableName: 'Table 1', expression: 'Expression 1' },
//     { tableName: 'Table 2', expression: 'Expression 2' },
//     { tableName: 'Table 3', expression: 'Expression 3' },
     
//   ];
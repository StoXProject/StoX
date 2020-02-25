
import { ExpressionBuilderDlgService } from './ExpressionBuilderDlgService';
import { QueryBuilderDlgService } from '../querybuilder/dlg/QueryBuilderDlgService';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { TableExpression } from '../data/tableexpression';
import { SelectionModel } from '@angular/cdk/collections';
import { MessageService } from '../message/MessageService';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';
import { ProcessProperties } from '../data/ProcessProperties';

@Component({
    selector: 'ExpressionBuilderDlg',
    templateUrl: './ExpressionBuilderDlg.html',
    styleUrls: ['./ExpressionBuilderDlg.css']
  })
export class ExpressionBuilderDlg  implements OnInit {

    combinedExpression: string = "";

    displayedColumns = ['select', 'tableName', 'expression'];
    dataSource: MatTableDataSource<TableExpression>;
    selection = new SelectionModel<TableExpression>(true, []);

    constructor(public service: ExpressionBuilderDlgService, private msgService: MessageService
        , private quBuilderService: QueryBuilderDlgService, private ps: ProjectService, 
        private dataService: DataService ) {
        // console.log("start ExpressionBuilderDlg constructor");
        // this.tableExpressions = Object.assign( ELEMENT_DATA);
        // this.dataSource = new MatTableDataSource(this.service.tableExpressions);

        this.service.currentTableExpressionsObservable.subscribe(te => this.dataSource = new MatTableDataSource<TableExpression>(te));
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

        this.service.updateQueryBuilderConfig();

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
        this.combinedExpression = this.service.combinedExpression();

        console.log("this.combinedExpression : " + this.combinedExpression);
        console.log("this.service.getCurrentPropertyItem().value : " + this.service.getCurrentPropertyItem().value);

        if(this.combinedExpression != null && this.service.getCurrentPropertyItem().value != this.combinedExpression) {

            this.service.getCurrentPropertyItem().value = this.combinedExpression;

            if (this.ps.selectedProject != null && this.ps.selectedProcess != null && this.ps.selectedModel != null) {
                try {
                  this.dataService.setProcessPropertyValue(this.service.getCurrentPropertyCategory().groupName, this.service.getCurrentPropertyItem().name, this.service.getCurrentPropertyItem().value, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcess.processID)
                    .toPromise().then((s: ProcessProperties) => {
                      this.ps.propertyCategories = s.propertySheet;
                      // this.ps.helpContent = s.help;
                      this.ps.helpContent = s.help; // this.ps.sanitizer.bypassSecurityTrustHtml(s.help);
          
                      // Special case if a property processname is changed, it should update the selected process name
                    //   if (this.ps.selectedProcess != null && pi.name == 'processName') {
                    //     this.ps.selectedProcess.processName = pi.value; 
                    //   }
                    });
                } catch (error) {
                  console.log(error.error);
                  var firstLine = error.error.split('\n', 1)[0];
                  this.msgService.setMessage(firstLine);
                  this.msgService.showMessage();
                  return;
                }
            }
        }

        this.selection.clear();
        this.service.display = false;
    }
}
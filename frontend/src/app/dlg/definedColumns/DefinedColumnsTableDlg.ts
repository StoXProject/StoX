import { MatTableDataSource } from '@angular/material/table';
import { DefinedColumns, ColumnPossibleValues, ColumnType } from '../../data/DefinedColumns';
import { SelectionModel } from '@angular/cdk/collections';
import { DefinedColumnsService } from './DefinedColumnsService';
import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../message/MessageService';
import { ProjectService } from '../../service/project.service'; 
import { DataService } from '../../service/data.service';
import { ProcessProperties } from '../../data/ProcessProperties';

@Component({
    selector: 'DefinedColumnsTableDlg',
    templateUrl: './DefinedColumnsTableDlg.html',
    styleUrls: ['./DefinedColumnsTableDlg.css']
})
export class DefinedColumnsTableDlg implements OnInit {

    // displayedColumns = ['select', 'NewSpeciesCategory', 'NewAcousticCategory', 'SpeciesCategory', 'Alpha', 'Beta', 'LMin', 'LMax', 'AcousticCategory', 'm', 'a', 'd'];
    title: string = "";
    displayedColumns = ['select'];
    columnPossibleValues: ColumnPossibleValues[] = [];
    columnTypes: ColumnType[] = [];

    dataSource: MatTableDataSource<DefinedColumns> = new MatTableDataSource<DefinedColumns>(this.service.definedColumnsData);
    selection = new SelectionModel<DefinedColumns>(true, []);

    combinedExpression = "";

    constructor(public service: DefinedColumnsService, private msgService: MessageService, private ps: ProjectService,
        private dataService: DataService) {
        service.definedColumnsDataObservable.subscribe(dcd => {
            this.dataSource = new MatTableDataSource<DefinedColumns>(dcd);
        });

        service.displayedColumnsObservable.subscribe(dColumns => {
            this.displayedColumns = dColumns;
        });

        service.titleObservable.subscribe(titl => {
            this.title = titl;
        });

        service.columnPossibleValuesObservable.subscribe(cpv => {
            this.columnPossibleValues = cpv;
        });

        service.columnTypesObservable.subscribe(cdt => {
            this.columnTypes = cdt;
        });
    }

    async ngOnInit() {
    }

    addRow() {
        let obj = <DefinedColumns>{};
        this.displayedColumns.forEach(key => {
            if (key != 'select') {
                obj[key] = null;
            }
        });
        this.service.definedColumnsData.push(obj);
        this.dataSource = new MatTableDataSource<DefinedColumns>(this.service.definedColumnsData);
        // this.dataSource.data.push(obj);
        this.dataSource.filter = "";
    }

    removeSelectedRows() {
        this.selection.selected.forEach(item => {
            let index: number = this.service.definedColumnsData.findIndex(d => d === item);
            console.log(this.service.definedColumnsData.findIndex(d => d === item));
            this.service.definedColumnsData.splice(index, 1);
            this.dataSource = new MatTableDataSource<DefinedColumns>(this.service.definedColumnsData);
        });
        this.selection = new SelectionModel<DefinedColumns>(true, []);
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

    possibleValues(colName: string): string[] {
        for (let i = 0; i < this.columnPossibleValues.length; i++) {
            if (this.columnPossibleValues[i].columnName == colName) {
                return this.columnPossibleValues[i].possibleValues;
            }
        }
        return null;
    }

    getType(colName: string): string {
        for (let i = 0; i < this.columnTypes.length; i++) {
            if (this.columnTypes[i].columnName == colName) {
                return this.columnTypes[i].type;
            }
        }
        return null;        
    }

    // areOldNamesUnique() {
    //     // var tmpArr = [];
    //     // for(var obj in this.service.definedColumnsData) {
    //     //   if(tmpArr.indexOf(this.service.definedColumnsData[obj].old) < 0){ 
    //     //     tmpArr.push(this.service.definedColumnsData[obj].old);
    //     //   } else {
    //     //     return false; // Duplicate value for tableName found
    //     //   }
    //     // }
    //     // return true; // No duplicate values found for tableName

    //     let keyColumns = ['SpeciesCategory', 'NewSpeciesCategory', 'AcousticCategory', 'NewAcousticCategory'];

    //     for(let i=0; i<this.service.definedColumnsData.length; i++) {
    //         let result = 
    //         this.service.definedColumnsData.filter(
    //             dcd => {           
    //                 // Object.keys(keyColumns).forEach(key => {dcd[key] == this.service.definedColumnsData[i][key]});
    //                 let j=0;
    //                 while(j<keyColumns.length) {
    //                     let key = keyColumns[j];
    //                     if(dcd[key] != this.service.definedColumnsData[i][key]) {
    //                         return false;
    //                     }
    //                     j++;
    //                 }
    //                 return true;
    //             }
    //         );

    //         if(result.length > 1) {
    //             return false;
    //         }
    //     }

    //     return true;
    // }

    apply() {

        // validate input for null values in dialog and show messages if necessary
        // check if there is empty field in dialog
        for (let i = 0; i < this.service.definedColumnsData.length; i++) {
            let blankFound = false;
            this.displayedColumns.forEach(key => {
                if (key != 'select') {
                    if (this.service.definedColumnsData[i][key] == null) {
                        console.log("Field " + key + " is null in row index : " + i);
                        // show the message that one or more fields are empty
                        this.msgService.setMessage("One or more fields are empty!");
                        this.msgService.showMessage();
                        blankFound = true;
                    }
                }
            });

            if (blankFound) {
                return;
            }
        }

        // validate input for duplicate rows 

        // get the combined string from service
        this.combinedExpression = this.service.combinedExpression();

        console.log("this.service.currentPropertyItem.value : " + this.service.currentPropertyItem.value);
        console.log("this.combinedExpression : " + this.combinedExpression);

        // save the combined string into current property item and run set property values function if there is a change in value
        if (this.combinedExpression != null && this.service.currentPropertyItem.value != this.combinedExpression) {
            this.service.currentPropertyItem.value = this.combinedExpression;
            // run set property value function
            if (this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null) {
                try {
                    this.dataService.setProcessPropertyValue(this.service.currentPropertyCategory.groupName,
                        this.service.currentPropertyItem.name, this.service.currentPropertyItem.value,
                        this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId)
                        .toPromise().then((s: ProcessProperties) => {
                            this.ps.processProperties.propertySheet = s.propertySheet;
                            // TODO: introduce property service with onChanged
                            this.ps.processes = s.processTable
                            this.ps.activeProcessId = s.activeProcess.processID;
                            this.ps.selectedProject.saved = s.saved;
                            if (s.updateHelp) {
                                this.ps.updateHelp();
                            }

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

        this.onHide();
    }

    cancel() {
        this.onHide();
    }

    onHide() {
        this.selection.clear();
        this.service.display = false;
    }
}
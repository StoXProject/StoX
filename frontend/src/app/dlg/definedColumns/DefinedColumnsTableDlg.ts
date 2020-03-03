import { MatTableDataSource } from '@angular/material';
import { DefinedColumns, ColumnPossibleValues } from '../../data/DefinedColumns';
import { SelectionModel } from '@angular/cdk/collections';
import { DefinedColumnsService } from './DefinedColumnsService';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'DefinedColumnsTableDlg',
    templateUrl: './DefinedColumnsTableDlg.html',
    styleUrls: ['./DefinedColumnsTableDlg.css']
  })
export class DefinedColumnsTableDlg  implements OnInit {
    
    // displayedColumns = ['select', 'NewSpeciesCategory', 'NewAcousticCategory', 'SpeciesCategory', 'Alpha', 'Beta', 'LMin', 'LMax', 'AcousticCategory', 'm', 'a', 'd'];
    title: string = "";
    displayedColumns = ['select'];
    columnPossibleValues: ColumnPossibleValues[] = [];

    dataSource: MatTableDataSource<DefinedColumns> = new MatTableDataSource<DefinedColumns>(this.service.definedColumnsData);
    selection = new SelectionModel<DefinedColumns>(true, []);    

    constructor(public service: DefinedColumnsService) {

        service.displayedColumnsObservable.subscribe(dColumns => {
            this.displayedColumns = dColumns;
        });

        service.titleObservable.subscribe(titl => {
            this.title = titl;
        });

        service.columnPossibleValuesObservable.subscribe(cpv => {
            this.columnPossibleValues = cpv;
        });
    }

    async ngOnInit() {
    }

    addRow() {
        let obj = <DefinedColumns>{};
        this.displayedColumns.forEach(key => {
            if(key != 'select') {
                obj[key] = null;
            }
        });
        this.dataSource.data.push(obj);
        this.dataSource.filter = "";
    }    

    removeSelectedRows() {
        this.selection.selected.forEach(item => {
          let index: number = this.service.definedColumnsData.findIndex(d => d === item);
          console.log(this.service.definedColumnsData.findIndex(d => d === item));
          this.service.definedColumnsData.splice(index,1)
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

    possibleValues(colName: string) {
        for(let i=0; i<this.columnPossibleValues.length; i++) {
            if(this.columnPossibleValues[i].columnName == colName) {
                return this.columnPossibleValues[i].possibleValues;
            }
        }
        return null;
    }

    // areOldNamesUnique() {
    //     var tmpArr = [];
    //     for(var obj in this.service.definedColumnsData) {
    //       if(tmpArr.indexOf(this.service.definedColumnsData[obj].old) < 0){ 
    //         tmpArr.push(this.service.definedColumnsData[obj].old);
    //       } else {
    //         return false; // Duplicate value for tableName found
    //       }
    //     }
    //     return true; // No duplicate values found for tableName
    //  }

    apply() {


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
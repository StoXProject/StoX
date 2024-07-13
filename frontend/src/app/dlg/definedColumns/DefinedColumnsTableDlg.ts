import { SelectionModel } from '@angular/cdk/collections';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorUtils } from 'src/app/utils/errorUtils';
import { ValidationUtils } from 'src/app/utils/validationUtils';

import { ColumnPossibleValues, ColumnType, ColumnValue, DefinedColumns } from '../../data/DefinedColumns';
import { ProcessProperties } from '../../data/ProcessProperties';
import { MessageService } from '../../message/MessageService';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { DefinedColumnsService } from './DefinedColumnsService';

@Component({
  selector: 'DefinedColumnsTableDlg',
  templateUrl: './DefinedColumnsTableDlg.html',
  styleUrls: ['./DefinedColumnsTableDlg.css'],
})
export class DefinedColumnsTableDlg {
  title: string = '';
  displayedColumns = ['select'];
  columnPossibleValues: ColumnPossibleValues[] = [];
  columnTypes: ColumnType[] = [];

  dataSource: MatTableDataSource<DefinedColumns> = new MatTableDataSource<DefinedColumns>(this.service.definedColumnsData);
  selection = new SelectionModel<DefinedColumns>(true, []);

  combinedExpression = '';

  constructor(
    public service: DefinedColumnsService,
    private msgService: MessageService,
    private ps: ProjectService,
    private dataService: DataService
  ) {
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

  init() {
    this.title = '';
    this.displayedColumns = ['select'];
    this.columnPossibleValues = [];
    this.columnTypes = [];
    this.service.definedColumnsData = [];
    this.dataSource = new MatTableDataSource<DefinedColumns>(this.service.definedColumnsData);
  }

  allowNumberLikeString(value: string, colName: string, inputRef: any, previousValue: string) {
    const newInputIsValid = ValidationUtils.TestInputWhileWritingANumber(value);
    const previousValueWasValid = ValidationUtils.TestInputWhileWritingANumber(`${previousValue}` ?? '');

    const setValue = newInputIsValid ? value : previousValueWasValid ? previousValue : '';
    // Update HTML input field
    inputRef.value = setValue;

    setTimeout(() => {
      // Manually reset binding model
      for (let i = 0; i < this.service.definedColumnsData[0].columnValues.length; i++) {
        if (this.service.definedColumnsData[0].columnValues[i].columnName == colName) {
          this.service.definedColumnsData[0].columnValues[i].value = setValue;
        }
      }
    }, 1);
  }

  allowOnlyProperNumberString(colName: string, inputRef: any) {
    if (ValidationUtils.TestInputWholeNumberString(inputRef.value)) {
      return;
    }

    // Reset HTML input field for good measure
    inputRef.value = '';

    setTimeout(() => {
      // Manually reset binding model, because this triggers after input change is lost in Angular
      for (let i = 0; i < this.service.definedColumnsData[0].columnValues.length; i++) {
        if (this.service.definedColumnsData[0].columnValues[i].columnName == colName) {
          this.service.definedColumnsData[0].columnValues[i].value = '';
        }
      }
    }, 1);
  }

  addRow() {
    const obj = new DefinedColumns();

    this.displayedColumns.forEach(key => {
      if (key != 'select') {
        const cv = new ColumnValue();

        cv.columnName = key;
        cv.value = null;
        obj.columnValues.push(cv);
      }
    });

    this.service.definedColumnsData.push(obj);
    this.dataSource = new MatTableDataSource<DefinedColumns>(this.service.definedColumnsData);
    this.dataSource.filter = '';
  }

  removeSelectedRows() {
    this.selection.selected.forEach(item => {
      const index: number = this.service.definedColumnsData.findIndex(d => d === item);
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
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
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

  apply() {
    // validate input for null values in dialog and show messages if necessary
    // check if there is empty field in dialog
    for (let i = 0; i < this.service.definedColumnsData.length; i++) {
      for (let j = 0; j < this.service.definedColumnsData[i].columnValues.length; j++) {
        // Treat empty string (empty field) as null
        if (this.service.definedColumnsData[i].columnValues[j].value == '') {
          this.service.definedColumnsData[i].columnValues[j].value = null;
        }
      }
    }

    // validate input for duplicate rows

    // get the combined string from service
    this.combinedExpression = this.service.combinedExpression();

    console.log('> ' + 'this.service.currentPropertyItem.value : ' + this.service.currentPropertyItem.value);
    console.log('> ' + 'this.combinedExpression : ' + this.combinedExpression);

    // save the combined string into current property item and run set property values function if there is a change in value
    if (this.combinedExpression != null && this.service.currentPropertyItem.value != this.combinedExpression) {
      this.service.currentPropertyItem.value = this.combinedExpression;
      // run set property value function
      const notNull = this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null;
      if (notNull) {
        try {
          const { groupName } = this.service.currentPropertyCategory;
          const { name, value } = this.service.currentPropertyItem;
          this.dataService
            .setProcessPropertyValue(groupName, name, value, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId)
            .toPromise()
            .then((s: ProcessProperties) => {
              this.ps.handleAPI(s);
            });
        } catch (error) {
          console.log('> ' + error.error);
          const firstLine = ErrorUtils.GetFirstLine(error);

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
    this.init();
  }
}

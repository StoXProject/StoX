import { Injectable } from '@angular/core';
import { DefinedColumns, ColumnPossibleValues, ColumnType, ColumnValue } from '../../data/DefinedColumns';
import { PropertyItem } from '../../data/propertyitem';
import { PropertyCategory } from '../../data/propertycategory';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DefinedColumnsService {
  constructor(
    private ps: ProjectService,
    private dataService: DataService
  ) {}

  public display: boolean = false;
  public isOpening: boolean = false;

  public oldNames: string[] = [];

  currentPropertyItem: PropertyItem = null;
  currentPropertyCategory: PropertyCategory = null;

  public definedColumnsData: DefinedColumns[] = [];
  private definedColumnsDataSource = new BehaviorSubject(this.definedColumnsData);
  definedColumnsDataObservable = this.definedColumnsDataSource.asObservable();

  public title: string = '';
  private currentTitleSource = new BehaviorSubject(this.title);
  titleObservable = this.currentTitleSource.asObservable();

  public displayedColumns = ['select'];
  private displayedColumnsSource = new BehaviorSubject(this.displayedColumns);
  displayedColumnsObservable = this.displayedColumnsSource.asObservable();

  columnPossibleValues: ColumnPossibleValues[] = [];
  private columnPossibleValuesSource = new BehaviorSubject(this.columnPossibleValues);
  columnPossibleValuesObservable = this.columnPossibleValuesSource.asObservable();

  columnTypes: ColumnType[] = [];
  private columnTypesSource = new BehaviorSubject(this.columnTypes);
  columnTypesObservable = this.columnTypesSource.asObservable();

  init() {
    this.definedColumnsData = [];
    this.title = '';
    this.columnPossibleValues = [];
    this.columnTypes = [];
    this.displayedColumns = ['select'];
  }

  combinedExpression(): string {
    let combinedArray = [];
    this.definedColumnsData.forEach(t => {
      let combinedObj = {};
      t.columnValues.forEach(cv => {
        combinedObj[cv.columnName] = cv.value;
      });
      combinedArray.push(combinedObj);
    });

    console.log('> ' + 'combinedArray : ' + JSON.stringify(combinedArray));

    return JSON.stringify(combinedArray);
  }

  async showDialog() {
    this.init();

    this.display = true;
    this.isOpening = true;
    // parse currentPropertyItem.value and populate definedColumnsData and send it to dialog
    if (this.currentPropertyItem.value != null && this.currentPropertyItem.value.trim() != '') {
      let o: any[] = JSON.parse(this.currentPropertyItem.value);

      o.forEach(o1 => {
        let keys = Object.keys(o1);
        let dc = new DefinedColumns();
        keys.forEach(key => {
          let cv = new ColumnValue();
          cv.columnName = key;
          cv.value = o1[key];
          dc.columnValues.push(cv);
        });
        this.definedColumnsData.push(dc);
      });

      this.definedColumnsDataSource.next(this.definedColumnsData);
    }

    let returnValue = <any>await this.dataService.getParameterTableInfo(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId, this.currentPropertyItem.format).toPromise();

    if (returnValue != null) {
      console.log('> ' + 'returnValue : ' + JSON.stringify(returnValue));

      console.log('> ' + "returnValue['parameterTableTitle'] : " + returnValue['parameterTableTitle']);
      this.title = returnValue['parameterTableTitle'];
      this.currentTitleSource.next(this.title);
      console.log('> ' + "returnValue['parameterTableColumnNames'] : " + returnValue['parameterTableColumnNames']);
      console.log('> ' + "returnValue['parameterTableVariableTypes'] : " + returnValue['parameterTableVariableTypes']);

      let columns = returnValue['parameterTableColumnNames'];
      for (let i = 0; i < columns.length; i++) {
        console.log('> ' + columns[i]);
        this.displayedColumns.push(columns[i]);
        let column = new ColumnPossibleValues();
        column.columnName = columns[i];

        if (returnValue['parameterTablePossibleValues'][i].length == 0) {
          column.possibleValues = null;
        } else {
          column.possibleValues = returnValue['parameterTablePossibleValues'][i];
        }

        this.columnPossibleValues.push(column);

        let colType = new ColumnType();
        colType.columnName = columns[i];
        colType.type = returnValue['parameterTableVariableTypes'][i];
        this.columnTypes.push(colType);
      }

      this.displayedColumnsSource.next(this.displayedColumns);
      this.columnPossibleValuesSource.next(this.columnPossibleValues);
      this.columnTypesSource.next(this.columnTypes);

      console.log('> ' + "returnValue['parameterTablePossibleValues'] : " + JSON.stringify(returnValue['parameterTablePossibleValues']));
    }
    this.isOpening = false;
  }
}

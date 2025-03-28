import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SelectedVariable } from '../../data/DefinedColumns';
import { PropertyCategory } from '../../data/propertycategory';
import { PropertyItem } from '../../data/propertyitem';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';

@Injectable()
export class SingleVariableService {
  constructor(
    private ps: ProjectService,
    private dataService: DataService
  ) {}

  public display: boolean = false;

  currentPropertyItem: PropertyItem = null;
  currentPropertyCategory: PropertyCategory = null;

  returnValue: any = null;

  public selectedVariable: SelectedVariable[] = [];
  private selectedVariableDataSource = new BehaviorSubject(this.selectedVariable);
  selectedVariableObservable = this.selectedVariableDataSource.asObservable();

  public title: string = '';
  private currentTitleSource = new BehaviorSubject(this.title);
  titleObservable = this.currentTitleSource.asObservable();

  possibleValues: string[] = [];

  init() {
    this.selectedVariable = [];
    this.title = '';
    this.possibleValues = [];
  }

  combinedExpression(): string {
    const combinedArray = [];

    this.selectedVariable.forEach(t => {
      combinedArray.push(new String(t.variableName));
    });

    console.log('> ' + 'combinedArray : ' + JSON.stringify(combinedArray));

    return JSON.stringify(combinedArray);
  }

  isJSONArray(str: string): boolean {
    try {
      const jsonArray = JSON.parse(str);

      return Array.isArray(jsonArray);
    } catch (error) {
      return false; // Parsing failed, not a valid JSON array
    }
  }

  async showDialog() {
    this.init();

    // parse currentPropertyItem.value and populate definedColumnsData and send it to dialog
    if (this.currentPropertyItem.value != null && this.currentPropertyItem.value.trim() != '') {
      if (this.isJSONArray(this.currentPropertyItem.value)) {
        const o: any[] = JSON.parse(this.currentPropertyItem.value);

        if (o.length >= 1) {
          const obj = new SelectedVariable();
          obj.variableName = o[1];
          this.selectedVariable.push(obj);
        }
      } else {
        const obj = new SelectedVariable();
        obj.variableName = this.currentPropertyItem.value;
        this.selectedVariable.push(obj);
      }
    }

    if (this.selectedVariable.length === 0) {
      const obj = new SelectedVariable();
      obj.variableName = '';
      this.selectedVariable.push(obj);
    }

    this.selectedVariableDataSource.next(this.selectedVariable);

    if (this.returnValue != null) {
      console.log('> ' + 'returnValue : ' + JSON.stringify(this.returnValue));
      console.log('> ' + "returnValue['parameterSingleTitle'] : " + this.returnValue['parameterSingleTitle']);

      this.title = this.returnValue['parameterSingleTitle'];
      this.currentTitleSource.next(this.title);

      console.log('> ' + "returnValue['parameterSinglePossibleValues'] : " + JSON.stringify(this.returnValue['parameterSinglePossibleValues']));

      if (this.returnValue['parameterSinglePossibleValues'] != null) {
        this.possibleValues = this.returnValue['parameterSinglePossibleValues'];
      }
    }

    this.display = true;
  }
}

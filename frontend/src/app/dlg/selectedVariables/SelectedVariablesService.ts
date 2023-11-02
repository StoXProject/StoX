import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SelectedVariable } from '../../data/DefinedColumns';
import { PropertyCategory } from '../../data/propertycategory';
import { PropertyItem } from '../../data/propertyitem';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';

@Injectable()
export class SelectedVariablesService {
  constructor(
    private ps: ProjectService,
    private dataService: DataService
  ) {}

  public display: boolean = false;

  currentPropertyItem: PropertyItem = null;
  currentPropertyCategory: PropertyCategory = null;

  returnValue: any = null;

  public selectedVariables: SelectedVariable[] = [];
  private selectedVariablesDataSource = new BehaviorSubject(this.selectedVariables);
  selectedVariablesObservable = this.selectedVariablesDataSource.asObservable();

  public title: string = '';
  private currentTitleSource = new BehaviorSubject(this.title);
  titleObservable = this.currentTitleSource.asObservable();

  possibleValues: string[] = [];

  init() {
    this.selectedVariables = [];
    this.title = '';
    this.possibleValues = [];
  }

  combinedExpression(): string {
    const combinedArray = [];

    this.selectedVariables.forEach(t => {
      combinedArray.push(new String(t.variableName));
    });

    console.log('> ' + 'combinedArray : ' + JSON.stringify(combinedArray));

    return JSON.stringify(combinedArray);
  }

  async showDialog() {
    this.init();

    // parse currentPropertyItem.value and populate definedColumnsData and send it to dialog
    if (this.currentPropertyItem.value != null && this.currentPropertyItem.value.trim() != '') {
      const o: any[] = JSON.parse(this.currentPropertyItem.value);

      o.forEach(o1 => {
        const obj = new SelectedVariable();

        obj.variableName = o1;
        this.selectedVariables.push(obj);
      });

      this.selectedVariablesDataSource.next(this.selectedVariables);
    }

    // this.returnValue  = <any> await this.dataService.getParameterVectorInfo(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId, this.currentPropertyItem.format).toPromise();

    if (this.returnValue != null) {
      console.log('> ' + 'returnValue : ' + JSON.stringify(this.returnValue));
      console.log('> ' + "returnValue['parameterVectorTitle'] : " + this.returnValue['parameterVectorTitle']);

      this.title = this.returnValue['parameterVectorTitle'];
      this.currentTitleSource.next(this.title);

      console.log('> ' + "returnValue['parameterVectorPossibleValues'] : " + JSON.stringify(this.returnValue['parameterVectorPossibleValues']));

      if (this.returnValue['parameterVectorPossibleValues'] != null) {
        this.possibleValues = this.returnValue['parameterVectorPossibleValues'];
      }
    }

    this.display = true;
  }
}

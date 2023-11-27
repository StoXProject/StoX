import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorUtils } from 'src/app/utils/errorUtils';

import { SelectedVariable } from '../../data/DefinedColumns';
import { ProcessProperties } from '../../data/ProcessProperties';
import { MessageService } from '../../message/MessageService';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { SingleVariableService } from './SingleVariableService';

@Component({
  selector: 'SingleVariableDlg',
  templateUrl: './SingleVariableDlg.html',
  styleUrls: ['./SingleVariableDlg.css'],
})
export class SingleVariableDlg implements OnInit {
  title: string = '';
  displayedColumns = ['variableName'];

  dataSource: MatTableDataSource<SelectedVariable> = new MatTableDataSource<SelectedVariable>(this.service.selectedVariable);

  combinedExpression: string = '';

  constructor(
    public service: SingleVariableService,
    private msgService: MessageService,
    private ps: ProjectService,
    private dataService: DataService
  ) {
    service.selectedVariableObservable.subscribe(dcd => {
      this.dataSource = new MatTableDataSource<SelectedVariable>(dcd);
    });

    service.titleObservable.subscribe(titl => {
      this.title = titl;
    });
  }

  async ngOnInit() {}

  init() {
    this.combinedExpression = '';
    this.title = '';
    this.service.returnValue = null;
    this.service.selectedVariable = [];
    this.dataSource = new MatTableDataSource<SelectedVariable>(this.service.selectedVariable);
  }

  isEmpty(value): boolean {
    return (
      // null or undefined
      value == null ||
      // has length and it's zero
      (value.hasOwnProperty('length') && value.length === 0) ||
      // is an Object and has no keys
      (value.constructor === Object && Object.keys(value).length === 0)
    );
  }

  apply() {
    // validate input for null or empty values in dialog and show messages if necessary
    for (let i = 0; i < this.service.selectedVariable.length; i++) {
      const containsOnlySpaces: boolean = /^\s*$/.test(this.service.selectedVariable[i].variableName);

      if (this.service.selectedVariable[i].variableName == null || containsOnlySpaces) {
        console.log('> ' + 'Field is null or empty in row index : ' + i);
        this.msgService.setMessage('One or more fields are empty!');
        this.msgService.showMessage();

        return;
      }
    }

    // get the combined string from service
    this.combinedExpression = this.service.combinedExpression();

    console.log('> ' + 'this.service.currentPropertyItem.value : ' + this.service.currentPropertyItem.value);
    console.log('> ' + 'this.combinedExpression : ' + this.combinedExpression);

    // save the combined string into current property item and run set property values function if there is a change in value
    if (this.combinedExpression != null && this.service.currentPropertyItem.value != this.combinedExpression) {
      this.service.currentPropertyItem.value = this.combinedExpression;
      // run set property value function
      if (this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null) {
        try {
          this.dataService
            .setProcessPropertyValue(this.service.currentPropertyCategory.groupName, this.service.currentPropertyItem.name, this.service.currentPropertyItem.value, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId)
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
    this.service.display = false;
    this.init();
  }
}

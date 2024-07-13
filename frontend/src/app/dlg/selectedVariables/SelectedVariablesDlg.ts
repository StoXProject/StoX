import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorUtils } from 'src/app/utils/errorUtils';

import { SelectedVariable } from '../../data/DefinedColumns';
import { ProcessProperties } from '../../data/ProcessProperties';
import { MessageService } from '../../message/MessageService';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { SelectedVariablesService } from './SelectedVariablesService';

@Component({
  selector: 'SelectedVariablesDlg',
  templateUrl: './SelectedVariablesDlg.html',
  styleUrls: ['./SelectedVariablesDlg.css'],
})
export class SelectedVariablesDlg implements OnInit {
  title: string = '';
  displayedColumns = ['variableName', 'action'];

  dataSource: MatTableDataSource<SelectedVariable> = new MatTableDataSource<SelectedVariable>(this.service.selectedVariables);
  // selection = new SelectionModel<SelectedVariable>(true, []);

  combinedExpression: string = '';

  constructor(
    public service: SelectedVariablesService,
    private msgService: MessageService,
    private ps: ProjectService,
    private dataService: DataService
  ) {
    service.selectedVariablesObservable.subscribe(dcd => {
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
    this.service.selectedVariables = [];
    this.dataSource = new MatTableDataSource<SelectedVariable>(this.service.selectedVariables);
  }

  addRow() {
    const obj = new SelectedVariable();

    obj.variableName = null;
    this.service.selectedVariables.push(obj);
    this.dataSource = new MatTableDataSource<SelectedVariable>(this.service.selectedVariables);
    // this.dataSource.data.push(obj);
    this.dataSource.filter = '';
  }

  // removeSelectedRows() {
  //     this.selection.selected.forEach(item => {
  //         let index: number = this.service.selectedVariables.findIndex(d => d === item);
  //         // console.log("> " + this.service.definedColumnsData.findIndex(d => d === item));
  //         this.service.selectedVariables.splice(index, 1);
  //         this.dataSource = new MatTableDataSource<SelectedVariable>(this.service.selectedVariables);
  //     });
  //     this.selection = new SelectionModel<SelectedVariable>(true, []);
  // }

  delete(selectedVariable: SelectedVariable) {
    const index: number = this.service.selectedVariables.findIndex(d => d === selectedVariable);

    this.service.selectedVariables.splice(index, 1);
    this.dataSource = new MatTableDataSource<SelectedVariable>(this.service.selectedVariables);
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

  hasDuplicates(arr: SelectedVariable[]) {
    const uniqueSet = new Set();

    for (let i = 0; i < arr.length; i++) {
      uniqueSet.add(arr[i].variableName);
    }

    if (uniqueSet.size != arr.length) {
      return true;
    } else {
      return false;
    }
  }

  apply() {
    // validate input for null values in dialog and show messages if necessary
    // check if there is empty field in dialog
    for (let i = 0; i < this.service.selectedVariables.length; i++) {
      if (this.service.selectedVariables[i].variableName == null) {
        console.log('> ' + 'Field is null in row index : ' + i);
        this.msgService.setMessage('One or more fields are empty!');
        this.msgService.showMessage();

        return;
      }
    }

    // validate input for duplicate rows
    if (this.hasDuplicates(this.service.selectedVariables)) {
      this.msgService.setMessage('There are duplicates!');
      this.msgService.showMessage();

      return;
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
    // this.selection.clear();
    this.service.display = false;
    this.init();
  }
}

import { Component } from '@angular/core';

import { ProcessProperties } from '../data/ProcessProperties';
import { PropertyCategory } from '../data/propertycategory';
import { PropertyItem } from '../data/propertyitem';
import { FilePathDlgService } from '../dlg/filePath/FilePathDlgService';
import { MessageService } from '../message/MessageService';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { ErrorUtils } from '../utils/errorUtils';
import { PathUtils } from '../utils/pathUtils';
import { DefinedColumnsService } from './../dlg/definedColumns/DefinedColumnsService';
import { SelectedVariablesService } from './../dlg/selectedVariables/SelectedVariablesService';
import { SingleVariableService } from './../dlg/singleVariable/SingleVariableService';
import { ExpressionBuilderDlgService } from './../expressionBuilder/ExpressionBuilderDlgService';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss'],
})
export class ParameterComponent {
  cols = [
    { field: 'name', header: 'Name' },
    { field: 'value', header: 'Value' },
  ];

  constructor(
    private msgService: MessageService,
    public ps: ProjectService,
    private dataService: DataService,
    private exprBuilderService: ExpressionBuilderDlgService,
    private definedColumnsService: DefinedColumnsService,
    private filePathDlgService: FilePathDlgService,
    private selectedVariablesService: SelectedVariablesService,
    private singleVariableService: SingleVariableService
  ) {}

  getMetParameterValueList(): any[] {
    return [{ name: false }, { name: true }];
  }

  onChanged(category: PropertyCategory, pi: PropertyItem) {
    let { value } = pi;
    const { name, type } = pi;
    const { groupName } = category;
    console.log('> ' + 'In group ' + groupName + ' parameter ' + name + ' is changed to ' + value);
    // function name change sends first value == undefined from autocomplete

    // send null as empty string.
    if (value == null) {
      console.log('> ' + 'p.value==null');
      value = '';
    }

    // Quote strings to let backend smoothly transform all values to its corresponding types(jsonlite::fromJSON removes the quotes)
    if (type == 'character' && (pi.format == 'none' || value === '' || pi.formatClass == 'single')) {
      // single value string as json compatible
      value = JSON.stringify(value);
    }

    const notNull = this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null;
    if (!notNull) {
      return;
    }

    try {
      this.dataService
        .setProcessPropertyValue(groupName, name, value, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId)
        .toPromise()
        .then((s: ProcessProperties) => {
          this.ps.handleAPI(s);
        });
    } catch (error) {
      console.log('> ' + error.error);
      const firstLine = ErrorUtils.GetFirstLine(error);

      this.setAndShowMessage(firstLine);

      return;
    }
  }

  async filter(category: PropertyCategory, pi: PropertyItem) {
    this.exprBuilderService.currentPropertyItem = pi;
    this.exprBuilderService.currentPropertyCategory = category;

    this.exprBuilderService.showDialog();
  }

  definedColumns(category: PropertyCategory, pi: PropertyItem) {
    this.definedColumnsService.currentPropertyCategory = category;
    this.definedColumnsService.currentPropertyItem = pi;

    this.definedColumnsService.showDialog();
  }

  async definedVector(category: PropertyCategory, pi: PropertyItem) {
    const returnValue = <any>await this.dataService.getParameterVectorInfo(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId, pi.format).toPromise();

    console.log('> ' + 'returnValue : ' + JSON.stringify(returnValue));

    if (this.ps.isEmpty(returnValue)) {
      this.setAndShowMessage('Empty object from backend. See user log.');
      this.selectedVariablesService.returnValue = null;

      return;
    }

    this.selectedVariablesService.currentPropertyCategory = category;
    this.selectedVariablesService.currentPropertyItem = pi;
    this.selectedVariablesService.returnValue = returnValue;

    this.selectedVariablesService.showDialog();
  }

  async definedSingle(category: PropertyCategory, pi: PropertyItem) {
    // TODO: to test a new method implemented in R
    const returnValue = <any>await this.dataService.getParameterSingleInfo(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId, pi.format).toPromise();

    console.log('> ' + 'returnValue : ' + JSON.stringify(returnValue));

    if (this.ps.isEmpty(returnValue)) {
      this.setAndShowMessage('Empty object from backend. See user log.');
      this.singleVariableService.returnValue = null;

      return;
    }

    this.singleVariableService.currentPropertyCategory = category;
    this.singleVariableService.currentPropertyItem = pi;
    this.singleVariableService.returnValue = returnValue;

    this.singleVariableService.showDialog();
  }

  async filePath(category: PropertyCategory, pi: PropertyItem) {
    let options = {};

    switch (pi.format) {
      case 'filePath':
        options = { properties: ['openFile'], title: 'Select file', defaultPath: this.ps.selectedProject.projectPath };
        break;

      case 'filePaths':
        this.filePathDlgService.currentPropertyCategory = category;
        this.filePathDlgService.currentPropertyItem = pi;
        this.filePathDlgService.showDialog();

        return; // Value is set in the dialog

      case 'directoryPath':
        options = { properties: ['openDirectory'], title: 'Select folder', defaultPath: this.ps.selectedProject.projectPath };
        break;
      default: {
        this.setAndShowMessage(pi.format + ' is not implemented!');

        return;
      }
    }

    const filePathRawSingleItemList = await this.dataService.browsePath(options).toPromise();
    const path = this.convertSingleItemListToNiceFilePathString(filePathRawSingleItemList);

    const hasChanged = path != pi.value;

    if (hasChanged) {
      pi.value = path; // Send single item as string
      // call setProcessPropertyValue
      this.onChanged(category, pi);
    }
  }

  // Helpers
  // _______________________________________________________________________________________

  setAndShowMessage = (message: string) => {
    this.msgService.setMessage(message);
    this.msgService.showMessage();
  };

  isDisabled = () => {
    return this.ps.getRunningProcess() !== null && this.ps.getRunningProcess() !== undefined;
  };

  convertSingleItemListToNiceFilePathString = (filePathRawSingleItemList: string) => {
    let singleItemPath = null;
    if (filePathRawSingleItemList != null) {
      const rawPath = (<string[]>JSON.parse(filePathRawSingleItemList))[0];
      singleItemPath = PathUtils.ConvertBackslash(rawPath);
    }

    return singleItemPath;
  };
}

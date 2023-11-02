import { Component, OnInit } from '@angular/core';

import { ProcessProperties } from '../data/ProcessProperties';
import { PropertyCategory } from '../data/propertycategory';
import { PropertyItem } from '../data/propertyitem';
import { FilePathDlgService } from '../dlg/filePath/FilePathDlgService';
import { MessageService } from '../message/MessageService';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { DefinedColumnsService } from './../dlg/definedColumns/DefinedColumnsService';
import { SelectedVariablesService } from './../dlg/selectedVariables/SelectedVariablesService';
import { ExpressionBuilderDlgService } from './../expressionBuilder/ExpressionBuilderDlgService';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss'],
})
export class ParameterComponent implements OnInit {
  cols = [
    { field: 'name', header: 'Name', width: '50%' },
    { field: 'value', header: 'Value', width: '50%' },
  ];

  constructor(
    private msgService: MessageService,
    public ps: ProjectService,
    private dataService: DataService,
    private exprBuilderService: ExpressionBuilderDlgService,
    private definedColumnsService: DefinedColumnsService,
    private filePathDlgService: FilePathDlgService,
    private selectedVariablesService: SelectedVariablesService
  ) {}

  async ngOnInit() {}

  getMetParameterValueList(): any[] {
    return [{ name: false }, { name: true }];
  }

  onChanged(category: PropertyCategory, pi: PropertyItem) {
    console.log('> ' + 'In group ' + category.groupName + ' parameter ' + pi.name + ' is changed to ' + pi.value);
    // function name change sends first pi.value == undefined from autocomplete

    if (pi.value == null) {
      console.log('> ' + 'p.value==null');
      pi.value = ''; // send null as empty string.
    }

    let val = pi.value;

    // Quote strings to let backend smoothly transform all values to its corresponding types(jsonlite::fromJSON removes the quotes)
    if (pi.type == 'character' && (pi.format == 'none' || pi.value === '')) {
      // single value string as json compatible
      val = JSON.stringify(val);
    }

    if (this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null) {
      try {
        this.dataService
          .setProcessPropertyValue(category.groupName, pi.name, val, this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId)
          .toPromise()
          .then((s: ProcessProperties) => {
            this.ps.handleAPI(s);
          });
      } catch (error) {
        console.log('> ' + error.error);
        const firstLine = error.error.split('\n', 1)[0];

        this.msgService.setMessage(firstLine);
        this.msgService.showMessage();

        return;
      }
    }
  }

  async filter(category: PropertyCategory, pi: PropertyItem) {
    // set this pi as the current PropertyItem in ExpressionBuilderService
    this.exprBuilderService.currentPropertyItem = pi;
    this.exprBuilderService.currentPropertyCategory = category;

    // run ExpressionBuilderService.showDialog() to show Expression builder dialog
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
      this.msgService.setMessage('Empty object from backend. See user log.');
      this.msgService.showMessage();
      this.selectedVariablesService.returnValue = null;

      return;
    }

    this.selectedVariablesService.currentPropertyCategory = category;
    this.selectedVariablesService.currentPropertyItem = pi;
    this.selectedVariablesService.returnValue = returnValue;

    this.selectedVariablesService.showDialog();
  }

  async filePath(category: PropertyCategory, pi: PropertyItem) {
    // console.log("> " + "project path : " + this.ps.selectedProject.projectPath);

    let options = {};

    if (pi.format == 'filePath') {
      options = { properties: ['openFile'], title: 'Select file', defaultPath: this.ps.selectedProject.projectPath };
    } else if (pi.format == 'filePaths') {
      this.filePathDlgService.currentPropertyCategory = category;
      this.filePathDlgService.currentPropertyItem = pi;
      this.filePathDlgService.showDialog();

      return;
    } else if (pi.format == 'directoryPath') {
      options = { properties: ['openDirectory'], title: 'Select folder', defaultPath: this.ps.selectedProject.projectPath };
    } else {
      this.msgService.setMessage(pi.format + ' is not implemented!');
      this.msgService.showMessage();

      return;
    }

    const filePath = await this.dataService.browsePath(options).toPromise();

    let paths: string[] = [];

    if (filePath != null) {
      paths = <string[]>JSON.parse(filePath);
      for (let i = 0; i < paths.length; i++) {
        paths[i] = paths[i].replace(/\\/g, '/');
      }
    }

    if (JSON.stringify(paths) != pi.value) {
      pi.value = JSON.stringify(paths);
      // call setProcessPropertyValue
      this.onChanged(category, pi);
    }
  }
}

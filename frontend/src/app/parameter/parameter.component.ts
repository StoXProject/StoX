import { ExpressionBuilderDlgService } from './../expressionBuilder/ExpressionBuilderDlgService';
import { DefinedColumnsService } from './../dlg/definedColumns/DefinedColumnsService';
import { SelectedVariablesService } from './../dlg/selectedVariables/SelectedVariablesService';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
//import { FormGroup, FormBuilder } from '@angular/forms';
import { ProjectService } from '../service/project.service';
import { PropertyItem } from '../data/propertyitem';
import { PropertyCategory } from '../data/propertycategory';
import { ProcessProperties } from '../data/ProcessProperties'
import { DataService } from '../service/data.service';
import { MessageService } from '../message/MessageService';
import { FilePathDlgService } from '../dlg/filePath/FilePathDlgService';
import { Accordion } from 'primeng/accordion';
// import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class ParameterComponent implements OnInit {
  cols = [
    { field: 'name', header: 'Name', width: '50%' },
    { field: 'value', header: 'Value', width: '50%' }
  ];


  //  booleanForm: FormGroup; private msgService: MessageService,
  constructor(private msgService: MessageService, public ps: ProjectService,
    private dataService: DataService, private exprBuilderService: ExpressionBuilderDlgService,
    private definedColumnsService: DefinedColumnsService, private filePathDlgService: FilePathDlgService,
    private selectedVariablesService: SelectedVariablesService) { }

  async ngOnInit() {
    /*    let a = [];
        for (let i = 0; i < 2; i++) {
          let j = { name: null };
          a.push(j);
          j.name = 'test' + i;
        }
        console.log("> " + a[0].name + a[1].name);*/
  }

  getMetParameterValueList(): any[] {
    return [{ name: false }, { name: true }];
  }

  onChanged(category: PropertyCategory, pi: PropertyItem) {
    console.log("> " + "In group " + category.groupName + " parameter " + pi.name + " is changed to " + pi.value);
    // function name change sends first pi.value == undefined from autocomplete

    /*if (pi.value == undefined) {
      return;
    }*/
    if (pi.value == null) {
      console.log("> " + "p.value==null")
      pi.value = ""; // send null as empty string.
    }
    let val = pi.value;
    // Quote strings to let backend smoothly transform all values to its corresponding types(jsonlite::fromJSON removes the quotes)
    if (pi.type == "character" && (pi.format == "none" || pi.value === "")) { // single value string as json compatible
      val = JSON.stringify(val);
    }
    //if (pi.value == "" && pi.format == "filePaths") {
    //pi.value = "[]";   
    //}
    //return;
    // groupName: string, name: string, value: string, projectPath: string, modelName: string, processID: string
    if (this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null) {
      try {
        this.dataService.setProcessPropertyValue(category.groupName, pi.name, val, this.ps.selectedProject.projectPath,
          this.ps.selectedModel.modelName, this.ps.selectedProcessId)
          .toPromise().then((s: ProcessProperties) => {
            this.ps.handleAPI(s);
          });
      } catch (error) {
        console.log("> " + error.error);
        var firstLine = error.error.split('\n', 1)[0];
        this.msgService.setMessage(firstLine);
        this.msgService.showMessage();
        return;
      }

    }
  }

  // filterPossibleValues(event) {
  //   if(this.propertyItem == null) {
  //     return;
  //   }
  //   this.filteredValues = [];
  //   for(let i = 0; i < this.propertyItem.possibleValues.length; i++) {
  //       let currentValue = this.propertyItem.possibleValues[i];
  //       // if(currentValue.toLowerCase().indexOf(event.query.toLowerCase()) == 0) {
  //       if(currentValue.toLowerCase().startsWith(event.query.toLowerCase())) {  
  //           this.filteredValues.push(currentValue);
  //       }
  //   }
  // }

  // wrapSelectItems(s: string[]) {
  //   return s.map(st => { return { label: st, value: st }; })
  // }

  async filter(category: PropertyCategory, pi: PropertyItem) {
    // set this pi as the current PropertyItem in ExpressionBuilderService
    this.exprBuilderService.currentPropertyItem = pi;
    this.exprBuilderService.currentPropertyCategory = category;

    // let tableNames = <string[]>await this.dataService.getProcessOutputTableNames(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId).toPromise();
    // console.log("> " + "tableNames : " + JSON.stringify(tableNames));

    // if (tableNames != null && JSON.stringify(tableNames) == '{}') {
    //   tableNames = [];
    // }

    // run ExpressionBuilderService.showDialog() to show Expression builder dialog
    this.exprBuilderService.showDialog();
  }

  definedColumns(category: PropertyCategory, pi: PropertyItem) {
    this.definedColumnsService.currentPropertyCategory = category;
    this.definedColumnsService.currentPropertyItem = pi;

    this.definedColumnsService.showDialog();
  }

  async definedVector(category: PropertyCategory, pi: PropertyItem) {

    let returnValue  = <any> await this.dataService.getParameterVectorInfo(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId, pi.format).toPromise();
    console.log("> " + "returnValue : " + JSON.stringify(returnValue));

    if(this.ps.isEmpty(returnValue)) {
      this.msgService.setMessage("Empty object from backend. See user log.");
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

    if (pi.format == "filePath") {
      options = { properties: ['openFile'], title: 'Select file', defaultPath: this.ps.selectedProject.projectPath };
    }
    else if (pi.format == "filePaths") {
      // options = {properties:["multiSelections","openFile"], title: 'Select files', defaultPath: this.ps.selectedProject.projectPath};
      this.filePathDlgService.currentPropertyCategory = category;
      this.filePathDlgService.currentPropertyItem = pi;
      this.filePathDlgService.showDialog();
      return;
    }
    else if (pi.format == "directoryPath") {
      options = { properties: ["openDirectory"], title: 'Select folder', defaultPath: this.ps.selectedProject.projectPath };
    } else {
      this.msgService.setMessage(pi.format + " is not implemented!");
      this.msgService.showMessage();
      return;
    }

    let filePath = await this.dataService.browsePath(options).toPromise();

    var paths: string[] = [];
    if (filePath != null) {
      // filePath = filePath.replace(/\\\\/g, "/");

      paths = <string[]>JSON.parse(filePath);
      for (let i = 0; i < paths.length; i++) {
        paths[i] = paths[i].replace(/\\/g, "/");
      }
    }

    if (JSON.stringify(paths) != pi.value) {
      pi.value = JSON.stringify(paths);
      // call setProcessPropertyValue
      this.onChanged(category, pi);
    }
  }
}


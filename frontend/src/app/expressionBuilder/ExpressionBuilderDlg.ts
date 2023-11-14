import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ProcessProperties } from '../data/ProcessProperties';
import { TableExpression } from '../data/tableexpression';
import { MessageService } from '../message/MessageService';
import { QueryBuilderDlgService } from '../querybuilder/dlg/QueryBuilderDlgService';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { ErrorUtils } from '../utils/errorUtils';
import { ExpressionBuilderDlgService } from './ExpressionBuilderDlgService';

@Component({
  selector: 'ExpressionBuilderDlg',
  templateUrl: './ExpressionBuilderDlg.html',
  styleUrls: ['./ExpressionBuilderDlg.css'],
})
export class ExpressionBuilderDlg {
  combinedExpression: string = '';

  displayedColumns = ['tableName', 'expression', 'action'];
  dataSource: MatTableDataSource<TableExpression>;

  constructor(
    public service: ExpressionBuilderDlgService,
    private msgService: MessageService,
    private quBuilderService: QueryBuilderDlgService,
    private ps: ProjectService,
    private dataService: DataService
  ) {
    this.service.currentTableExpressionsObservable.subscribe(tes => (this.dataSource = new MatTableDataSource<TableExpression>(tes)));
  }

  addRow() {
    this.service.tableExpressions.push({ tableName: null, expression: null });
    this.dataSource = new MatTableDataSource<TableExpression>(this.service.tableExpressions);
    this.dataSource.filter = '';
  }


  onTableNameChange(tableExpression: TableExpression) {
    tableExpression.expression = null;

    const duplicateTableName = this.getDuplicateTableName();
    if(duplicateTableName != null) {
      this.setAndShowMessage('Table name ' + duplicateTableName + " is a duplicate!");
    }
  }

  edit(tableExpression: TableExpression) {
    if (tableExpression != null && tableExpression.tableName == null) {
      this.setAndShowMessage('Table name is not given in the selected row!');

      return;
    }

    const duplicateTableName = this.getDuplicateTableName();
    if(duplicateTableName != null) {
      this.setAndShowMessage('Table name ' + duplicateTableName + " is a duplicate!");

      return;
    }    

    console.log('> ' + 'current table name : ' + tableExpression.tableName);

    this.service.setCurrentTableExpression(tableExpression);
    this.service.updateQueryBuilderConfig();

    this.quBuilderService.showDialog();
  }

  delete(tableExpression: TableExpression) {
    const index: number = this.service.tableExpressions.findIndex(d => d === tableExpression);

    this.service.tableExpressions.splice(index, 1);
    this.dataSource = new MatTableDataSource<TableExpression>(this.service.tableExpressions);
  }

  async apply() {
    console.log('> ' + 'start ExpressionBuilderDlg.apply()');

    // check if there is empty field in dialog
    for (let i = 0; i < this.service.tableExpressions.length; i++) {
      if (this.service.tableExpressions[i].tableName == null || this.service.tableExpressions[i].expression == null) {
        this.setAndShowMessage('One or more fields are empty!');

        return;
      }
    }

    if (!this.areTableNamesUnique()) {
      this.setAndShowMessage('Table or file names are not unique!');

      return;
    }

    this.combinedExpression = this.service.combinedExpression();

    console.log('> ' + 'this.combinedExpression : ' + this.combinedExpression);
    console.log('> ' + 'this.service.currentPropertyItem.value : ' + this.service.currentPropertyItem.value);

    const notNullAndUpdated = this.combinedExpression != null && this.service.currentPropertyItem.value != this.combinedExpression;
    if (!notNullAndUpdated) {
      this.onHide();

      return;
    }

    this.service.currentPropertyItem.value = this.combinedExpression;

    if (this.ps.selectedProject != null && this.ps.selectedProcessId != null && this.ps.selectedModel != null) {
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

        this.setAndShowMessage(firstLine);

        return;
      }
    }

    this.onHide();
  }

  init() {
    this.service.tableExpressions = [];
    this.dataSource = new MatTableDataSource<TableExpression>(this.service.tableExpressions);
  }

  cancel() {
    this.onHide();
  }

  onHide() {
    this.service.display = false;
    this.init();
  }

  // Helpers
  //_________________________________________
  setAndShowMessage(msg: string) {
    this.msgService.setMessage(msg);
    this.msgService.showMessage();
  }

  areTableNamesUnique() {
    const tmpArr = [];

    for (const obj in this.service.tableExpressions) {
      const tableName = this.service.tableExpressions[obj].tableName;
      if (tmpArr.indexOf(tableName) >= 0) {
        return false; // Duplicate value in tableName found
      }

      tmpArr.push(tableName);
    }

    return true; // No duplicate values found in tableName
  }

  getDuplicateTableName() {
    const tmpArr = [];

    for (const obj in this.service.tableExpressions) {
      const tableName = this.service.tableExpressions[obj].tableName;
      if (tmpArr.indexOf(tableName) >= 0) {
        return tableName; // Duplicate value in tableName found
      }

      tmpArr.push(tableName);
    }

    return null; // No duplicate values found in tableName
  }  
}

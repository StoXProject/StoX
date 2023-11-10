import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PropertyCategory } from '../data/propertycategory';
import { PropertyItem } from '../data/propertyitem';
import { TableExpression } from '../data/tableexpression';
import { MessageService } from '../message/MessageService';
import { QueryBuilderConfig } from '../querybuilder/module/query-builder.interfaces';
import { RuleSet } from '../querybuilder/module/query-builder.interfaces';
import { DataService } from './../service/data.service';
import { ProjectService } from './../service/project.service';

@Injectable()
export class ExpressionBuilderDlgService {
  public tableNames: string[] = [];

  public config: QueryBuilderConfig = <QueryBuilderConfig>{};
  public query: RuleSet = { condition: '&', rules: [] };

  private configSource = new BehaviorSubject(this.config);
  currentConfig = this.configSource.asObservable();

  private querySource = new BehaviorSubject(this.query);
  currentQuery = this.querySource.asObservable();

  public display: boolean = false;
  public isOpening: boolean = false;

  public currentTableExpression: TableExpression = null;
  private currentTableExpressionSource = new BehaviorSubject(this.currentTableExpression);
  tableExpressionObservable = this.currentTableExpressionSource.asObservable();

  currentPropertyItem: PropertyItem = null;
  currentPropertyCategory: PropertyCategory = null;

  public tableExpressions: TableExpression[] = [];
  private tableExpressionsSource = new BehaviorSubject(this.tableExpressions);
  currentTableExpressionsObservable = this.tableExpressionsSource.asObservable();

  constructor(
    private dataService: DataService,
    private ps: ProjectService,
    private msgService: MessageService
  ) {}

  // Setters and getters
  //_________________________________________

  setCurrentTableExpression(tableExpression: TableExpression) {
    this.currentTableExpression = tableExpression;
    this.currentTableExpressionSource.next(this.currentTableExpression);
  }

  getCurrentTableExpression(): TableExpression {
    return this.currentTableExpression;
  }

  setCurrentPropertyItem(pi: PropertyItem) {
    this.currentPropertyItem = pi;
  }

  getCurrentPropertyItem(): PropertyItem {
    return this.currentPropertyItem;
  }

  setCurrentPropertyCategory(category: PropertyCategory) {
    this.currentPropertyCategory = category;
  }

  getCurrentPropertyCategory(): PropertyCategory {
    return this.currentPropertyCategory;
  }

  // Expression builder
  //_________________________________________
  /**
   * Combine all expressions in array tableExpressions into combinedExpression
   */
  combinedExpression(): string {
    const combinedTable = {};

    this.tableExpressions.forEach(t => {
      combinedTable[t.tableName] = t.expression;
    });

    return JSON.stringify(combinedTable);
  }

  async updateQueryBuilderConfig() {
    try {
      this.query = { condition: '&', rules: [] };

      const { selectedProject, selectedModel, selectedProcessId } = this.ps;
      const { projectPath } = selectedProject;
      const { modelName } = selectedModel;
      const { tableName } = this.currentTableExpression;

      const { fields } = await this.dataService.getFilterOptionsOneTable(projectPath, modelName, selectedProcessId, tableName, false).toPromise();

      // getAllFilterOptionsOneTable returner objektet fields med options i ny format
      // {name: [name1, name2....], value: [value1, value2, ....]}
      // istedet for
      // [{name, value},{name, value},{name, value}]

      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        if (field.options != null) {
          const allOptions = Array.isArray(field.options.name) ? field.options.name : [field.options.names];
          const allValues = Array.isArray(field.options.value) ? field.options.value : [field.options.value];

          field.options = allOptions.map((name, index) => {
            return { name, value: allValues[index] };
          });
        }
      });

      this.config = <QueryBuilderConfig>{ fields };
      const notNullOrEmpty = this.currentTableExpression.expression != null && this.currentTableExpression.expression.trim() != '';

      if (notNullOrEmpty) {
        // build query object from rExpression
        this.query = <RuleSet>await this.dataService.expression2list(this.currentTableExpression.expression).toPromise();
      }

      this.configSource.next(this.config);
      this.querySource.next(this.query);
    } catch (error) {
      console.log('> ' + error);
    }
  }

  // Dialog
  //_________________________________________

  async showDialog() {
    // Show dialog modal and show spinner before loading dialog data from backend
    this.display = true;
    this.isOpening = true;

    const { selectedProject, selectedModel, selectedProcessId } = this.ps;
    const { projectPath } = selectedProject;
    const { modelName } = selectedModel;

    this.tableNames = await this.dataService.getFilterTableNames(projectPath, modelName, selectedProcessId).toPromise();

    if (this.ps.isEmpty(this.tableNames)) {
      this.setAndShowMessage('Could not get filter options. See user log.');
      this.display = false;

      return;
    }

    const notNullOrEmpty = this.currentPropertyItem.value != null && this.currentPropertyItem.value.trim() != '';
    if (!notNullOrEmpty) {
      this.isOpening = false;

      return;
    }

    const itemJson: any = JSON.parse(this.currentPropertyItem.value);

    // build array of tableExpressions from rExpression
    this.tableExpressions = [];

    Object.keys(itemJson).forEach(key => {
      this.tableExpressions.push({ tableName: key, expression: itemJson[key] });
    });

    this.tableExpressionsSource.next(this.tableExpressions);

    this.isOpening = false;
  }

  // Helpers
  //_________________________________________

  setAndShowMessage(msg: string) {
    this.msgService.setMessage(msg);
    this.msgService.showMessage();
  }
}

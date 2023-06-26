import { DataService } from './../service/data.service';
import { ProjectService } from './../service/project.service';
import { Injectable } from '@angular/core';
import { TableExpression } from '../data/tableexpression';
import { QueryBuilderConfig } from '../querybuilder/module/query-builder.interfaces';
import { BehaviorSubject } from 'rxjs';
import { PropertyItem } from '../data/propertyitem';
import { PropertyCategory } from '../data/propertycategory';
import { RuleSet } from '../querybuilder/module/query-builder.interfaces';
import { MessageService } from '../message/MessageService';

@Injectable({
    providedIn: 'root'
})
export class ExpressionBuilderDlgService {

    public tableNames: string[] = [];
    public allOptions: any;

    public config: QueryBuilderConfig = <QueryBuilderConfig>{};
    public query: RuleSet = { condition: "&", rules: [] };

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

    constructor(private dataService: DataService, private ps: ProjectService, private msgService: MessageService) { }

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

    async updateQueryBuilderConfig() {
        try {

            this.query = { condition: "&", rules: [] };

            // this.config = <QueryBuilderConfig>await this.dataService.getFilterOptions(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId, this.currentTableExpression.tableName).toPromise();
    
            this.config = <QueryBuilderConfig>this.allOptions.allFields[this.currentTableExpression.tableName];

            // console.log("> " + "this.config : " + JSON.stringify(this.config));

            if (this.currentTableExpression.expression != null && this.currentTableExpression.expression.trim() != "") {
                // build query object from rExpression
                // instantiate this.query object
                this.query = <RuleSet>await this.dataService.expression2list(this.currentTableExpression.expression).toPromise();
            }

            // console.log("> " + "this.query : " + JSON.stringify(this.query));
    
            this.configSource.next(this.config);
            this.querySource.next(this.query);
        } catch(error) {
            console.log("> " + error);
        }
    }

    combinedExpression(): string {
        let combinedTable = {};
        this.tableExpressions.forEach( t => {  combinedTable[t.tableName] = t.expression } );
        return JSON.stringify(combinedTable);
    }

    async showDialog() {
        this.display = true; // make the dialog modal and showing progress before loading dialog data from backend
        this.isOpening = true;

        let allOptions = await this.dataService.getFilterOptionsAll(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcessId, false).toPromise();
        //console.log("> " + "allOptions : " + JSON.stringify(allOptions));
    
        if (this.ps.isEmpty(allOptions)) {
          this.msgService.setMessage("Can not get filter options. See user log.");
          this.msgService.showMessage();
          this.display = false;
          return;
        }
    
        this.allOptions = allOptions;
        this.tableNames = allOptions.tableNames;
        console.log("> " + "tableNames : " + JSON.stringify(this.tableNames));
    
        // build array of tableExpressions from rExpression
        console.log("> " + "this.currentPropertyItem.value : " + this.currentPropertyItem.value);

        this.tableExpressions = [];
        if (this.currentPropertyItem.value != null && this.currentPropertyItem.value.trim() != "") {
            let o: any = JSON.parse(this.currentPropertyItem.value);
            let keys = Object.keys(o);
            keys.forEach(key => {
                console.log("> " + key + "=>" + o[key]);
                this.tableExpressions.push({ tableName: key, expression: o[key] });
            });

            this.tableExpressionsSource.next(this.tableExpressions);

            console.log("> " + "this.tableExpressions.length : " + this.tableExpressions.length);
        }

        this.isOpening = false;
    }
}
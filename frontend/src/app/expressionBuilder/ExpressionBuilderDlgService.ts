import { DataService } from './../service/data.service';
import { ProjectService } from './../service/project.service';
import { Injectable } from '@angular/core';
import { TableExpression } from '../data/tableexpression';
import { QueryBuilderConfig } from '../querybuilder/module/query-builder.interfaces';
import { BehaviorSubject } from 'rxjs';
import { PropertyItem } from '../data/propertyitem';
import { RuleSet } from '../querybuilder/module/query-builder.interfaces';

@Injectable({
    providedIn: 'root'
  })
export class ExpressionBuilderDlgService {

    public tableNames: string[] = [];

    public config: QueryBuilderConfig = <QueryBuilderConfig>{};
    public query: RuleSet = {condition: "&", rules: []};

    private configSource = new BehaviorSubject(this.config);
    currentConfig = this.configSource.asObservable();
  
    private querySource = new BehaviorSubject(this.query);
    currentQuery = this.querySource.asObservable();

    public display: boolean = false;

    currentTableExpression: TableExpression = null;
    currentPropertyItem: PropertyItem = null;

    public tableExpressions: TableExpression[] = [];
    
    constructor(private dataService: DataService, private ps: ProjectService) {}    

    setCurrentTableExpression(tableExpression: TableExpression) {
        this.currentTableExpression = tableExpression;
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

    async updateQueryBuilderConfig() {

        console.log("this.tableExpressions : " + JSON.stringify(JSON.stringify(this.tableExpressions)));

        this.query = {condition: "&", rules: []};

        this.config = <QueryBuilderConfig> await this.dataService.getFilterOptions(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcess.processID, this.currentTableExpression.tableName).toPromise();
        
        // console.log("config : " + JSON.stringify(this.config));

        if(this.currentTableExpression.expression != null && this.currentTableExpression.expression.trim() != "") {
            // build query object from rExpression
            // instantiate this.query object
            this.query = <RuleSet> await this.dataService.expression2list(this.currentTableExpression.expression).toPromise();
        } 
        // else {
        //     // this.query = <RuleSet>{};
        //     // this.query.rules = [];
        //     this.query = {condition: "&", rules: []};
        // }

        // console.log("query : " + JSON.stringify(this.query));

        this.configSource.next(this.config);
        this.querySource.next(this.query);
    }

    combinedExpression(): string {
        let combinedTable = {};

        this.tableExpressions.forEach(t=>{combinedTable[t.tableName]= t.expression});

        return JSON.stringify(combinedTable);
    }

    async showDialog() {
        console.log("in ExpressionBuilderDlgService.showDialog()");

        this.tableNames = <string[]> await this.dataService.getProcessOutputTableNames(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcess.processID).toPromise();
        console.log("this.tableNames : " + this.tableNames);

        // build array of tableExpressions from rExpression

        console.log("this.currentPropertyItem.value : " + this.currentPropertyItem.value);

        this.tableExpressions = [];
        let o = JSON.parse(this.currentPropertyItem.value);
        let keys = Object.keys(o);
        keys.forEach(key => { this.tableExpressions.push({tableName: key, expression: o[key]}) });

        console.log("this.tableExpressions.length : " +this.tableExpressions.length);

        this.display = true;
    }
}
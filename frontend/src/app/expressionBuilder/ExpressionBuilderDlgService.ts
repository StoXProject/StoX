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

    public config: QueryBuilderConfig;
    public query: RuleSet = <RuleSet>{};

    // private configSource = new BehaviorSubject(this.config);
    // currentConfig = this.configSource.asObservable();
  
    // private querySource = new BehaviorSubject(this.query);
    // currentQuery = this.querySource.asObservable();

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
        this.config = <QueryBuilderConfig> await this.dataService.getFilterOptions(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcess.processID, this.currentTableExpression.tableName).toPromise();
        
        console.log("config : " + this.config);

        // this.configSource.next(this.config);

        if(this.currentTableExpression.expression != null) {
            // build query object from rExpression
            // instantiate this.query object
            this.query = <RuleSet> await this.dataService.expression2list(this.currentTableExpression.expression).toPromise();
        } else {
            this.query = <RuleSet>{};
        }

        console.log("query : " + this.query);

        // this.querySource.next(this.query);
    }

    async showDialog() {
        console.log("in ExpressionBuilderDlgService.showDialog()");

        // console.log("this.ps.selectedProject.projectPath :" + this.ps.selectedProject.projectPath);
        // console.log("this.ps.selectedModel.modelName :" + this.ps.selectedModel.modelName);
        // console.log("this.ps.selectedProcess.processID :" + this.ps.selectedProcess.processID);

        this.tableNames = <string[]> await this.dataService.getProcessOutputTableNames(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.selectedProcess.processID).toPromise();
        console.log("this.tableNames : " + this.tableNames);

        // this.tableExpressions = [];

        // let rExpression = this.currentPropertyItem.value;

        // build array of tableExpressions from rExpression and let ExpressionBuilderDlg get these as data attributes 

        this.display = true;
    }
}
import { DataService } from './../service/data.service';
import { ProjectService } from './../service/project.service';
import { Injectable } from '@angular/core';
import { TableExpression } from '../data/tableexpression';
import { QueryBuilderConfig } from '../querybuilder/module/query-builder.interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
export class ExpressionBuilderDlgService {

    public tableNames: string[] = [];

    public config: QueryBuilderConfig;

    private messageSource = new BehaviorSubject(this.config);
    currentMessage = this.messageSource.asObservable();
  

    constructor(private dataService: DataService, private ps: ProjectService) {}

    public display: boolean = false;

    currentTableExpression: TableExpression = null;

    setCurrentTableExpression(tableExpression: TableExpression) {
        this.currentTableExpression = tableExpression;
    }

    getCurrentTableExpression(): TableExpression {
        return this.currentTableExpression;
    }

    async updateQueryBuilderConfig() {
        let configString =  <string> await this.dataService.getFilterOptions(this.ps.getSelectedProject().projectPath, this.ps.getSelectedModel().modelName, this.ps.selectedProcess.processID, this.currentTableExpression.tableName).toPromise();
        this.config = JSON.parse(configString);
        this.messageSource.next(this.config);
    }

    // private messageSource = new BehaviorSubject('default message');
    // currentMessage = this.messageSource.asObservable();  
  
    // changeMessage(tableExpression: TableExpression) {
    //     this.messageSource.next(tableExpression);
    // }

    async showDialog() {
        console.log("in ExpressionBuilderDlgService.showDialog()");

        // console.log("this.ps.getSelectedProject().projectPath :" + this.ps.getSelectedProject().projectPath);
        // console.log("this.ps.getSelectedModel().modelName :" + this.ps.getSelectedModel().modelName);
        // console.log("this.ps.selectedProcess.processID :" + this.ps.selectedProcess.processID);

        this.tableNames = <string[]> await this.dataService.getProcessOutputTableNames(this.ps.getSelectedProject().projectPath, this.ps.getSelectedModel().modelName, this.ps.selectedProcess.processID).toPromise();
        console.log("this.tableNames : " + this.tableNames);

        this.display = true;
    }
}
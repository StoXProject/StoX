import { DataService } from './../service/data.service';
import { ProjectService } from './../service/project.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class ExpressionBuilderDlgService {

    tableNames: string[] = [];

    constructor(private dataService: DataService, private ps: ProjectService) {}

    public display: boolean = false;
  
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
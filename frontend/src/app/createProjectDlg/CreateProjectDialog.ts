import { Component } from '@angular/core';
import {CreateProjectDialogService} from './create-project-dialog.service';
import { DataService } from '../data/data.service';
import { Template } from '../data/Template';

@Component({
    selector: 'CreateProjectDialog',
    templateUrl: './CreateProjectDialog.html',
    styleUrls: []
  })
export class CreateProjectDialog {
    projectRootPath: string;
    project: string;    
    templates: Template[];
    selectedTemplate: Template;

    constructor(public service: CreateProjectDialogService, private dataService: DataService) {
    }

    ngOnInit() {
        console.log("start ngOnInit");
        this.initData();
        console.log("end ngOnInit");
    }

    async initData() {
        console.log("start initData");
        this.templates = <Template[]> JSON.parse( await this.dataService.getAvailableTemplates().toPromise());
        console.log("templates retrieved: " + this.templates.length);
        this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();
        console.log("project root path retrieved: " + this.projectRootPath);
        this.project = <string>await this.dataService.getProjectPath().toPromise();
        console.log("project path retrieved: " + this.project);
        console.log("end initData");
    }  

    async browse() {
        console.log("browse");
        this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
    }  
    
    async apply() {
        console.log("start apply");
        console.log("project : " + this.project);
        console.log("projectRootPath : " + this.projectRootPath);
        console.log("selectedTemplate : " + this.selectedTemplate);
        console.log("end apply");
        this.service.display = false;
    }    
}

import { Component } from '@angular/core';
import {CreateProjectDialogService} from './create-project-dialog.service';
import { DataService } from '../service/data.service';
import { Template } from '../data/Template';
import { MessageService } from '../message/MessageService';
import { ProjectService } from '../service/project.service';
import { Project } from '../data/project';

@Component({
    selector: 'CreateProjectDialog',
    templateUrl: './CreateProjectDialog.html',
    styleUrls: []
  })
export class CreateProjectDialog {
    projectRootPath: string;
    projectName: string;    
    templates: Template[];
    selectedTemplate: Template;

    constructor(public service: CreateProjectDialogService, private msgService: MessageService, 
        private dataService: DataService, private ps: ProjectService) {
    }

    ngOnInit() {
        //console.log("start ngOnInit");
        this.initData();
        //console.log("end ngOnInit");
    }

    async initData() {
        //console.log("start initData");
        // this.templates = <Template[]> JSON.parse( await this.dataService.getAvailableTemplates().toPromise());
        this.templates = <Template[]> await this.dataService.getAvailableTemplates().toPromise();
        //console.log("templates retrieved: " + this.templates.length);
        this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();
        this.projectRootPath = this.projectRootPath.replace(/\\/g, "/");
        //console.log("project root path retrieved: " + this.projectRootPath);
        // this.project = <string>await this.dataService.getProjectPath().toPromise();
        // console.log("project path retrieved: " + this.project);
        //console.log("end initData");
    }  

    async browse() {
        console.log("browse");
        this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
        this.projectRootPath = this.projectRootPath.replace(/\\/g, "/");

        let jsonString = JSON.stringify(this.projectRootPath);
        let status = <string> await this.dataService.updateProjectRootPath(jsonString).toPromise();
        console.log(status);
    }  
    
    async apply() {
        console.log("start apply");
        
        if(!this.projectName) {            
            this.msgService.setMessage("Project name is empty!");
            this.msgService.showMessage();
            return;
        }
        console.log("project : " + this.projectName);

        if(!this.projectRootPath) {
            this.msgService.setMessage("Project folder is empty!");
            this.msgService.showMessage();            
            return;
        }
        console.log("projectRootPath : " + this.projectRootPath);

        if(!this.selectedTemplate) {          
            this.msgService.setMessage("Template is not selected!");
            this.msgService.showMessage();            
            return;
        }       
        console.log("selectedTemplate : " + this.selectedTemplate ? this.selectedTemplate.name + " - " + this.selectedTemplate.description  : 'none');
        let absolutePath = this.projectRootPath + "/" + this.projectName;
        absolutePath = absolutePath.replace(/\\/g, "/");
        console.log("absolute path : " + absolutePath);
        try {
            this.ps.activateProject(await this.dataService.createProject(absolutePath, this.selectedTemplate.name).toPromise());
        } catch(error) {
            console.log(error);
            var firstLine = error;
            this.msgService.setMessage(firstLine);
            this.msgService.showMessage();            
            return;
        }

        console.log("end apply\n\n");
        this.service.display = false;
    }    
}

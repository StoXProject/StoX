import { Component, OnInit } from '@angular/core';
import { OpenProjectDlgService } from './OpenProjectDlgService';
import { DataService } from '../service/data.service'; 
import { ProjectService } from '../service/project.service'; 
import { MessageService } from '../message/MessageService';
import { Project } from '../data/project';

@Component({
    selector: 'OpenProjectDlg',
    templateUrl: './OpenProjectDlg.html',
    styleUrls: []
})
export class OpenProjectDlg { 

    project: Project;

    projectRootPath: string; 

    constructor(public service: OpenProjectDlgService, 
        private msgService: MessageService,
        private dataService: DataService, private projectService: ProjectService) {       
    }

    async ngOnInit() {  
        this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();
        console.log("project root path retrieved: " + this.projectRootPath);
    }

    async browse() {  
        console.log("browse");
        this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
    }

    async apply() {
        console.log("start apply");

        if(!this.projectRootPath) {
            this.msgService.setMessage("Project folder is empty!");
            this.msgService.showMessage();            
            return;
        }
        console.log("projectRootPath : " + this.projectRootPath);   
        
        this.projectRootPath = this.projectRootPath.replace(/\\/g, "/");

        console.log("converted projectRootPath : " + this.projectRootPath);

        // the following should return an instance of class Project
        this.project = <Project>JSON.parse( await this.dataService.openProject(this.projectRootPath).toPromise());

        console.log("returned projectName - projectPath : " + this.project.projectName + " - " + this.project.projectPath);

        console.log("projects length : " + this.projectService.projects.length);

        if(!this.projectService.hasProject(this.project)) {
            // this.projectService.PROJECTS.push(this.project);
            this.projectService.projects =  [...this.projectService.projects, {projectName:this.project.projectName, projectPath: this.project.projectPath}]; 
        }
        
        console.log("projects length : " + this.projectService.projects.length);

        this.projectService.setSelectedProject(this.project);

        this.service.display = false;
    }
}
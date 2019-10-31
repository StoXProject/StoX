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

    projectPath: string; 

    constructor(public service: OpenProjectDlgService, 
        private msgService: MessageService,
        private dataService: DataService, private ps: ProjectService) {       
    }

    async ngOnInit() {  
        this.projectPath = <string>await this.dataService.getProjectRootPath().toPromise();
        console.log("project root path retrieved: " + this.projectPath);
    }

    async browse() {  
        console.log("browse");
        this.projectPath = await this.dataService.browse(this.projectPath).toPromise();
    }

    async apply() {
        console.log("start apply");

        if(!this.projectPath) {
            this.msgService.setMessage("Project folder is empty!");
            this.msgService.showMessage();            
            return;
        }
        console.log("projectRootPath : " + this.projectPath);   
        
        this.projectPath = this.projectPath.replace(/\\/g, "/");

        console.log("converted projectRootPath : " + this.projectPath);

        // the following should return an instance of class Project
        this.project = <Project>JSON.parse( await this.dataService.openProject(this.projectPath).toPromise());

        console.log("returned projectName - projectPath : " + this.project.projectName + " - " + this.project.projectPath);

        // console.log("projects length : " + this.ps.projects.length);

        if(this.project != null) {

            if(this.ps.getSelectedProject() != null) {
                if (this.ps.getSelectedProject().projectPath.valueOf() == this.project.projectPath.valueOf()) {
                    let projectName = this.ps.getSelectedProject().projectName;
                    this.msgService.setMessage("Project with name " + projectName + " is already open!");
                    this.msgService.showMessage();
                    return;
                }
            }

            // this.projectService.PROJECTS.push(this.project);
            this.ps.projects =  [{projectName:this.project.projectName, projectPath: this.project.projectPath}]; 

            // console.log("projects length : " + this.ps.projects.length);

            this.ps.setSelectedProject(this.project);            
        }
    
        this.service.display = false;
    }
}
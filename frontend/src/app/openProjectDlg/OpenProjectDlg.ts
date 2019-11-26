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

        try {

            let isProject = <boolean>JSON.parse( await this.dataService.isProject(this.projectPath).toPromise());

            if(!isProject) {
                this.msgService.setMessage(this.projectPath + " is not a project!");
                this.msgService.showMessage();
                return;
            }

            var t0 = performance.now();
            // the following should return an instance of class Project
            this.project = <Project>JSON.parse( await this.dataService.openProject(this.projectPath).toPromise());
            var t1 = performance.now();
            console.log("Call to dataService.openProject(...) took " + (t1 - t0) + " milliseconds.");
            console.log("returned projectName - projectPath : " + this.project.projectName + " - " + this.project.projectPath);

            // console.log("projects length : " + this.ps.projects.length);

            if(this.project != null) {

                if(this.ps.getSelectedProject() != null) {
                    if (this.ps.getSelectedProject().projectPath.valueOf() == this.project.projectPath.valueOf()) {
                        let projectName = this.ps.getSelectedProject().projectName;
                        this.msgService.setMessage("Project with name " + projectName + " is already open!");
                        this.msgService.showMessage();
                        return;
                    } else {
                        // close the previous project after saving it if it is edited 
                        var t0 = performance.now();
                        await this.dataService.closeProject(this.ps.getSelectedProject().projectPath, new Boolean(true)).toPromise();
                        var t1 = performance.now();

                        console.log("Call to dataService.closeProject(...) took " + (t1 - t0) + " milliseconds.");
                    }
                }

                // this.projectService.PROJECTS.push(this.project);
                this.ps.projects =  [{projectName:this.project.projectName, projectPath: this.project.projectPath}]; 

                // console.log("projects length : " + this.ps.projects.length);

                this.ps.setSelectedProject(this.project);            
            }

        } catch(error) { 
            console.log(error); 
            var firstLine = error;//.error.split('\n', 1)[0];
            this.msgService.setMessage(firstLine);
            this.msgService.showMessage();            
            return;            
        }

        this.service.display = false;
    }
}
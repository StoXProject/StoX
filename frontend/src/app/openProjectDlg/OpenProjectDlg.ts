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

    projectPath: string;

    constructor(public service: OpenProjectDlgService,
        private msgService: MessageService,
        private dataService: DataService, private ps: ProjectService) {
    }

    async ngOnInit() {
        this.projectPath = <string>await this.dataService.getProjectRootPath().toPromise();
        // console.log("project root path retrieved: " + this.projectPath);
    }

    async browse() {
        console.log("Browse " + this.projectPath);
        this.projectPath = await this.dataService.browse(this.projectPath).toPromise();
        console.log("this.projectPath: " + this.projectPath);
    }

    async apply() {
        console.log("start apply");
        if (!this.projectPath) {
            this.msgService.setMessage("Project folder is empty!");
            this.msgService.showMessage();
            return;
        }
        console.log("projectRootPath : " + this.projectPath);
        this.projectPath = this.projectPath.replace(/\\/g, "/");
        console.log("converted projectRootPath : " + this.projectPath);
        try {
            let isProject: boolean = await this.dataService.isProject(this.projectPath).toPromise();
            if (!isProject) {
                this.msgService.setMessage(this.projectPath + " is not a project!");
                this.msgService.showMessage();
                return;
            }
            // the following should return an instance of class Project
            let project : Project = <Project>await this.dataService.openProject(this.projectPath).toPromise();
            if (project != null) {
                if (this.ps.selectedProject != null) {
                    if (this.ps.selectedProject.projectPath == project.projectPath) {
                        let projectName = this.ps.selectedProject.projectName;
                        this.msgService.setMessage("Project with name " + projectName + " is already open!");
                        this.msgService.showMessage();
                        return;
                    } else {
                        // close the previous project after saving it if it is edited 
                        await this.dataService.closeProject(this.ps.selectedProject.projectPath, new Boolean(true)).toPromise();
                    }
                }
                //this.ps.projects = [project];
                this.ps.projects = [project];
                this.ps.selectedProject = this.ps.projects[0];
            }
        } catch (error) {
            console.log(error);
            var firstLine = error;//.error.split('\n', 1)[0];
            this.msgService.setMessage(firstLine);
            this.msgService.showMessage();
            return;
        }
        this.service.display = false;
    }
}
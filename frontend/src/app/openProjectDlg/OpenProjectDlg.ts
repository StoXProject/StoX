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
            if (this.ps.selectedProject != null) {
                // Check if project is open in GUI
                if (this.ps.selectedProject.projectPath == this.projectPath) {
                    this.msgService.setMessage("Project with name " + this.ps.selectedProject.projectName + " is already open in the GUI!");
                    this.msgService.showMessage();
                    return;
                } /*else {
                    // close the previous project after saving it if it is edited 
                    await this.dataService.closeProject(this.ps.selectedProject.projectPath, new Boolean(true)).toPromise();
                }*/
            }

            // the following should open the project and make it selected in the GUI
            this.ps.openProject(this.projectPath);
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
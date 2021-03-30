import { Component } from '@angular/core';
import { CreateProjectDialogService } from './create-project-dialog.service';
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
    //templates: Template[];
    selectedTemplate: Template;

    constructor(public service: CreateProjectDialogService, private msgService: MessageService,
        private dataService: DataService, private ps: ProjectService) {
    }

    async ngOnInit() {
        this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();
    }

    async initData() {
        //this.templates = <Template[]>await this.dataService.getAvailableTemplates().toPromise();
    }

    async browse() {
        this.initData();
        console.log("browse");
        this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
        this.projectRootPath = this.projectRootPath.replace(/\\/g, "/");
        let status = <string>await this.dataService.updateProjectRootPath(this.projectRootPath).toPromise();
        console.log(status);
    }

    async apply() {
        console.log("start apply");
        if (!this.projectName) {
            this.msgService.setMessage("Project name is empty!");
            this.msgService.showMessage();
            return;
        }
        console.log("project : " + this.projectName);
        if (!this.projectRootPath) {
            this.msgService.setMessage("Project folder is empty!");
            this.msgService.showMessage();
            return;
        }
        console.log("projectRootPath : " + this.projectRootPath);

        /*if (!this.selectedTemplate) {
            this.msgService.setMessage("Template is not selected!");
            this.msgService.showMessage();
            return;
        }
        console.log("selectedTemplate : " + this.selectedTemplate ? this.selectedTemplate.name + " - " + this.selectedTemplate.description : 'none');
        */
        let absolutePath = this.projectRootPath + "/" + this.projectName;
        absolutePath = absolutePath.replace(/\\/g, "/");
        console.log("absolute path : " + absolutePath);
        try {
            this.ps.activateProject(await this.dataService.createProject(absolutePath, /*this.selectedTemplate.name, */this.ps.application).toPromise(), true);
        } catch (error) {
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

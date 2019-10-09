import { Component, OnInit } from '@angular/core';
import { OpenProjectDialogService } from './OpenProjectDialogService';
import { DataService } from '../data/data.service';
import { MessageService } from '../message/MessageService';

@Component({
    selector: 'OpenProjectDialog',
    templateUrl: './OpenProjectDialog.html',
    styleUrls: []
})
export class CreateProjectDialog implements OnInit{

    projectRootPath: string;

    constructor(public service: OpenProjectDialogService, 
        private msgService: MessageService,
        private dataService: DataService) {       
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
        let projectPath = JSON.parse( await this.dataService.openProject(this.projectRootPath).toPromise());

        console.log("returned projectPath : " + projectPath);

    }
}
import { MessageService } from './../message/MessageService';
import { ResetProjectDlgService } from './ResetProjectDlgService';
import { Component, OnInit } from '@angular/core';
import { Project } from './../data/project';

@Component({
    selector: 'ResetProjectDlg',
    templateUrl: './ResetProjectDlg.html',
    styleUrls: ['./ResetProjectDlg.css']
})
export class ResetProjectDlg implements OnInit { 

    constructor(public service: ResetProjectDlgService, private msgService: MessageService) {
    }

    async ngOnInit( ) {
    }    

    async no() {
        let project: Project = await this.service.ds.resetProject(this.service.ps.selectedProject.projectPath, false).toPromise();
        this.msgService.setMessage("Project is reset!");
        this.msgService.showMessage();  
        this.service.display = false;
    }

    async yes() {
        let project: Project = await this.service.ds.resetProject(this.service.ps.selectedProject.projectPath, true).toPromise();
        this.msgService.setMessage("Project is reset!");
        this.msgService.showMessage(); 
        this.service.display = false;
    }    
}
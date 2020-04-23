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

    async ngOnInit() {
    }

    async apply(continueWithoutSave: boolean) {
        try {
            //let project: Project = await this.service.ds.resetProject(this.service.ps.selectedProject.projectPath, save, true).toPromise();
            if(this.service.ps.selectedProject != null && this.service.ps.selectedProject.projectPath != null && continueWithoutSave) {
                this.service.ps.openProject(this.service.ps.selectedProject.projectPath, true, true);               
            }
        } catch (error) {
            this.msgService.setMessage(error);
            this.msgService.showMessage();
        } finally {
            this.service.display = false;
        }
    }
}
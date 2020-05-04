import { MessageService } from './../message/MessageService';
import { CloseProjectDlgService } from './CloseProjectDlgService';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'CloseProjectDlg',
    templateUrl: './CloseProjectDlg.html',
    styleUrls: ['./CloseProjectDlg.css']
})
export class CloseProjectDlg implements OnInit { 
    constructor(public service: CloseProjectDlgService, private msgService: MessageService) {
    }

    async ngOnInit() {
    }

    async apply(continueWithoutSave: boolean) {
        try {
            if(this.service.ps.selectedProject != null && this.service.ps.selectedProject.projectPath != null && continueWithoutSave) {
                this.service.ps.closeProject(this.service.ps.selectedProject.projectPath, false);               
            }
        } catch (error) {
            this.msgService.setMessage(error);
            this.msgService.showMessage();
        } finally {
            this.service.display = false;
        }
    }    
}
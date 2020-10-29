import { Project } from './../data/project';
import { ProjectService } from './../service/project.service';
import { DataService } from './../service/data.service';
import { Injectable } from '@angular/core';
import { MessageService } from './../message/MessageService';

@Injectable({
    providedIn: 'root'
})
export class ResetProjectDlgService { 
    public display: boolean = false;

    constructor(public ds: DataService, public ps: ProjectService) {
    }

    async checkSaved() {

        if(this.ps.selectedProject.saved) {
            if(this.ps.selectedProject != null && this.ps.selectedProject.projectPath != null) {
                this.ps.openProject(this.ps.selectedProject.projectPath, false, true, true);
            }
            return;
        }

        this.display = true;
    }
}
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

    constructor(public ds: DataService, public ps: ProjectService, private msgService: MessageService) {
    }

    async checkSaved() {

        if(this.ps.selectedProject.saved) {
            let project: Project = await this.ds.resetProject(this.ps.selectedProject.projectPath, false, false).toPromise(); 
            if(project != null && project.projectPath != null) {
                this.ps.openProject(project.projectPath);
            }
            return;
        }

        this.display = true;
    }
}
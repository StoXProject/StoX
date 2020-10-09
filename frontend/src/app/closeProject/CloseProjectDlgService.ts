import { Injectable } from '@angular/core';
import { ProjectService } from './../service/project.service';

@Injectable({
    providedIn: 'root'
})
export class CloseProjectDlgService { 
    public display: boolean = false;

    constructor(public ps: ProjectService) {
    }

    async checkSaved() {

        console.log("CloseProjectDlgService.checkSaved()");

        if (this.ps.selectedProject != null && this.ps.selectedProject.saved && this.ps.selectedProject.projectPath != null) {
            await this.ps.closeProject(this.ps.selectedProject.projectPath, false);
            return;
        }
        this.display = true;
    }
}
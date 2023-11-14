import { Component } from '@angular/core';

import { MessageService } from '../message/MessageService';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { OpenProjectAsTemplateDlgService } from './OpenProjectAsTemplateDlgService';

@Component({
  selector: 'OpenProjectAsTemplateDlg',
  templateUrl: './OpenProjectAsTemplateDlg.html',
  styleUrls: [],
})
export class OpenProjectAsTemplateDlg {

  projectNewPath: string;
  projectName: string;
    
  constructor(
    public service: OpenProjectAsTemplateDlgService,
    private msgService: MessageService,
    private dataService: DataService,
    private ps: ProjectService
  ) {}

  async ngOnInit() {

    this.projectNewPath = <string>await this.dataService.getProjectRootPath().toPromise();
  }

  async browse() {
    console.log('> ' + 'Browse ' + this.service.projectPath);
    if (this.service.projectPath == null || this.service.projectPath.trim() == '') {
      if (this.ps.selectedProject != null && this.ps.selectedProject.projectPath != null) {
        this.service.projectPath = this.ps.selectedProject.projectPath.substring(0, this.ps.selectedProject.projectPath.lastIndexOf('/'));
      }
    }

    this.service.projectPath = <string>await this.dataService.browse(this.service.projectPath).toPromise();
    console.log('> ' + 'this.projectPath: ' + this.service.projectPath);
  }

  async browseNew() {
    console.log('> ' + 'browse');
    this.service.projectNewPath = await this.dataService.browse(this.service.projectNewPath).toPromise();
    this.service.projectNewPath = this.service.projectNewPath.replace(/\\/g, '/');
    const status = <string>await this.dataService.updateProjectRootPath(this.service.projectNewPath).toPromise();

    console.log('> ' + status);
  }

  async apply() {

    let message: string = '';
    let hasError: boolean = false;

    console.log('> ' + 'start apply');
    if (!this.service.projectPath) {
        hasError = true;
        message += 'Project folder is empty!\n';

      return;
    }

    if(!this.projectNewPath) {
        hasError = true;
        message += 'New project folder is empty!\n';
    }

    if(!this.projectName) {

        message += 'Projectname is empty!\n';
        hasError = true;
    }

    if(hasError){
        this.msgService.setMessage(message);
        this.msgService.showMessage();
    }

    console.log('> ' + 'projectPath : ' + this.service.projectPath);
    console.log('> ' + 'projectNewPath : ' + this.projectNewPath);
    this.service.projectPath = this.service.projectPath.replace(/\\/g, '/');
    console.log('> ' + 'converted projectPath : ' + this.service.projectPath);
    try {
      const isProject: boolean = await this.dataService.isProject(this.service.projectPath).toPromise();

      if (!isProject) {
        this.msgService.setMessage(this.service.projectPath + ' is not a project, or R connection not set!');
        this.msgService.showMessage();

        return;
      }

      this.service.isOpening = true;
      
      await this.ps.openProjectAsTemplate(this.service.projectPath, this.projectNewPath, true, true, true);
      this.service.isOpening = false;
    } catch (error) {
      console.log('> ' + error);
      const firstLine = error;

      this.msgService.setMessage(firstLine);
      this.msgService.showMessage();

      return;
    }

    this.service.display = false;
  }
}

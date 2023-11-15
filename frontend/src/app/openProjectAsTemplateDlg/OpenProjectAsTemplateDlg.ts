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
  constructor(
    public service: OpenProjectAsTemplateDlgService,
    private msgService: MessageService,
    private dataService: DataService,
    private ps: ProjectService
  ) {}

  async browseExistingProject() {
    const { projectPath } = this.service;
    const { selectedProject } = this.ps;
    if (projectPath == null || projectPath.trim() == '') {
      if (selectedProject != null && selectedProject.projectPath != null) {
        this.service.projectPath = selectedProject.projectPath.substring(0, selectedProject.projectPath.lastIndexOf('/'));
      }
    }

    this.service.projectPath = <string>await this.dataService.browse(this.service.projectPath).toPromise();
    console.log('> ' + 'this.projectPath: ' + this.service.projectPath);
  }

  async browseTargetDirectory() {
    const tmpProjectNewPath = await this.dataService.browse(this.service.projectNewPath).toPromise();
    this.service.projectNewPath = tmpProjectNewPath.replace(/\\/g, '/');
    const status = <string>await this.dataService.updateProjectRootPath(this.service.projectNewPath).toPromise();

    console.log('> ' + status);
  }

  async apply() {
    const { projectPath, projectNewPath, projectName } = this.service;
    let message: string = '';
    let hasError: boolean = false;

    console.log('> ' + 'start apply OpenProjectAsTemplate ');

    if (!projectPath) {
      hasError = true;
      message += 'Project folder is empty!\n';
    }

    if (!projectNewPath) {
      hasError = true;
      message += 'New project folder is empty!\n';
    }

    if (!projectName) {
      hasError = true;
      message += 'Projectname is empty!\n';
    }

    if (hasError) {
      this.setAndShowMessage(message);

      return;
    }

    this.service.projectPath = projectPath.replace(/\\/g, '/');

    const absolutePath = projectNewPath + '/' + projectName;
    console.log('> ' + 'absolute path : ' + absolutePath);

    try {
      const isProject: boolean = await this.dataService.isProject(this.service.projectPath).toPromise();

      if (!isProject) {
        this.setAndShowMessage(this.service.projectPath + ' is not a project or R connection is not set!');

        return;
      }

      this.service.isOpening = true;

      await this.ps.openProjectAsTemplate(this.service.projectPath, absolutePath, true, true, true);

      this.service.isOpening = false;
    } catch (error) {
      console.log('> ' + error);
      const firstLine = error;

      this.setAndShowMessage(firstLine);

      return;
    }

    this.service.display = false;
  }

  setAndShowMessage(message: string) {
    this.msgService.setMessage(message);
    this.msgService.showMessage();
  }
}

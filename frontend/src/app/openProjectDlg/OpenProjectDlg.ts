import { Component } from '@angular/core';

import { MessageService } from '../message/MessageService';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { OpenProjectDlgService } from './OpenProjectDlgService';

@Component({
  selector: 'OpenProjectDlg',
  templateUrl: './OpenProjectDlg.html',
  styleUrls: [],
})
export class OpenProjectDlg {
  constructor(
    public service: OpenProjectDlgService,
    private msgService: MessageService,
    private dataService: DataService,
    private ps: ProjectService
  ) {}

  async ngOnInit() {}

  async browse() {
    const { selectedProject } = this.ps;
    const { projectPath } = this.service;

    console.log('> ' + 'Browse ' + projectPath);
    if (projectPath == null || projectPath.trim() == '') {
      if (selectedProject?.projectPath != null) {
        this.service.projectPath = selectedProject.projectPath.substring(0, selectedProject.projectPath.lastIndexOf('/'));
      }
    }

    this.service.isOpening = true;
    this.service.projectPath = <string>await this.dataService.browse(this.service.projectPath).toPromise();
    this.service.isOpening = false;
    console.log('> ' + 'this.projectPath: ' + this.service.projectPath);
  }

  async apply() {
    console.log('> ' + 'start apply');
    if (!this.service.projectPath) {
      this.msgService.setMessage('Project folder is empty!');
      this.msgService.showMessage();

      return;
    }

    console.log('> ' + 'projectPath : ' + this.service.projectPath);
    this.service.projectPath = this.service.projectPath.replace(/\\/g, '/');
    console.log('> ' + 'converted projectPath : ' + this.service.projectPath);
    try {
      const isProject: boolean = await this.dataService.isProject(this.service.projectPath).toPromise();

      if (!isProject) {
        this.msgService.setMessage(this.service.projectPath + ' is not a project, or R connection not set!');
        this.msgService.showMessage();

        return;
      }

      // the following should open the project and make it selected in the GUI
      this.service.isOpening = true;
      await this.ps.openProject(this.service.projectPath, false, true, true);
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

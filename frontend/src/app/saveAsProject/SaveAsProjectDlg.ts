import { Component, OnInit } from '@angular/core';

import { MessageService } from '../message/MessageService';
import { DataService } from '../service/data.service';
import { Project } from './../data/project';
import { ProjectService } from './../service/project.service';
import { SaveAsProjectDlgService } from './SaveAsProjectDlgService';

@Component({
  selector: 'SaveAsProjectDlg',
  templateUrl: './SaveAsProjectDlg.html',
  styleUrls: ['./SaveAsProjectDlg.css'],
})
export class SaveAsProjectDlg implements OnInit {
  projectRootPath: string;
  projectName: string;

  constructor(
    public service: SaveAsProjectDlgService,
    private dataService: DataService,
    private msgService: MessageService,
    private ps: ProjectService
  ) {}

  async ngOnInit() {
    this.projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();

    this.projectRootPath = this.projectRootPath.replace(/\\/g, '/');
  }

  async browse() {
    console.log('> ' + 'browse');
    this.projectRootPath = await this.dataService.browse(this.projectRootPath).toPromise();
    this.projectRootPath = this.projectRootPath.replace(/\\/g, '/');
  }

  async apply() {
    if (!this.projectName) {
      this.msgService.setMessage('Project name is empty!');
      this.msgService.showMessage();

      return;
    }

    console.log('> ' + 'project : ' + this.projectName);

    if (!this.projectRootPath) {
      this.msgService.setMessage('Project folder is empty!');
      this.msgService.showMessage();

      return;
    }

    console.log('> ' + 'projectRootPath : ' + this.projectRootPath);

    let exists = await this.dataService.fileExists(this.projectRootPath).toPromise();

    if (exists != 'true') {
      this.msgService.setMessage('Project root folder does not exist!');
      this.msgService.showMessage();

      return;
    }

    const wholePath = this.projectRootPath + '/' + this.projectName;

    // check if projectRootPath + projectName exists
    exists = await this.dataService.fileExists(wholePath).toPromise();

    // create projectRootPath + projectName if it doesn't exist and show error otherwise
    if (exists == 'true') {
      this.msgService.setMessage(this.projectName + ' exists before!');
      this.msgService.showMessage();

      return;
    }

    try {
      const project: Project = await this.dataService.saveAsProject(this.ps.selectedProject.projectPath, wholePath, this.ps.application).toPromise();

      await this.ps.openProject(wholePath, false, true, false);
      // third parameter in saveAsProject
      // make a shift to this project (make it as current project??)
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

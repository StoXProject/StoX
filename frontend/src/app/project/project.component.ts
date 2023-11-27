import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

import { Project } from '../data/project';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit {
  @Input() cm: ContextMenu;

  constructor(
    private ps: ProjectService,
    private ds: DataService
  ) {}

  ngOnInit() {}

  async prepCm() {
    // comment: add list of outputtablenames to runModel result.
    const m: MenuItem[] = [];

    if (this.ps.selectedProject != null) {
      m.push({
        label: 'Show in folder',
        icon: 'rib absa foldericon',
        command: async event => {
          await this.ds.showinfolder(this.ps.selectedProject.projectPath).toPromise();
        },
      });
    }

    this.cm.model = m;
  }

  async openCm(event: MouseEvent, cm: ContextMenu, project: Project) {
    // TODO: Incorpoate dynamic ng-action-outlet with material. or support scrolling primeng menus
    // https://stackblitz.com/edit/ng-action-outlet-demo?file=src/app/app.component.ts
    this.ps.selectedProject = project;
    //console.log("> " + "selecting process " + process.processID + " in contextmenu handler");
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm();
    cm.show(event);

    return false;
  }
}

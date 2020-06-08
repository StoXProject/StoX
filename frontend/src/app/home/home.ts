import { ResetProjectDlgService } from './../resetProject/ResetProjectDlgService';
import { CloseProjectDlgService } from './../closeProject/CloseProjectDlgService';
import { ViewChild, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
// import { Observable, of } from 'rxjs';
// import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { RConnectionDlgService } from '../dlg/RConnectionDlgService';
import { CreateProjectDialogService } from '../createProjectDlg/create-project-dialog.service';
import { OpenProjectDlgService } from '../openProjectDlg/OpenProjectDlgService';
// import { ExpressionBuilderDlgService } from '../expressionBuilder/ExpressionBuilderDlgService';
// import { DefinedColumnsService } from '../dlg/definedColumns/DefinedColumnsService';
// import { QueryBuilderDlgService } from '../querybuilder/dlg/QueryBuilderDlgService';
import { MenuItem } from 'primeng/api';
import { DataService } from '../service/data.service';
import { SaveAsProjectDlgService } from '../saveAsProject/SaveAsProjectDlgService';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'homeComponent',
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})

export class HomeComponent /*implements OnInit, OnDestroy*/ {
  @ViewChild("bottomTabGroup") bottomTabGroup: MatTabGroup;
  title = 'StoX';
  stoxVersion: string;
  constructor(private rConnectionDlgService: RConnectionDlgService,
    private createProjectDialogService: CreateProjectDialogService,
    private openProjectDlgService: OpenProjectDlgService,
    public ps: ProjectService,
    private saveProjectAs: SaveAsProjectDlgService, private resetProject: ResetProjectDlgService,
    private closeProject: CloseProjectDlgService,
    private ds: DataService
  ) {
    ps.outputTableActivator.subscribe({ next: (idx) => { this.bottomTabGroup.selectedIndex = 1; } })
    // document.addEventListener('touchstart', function(){}, {passive: false});
  }
  items?: MenuItem[];
  /*async ngOnDestroy() {
    await this.ds.resetProject(this.ps.selectedProject.projectPath, false, false).toPromise();
  }*/
  @HostListener('window:beforeunload', ['$event'])
  async unloadHandler(event: any) {
    //event.preventDefault();
    console.log("window:beforeunload - reset project with save")
    //event.returnValue = true;
    // TODO: get a dialog when unloading page
    await this.ds.closeProject(this.ps.selectedProject.projectPath, true).toPromise();
  }

  getPropertiesHdr() {
    return "Properties" + (this.ps.selectedProcess != null ? (" - " + this.ps.selectedProcess.processName) : '');
  }

  async ngOnInit() {
    console.log("Home init")
    this.stoxVersion = '2.9.13';
    this.items = [{
      label: 'R connection...', command: e => this.rConnectionDlgService.showDialog()
    }];
    //if (this.ps.rAvailable) {
    this.items.push(...[
      {
        label: 'Create project...', command: e => this.createProjectDialogService.showDialog()
      },
      {
        label: 'Open project...', command: e => this.openProjectDlgService.showDialog()
      },
      {
        label: 'Close project', command: async e => {
          // this.ps.closeProject(this.ps.selectedProject.projectPath);
          this.closeProject.checkSaved();
        }
      },
      {
        label: 'Save project as...', command: e => {
          this.saveProjectAs.show();
        }
      },
      {
        label: 'Reset project', command: e => {
          this.resetProject.checkSaved();
        }
      }
    ]);
    //   }
  }
}

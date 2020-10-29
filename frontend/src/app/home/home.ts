import { ResetProjectDlgService } from './../resetProject/ResetProjectDlgService';
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
    private saveProjectAsService: SaveAsProjectDlgService,
    private resetProjectService: ResetProjectDlgService,
    private ds: DataService
  ) {
    ps.outputTableActivator.subscribe({ next: (idx) => { this.bottomTabGroup.selectedIndex = 1; } })
    // document.addEventListener('touchstart', function(){}, {passive: false});
  }
  items?: MenuItem[];
  m_isDesktop: boolean = true;
  /*async ngOnDestroy() {
    await this.ds.resetProject(this.ps.selectedProject.projectPath, false, false).toPromise();
  }*/
  @HostListener('window:beforeunload', ['$event'])
  async unloadHandler(event: any) {
  }

  getPropertiesHdr() {
    return "Properties" + (this.ps.selectedProcess != null ? (" - " + this.ps.selectedProcess.processName) : '');
  }

  async ngOnInit() {
    console.log("Home init")
    this.stoxVersion = '2.9.16';
    this.items = [/*{
      label: 'R connection...', command: e => this.rConnectionDlgService.showDialog()
    }*/];
    //if (this.ps.rAvailable) {
    this.items.push(...[
     
    ]);
    this.m_isDesktop = "true" == await this.ds.isdesktop().toPromise();
    console.log("isdesktop=" + typeof (this.m_isDesktop))
    //   }
  }

  createNewProject() {
    this.createProjectDialogService.showDialog();
  }

  openProject() {
    this.openProjectDlgService.showDialog();
  }
  closeProject() {
    this.ps.activateProject(null, true); 
  }
  save() {
    this.ps.save();
  }
  saveProjectAs() {
    this.saveProjectAsService.show()
  }
  resetProject() {
    this.resetProjectService.checkSaved();
  }
  rConnection() {
    this.rConnectionDlgService.showDialog();
  }

  isProjectSelected() : boolean {
    return this.ps.selectedProject != null;
  }
  isSaved(): boolean {
    return !this.isProjectSelected() || this.ps.selectedProject.saved
  }
  async stoxHome() {
    await this.ds.stoxHome().toPromise();
  }
  async toggleDevTools() {
    await this.ds.toggleDevTools().toPromise();
  }
  isDesktop(): boolean {
    return this.m_isDesktop;
  }
  async exit() {
    await this.ds.exit().toPromise();
  }

}

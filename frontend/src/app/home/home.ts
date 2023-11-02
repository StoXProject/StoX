import { Component, HostListener, ViewChild } from '@angular/core';
import { ResetProjectDlgService } from './../resetProject/ResetProjectDlgService';
// import { Observable, of } from 'rxjs';
// import { DataService } from '../service/data.service';
import { CreateProjectDialogService } from '../createProjectDlg/create-project-dialog.service';
import { InstallRPackagesDlgService } from '../dlg/InstallRPackages/InstallRPackagesDlgService';
import { RConnectionDlgService } from '../dlg/RConnectionDlgService';
import { OpenProjectDlgService } from '../openProjectDlg/OpenProjectDlgService';
import { ProjectService } from '../service/project.service';
// import { ExpressionBuilderDlgService } from '../expressionBuilder/ExpressionBuilderDlgService';
// import { DefinedColumnsService } from '../dlg/definedColumns/DefinedColumnsService';
// import { QueryBuilderDlgService } from '../querybuilder/dlg/QueryBuilderDlgService';
import { ChangeDetectorRef } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { SaveAsProjectDlgService } from '../saveAsProject/SaveAsProjectDlgService';
import { DataService } from '../service/data.service';
import { PackageVersion } from './../data/PackageVersion';

@Component({
  selector: 'homeComponent',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent /*implements OnInit, OnDestroy*/ {
  @ViewChild('bottomTabGroup') bottomTabGroup: MatTabGroup;
  @ViewChild('cm') cm: ContextMenu;

  title = 'StoX';
  stoxVersion: string;
  constructor(
    private rConnectionDlgService: RConnectionDlgService,
    private createProjectDialogService: CreateProjectDialogService,
    private openProjectDlgService: OpenProjectDlgService,
    public ps: ProjectService,
    private saveProjectAsService: SaveAsProjectDlgService,
    private resetProjectService: ResetProjectDlgService,
    private installRPackagesDlgService: InstallRPackagesDlgService,
    private ds: DataService,
    private cd: ChangeDetectorRef
  ) {
    ps.bottomViewActivator.subscribe({
      next: idx => {
        this.bottomTabGroup.selectedIndex = idx;
      },
    });
    // document.addEventListener('touchstart', function(){}, {passive: false});
  }
  items?: MenuItem[];
  m_isDesktop: boolean = true;
  /*async ngOnDestroy() {
    await this.ds.resetProject(this.ps.selectedProject.projectPath, false, false).toPromise();
  }*/
  @HostListener('window:beforeunload', ['$event'])
  async unloadHandler(event: any) {}

  getPropertiesHdr() {
    return 'Properties' + (this.ps.selectedProcess != null ? ' - ' + this.ps.selectedProcess.processName : '');
  }

  async ngOnInit() {
    console.log('> ' + 'Home init');
    this.stoxVersion = await this.ds.getStoxVersion().toPromise() /*'2.9.17'*/;
    this.items = [
      /*{
      label: 'R connection...', command: e => this.rConnectionDlgService.showDialog()
    }*/
    ];
    //if (this.ps.rAvailable) {
    //this.items.push(...[]);
    this.m_isDesktop = 'true' == (await this.ds.isdesktop().toPromise());
    console.log('> ' + 'isdesktop=' + typeof this.m_isDesktop);
    //   }
  }

  ctxMenuShow(e) {
    this.cd.detectChanges(); // Trigger change detection manually
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
    this.saveProjectAsService.show();
  }
  resetProject() {
    this.resetProjectService.checkSaved();
  }
  rConnection() {
    this.rConnectionDlgService.showDialog();
  }

  isProjectSelected(): boolean {
    return this.ps.selectedProject != null;
  }
  isSaved(): boolean {
    return !this.isProjectSelected() || this.ps.selectedProject.saved;
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

  async installRstoxFramework() {
    this.installRPackagesDlgService.showDialog();
  }

  getStoXVersionColor() {
    return this.ps.isOfficialStoXVersion ? 'black' : 'rgb(255,30,78)';
  }

  getPackageColorMain(packages: PackageVersion[]) {
    let maxStatus = 0;

    if (packages) {
      maxStatus = 0;
      // Loop through the packages:
      for (let i = 0; i < packages.length; i++) {
        // If the package does not exist, return status 3:
        if (packages[i] == null) {
          maxStatus = 3;
        }
        // Otherwise get the status as maxStatus if larger:
        else if (packages[i].status > maxStatus) {
          maxStatus = packages[i].status;
        }
      }
    } else {
      maxStatus = 3;
    }

    return maxStatus > 1 ? 'grey' : maxStatus == 1 ? 'rgb(255,30,78)' : 'black';
  }

  getPackageColor(pkg: PackageVersion) {
    return pkg == null || pkg.status > 1 ? 'grey' : pkg.status == 1 ? 'rgb(255,30,78)' : 'black';
  }

  getMainPackageDescr() {
    return ' / ' + this.getPackageDescr(this.ps.rstoxPackages != null ? this.ps.rstoxPackages[0] : null, false);
  }
  getPackageDescr(pkg: PackageVersion, withVersion: boolean = true) {
    //console.log("> " + "getPackageDescr:" + pkg)
    return pkg == null ? 'Loading...' : pkg.packageName + (withVersion ? ' ' + pkg.version : '');
  }

  myFunction() {
    var popup = document.getElementById('myPopup');
    popup.classList.toggle('show');
  }
  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event) {
    var popup = document.getElementById('myPopup');
    if (popup.classList.contains('show') && !event.target.classList.contains('popup')) {
      popup.classList.remove('show');
      event.preventDefault();
    }
  }
}

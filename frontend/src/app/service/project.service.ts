import { Injectable, SecurityContext } from '@angular/core';
import { catchError, map, tap, mapTo } from 'rxjs/operators';
import { Subject, Subscription, Observable } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { ActiveProcess } from '../data/runresult';
import { Model } from '../data/model';
import { PropertyCategory } from '../data/propertycategory';
import { DataService } from './data.service';
import { ProcessProperties } from '../data/ProcessProperties';
import { ProcessOutput } from '../data/processoutput';
import { OutputTable } from '../data/outputtable';
import { SavedResult, ActiveProcessResult, ProcessTableResult } from '../data/runresult'
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { MatDialog } from '@angular/material/dialog';
import { MessageDlgComponent } from '../dlg/messageDlg/messageDlg.component';
import { PackageVersion } from '../data/PackageVersion';
import { HelpCache } from '../data/HelpCache';
import { SubjectAction } from '../data/subjectaction';

//import { RunService } from '../service/run.service';
//import { DomSanitizer } from '@angular/platform-browser';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private m_Application: string;
  private m_iaMode: string;
  private m_iaModeSubject = new Subject<string>();
  private m_processSubject = new Subject<SubjectAction>();

  private m_projects: Project[] = [];
  private m_selectedProject: Project = null;
  //private m_isSelectedProjectSaved = true;
  outputTables: OutputTable[] = [];
  public outputTableActivator: Subject<number> = new Subject<number>();

  models: Model[];

  private m_selectedModel: Model = null;
  private m_processes: Process[] = [];
  private m_selectedProcessId: string;
  private m_processProperties: ProcessProperties = {};
  helpCache: HelpCache = new HelpCache();
  //activeModelName: string = null; // the last run model
  private m_activeProcess: ActiveProcess = {}; // the last run-ok process
  runFailedProcessId: string = null; // the last run-failed process
  runningProcessId: string = null; // current running process
  m_isResetting: boolean = false; // current reset flag.
  rstoxPackages: PackageVersion[];
  rstoxFrameworkAvailable: boolean = false;

  userlog: string[] = [];

  constructor(private dataService: DataService/*, public rs: RunService*/, private dialog: MatDialog) {
    this.initData();

  }

  get application(): string {
    return this.m_Application;
  }



  get processes(): Process[] {
    return this.m_processes;
  }

  set processes(processes: Process[]) {
    this.m_processes = processes;
    if (this.selectedProcessId != null) {
      // Ensure that selectedProcessid is among processes' id or cleared
      this.selectedProcess = processes == null ? null :
        processes.find(p => p.processID == this.selectedProcessId);
    }
  }

  get iaModeSubject(): Subject<string> {
    return this.m_iaModeSubject;
  }

  get processSubject(): Subject<SubjectAction> {
    return this.m_processSubject;
  }

  get processProperties(): ProcessProperties {
    return this.m_processProperties;
  }

  set processProperties(processProperties: ProcessProperties) {
    this.m_processProperties = processProperties;
  }

  set iaMode(iaMode: string) {
    this.m_iaMode = iaMode;
    this.m_iaModeSubject.next(iaMode); // propagate event
  }

  get iaMode(): string {
    return this.m_iaMode;
  }

  set projects(projects: Project[]) {
    this.m_projects = projects;
    this.selectedProject = projects == null || projects.length == 0 ? null : this.projects[0];
  }

  get projects(): Project[] {
    return this.m_projects;
  }


  /*get isSelectedProjectSaved(): boolean {
    return this.m_isSelectedProjectSaved;
  }

  set isSelectedProjectSaved(value: boolean) {
    this.m_isSelectedProjectSaved = value;
  }*/

  hasProject(project: Project): boolean {
    var projectPath = project.projectPath;
    for (let i = 0; i < this.projects.length; i++) {
      var currentProjectPath = this.projects[i].projectPath;
      if (currentProjectPath == projectPath) {
        return true;
      }
    }
    return false;
  }
  async save() {
    this.selectedProject.saved = (await this.dataService.saveProject(this.selectedProject.projectPath, this.application).toPromise()).saved;
    await this.dataService.updateActiveProjectSavedStatus(this.selectedProject.saved).toPromise();
    // TODO: get save status on return
    //this.isSelectedProjectSaved = await this.dataService.isSaved(this.selectedProject.projectPath).toPromise();
  }

  onSelectedProjectChanged(event) {
    // if (event.value.projectName) {
    // }

    console.log("selected project changed : " + this.selectedProject.projectName);

    // the following is implemented in setSelctedProject
    // set selected model to 'Baseline'
    // get processes in 'Baseline' for selected project and show it on GUI
    // this.setSelectedModel("Baseline"); 
  }

  set selectedModel(model: Model) {
    this.m_selectedModel = model;
    // To do in future: caching process list per model. For now update process list on each model click
    this.onModelSelected();
  }

  async onModelSelected() {
    //this.initializeProperties();
    if (this.selectedProject != null && this.selectedModel != null) {
      this.processes = await this.dataService.getProcessTable(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();
      if (this.processes == null) {
        this.processes = [];
      }
      /*if (this.selectedProcess == null && this.processes.length > 0) {
      this.selectedProcess = this.processes[0];
    }*/
    } else {
      this.processes = [];
    }
  }

  async removeSelectedProcess() {
    //this.initializeProperties();
    if (this.selectedProject != null && this.selectedProcessId != null) {
      this.processSubject.next(SubjectAction.of("remove", this.selectedProcessId));
      this.handleAPI(await this.dataService.removeProcess(this.selectedProject.projectPath, this.selectedModel.modelName, this.selectedProcessId).toPromise());
    }
  }

  async addProcess() {
    // this.initializeProperties();
    if (this.selectedProject != null) {
      this.handleAPI(await this.dataService.addProcess(this.selectedProject.projectPath, this.selectedModel.modelName, null).toPromise());
    }
  }

  get selectedModel(): Model {
    return this.m_selectedModel;
  }

  public get selectedProject(): Project {
    return this.m_selectedProject;
  }

  public set selectedProject(project: Project) {
    if (project !== this.selectedProject) {
      this.m_selectedProject = project;
      this.OnProjectSelected(); // call async method
    }
  }

  public async OnProjectSelected() {
    this.selectedModel = this.selectedProject == null ? null : this.models[0]; // This will trigger update process list.

    // Update active process id.
    if (this.selectedProject != null) {
      let activeProcess: ActiveProcess = await this.dataService.getActiveProcess(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();
      let idx = activeProcess.processID == null ? null : this.getProcessIdxByProcessesAndId(this.processes, activeProcess.processID);
      if (idx != null) {
        for (let i: number = 0; i <= idx; i++) {
          let p: Process = this.processes[i];
          this.activeProcessId = this.processes[i].processID;
          if (p.canShowInMap && p.showInMap || p.hasProcessData) {
            let iaMode: string = await this.dataService.getInteractiveMode(this.selectedProject.projectPath, this.selectedModel.modelName, this.activeProcessId).toPromise();
            this.iaMode = iaMode;
          }
        }
      } else {
        this.activeProcessId = null;
        this.iaMode = 'reset';
      }
    }
  }
  public get selectedProcessId(): string {
    return this.m_selectedProcessId;
  }
  public set selectedProcessId(processId: string) {
    if (processId != this.m_selectedProcessId) {
      this.m_selectedProcessId = processId;
      this.onSelectedProcessChanged();
    }
  }
  public get selectedProcess(): Process {
    return this.getProcessById(this.selectedProcessId);
  }
  public set selectedProcess(process: Process) {
    this.selectedProcessId = process != null ? process.processID : null;
  }

  public get helpContent(): string {
    return this.helpCache.current();
  }

  // Set accessor for help content
  public set helpContent(content: string) {
    this.helpCache.add(content);
  }

  onSelectedProcessChanged() {
    this.updateProcessProperties();
    this.updateHelp();
  }

  async updateProcessProperties() {
    if (this.selectedProject != null && this.selectedProcess != null && this.selectedModel != null) {
      this.processProperties = await this.dataService.getProcessPropertySheet(this.selectedProject.projectPath, this.selectedModel.modelName,
        this.selectedProcessId).toPromise();
    } else {
      this.processProperties = {};
    }
  }

  async updateHelp() {
    if (this.selectedProject != null && this.selectedProcess != null && this.selectedModel != null) {
      console.log('Update help');
      this.helpContent = await this.dataService.getFunctionHelpAsHtml(this.selectedProject.projectPath,
        this.selectedModel.modelName, this.selectedProcessId).toPromise();
    } else {
      this.helpContent = '';
    }
  }

  /* async initializeProperties() {
     this.processProperties = null;     
   }*/

  getProjects(): Project[] {
    return this.projects;
  }

  getModels(): Model[] {
    return this.models;
  }

  setModels(models: Model[]) {
    this.models = models;
  }

  async initData() {
    await this.checkRstoxFrameworkAvailability();
    this.m_Application = "StoX " + await this.dataService.getStoxVersion().toPromise();
    let projectPath = <string>await this.dataService.readActiveProject().toPromise(); // make projectpath a setting.

    console.log("Read projectpath:" + projectPath) // let activeProject: Project = <Project>JSON.parse(projectPath);
    // Read models and set selected to the first model
    if (projectPath.length > 0 && this.rstoxFrameworkAvailable) {
      //this.selectedModel = this.models[0]; 
      this.openProject(projectPath, false, true, false);
    }
  }

  async checkRstoxFrameworkAvailability() {
    this.rstoxPackages = JSON.parse(await this.dataService.getRstoxPackageVersions().toPromise());
    console.log("Rstoxpackages: " + this.rstoxPackages)
    this.rstoxFrameworkAvailable = this.rstoxPackages[0].status < 2;// (await this.dataService.rstoxFrameworkAvailable().toPromise()) == "true";
    if (this.rstoxFrameworkAvailable) {
      this.setModels(await this.dataService.getModelInfo().toPromise());
    } else {
      this.setModels(null);
      this.activateProject(null, false);
    }
  }

  async openProject(projectPath: string, doThrow: boolean, force: boolean, askSave: boolean) {
    // the following should open the project and make it selected in the GUI
    this.activateProject(await this.dataService.openProject(projectPath, doThrow, force).toPromise(), askSave);
  }

  /*Activate project in gui - at the moment only one project is listed*/
  async activateProject(project: Project, askSave: boolean) {
    this.dataService.log = [];   // triggered by project activation
    if (project != null && project.projectPath == 'NA') {
      project = null; // openProject returns NA when project is renamed or moved.
    }
    if (this.selectedProject != null) {
      let save: boolean = false;
      if (askSave) {
        if (!this.selectedProject.saved) {
          // #263 requires a save before close message
          let res = await MessageDlgComponent.showDlg(this.dialog, 'Save project', 'Save project before closing?');
          switch (res) {
            case 'yes':
              save = true;
              break;
            case 'no':
              save = false;
              break;
            case '':
              return; // interrupt activation
          }
        }
      }
      if (project == null || project.projectPath != this.selectedProject.projectPath) {
        await this.dataService.closeProject(this.selectedProject.projectPath, save, this.application).toPromise()
      }
    }
    await this.dataService.updateActiveProject(project != null ? project.projectPath : '').toPromise();
    await this.dataService.updateActiveProjectSavedStatus(project != null ? project.saved : true).toPromise();

    this.projects = project != null && Object.keys(project).length > 0 ? [project] : [];

    //this.processes = null;       // triggered by selected model
    //this.selectedProcessId = null; // -> triggered by selection in gui or setProcesses
    //this.processProperties = null; // triggered by selected processid
    this.activeProcessId = null; // triggered by user run service, setprocesspropertyvalue or project selection
    this.iaMode = 'reset'; // triggered by active process id
    this.runFailedProcessId = null; // triggered by run service or active process id
    this.runningProcessId = null; // current running process
    this.m_isResetting = false; // current reset flag.    
    this.outputTables = []; // clear output tables
  }


  /*
  Returns:
    true: undefined, null, "", [], {}
    false: true, false, 1, 0, -1, "foo", [1, 2, 3], { foo: 1 }
  */
  isEmpty(value): boolean {
    return (
      // null or undefined
      (value == null) ||

      // has length and it's zero
      (value.hasOwnProperty('length') && value.length === 0) ||

      // is an Object and has no keys
      (value.constructor === Object && Object.keys(value).length === 0)
    )
  }
  public getProcessIdx(process: Process): number {
    return this.processes != null ? this.processes.findIndex(p => p === process) : null;
  }
  public getProcessIdxById(id: string): number {
    return this.processes != null ? this.processes.findIndex(p => p.processID === id) : null;
  }
  public getProcessIdxByProcessesAndId(processes: Process[], id: string): number {
    return this.processes != null && id != null ? processes.findIndex(p => p.processID === id) : null;
  }
  public getActiveProcess(): Process {
    return this.getProcessById(this.activeProcessId);
  }
  public getRunFailedProcess(): Process {
    return this.getProcessById(this.runFailedProcessId);
  }
  public getRunningProcess(): Process {
    return this.getProcessById(this.runningProcessId);
  }

  public get isResetting(): boolean {
    return this.m_isResetting;
  }
  public set isResetting(value: boolean) {
    this.m_isResetting = value;
  }

  public getActiveProcessIdx(): number {
    return this.getProcessIdxByProcessesAndId(this.processes, this.activeProcessId);
  }
  public getSelectedProcessIdx(): number {
    return this.processes != null && this.selectedProcess != null ? this.getProcessIdxByProcessesAndId(this.processes, this.selectedProcessId) : null;
  }
  public getActiveProcessIdxByProcesses(processes: Process[]): number {
    return this.getProcessIdxByProcessesAndId(processes, this.activeProcessId);
  }

  /* Determine if a process is run, used to draw blue badges in the template on the process list */
  /*isRun(process: Process) {
    return this.getProcessIdx(process) <= this.getActiveProcessIdx();
  }*/

  getProcessById(processId: string): Process {
    return this.processes != null ? this.processes.find(p => p.processID === processId) : null;
  }

  /*getProcess(idx: number): Process {
    var p: Process = this.processes[idx];
    if (p == null) {
      throw "getProcess(idx) called with idx=" + idx;
    }
    return this.processes[idx];
  }*/
  get activeProcessId(): string {
    let res = this.m_activeProcess != null ? this.m_activeProcess.processID : null;
    if (res === "NA") { // NA maps to null in gui
      res = null;
    }
    return res;
  }

  set activeProcessId(processId: string) {
    if (this.m_activeProcess != null) {
      this.m_activeProcess.processID = processId;
    }
  }

  get activeProcess() {
    return this.m_activeProcess;
  }

  set activeProcess(activeProcess: ActiveProcess) {
    this.m_activeProcess = activeProcess;
    if (activeProcess != null) {
      console.log("ActiveProcessId: " + activeProcess.processID);
      this.m_processSubject.next(SubjectAction.of("activate", activeProcess.processID)); // propagate activation of process id 
    }
  }

  handleAPI<T>(res: any): T {
    if (res != null && this.selectedProject != null) {
      if (res.processTable !== undefined) {
        this.processes = res.processTable;
      }
      if (res.saved !== undefined) {
        if (this.selectedProject.saved !== res.saved) {
          this.selectedProject.saved = res.saved;
          this.dataService.updateActiveProjectSavedStatus(this.selectedProject.saved).toPromise();
        }
      }
      if (res.activeProcess !== undefined) {
        this.activeProcess = res.activeProcess;
      }
      if (res.propertySheet !== undefined) {
        this.processProperties.propertySheet = res.propertySheet;
      }
      if (res.updateHelp !== undefined) {
        this.updateHelp();
      }
    }
    return res;
  }
  /**
   * A process is dirty if the process is active and the active process is dirty.
   * @param p 
   */
  isProcessDirty(p: Process) {
    if (p != null && this.activeProcess != null) {
      return p.processID == this.activeProcess.processID && this.activeProcess.processDirty;
    }
  }
}

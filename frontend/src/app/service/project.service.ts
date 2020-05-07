import { Injectable, SecurityContext } from '@angular/core';
import { catchError, map, tap, mapTo } from 'rxjs/operators';
import { Subject, Subscription, Observable } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { PropertyCategory } from '../data/propertycategory';
import { DataService } from './data.service';
import { ProcessProperties, ActiveProcess } from '../data/ProcessProperties';
import { ProcessOutput } from '../data/processoutput';
import { SavedResult, ActiveProcessResult, ProcessTableResult } from '../data/runresult'
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
//import { RunService } from '../service/run.service';
//import { DomSanitizer } from '@angular/platform-browser';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private m_iaMode: string;
  private m_iaModeSubject = new Subject<string>();

  private m_projects: Project[] = [];
  private m_selectedProject: Project = null;
  //private m_isSelectedProjectSaved = true;
  outputTables: { table: string, output: ProcessOutput }[] = [];

  models: Model[];

  private m_selectedModel: Model = null;
  private m_processes: Process[] = [];
  private m_selectedProcessId: string;
  private m_processProperties: ProcessProperties = {};
  private m_helpContent: string = "";
  //activeModelName: string = null; // the last run model
  activeProcessId: string = null; // the last run-ok process
  runFailedProcessId: string = null; // the last run-failed process
  runningProcessId: string = null; // current running process
  m_isResetting: boolean = false; // current reset flag.

  userlog: string[] = [];

  constructor(private dataService: DataService/*, public rs: RunService*/) {
    this.initData();
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
    this.selectedProject.saved = (await this.dataService.saveProject(this.selectedProject.projectPath).toPromise()).saved;
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
    if (this.selectedProject != null) {
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
    if (project != this.selectedProject) {
      this.m_selectedProject = project;
      this.OnProjectSelected(); // call async method
    }
  }

  public async OnProjectSelected() {
    this.selectedModel = this.selectedProject == null ? null : this.models[0]; // This will trigger update process list.

    // To do: make this property the project path instead of project object.
    let jsonString = JSON.stringify(this.selectedProject == null ? "" : this.selectedProject.projectPath);
    console.log("StoX GUI: updating ActiveProject with string  " + jsonString)
    let status = await this.dataService.updateActiveProject(jsonString).toPromise();
    console.log("status " + status);

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
    return this.m_helpContent;
  }

  // Set accessor for help content
  public set helpContent(content: string) {
    this.m_helpContent = content;
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
     this.m_helpContent = ""; 
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

  getProcessesByModelAndProject(model: String, project: string): Process[] {
    if (this.selectedProject != null) {
      switch (this.selectedProject.projectName) {
        // case 'Gytetokt 2004':
        //   switch (model) {
        //     case 'baseline': return [{ processName: 'ReadBioticXML', model: 'baseline', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  /*, breakingui:true*/ }, { processName: 'ReadAcousticXML', model: 'baseline', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  }];
        //     case 'statistics': return [{ processName: 'runBootstrap', model: 'statistics', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  }, { processName: 'saveProjectData', model: 'statistics', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  }];
        //   }
        //   break;
        // case 'Tobis 2006':
        //   switch (model) {
        //     case 'baseline': return [{ processName: 'ReadBioticXML', model: 'baseline', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  }, { processName: 'DefineStratum', model: 'baseline', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  }];
        //     case 'statistics': return [{ processName: 'runBootstrap', model: 'statistics', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  }, { processName: 'saveProjectData', model: 'statistics', geoJson: '', hasProcessData: true, canShowInMap: true, doShowInMap: true  }];
        //   }
      }
    }
    return [];
  }

  async initData() {

    let projectPath = <string>await this.dataService.readActiveProject().toPromise(); // make projectpath a setting.

    console.log("Read projectpath:" + projectPath) // let activeProject: Project = <Project>JSON.parse(projectPath);
    // Read models and set selected to the first model
    this.models = <Model[]>await this.dataService.getModelInfo().toPromise();
    this.setModels(this.models);
    if (projectPath.length > 0 && this.models != null && this.models.length > 0) {
      //this.selectedModel = this.models[0]; 
      this.openProject(projectPath, false, false);
    }
  }

  async openProject(projectPath: string, doThrow: boolean, force: boolean) {
    // the following should open the project and make it selected in the GUI
    this.activateProject(await this.dataService.openProject(projectPath, doThrow, force).toPromise());
  }

  /*Activate project in gui - at the moment only one project is listed*/
  activateProject(project: Project) {
    this.dataService.log = [];   // triggered by project activation
    this.projects = project != null && Object.keys(project).length > 0 ? [project] : [];
    //this.processes = null;       // triggered by selected model
    //this.selectedProcessId = null; // -> triggered by selection in gui or setProcesses
    //this.processProperties = null; // triggered by selected processid
    this.activeProcessId = null; // triggered by user run service, setprocesspropertyvalue or project selection
    this.iaMode = 'reset'; // triggered by active process id
    this.runFailedProcessId = null; // triggered by run service or active process id
    this.runningProcessId = null; // current running process
    this.m_isResetting = false; // current reset flag.      
  }

  async closeProject(projectPath: string, save: Boolean) {
    // the following should open the project and make it selected in the GUI
    await this.dataService.closeProject(projectPath, save).toPromise();
    this.activateProject(null);
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
    return this.processes != null ? processes.findIndex(p => p.processID === id) : null;
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

  handleAPI<T>(res: any): T {
    if (res != null && this.selectedProject != null) {
      if (res.saved !== undefined) {
        this.selectedProject.saved = res.saved;
        if (res.activeProcess !== undefined) {
          this.activeProcessId = res.activeProcess.processID;
          if (res.processTable !== undefined) {
            this.processes = res.processTable;
          }
        }
      }
    }
    return res;
  }

}

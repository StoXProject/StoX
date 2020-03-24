import { Injectable, SecurityContext } from '@angular/core';
import { catchError, map, tap, mapTo } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { PropertyCategory } from '../data/propertycategory';
import { DataService } from './data.service';
import { ProcessProperties, ActiveProcess } from '../data/ProcessProperties';
import { ProcessOutput } from '../data/processoutput';
import { ProcessResult } from '../data/runresult'
//import { RunService } from '../service/run.service';
//import { DomSanitizer } from '@angular/platform-browser';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private m_iaMode: string;
  private m_iaModeSubject = new Subject<string>();

  projects: Project[] = [];
  private m_selectedProject: Project = null;
  //private m_isSelectedProjectSaved = true;
  outputTables: { table: string, output: ProcessOutput }[] = [];

  models: Model[];

  private m_selectedModel: Model = null;

  public processes: Process[];
  private m_selectedProcessId: string;
  //activeModelName: string = null; // the last run model
  activeProcessId: string = null; // the last run-ok process
  runFailedProcessId: string = null; // the last run-failed process
  runningProcessId: string = null; // current running process
  m_isResetting: boolean = false; // current reset flag.

  propertyCategories: PropertyCategory[] = [];
  private m_helpContent: string = "";

  processProperties: ProcessProperties = null;
  userlog: string[] = [];

  constructor(private dataService: DataService/*, public rs: RunService*/) {
    this.initData();
  }

  get iaModeSubject(): Subject<string> {
    return this.m_iaModeSubject;
  }

  set iaMode(iaMode: string) {
    this.m_iaMode = iaMode;
    this.m_iaModeSubject.next(iaMode); // propagate event
    console.log("IAMode changed to " + iaMode);
  }
  get iaMode(): string {
    return this.m_iaMode;
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
    this.updateProcessList();
  }

  async updateProcessList() {
    this.initializeProperties();
    if (this.selectedProject != null) {
      this.processes = await this.dataService.getProcessTable(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();
      if (this.processes == null) {
        this.processes = [];
      }
      if (this.selectedProcess == null && this.processes.length > 0) {
        this.selectedProcess = this.processes[0];
      }
    }
  }

  async removeSelectedProcess() {
    this.initializeProperties();
    if (this.selectedProject != null) {
      let pr : ProcessResult = await this.dataService.removeProcess(this.selectedProject.projectPath, this.selectedModel.modelName, this.selectedProcessId).toPromise();
      this.processes = pr.processTable;
      this.selectedProject.saved = pr.saved;
      if (this.selectedProcess == null && this.processes.length > 0) {
        this.selectedProcess = this.processes[0];
      } 
    }
  } 

  async addProcess() {
    this.initializeProperties();
    if (this.selectedProject != null) {
      let pr : ProcessResult = await this.dataService.addProcess(this.selectedProject.projectPath, this.selectedModel.modelName, null).toPromise();
      this.processes = pr.processTable;
      this.selectedProject.saved = pr.saved;
      if (this.selectedProcess == null && this.processes.length > 0) {
        this.selectedProcess = this.processes[0];
      }
    }
  }

  get selectedModel(): Model {
    return this.m_selectedModel;
  }

  public get selectedProject(): Project {
    return this.m_selectedProject;
  }

  public set selectedProject(project: Project) {
    this.setSelectedProject(project); // call async method
  }

  public async setSelectedProject(project: Project) {
    this.m_selectedProject = project;
    this.selectedModel = this.models[0]; // This will trigger update process list.

    // To do: make this property the project path instead of project object.
    let jsonString = JSON.stringify(project);
    console.log("StoX GUI: updating ActiveProject with string  " + jsonString)
    let status = await this.dataService.updateActiveProject(jsonString).toPromise();
    console.log("status " + status);

    // Update active process id.
    let activeProcess: ActiveProcess = await this.dataService.getActiveProcess(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();
    let idx = this.getProcessIdxByProcessesAndId(this.processes, activeProcess.processID);
    if (idx != null) {
      for (let i: number = 0; i <= idx; i++) {
        let p: Process = this.processes[i];
        this.activeProcessId = this.processes[i].processID;
        if (p.canShowInMap && p.showInMap || p.hasProcessData) {
          let iaMode: string = await this.dataService.getInteractiveMode(this.selectedProject.projectPath, this.selectedModel.modelName, this.activeProcessId).toPromise();
          this.iaMode = iaMode;
        }
      }
    }
    //console.log("Backend active process id: " + activeProcessId);
    // Loop from first process up to current process and read interactive processes.

  }
  public get selectedProcessId(): string {
    return this.m_selectedProcessId;
  }
  public set selectedProcessId(processId: string) {
    this.m_selectedProcessId = processId;
    this.onSelectedProcessChanged();
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

  //processPropertiesSubscription: Subscription = null;
  //functionHelpAsHtmlSubscription: Subscription = null;

  async onSelectedProcessChanged() {

    //this.initializeProperties();


    if (this.selectedProject != null &&
      this.selectedProcess != null &&
      this.selectedModel != null) {
      // propertyCategories: PropertyCategory[];
      // var t0 = performance.now();
      this.processProperties = await this.dataService.getProcessPropertySheet(this.selectedProject.projectPath, this.selectedModel.modelName,
        this.selectedProcessId).toPromise();
      if (this.processProperties != null) {
        this.propertyCategories = this.processProperties.propertySheet;
      }
      this.updateHelp();
      /*if (this.processPropertiesSubscription != null) {
        this.processPropertiesSubscription.unsubscribe();
      }
      this.processPropertiesSubscription = this.dataService.getProcessProperties(this.selectedProject.projectPath, this.selectedModel.modelName,
        this.selectedProcessID).subscribe((prop: ProcessProperties) => {
          this.processProperties = prop;
          if (this.processProperties != null) {
            this.propertyCategories = this.processProperties.propertySheet;
          }
        });*/

      /*if (this.functionHelpAsHtmlSubscription != null) {
        this.functionHelpAsHtmlSubscription.unsubscribe();
      }
      this.functionHelpAsHtmlSubscription = this.dataService.getFunctionHelpAsHtml(this.selectedProject.projectPath,
        this.selectedModel.modelName, this.selectedProcessID).subscribe((response: any) => {
          this.helpContent = response;
        });*/

      // console.log("this")
      /*if (this.processProperties != null) {
          this.propertyCategories = this.processProperties.propertySheet;
        }*/
      // var t1 = performance.now();
      // console.log("Call to dataService.getProcessProperties(...) took " + (t1 - t0) + " milliseconds.");
      // console.log("this.propertyCategories.length : " + this.propertyCategories.length);
      // this.propertyCategories.forEach(pc => pc.properties.forEach(p => {
      //   // autounboxing is applied to avoid r strings to become javascript array.
      //   p.possibleValues = typeof (p.possibleValues) == "string" ? [p.possibleValues] : p.possibleValues;
      // }));

    }
  }

  async updateHelp() {
    this.helpContent = await this.dataService.getFunctionHelpAsHtml(this.selectedProject.projectPath,
      this.selectedModel.modelName, this.selectedProcessId).toPromise();
  }

  async initializeProperties() {
    this.processProperties = null;
    this.propertyCategories = [];
    this.m_helpContent = ""; // this.sanitizer.bypassSecurityTrustHtml("<html><body><a nohref onclick='HelpComponent.myClickHandler();return false;'>Click me</a></body></html>");
    // this.m_helpContent = "<html><body><a href='#' click='myClickHandler($event)'>Click me</a></body></html>";
    // this.m_helpContent = this.sanitizer.bypassSecurityTrustHtml("");
  }

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

    let jsonString = <string>await this.dataService.readActiveProject().toPromise(); // make projectpath a setting.
    let activeProject: Project = <Project>JSON.parse(jsonString);
    // Read models and set selected to the first model
    this.models = <Model[]>await this.dataService.getModelInfo().toPromise();
    this.setModels(this.models);
    if (this.models != null && this.models.length > 0) {
      //this.selectedModel = this.models[0]; 
      this.openProject(activeProject.projectPath);
    }
  }

  async openProject(projectPath: string) {
    // the following should open the project and make it selected in the GUI
    let project: Project = await this.dataService.openProject(projectPath).toPromise();
    if (project != null) {
      this.projects = [project];
      this.selectedProject = this.projects[0];
    }
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


}

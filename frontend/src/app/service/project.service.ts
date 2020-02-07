import { Injectable, SecurityContext } from '@angular/core';
import { Subject } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { PropertyCategory } from '../data/propertycategory';
import { DataService } from './data.service';
import { ProcessProperties } from '../data/ProcessProperties';
import { ProcessOutput } from '../data/processoutput';
//import { DomSanitizer } from '@angular/platform-browser';
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  projects: Project[] = [];
  private m_selectedProject: Project = null;
  outputTables: { table: string, output: ProcessOutput }[] = [];

  models: Model[];

  private m_selectedModel: Model = null;

  processes: Process[];
  private m_selectedProcess: Process = null; // the selected process by user
  activeModelName: string = null; // the last run model
  activeProcessId: string = null; // the last run-ok process
  runFailedProcessId: string = null; // the last run-failed process
  runningProcessId: string = null; // current running process

  propertyCategories: PropertyCategory[] = [];
  private m_helpContent: string = "";

  processProperties: ProcessProperties = null;
  userlog: string[] = [];
  constructor(private dataService: DataService /*, public sanitizer: DomSanitizer*/) {
    this.initData();
  }



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
    if (this.models == null) {
      console.log("Error. models not set");
      return;
    }
    this.m_selectedModel = model;
    this.initializeProperties();
    this.updateProcessList();
  }
  async updateProcessList() {
    if (this.selectedProject != null) {
      this.processes = <Process[]>await this.dataService.getProcessesTable(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();
      if (this.processes.length > 0) {
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
    this.selectedModel = this.models[0];//("baseline");
    let jsonString = JSON.stringify(project);
    console.log("updating ActiveProject with string  " + jsonString)
    let status = await this.dataService.updateActiveProject(jsonString).toPromise();
    console.log("status " + status);
  }

  public get selectedProcess(): Process {
    return this.m_selectedProcess;
  }
  public set selectedProcess(process: Process) {
    console.log("setSelectedProcess");
    this.m_selectedProcess = process;
    this.onSelectedProcessChanged();
  }

  public get helpContent(): string {
    return this.m_helpContent;
  }

  // Set accessor for help content
  public set helpContent(content: string) {
    this.m_helpContent = content;
  }

  async onSelectedProcessChanged() {

    this.initializeProperties();

    if (this.selectedProject != null &&
      this.selectedProcess != null &&
      this.selectedModel != null) {
      // propertyCategories: PropertyCategory[];
      // var t0 = performance.now();
      this.processProperties = <ProcessProperties>await this.dataService.getProcessProperties(this.selectedProject.projectPath, this.selectedModel.modelName, this.selectedProcess.processID).toPromise();
      // var t1 = performance.now();
      // console.log("Call to dataService.getProcessProperties(...) took " + (t1 - t0) + " milliseconds.");
      // console.log("this.propertyCategories.length : " + this.propertyCategories.length);
      // this.propertyCategories.forEach(pc => pc.properties.forEach(p => {
      //   // autounboxing is applied to avoid r strings to become javascript array.
      //   p.possibleValues = typeof (p.possibleValues) == "string" ? [p.possibleValues] : p.possibleValues;
      // }));

      if (this.processProperties != null) {
        this.helpContent = this.processProperties.help;
        this.propertyCategories = this.processProperties.propertySheet;
      }

      // this.helpContent = <string> await this.dataService.getFunctionHelpAsHtml("DefineStrata").toPromise();
      // // this.helpContent = await this.dataService.getHelp("help", "html").toPromise();
      // console.log("this.helpContent : " + this.helpContent);
    }
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

    let jsonString = <string>await this.dataService.readActiveProject().toPromise();
    let activeProject: Project = <Project>JSON.parse(jsonString);
    // Read models and set selected to the first model
    this.models = <Model[]>await this.dataService.getModelInfo().toPromise();
    this.setModels(this.models);
    this.selectedModel = this.models[0];

    if (!this.isEmpty(activeProject)) {
      this.projects = [{ projectName: activeProject.projectName, projectPath: activeProject.projectPath }];
      //  console.log("active project : " + activeProject.projectName);
      this.selectedProject = activeProject;
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
    return this.processes.findIndex(p => p === process);
  }
  public getProcessIdxById(id: string): number {
    return this.processes.findIndex(p => p.processID === id);
  }
  public getProcessIdxByProcessesAndId(processes: Process[], id: string): number {
    return processes.findIndex(p => p.processID === id);
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
  public getActiveProcessIdx(): number {
    return this.getProcessIdxByProcessesAndId(this.processes, this.activeProcessId);
  }
  public getSelectedProcessIdx(): number {
    return this.selectedProcess != null ? this.getProcessIdxByProcessesAndId(this.processes, this.selectedProcess.processID) : null;
  }
  public getActiveProcessIdxByProcesses(processes: Process[]): number {
    return this.getProcessIdxByProcessesAndId(processes, this.activeProcessId);
  }

  isRun(process: Process) {
    return this.getProcessIdx(process) <= this.getActiveProcessIdx();
  }

  getProcessById(processId: string): Process {
    return this.processes.find(p => p.processID === processId);
  }

  /*getProcess(idx: number): Process {
    var p: Process = this.processes[idx];
    if (p == null) {
      throw "getProcess(idx) called with idx=" + idx;
    }
    return this.processes[idx];
  }*/


}

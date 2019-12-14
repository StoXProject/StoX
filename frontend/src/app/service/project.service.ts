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
  selectedProject: Project = null;
  outputTables: { table: string, output: ProcessOutput }[] = [];

  models: Model[];
  
  selectedModel: Model = null;

  processes: Process[];
  private m_selectedProcess: Process = null; // the selected process by user
  activeModelName: string = null; // the last run model
  activeProcessId: string = null; // the last run-ok process
  runFailedProcessId: string = null; // the last run-failed process
  runningProcessId: string = null; // current running process

  propertyCategories: PropertyCategory[] = [];
  private m_helpContent: string = "";
  private m_helpContentSubject = new Subject<string>();

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

  async setSelectedModel(modelName: string) {
    if (this.models == null) {
      return;
    }
    for (let i = 0; i < this.models.length; i++) {
      if (this.models[i].modelName == modelName) {
        this.selectedModel = this.models[i];
        break;
      }
    }

    // if(this.selectedModel) {
    //   console.log("selected model : " + this.selectedModel.modelName);
    // }

    this.initializeProperties();

    if (this.selectedProject != null) {
      //var t0 = performance.now();
      // set project path and model name as parameter here
      // this.processes = <Process[]>JSON.parse(await this.dataService.getProcessesInModel(this.selectedProject.projectPath, modelName).toPromise());
      this.processes = <Process[]>await this.dataService.getProcessesInModel(this.selectedProject.projectPath, modelName).toPromise();
      if (this.processes.length > 0) {
        this.selectedProcess = this.processes[0];
      }
      //var t1 = performance.now();

      //console.log("Call to dataService.getProcessesInModel(...) took " + (t1 - t0) + " milliseconds.");

      // if(this.processes.length > 0) {
      //   this.setSelectedProcess(this.processes[0]);
      // }

      //console.log("nr of processes : " + this.processes.length);
    }
  }

  getSelectedModel() {
    return this.selectedModel;
  }

  getSelectedProject(): Project {
    return this.selectedProject;
  }

  async setSelectedProject(project: Project) {
    this.selectedProject = project;
    this.setSelectedModel("Baseline");

    // console.log("selected project changed 2 : " + this.selectedProject.projectName);

    let jsonString = JSON.stringify(project);
    let status = <string>await this.dataService.updateActiveProject(jsonString).toPromise();
    //console.log(status);
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
    if(content != null) {

      var matches = content.match(/href=\"\.\.\/\.\.\/[a-z]+[0-9]*[a-z]*\/html\/[a-z]+[0-9]*[a-z]*\.html\"/ig);
      
      console.log(matches);

      if(matches != null) {
        
        for (let i = 0; i < matches.length; i++) {
          
          var firstSplits = matches[i].split("/");
          var parameter1 = firstSplits[2];
          var lastInSplits = firstSplits[4];
          var secondSplits = lastInSplits.split(".");
          var parameter2 = secondSplits[0];

          console.log("current match : " + matches[i]);
          console.log("firstSplits : " + firstSplits);          
          console.log("parameter1 : " + parameter1);
          console.log("lastInSplits : " + lastInSplits);          
          console.log("parameter2 : " + parameter2);

          // construct a string using parameter1 and parameter2
          // replace matches[i] in content with constructed string

        }
      }

      this.m_helpContent = content;
      // Propagate help content through subject.
      this.m_helpContentSubject.next(this.m_helpContent);
    }
  }

  public get helpContentSubject(): Subject<string> {
    return this.m_helpContentSubject;
  }



  async onSelectedProcessChanged() {

    this.initializeProperties();

    if (this.getSelectedProject() != null &&
      this.selectedProcess != null &&
      this.getSelectedModel() != null) {
      // propertyCategories: PropertyCategory[];
      // var t0 = performance.now();
      this.processProperties = <ProcessProperties>await this.dataService.getProcessProperties(this.getSelectedProject().projectPath, this.getSelectedModel().modelName, this.selectedProcess.processID).toPromise();
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

    //console.log(" initData() - class ProjectService: ");

    // this.projects = [
    //   { projectName: 'Gytetokt 2004', projectPath: '.' },
    //   { projectName: 'Tobis 2006', projectPath: '.' },
    //   { projectName: 'Tobis 2007', projectPath: '.' },
    //   { projectName: 'Tobis 2008', projectPath: '.' },
    //   { projectName: 'Tobis 2009', projectPath: '.' },
    //   { projectName: 'Tobis 2010', projectPath: '.' },
    //   { projectName: 'Tobis 2011', projectPath: '.' },
    //   { projectName: 'Tobis 2012', projectPath: '.' },
    //   { projectName: 'Tobis 2013', projectPath: '.' },
    //   { projectName: 'Tobis 2014', projectPath: '.' },
    //   { projectName: 'Tobis 2015', projectPath: '.' },
    //   { projectName: 'Tobis 2016', projectPath: '.' },
    //   { projectName: 'Tobis 2017', projectPath: '.' },
    //   { projectName: 'Tobis 2018', projectPath: '.' },
    //   { projectName: 'Tobis 2019', projectPath: '.' },
    //   { projectName: 'Tobis 2020', projectPath: '.' },
    //   { projectName: 'Tobis 2021', projectPath: '.' }
    // ];

    let jsonString = <string>await this.dataService.readActiveProject().toPromise();
    let activeProject: Project = <Project>JSON.parse(jsonString);

    if (!this.isEmpty(activeProject)) {
      this.projects = [{ projectName: activeProject.projectName, projectPath: activeProject.projectPath }];
      //  console.log("active project : " + activeProject.projectName);
      this.setSelectedProject(activeProject);
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

import { Injectable } from '@angular/core';
//import { Observable, of } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { PropertyCategory } from '../data/propertycategory';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  projects: Project[] = [];
  selectedProject: Project = null;

  models: Model[];
  selectedModel: Model = null;

  processes: Process[];
  selectedProcess: Process = null; // the selected process by user
  activeProcess: Process = null; // the last run-ok process
  runFailedProcess: Process = null; // the last run-failed process
  runningProcess: Process = null; // current running process

  propertyCategories: PropertyCategory[] = [];
  userlog: string[] = [];
  constructor(private dataService: DataService) {
    this.initData();
    // this.setSelectedProject(this.getProjects()[0]);
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

    console.log("selected project changed 1 : " + this.selectedProject.projectName);

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

    this.propertyCategories = [];

    if (this.selectedProject != null) {
      var t0 = performance.now();
      // set project path and model name as parameter here
      this.processes = <Process[]>JSON.parse(await this.dataService.getProcessesInModel(this.selectedProject.projectPath, modelName).toPromise());
      var t1 = performance.now();

      console.log("Call to dataService.getProcessesInModel(...) took " + (t1 - t0) + " milliseconds.");

      // if(this.processes.length > 0) {
      //   this.setSelectedProcess(this.processes[0]);
      // }

      console.log("nr of processes : " + this.processes.length);
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
    console.log(status);
  }

  getSelectedProcess(): Process {
    return this.selectedProcess;
  }

  async setSelectedProcess(process: Process) {
    this.selectedProcess = process;

    if (this.getSelectedProject() != null &&
      this.getSelectedProcess() != null &&
      this.getSelectedModel() != null) {
      // propertyCategories: PropertyCategory[];
      var t0 = performance.now();
      this.propertyCategories = <PropertyCategory[]>JSON.parse(await this.dataService.getProcessProperties(this.getSelectedProject().projectPath, this.getSelectedModel().modelName, this.getSelectedProcess().processID).toPromise());
      var t1 = performance.now();
      console.log("Call to dataService.getProcessProperties(...) took " + (t1 - t0) + " milliseconds.");
      // console.log("this.propertyCategories.length : " + this.propertyCategories.length);
      this.propertyCategories.forEach(pc => pc.properties.forEach(p => {
        // auto_unbox 1elm-array-fix. (1-elm array is autounboxed like r strings to javascript string)
        // autounboxing is applied to avoid r strings to become javascript array.
        p.possibleValues = typeof (p.possibleValues) == "string" ? [p.possibleValues] : p.possibleValues;
      }));
    }
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

    console.log(" initData() - class ProjectService: ");

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
      console.log("active project : " + activeProject.projectName);
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
  public getActiveProcessIdx(): number {
    return this.getProcessIdx(this.activeProcess);
  }

  isRun(process: Process) {
    return this.getProcessIdx(process) <= this.getActiveProcessIdx();
  }

  getProcessById(processId: string): Process {
    return this.processes.find(p => p.processID === processId);
  }

  getProcess(idx: number): Process {
    var p: Process = this.processes[idx];
    if (p == null) {
      throw "getProcess(idx) called with idx=" + idx;
    }
    return this.processes[idx];
  }


}

import { Injectable } from '@angular/core';
//import { Observable, of } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  projects: Project[];
  selectedProject: Project = null; 

  models: Model[];
  selectedModel: Model = null;

  processes: Process[];
  selectedProcess: Process = null; // the selected process by user
  activeProcessId: string = null; // the last run process id


  constructor(private dataService: DataService) {
    console.log(" constructor() - class ProjectService: ");
    this.initData();
    this.setSelectedProject(this.getProjects()[0]);
  }
  getProcess(processId: string): Process {
    return this.processes.find(p => p.processID === processId);
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

    if (this.selectedProject) {
      // set project path and model name as parameter here
      //this.PROCESSES_IN_MODEL = <Process[]>JSON.parse(await this.dataService.getTestProcesses().toPromise());
      this.processes = <Process[]>JSON.parse(await this.dataService.getProcessesInModel(this.selectedProject.projectPath, modelName).toPromise());
      console.log("nr of processes : " + this.processes.length);
    }
  }

  getSelectedProject(): Project {
    return this.selectedProject;
  }

  setSelectedProject(project: Project) {
    this.selectedProject = project;
    this.setSelectedModel("Baseline");
    // console.log("selected project name : " + this.selectedProject.projectName);
  }

  getSelectedProcess(): Process {
    return this.selectedProcess;
  }

  setSelectedProcess(process: Process) {
    this.selectedProcess = process;
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

  // /**
  //  * get processes
  //  * @param model 
  //  */
  // getProcesses(model: String): Process[] {
  //   // if (this.selectedProcesses == null) {
  //   //   console.log("test3")
  //   //   this.selectedProcesses = this.getProcessesByModelAndProject(model, this.selectedProject.projectName);
  //   // }
  //   // return this.selectedProcesses;
  //   return this.PROCESSES_IN_MODEL;
  // }

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
  /*  getObservableProjects(): Observable<Project[]> {
    return of(this.getProjects());
  }*/

  async initData() {

    console.log(" initData() - class ProjectService: ");

    this.projects = [
      { projectName: 'test20', projectPath: 'C:/Users/aasmunds/workspace/stox/project/test20' },
      { projectName: 'Gytetokt 2004', projectPath: '.' },
      { projectName: 'Tobis 2006', projectPath: '.' },
      { projectName: 'Tobis 2007', projectPath: '.' },
      { projectName: 'Tobis 2008', projectPath: '.' },
      { projectName: 'Tobis 2009', projectPath: '.' },
      { projectName: 'Tobis 2010', projectPath: '.' },
      { projectName: 'Tobis 2011', projectPath: '.' },
      { projectName: 'Tobis 2012', projectPath: '.' },
      { projectName: 'Tobis 2013', projectPath: '.' },
      { projectName: 'Tobis 2014', projectPath: '.' },
      { projectName: 'Tobis 2015', projectPath: '.' },
      { projectName: 'Tobis 2016', projectPath: '.' },
      { projectName: 'Tobis 2017', projectPath: '.' },
      { projectName: 'Tobis 2018', projectPath: '.' },
      { projectName: 'Tobis 2019', projectPath: '.' },
      { projectName: 'Tobis 2020', projectPath: '.' },
      { projectName: 'Tobis 2021', projectPath: '.' }
    ];

    var projectName = <string>await this.dataService.getProjectPath().toPromise();
    var projectRootPath = <string>await this.dataService.getProjectRootPath().toPromise();
    var fullPath = projectRootPath + "/" + projectName;

    this.projects = [...this.projects, { projectName: projectName, projectPath: fullPath }];
  }

}

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
  PROJECTS: Project[];
  PROCESSES_IN_MODEL: Process[];
  MODELS: Model[];

  selectedProject: Project = null;
  selectedProcesses: Process[] = null;
  // selectedProcess: Process = null;
  selectedModel: Model = null;

  constructor(private dataService: DataService) {
    console.log(" constructor() - class ProjectService: ");
    this.initData();
    this.setSelectedProject(this.getProjects()[0]);
  }

  hasProject(project: Project): boolean {
    var projectPath = project.projectPath;
    for (let i = 0; i < this.PROJECTS.length; i++) {
        var currentProjectPath = this.PROJECTS[i].projectPath;
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
    for (let i = 0; i < this.MODELS.length; i++) {
      if(this.MODELS[i].modelName == modelName) {
        this.selectedModel = this.MODELS[i];
        break;
      }
    }

    if(this.selectedProject) {
      // set project path and model name as parameter here
      //this.PROCESSES_IN_MODEL = <Process[]>JSON.parse(await this.dataService.getTestProcesses().toPromise());
      this.PROCESSES_IN_MODEL = <Process[]>JSON.parse(await this.dataService.getProcessesInModel(this.selectedProject.projectPath, modelName).toPromise());
      console.log("nr of processes : " + this.PROCESSES_IN_MODEL.length);
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
  
  getSelectedProcesses(): Process[] {
    return this.selectedProcesses;
  }

  setSelectedProcesses(process: Process []) {
    this.selectedProcesses = process;
  }

  getProjects(): Project[] {
    return this.PROJECTS;
  }

  getModels(): Model[] {
    return this.MODELS;
  }

  setModels(models: Model[]) {
    this.MODELS = models;
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

    this.PROJECTS = [
      { projectName: 'project49', projectPath: 'C:/Users/esmaelmh/workspace/stox/project/project49' },
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

    var projectName = <string> await this.dataService.getProjectPath().toPromise();
    var projectRootPath = <string> await this.dataService.getProjectRootPath().toPromise();
    var fullPath = projectRootPath + "/" + projectName;

    this.PROJECTS =  [...this.PROJECTS, {projectName: projectName, projectPath: fullPath}];
  }

}

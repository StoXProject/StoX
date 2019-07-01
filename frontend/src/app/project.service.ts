import { Injectable } from '@angular/core';
//import { Observable, of } from 'rxjs';
import { Project } from './project';
import { Process } from './process';
import { Model } from './model';

const PROJECTS: Project[] = [
  { name: 'Gytetokt 2004' },
  { name: 'Tobis 2006' },
  { name: 'Tobis 2007' },
  { name: 'Tobis 2008' },
  { name: 'Tobis 2009' },
  { name: 'Tobis 2010' },
  { name: 'Tobis 2011' },
  { name: 'Tobis 2012' },
  { name: 'Tobis 2013' },
  { name: 'Tobis 2014' },
  { name: 'Tobis 2015' },
  { name: 'Tobis 2016' },
  { name: 'Tobis 2017' },
  { name: 'Tobis 2018' },
  { name: 'Tobis 2019' },
  { name: 'Tobis 2020' },
  { name: 'Tobis 2021' }
];

const PROJECT1_BASELINE: Process[] = [
  { name: 'ReadBioticXML', model: 'baseline' },
  { name: 'ReadAcousticXML', model: 'baseline' },
  { name: 'runBootstrap', model: 'statistics' },
  { name: 'saveProjectData', model: 'statistics' },
  { name: 'FillMissingData', model: 'reports' },
  { name: 'EstimateByPopulationCategory', model: 'reports' }
];

const PROJECT2_BASELINE: Process[] = [
  { name: 'ReadBioticXML', model: 'baseline' },
  { name: 'DefineStratum', model: 'baseline' }
];

const MODELS: Model[] = [
  { name: 'baseline', caption: 'Baseline' },
  { name: 'statistics', caption: 'Statistics' },
  { name: 'reports', caption: 'Reports' }
]


@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  selectedProject: Project = null;
  selectedProcesses: Process[] = null;
  selectedProcess: Process = null;


  constructor() {
    this.setSelectedProject(this.getProjects()[0]);
  }

  setSelectedProject(project: Project) {
    this.selectedProject = project;
  }

  onSelectedProjectChanged(event) {
    this.selectedProcesses = null;//this.getProcesses('baseline'); // to be retrieved again from API
    //console.log("test1")
  }

  getSelectedProject(): Project {
    return this.selectedProject;
  }

  getSelectedProcess(): Process {
    return this.selectedProcess;
  }

  setSelectedProcess(process: Process) {
    this.selectedProcess = process;
  }

  getProjects(): Project[] {
    return PROJECTS;
  }

  getModels(): Model[] {
    return MODELS;
  }
  /**
   * get processes
   * @param model 
   */
  getProcesses(model: String): Process[] {
    if (this.selectedProcesses == null) {
      console.log("test3")
      this.selectedProcesses = this.getProcessesByModelAndProject(model, this.selectedProject.name);
    }
    return this.selectedProcesses;
  }

  getProcessesByModelAndProject(model: String, project: string): Process[] {
    if (this.selectedProject != null) {
      switch (this.selectedProject.name) {
        case 'Gytetokt 2004':
          switch (model) {
            case 'baseline': return [{ name: 'ReadBioticXML', model: 'baseline', breakingui:true }, { name: 'ReadAcousticXML', model: 'baseline' }];
            case 'statistics': return [{ name: 'runBootstrap', model: 'statistics' }, { name: 'saveProjectData', model: 'statistics' }];
          }
          break;
        case 'Tobis 2006':
          switch (model) {
            case 'baseline': return [{ name: 'ReadBioticXML', model: 'baseline' }, { name: 'DefineStratum', model: 'baseline' }];
            case 'statistics': return [{ name: 'runBootstrap', model: 'statistics' }, { name: 'saveProjectData', model: 'statistics' }];
          }
      }
    }
    return [];
  }
  /*  getObservableProjects(): Observable<Project[]> {
    return of(this.getProjects());
  }*/
}

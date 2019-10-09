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
  selectedProcess: Process = null;


  constructor(private dataService: DataService) {
    console.log(" constructor() - class ProjectService: ");
    this.initData();
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
    return this.PROJECTS;
  }

  getModels(): Model[] {
    if(this.MODELS == null) {
      this.initData();
    }
    return this.MODELS;
  }
  /**
   * get processes
   * @param model 
   */
  getProcesses(model: String): Process[] {
    // if (this.selectedProcesses == null) {
    //   console.log("test3")
    //   this.selectedProcesses = this.getProcessesByModelAndProject(model, this.selectedProject.projectName);
    // }
    // return this.selectedProcesses;

    this.reInitializeProcessesInModel(model);

    return this.PROCESSES_IN_MODEL;
  }

  async reInitializeProcessesInModel(model: String) {
    console.log("model name : " + model);
    this.PROCESSES_IN_MODEL = <Process[]> JSON.parse( await this.dataService.getProcessesInModel().toPromise() );
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
  /*  getObservableProjects(): Observable<Project[]> {
    return of(this.getProjects());
  }*/

  async initData() {

    console.log(" initData() - class ProjectService: ");

    this.PROJECTS = [
      { projectName: 'Gytetokt 2004', path: '.' },
      { projectName: 'Tobis 2006', path: '.'  },
      { projectName: 'Tobis 2007', path: '.'  },
      { projectName: 'Tobis 2008', path: '.'  },
      { projectName: 'Tobis 2009', path: '.'  },
      { projectName: 'Tobis 2010', path: '.'  },
      { projectName: 'Tobis 2011', path: '.'  },
      { projectName: 'Tobis 2012', path: '.'  },
      { projectName: 'Tobis 2013', path: '.'  },
      { projectName: 'Tobis 2014', path: '.'  },
      { projectName: 'Tobis 2015', path: '.'  },
      { projectName: 'Tobis 2016', path: '.'  },
      { projectName: 'Tobis 2017', path: '.'  },
      { projectName: 'Tobis 2018', path: '.'  },
      { projectName: 'Tobis 2019', path: '.'  },
      { projectName: 'Tobis 2020', path: '.'  },
      { projectName: 'Tobis 2021', path: '.'  }
    ];
    
    // this.PROCESSES_IN_MODEL = <Process[]> JSON.parse( await this.dataService.getProcessesInModel().toPromise() );  
    
    // console.log("processes retrieved : " + this.PROCESSES_IN_MODEL.length);

    // this.MODELS = <Model[]> JSON.parse( await this.dataService.getModelInfo().toPromise() );  
    
    // console.log("models retrieved : " + this.MODELS.length);
  }

}

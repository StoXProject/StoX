import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { AcousticLayerData, AcousticPSU, BioticAssignmentData, BioticPSU } from './../data/processdata';
import { DataService } from './data.service';
import { ProjectService } from './project.service';

@Injectable()
export class ProcessDataService {
  private m_stratum: string[];
  private m_acousticPSU: AcousticPSU;
  private m_bioticPSU: BioticPSU;
  private m_AcousticLayerData: AcousticLayerData;
  private m_bioticAssignmentData: BioticAssignmentData;
  private m_selectedStratum: string;
  private m_selectedPSU: string;
  private m_processDataSubject = new Subject<string>();

  constructor(
    private ds: DataService,
    private ps: ProjectService
  ) {
    console.log('> ' + 'Initializing processdata service');
    this.ps.iaModeSubject.subscribe({
      next: async newVal => {
        switch (newVal) {
          case 'stratum': {
            console.log('> ' + 'Process data - listen on iamode=stratum');
            const v: any = await ds.getInteractiveData(ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();

            this.stratum = v; // change this to v
            break;
          }

          case 'acousticPSU': {
            console.log('> ' + 'Process data - listen on iamode=acousticPSU');
            const v: any = await ds.getInteractiveData(ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();

            this.acousticPSU = v;
            break;
          }

          case 'bioticPSU': {
            console.log('> ' + 'Process data - listen on iamode=bioticPSU');
            const v: any = await ds.getInteractiveData(ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();
            this.bioticPSU = v;
            break;
          }

          case 'acousticLayer': {
            console.log('> ' + 'Process data - listen on iamode=acousticLayer');
            const v: any = await ds.getInteractiveData(ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();

            this.acousticLayerData = v;
            break;
          }

          case 'bioticAssignment': {
            console.log('> ' + 'Process data - listen on iamode=bioticAssignment');
            const v: any = await ds.getInteractiveData(ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();

            this.bioticAssignmentData = v;
            break;
          }

          case 'none': {
            this.selectedStratum = null;
            this.selectedPSU = null;
            break;
          }

          case 'reset': {
            this.stratum = null;
            this.acousticPSU = null;
            this.bioticPSU = null;
            this.acousticLayerData = null;
            this.bioticAssignmentData = null;
            this.selectedStratum = null;
            this.selectedPSU = null;
            break;
          }
        }
        //      console.log("> " + newVal);
      },
    });
  }

  get stratum(): string[] {
    return this.m_stratum;
  }

  set stratum(val: string[]) {
    if (val != null && !Array.isArray(val)) {
      return; // ensure that object is an array
    }

    this.m_stratum = val;
    this.m_processDataSubject.next('stratum');
  }

  get acousticPSU(): AcousticPSU {
    return this.m_acousticPSU;
  }

  set acousticPSU(val: AcousticPSU) {
    this.m_acousticPSU = val;
    this.m_processDataSubject.next('acousticPSU');
  }

  get bioticPSU(): BioticPSU {
    return this.m_bioticPSU;
  }

  set bioticPSU(val: BioticPSU) {
    this.m_bioticPSU = val;
    this.m_processDataSubject.next('bioticPSU');
  }

  get acousticLayerData(): AcousticLayerData {
    return this.m_AcousticLayerData;
  }

  set acousticLayerData(val: AcousticLayerData) {
    this.m_AcousticLayerData = val;
    this.m_processDataSubject.next('acousticLayerData');
  }

  get bioticAssignmentData(): BioticAssignmentData {
    return this.m_bioticAssignmentData;
  }

  set bioticAssignmentData(val: BioticAssignmentData) {
    this.m_bioticAssignmentData = val;
    this.m_processDataSubject.next('bioticAssignmentData');
  }

  get processDataSubject(): Subject<string> {
    return this.m_processDataSubject;
  }

  get selectedPSU(): string {
    return this.m_selectedPSU;
  }
  set selectedPSU(val: string) {
    this.m_selectedPSU = val;
    this.m_processDataSubject.next('selectedPSU');
  }

  get selectedStratum(): string {
    return this.m_selectedStratum;
  }
  set selectedStratum(val: string) {
    this.m_selectedStratum = val;
    this.m_processDataSubject.next('selectedStratum');
  }
}

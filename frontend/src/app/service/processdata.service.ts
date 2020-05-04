import { Injectable } from '@angular/core';
import { RunService } from './run.service';
import { DataService } from './data.service';
import { ProjectService } from './project.service';
import { AcousticPSU, AcousticLayerData, BioticAssignmentData, BioticAssignment } from './../data/processdata';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ProcessDataService {
    private m_stratum: string[];
    private m_acousticPSU: AcousticPSU;
    private m_processDataSubject = new Subject<string>();
    private m_selectedStratum: string;
    private m_selectedPSU: string;
    private m_bioticAssignmentData: BioticAssignmentData;
    private m_AcousticLayerData: AcousticLayerData;

    constructor(private ds: DataService, private ps: ProjectService) {
        this.ps.iaModeSubject.subscribe({
            next: async (newVal) => {
                switch (newVal) {
                    case 'stratum': {
                        console.log("Process data - listen on iamode=stratum")
                        let v: any = await ds.getInteractiveData(ps.selectedProject.projectPath,
                            ps.selectedModel.modelName, ps.activeProcessId).toPromise();
                        this.m_stratum = v;
                        break;
                    }
                    case 'acousticPSU': {
                        console.log("Process data - listen on iamode=acousticPSU")
                        let v: any = await ds.getInteractiveData(ps.selectedProject.projectPath,
                            ps.selectedModel.modelName, ps.activeProcessId).toPromise();
                        this.acousticPSU = v;
                        break;
                    }
                    case 'acousticLayer': {
                        console.log("Process data - listen on iamode=acousticLayer")
                        let v: any = await ds.getInteractiveData(ps.selectedProject.projectPath,
                            ps.selectedModel.modelName, ps.activeProcessId).toPromise();
                        this.acousticLayerData = v;
                        break;
                    }
                    case 'bioticAssignment': {
                        console.log("Process data - listen on iamode=bioticAssignment")
                        let v: any = await ds.getInteractiveData(ps.selectedProject.projectPath,
                            ps.selectedModel.modelName, ps.activeProcessId).toPromise();
                        this.bioticAssignmentData = v;
                        break;
                    }
                    case 'reset': {
                        this.stratum = null;
                        this.acousticPSU = null;
                        this.selectedStratum = null;
                        this.selectedPSU = null;
                        break;
                    }
                }
                //      console.log(newVal);
            }
        });
    }

    get stratum(): string[] {
        return this.m_stratum;
    }

    set stratum(val: string[]) {
        this.m_stratum = val;
        this.m_processDataSubject.next("stratum");
    }

    get acousticPSU(): AcousticPSU {
        return this.m_acousticPSU;
    }

    set acousticPSU(val: AcousticPSU) {
        this.m_acousticPSU = val;
        this.m_processDataSubject.next("acousticPSU");
    }

    get acousticLayerData(): AcousticLayerData {
        return this.m_AcousticLayerData;
    }

    set acousticLayerData(val: AcousticLayerData) {
        this.m_AcousticLayerData = val;
        this.m_processDataSubject.next("acousticLayerData");
    }

    get bioticAssignmentData(): BioticAssignmentData {
        return this.m_bioticAssignmentData;
    }

    set bioticAssignmentData(val: BioticAssignmentData) {
        this.m_bioticAssignmentData = val;
        this.m_processDataSubject.next("bioticAssignmentData");
    }

    get processDataSubject(): Subject<string> {
        return this.m_processDataSubject;
    }

    get selectedPSU(): string {
        return this.m_selectedPSU;
    }
    set selectedPSU(val: string) {
        this.m_selectedPSU = val;
        this.m_processDataSubject.next("selectedPSU");
    }


    get selectedStratum(): string {
        return this.m_selectedStratum;
    }
    set selectedStratum(val: string) {
        this.m_selectedStratum = val;
        this.m_processDataSubject.next("selectedStratum");
    }
}
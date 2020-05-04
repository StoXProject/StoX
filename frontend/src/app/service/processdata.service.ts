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
    private m_acousticPSU: AcousticPSU;
    private m_acousticPSUSubject = new Subject<string>();
    private m_selectedStratum: string;
    private m_selectedStratumSubject = new Subject<string>();
    private m_selectedPSU: string;
    private m_selectedPSUSubject = new Subject<string>();

    private m_bioticAssignmentDataSubject = new Subject<string>();
    private m_bioticAssignmentData: BioticAssignmentData;

    private m_AcousticLayerData: AcousticLayerData;
    private m_AcousticLayerDataSubject = new Subject<string>();

    constructor(private ds: DataService, private ps: ProjectService) {
        this.ps.iaModeSubject.subscribe({
            next: async (newVal) => {
                switch (newVal) {
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

    get acousticPSU(): AcousticPSU {
        return this.m_acousticPSU;
    }

    set acousticPSU(val: AcousticPSU) {
        this.m_acousticPSU = val;
        this.m_acousticPSUSubject.next("data");
    }

    get acousticLayerData(): AcousticLayerData {
        return this.m_AcousticLayerData;
    }

    set acousticLayerData(val: AcousticLayerData) {
        this.m_AcousticLayerData = val;
        this.m_AcousticLayerDataSubject.next("data");
    }

    get bioticAssignmentData(): BioticAssignmentData {
        return this.m_bioticAssignmentData;
    }

    set bioticAssignmentData(val: BioticAssignmentData) {
        this.m_bioticAssignmentData = val;
        this.m_bioticAssignmentDataSubject.next("data");
    }

    get acousticPSUSubject(): Subject<string> {
        return this.m_acousticPSUSubject;
    }

    get selectedPSU(): string {
        return this.m_selectedPSU;
    }
    set selectedPSU(val: string) {
        this.m_selectedPSU = val;
        this.m_selectedPSUSubject.next("selectedpsu");
    }

    get selectedPSUSubject(): Subject<string> {
        return this.m_selectedPSUSubject;
    }

    get selectedStratum(): string {
        return this.m_selectedStratum;
    }
    set selectedStratum(val: string) {
        this.m_selectedStratum = val;
        this.m_selectedStratumSubject.next(val);
    }
}
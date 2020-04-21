import { Injectable } from '@angular/core';
import { RunService } from './run.service';
import { DataService } from './data.service';
import { ProjectService } from './project.service';
import { AcousticPSU } from './../data/processdata';
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
    
    private m_assignmentSubject = new Subject<string>();
    private m_assignment: any;

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
                    case 'assignment': {
                        console.log("Process data - listen on iamode=assignment")
                        let v: any = await ds.getInteractiveData(ps.selectedProject.projectPath,
                            ps.selectedModel.modelName, ps.activeProcessId).toPromise();
                        //this.acousticPSU = v;
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
    get assignment(): any {
        return this.m_assignment;
    }
    set assignment(val: any) {
        this.m_assignment = val;
        this.m_assignmentSubject.next("data");
    }

    get acousticPSUSubject(): Subject<string> {
        return this.m_acousticPSUSubject;
    }

    get selectedPSU(): string {
        return this.m_selectedPSU;
    }
    set selectedPSU(val: string) {
        this.m_selectedPSU = val;
        this.m_acousticPSUSubject.next("selectedpsu");
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
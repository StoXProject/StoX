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
    private m_acousticPSUSubject = new Subject<AcousticPSU>();
    private m_SelectedStratum: string;
    private m_SelectedPSU: string;

    constructor(private rs: RunService, private ds: DataService, private ps: ProjectService) {
        this.rs.iaModeSubject.subscribe({
            next: async (newVal) => {
                switch (newVal) {
                    case 'acousticPSU': {
                        this.m_acousticPSU = await ds.getAcousticPSUData(ps.selectedProject.projectName,
                            ps.selectedModel.modelName, ps.activeProcessId).toPromise();
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
        this.m_acousticPSUSubject.next(this.m_acousticPSU);
    }
}
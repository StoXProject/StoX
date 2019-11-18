import { Injectable } from '@angular/core';
//import { Observable, of } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';

@Injectable({
    providedIn: 'root'
})
/**
 * Manage Run process logic
 */
export class RunService {
    constructor(private ps: ProjectService, private dataService: DataService) {
    }

    canRun(): boolean {
        return this.ps.selectedProject != null && this.ps.selectedModel != null &&
            this.ps.processes != null && this.ps.processes.length > 0 && this.ps.getRunningProcess() == null;
    }
    run() {
        let idx: number = this.ps.getActiveProcessIdx() === null ||
            this.ps.getActiveProcessIdx() == this.ps.processes.length - 1 ? 0 :
            this.ps.getActiveProcessIdx() + 1;
        this.runProcessIdx(idx, this.ps.processes.length - 1);
        // If the active process is the last, use the first.
        // Run from next to the active to the last process
    }


    runFromHere() {
        /*let idx: number = this.ps.getActiveProcessIdx() === null ||
            this.ps.getActiveProcessIdx() == this.ps.processes.length - 1 ? 0 :
            this.ps.getActiveProcessIdx() + 1;*/
        // Run from the active to the last process
        //this.runProcessIdx(processIdx, this.ps.processes.length - 1);
    }
    runThis(processIdx: number) {
        // Run from this to this process
        this.runProcessIdx(processIdx, processIdx);
    }
    getRunNextIdx(): number {
        return this.ps.processes.length == 0 || this.ps.getActiveProcessIdx() === null ||
            this.ps.getActiveProcessIdx() < this.ps.processes.length - 1 ?
            this.ps.getActiveProcessIdx() + 1 : null;
    }
    canRunNext(): boolean {
        return this.canRun() && this.getRunNextIdx() != null;
    }
    runNext() {
        let idx: number = this.getRunNextIdx();
        if (idx != null) {
            this.runProcessIdx(idx, idx);
        }
        // Run from the next to the next process.
    }
    getRunToHereIndexFrom(): number {
        return this.ps.processes.length == 0 ? null : this.ps.getActiveProcessIdx() == null ? 0 : this.ps.getActiveProcessIdx() + 1;
    }
    getRunToHereIndexTo(processIdx: number): number {
        return this.ps.processes.length == 0 ||
            this.ps.getActiveProcessIdx() == null || processIdx <= this.ps.getActiveProcessIdx() ||
            processIdx > this.ps.processes.length - 1 ? null : processIdx;
    }

    canRunToHere(processIdx: number): boolean {
        let idxFrom: number = this.getRunToHereIndexFrom();
        let idxTo: number = this.getRunToHereIndexTo(processIdx);
        return this.canRun() && idxFrom != null && idxTo != null;
    }

    runToHere(processIdx: number) {
        let idxFrom: number = this.getRunToHereIndexFrom();
        let idxTo: number = this.getRunToHereIndexTo(processIdx);
        if (idxFrom != null && idxTo != null) {
            this.runProcessIdx(idxFrom, idxTo);
        }
        // If the active process is the last, use the first.
        // Run from the next to the active to this process
    }
    canReset(): boolean {
        return this.ps.runningProcessId == null &&
            (this.ps.activeProcessId != null || this.ps.runFailedProcessId != null) &&
            this.ps.activeModelName != null && this.ps.selectedModel.modelName === this.ps.activeModelName;
    }
    reset() {
        this.ps.runningProcessId = null;
        this.ps.activeModelName = null;
        this.ps.activeProcessId = null;
        this.ps.runFailedProcessId = null;
        this.dataService.log.length = 0;
    }

    async runProcessIdx(iFrom: number, iTo: number) {
        this.ps.activeModelName = this.ps.selectedModel.modelName;
        this.ps.runFailedProcessId = null;
        // local cache of project, model and processes survives async environment if changed by user.
        let projectPath: string = this.ps.selectedProject.projectPath;
        let modelName: string = this.ps.selectedModel.modelName;
        let processes: Process[] = this.ps.processes;
        for (var i = iFrom; i <= iTo; i++) {
            let p = processes[i];
            this.ps.runningProcessId = p.processID;
            console.log("Run process " + p.processName + " with id " + p.processID);
            let s: any = await this.dataService.runModel(projectPath, modelName, i + 1, i + 1).toPromise();

            console.log(s);
            //await new Promise(resolve => setTimeout(resolve, 1200));
            // ask backend for new active process id
            if (typeof (s) == "object" && Object.entries(s).length == 0) {
                // getting empty object {} when interrupted by error
                this.ps.runFailedProcessId = p.processID;
                break;
            } else { // empty/missing result
                // ok update active process id and continue the loop
                this.ps.activeProcessId = p.processID;
            }
        }
        this.ps.runningProcessId = null;
    }
    //runModel(idx) {

    // call rstox active model and active project and process idx
    // runProcess(projectPath, modelName, processId) -> status hints ("processtable", "processproperties", "log", "updatemapdata")
    // { status: true;
    //   updateprocesstable:true;
    //   updateprocessproperties:true;
    //   updatelog:true; -- use getLastLogEntry
    //   updateMapdata:true;
    // }
    // do a update of gui based on the run response.
    //}

    //resetModel(processId) {
    // send in first process id will the reset the model.
    // call rstox active model and active project and process idx
    // update activeProcessId from rstox
    //}
}

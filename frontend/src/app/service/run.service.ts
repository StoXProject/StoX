import { Injectable } from '@angular/core';
//import { Observable, of } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { ProjectService } from '../service/project.service';

@Injectable({
    providedIn: 'root'
})
/**
 * Manage Run process logic
 */
export class RunService {
    constructor(private projectService: ProjectService) {
    }
    getProcessIdx(processId: string): number {
        return this.projectService.PROCESSES_IN_MODEL.findIndex(p => p.processId === processId);
    }
    getActiveProcessIdx(): number {
        return this.getProcessIdx(this.projectService.activeProcessId);
    }
    canRun(): Boolean {
        return this.projectService.PROCESSES_IN_MODEL.length > 0;
    }
    run() {
        let idx: number = this.getActiveProcessIdx() === null ? 0 : (this.getActiveProcessIdx() + 1) % this.projectService.PROCESSES_IN_MODEL.length;
        this.runProcessIdx(idx, this.projectService.PROCESSES_IN_MODEL.length - 1);
        // If the active process is the last, use the first.
        // Run from next to the active to the last process
    }

    runFromHere(processIdx: number) {
        // Run from the active to the last process
        this.runProcessIdx(processIdx, this.projectService.PROCESSES_IN_MODEL.length - 1);
    }
    runThis(processIdx: number) {
        // Run from this to this process
        this.runProcessIdx(processIdx, processIdx);
    }
    getRunNextIdx(): number {
        return this.projectService.PROCESSES_IN_MODEL.length == 0 || this.getActiveProcessIdx() === null ||
            this.getActiveProcessIdx() < this.projectService.PROCESSES_IN_MODEL.length - 1 ?
            null : this.getActiveProcessIdx() + 1;
    }
    canRunNext(): Boolean {
        return this.getRunNextIdx() != null;
    }
    runNext() {
        let idx: number = this.getRunNextIdx();
        if (idx != null) {
            this.runProcessIdx(idx, idx);
        }
        // Run from the next to the next process.
    }
    getRunToHereIndexFrom(): number {
        return this.projectService.PROCESSES_IN_MODEL.length == 0 ? null : this.getActiveProcessIdx() == null ? 0 : this.getActiveProcessIdx() + 1;
    }
    getRunToHereIndexTo(processIdx: number): number {
        return this.projectService.PROCESSES_IN_MODEL.length == 0 ||
            this.getActiveProcessIdx() == null || processIdx <= this.getActiveProcessIdx() ||
            processIdx > this.projectService.PROCESSES_IN_MODEL.length - 1 ? null : processIdx;
    }

    canRunToHere(processIdx: number) {
        let idxFrom: number = this.getRunToHereIndexFrom();
        let idxTo: number = this.getRunToHereIndexTo(processIdx);
        return idxFrom != null && idxTo != null;
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

    runProcessIdx(iFrom: number, iTo: number) {
        
    }
    runModel(idx) {
        // call rstox active model and active project and process idx
        // runProcess(projectPath, modelName, processId) -> status hints ("processtable", "processproperties", "log", "updatemapdata")
        // { status: true;
        //   updateprocesstable:true;
        //   updateprocessproperties:true;
        //   updatelog:true; -- use getLastLogEntry
        //   updateMapdata:true;
        // }
        // do a update of gui based on the run response.
    }

    resetModel(processId) {
        // send in first process id will the reset the model.
        // call rstox active model and active project and process idx
        // update activeProcessId from rstox
    }
}

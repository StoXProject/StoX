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
    activeProcessIdx: number = null;
    constructor(private projectService: ProjectService) {
    }

    runFromHere(processIdx: number) {
        // Run from the active to the last process
        this.runProcessIdx(processIdx, this.projectService.PROCESSES_IN_MODEL.length - 1);
    }
    runThis(processIdx: number) {
        // Run from this to this process
        this.runProcessIdx(processIdx, processIdx);
    }
    canRunNext(): Boolean {
        let idx: number = this.projectService.PROCESSES_IN_MODEL.length == 0 ? null :
            this.activeProcessIdx == null || this.activeProcessIdx == this.projectService.PROCESSES_IN_MODEL.length - 1 ?
                0 : this.activeProcessIdx + 1;
        return idx != null;
    }
    runNext() {
        let idx: number = this.projectService.PROCESSES_IN_MODEL.length == 0 ? null :
            this.activeProcessIdx == null || this.activeProcessIdx == this.projectService.PROCESSES_IN_MODEL.length - 1 ?
                0 : this.activeProcessIdx + 1;
        if (idx != null) {
            this.runProcessIdx(idx, idx);
        }
        // Run from the next to the next process.
    }
    runToHere(processIdx: number) {
        let idx: number = this.projectService.PROCESSES_IN_MODEL.length == 0 || processIdx ? null :
            this.activeProcessIdx == null || this.activeProcessIdx == this.projectService.PROCESSES_IN_MODEL.length - 1 ?
                0 : this.activeProcessIdx + 1;
        this.runProcessIdx(this.activeProcessIdx + 1, processIdx);
        // If the active process is the last, use the first.
        // Run from the next to the active to this process
    }
    run() {
        this.runProcessIdx(this.activeProcessIdx + 1, this.projectService.PROCESSES_IN_MODEL.length - 1);
        // If the active process is the last, use the first.
        // Run from next to the active to the last process
    }

    runProcessIdx(iFrom: number, iTo: number) {

    }
    runModel(idx) {
        // call rstox active model and active project and process idx
        // runProcess(projectPath, modelName, idx) -> status hints ("processtable", "processproperties", "log", "map")
        // { status: true;
        //   processtable:true;
        //   processtable:true;
             

        //}
        // do a map update.
    }
    //resetModel() {
        // call rstox active model and active project and process idx
        // update activeProcessIdx from rstox
    //}
}

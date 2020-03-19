import { Injectable } from '@angular/core';
//import { Observable, of } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';
import { Observable, Subject, of, interval, merge } from 'rxjs';
import { UserLogEntry } from '../data/userlogentry';
import { UserLogType } from '../enum/enums';
import { RunProcessesResult } from './../data/runresult';

@Injectable({
    providedIn: 'root'
})
/**
 * Manage Run process logic
 */
export class RunService {


    constructor(private ps: ProjectService, private dataService: DataService) {
        //this.iaMode = this.iaSubject.asObservable();
        this.ps.iaModeSubject.subscribe({
            next: (newVal) => {
                //      console.log(newVal);
            }
        });
        //this.iaSubject.next('stratum');
        //this.reset();
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
    canRunFromHere(): boolean {
        return this.canRun() && this.ps.getSelectedProcessIdx() != null &&
            (this.ps.getSelectedProcessIdx() == 0 || this.ps.getSelectedProcessIdx() <= this.ps.getActiveProcessIdx() + 1);
    }

    runNext() {
        let idx: number = this.getRunNextIdx();
        if (idx != null) {
            this.runProcessIdx(idx, idx);
        }
        // Run from the next to the next process.
    }

    getRunToHereIndexFrom(): number {
        return this.ps.processes.length == 0 || this.ps.getSelectedProcessIdx() == null ? null :
            this.ps.getActiveProcessIdx() == null ? 0 : Math.min(this.ps.getActiveProcessIdx() + 1,
                this.ps.getSelectedProcessIdx());
    }

    getRunToHereIndexTo(): number {
        return this.ps.getSelectedProcessIdx() != null ? this.ps.getSelectedProcessIdx() : null;
    }

    canRunToHere(): boolean {
        return this.ps.getSelectedProcessIdx() != null;
    }
    canRunThis(): boolean {
        let idxFrom: number = this.getRunToHereIndexFrom();
        let idxTo: number = this.getRunToHereIndexTo();
        return idxFrom != null && idxTo != null && idxFrom == idxTo;
    }

    runToHere() {
        let idxFrom: number = this.getRunToHereIndexFrom();
        let idxTo: number = this.getRunToHereIndexTo();
        if (idxFrom != null && idxTo != null) {
            this.runProcessIdx(idxFrom, idxTo);
        }
        // If the active process is the last, use the first.
        // Run from the next to the active to this process
    }
    canReset(): boolean {
        return this.ps.runningProcessId == null &&
            (this.ps.activeProcessId != null || this.ps.runFailedProcessId != null)/* &&
            this.ps.activeModelName != null && this.ps.selectedModel.modelName === this.ps.activeModelName*/;
    }
    async reset() {
        this.ps.runningProcessId = null;
        //   this.ps.activeModelName = null;
        let activeProcessId: string = await this.dataService.resetModel(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName).toPromise();
        console.log("Reset active process id : " + activeProcessId);
        this.ps.activeProcessId = activeProcessId;
        this.ps.runFailedProcessId = null;
        this.dataService.log.length = 0;
        this.ps.iaMode = 'reset'; // reset interactive mode set to reset
        // Reset in backend
    }

    async runProcessIdx(iFrom: number, iTo: number) {
        //  this.ps.activeModelName = this.ps.selectedModel.modelName;
        this.ps.runFailedProcessId = null;
        // local cache of project, model and processes survives async environment if changed by user.
        let projectPath: string = this.ps.selectedProject.projectPath;
        let modelName: string = this.ps.selectedModel.modelName;
        let processes: Process[] = this.ps.processes;
        for (var i = iFrom; i <= iTo; i++) {
            let p = processes[i];
            this.ps.runningProcessId = p.processID;
            //console.log("Run process " + p.processName + " with id " + p.processID);
            this.dataService.log.push(new UserLogEntry(UserLogType.MESSAGE, "Process " + p.processName));
            this.ps.iaMode = '';
            let res: RunProcessesResult = await this.dataService.runProcesses(projectPath, modelName, i + 1, i + 1).toPromise();

            //console.log("run result: " + res);
            //await new Promise(resolve => setTimeout(resolve, 1200));
            // ask backend for new active process id
            if (typeof (res.activeProcess) == 'undefined') {
                // getting empty object {} when interrupted by error
                this.ps.runFailedProcessId = p.processID;
                break;
            } else { // empty/missing result
                // ok update active process id and continue the loop
                this.ps.activeProcessId = res.activeProcess.processID; // get first element in array
                // get the interactive mode:

                //console.log("asking for ia mode");
                let ia: string = res.interactiveMode;//await this.dataService.getInteractiveMode(projectPath, modelName, this.ps.activeProcessId).toPromise();
                //console.log("ia mode " + ia);
                if (ia.length > 0) {
                    this.ps.iaMode = ia;
                }
                //console.log("interactive mode:" + ia);
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

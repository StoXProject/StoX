import { Injectable, RendererFactory2, Renderer2 } from '@angular/core';
//import { Observable, of } from 'rxjs';
import { Project } from '../data/project';
import { Process } from '../data/process';
import { Model } from '../data/model';
import { ProjectService } from '../service/project.service';
import { DataService } from '../service/data.service';
import { Observable, Subject, of, interval, merge } from 'rxjs';
import { UserLogEntry } from '../data/userlogentry';
import { UserLogType } from '../enum/enums';
import { RunProcessesResult, ProcessTableResult } from './../data/runresult';

@Injectable({
  providedIn: 'root',
})
/**
 * Manage Run process logic
 */
export class RunService {
  constructor(
    private ps: ProjectService,
    private dataService: DataService,
    private rf: RendererFactory2
  ) {
    console.log('> ' + 'Initializing run service');
    //this.iaMode = this.iaSubject.asObservable();
    this.ps.iaModeSubject.subscribe({
      next: newVal => {
        //      console.log("> " + newVal);
      },
    });
    //this.iaSubject.next('stratum');
    //this.reset();
    let r: Renderer2 = rf.createRenderer(null, null);
    r.listen(document, 'document:keydown', evt => {
      console.log('> ' + evt);
      this.runToHere();
    });
  }
  canAddProcess(): boolean {
    return this.ps.selectedProject != null && this.ps.selectedModel != null && this.ps.getRunningProcess() == null && !this.ps.isResetting;
  }
  canRun(): boolean {
    return this.canAddProcess() && this.ps.processes != null && this.ps.processes.length > 0;
  }
  run() {
    let d = this.ps.activeProcess != null && this.ps.activeProcess.processDirty ? 1 : 0;
    let idx: number = this.ps.getActiveProcessIdx() === null || this.ps.getActiveProcessIdx() - d == this.ps.processes.length - 1 ? 0 : this.ps.getActiveProcessIdx() - d + 1;
    this.runProcessIdx(idx, this.ps.processes.length - 1);
    // If the active process is the last, use the first.
    // Run from next to the active to the last process
  }

  runFromHere() {
    let idxFrom: number = this.ps.getSelectedProcessIdx();
    this.runProcessIdx(idxFrom, this.ps.processes.length - 1);
  }

  runThisIdx(processIdx: number) {
    // Run from this to this process
    this.runProcessIdx(processIdx, processIdx);
  }
  runThis() {
    // Run from this to this process
    this.runThisIdx(this.ps.getSelectedProcessIdx());
  }
  getRunNextIdx(): number {
    return this.ps.processes.length == 0 || this.ps.getActiveProcessIdx() === null || this.ps.getActiveProcessIdx() < this.ps.processes.length - 1 ? this.ps.getActiveProcessIdx() + (this.ps.activeProcess.processDirty ? 0 : 1) : null;
  }
  canRunNext(): boolean {
    return this.canRun() && this.getRunNextIdx() != null && this.isProcessIdxRunnable(this.getRunNextIdx());
  }

  canRunFromHere(): boolean {
    return this.canRun() && this.ps.getSelectedProcessIdx() != null && this.isProcessIdxRunnable(this.ps.getSelectedProcessIdx()) && !this.hasFunctionalErrorUpTo(this.ps.getSelectedProcessIdx()) && (this.ps.getSelectedProcessIdx() == this.firstProcessIdxRunnable(this.ps.getActiveProcessIdx() != null ? this.ps.getActiveProcessIdx() + 1 : 0) || (this.ps.getActiveProcessIdx() != null && this.ps.getSelectedProcessIdx() <= this.ps.getActiveProcessIdx() + 1));
  }

  runNext() {
    let idx: number = this.getRunNextIdx();
    if (idx != null) {
      this.runProcessIdx(idx, idx);
    }
    // Run from the next to the next process.
  }

  getRunToHereIndexFrom(): number {
    if (this.ps.processes.length == 0 || this.ps.getSelectedProcessIdx() == null) {
      return null;
    }
    let idx = 0;
    if (this.ps.getActiveProcessIdx() != null) {
      if (this.ps.getActiveProcessIdx() < this.ps.getSelectedProcessIdx()) {
        idx = this.ps.getActiveProcessIdx() + (this.ps.activeProcess.processDirty ? 0 : 1);
      } else {
        idx = this.ps.getSelectedProcessIdx();
      }
    }
    return this.firstProcessIdxRunnable(idx);
  }

  /*hasFunctionalError() {
        return this.ps.processes != null && this.ps.processes.length > 0 && 
        this.hasFunctionalErrorUpTo(this.ps.processes.length - 1);
    }*/

  hasFunctionalErrorUpTo(idx) {
    let i = this.firstProcessIdxNotRunnable(idx, false, true);
    return i != null;
  }

  getRunToHereIndexTo(): number {
    return this.ps.getSelectedProcessIdx() != null ? this.ps.getSelectedProcessIdx() : null;
  }

  canRunToHere(): boolean {
    return this.canRun() && this.ps.getSelectedProcessIdx() != null && this.isProcessIdxRunnable(this.ps.getSelectedProcessIdx()) && !this.hasFunctionalErrorUpTo(this.ps.getSelectedProcessIdx());
  }

  firstProcessIdxNotRunnable(idx, checkDisable: boolean = true, checkFunctionInputError: boolean = true) {
    for (let i = 0; i < idx; i++) {
      if (!this.isProcessIdxRunnable(i, checkDisable, checkFunctionInputError)) {
        return i;
      }
    }
    return null;
  }

  firstProcessIdxRunnable(idx, checkDisable: boolean = true, checkFunctionInputError: boolean = true) {
    for (let i = idx; i < this.ps.processes.length; i++) {
      if (this.isProcessIdxRunnable(i, checkDisable, checkFunctionInputError)) {
        return i;
      }
    }
    return null;
  }

  isProcessIdxRunnable(idx, checkDisable: boolean = true, checkFunctionInputError: boolean = true) {
    return idx != null && idx >= 0 && idx <= this.ps.processes.length - 1 && !(checkDisable && !this.ps.processes[idx].enabled) && !(checkFunctionInputError && this.ps.processes[idx].functionInputError);
  }

  canRunThis(): boolean {
    let idxFrom: number = this.getRunToHereIndexFrom();
    let idxTo: number = this.getRunToHereIndexTo();
    return idxFrom != null && idxTo != null && idxFrom == idxTo && this.isProcessIdxRunnable(idxTo) && !this.hasFunctionalErrorUpTo(idxTo);
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
    return (
      this.ps.runningProcessId == null && (this.ps.activeProcessId != null || this.ps.runFailedProcessId != null) && !this.ps.isResetting /* &&
            this.ps.activeModelName != null && this.ps.selectedModel.modelName === this.ps.activeModelName*/
    );
  }
  async reset() {
    this.ps.isResetting = true;
    this.ps.runningProcessId = null;
    //   this.ps.activeModelName = null;
    this.ps.handleAPI(await this.dataService.resetModel(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName).toPromise());
    this.ps.runFailedProcessId = null;
    this.dataService.log.length = 0;
    this.dataService.logSubject.next('log-reset');
    this.ps.iaMode = 'reset'; // reset interactive mode set to reset
    this.ps.isResetting = false;
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
      if (!p.enabled) {
        continue;
      }
      if (p.functionInputError) {
        break;
      }
      this.ps.runningProcessId = p.processID;
      //console.log("> " + "Run process " + p.processName + " with id " + p.processID);
      this.dataService.log.push(new UserLogEntry(UserLogType.MESSAGE, '> Running process ' + p.processName + ' of model ' + modelName + '...'));
      // this.dataService.logSubject.next('log-message');
      // this.ps.iaMode = '';
      let res: RunProcessesResult = this.ps.handleAPI(await this.dataService.runProcesses(projectPath, modelName, i + 1, i + 1).toPromise());

      //console.log("> " + "run result: " + res);
      //await new Promise(resolve => setTimeout(resolve, 1200));
      // ask backend for new active process id
      if (res.activeProcess === undefined) {
        // getting empty object {} when interrupted by error
        this.ps.runFailedProcessId = p.processID;
        break;
      } else {
        if (this.ps.activeProcess.propertyDirty && this.ps.selectedProcess != null && this.ps.selectedProcess.processID == this.ps.activeProcessId) {
          //if(this.ps.selectedProcess.processID == this.ps.activeProcessId) {
          this.ps.updateProcessProperties(); // process properties may change on the selected process
        }
        let ia: string = res.interactiveMode;
        if (ia.length > 0) {
          this.ps.iaMode = ia;
        }
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

  addProcess() {
    this.ps.addProcess();
  }
}

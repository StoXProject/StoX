import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

import { UserLogEntry } from '../data/userlogentry';
import { UserLogType } from '../enum/enums';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { RunProcessesResult } from './../data/runresult';

@Injectable()
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
    this.ps.iaModeSubject.subscribe({
      next: newVal => {},
    });
    const r: Renderer2 = rf.createRenderer(null, null);

    r.listen(document, 'document:keydown', evt => {
      console.log('> ' + evt);
      this.runToHere();
    });
  }

  // CAN
  // ____________________________________________________________________________________________________________________________________________________________________________________

  canAddProcess(): boolean {
    return this.ps.selectedProject != null && this.ps.selectedModel != null && this.ps.getRunningProcess() == null && !this.ps.isResetting;
  }

  canRun(): boolean {
    return this.canAddProcess() && this.ps.processes != null && this.ps.processes.length > 0;
  }

  canRunNext(): boolean {
    return this.canRun() && this.getRunNextIdx() != null && this.isProcessIdxRunnable(this.getRunNextIdx());
  }

  canRunFromHere(): boolean {

    // Get the next process, set to 0 if no active processes:
    const isProcessActive = this.ps.getActiveProcessIdx() != null;
    const nextProcessIndex = isProcessActive ? this.ps.getActiveProcessIdx() + 1 : 0;
    //const isProcessSelected = this.ps.getSelectedProcessIdx() != null;

    // Run from here is only possible if the selected processe is no later than the next process after the active:
    const isSelectedProcessBeforeOrEqualToActive = this.ps.getSelectedProcessIdx() <= nextProcessIndex;

    // Is the process the first of the processes from the nextt process and onwards that cann  be run? This adds support for run from here from a process that is the first runable process after the active process:
    const isFirstProcessRunnable = this.ps.getSelectedProcessIdx() == this.firstProcessIdxRunnable(nextProcessIndex);

    // Require that the selected process is enabled (runnable), that is does not have input errors, and that it is either one of the processes up to the next after the selected or the firs runnable after the next process:
    const isValidRunCondition = this.isProcessIdxRunnable(this.ps.getSelectedProcessIdx()) && !this.hasFunctionalErrorUpTo(this.ps.getSelectedProcessIdx()) && (isSelectedProcessBeforeOrEqualToActive || isFirstProcessRunnable);

    return this.canRun() && isValidRunCondition;
  }

  canRunToHere(): boolean {
    return this.canRun() && this.ps.getSelectedProcessIdx() != null && this.isProcessIdxRunnable(this.ps.getSelectedProcessIdx()) && !this.hasFunctionalErrorUpTo(this.ps.getSelectedProcessIdx());
  }

  canRunThis(): boolean {
    const idxFrom: number = this.getRunToHereIndexFrom();
    const idxTo: number = this.getRunToHereIndexTo();

    return idxFrom != null && idxTo != null && idxFrom == idxTo && this.isProcessIdxRunnable(idxTo) && !this.hasFunctionalErrorUpTo(idxTo);
  }

  canReset(): boolean {
    return this.ps.runningProcessId == null && (this.ps.activeProcessId != null || this.ps.runFailedProcessId != null) && !this.ps.isResetting;
  }

  canStop(): boolean {
    return this.ps.runningProcessId != null && !this.ps.isResetting;
  }

  isProcessIdxRunnable(idx, checkDisable: boolean = true, checkFunctionInputError: boolean = true) {
    return idx != null && idx >= 0 && idx <= this.ps.processes.length - 1 && !(checkDisable && !this.ps.processes[idx].enabled) && !(checkFunctionInputError && this.ps.processes[idx].functionInputError);
  }

  // RUN
  // ____________________________________________________________________________________________________________________________________________________________________________________
  /**
   * If the active process is the last, use the first.
   * Run from next to the active to the last process
   */
  run() {
    const d = this.ps.activeProcess != null && this.ps.activeProcess.processDirty ? 1 : 0;

    const idx: number = this.ps.getActiveProcessIdx() === null || this.ps.getActiveProcessIdx() - d == this.ps.processes.length - 1 ? 0 : this.ps.getActiveProcessIdx() - d + 1;

    this.runProcessIdx(idx, this.ps.processes.length - 1);
  }

  runFromHere() {
    const idxFrom: number = this.ps.getSelectedProcessIdx();

    this.runProcessIdx(idxFrom, this.ps.processes.length - 1);
  }

  /**
   * Run from this to this process
   * */
  runThisIdx(processIdx: number) {
    this.runProcessIdx(processIdx, processIdx);
  }

  /**
   * Run from this to this process
   * */
  runThis() {
    this.runThisIdx(this.ps.getSelectedProcessIdx());
  }

  getRunNextIdx(): number {
    return this.ps.processes.length == 0 || this.ps.getActiveProcessIdx() === null || this.ps.getActiveProcessIdx() < this.ps.processes.length - 1 ? this.ps.getActiveProcessIdx() + (this.ps.activeProcess.processDirty ? 0 : 1) : null;
  }

  /**
   * Run from the next to the next process.
   * */
  runNext() {
    const idx: number = this.getRunNextIdx();

    if (idx == null) {
      return;
    }

    this.runProcessIdx(idx, idx);
  }

  /**
   * If the active process is the last, use the first.
   * Run from the next to the active to this process
   */
  runToHere(): void {
    const from: number = this.getRunToHereIndexFrom();
    const to: number = this.getRunToHereIndexTo();

    if (from == null || to == null) {
      return;
    }

    this.runProcessIdx(from, to);
  }
  async reset(): Promise<void> {
    this.ps.isResetting = true;
    this.ps.runningProcessId = null;
    this.ps.handleAPI(await this.dataService.resetModel(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName).toPromise());
    this.ps.runFailedProcessId = null;
    this.dataService.log.length = 0;
    this.dataService.logSubject.next('log-reset');
    this.ps.iaMode = 'reset'; // reset interactive mode set to reset
    this.ps.isResetting = false;
    // Reset in backend
  }

  async runProcessIdx(fromIndex: number, toIndex: number) {
    // Reset properties
    this.ps.runFailedProcessId = null;
    let purgeStopFile = true;

    // local cache of project, model and processes survives async environment if changed by user.
    const { projectPath } = this.ps.selectedProject;
    const { modelName } = this.ps.selectedModel;
    const { processes } = this.ps;

    for (let i = fromIndex; i <= toIndex; i++) {
      const process = processes[i];
      const { enabled, functionInputError, processID, processName } = process;

      if (!enabled) {
        continue;
      }

      if (functionInputError) {
        break;
      }

      this.ps.runningProcessId = processID;

      this.dataService.log.push(new UserLogEntry(UserLogType.MESSAGE, '> Running process ' + processName + ' of model ' + modelName + '...'));
      const { activeProcess, interactiveMode }: RunProcessesResult = this.ps.handleAPI(await this.dataService.runProcesses(projectPath, modelName, i + 1, i + 1, purgeStopFile).toPromise());
      purgeStopFile = false; // only purge stop file on first process

      // ask backend for new active process id
      if (activeProcess === undefined) {
        // getting empty object {} when interrupted by error
        this.ps.runFailedProcessId = processID;
        break;
      }

      if (this.ps.activeProcess.propertyDirty && this.ps.selectedProcess != null && this.ps.selectedProcess.processID == this.ps.activeProcessId) {
        // process properties may change on the selected process
        this.ps.updateProcessProperties();
      }

      if (interactiveMode.length > 0) {
        this.ps.iaMode = interactiveMode;
      }
    }

    this.ps.runningProcessId = null;
  }

  // GET
  // ____________________________________________________________________________________________________________________________________________________________________________________
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

  getRunToHereIndexTo(): number {
    return this.ps.getSelectedProcessIdx() != null ? this.ps.getSelectedProcessIdx() : null;
  }

  // OTHER
  // ____________________________________________________________________________________________________________________________________________________________________________________
  hasFunctionalErrorUpTo(idx) {
    const i = this.firstProcessIdxNotRunnable(idx, false, true);

    return i != null;
  }

  firstProcessIdxNotRunnable(idx, checkDisable: boolean = true, checkFunctionInputError: boolean = true) {
    for (let i = 0; i < idx; i++) {
      if (!this.isProcessIdxRunnable(i, checkDisable, checkFunctionInputError)) {
        return i;
      }
    }

    return null;
  }

  firstProcessIdxRunnable(idx, checkDisable: boolean = true, checkFunctionInputError: boolean = true): number | null {
    for (let i = idx; i < this.ps.processes.length; i++) {
      if (this.isProcessIdxRunnable(i, checkDisable, checkFunctionInputError)) {
        return i;
      }
    }

    return null;
  }

  addProcess() {
    this.ps.addProcess();
  }

  stop() {
    this.ps.stopR();
  }

  // Documentation ?
  // _________________________________________________________________________________________________________
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

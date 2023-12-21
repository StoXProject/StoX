import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { CheckForUpdatesDialogService } from '../checkForUpdatesDlg/CheckForUpdatesDialogService';
import { HelpCache } from '../data/HelpCache';
import { Model } from '../data/model';
import { OutputElement as OutputElement } from '../data/outputelement';
import { PackageVersion } from '../data/PackageVersion';
import { Process } from '../data/process';
import { ProcessProperties, ProcessTableOutput } from '../data/ProcessProperties';
import { Project } from '../data/project';
import { ActiveProcess } from '../data/runresult';
import { SubjectAction } from '../data/subjectaction';
import { UserLogEntry } from '../data/userlogentry';
import { MessageDlgComponent } from '../dlg/messageDlg/messageDlg.component';
import { UserLogType } from '../enum/enums';
import { DataService } from './data.service';

@Injectable()
export class ProjectService {
  private m_Application: string;
  private m_iaMode: string;
  private m_iaModeSubject = new Subject<string>();
  private m_processSubject = new Subject<SubjectAction>();

  private m_projects: Project[] = [];
  private m_selectedProject: Project = null;
  outputElements: OutputElement[] = [];
  public outputTableActivator: Subject<number> = new Subject<number>();
  public bottomViewActivator: Subject<number> = new Subject<number>();

  models: Model[];

  private m_selectedModel: Model = null;
  private m_processes: Process[] = [];
  private m_selectedProcessId: string;
  private m_processProperties: ProcessProperties = {};
  helpCache: HelpCache = new HelpCache();
  private m_activeProcess: ActiveProcess = {}; // the last run-ok process
  runFailedProcessId: string = null; // the last run-failed process
  runningProcessId: string = null; // current running process
  m_isResetting: boolean = false; // current reset flag.
  rstoxPackages: PackageVersion[];
  isOfficialStoXVersion: boolean = false;
  rstoxFrameworkAvailable: boolean = false;
  m_appStatus: string = null;
  m_appStatusIsUpdating: boolean = false;

  userlog: string[] = [];

  constructor(
    private dataService: DataService /*, public rs: RunService*/,
    private dialog: MatDialog,
    private checkForUpdatesDialogService: CheckForUpdatesDialogService
  ) {
    console.log('> ' + 'Initializing project service');
    this.initData();
  }

  get application(): string {
    return this.m_Application;
  }

  get processes(): Process[] {
    return this.m_processes;
  }

  set processes(processes: Process[]) {
    this.m_processes = processes;
    if (this.selectedProcessId != null) {
      // Ensure that selectedProcessid is among processes' id or cleared
      this.selectedProcess = processes == null ? null : processes.find(p => p.processID == this.selectedProcessId);
    }
  }

  get iaModeSubject(): Subject<string> {
    return this.m_iaModeSubject;
  }

  get processSubject(): Subject<SubjectAction> {
    return this.m_processSubject;
  }

  get processProperties(): ProcessProperties {
    return this.m_processProperties;
  }

  set processProperties(processProperties: ProcessProperties) {
    this.m_processProperties = processProperties;
  }

  set iaMode(iaMode: string) {
    this.m_iaMode = iaMode;
    this.m_iaModeSubject.next(iaMode); // propagate event
  }

  get iaMode(): string {
    return this.m_iaMode;
  }

  set projects(projects: Project[]) {
    this.m_projects = projects;
    this.selectedProject = projects == null || projects.length == 0 ? null : this.projects[0];
  }

  get projects(): Project[] {
    return this.m_projects;
  }

  hasProject(project: Project): boolean {
    const projectPath = project.projectPath;

    for (let i = 0; i < this.projects.length; i++) {
      const currentProjectPath = this.projects[i].projectPath;

      if (currentProjectPath == projectPath) {
        return true;
      }
    }

    return false;
  }
  async save() {
    this.selectedProject.saved = (await this.dataService.saveProject(this.selectedProject.projectPath, this.application).toPromise()).saved;
    await this.dataService.updateActiveProjectSavedStatus(this.selectedProject.saved).toPromise();
  }

  onSelectedProjectChanged(event) {
    console.log('> ' + 'selected project changed : ' + this.selectedProject.projectName);

    // the following is implemented in setSelctedProject
    // set selected model to 'Baseline'
    // get processes in 'Baseline' for selected project and show it on GUI
    // this.setSelectedModel("Baseline");
  }

  get selectedModel(): Model {
    return this.m_selectedModel;
  }

  set selectedModel(model: Model) {
    this.m_selectedModel = model;
    console.log('> ' + 'Change to model', model);
    // To do in future: caching process list per model. For now update process list on each model click
    this.onModelSelected();
  }

  async onModelSelected() {
    console.log('> ' + 'Change model');
    if (this.selectedProject != null && this.selectedModel != null) {
      this.processes = await this.dataService.getProcessTable(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();
      this.activeProcess = await this.dataService.getActiveProcess(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();
      if (this.processes == null) {
        this.processes = [];
      }
    } else {
      this.processes = [];
    }
  }

  async removeSelectedProcess() {
    if (this.selectedProject != null && this.selectedProcessId != null) {
      this.processSubject.next(SubjectAction.of('remove', this.selectedProcessId));
      this.handleAPI(await this.dataService.removeProcess(this.selectedProject.projectPath, this.selectedModel.modelName, this.selectedProcessId).toPromise());
    }
  }

  async duplicateSelectedProcess() {
    if (this.selectedProject != null && this.selectedProcessId != null) {
      this.processSubject.next(SubjectAction.of('duplicate', this.selectedProcessId));
      this.handleAPI(await this.dataService.duplicateProcess(this.selectedProject.projectPath, this.selectedModel.modelName, this.selectedProcessId).toPromise());
    }
  }

  async addProcess() {
    if (this.selectedProject != null) {
      this.handleAPI(await this.dataService.addProcess(this.selectedProject.projectPath, this.selectedModel.modelName, null).toPromise());
    }
  }

  public get selectedProject(): Project {
    return this.m_selectedProject;
  }

  public set selectedProject(project: Project) {
    if (project !== this.selectedProject) {
      this.m_selectedProject = project;
      this.OnProjectSelected(); // call async method
    }
  }

  public async OnProjectSelected() {
    this.selectedModel = this.selectedProject == null ? null : this.models[0]; // This will trigger update process list

    // Update active process id
    if (this.selectedProject == null) {
      return;
    }

    const activeProcess: ActiveProcess = await this.dataService.getActiveProcess(this.selectedProject.projectPath, this.selectedModel.modelName).toPromise();

    const idx = activeProcess.processID == null ? null : this.getProcessIdxByProcessesAndId(this.processes, activeProcess.processID);

    if (idx != null) {
      for (let i: number = 0; i <= idx; i++) {
        const p: Process = this.processes[i];

        this.activeProcessId = this.processes[i].processID;
        if ((p.canShowInMap && p.showInMap) || p.hasProcessData) {
          const iaMode: string = await this.dataService.getInteractiveMode(this.selectedProject.projectPath, this.selectedModel.modelName, this.activeProcessId).toPromise();

          this.iaMode = iaMode;
        }
      }
    } else {
      this.activeProcessId = null;
      this.iaMode = 'reset';
    }
  }

  public get selectedProcessId(): string {
    return this.m_selectedProcessId;
  }

  public set selectedProcessId(processId: string) {
    if (processId != this.m_selectedProcessId) {
      this.m_selectedProcessId = processId;
      this.onSelectedProcessChanged();
    }
  }
  public get selectedProcess(): Process {
    return this.getProcessById(this.selectedProcessId);
  }
  public set selectedProcess(process: Process) {
    this.selectedProcessId = process != null ? process.processID : null;
  }

  public get helpContent(): string {
    return this.helpCache.current();
  }

  // Set accessor for help content
  public set helpContent(content: string) {
    this.helpCache.add(content);
  }

  onSelectedProcessChanged() {
    this.updateProcessProperties();
    this.updateHelp();
  }

  async updateProcessProperties() {
    if (this.selectedProject != null && this.selectedProcess != null && this.selectedModel != null) {
      this.processProperties = await this.dataService.getProcessPropertySheet(this.selectedProject.projectPath, this.selectedModel.modelName, this.selectedProcessId).toPromise();
    } else {
      this.processProperties = {};
    }
  }

  async updateHelp() {
    if (this.selectedProject != null && this.selectedProcess != null && this.selectedModel != null) {
      console.log('> ' + 'Update help');
      this.helpContent = await this.dataService.getFunctionHelpAsHtml(this.selectedProject.projectPath, this.selectedModel.modelName, this.selectedProcessId).toPromise();
    } else {
      this.helpContent = '';
    }
  }

  getProjects(): Project[] {
    return this.projects;
  }

  getModels(): Model[] {
    return this.models;
  }

  setModels(models: Model[]) {
    this.models = models;
  }

  async initData() {
    try {
      this.appStatus = 'Initializing StoX';
      await this.checkRstoxFrameworkAvailability();
      this.m_Application = 'StoX ' + (await this.dataService.getStoxVersion().toPromise());
      const projectPath = <string>await this.dataService.readActiveProject().toPromise();

      console.log('> ' + 'Read projectpath:' + projectPath);
      // Read models and set selected to the first model
      if (projectPath.length > 0 && this.rstoxFrameworkAvailable) {
        // THROW WHILE DEBUGGING
        await this.openProject(projectPath, false, true, false, true);
      }
    } finally {
      this.appStatus = null;
    }
  }

  async checkRstoxFrameworkAvailability() {
    this.isOfficialStoXVersion = JSON.parse(await this.dataService.getIsOfficialStoXVersion().toPromise());
    console.log('> ' + 'this.isOfficialStoXVersion: ' + this.isOfficialStoXVersion);
    this.rstoxPackages = JSON.parse(await this.dataService.getRstoxPackageVersions().toPromise());
    console.log('> ' + 'this.rstoxPackages: ' + this.rstoxPackages);

    // Accept empty list of Rstox packages:
    if (this.rstoxPackages.length > 0) {
      this.rstoxFrameworkAvailable = this.rstoxPackages[0].status < 2;
    } else {
      this.rstoxFrameworkAvailable = false;
    }

    if (this.rstoxFrameworkAvailable) {
      this.setModels(await this.dataService.getModelInfo().toPromise());
    } else {
      this.setModels(null);
      await this.activateProject(null, false);
    }

    // Check for StoX update:
    await this.checkForUpdatesDialogService.checkForUpdates();
    const newVersionAvailable = this.checkForUpdatesDialogService.newVersionAvailable();
    if (newVersionAvailable) {
      this.dataService.log.push(new UserLogEntry(UserLogType.WARNING, "There is a newer StoX version available. Go to 'Check for updates' on the Help menu to install the newer version."));
    }
  }

  /**
   * Open the project and make it selected in the GUI
   */
  async openProject(projectPath: string, doThrow: boolean, force: boolean, askSave: boolean, withStatus = false) {
    try {
      if (withStatus) {
        this.appStatus = 'Opening project ' + projectPath + '...';
      }

      await this.activateProject(await this.dataService.openProject(projectPath, doThrow, force).toPromise(), askSave);
    } finally {
      this.appStatus = null;
    }
  }

  /**
   * Open the project and make it selected in the GUI
   * */
  async openProjectAsTemplate(projectPath: string, projectNewPath: string, projectName: string, doThrow: boolean, force: boolean, askSave: boolean, withStatus = true) {
    try {
      if (withStatus) {
        this.appStatus = 'Opening project ' + projectPath + ' as template and storing in' + projectNewPath;
      }

      // Close the current project first:
      await this.activateProject(null, true);

      // Then get the project to copy from and close that also:
      const projectToCopy = await this.dataService.getProject(projectPath).toPromise();

      let save: boolean = false;

      if (askSave) {
        if (!projectToCopy.saved) {
          // #263 requires a save before close message
          const res = await MessageDlgComponent.showDlg(this.dialog, 'Save project', 'Save project "' + projectToCopy.projectName + '" before closing?');

          switch (res) {
            case 'yes':
              save = true;
              break;
            case 'no':
              save = false;
              break;
            case '':
              return; // interrupt activation
          }
        }
      }

      await this.dataService.closeProject(projectToCopy.projectPath, save, this.application).toPromise();

      // Then open as template:
      const newTemplateProject = await this.dataService.openProjectAsTemplate(projectPath, projectNewPath, doThrow).toPromise();

      // The project is now loaded in backend
      // Activate new project by creating a new project object
      // Project object should possibly be returned in the openProjectAsTemplate call (need to be fixed in backend)
      //const newTemplateProject: Project = { projectPath: newProjectPath, projectName };

      // Activate the new project:
      await this.activateProject(newTemplateProject, askSave);
    } finally {
      this.appStatus = null;
    }
  }

  /**
   * Activate project in gui - at the moment only one project is listed
   */
  async activateProject(project: Project, askSave: boolean) {
    if (project != null && project.projectPath == 'NA') {
      project = null; // openProject returns NA when project is renamed or moved.
    }

    // Close currently open project:
    if (this.selectedProject != null) {
      let save: boolean = false;

      if (askSave) {
        if (!this.selectedProject.saved) {
          // #263 requires a save before close message
          const res = await MessageDlgComponent.showDlg(this.dialog, 'Save project', 'Save project "' + this.selectedProject.projectName + '" before closing?');

          switch (res) {
            case 'yes':
              save = true;
              break;
            case 'no':
              save = false;
              break;
            case '':
              return; // interrupt activation
          }
        }
      }

      if (project == null || project.projectPath != this.selectedProject.projectPath) {
        await this.dataService.closeProject(this.selectedProject.projectPath, save, this.application).toPromise();
      }
    }

    await this.dataService.updateActiveProject(project != null ? project.projectPath : '').toPromise();
    await this.dataService.updateActiveProjectSavedStatus(project != null ? project.saved : true).toPromise();

    this.projects = project != null && Object.keys(project).length > 0 ? [project] : [];
    if (project != null) {
      const line = '-------------------------------------------------------------------------';
      this.dataService.log.push(new UserLogEntry(UserLogType.MESSAGE, '\n\n' + line + '\nOpen project: ' + project.projectName + ' (' + project.projectPath + ')\n' + line));
    }

    //this.processes = null;       // triggered by selected model
    //this.selectedProcessId = null; // -> triggered by selection in gui or setProcesses
    //this.processProperties = null; // triggered by selected processid
    this.activeProcessId = null; // triggered by user run service, setprocesspropertyvalue or project selection
    this.iaMode = 'reset'; // triggered by active process id
    this.runFailedProcessId = null; // triggered by run service or active process id
    this.runningProcessId = null; // current running process
    this.m_isResetting = false; // current reset flag.
    this.outputElements = []; // clear output tables
  }

  /***
  Returns:
    true: undefined, null, "", [], {}
    false: true, false, 1, 0, -1, "foo", [1, 2, 3], { foo: 1 }
  */
  isEmpty(value): boolean {
    return (
      // null or undefined
      value == null ||
      // has length and it's zero
      (value.hasOwnProperty('length') && value.length === 0) ||
      // is an Object and has no keys
      (value.constructor === Object && Object.keys(value).length === 0)
    );
  }

  public getProcessIdx(process: Process): number {
    return this.processes != null ? this.processes.findIndex(p => p === process) : null;
  }

  public getProcessIdxById(id: string): number {
    return this.processes != null ? this.processes.findIndex(p => p.processID === id) : null;
  }

  public getProcessIdxByProcessesAndId(processes: Process[], id: string): number {
    return this.processes != null && id != null ? processes.findIndex(p => p.processID === id) : null;
  }

  public getActiveProcess(): Process {
    return this.getProcessById(this.activeProcessId);
  }

  public getRunFailedProcess(): Process {
    return this.getProcessById(this.runFailedProcessId);
  }

  public getRunningProcess(): Process {
    return this.getProcessById(this.runningProcessId);
  }

  public get isResetting(): boolean {
    return this.m_isResetting;
  }

  public set isResetting(value: boolean) {
    this.m_isResetting = value;
  }

  public getActiveProcessIdx(): number {
    return this.getProcessIdxByProcessesAndId(this.processes, this.activeProcessId);
  }

  public getSelectedProcessIdx(): number {
    return this.processes != null && this.selectedProcess != null ? this.getProcessIdxByProcessesAndId(this.processes, this.selectedProcessId) : null;
  }

  public getActiveProcessIdxByProcesses(processes: Process[]): number {
    return this.getProcessIdxByProcessesAndId(processes, this.activeProcessId);
  }

  /* Determine if a process is run, used to draw blue badges in the template on the process list */
  /*isRun(process: Process) {
    return this.getProcessIdx(process) <= this.getActiveProcessIdx();
  }*/

  getProcessById(processId: string): Process {
    return this.processes != null ? this.processes.find(p => p.processID === processId) : null;
  }

  /*getProcess(idx: number): Process {
    var p: Process = this.processes[idx];
    if (p == null) {
      throw "getProcess(idx) called with idx=" + idx;
    }
    return this.processes[idx];
  }*/
  get activeProcessId(): string {
    let res = this.m_activeProcess != null ? this.m_activeProcess.processID : null;

    if (res === 'NA') {
      // NA maps to null in gui
      res = null;
    }

    return res;
  }

  set activeProcessId(processId: string) {
    if (this.m_activeProcess != null) {
      this.m_activeProcess.processID = processId;
    }
  }

  get activeProcess() {
    return this.m_activeProcess;
  }

  set activeProcess(activeProcess: ActiveProcess) {
    this.m_activeProcess = activeProcess;
    if (activeProcess != null) {
      console.log('> ' + 'ActiveProcessId: ' + activeProcess.processID);
      this.m_processSubject.next(SubjectAction.of('activate', activeProcess.processID)); // propagate activation of process id
    }
  }

  handleAPI<T>(res: any): T {
    if (res != null && this.selectedProject != null) {
      if (res.processTable !== undefined) {
        this.processes = res.processTable;
      }

      if (res.saved !== undefined) {
        if (this.selectedProject.saved !== res.saved) {
          this.selectedProject.saved = res.saved;
          this.dataService.updateActiveProjectSavedStatus(this.selectedProject.saved).toPromise();
        }
      }

      if (res.activeProcess !== undefined) {
        this.activeProcess = res.activeProcess;
      }

      if (res.propertySheet !== undefined) {
        this.processProperties.propertySheet = res.propertySheet;
      }

      if (res.updateHelp !== undefined) {
        this.updateHelp();
      }
    }

    return res;
  }

  stopR() {
    const { modelName } = this.selectedModel;
    this.dataService.stopR({ modelName }).toPromise();
  }

  /**
   * A process is dirty if the process is active and the active process is dirty.
   * @param p
   */
  isProcessDirty(p: Process) {
    if (p != null && this.activeProcess != null) {
      return p.processID == this.activeProcess.processID && this.activeProcess.processDirty;
    }
  }

  async resolveElementOutput(oe: OutputElement) {
    switch (oe.element.elementType) {
      case 'geojson':
      case 'table': {
        let tableOutput: ProcessTableOutput = null;

        tableOutput = await this.dataService.getProcessTableOutput(this.selectedProject.projectPath, this.selectedModel.modelName, oe.processId, oe.element.elementName).toPromise();
        oe.output = tableOutput.data;
        break;
      }

      case 'plot':
        {
          const path: string = await this.dataService.getProcessPlotOutput(this.selectedProject.projectPath, this.selectedModel.modelName, oe.processId, oe.element.elementName).toPromise();

          const base64: any = JSON.parse(await this.dataService.readFileAsBase64(path).toPromise());

          oe.output = base64;
        }

        break;
    }
  }

  set appStatus(status: string) {
    this.m_appStatus = status;
    (async () => {
      this.m_appStatusIsUpdating = true;
      await new Promise(f => setTimeout(f, 500));
      this.m_appStatusIsUpdating = false;
    })();
  }

  get appStatus(): string {
    return this.m_appStatus;
  }

  get appStatusIsUpdating(): boolean {
    return this.m_appStatusIsUpdating;
  }
}

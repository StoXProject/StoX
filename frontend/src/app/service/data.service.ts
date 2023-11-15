import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { MapInfo } from '../data/MapInfo';
import { Process } from '../data/process';
import { ProcessGeoJsonOutput, ProcessProperties, ProcessTableOutput } from '../data/ProcessProperties';
import { Project } from '../data/project';
import { ActiveProcess, ActiveProcessResult, ProcessOutputElement, ProcessTableResult, PSUResult, RunProcessesResult, RunResult } from '../data/runresult';
import { UserLogEntry } from '../data/userlogentry';
import { UserLogType } from '../enum/enums';
import { RuleSet } from '../querybuilder/module/query-builder.interfaces';

@Injectable()
export class DataService {
  log: UserLogEntry[] = []; // user log
  private m_logSubject = new Subject<string>();
  public get logSubject() {
    return this.m_logSubject;
  }

  private geojsonUrl = '/api/geojson';
  private jsonfromfile = '/api/jsonfromfile';

  constructor(private httpClient: HttpClient) {
    console.log('> ' + 'Initializing http service');
  }

  isRstoxInstalled(): Observable<any> {
    const formData = new FormData();

    formData.set('expr', '"Rstox" %in% rownames(installed.packages())');

    return this.httpClient.post('http://localhost:5307/ocpu/library/base/R/eval/json', formData).pipe(
      tap(
        _ => _,
        error => this.handleError(error)
      )
    );
  }

  installRstox(): Observable<any> {
    const formData = new FormData();

    formData.set('pkgs', '"ftp://ftp.imr.no/StoX/Download/Rstox/Rstox_1.11.tar.gz"');
    formData.set('repos', null);

    return this.httpClient.post('http://localhost:5307/ocpu/library/utils/R/install.packages/json', formData, { responseType: 'text' }).pipe(
      tap(
        _ => _,
        error => this.handleError(error)
      )
    );
  }

  removeRstox(): Observable<any> {
    const formData = new FormData();

    formData.set('pkgs', '"Rstox"');

    return this.httpClient.post('http://localhost:5307/ocpu/library/utils/R/remove.packages/json', formData, { responseType: 'text' }).pipe(
      tap(
        _ => _,
        error => this.handleError(error)
      )
    );
  }

  getAvailableTemplates(): Observable<any> {
    return this.runFunction('getAvailableTemplatesDescriptions', {});
  }

  createProject(projectPath: string, /*templateName: string, */ application: string): Observable<any> {
    return this.runFunctionThrowFramework(
      'createProject',
      {
        projectPath,
        ow: false,
        showWarnings: true, // DEBUGGING
        open: true,
        Application: application,
      },
      true
    );
  }

  getModelInfo(): Observable<any> {
    return this.runFunction('getModelInfo', {});
  }

  getProcessTable(projectPath: string, modelName: string): Observable<Process[]> {
    return this.runFunction('getProcessTable', {
      projectPath,
      modelName,
    });
  }

  openProject(projectPath: string, dothrow: boolean, force: boolean): Observable<Project> {
    return this.runFunctionThrowFramework(
      'openProject',
      {
        projectPath,
        showWarnings: true, // DEBUGGING
        force,
        reset: false,
        verbose: true,
      },
      dothrow
    );
  }

  isSaved(projectPath: string): Observable<boolean> {
    return this.runFunctionThrowFramework(
      'isSaved',
      {
        projectPath,
      },
      true
    );
  }

  saveProject(projectPath: string, application: string): Observable<Project> {
    return this.runFunctionThrowFramework(
      'saveProject',
      {
        projectPath,
        Application: application,
      },
      true
    );
  }

  saveAsProject(projectPath: string, newProjectPath: string, application: string): Observable<Project> {
    return this.runFunctionThrowFramework(
      'saveAsProject',
      {
        projectPath,
        newProjectPath,
        Application: application,
      },
      true
    );
  }

  openProjectAsTemplate(projectPath: string, newProjectPath: string, dothrow: boolean): Observable<Project> {
    return this.runFunctionThrowFramework(
      'openProjectAsTemplate',
      {
        projectPath,
        newProjectPath,
      },
      dothrow
    );
  }

  closeProject(projectPath: string, save: boolean, application: string): Observable<any> {
    return this.runFunction('closeProject', {
      projectPath,
      save,
      Application: application,
    });
  }

  getProcessPropertySheet(projectPath: string, modelName: string, processID: string): Observable<ProcessProperties> {
    return this.runProcessFunc<ProcessProperties>('getProcessPropertySheet', projectPath, modelName, processID);
  }

  getActiveProcess(projectPath: string, modelName: string): Observable<ActiveProcess> {
    return this.runFunction('getActiveProcess', {
      projectPath,
      modelName,
    });
  }

  getFunctionHelpAsHtml(projectPath: string, modelName: string, processID: string): Observable<string> {
    return this.runProcessFunc<string>('getFunctionHelpAsHtml', projectPath, modelName, processID);
  }

  isProject(projectPath: string): Observable<boolean> {
    return this.runFunction('isProject', {
      projectPath,
    });
  }

  isOpenProject(projectPath: string): Observable<boolean> {
    return this.runFunction('isOpenProject', {
      projectPath,
    });
  }

  setProcessPropertyValue(groupName: string, name: string, value: any, projectPath: string, modelName: string, processID: string): Observable<any> {
    return this.runFunction('setProcessPropertyValue', {
      groupName,
      name,
      value,
      projectPath,
      modelName,
      processID,
    });
  }

  getObjectHelpAsHtml(packageName: string, objectName: string): Observable<string> {
    return this.runFunction('getObjectHelpAsHtml', {
      packageName,
      objectName,
    });
  }

  expression2list(expr: string): Observable<RuleSet> {
    return this.runFunction('expression2list', {
      expr,
    });
  }

  json2expression(query: RuleSet): Observable<string> {
    return this.runFunction('json2expression', {
      json: JSON.stringify(query),
    });
  }

  getParameterTableInfo(projectPath: string, modelName: string, processID: string, format: string): Observable<any> {
    return this.runFunction('getParameterTableInfo', {
      projectPath,
      modelName,
      processID,
      format,
    });
  }

  getParameterVectorInfo(projectPath: string, modelName: string, processID: string, format: string): Observable<any> {
    return this.runFunction('getParameterVectorInfo', {
      projectPath,
      modelName,
      processID,
      format,
    });
  }

  static readonly LOCALHOST: string = 'localhost';
  static readonly NODE_PORT: number = 3000;
  static readonly OCPU_PORT: number = 5307;

  public static getURL(host: string, port: number, api: string) {
    return 'http://' + host + ':' + port + '/' + api;
  }
  public post(host: string, port: number, api: string, body: any, responseType: string = 'text'): Observable<HttpResponse<any>> {
    // console.log('> ' + api + ' post ' + JSON.stringify(body));
    return this.httpClient
      .post(DataService.getURL(host, port, api), body, {
        observe: 'response', // 'body' or 'response'
        headers: new HttpHeaders({
          'Content-Type': 'text/plain', //'text/plain; charset=utf-8'
        }),
        responseType: <any>responseType,
      })
      .pipe(
        tap(
          _ => _,
          error => this.handleError(error)
        )
      );
  }

  public get(host: string, port: number, api: string, responseType: string = 'text'): Observable<HttpResponse<any>> {
    return this.httpClient.get(DataService.getURL(host, port, api), { observe: 'response', responseType: <any>responseType }).pipe(
      tap(
        _ => _,
        error => this.handleError(error)
      )
    );
  }

  public getBody(host: string, port: number, api: string, responseType: string = 'text'): Observable<any> {
    return this.get(host, port, api, responseType).pipe(map(_ => _.body));
  }

  public postLocalNode(api: string, body: any, responseType: string = 'text'): Observable<HttpResponse<any>> {
    return this.post(DataService.LOCALHOST, DataService.NODE_PORT, api, body, responseType).pipe(map(_ => _.body));
  }

  public getLocalNode(api: string, responseType: string = 'text'): Observable<HttpResponse<any>> {
    return this.get(DataService.LOCALHOST, DataService.NODE_PORT, api, responseType).pipe(map(_ => _.body));
  }

  public postLocalOCPU(rPackage: string, rFunctionName: string, body: any, responseType: string = 'text', parseJSON: boolean = false, endPoint: string = 'json'): Observable<HttpResponse<any>> {
    return this.post(DataService.LOCALHOST, DataService.OCPU_PORT, 'ocpu/library/' + rPackage + '/R/' + rFunctionName + '/' + endPoint + '?auto_unbox=true&na=string', body, responseType); // maps response to unparsed JSON
  }

  public postLocalOCPUBody(rPackage: string, rFunctionName: string, body: any, responseType: string = 'text', parseJSON: boolean = false, endPoint: string = 'json'): Observable<any> {
    return this.postLocalOCPU(rPackage, rFunctionName, body, responseType, parseJSON, endPoint)
      .pipe(map(_ => _.body))
      .pipe(map(_ => (parseJSON ? (endPoint == 'json' ? JSON.parse(_) : _) : _))); // maps response to unparsed JSON
  }

  private handleError(error: HttpErrorResponse) {
    console.log('> ' + 'Error.message : ' + error.message);
    console.log('> ' + 'Error.name : ' + error.name);
    console.log('> ' + 'Error.error : ' + error.error);
    console.log('> ' + 'Error.status : ' + error.status);
    console.log('> ' + 'Error.statusText : ' + error.statusText);
    console.log('> ' + 'Error.url : ' + error.url);
    console.log('> ' + 'Error.ok : ' + error.ok);
  }

  getgeojson(): Observable<string> {
    return this.postLocalOCPUBody('tests', 'test_geojson_polygon', {}, 'text', true);
  }

  getjsonfromfile(): Observable<string> {
    return this.postLocalOCPUBody('tests', 'test_geojson_points', {}, 'text', true);
  }
  runFunction(what: string, argsobj: any): Observable<any> {
    return this.runFunctionThrowFramework(what, argsobj, false);
  }

  runFunctionThrowFramework(what: string, argsobj: any, dothrow: boolean): Observable<any> {
    return this.runFunctionThrow(what, argsobj, dothrow, 'RstoxFramework');
  }

  /** runFunction API wrapper - includes logging of user message/warning/errors from R*/
  runFunctionThrow(what: string, argsobj: any, dothrow: boolean, pkg: string): Observable<any> {
    // runFunction wraps a doCall with what/args and exception handling that returns a list.
    const args: any = JSON.stringify(argsobj);

    /*const body = new FormData();
    body.set('what', "'" + what + "'");
    body.set('args', args);
    body.set('package', "'" + pkg + "'");
    */
    const rVal = (o: any) => {
      if (o != null) {
        switch (typeof o) {
          case 'string':
            return JSON.stringify(o);
          case 'boolean':
            return o ? 'TRUE' : 'FALSE';
          case 'object': {
            if (Array.isArray(o)) {
              return '(' + o.map(k => rVal(k)).join() + ')';
            }
          }

          default:
            return o;
        }
      }

      return o;
    };

    console.log(
      '> ' +
        pkg +
        '::' +
        what +
        '(' +
        Object.keys(argsobj)
          .map(k => k + '=' + rVal(argsobj[k]))
          .join() +
        ')'
    );

    // console.log("> " + "RstoxFramework::runFunction(package='" + pkg + "', what='" + what + "', args=" + JSON.stringify(args) + ")")
    return <any>this.callR({ what, args, package: pkg }).pipe(
      map(res => {
        let r2: RunResult = null;

        try {
          r2 = JSON.parse(res.body !== undefined ? res.body : res);
        } catch (e) {
          // If result is not exception, it is an error with its message in the body
          r2 = new RunResult();
          r2.error = [res];
        }

        if (dothrow) {
          if (r2.error.length > 0) {
            throw r2.error[0];
          }
        } else {
          r2.message?.forEach(elm => {
            this.log.push(new UserLogEntry(UserLogType.MESSAGE, elm));
            this.m_logSubject.next('log-message');
          });
          r2.warning?.forEach(elm => {
            this.log.push(new UserLogEntry(UserLogType.WARNING, elm + '\n'));
            this.m_logSubject.next('log-warning');
          });
          r2.error?.forEach(elm => {
            this.log.push(new UserLogEntry(UserLogType.ERROR, elm + '\n'));
            this.m_logSubject.next('log-error');
          });
        }

        return r2.value;
      })
    );
  }

  runProcesses(projectPath: string, modelName: string, startProcess: number, endProcess: number): Observable<RunProcessesResult> {
    return this.runFunction('runProcesses', {
      projectPath,
      modelName,
      startProcess,
      endProcess,
      save: false,
      'msg.GUI': true,
    });
  }

  resetModel(projectPath: string, modelName: string): Observable<ProcessTableResult> {
    return this.runFunction('resetModel', {
      projectPath,
      modelName,
      returnProcessTable: true,
    });
  }

  runProcessFunc<R>(func: string, projectPath: string, modelName: string, processID: string): Observable<R> {
    return this.runFunction(func, {
      projectPath,
      modelName,
      processID,
    });
  }

  removeProcess(projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('removeProcess', {
      projectPath,
      modelName,
      processID,
    });
  }

  duplicateProcess(projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('duplicateProcess', {
      projectPath,
      modelName,
      processID,
    });
  }

  addProcess(projectPath: string, modelName: string, value: any): Observable<ProcessTableResult> {
    return this.runFunction('addProcess', {
      projectPath,
      modelName,
      value,
    });
  }

  getProcessOutputElements(projectPath: string, modelName: string, processID: string): Observable<ProcessOutputElement[]> {
    return this.runProcessFunc<ProcessOutputElement[]>('getProcessOutputElements', projectPath, modelName, processID);
  }

  hasFileOutput(projectPath: string, modelName: string, processID: string): Observable<boolean> {
    return this.runProcessFunc<boolean>('hasFileOutput', projectPath, modelName, processID);
  }

  getProcessOutputFolder(projectPath: string, modelName: string, processID: string): Observable<string> {
    return this.runFunction('getProcessOutputFolder', {
      projectPath,
      modelName,
      processID,
      type: 'output',
    });
  }

  getFilterOptionsAll(projectPath: string, modelName: string, processID: string, includeNumeric: boolean): Observable<any> {
    return this.runFunction('getFilterOptionsAll', {
      projectPath,
      modelName,
      processID,
      'include.numeric': includeNumeric,
    });
  }

  getFilterTableNames(projectPath: string, modelName: string, processID: string): Observable<string[]> {
    return this.runFunction('getFilterTableNames', {
      projectPath,
      modelName,
      processID,
    });
  }

  getFilterOptionsOneTable(projectPath: string, modelName: string, processID: string, tableName: string, includeNumeric: boolean): Observable<any> {
    return this.runFunction('getFilterOptionsOneTable', {
      projectPath,
      modelName,
      processID,
      tableName,
      'include.numeric': includeNumeric,
    });
  }

  /*getFilterOptions(projectPath: string, modelName: string, processID: string, tableName: string, fieldName: string, includeNumeric: Boolean): Observable<any> {
    return this.runFunction('getFilterOptions', {
      "projectPath": projectPath,
      "modelName": modelName,
      "processID": processID,
      "tableName": tableName,
      "fieldName": fieldName,
      "include.numeric": includeNumeric
    });
  }
  */

  getInteractiveMode(projectPath: string, modelName: string, processID: string): Observable<string> {
    return this.runProcessFunc<string>('getInteractiveMode', projectPath, modelName, processID);
  }

  getMapData(projectPath: string, modelName: string, processID: string): Observable<any> {
    return this.runProcessFunc<any>('getMapData', projectPath, modelName, processID);
  }

  getInteractiveData(projectPath: string, modelName: string, processID: string): Observable<any> {
    return this.runProcessFunc<any>('getInteractiveData', projectPath, modelName, processID);
  }

  modifyStratum(stratum: any, projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('modifyStratum', {
      stratum,
      projectPath,
      modelName,
      processID,
    });
  }

  addStratum(stratum: any, projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('addStratum', {
      stratum,
      projectPath,
      modelName,
      processID,
    });
  }

  addAcousticPSU(stratum: string, projectPath: string, modelName: string, processID: string): Observable<PSUResult> {
    return this.runFunction('addAcousticPSU', {
      Stratum: stratum,
      projectPath,
      modelName,
      processID,
    });
  }

  addHaulToAssignment(projectPath: string, modelName: string, processID: string, stratum: string, psu: string, haul: string[]): Observable<ActiveProcessResult> {
    return this.runFunction('addHaulToAssignment', {
      Stratum: stratum,
      PSU: psu,
      Haul: haul,
      projectPath,
      modelName,
      processID,
    });
  }

  removeHaulFromAssignment(projectPath: string, modelName: string, processID: string, stratum: string, psu: string, haul: string[]): Observable<ActiveProcessResult> {
    return this.runFunction('removeHaulFromAssignment', {
      Stratum: stratum,
      PSU: psu,
      Haul: haul,
      projectPath,
      modelName,
      processID,
    });
  }

  getProcessTableOutput(projectPath: string, modelName: string, processID: string, tableName: string): Observable<ProcessTableOutput> {
    return this.runFunction('getProcessTableOutput', {
      projectPath,
      modelName,
      processID,
      tableName,
      flatten: true,
      pretty: true,
      linesPerPage: 200000,
      pageindex: 1,
      columnSeparator: ' ',
      na: '-',
      drop: true,
    });
  }

  getProcessGeoJsonOutput(projectPath: string, modelName: string, processID: string, geoJsonName: string): Observable<ProcessGeoJsonOutput> {
    return this.runFunction('getProcessGeoJsonOutput', {
      projectPath,
      modelName,
      processID,
      geoJsonName,
      pretty: true,
      splitGeoJson: false,
    });
  }

  getProcessPlotOutput(projectPath: string, modelName: string, processID: string, plotName: string): Observable<string> {
    return this.runFunction('getProcessPlotOutput', {
      projectPath,
      modelName,
      processID,
      plotName,
    });
  }

  addEDSU(psu: string, edsu: string[], projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('addEDSU', {
      PSU: psu,
      EDSU: edsu,
      projectPath,
      modelName,
      processID,
    });
  }

  rearrangeProcesses(projectPath: string, modelName: string, processID: string, afterProcessID: string): Observable<ProcessTableResult> {
    return this.runFunction('rearrangeProcesses', {
      projectPath,
      modelName,
      processID,
      afterProcessID,
    });
  }

  removeEDSU(edsu: string[], projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('removeEDSU', {
      EDSU: edsu,
      projectPath,
      modelName,
      processID,
    });
  }

  removeStratum(stratumName: string, projectPath: string, modelName: string, processID: string): Observable<ActiveProcessResult> {
    return this.runFunction('removeStratum', {
      stratumName,
      projectPath,
      modelName,
      processID,
    });
  }

  removeAcousticPSU(PSU: string[], projectPath: string, modelName: string, processID: string): Observable<ActiveProcessResult> {
    return this.runFunction('removeAcousticPSU', {
      PSU,
      projectPath,
      modelName,
      processID,
    });
  }

  setRPath(rpath: string): Observable<any> {
    console.log('> ' + 'setRPathsetRPath. path = ', +rpath);

    return this.postLocalNode('rpath', rpath);
  }

  setMapInfo(mapInfo: MapInfo): Observable<any> {
    return this.postLocalNode('mapInfo', JSON.stringify(mapInfo));
  }

  callR(j: any): Observable<any> {
    //console.log("> " + "RstoxFramework::runFunction.JSON(" + JSON.stringify(JSON.stringify(j)) + ")");
    return this.postLocalNode('callR', j);
  }

  browse(defaultpath: string): Observable<any> {
    return this.postLocalNode('browse', defaultpath);
  }

  showinfolder(path: string): Observable<any> {
    return this.postLocalNode('showinfolder', path);
  }

  browsePath(options: any): Observable<any> {
    return this.postLocalNode('browsePath', options);
  }

  fileExists(filePath: string): Observable<any> {
    return this.postLocalNode('fileExists', filePath);
  }

  readFileAsBase64(filePath: string): Observable<any> {
    return this.postLocalNode('readFileAsBase64', filePath);
  }

  makeDirectory(dirPath: string): Observable<any> {
    return this.postLocalNode('makeDirectory', dirPath);
  }

  openUrl(url: string): Observable<any> {
    return this.postLocalNode('openUrl', url);
  }

  stoxHome(): Observable<any> {
    return this.postLocalNode('stoxhome', {});
  }

  toggleDevTools(): Observable<any> {
    return this.postLocalNode('toggledevtools', {});
  }
  isdesktop(): Observable<any> {
    return this.postLocalNode('isdesktop', {});
  }

  exit(): Observable<any> {
    return this.postLocalNode('exit', {});
  }

  installRstoxFramework(): Observable<any> {
    return this.postLocalNode('installRstoxFramework', {});
  }

  public getRPath(): Observable<any> {
    return this.getLocalNode('rpath');
  }

  public getMapInfo(): Observable<any> {
    return this.getLocalNode('mapInfo');
  }

  public getStoxVersion(): Observable<any> {
    return this.getLocalNode('stoxversion');
  }

  public getRstoxPackageVersions(): Observable<any> {
    return this.getLocalNode('getRstoxPackageVersions');
  }

  public getIsOfficialStoXVersion(): Observable<any> {
    return this.getLocalNode('getIsOfficialStoXVersion');
  }

  public getProjectRootPath(): Observable<any> {
    return this.getLocalNode('projectrootpath');
  }

  public readActiveProject(): Observable<any> {
    return this.getLocalNode('readactiveproject');
  }

  public rAvailable(): Observable<any> {
    return this.getLocalNode('rAvailable');
  }

  /*public rstoxFrameworkAvailable(): Observable<any> {
    return this.getLocalNode('rstoxFrameworkAvailable');
  }*/

  public updateActiveProject(projectPath: string): Observable<any> {
    return this.postLocalNode('updateactiveproject', projectPath);
  }

  public updateActiveProjectSavedStatus(saved: boolean): Observable<any> {
    return this.postLocalNode('updateactiveprojectsavedstatus', saved);
  }

  public updateProjectRootPath(projectRootPath: string): Observable<any> {
    return this.postLocalNode('updateprojectrootpath', projectRootPath);
  }
}

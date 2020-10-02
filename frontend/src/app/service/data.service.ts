import { Injectable, ɵCompiler_compileModuleAndAllComponentsAsync__POST_R3__ } from '@angular/core';

import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable, Subject, of, interval, merge } from 'rxjs';
import { Template } from '../data/Template';
import { catchError, map, tap, mapTo } from 'rxjs/operators';
import { UserLogEntry } from '../data/userlogentry';
import { ProcessOutput } from '../data/processoutput';
import { UserLogType } from '../enum/enums';
import { RunResult, RunProcessesResult, ProcessTableResult, PSUResult, ActiveProcessResult, ActiveProcess } from '../data/runresult';
import { AcousticPSU } from '../data/processdata';
import { RuleSet, QueryBuilderConfig } from '../querybuilder/module/query-builder.interfaces';
import { ProcessProperties } from '../data/ProcessProperties';
import { Process } from '../data/process';
import { Project } from '../data/project';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  log: UserLogEntry[] = []; // user log.
  private m_logSubject = new Subject<string>();
  public get logSubject() { return this.m_logSubject; }

  // private featuresUrl = '/api/features';
  private geojsonUrl = '/api/geojson';
  private jsonfromfile = '/api/jsonfromfile';

  constructor(private httpClient: HttpClient) {
  }


  isRstoxInstalled(): Observable<any> {
    const formData = new FormData();
    formData.set('expr', '"Rstox" %in% rownames(installed.packages())');
    return this.httpClient.post("http://localhost:5307/ocpu/library/base/R/eval/json", formData).pipe(tap(_ => _, error => this.handleError(error)));
  }

  installRstox(): Observable<any> {
    const formData = new FormData();
    formData.set('pkgs', '"ftp://ftp.imr.no/StoX/Download/Rstox/Rstox_1.11.tar.gz"');
    formData.set('repos', null);
    return this.httpClient.post("http://localhost:5307/ocpu/library/utils/R/install.packages/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  removeRstox(): Observable<any> {
    const formData = new FormData();
    formData.set('pkgs', '"Rstox"');
    return this.httpClient.post("http://localhost:5307/ocpu/library/utils/R/remove.packages/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }



  getAvailableTemplates(): Observable<any> {
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxAPI/R/getAvailableTemplatesDescriptions/json", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunction('getAvailableTemplatesDescriptions', {});
  }

  createProject(projectPath: string, templateName: string): Observable<any> {
    return this.runFunctionThrowFramework('createProject', {
      "projectPath": projectPath,
      "template": templateName,
      "ow": false,
      "showWarnings": false,
      "open": true
    }, true);
  }

  getModelInfo(): Observable<any> {
    return this.runFunction('getModelInfo', {});
  }

  getProcessTable(projectPath: string, modelName: string): Observable<Process[]> {

    return this.runFunction('getProcessTable', {
      "projectPath": projectPath,
      "modelName": modelName
    });
  }

  openProject(projectPath: string, dothrow: boolean, force: boolean): Observable<Project> {

    return this.runFunctionThrowFramework('openProject', {
      "projectPath": projectPath,
      "showWarnings": false,
      "force": force,
      "reset": false
    }, dothrow);
  }

  isSaved(projectPath: string): Observable<boolean> {

    return this.runFunctionThrowFramework('isSaved', {
      "projectPath": projectPath
    }, true);
  }

  getRstoxAPIVersion(): Observable<string> {
    return this.runFunctionThrowAPI('getRstoxAPIVersion', {}, false);
  }

  saveProject(projectPath: string): Observable<Project> {

    return this.runFunctionThrowFramework('saveProject', {
      "projectPath": projectPath
    }, true);
  }

  saveAsProject(projectPath: string, newProjectPath: string /*, ow: Boolean */): Observable<Project> {

    return this.runFunctionThrowFramework('saveAsProject', {
      "projectPath": projectPath,
      "newProjectPath": newProjectPath
      /*, "ow": ow */
    }, true);
  }


  closeProject(projectPath: string, save: Boolean): Observable<any> {

    return this.runFunction('closeProject', {
      "projectPath": projectPath,
      "save": save
    });
  }

  getProcessPropertySheet(projectPath: string, modelName: string, processID: string): Observable<ProcessProperties> {
    return this.runProcessFunc<ProcessProperties>("getProcessPropertySheet", projectPath, modelName, processID);
  }

  getActiveProcess(projectPath: string, modelName: string): Observable<ActiveProcess> {
    return this.runFunction('getActiveProcess', {
      "projectPath": projectPath, "modelName": modelName
    });
  }

  getFunctionHelpAsHtml(projectPath: string, modelName: string, processID: string): Observable<string> {
    return this.runProcessFunc<string>("getFunctionHelpAsHtml", projectPath, modelName, processID);
  }

  isProject(projectPath: string): Observable<boolean> {
    return this.runFunction('isProject', {
      "projectPath": projectPath
    });
  }

  isOpenProject(projectPath: string): Observable<boolean> {
    return this.runFunction('isOpenProject', {
      "projectPath": projectPath
    });
  }


  setProcessPropertyValue(groupName: string, name: string, value: any, projectPath: string, modelName: string, processID: string): Observable<any> {
    return this.runFunction('setProcessPropertyValue', {
      "groupName": groupName,
      "name": name,
      "value": value,
      "projectPath": projectPath,
      "modelName": modelName,
      "processID": processID
    });
  }

  getObjectHelpAsHtml(packageName: string, objectName: string): Observable<string> {
    return this.runFunction('getObjectHelpAsHtml', {
      "packageName": packageName,
      "objectName": objectName
    });
  }

  getFilterOptions(projectPath: string, modelName: string, processID: string, tableName: string): Observable<QueryBuilderConfig> {
    return this.runFunctionThrowFramework('getFilterOptions', {
      "projectPath": projectPath,
      "modelName": modelName,
      "processID": processID,
      "tableName": tableName
    }, true);
  }

  expression2list(expr: string): Observable<RuleSet> {
    return this.runFunction('expression2list', {
      "expr": expr
    });
  }

  json2expression(query: RuleSet): Observable<string> {
    return this.runFunction('json2expression', {
      "json": JSON.stringify(query)
    });
  }

  getParameterTableInfo(projectPath: string, modelName: string, processID: string, format: string): Observable<any> {
    return this.runFunction('getParameterTableInfo', {
      "projectPath": projectPath,
      "modelName": modelName,
      "processID": processID,
      "format": format
    });
  }


  static readonly LOCALHOST: string = 'localhost';
  static readonly NODE_PORT: number = 3000;
  static readonly OCPU_PORT: number = 5307;

  public static getURL(host: string, port: number, api: string) {
    return "http://" + host + ":" + port + "/" + api;
  }
  public post(host: string, port: number, api: string, body: any, responseType: string = 'text'): Observable<HttpResponse<any>> {
    //console.log(api + " post " + JSON.stringify(body));
    return this.httpClient.post(DataService.getURL(host, port, api), body,
      {
        observe: 'response', // 'body' or 'response'
        headers: new HttpHeaders({
          'Content-Type': 'text/plain'//'text/plain; charset=utf-8'
        }),
        responseType: <any>responseType
      })
      .pipe(tap(_ => _, error => this.handleError(error)));
  }

  public get(host: string, port: number, api: string, responseType: string = 'text'): Observable<HttpResponse<any>> {
    return this.httpClient
      .get(DataService.getURL(host, port, api), { observe: 'response', responseType: <any>responseType })
      .pipe(tap(_ => _, error => this.handleError(error)))
  }

  public getBody(host: string, port: number, api: string, responseType: string = 'text'): Observable<any> {
    return this.get(host, port, api, responseType)
      .pipe(map(_ => _.body));
  }

  public postLocalNode(api: string, body: any, responseType: string = 'text'): Observable<HttpResponse<any>> {
    return this.post(DataService.LOCALHOST, DataService.NODE_PORT, api, body, responseType)
      .pipe(map(_ => _.body));
  }

  public getLocalNode(api: string, responseType: string = 'text'): Observable<HttpResponse<any>> {
    return this.get(DataService.LOCALHOST, DataService.NODE_PORT, api, responseType)
      .pipe(map(_ => _.body));
  }

  public postLocalOCPU(rPackage: string, rFunctionName: string, body: any, responseType: string = 'text',
    parseJSON: boolean = false, endPoint: string = 'json'): Observable<HttpResponse<any>> {
    return this.post(DataService.LOCALHOST, DataService.OCPU_PORT, 'ocpu/library/' + rPackage + '/R/' + rFunctionName
      + "/" + endPoint + "?auto_unbox=true&na=string", body, responseType); // maps response to unparsed JSON
  }

  public postLocalOCPUBody(rPackage: string, rFunctionName: string, body: any, responseType: string = 'text',
    parseJSON: boolean = false, endPoint: string = 'json'): Observable<any> {
    return this.postLocalOCPU(rPackage, rFunctionName, body, responseType, parseJSON, endPoint)
      .pipe(map(_ => _.body))
      .pipe(map(_ => parseJSON ? endPoint == "json" ? JSON.parse(_) : _ : _)); // maps response to unparsed JSON
  }

  private handleError(error: HttpErrorResponse) {
    console.log("Error.message : " + error.message);
    console.log("Error.name : " + error.name);
    console.log("Error.error : " + error.error);
    console.log("Error.status : " + error.status);
    console.log("Error.statusText : " + error.statusText);
    console.log("Error.url : " + error.url);
    console.log("Error.ok : " + error.ok);

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

  runFunctionThrowAPI(what: string, argsobj: any, dothrow: boolean): Observable<any> {
    return this.runFunctionThrow(what, argsobj, dothrow, 'RstoxAPI');
  }
  /** runFunction API wrapper - includes logging of user message/warning/errors from R*/
  runFunctionThrow(what: string, argsobj: any, dothrow: boolean, pkg: string): Observable<any> {
    // runFunction wraps a doCall with what/args and exception handling that returns a list.
    let args: any = JSON.stringify(argsobj);
    /*const body = new FormData();
    body.set('what', "'" + what + "'");
    body.set('args', args);
    body.set('package', "'" + pkg + "'");
    */
    let rVal = (o: any) => {
      if (o != null) {
        switch (typeof o) {
          case 'string': return JSON.stringify(o);
          case 'boolean': return o ? 'TRUE' : 'FALSE'
          default: return o;
        }
      }
      return o;
    }
    console.log(pkg + "::" + what + "(" + Object.keys(argsobj).map(k => k + "=" + rVal(argsobj[k])).join() + ")");
    // console.log("RstoxAPI::runFunction(package='" + pkg + "', what='" + what + "', args=" + JSON.stringify(args) + ")") 
    return <any>this.callR({ what: what, args: args, package: pkg })
      //return <any>this.postLocalOCPU('RstoxAPI', 'runFunction', body, 'text', true, "json")
      .pipe(map(res => {
        let r2: RunResult = JSON.parse(res.body !== undefined ? res.body : res);
        if (dothrow) {
          if (r2.error.length > 0) {
            throw (r2.error[0]);
          }
        } else {
          r2.warning
            .filter(elm => elm.startsWith("StoX: "))
            .map(elm => elm.slice("StoX: ".length))
            .forEach(elm => {
              this.log.push(new UserLogEntry(UserLogType.WARNING, elm));
              this.m_logSubject.next('log-warning');
            });
          r2.error.forEach(elm => {
            this.log.push(new UserLogEntry(UserLogType.ERROR, elm));
            this.m_logSubject.next('log-error');
          });
        }
        return r2.value;
      }));
  }

  runProcesses(projectPath: string, modelName: string, startProcess: number, endProcess: number): Observable<RunProcessesResult> {

    return this.runFunction('runProcesses', {
      "projectPath": projectPath, "modelName": modelName,
      "startProcess": startProcess, "endProcess": endProcess,
      "save": false
    });
  }

  resetModel(projectPath: string, modelName: string): Observable<ProcessTableResult> {
    return this.runFunction('resetModel', {
      "projectPath": projectPath,
      "modelName": modelName,
      "returnProcessTable": true
    });
  }


  runProcessFunc<R>(func: string, projectPath: string, modelName: string, processID: string): Observable<R> {
    return this.runFunction(func, {
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  removeProcess(projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('removeProcess', {
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  addProcess(projectPath: string, modelName: string, value: any): Observable<ProcessTableResult> {
    return this.runFunction('addProcess', {
      "projectPath": projectPath, "modelName": modelName, "value": value
    });
  }

  getProcessOutputTableNames(projectPath: string, modelName: string, processID: string): Observable<string[]> {
    return this.runProcessFunc<string[]>('getProcessOutputTableNames', projectPath, modelName, processID);
  }

  getFilterOptionsAll(projectPath: string, modelName: string, processID: string, includeNumeric: Boolean): Observable<any> {
    return this.runFunction('getFilterOptionsAll', {
      "projectPath": projectPath,
      "modelName": modelName,
      "processID": processID,
      "include.numeric": includeNumeric
    });
  }

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
      "stratum": stratum,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  addStratum(stratum: any, projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('addStratum', {
      "stratum": stratum,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  addAcousticPSU(stratum: string, projectPath: string, modelName: string, processID: string): Observable<PSUResult> {
    return this.runFunction('addAcousticPSU', {
      "Stratum": stratum,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  addHaulToAssignment(projectPath: string, modelName: string, processID: string, stratum: string,
    psu: string, layer: string[], haul: string[]): Observable<ActiveProcessResult> {
    return this.runFunction('addHaulToAssignment', {
      "Stratum": stratum,
      "PSU": psu,
      "Layer": layer,
      "Haul": haul,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  removeHaulFromAssignment(projectPath: string, modelName: string, processID: string, stratum: string,
    psu: string, layer: string[], haul: string[]): Observable<ActiveProcessResult> {
    return this.runFunction('removeHaulFromAssignment', {
      "Stratum": stratum,
      "PSU": psu,
      "Layer": layer,
      "Haul": haul,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  getProcessOutput(projectPath: string, modelName: string, processID: string, tableName: string): Observable<ProcessOutput> {
    return this.runFunction('getProcessOutput', {
      "projectPath": projectPath,
      "modelName": modelName,
      "processID": processID,
      "tableName": tableName,
      "flatten": true,
      "pretty": true,
      "linesPerPage": 200000,
      "pageindex": 1,
      "columnSeparator": " ",
      "na": "-",
      "drop": true
    });

  }

  addEDSU(psu: string, edsu: string[], projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('addEDSU', {
      "PSU": psu, "EDSU": edsu,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  rearrangeProcesses(projectPath: string, modelName: string, processID: string, afterProcessID: string): Observable<ProcessTableResult> {
    return this.runFunction('rearrangeProcesses', {
      "projectPath": projectPath, "modelName": modelName, "processID": processID,
      "afterProcessID": afterProcessID
    });
  }

  removeEDSU(edsu: string[], projectPath: string, modelName: string, processID: string): Observable<ProcessTableResult> {
    return this.runFunction('removeEDSU', {"EDSU": edsu,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  removeStratum(stratumName: string, projectPath: string, modelName: string, processID: string): Observable<ActiveProcessResult> {
    return this.runFunction('removeStratum', {
      "stratumName": stratumName,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  removeAcousticPSU(PSU: string[], projectPath: string, modelName: string, processID: string): Observable<ActiveProcessResult> {
    return this.runFunction('removeAcousticPSU', {
      "PSU": PSU,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  setRPath(rpath: string): Observable<any> {
    return this.postLocalNode('rpath', rpath);
  }

  callR(j: any): Observable<any> {
    console.log("RstoxAPI::runFunction.JSON(" + JSON.stringify(JSON.stringify(j)) + ")");
    return this.postLocalNode('callR', j);
  }

  browse(defaultpath: string): Observable<any> {
    return this.postLocalNode('browse', defaultpath);
  }

  browsePath(options: any): Observable<any> {
    return this.postLocalNode('browsePath', options);
  }

  fileExists(filePath: string): Observable<any> {
    return this.postLocalNode('fileExists', filePath);
  }

  makeDirectory(dirPath: string): Observable<any> {
    return this.postLocalNode('makeDirectory', dirPath);
  }

  stoxHome(): Observable<any> {
    return this.postLocalNode('stoxhome', {});
  }

  toggleDevTools(): Observable<any> {
    return this.postLocalNode('toggledevtools', {});
  }

  exit(): Observable<any> {
    return this.postLocalNode('exit', {});
  }

  public getRPath(): Observable<any> {
    return this.getLocalNode('rpath');
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

  public updateActiveProject(projectPath: string): Observable<any> {
    return this.postLocalNode('updateactiveproject', projectPath);
  }

  public updateProjectRootPath(projectRootPath: string): Observable<any> {
    return this.postLocalNode('updateprojectrootpath', projectRootPath);
  }
}

import { Injectable, ɵCompiler_compileModuleAndAllComponentsAsync__POST_R3__ } from '@angular/core';

import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, Subject, of, interval, merge } from 'rxjs';
import { Template } from '../data/Template';
import { catchError, map, tap, mapTo } from 'rxjs/operators';
import { rotateWithoutConstraints } from 'ol/interaction/Interaction';
import { UserLogEntry } from '../data/userlogentry';
import { ProcessOutput } from '../data/processoutput';
import { UserLogType } from '../enum/enums';
import { RunResult, RunModelResult, ProcessResult } from '../data/runresult';
import { AcousticPSU } from '../data/processdata';
@Injectable({
  providedIn: 'root'
})
export class DataService {

  log: UserLogEntry[] = []; // user log.

  // private featuresUrl = '/api/features';
  private geojsonUrl = '/api/geojson';
  private jsonfromfile = '/api/jsonfromfile';

  //private activeProcess: number = 1;
  //private activeProcessInterval: Observable<number>; // clients can subscribe to this observable and thus poll its status.

  constructor(private httpClient: HttpClient) {
  }


  /*getActiveProcessInterval(): Observable<number> {
    return this.activeProcessInterval;
  }*/

  /*getBioticData(): Observable<string> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/readBioticDataFromXml/json", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  getOutputTable(): Observable<any> {
    const formData = new FormData();
    formData.set('iProcess', '1');
    formData.set('iTable', '"mission"');
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/getOutputTable/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  getOutputTableNames(): Observable<any> {
    const formData = new FormData();
    formData.set('iProcess', '1');
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/getOutputTableNames/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }*/

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

  /* makeItFail(): Observable<any> {
     const formData = new FormData();
     formData.set('iProcess', '1');
     formData.set('iTable', 'mission');
     return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/getOutputTable/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
   }*/

  getAvailableTemplates(): Observable<any> {
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getAvailableTemplatesDescriptions/json", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunction('getAvailableTemplatesDescriptions', {});
  }

  createProject(projectPath: string, templateName: string): Observable<any> {
    // const formData = new FormData();
    // formData.set('projectPath', "'" + projectPath + "'");
    // formData.set('template', "'" + templateName + "'");

    // // formData.set('ow', 'FALSE');
    // // formData.set('showWarnings', 'FALSE');
    // // formData.set('open', 'TRUE');
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/createProject/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunctionThrow('createProject', {
      "projectPath": projectPath,
      "template": templateName,
      "ow": false,
      "showWarnings": false,
      "open": true
    }, true);
  }

  getModelInfo(): Observable<any> {
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getModelInfo/json?auto_unbox=true", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunction('getModelInfo', {});
  }

  // getTestProcesses(): Observable<any> {
  //   const formData = new FormData();
  //   formData.set('projectPath', "'C:/Users/esmaelmh/workspace/stox/project/project49'");
  //   formData.set('modelName', "'Baseline'"); 
  //   return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getProcessTable/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  // }

  getProcessesTable(projectPath: string, modelName: string): Observable<any> {
    //console.log(" projectPath : " + projectPath + ", modelName : " + modelName);
    // const formData = new FormData();
    // formData.set('projectPath', "'" + projectPath + "'");
    // formData.set('modelName', "'" + modelName + "'");
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getProcessTable/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunction('getProcessTable', {
      "projectPath": projectPath,
      "modelName": modelName
    });
  }

  openProject(projectPath: string): Observable<any> {
    // const formData = new FormData();
    // formData.set('projectPath', "'" + projectPath + "'");
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/openProject/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunctionThrow('openProject', {
      "projectPath": projectPath
    }, true);
  }

  closeProject(projectPath: string, save: Boolean): Observable<any> {
    // const formData = new FormData();
    // formData.set('projectPath', "'" + projectPath + "'");
    // formData.set('save', "'" + save + "'");
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/closeProject/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunction('closeProject', {
      "projectPath": projectPath,
      "save": save
    });
  }

  getProcessProperties(projectPath: string, modelName: string, processID: string): Observable<any> {
    return this.runProcessFunc<any>("getProcessPropertySheet", projectPath, modelName, processID);
    /* const formData = new FormData();
     // projectPath, modelName, processID
     formData.set('projectPath', "'" + projectPath + "'");
     formData.set('modelName', "'" + modelName + "'");
     formData.set('processID', "'" + processID + "'");
     return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getProcessPropertySheet/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));*/
  }

  isProject(projectPath: string): Observable<any> {
    // const formData = new FormData();
    // formData.set('projectPath', "'" + projectPath + "'");
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/isProject/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

    return this.runFunction('isProject', {
      "projectPath": projectPath
    });
  }

  setProcessPropertyValue(groupName: string, name: string, value: string, projectPath: string, modelName: string, processID: string): Observable<any> {
    // const formData = new FormData();
    // formData.set('groupName', "'" + groupName + "'");
    // formData.set('name', "'" + name + "'");
    // formData.set('value', "'" + value + "'");
    // formData.set('projectPath', "'" + projectPath + "'");
    // formData.set('modelName', "'" + modelName + "'");
    // formData.set('processID', "'" + processID + "'");
    // return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/setProcessPropertyValue/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

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

  getFilterOptions(projectPath: string, modelName: string, processID: string, tableName: string): Observable<string> {
    
    return this.runFunction('getFilterOptions', {
      "projectPath": projectPath, 
      "modelName": modelName, 
      "processID": processID, 
      "tableName": tableName
    });
  }

  expression2list(expr: string): Observable<string> {
    return this.runFunction('expression2list', {
      "expr": expr 
    });
  }

  json2expression() {
    
  }

  // getHelp(topic: string, help_type: string): Observable<any> {
  //   const formData = new FormData();
  //   formData.set('topic', "'" + topic + "'");
  //   formData.set('help_type', "'" + help_type + "'");
  //   // return this.httpClient.post("http://localhost:5307/ocpu/library/utils/R/help/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  //   return this.httpClient.post("http://localhost:5307/ocpu/library/utils/R/help/print", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));

  // }

  // getFunctionHelpAsHtml(functionName: string /*, packageName: string, outfile: string */): Observable<any> {

  //   return this.runFunction('getFunctionHelpAsHtml', {
  //     "functionName": functionName
  //     /* , 
  //     // "packageName": packageName, 
  //     // "outfile": outfile */
  //   });
  // }  

  static readonly LOCALHOST: string = 'localhost';
  static readonly NODE_PORT: number = 3000;
  static readonly OCPU_PORT: number = 5307;

  public static getURL(host: string, port: number, api: string) {
    return "http://" + host + ":" + port + "/" + api;
  }
  public post(host: string, port: number, api: string, body: any, responseType: string = 'text'): Observable<HttpResponse<any>> {
    return this.httpClient.post(DataService.getURL(host, port, api), body,
      {
        observe: 'response', // 'body' or 'response'
        // headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
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
      + "/" + endPoint + "?auto_unbox=true", body, responseType); // maps response to unparsed JSON
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

    // let errorMessage = '';
    // if (error.error instanceof ErrorEvent) {
    //   // client-side error
    //   // errorMessage = `Error: ${error.error.message}`;
    //   errorMessage = "Client-side error: "
    // } else {
    //   // server-side error
    //   // errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    //   errorMessage = "Server-side error: "
    // }
    // // window.alert(errorMessage);    

    // window.alert(errorMessage + error.error); 
  }

  getgeojson(): Observable<string> {
    return this.postLocalOCPUBody('tests', 'test_geojson_polygon', {}, 'text', true);
  }

  getjsonfromfile(): Observable<string> {
    return this.postLocalOCPUBody('tests', 'test_geojson_points', {}, 'text', true);
  }
  runFunction(what: string, argsobj: any): Observable<any> {
    return this.runFunctionThrow(what, argsobj, false);
  }

  /** runFunction API wrapper - includes logging of user message/warning/errors from R*/
  runFunctionThrow(what: string, argsobj: any, dothrow: boolean): Observable<any> {
    // runFunction wraps a doCall with what/args and exception handling that returns a list.
    const formData = new FormData();
    let args: any = JSON.stringify(argsobj);
    formData.set('what', what);
    formData.set('args', args);
    console.log(what + "(" + args + ")");
    return <any>this.postLocalOCPU('RstoxFramework', 'runFunction', formData, 'text', true, "json")
      .pipe(map(async res => {
        //let jsr: RunResult = JSON.parse(res.body);
        // Get the OCPU-sinked R messages from session file (message) and put it int the result.
        // The OCPU sink overrides the message stdout, and must be retrieved from the session message file.
        let r2: RunResult = JSON.parse(res.body);
        //r2.message = [];
        /* let sessionId: string = res.headers.get("x-ocpu-session");
         let msg: string[] = <string[]>await this.post(DataService.LOCALHOST, DataService.OCPU_PORT,
           'ocpu/tmp/' + sessionId + '/messages/json?auto_unbox=TRUE', {}, 'text')
           .pipe(map(_ => JSON.parse(_.body))).toPromise();
         //console.log(msg);
 
         r2.message = msg;
         // Now the runFunction result is complete with error, warning and message
         // deliver the result into the 
         r2.message
           .filter(elm => elm.startsWith("StoX: "))
           .map(elm => elm.slice("StoX: ".length))
           .forEach(elm => {
             this.log.push(new UserLogEntry(UserLogType.MESSAGE, elm));
           });*/
        if (dothrow) {
          if (r2.error.length > 0) {
            throw (r2.error[0]);
          }
          /*if (r2.warning.length > 0) {
             throw(r2.warning[0]); 
          }*/
        } else {
          r2.warning.forEach(elm => {
            this.log.push(new UserLogEntry(UserLogType.WARNING, elm));
          });
          r2.error.forEach(elm => {
            this.log.push(new UserLogEntry(UserLogType.ERROR, elm));
          });
        }
        return r2.value;
      }));
  }

  runModel(projectPath: string, modelName: string, startProcess: number, endProcess: number): Observable<RunModelResult> {

    return this.runFunction('runModel', {
      "projectPath": projectPath, "modelName": modelName,
      "startProcess": startProcess, "endProcess": endProcess,
      "save": false
    });
  }

  runProcessFunc<R>(func: string, projectPath: string, modelName: string, processID: string): Observable<R> {
    return this.runFunction(func, {
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  getProcessOutputTableNames(projectPath: string, modelName: string, processID: string): Observable<string[]> {
    return this.runProcessFunc<string[]>('getProcessOutputTableNames', projectPath, modelName, processID);
  }

  getInteractiveMode(projectPath: string, modelName: string, processID: string): Observable<string> {
    return this.runProcessFunc<string>('getInteractiveMode', projectPath, modelName, processID);
  }
  
  getMapData(projectPath: string, modelName: string, processID: string): Observable<string> {
    return this.runProcessFunc<string>('getMapData', projectPath, modelName, processID);
  }

  getAcousticPSUData(projectPath: string, modelName: string, processID: string): Observable<AcousticPSU> {
    return this.runProcessFunc<AcousticPSU>('getAcousticPSUData', projectPath, modelName, processID);
  }


  modifyStratum(stratum : any, projectPath: string, modelName: string, processID: string): Observable<ProcessResult> {
    return this.runFunction('modifyStratum', { "stratum" : stratum,
      "projectPath": projectPath, "modelName": modelName, "processID": processID
    });
  }

  addStratum(stratum : any, projectPath: string, modelName: string, processID: string): Observable<ProcessResult> {
    return this.runFunction('addStratum', { "stratum" : stratum,
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
      "linesPerPage": 2000,
      "pageindex": 1,
      "columnSeparator": " ",
      "na": "-",
      "drop": true
    });

  }


  setRPath(rpath: string): Observable<any> {
    return this.postLocalNode('rpath', { rpath: rpath });
  }

  browse(defaultpath: string): Observable<any> {
    return this.postLocalNode('browse', { defaultpath: defaultpath });
  }

  public getRPath(): Observable<any> {
    return this.getLocalNode('rpath');
  }

  public getProjectRootPath(): Observable<any> {
    return this.getLocalNode('projectrootpath');
  }

  // public readProjectList(): Observable<any> {
  //   return this.getLocalNode('readprojectlist');
  // }

  // public updateprojectlist(jsonString: string): Observable<any> {
  //   return this.postLocalNode('updateprojectlist', { jsonString: jsonString });
  // }

  public readActiveProject(): Observable<any> {
    return this.getLocalNode('readactiveproject');
  }

  public updateActiveProject(jsonString: string): Observable<any> {
    return this.postLocalNode('updateactiveproject', { jsonString: jsonString });
  }

  public updateProjectRootPath(jsonString: string): Observable<any> {
    return this.postLocalNode('updateprojectrootpath', { jsonString: jsonString });
  }
}

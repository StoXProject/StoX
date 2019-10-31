import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, of, interval, merge } from 'rxjs';
import { Template } from '../data/Template';
import { catchError, map, tap, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // private featuresUrl = '/api/features';
  private geojsonUrl = '/api/geojson';
  private jsonfromfile = '/api/jsonfromfile';
  private mapModeObs = new Observable<string>();
  private mapModeSubject = new Subject<string>();
  //private activeProcess: number = 1;
  //private activeProcessInterval: Observable<number>; // clients can subscribe to this observable and thus poll its status.

  constructor(private httpClient: HttpClient) {
    this.mapModeObs = this.mapModeSubject.asObservable();
    // this.mapModeObs.subscribe((newVal) => {
    //   console.log(newVal);
    // });
    //this.mapModeSubject.next('1');
    //this.mapModeSubject.next('2');
    //const first = ;
    //this.activeProcessInterval = interval(50).pipe(mapTo(this.activeProcess));
  }

  getMapModeObs(): Observable<string> {
    return this.mapModeObs;
  }
  setMapMode(mapMode: string) {
    this.mapModeSubject.next(mapMode);
  }
  /*getActiveProcessInterval(): Observable<number> {
    return this.activeProcessInterval;
  }*/

  getBioticData(): Observable<string> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/readBioticDataFromXml/json", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  runModel(): Observable<any> {
    const formData = new FormData();
    formData.set('iFrom', '1');
    formData.set('iTo', '15');

    // return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/runModel/json", formData);
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/runModel/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
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

  makeItFail(): Observable<any> {
    const formData = new FormData(); 
    formData.set('iProcess', '1');
    formData.set('iTable', 'mission');
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/getOutputTable/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  getAvailableTemplates(): Observable<any> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getAvailableTemplatesDescriptions/json", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  createProject(projectPath: string, templateName: string): Observable<any> {
    const formData = new FormData();
    formData.set('projectPath', "'" + projectPath + "'");
    formData.set('template', "'" + templateName + "'");

    // formData.set('ow', 'FALSE');
    // formData.set('showWarnings', 'FALSE');
    // formData.set('open', 'TRUE');
    return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/createProject/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  getModelInfo(): Observable<any> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getModelInfo/json?auto_unbox=true", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  // getTestProcesses(): Observable<any> {
  //   const formData = new FormData();
  //   formData.set('projectPath', "'C:/Users/esmaelmh/workspace/stox/project/project49'");
  //   formData.set('modelName', "'Baseline'"); 
  //   return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getProcessTable/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  // }

  getProcessesInModel(projectPath: string, modelName: string): Observable<any> {
    console.log(" projectPath : " + projectPath + ", modelName : " + modelName);
    const formData = new FormData();
    formData.set('projectPath', "'" + projectPath + "'");
    formData.set('modelName', "'" + modelName + "'"); 
    return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/getProcessTable/json", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }  

  openProject(projectPath: string): Observable<any> { 
    const formData = new FormData();
    formData.set('projectPath', "'" + projectPath + "'");
    return this.httpClient.post("http://localhost:5307/ocpu/library/RstoxFramework/R/openProject/json?auto_unbox=true", formData, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  static readonly LOCALHOST: string = 'localhost';
  static readonly NODE_PORT: number = 3000;
  static readonly OCPU_PORT: number = 5307;

  public static getURL(host: string, port: number, api: string) {
    return "http://" + host + ":" + port + "/" + api;
  }
  public post(host: string, port: number, api: string, body: any, responseType: string = 'text'): Observable<any> {
    return this.httpClient.post(DataService.getURL(host, port, api), body, { observe: 'body', responseType: <any>responseType }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  public get(host: string, port: number, api: string, responseType: string = 'text'): Observable<any> {
    return this.httpClient.get(DataService.getURL(host, port, api), { observe: 'body', responseType: <any>responseType }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  public postLocalNode(api: string, body: any, responseType: string = 'text'): Observable<any> {
    return this.post(DataService.LOCALHOST, DataService.NODE_PORT, api, body, responseType);
  }

  public getLocalNode(api: string, responseType: string = 'text'): Observable<any> {
    return this.get(DataService.LOCALHOST, DataService.NODE_PORT, api, responseType);
  }

  public postLocalOCPU(rPackage: string, rFunctionName: string, body: any, responseType: string = 'text', parseJSON: boolean = false): Observable<any> {
    return this.post(DataService.LOCALHOST, DataService.OCPU_PORT, 'ocpu/library/' + rPackage + '/R/' + rFunctionName
      + "/json", body, responseType)
      .pipe(map(_ => parseJSON ? JSON.parse(_) : _)); // maps response to unparsed JSON
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
    return this.postLocalOCPU('tests', 'test_geojson_polygon', {}, 'text', true);
  }

  getjsonfromfile(): Observable<string> {
    return this.postLocalOCPU('tests', 'test_geojson_points', {}, 'text', true);
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

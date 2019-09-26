import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // private featuresUrl = '/api/features';
  private geojsonUrl = '/api/geojson';
  private jsonfromfile = '/api/jsonfromfile';

  constructor(private httpClient: HttpClient) { }

  getgeojson(): Observable<string> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/test_geojson_polygon/json", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  getjsonfromfile(): Observable<string> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/test_geojson_points/json", {}, { responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

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


  static readonly LOCALHOST: string = 'localhost';
  static readonly NODE_PORT: number = 3000;

  public static getURL(host : string, port : number, api : string) {
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

  private handleError(error: HttpErrorResponse) {
    console.log("Error.message : " + error.message);
    console.log("Error.name : " + error.name);
    console.log("Error.error : " + error.error);
    console.log("Error.status : " + error.status);
    console.log("Error.statusText : " + error.statusText);
    console.log("Error.url : " + error.url);
    console.log("Error.ok : " + error.ok);
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

  public getProjectPath(): Observable<any> {
    return this.getLocalNode('projectpath');
  }  

}

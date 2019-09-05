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

  postRPath(): Observable<any> {
    // return this.httpClient.get("http://127.0.0.1:3000", {responseType: 'text'}).pipe(tap( _ => _ , error => this.handleError(error)));
    //return this.httpClient.post("http://localhost:3000/rpath",  {rpath:'c:/test4'}, { observe:'body', responseType: 'text' }).pipe(tap( _ => _ , error => this.handleError(error)));
    // return this.httpClient.get("http://localhost:3000/rpath",  { observe:'body', responseType: 'text' }).pipe(tap( _ => _ , error => this.handleError(error)));
    return this.httpClient.post("http://localhost:3000/rpath", { rpath: 'C:/Users/esmaelmh/Documents/R/R-3.6.0/bin/x64' }, { observe: 'body', responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  getRPath(): Promise<any> {
    return this.httpClient.get("http://localhost:3000/rpath", { observe: 'body', responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error))).toPromise();
  }

  setRPath(rpath: string): Observable<any> {
    return this.httpClient.post("http://localhost:3000/rpath", { rpath: rpath }, { observe: 'body', responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
  }

  browse(defaultpath: string): Observable<any> {
    return this.httpClient.post("http://localhost:3000/browse", { defaultpath: defaultpath }, { observe: 'body', responseType: 'text' }).pipe(tap(_ => _, error => this.handleError(error)));
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
}

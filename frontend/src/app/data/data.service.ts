import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
// import Feature from 'ol/Feature';

// const httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };

@Injectable({
  providedIn: 'root'
})
export class DataService {
    
  // private featuresUrl = '/api/features';
  private geojsonUrl = '/api/geojson';
  private jsonfromfile = '/api/jsonfromfile';

  constructor(private httpClient: HttpClient) { }

  getgeojson(): Observable<string> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/test_geojson_polygon/json", {} , { responseType: 'text' });
  }

  getjsonfromfile(): Observable<string> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/test_geojson_points/json", {} , { responseType: 'text' });
  }

  getBioticData(): Observable<string> {
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/readBioticDataFromXml/json", {}, { responseType: 'text' });
  }

  runModel(): Observable<any> {
    const formData = new FormData();
    formData.set('iFrom', '1');
    formData.set('iTo', '15');
    
    // return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/runModel/json", formData);
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/runModel/json", formData, { responseType: 'text' });
  }

  getOutputTable(): Observable<any> {
    const formData = new FormData();
    formData.set('iProcess', '1');
    formData.set('iTable', '"mission"');
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/getOutputTable/json", formData, { responseType: 'text' });  
  }

  getOutputTableNames(): Observable<any> {
    const formData = new FormData();
    formData.set('iProcess', '1');
    return this.httpClient.post("http://localhost:5307/ocpu/library/tests/R/getOutputTableNames/json", formData, { responseType: 'text' });  
  }  

  isRstoxInstalled(): Observable<any> {
    const formData = new FormData();
    formData.set('expr', '"Rstox" %in% rownames(installed.packages())');
    return this.httpClient.post("http://localhost:5307/ocpu/library/base/R/eval/json", formData); 
  }

  installRstox(): Observable<any> {
    const formData = new FormData();
    formData.set('pkgs', '"ftp://ftp.imr.no/StoX/Download/Rstox/Rstox_1.11.tar.gz"');
    formData.set('repos', null);
    return this.httpClient.post("http://localhost:5307/ocpu/library/utils/R/install.packages/json", formData, { responseType: 'text' }); 
  }

  removeRstox(): Observable<any> {
    const formData = new FormData();
    formData.set('pkgs', '"Rstox"');
    return this.httpClient.post("http://localhost:5307/ocpu/library/utils/R/remove.packages/json", formData, { responseType: 'text' }); 
  }
}

import { Injectable } from '@angular/core';

import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import Feature from 'ol/Feature';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private featuresUrl = '/api/features';
  private geojsonUrl = '/api/geojson';
  private jsonfromfile = '/api/jsonfromfile';

  constructor(private httpClient: HttpClient) { }


  getFeatures(): Observable<Feature[]> {
    return this.httpClient.get<Feature[]>(this.featuresUrl);
  }

  getgeojson(): Observable<string> {
    return this.httpClient.get("localhost:8080/geojson", { responseType: 'text' });
  }

  getjsonfromfile(): Observable<string> {
    return this.httpClient.get(this.jsonfromfile, { responseType: 'text' });
  }
}

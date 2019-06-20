import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { HttpClient } from '@angular/common/http';

import { fromLonLat, transform } from 'ol/proj';
import { Observable, of } from 'rxjs';
//import { data_json } from 'acoustic';  
// import SampleJson from './assets/acoustic.json';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {

  //private jsonfromfile: any;

  constructor() {
    // this.getJSON().subscribe(data => {
    //      this.jsonfromfile = data;
    //      console.log(data + " in consturctor");
    //  });
  }

  createDb() {

    // this.getJSON().subscribe(data => {
    //   this.jsonfromfile = data;
    //   console.log(data + " in createDb");
    // });

    let geojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [7.4652, 68.1232],
                [3.846, 65.9786],
                [4.8161, 74.3698],
                [7.4652, 68.1232]
              ]
            ]
          },
          "properties": []
        }
      ]
    };

    let features: Feature[] = [];

    for (var i = 0; i < 12; i++) {
      var lon = 0 + Math.random() * 10;
      var lat = 55 + Math.random() * 20;
      var f = new Feature({ geometry: new Point(fromLonLat([lon, lat], 'EPSG:9820')) });
      f.setId(i);
      f.setProperties({ 'description': "id_" + i + "_lon_" + lon + "_lat_" + lat, 'hascatch': i % 2 == 0 });
      features[i] = f;
      // console.log( Features[i].getId());
    };

    let obj = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "id": 75,
          "geometry": {
            "type": "Point",
            "coordinates": [
              6.7013,
              63.3187
            ]
          },
          "properties": {
            "description": "id_75_lon_6.7013_lat_63.3187",
            "hascatch": "false"
          }
        },
        {
          "type": "Feature",
          "id": 76,
          "geometry": {
            "type": "Point",
            "coordinates": [
              0.8677,
              57.0989
            ]
          },
          "properties": {
            "description": "id_76_lon_0.8677_lat_57.0989",
            "hascatch": "true"
          }
        },
        {
          "type": "Feature",
          "id": 77,
          "geometry": {
            "type": "Point",
            "coordinates": [
              4.4075,
              55.9882
            ]
          },
          "properties": {
            "description": "id_77_lon_4.4075_lat_55.9882",
            "hascatch": "false"
          }
        },
        {
          "type": "Feature",
          "id": 78,
          "geometry": {
            "type": "Point",
            "coordinates": [
              8.3625,
              73.1228
            ]
          },
          "properties": {
            "description": "id_78_lon_8.3625_lat_73.1228",
            "hascatch": "true"
          }
        },
        {
          "type": "Feature",
          "id": 82,
          "geometry": {
            "type": "Point",
            "coordinates": [
              5.2455,
              70.9174
            ]
          },
          "properties": {
            "description": "id_82_lon_5.2455_lat_70.9174",
            "hascatch": "true"
          }
        }       
      ]
    }

    let s = JSON.stringify(obj);
    let t = JSON.stringify(geojson);
    return { features: features, geojson: t, jsonfromfile: s };
    // return features;
  }

  // private getJSON(): Observable<any> {
  //   return this.httpClient.get(this._jsonURL);
  // }    
}

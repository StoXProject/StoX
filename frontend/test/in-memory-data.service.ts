import { Injectable } from '@angular/core';
import {
  InMemoryDbService,
  ParsedRequestUrl,
  RequestInfoUtilities,
} from 'angular-in-memory-web-api';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
// import { data_json } from 'acoustic';
// import SampleJson from './assets/acoustic.json';

@Injectable()
export class InMemoryDataService implements InMemoryDbService {
  // private jsonfromfile: any;

  constructor() {
    // this.getJSON().subscribe(data => {
    //      this.jsonfromfile = data;
    //      console.log("> " + data + " in consturctor");
    //  });
  }

  createDb() {
    // this.getJSON().subscribe(data => {
    //   this.jsonfromfile = data;
    //   console.log("> " + data + " in createDb");
    // });

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [7.4652, 68.1232],
                [3.846, 65.9786],
                [4.8161, 74.3698],
                [7.4652, 68.1232],
              ],
            ],
          },
          properties: [],
        },
      ],
    };

    const features: Feature[] = [];

    for (let i = 0; i < 12; i++) {
      const lon = 0 + Math.random() * 10;

      const lat = 55 + Math.random() * 20;

      const f = new Feature({
        geometry: new Point(fromLonLat([lon, lat], 'EPSG:9820')),
      });

      f.setId(i);
      f.setProperties({
        description: 'id_' + i + '_lon_' + lon + '_lat_' + lat,
        hascatch: i % 2 === 0,
      });
      features[i] = f;
      // console.log("> " +  Features[i].getId());
    }

    const obj = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 75,
          geometry: {
            type: 'Point',
            coordinates: [6.7013, 63.3187],
          },
          properties: {
            description: 'id_75_lon_6.7013_lat_63.3187',
            hascatch: 'false',
          },
        },
        {
          type: 'Feature',
          id: 76,
          geometry: {
            type: 'Point',
            coordinates: [0.8677, 57.0989],
          },
          properties: {
            description: 'id_76_lon_0.8677_lat_57.0989',
            hascatch: 'true',
          },
        },
        {
          type: 'Feature',
          id: 77,
          geometry: {
            type: 'Point',
            coordinates: [4.4075, 55.9882],
          },
          properties: {
            description: 'id_77_lon_4.4075_lat_55.9882',
            hascatch: 'false',
          },
        },
        {
          type: 'Feature',
          id: 78,
          geometry: {
            type: 'Point',
            coordinates: [8.3625, 73.1228],
          },
          properties: {
            description: 'id_78_lon_8.3625_lat_73.1228',
            hascatch: 'true',
          },
        },
        {
          type: 'Feature',
          id: 82,
          geometry: {
            type: 'Point',
            coordinates: [5.2455, 70.9174],
          },
          properties: {
            description: 'id_82_lon_5.2455_lat_70.9174',
            hascatch: 'true',
          },
        },
      ],
    };

    const s = JSON.stringify(obj);

    const t = JSON.stringify(geojson);

    return { features, geojson: t, jsonfromfile: s };
    // return features;
  }

  parseRequestUrl(url: string, utils: RequestInfoUtilities): ParsedRequestUrl {
    if (url.endsWith('.json')) {
      return utils.parseRequestUrl(url);
    }

    const splitted = url.split('/');

    const isLastArgumentIsId = Number.isInteger(
      parseInt(splitted[splitted.length - 1], 10),
    );

    const collectionIndex = isLastArgumentIsId
      ? splitted.length - 3
      : splitted.length - 2;

    const actionIndex = isLastArgumentIsId
      ? splitted.length - 2
      : splitted.length - 1;

    const collectionName = splitted[collectionIndex] + splitted[actionIndex];

    // const newUrl = splitted.join(‘/’);
    const parsed = utils.parseRequestUrl(url);

    parsed.apiBase = '/api';
    parsed.collectionName = collectionName;
    parsed.id = isLastArgumentIsId
      ? (splitted[splitted.length - 1] as any)
      : '';
    parsed.resourceUrl = parsed.resourceUrl + parsed.collectionName;

    return parsed;
  } // private getJSON(): Observable<any> {
  //   return this.httpClient.get(this._jsonURL);
  // }
}

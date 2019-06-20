import { Component, OnInit } from '@angular/core';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Projection from 'ol/proj';
import TopoJSON from 'ol/format/TopoJSON';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer } from 'ol/layer';
import { DoCheck } from '@angular/core';

import { fromLonLat, transform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import * as proj4x from 'proj4';

import { add as addProjection } from 'ol/proj/projection';
import { Fill, Stroke, Style, RegularShape } from 'ol/style';
import { mapToMapExpression } from '@angular/compiler/src/render3/util';

import { click, singleClick, shiftKeyOnly } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { ResizedEvent } from 'angular-resize-event';
import { defaults as defaultControls } from 'ol/control';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';

import { DataService } from '../data/data.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit {

  map: OlMap;
  // source: OlXYZ;
  // toposource: VectorSource;
  // layer: OlTileLayer;
  vector: VectorLayer;
  view: OlView;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    /*this.source = new OlXYZ({
      url: 'http://tile.osm.org/{z}/{x}/{y}.png'
    });*/
    var style = new Style({
      fill: new Fill({
        color: 'rgb(255, 255, 255)'
      }),
      stroke: new Stroke({
        color: 'rgb(210, 236, 249)',
        width: 1
      })
    });
    let myProjectionName = 'EPSG:9820';
    const proj4 = (proj4x as any).default;
    // Two example-projections (2nd is included anyway)

    proj4.defs('EPSG:9820', '+proj=laea +lat_0=60 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    proj4.defs('ESRI:54003', '+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +R_A +datum=WGS84 +units=m +no_defs');
    proj4.defs('EPSG:3411', '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=10 +k=1 +x_0=0 +y_0=0 +a=6378273 +b=6356889.449 +units=m +no_defs');
    /*<Projection id="EPSG:3411"   proj4="+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 +x_0=0 +y_0=0 +a=6378273 +b=6356889.449 +units=m +no_defs"/>
    <Projection id="EPSG:3412"   proj4="+proj=stere +lat_0=-90 +lat_ts=-70 +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378273 +b=6356889.449 +units=m +no_defs"/>
    <Projection id="EPSG:3575"   proj4="+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"/>
    <Projection id="EPSG:3857"   proj4="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"/>
    <Projection id="EPSG:4258"   proj4="+proj=longlat +ellps=GRS80 +no_defs"/>
    <Projection id="EPSG:4326"   proj4="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"/>
    <Projection id="EPSG:25831"  proj4="+proj=utm +zone=31 +ellps=GRS80 +units=m +no_defs"/>
    <Projection id="EPSG:25832"  proj4="+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs"/>
    <Projection id="EPSG:28992"  proj4="+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs"/>
    <Projection id="EPSG:32661"  proj4="+proj=stere +lat_0=90 +lat_ts=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"/>
    <Projection id="EPSG:40000"  proj4="+proj=stere +ellps=WGS84 +lat_0=90 +lon_0=0 +no_defs"/>
    <Projection id="EPSG:900913" proj4=" +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"/>
    <Projection id="EPSG:102100" proj4="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"/>
    */
    //    +proj=mill +lon_0=90w
    register(proj4);
    // var test_coordinate = transform([-79.4460, 37.7890], 'EPSG:4326', 'EPSG:2284');
    //console.log(test_coordinate);
    var proj = 'EPSG:9820';//'ESRI:54003'//'EPSG:3857';//'ESRI:54003';//'EPSG:3857';//'EPSG:4326';//'ESRI:54003';//'EPSG:9820';

    this.vector = new VectorLayer({
      source: new VectorSource({
        //url: 'assets/landflate_verden.json',
        url: 'assets/landflate_verden.json',
        //url: 'assets/world-110m.json',
        format: new TopoJSON({
          // don't want to render the full world polygon (stored as 'land' layer),
          // which repeats all countries
          layers: ['world'],
        }),
        overlaps: false,
      }),
      style: style,
      selectable: false,
    });


    /*this.layer = new OlTileLayer({
      source: this.source
    });*/

    this.view = new OlView({
      //center: fromLonLat([170, 10], proj),
      center: fromLonLat([16.661594, 60.433237], proj),
      projection: proj,
      zoom: 3.9,
    });
    var mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      // comment the following two lines to have the mouse position
      // be placed within the map.
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.vector],
      view: this.view,
      controls: defaultControls().extend([mousePositionControl])
    });

    // var f1 = new Feature({ id: 's1', geometry: new Point(fromLonLat([4, 60], proj)) });
    // var f2 = new Feature({ id: 's2', geometry: new Point(fromLonLat([3, 59], proj)) });
    /*
    var Ftrs: Feature[] = [];// = new Array();

    for (var i = 0; i < 12; i++) {
      var lon = 0 + Math.random() * 10;
      var lat = 55 + Math.random() * 20;
      var f = new Feature({ geometry: new Point(fromLonLat([lon, lat], proj)) });
      f.setId('s' + i); 
      f.setProperties({'description': s + " description"});
      Ftrs[i] = f;
      // console.log( Ftrs[i].getId());
    }  */

    var stroke = new Stroke({ color: 'black', width: 2 });
    var fill = new Fill({ color: 'blue' });

    var s = new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 4,
        angle: Math.PI / 4
      })
    });

    let s2 = new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      })
    })

    /*
    // this works
    this.dataService.getjsonfromfile().toPromise().then(
      (st: any) => {
        console.log(st + " in 1");
        this.map.addLayer(new VectorLayer({
          source: new VectorSource({
            format: new GeoJSON(),
            features: (new GeoJSON).readFeatures(st, {
              defaultDataProjection: 'EPSG:4326',
              featureProjection: proj
            })
          }),
          style: s,
          selectable: true
        }));
      }); 
      */
      // this works (points)
     this.dataService.getjsonfromfile().toPromise().then(
      (st: any) => {
        console.log(JSON.parse(st))
        this.map.addLayer(new VectorLayer({
          source: new VectorSource({
            format: new GeoJSON(),
            features: (new GeoJSON).readFeatures(JSON.parse(st), {
              defaultDataProjection: 'EPSG:4326',
              featureProjection: proj
            })
          }),
          style: s,
          selectable: true
        }));
      });

     // this works (polygon)
     this.dataService.getgeojson().toPromise().then(
      (st: any) => {
        console.log(JSON.parse(st))
        this.map.addLayer(new VectorLayer({
          source: new VectorSource({
            format: new GeoJSON(),
            features: (new GeoJSON).readFeatures(JSON.parse(st), {
              defaultDataProjection: 'EPSG:4326',
              featureProjection: proj
            })
          }),
          style: s2,
          selectable: true
        }));
      });  
         
      /*
      // this doesn't work
     this.dataService.getFeatures().subscribe(
      (st: Feature[]) => {

        this.map.addLayer(new VectorLayer({
          source: new VectorSource({
            // format: new GeoJSON(),
            features: st
          }),
          style: s,
          selectable: true
        }));
      });    
      */

    //this.map.on('click', this.onClick());
    var selectClick = new Select({
      //condition: (mapBrowserEvent) => {
      //  return singleClick(mapBrowserEvent) && !shiftKeyOnly(mapBrowserEvent)},//function (ev) { return click; },
      removeCondition: (mapBrowserEvent) => {
        return false;
      },//singleClick(mapBrowserEvent) && !shiftKeyOnly(mapBrowserEvent)},//function (ev) { return click; },
      addCondition: (mapBrowserEvent) => {
        return false;
      },//singleClick(mapBrowserEvent) && !shiftKeyOnly(mapBrowserEvent)},//function (ev) { return click; },
      toggleCondition: (mapBrowserEvent) => {
        return true;
      },//singleClick(mapBrowserEvent) && !shiftKeyOnly(mapBrowserEvent)},//function (ev) { return click; },
      layers: function (layer) {
        return layer.get("selectable") == true;

      },
      filter: function (feature, layer) {
        return true/* some logic on a feature and layer to decide if it should be selectable; return true if yes */;
      },
      multi: true
    });
    this.map.addInteraction(selectClick);
    selectClick.on('select', (e) => {
      if (e.selected.length > 0) {
        // console.log("Id " + e.selected[0].getId());
        console.log(e.selected[0].getId() + " description " + e.selected[0].get('description'));//e.selected.getId());  
      }
    });
    selectClick.getFeatures().on('remove', function (event) {
      console.log("remocve");
    });
  }
  onClick() {

  }

  onResized(event: ResizedEvent) {
    this.map.updateSize();
  }
}
/*
convert text delimited file with wkt geometry to arced topojson file
Use QGIS/MapShaper
1. add layer->add delimited text layer.
2. rightclick layer->export->save features as. choose Esri Shape file
MapShaper
Read shape file into https://mapshaper.org/
export as geojson or topojson.

// Todo: for miller projection: do not cross 180 deg
*/

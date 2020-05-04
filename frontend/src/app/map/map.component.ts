import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { defer, merge, Observable } from 'rxjs';
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import Source from 'ol/source/Vector';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import Overlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
//import Projection from 'ol/proj';
import TopoJSON from 'ol/format/TopoJSON';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector, Layer } from 'ol/layer';
import { DoCheck } from '@angular/core';

import { fromLonLat, transform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import * as proj4x from 'proj4';

//import { add as addProjection } from 'ol/proj/projection';
import { Fill, Stroke, Style, RegularShape } from 'ol/style';
import { mapToMapExpression } from '@angular/compiler/src/render3/util';

import { click, singleClick, shiftKeyOnly, platformModifierKeyOnly } from 'ol/events/condition';
import { Select, Draw, Modify, Snap } from 'ol/interaction';
import { ResizedEvent } from 'angular-resize-event';
import { defaults as defaultControls } from 'ol/control';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';

import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';

import { ProcessDataService } from '../service/processdata.service';
import { catchError, map, tap } from 'rxjs/operators';
import { MapSetup } from './MapSetup';
import BaseObject from 'ol/Object';
import VectorSource from 'ol/source/Vector';
import { MatDialog } from '@angular/material/dialog';
import { MapBrowserPointerEvent } from 'ol';
import { isDefined } from '@angular/compiler/src/util';
import { EDSU_PSU, BioticAssignment } from '../data/processdata';
import { ProcessResult } from '../data/runresult';
import { NamedStringTable, NamedStringIndex } from '../data/types';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('tooltip', { static: false }) tooltip: ElementRef;
  map: OlMap;
  // source: OlXYZ;
  // toposource: VectorSource;
  // layer: OlTileLayer;
  vector: Vector;
  view: OlView;
  /*stationLayer: Layer = null;
  edsuPointLayer: Layer = null;
  edsuLineLayer: Layer = null;
  stratumLayer: Layer = null;*/
  layerMap: Map<string, Layer[]> = new Map();
  stratumSelect: Select;
  stratumModify: Modify;
  stratumDraw: Draw;
  overlay: Overlay;
  private m_Tool: string = "freemove";
  constructor(private dataService: DataService, private ps: ProjectService, private pds: ProcessDataService, private dialog: MatDialog) {
  }
  /*@HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log(event);
    
    // if (event.keyCode === KEY_CODE.RIGHT_ARROW) {
    //   this.increment();
    // }

    // if (event.keyCode === KEY_CODE.LEFT_ARROW) {
    //   this.decrement();
    // }
  }*/
  tools = [
    { tool: "freemove", iclass: "freemoveicon" },
    { tool: "stratum-edit", iclass: "editicon" },
    { tool: "stratum-add", iclass: "addicon" },
    { tool: "stratum-delete", iclass: "deleteicon" }/*,
    { tool: "stratum-delete", iclass: "editicon" }*/

  ];
  public getToolEnabled(tool: string): boolean {
    switch (tool) {
      case "freemove": return true;
      case "stratum-edit":
        return this.ps.iaMode == "stratum" && this.stratumSelect != null && this.stratumModify != null;
      case "stratum-add":
        return this.ps.iaMode == "stratum" && this.stratumDraw != null;
      case "stratum-delete":
        return this.ps.iaMode == "stratum" && this.stratumDraw != null /**stratum layer is initiated */;
    }
    return false;
  }

  // set accessor for tool
  set tool(tool: string) {
    this.m_Tool = tool;
    console.log("setting tool: " + tool);
    this.resetInteractions();
    switch (tool) {
      case "stratum-edit":
        this.map.getInteractions().extend([this.stratumSelect, this.stratumModify]);
        break;
      case "stratum-add":
        if (this.map != null && this.map.getInteractions() != null && this.stratumDraw != null) {
          this.map.getInteractions().extend([this.stratumDraw]);
        }
        //console.log("add stratum");//this.map.getInteractions().extend([this.stratumSelect, this.stratumModify]);
        break;
      default:

    }
  }

  // get accessor for tool
  get tool(): string {
    return this.m_Tool;
  }
  resetInteractions() {
    if (this.stratumDraw != null) {
      this.map.getInteractions().remove(this.stratumDraw);
    }
    if (this.stratumSelect != null) {
      this.map.getInteractions().remove(this.stratumSelect);
    }
    if (this.stratumModify != null) {
      this.map.getInteractions().remove(this.stratumModify);
    }
  }

  addLayerToProcess(pid: string, l: Layer) {
    let la = this.layerMap.get(pid);
    if (la == null) {
      la = [];
      this.layerMap.set(pid, la);
    }
    la.push(l);
    this.map.addLayer(l);
  }

  resetLayersToProcess(pid: string) {
    let aidx: number = this.ps.getProcessIdxById(pid);
    let idsToRemove: string[] = [];
    this.layerMap.forEach((value, key, map) => {
      let kidx: number = this.ps.getProcessIdxById(key);
      if (kidx >= aidx) {
        idsToRemove.push(key);
      }
    });
    idsToRemove.forEach(id => {
      let la = this.layerMap.get(id);
      if (la != null) {
        la.forEach(l => this.map.removeLayer(l));
      }
      this.layerMap.set(id, null);
    });
  }

  async ngOnInit() {

    const proj4 = (proj4x as any).default;
    // Two example-projections (2nd is included anyway)

    // Lambert Azimuthal Equal Area
    proj4.defs('EPSG:9820', '+proj=laea +lat_0=60 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    // World Miller Cylindrical
    proj4.defs('ESRI:54003', '+proj=mill +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +R_A +datum=WGS84 +units=m +no_defs');
    // Sea Ice Polar Stereographic
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

    this.vector = new Vector({
      source: new Source({
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
      style: MapSetup.getMapStyle()
    });


    /*this.layer = new OlTileLayer({
      source: this.source
    });*/

    this.view = new OlView({
      //center: fromLonLat([170, 10], proj),
      center: fromLonLat([1, 68], proj),
      projection: proj,
      zoom: 4.9,
    });

    this.map = new OlMap({
      target: 'map',
      layers: [MapSetup.getGridLayer(proj), this.vector],
      view: this.view,
      controls: [MapSetup.getMousePositionControl()]
    });
    this.stratumSelect = MapSetup.createStratumSelectInteraction();
    this.stratumModify = MapSetup.createStratumModifyInteraction(this.stratumSelect, this.dataService, this.ps, proj);

    this.ps.iaModeSubject.subscribe(iaMode => {
      this.handleIaMode(iaMode, proj);
    });

    this.pds.processDataSubject.subscribe(async evt => {
      switch (evt) {
        case "acousticPSU": {
          this.map.getLayers().getArray()
            .filter(l => l.get("layerType") == "EDSU")
            .map(l => <VectorSource>(<Layer>l).getSource())
            .forEach(s => s.getFeatures()
              .forEach(f => {
                let edsu: string = f.get("EDSU");
                let edsupsu: EDSU_PSU = this.pds.acousticPSU.EDSU_PSU.find(edsupsu => edsupsu.EDSU == edsu);
                // Connect EDSU_PSU to feature
                if (edsupsu == null) {
                  console.log("edsu " + edsu + " not mapped");
                }
                f.set("edsupsu", edsupsu);
                // Get default any selection (not focused by user):
                MapSetup.updateEDSUSelection(f, this.pds.selectedPSU);
              })
            )
          break;
        }
        case "selectedPSU": {
          switch(this.ps.iaMode) {
            case "bioticAssignment": {
              this.updateStationSelection();
              // drop to EDSU selection to get EDSU focus change
            }
            case "acousticPSU": {
              this.map.getLayers().getArray()
                .filter(l => l.get("layerType") == "EDSU")
                .map(l => <VectorSource>(<Layer>l).getSource())
                .forEach(s => s.getFeatures()
                  .forEach(f => {
                    // selected PSU.
                    MapSetup.updateEDSUSelection(f, this.pds.selectedPSU);
                  }))
              break;
            }
          }
          break;
        }
      }
    });

    //var selected = [];

    this.map.on('singleclick', e => {
      let farr: Feature[] = [];
      this.map.forEachFeatureAtPixel(e.pixel, (f, l) => {
        if (l == null || f == null) {
          return;
        }
        let layerType: string = l.get("layerType");
        if (this.ps.iaMode == "acousticPSU" && layerType == "EDSU" ||
          this.ps.iaMode == "bioticAssignment" && layerType == "station") {
          farr.push(<Feature>f);
        }
      });
      // handle the top feature only.
      farr.sort((a: Feature, b: Feature) => (<Layer>a.get("layer")).getZIndex() -
        (<Layer>b.get("layer")).getZIndex()).slice(0, 1).
        forEach(async f => {
          let l: Layer = <Layer>f.get("layer");
          console.log("Z index: " + l.getZIndex());
          let fe: Feature = (<Feature>f);
          if (this.pds.selectedPSU == null) {
            return;
          }
          switch (this.ps.iaMode) {
            case "acousticPSU": {
              // Controlling focus.
              //let farr: Feature[] = (<VectorSource>l.getSource()).getFeatures();
              let prevClickIndex = l.get("lastClickedIndex"); // handle range selection with respect to last clicked index
              let clickedIndex = (<VectorSource>l.getSource()).getFeatures().findIndex(fe1 => fe1 === fe);
              l.set("lastClickedIndex", clickedIndex);
              if (!shiftKeyOnly(e) || prevClickIndex == null) {
                prevClickIndex = clickedIndex;
              }
              let fi1 = (<VectorSource>l.getSource()).getFeatures()[prevClickIndex];
              let edsuPsu1: EDSU_PSU = fi1.get("edsupsu");
              if (edsuPsu1 == null) {
                console.log(fi1.get("EDSU") + " is missing edsu  for " + fi1.get("EDSU") + " layer " + l.get("name"));
              }
              let psuToUse: string = edsuPsu1.PSU;
              if (prevClickIndex == clickedIndex) {
                psuToUse = edsuPsu1.PSU != this.pds.selectedPSU ? this.pds.selectedPSU : null;
              }
              let iFirst = Math.min(prevClickIndex, clickedIndex);
              let iLast = Math.max(prevClickIndex, clickedIndex);
              let changedEDSUs: string[] = [];
              for (let idx: number = iFirst; idx <= iLast; idx++) {
                let fi = (<VectorSource>l.getSource()).getFeatures()[idx];
                let edsuPsu: EDSU_PSU = fi.get("edsupsu");
                if (edsuPsu != null) {
                  if (edsuPsu.PSU != psuToUse) {
                    changedEDSUs.push(edsuPsu.EDSU);
                    edsuPsu.PSU = psuToUse;
                    MapSetup.updateEDSUSelection(fi, this.pds.selectedPSU);
                  }
                  //fi.changed();
                }
              }
              if (changedEDSUs.length > 0) {
                let res: ProcessResult = psuToUse != null ? await this.dataService.addEDSU(psuToUse, changedEDSUs,
                  this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise() :
                  await this.dataService.removeEDSU(changedEDSUs, this.ps.selectedProject.projectPath,
                    this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise();
                this.ps.selectedProject.saved = res.saved;
                /*if (res != null && res.activeProcessID != null) {
                  this.ps.activeProcessId = res.activeProcessID; // reset active process id
                }*/
              }
              //l.changed();
              //(<VectorSource>l.getSource()).changed();
              break;
            }
            case "bioticAssignment": {
              let selected: boolean = MapSetup.isStationSelected(fe, this.pds.bioticAssignmentData.BioticAssignment);
              MapSetup.selectStation(fe, this.ps, this.pds, this.dataService, !selected);
              MapSetup.updateStationSelection(fe, this.pds.bioticAssignmentData.BioticAssignment);
              break;
            }
          };
        });
    });

    this.map.on('change', function (evt) {
      console.info(evt);
      // console.info(evt.originalEvent.keyIdentifier);
    });
    /*
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
        return mapBrowserEvent.type == 'click';
      },//singleClick(mapBrowserEvent) && !shiftKeyOnly(mapBrowserEvent)},//function (ev) { return click; },
      layers: function (layer) {
        //console.log(layer.get("selectable"))
        return layer.get("selectable") == true;
      },
      filter: function (feature, layer) {
        return true// some logic on a feature and layer to decide if it should be selectable; return true if yes 
      },
      style: function (feature) {
        //console.log(feature.getProperties());
        return feature.get("layer").get("style");
      },
      multi: true
    });
    //this.map.addInteraction(selectClick);
    selectClick.on('change', (e) => {
      if (e.target.selected.length > 0) {
        console.log(e.target.selected[0].get("id") + " is selected, shift:" + shiftKeyOnly(e.target.mapBrowserEvent));
      }
    });
    /*selectClick.getFeatures().on('remove', e => {
      console.log(e.element.get("id") + " is deselected, shift:" + shiftKeyOnly(e.target));
    });
     
    this.map.on('click', e => { 
      shiftKeyOnly(e.);
    });*/
    this.map.on('pointermove', e => this.displayTooltip(e));
  } // end of ngOnInit()

  async handleIaMode(iaMode: string, proj) {
    let layerName: string = this.ps.getActiveProcess() != null ? this.ps.getActiveProcess().processID + "-" + iaMode : null;
    switch (iaMode) {
      case "reset": {
        this.layerMap.forEach((value, key, map) => {
          value.forEach(l => this.map.removeLayer(l));
        });
        this.layerMap.clear();
        break;
      }
      case "station": {
        this.resetLayersToProcess(this.ps.activeProcessId);
        let data: { stationPoints: string; stationInfo: NamedStringTable; haulInfo: NamedStringTable } = await this.dataService.getMapData(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.getActiveProcess().processID).toPromise();
        this.addLayerToProcess(this.ps.activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 300, data.stationPoints, proj, MapSetup.getStationPointStyleCache(), false, 4, [data.stationInfo, data.haulInfo]));
        break;
      }
      case "EDSU": {
        this.resetLayersToProcess(this.ps.activeProcessId);
        let data: { EDSUPoints: string; EDSULines: string; EDSUInfo: NamedStringTable } = await this.dataService.getMapData(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.getActiveProcess().processID).toPromise();//MapSetup.getGeoJSONLayerFromURL("strata", '/assets/test/strata_test.json', s2, false)
        this.addLayerToProcess(this.ps.activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode + "line", 200, data.EDSULines, proj, [MapSetup.getEDSULineStyle()], false, 2, []));
        this.addLayerToProcess(this.ps.activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 210, data.EDSUPoints, proj, MapSetup.getEDSUPointStyleCache(), false, 3, [data.EDSUInfo]));
        break;
      }
      case "stratum": {
        this.resetLayersToProcess(this.ps.activeProcessId);
        let data: { stratumPolygon: string } = await this.dataService.getMapData(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.getActiveProcess().processID).toPromise();//MapSetup.getGeoJSONLayerFromURL("strata", '/assets/test/strata_test.json', s2, false)
        let layer: Layer = MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 100, data.stratumPolygon, proj, [MapSetup.getStratumStyle()], false, 1, []);
        this.addLayerToProcess(this.ps.activeProcessId, layer);
        this.stratumDraw = MapSetup.createStratumDrawInteraction(this.dialog, <VectorSource>layer.getSource(), this.dataService, this.ps, proj);
        break;
      }
      default: {
        //this.map.removeLayer(this.map.getLayers()."station");
        //this.resetInteractions();   
        this.tool = "freemove";
      }
    }
  }

  ngAfterViewInit() {
    this.overlay = new Overlay({
      element: this.tooltip.nativeElement,
      offset: [10, 0],
      positioning: OverlayPositioning.CENTER_LEFT
    });
    this.map.addOverlay(this.overlay);
  }

  onClick() {

  }

  onResized(event: ResizedEvent) {
    this.map.updateSize();
  }

  getTooltip(obj) {
    let res: string = '';
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && typeof (obj[key]) != 'object') {
        if (res.length > 0) {
          res += '<br>'
        }
        res = res + key + ": " + obj[key];
      }
    }
    return res;
  }
  displayTooltip(evt: MapBrowserPointerEvent) {
    var pixel = evt.pixel;
    var features: Feature[] = [];

    this.map.forEachFeatureAtPixel(pixel, feature => {
      let layer: Vector = feature.get("layer");
      if (layer != null && layer.get("hasTooltip")) {
        features.push(<Feature>feature)
      }
    }
    );
    features.sort((f1, f2) => {
      return f2.get("layer").get("layerOrder") - f1.get("layer").get("layerOrder")
    })
    let feature: Feature = features.length > 0 ? features[0] : null;
    if (platformModifierKeyOnly(evt) && feature != null) {

      this.overlay.setPosition(evt.coordinate);
      this.tooltip.nativeElement.innerHTML = this.getTooltip(this.getTooltipProperties(feature));
      this.tooltip.nativeElement.style.display = '';
      return;

    }
    this.tooltip.nativeElement.style.display = 'none';
  };

  private getTooltipProperties(feature: Feature): { [key: string]: any } {
    let res: NamedStringIndex = {};
    let primaryIdx: NamedStringIndex = <NamedStringIndex>feature.get("primaryInfo");
    let secondaryIdx: NamedStringIndex[] = <NamedStringIndex[]>feature.get("secondaryInfo");
    if (primaryIdx != null) {
      Object.assign(res, primaryIdx); // 
    }
    if (secondaryIdx != null && secondaryIdx.length == 1) {
      Object.assign(res, secondaryIdx[0]);
    }
    return res;
  }

  /** Update station assignment due to psu selection or psu assignment add/remove operation
   *  Iterate features in station layer and update the selection state based on assignments
   *  according to biotic assignment data.
   */
  private updateStationSelection() {
    let bioticAssignments: BioticAssignment[] = [];
    if (this.ps.iaMode == "bioticAssignment" && this.pds.bioticAssignmentData != null && this.pds.selectedPSU != null) {
      bioticAssignments = this.pds.bioticAssignmentData.BioticAssignment.filter(ba => ba.PSU == this.pds.selectedPSU);
    }
    this.map.getLayers().getArray()
      .filter(l => l.get("layerType") == "station")
      .map(l => <VectorSource>(<Layer>l).getSource())
      .forEach(s => s.getFeatures()
        .forEach(f => {
          // selected PSU.
          MapSetup.updateStationSelection(f, bioticAssignments);
        }))
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

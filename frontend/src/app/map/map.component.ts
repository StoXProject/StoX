import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { defer, merge, Observable } from 'rxjs';
import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import Source from 'ol/source/Vector';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
//import Extent from 'ol/extent';
import Overlay from 'ol/Overlay';
import OverlayPositioning from 'ol/OverlayPositioning';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Geometry } from 'ol/geom';
//import Projection from 'ol/proj';
import TopoJSON from 'ol/format/TopoJSON';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector, Layer } from 'ol/layer';
import { DoCheck } from '@angular/core';

import { fromLonLat, transform, transformExtent } from 'ol/proj';
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
import { ActiveProcessResult } from '../data/runresult';
import { NamedStringTable, NamedStringIndex } from '../data/types';
import { applyTransform, Extent, getCenter } from 'ol/extent';
const proj4 = (proj4x as any).default;
import { get as getProjection, getTransform } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { SubjectAction } from '../data/subjectaction';

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
  coastLine: Vector;
  grid: Vector;
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
  proj = 'StoX_001_NorthSea';

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
    { tool: "stratum-add", iclass: "addicon" }/*,
    { tool: "stratum-delete", iclass: "deleteicon" }*/

  ];
  projectionsMenu = [
    {
      label: 'StoX 001: Lambert Azimuthal Equal Area - North Sea', command: e => {
        this.setProjectionProj4('StoX_001_NorthSea', 2, 10);
      }
    },
    {
      label: 'StoX 002: Lambert Azimuthal Equal Area - Barents Sea', command: e => {
        this.setProjectionProj4('StoX_002_BarentsSea', 2, 30);
      }
    },
    {
      label: 'StoX 003: Lambert Azimuthal Equal Area - West Africa', command: e => {
        this.setProjectionProj4('StoX_003_WestAfrica', 2, 10);
      }
    },
    {
      label: 'StoX 004: Lambert Azimuthal Equal Area - South pole', command: e => {
        this.setProjectionProj4('StoX_004_SouthPole', 2, 0);
      }
    },
    {
      label: 'StoX 005: Lambert Azimuthal Equal Area - Sri Lanka', command: e => {
        this.setProjectionProj4('StoX_005_SriLanka', 2, 80);
      }
    },
    {
      label: 'StoX 006: Geographical projection', command: e => {
        this.setProjectionProj4('StoX_006_Geographical', 2, 0);
      }
    }
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

  getNumLayersWithLayerType(lt): number {
    return []
      .concat(...Array.from(this.layerMap.values())) // flatting by concatinated spread elements
      .filter(l => l.get("layerType") == lt).length; // filter and count up
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
      this.removeLayersByProcessId(id);
    });
  }

  removeLayersByProcessId(id : string) {
    if (id != null) {
      let la = this.layerMap.get(id);
      if (la != null) {
        la.forEach(l => this.map.removeLayer(l));
      }
      this.layerMap.delete(id);
    }
  }


  setProjectionProj4(newProjCode, zoom, centerLongitude: number) {
    var newProj = getProjection(newProjCode);
    var newProjExtent = newProj.getExtent();
    console.log(newProjExtent.toString());
    var center2 = getCenter(newProjExtent);
    console.log(center2.toString());
    var newView = new OlView({
      projection: newProj,
      center: getCenter(newProjExtent),//fromLonLat(center, newProjCode),//getCenter(newProjExtent || [0, 0, 0, 0]),
      zoom: zoom//,
      //extent: newProjExtent || undefined
    });
    this.map.setView(newView);
    //this.map.getLayers().forEach(l=>l.)
    //this.map.getLayers().forEach(l=>this.map.removeLayer(l));
    this.map.removeLayer(this.grid);
    // this.coastLine.getSource().getFeatures().forEach(f => f.getGeometry().transform(this.proj, newProjCode));
    this.map.getLayers().forEach(l => (<VectorSource<Geometry>>(<Layer>l).getSource()).getFeatures()
      .forEach(f => f.getGeometry().transform(this.proj, newProjCode)));

    this.proj = newProjCode;
    this.grid = MapSetup.getGridLayer(this.proj, centerLongitude);
    this.map.addLayer(this.grid);

    //this.grid.getSource().getFeatures().forEach(f => f.getGeometry().transform(this.proj, newProjCode));
    //this.coastLine.getSource().getFeatures().forEach(f => f.getGeometry().transform(this.proj, newProjCode));
    //this.grid = MapSetup.getGridLayer(this.proj);
    //this.map.getLayers().forEach(l => (<VectorSource<Geometry>>(<Layer>l).getSource()).getFeatures()
    //  .forEach(f => f.getGeometry().transform(this.proj, newProjCode)));

    // Example how to prevent double occurrence of map by limiting layer extent
    if (newProj == getProjection('EPSG:3857')) {
      // this.map.getLayers().forEach(l=> l.setExtent([-1057216, 6405988, 404315, 8759696]));
    } else {
      //this.map.getLayers().forEach(l=> l.setExtent(undefined));
    }
  }


  async ngOnInit() {

    // Lambert Azimuthal Equal Area
    proj4.defs('StoX_001_NorthSea', '+proj=laea +lat_0=60 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
    proj4.defs('StoX_002_BarentsSea', '+proj=laea +lat_0=80 +lon_0=30 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
    proj4.defs('StoX_003_WestAfrica', '+proj=laea +lat_0=0 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
    proj4.defs('StoX_004_SouthPole', '+proj=laea +lat_0=-90 +lon_0=10 +x_0=0 +y_0=0 +ellps=WGS84  +units=m +no_defs');
    proj4.defs('StoX_005_SriLanka', '+proj=laea +lat_0=0 +lon_0=80 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
    proj4.defs('StoX_006_Geographical', '+proj=longlat +ellps=WGS84 +units=degrees +no_defs');
    
    register(proj4);
    
    var StoX_001_NorthSea = getProjection('StoX_001_NorthSea');
    StoX_001_NorthSea.setExtent(transformExtent([-100, -50, 100, 90], 'EPSG:4326', 'StoX_001_NorthSea'));
    
    var StoX_002_BarentsSea = getProjection('StoX_002_BarentsSea');
    StoX_002_BarentsSea.setExtent(transformExtent([-100, -50, 100, 90], 'EPSG:4326', 'StoX_002_BarentsSea'));
    
    var StoX_003_WestAfrica = getProjection('StoX_003_WestAfrica');
    StoX_003_WestAfrica.setExtent(transformExtent([-100, -70, 100, 70], 'EPSG:4326', 'StoX_003_WestAfrica'));
    
    var StoX_004_SouthPole = getProjection('StoX_004_SouthPole');
    StoX_004_SouthPole.setExtent(transformExtent([-100, -90, 100, 0], 'EPSG:4326', 'StoX_004_SouthPole'));
    
    var StoX_005_SriLanka = getProjection('StoX_005_SriLanka');
    StoX_005_SriLanka.setExtent(transformExtent([20, -70, 180, 70], 'EPSG:4326', 'StoX_005_SriLanka'));
    
    var StoX_006_Geographical = getProjection('StoX_006_Geographical');
    StoX_006_Geographical.setExtent(transformExtent([-180, -90, 180, 90], 'EPSG:4326', 'StoX_006_Geographical'));
    
    


    this.coastLine = new Vector({
      source: new Source({
        //url: 'assets/landflate_verden.json',
        url: 'assets/landflate_verden_gap180.json',
        //url: 'assets/World_polygons.json', 
        //url: 'assets/World_polygons_susbset.json', 
        
        format: new TopoJSON({
          // don't want to render the full world polygon (stored as 'land' layer),
          // which repeats all countries
          //layers: ['World_polygon'],
          layers: ['world'],
        }),
        overlaps: false,
      }),
      style: MapSetup.getMapStyle(),
      zIndex: 11
    });


    /*this.layer = new OlTileLayer({
      source: this.source
    });*/

    /* this.view = new OlView({
       //center: fromLonLat([170, 10], proj),
       center: fromLonLat([1, 68], this.proj),
       projection: this.proj,
       zoom: 2,
     });*/

    this.map = new OlMap({
      target: 'map',
      //layers: [this.grid, this.coastLine],
      //  view: this.view,
      controls: [MapSetup.getMousePositionControl()]
    });
    //this.grid = MapSetup.getGridLayer(this.proj);
    //this.map.addLayer(this.grid);
    this.map.addLayer(this.coastLine);

    this.setProjectionProj4("StoX_001_NorthSea", 2, 10);
    this.stratumSelect = MapSetup.createStratumSelectInteraction();
    this.stratumModify = MapSetup.createStratumModifyInteraction(this.stratumSelect, this.dataService, this.ps, this.proj);

    this.ps.processSubject.subscribe({
      next: (action: SubjectAction) => {
        switch (action.action) {
          case "remove": {
            console.log("remove process - handle in map, id: " + action.data)
            this.removeLayersByProcessId(action.data);
            break;
          }
          case "activate": {
            // TODO: implement interactive mode handling and remove iamodesubject
            break;
          }
        }
      }
    })
    this.ps.iaModeSubject.subscribe(iaMode => {
      this.handleIaMode(iaMode, this.proj);
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
                let edsupsu: EDSU_PSU = this.pds.acousticPSU != null && this.pds.acousticPSU.EDSU_PSU != null ? this.pds.acousticPSU.EDSU_PSU.find(edsupsu => edsupsu.EDSU == edsu) : null;
                // Connect EDSU_PSU to feature
                if (this.pds.acousticPSU != null && this.pds.acousticPSU.EDSU_PSU != null && edsupsu == null) {
                  console.log("edsu " + edsu + " not mapped");
                }
                f.set("edsupsu", edsupsu);
                // Get default any selection (not focused by user):
                MapSetup.updateEDSUSelection(f, this.pds.selectedPSU);
              })
            )
          break;
        }
        case "bioticAssignmentData": {
          this.updateStationSelection();
          break;
        }
        case "selectedPSU": {
          switch (this.ps.iaMode) {
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
                let res: ActiveProcessResult = this.ps.handleAPI(psuToUse != null ? await this.dataService.addEDSU(psuToUse, changedEDSUs,
                  this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise() :
                  await this.dataService.removeEDSU(changedEDSUs, this.ps.selectedProject.projectPath,
                    this.ps.selectedModel.modelName, this.ps.activeProcessId).toPromise());
              }
              //l.changed();
              //(<VectorSource>l.getSource()).changed();
              break;
            }
            case "bioticAssignment": {
              let selected: boolean = MapSetup.isStationSelected(fe, this.pds);
              MapSetup.selectStation(fe, this.ps, this.pds, this.dataService, !selected);
              MapSetup.updateStationSelection(fe, this.pds);
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
      case "none": {
        this.resetLayersToProcess(this.ps.activeProcessId);
        break;
      }
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
        let layerIdx = this.getNumLayersWithLayerType(iaMode);
        this.addLayerToProcess(this.ps.activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 300, data.stationPoints, proj, MapSetup.getStationPointStyleCache(layerIdx), false, 4, [data.stationInfo, data.haulInfo]));
        break;
      }
      case "EDSU": {
        this.resetLayersToProcess(this.ps.activeProcessId);
        let data: { EDSUPoints: string; EDSULines: string; EDSUInfo: NamedStringTable } = await this.dataService.getMapData(this.ps.selectedProject.projectPath, this.ps.selectedModel.modelName, this.ps.getActiveProcess().processID).toPromise();//MapSetup.getGeoJSONLayerFromURL("strata", '/assets/test/strata_test.json', s2, false)
        let layerIdx = this.getNumLayersWithLayerType(iaMode);
        this.addLayerToProcess(this.ps.activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode + "line", 200, data.EDSULines, proj, [MapSetup.getEDSULineStyle(layerIdx)], false, 2, []));
        this.addLayerToProcess(this.ps.activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 210, data.EDSUPoints, proj, MapSetup.getEDSUPointStyleCache(layerIdx), false, 3, [data.EDSUInfo]));
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
          MapSetup.updateStationSelection(f, this.pds);
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

import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapBrowserEvent } from 'ol';
import { platformModifierKeyOnly, shiftKeyOnly } from 'ol/events/condition';
import Feature from 'ol/Feature';
import TopoJSON from 'ol/format/TopoJSON';
import { Geometry } from 'ol/geom';
import { Draw, Modify, Select } from 'ol/interaction';
import { Layer, Vector } from 'ol/layer';
import OlMap from 'ol/Map';
import Overlay from 'ol/Overlay';
import { clearAllProjections, transform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import Source from 'ol/source/Vector';
import VectorSource from 'ol/source/Vector';
import OlView from 'ol/View';
import * as proj4x from 'proj4';

import { MapInfo } from '../data/MapInfo';
import { EDSU_PSU, Station_PSU } from '../data/processdata';
import { NamedStringIndex, NamedStringTable } from '../data/types';
import { DataService } from '../service/data.service';
import { ProcessDataService } from '../service/processdata.service';
import { ProjectService } from '../service/project.service';
import { MapSetup } from './MapSetup';
const proj4 = (proj4x as any).default;

import { Coordinate } from 'ol/coordinate';
import { get as getProjection } from 'ol/proj';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';

import { SubjectAction } from '../data/subjectaction';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, MapInteraction {
  @ViewChild('tooltip', { static: false }) tooltip: ElementRef;
  @Input() cm: ContextMenu;

  map: OlMap;
  coastLine: Vector<any>;
  grid: Vector<any>;
  view: OlView;
  layerMap: Map<string, Layer[]> = new Map();
  stratumSelect: Select;
  stratumModify: Modify;
  stratumDraw: Draw;
  overlay: Overlay;
  private m_Tool: string = 'freemove';
  proj = 'StoX_001_LAEA';
  currentLAEAOrigin: Coordinate; // the origin for the current dynamic LAEA
  mapInfo: MapInfo;
  contextMenu: MenuItem[];

  constructor(
    private dataService: DataService,
    private ps: ProjectService,
    private pds: ProcessDataService,
    private dialog: MatDialog
  ) {}

  resetInteraction() {
    this.tool = 'freemove';
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

  stratumExists(stratum: string): boolean {
    return this.pds.stratum.includes(stratum);
  }

  tools = [
    { tool: 'freemove', iclass: 'freemoveicon' },
    { tool: 'stratum-edit', iclass: 'editicon' },
    { tool: 'stratum-add', iclass: 'addicon' },
    { tool: 'zoom-in', iclass: 'zoominicon' },
    { tool: 'zoom-out', iclass: 'zoomouticon' },
  ];
  projectionsMenu = [
    {
      label: 'Lambert Azimuthal Equal Area Projection',
      command: e => {
        this.setProjectionProj4('StoX_001_LAEA');
        this.updateMapInfoInBackend();
      },
    },
    {
      label: 'Equirectangular Projection',
      command: e => {
        this.setProjectionProj4('StoX_002_Geographical');
        this.updateMapInfoInBackend();
      },
    },
  ];

  // Tool
  // ________________________________________________________________________________________________________________________________________________________
  public getToolEnabled(tool: string): boolean {
    switch (tool) {
      case 'freemove':
        return true;
      case 'stratum-edit':
        return this.ps.iaMode == 'stratum' && this.stratumSelect != null && this.stratumModify != null;
      case 'stratum-add':
      case 'zoom-in':
      case 'zoom-out':
      case 'stratum-delete':
        return this.ps.iaMode == 'stratum' && this.stratumDraw != null;
    }

    return false;
  }

  set tool(tool: string) {
    this.m_Tool = tool;
    this.resetInteractions();
    switch (tool) {
      case 'stratum-edit':
        this.map.getInteractions().extend([this.stratumSelect, this.stratumModify]);
        break;
      case 'stratum-add':
        if (this.map != null && this.map.getInteractions() != null && this.stratumDraw != null) {
          this.map.getInteractions().extend([this.stratumDraw]);
        }

        break;
      default:
    }
  }

  get tool(): string {
    return this.m_Tool;
  }

  // Tooltip
  // ________________________________________________________________________________________________________________________________________________________

  getTooltip(obj) {
    let res: string = '';

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] != 'object') {
        if (res.length > 0) {
          res += '<br>';
        }

        res = res + key + ': ' + obj[key];
      }
    }

    return res;
  }

  displayTooltip(evt: MapBrowserEvent<any>) {
    const pixel = evt.pixel;
    const features: Feature[] = [];

    this.map.forEachFeatureAtPixel(pixel, feature => {
      const layer: Vector<any> = feature.get('layer');

      if (layer != null && layer.get('hasTooltip')) {
        features.push(<Feature>feature);
      }
    });

    features.sort((f1, f2) => {
      return f2.get('layer').get('layerOrder') - f1.get('layer').get('layerOrder');
    });

    const feature: Feature = features.length > 0 ? features[0] : null;

    if (platformModifierKeyOnly(evt) && feature != null) {
      this.overlay.setPosition(evt.coordinate);
      this.tooltip.nativeElement.innerHTML = this.getTooltip(this.getTooltipProperties(feature));
      this.tooltip.nativeElement.style.display = '';

      return;
    }

    this.tooltip.nativeElement.style.display = 'none';
  }

  private getTooltipProperties(feature: Feature): { [key: string]: any } {
    const res: NamedStringIndex = {};
    const primaryIdx: NamedStringIndex = <NamedStringIndex>feature.get('primaryInfo');
    const secondaryIdx: NamedStringIndex[] = <NamedStringIndex[]>feature.get('secondaryInfo');

    if (primaryIdx != null) {
      Object.assign(res, primaryIdx);
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
  private updateAssignedStationSelection() {
    this.map
      .getLayers()
      .getArray()
      .filter(l => l.get('layerType') == 'station')
      .map(l => <VectorSource>(<Layer>l).getSource())
      .forEach(s =>
        s.getFeatures().forEach(f => {
          MapSetup.updateAssignedStationSelection(f, this.pds);
        })
      );
  }

  // Layer
  // ________________________________________________________________________________________________________________________________________________________
  getNumLayersWithLayerType(lt): number {
    return []
      .concat(...Array.from(this.layerMap.values())) // flatting by concatinated spread elements
      .filter(l => l.get('layerType') == lt).length; // filter and count up
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
    const aidx: number = this.ps.getProcessIdxById(pid);

    const idsToRemove: string[] = [];

    this.layerMap.forEach((value, key, map) => {
      const kidx: number = this.ps.getProcessIdxById(key);

      if (kidx >= aidx) {
        idsToRemove.push(key);
      }
    });
    idsToRemove.forEach(id => {
      this.removeLayersByProcessId(id);
    });
  }

  removeLayersByProcessId(id: string) {
    if (id != null) {
      const la = this.layerMap.get(id);

      if (la != null) {
        la.forEach(l => this.map.removeLayer(l));
      }

      this.layerMap.delete(id);
    }
  }

  // Projection
  // ________________________________________________________________________________________________________________________________________________________

  getProj(): string {
    return this.proj;
  }

  projectionCenter() {
    console.log('Projection center');
  }

  setProjectionProj4(newProjCode, cnt = null) {
    const newProj = getProjection(newProjCode);

    console.log('newProjCode: ' + newProjCode, ', newProj: ' + newProj + ', this.proj: ' + this.proj);
    let zoom = this.map.getView()?.getZoom();

    console.log('Existing Zoom: ' + zoom);
    if (zoom == null) {
      // Set default zoom if not existing
      zoom = this.mapInfo.zoom;
      console.log('Zoom: ' + zoom);
    }

    let center: Coordinate;

    if (cnt != null) {
      center = cnt;
    } else {
      center = this.map.getView()?.getCenter();
      if (center == null) {
        center = this.mapInfo.origin;
        console.log('Get view center from middle of projection extent: ' + center);
      } else {
        center = transform(center, this.proj, newProjCode);
      }
    }

    const newView = new OlView({
      projection: newProj,
      center,
      zoom,
    });

    this.map.setView(newView);
    this.map.removeLayer(this.grid);
    if (this.proj != newProjCode) {
      console.log('Converting features from ' + this.proj + ' to ' + newProjCode);
      this.map.getLayers().forEach(l =>
        (<VectorSource<Geometry>>(<Layer>l).getSource()).getFeatures().forEach(f => {
          f.getGeometry().transform(this.proj, newProjCode);
        })
      );
    }

    const centerLongitude: number = 0;

    this.grid = MapSetup.getGridLayer(newProjCode, centerLongitude);
    this.map.addLayer(this.grid);

    this.proj = newProjCode;
  }

  initProjections(origin: Coordinate) {
    clearAllProjections();
    if (this.currentLAEAOrigin == null) {
      this.currentLAEAOrigin = origin;
    }

    proj4.defs('StoX_001_LAEA', '+proj=laea +lat_0=' + origin[1] + ' +lon_0=' + origin[0] + ' +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
    proj4.defs('StoX_001_LAEA_PREV', '+proj=laea +lat_0=' + this.currentLAEAOrigin[1] + ' +lon_0=' + this.currentLAEAOrigin[0] + ' +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs');
    this.currentLAEAOrigin = origin;
    proj4.defs('StoX_002_Geographical', '+proj=longlat +ellps=WGS84 +units=degrees +no_defs');
    register(proj4);
    // const StoX_001_LAEA = getProjection('StoX_001_LAEA');
    //StoX_001_LAEA.setExtent(transformExtent([-80, -70, +100, +80], 'EPSG:4326', 'StoX_001_LAEA'));
  }

  async updateMapInfoInBackend() {
    this.mapInfo.zoom = this.map.getView().getZoom();
    this.mapInfo.origin = this.currentLAEAOrigin;
    this.mapInfo.projection = this.proj;
    await this.dataService.setMapInfo(this.mapInfo).toPromise();
  }

  // Init
  // ________________________________________________________________________________________________________________________________________________________

  private async getMapInfo() {
    console.log('Fetching map info from backend');
    try {
      const mapInfoString = await this.dataService.getMapInfo().toPromise();
      this.mapInfo = JSON.parse(mapInfoString);
    } catch (error) {
      console.error('Error fetching map info:', error);
      //TODO
    }
  }

  /**
   * To add a new/ different map file, you need to find a topojson file with a world map
   * (or a map of part of the world) and make sure that it's named correctly inside of the file.
   * The layer is called 'world' and need to be named the same in the topojson. To achieve this
   * you can search the topojson for 'objects' and name it like this:
   *
   * "objects":{"world":{"type":"GeometryCollection","geometries":[{"arcs":
   *
   * The important part is that "world" is written as in the example above. Leave the rest as is.
   *
   * If the file is to large, you can shrink the size using http://mapshaper.org. This will decrease the
   * detail level, but will also decrease the filesize. Reducing the filesize with about 80 % gives
   * a detail level of around 30 % of the original.
   *
   */

  private createCoastLine() {
    console.log('Creating coastline');
    this.coastLine = new Vector({
      source: new Source({
        //url: 'assets/landflate_verden_gap180.json', //original
        //url: 'assets/topology_world_fine.json',
        //url: 'assets/topology_only_europe_fine.json',
        url: 'assets/topology_world_fine_details.json',
        format: new TopoJSON({
          // don't want to render the full world polygon (stored as 'land' layer),
          // which repeats all countries
          layers: ['world'],
        }),
        overlaps: false,
      }),
      style: MapSetup.getMapStyle(),
      zIndex: 11,
    });
  }

  private createMap() {
    this.map = new OlMap({
      target: 'map',
      controls: [MapSetup.getMousePositionControl()],
    });
  }

  private createOverlay() {
    this.overlay = new Overlay({
      element: this.tooltip.nativeElement,
      offset: [10, 0],
      positioning: 'center-left',
    });
    if (this.map != null) {
      this.map.addOverlay(this.overlay);
    }
  }

  private initializeStratumInteractions() {
    this.stratumSelect = MapSetup.createStratumSelectInteraction();
    this.stratumModify = MapSetup.createStratumModifyInteraction(this.stratumSelect, this.dataService, this.ps, this);
  }

  private handleProcessAction(action: SubjectAction): void {
    switch (action.action) {
      case 'remove': {
        console.log('remove process - handle in map, id: ' + action.data);
        this.removeLayersByProcessId(action.data);
        break;
      }

      case 'activate': {
        // TODO: implement interactive mode handling and remove iamodesubject
        break;
      }
    }
  }

  private handleAcousticPSU() {
    this.map
      .getLayers()
      .getArray()
      .filter(l => l.get('layerType') == 'EDSU')
      .map(l => <VectorSource>(<Layer>l).getSource())
      .forEach(s =>
        s.getFeatures().forEach(f => {
          const edsu: string = f.get('EDSU');
          const edsuPsu: EDSU_PSU = this.pds.acousticPSU?.EDSU_PSU?.find(edsuPsu => edsuPsu.EDSU == edsu);

          // Connect EDSU_PSU to feature
          if (edsuPsu == null) {
            console.log('edsu ' + edsu + ' not mapped');
          }

          f.set('edsupsu', edsuPsu);
          // Get default any selection (not focused by user):
          MapSetup.updateEDSUSelection(f, this.pds.selectedPSU);
        })
      );
  }

  private handleBioticPSU(evt: string): void {
    this.map
      .getLayers()
      .getArray()
      .filter(l => l.get('layerType') == 'station')
      .map(l => <VectorSource>(<Layer>l).getSource())
      .forEach(s =>
        s.getFeatures().forEach(f => {
          const station: string = f.get('Station');
          const stationPsu: Station_PSU = this.pds.bioticPSU?.Station_PSU?.find(stationPsu => stationPsu.Station == station);

          // Connect Station_PSU to feature
          if (stationPsu == null) {
            console.log('station ' + station + ' not mapped');
          }

          f.set('stationpsu', stationPsu);
          // Get default any selection (not focused by user):
          MapSetup.updateStationSelection(f, this.pds.selectedPSU, evt);
        })
      );
  }

  private handleSelectedPSU(evt: string): void {
    switch (this.ps.iaMode) {
      case 'bioticAssignment': {
        // drop to EDSU selection to get EDSU focus change
        this.updateAssignedStationSelection();
      }

      case 'acousticPSU': {
        this.map
          .getLayers()
          .getArray()
          .filter(l => l.get('layerType') == 'EDSU')
          .map(l => <VectorSource>(<Layer>l).getSource())
          .forEach(s =>
            s.getFeatures().forEach(f => {
              MapSetup.updateEDSUSelection(f, this.pds.selectedPSU);
            })
          );
        break;
      }

      case 'bioticPSU': {
        this.map
          .getLayers()
          .getArray()
          .filter(l => l.get('layerType') == 'station')
          .map(l => <VectorSource>(<Layer>l).getSource())
          .forEach(s =>
            s.getFeatures().forEach(f => {
              MapSetup.updateStationSelection(f, this.pds.selectedPSU, evt);
            })
          );
        break;
      }
    }
  }

  private handleSelectedStratum() {
    // Remove the check for iamode to update selected when always changed
    let handleStratumSelection: boolean = false;

    switch (this.ps.iaMode) {
      case 'stratum':
      case 'acousticPSU':
      case 'bioticPSU':
      case 'bioticAssignment': {
        handleStratumSelection = true;
        break;
      }

      default:
        handleStratumSelection = this.pds.selectedStratum == null;
    }

    if (handleStratumSelection) {
      this.map
        .getLayers()
        .getArray()
        .filter(l => l.get('layerType') == 'stratum')
        .map(l => <VectorSource>(<Layer>l).getSource())
        .forEach(s =>
          s.getFeatures().forEach(f => {
            MapSetup.updateStratumSelection(f, this.pds.selectedStratum);
          })
        );
    }
  }

  private processDataEventHandler(evt: string): void {
    switch (evt) {
      case 'acousticPSU': {
        this.handleAcousticPSU();
        break;
      }

      case 'bioticPSU': {
        this.handleBioticPSU(evt);
        break;
      }

      case 'bioticAssignmentData': {
        this.updateAssignedStationSelection();
        break;
      }

      case 'changedEDSU':
      case 'changedStation':
      case 'selectedPSU': {
        this.handleSelectedPSU(evt);
        break;
      }

      case 'selectedStratum': {
        this.handleSelectedStratum();
        break;
      }
    }
  }

  private async handleAcousticPSUClickEvent(l: Layer, e: MapBrowserEvent<any>, fe: Feature<Geometry>) {
    // Controlling focus.
    let prevClickIndex = l.get('lastClickedIndex'); // handle range selection with respect to last clicked index

    const clickedIndex = (<VectorSource>l.getSource()).getFeatures().findIndex(fe1 => fe1 === fe);

    l.set('lastClickedIndex', clickedIndex);
    if (!shiftKeyOnly(e) || prevClickIndex == null) {
      prevClickIndex = clickedIndex;
    }

    const fi1 = (<VectorSource>l.getSource()).getFeatures()[prevClickIndex];

    const edsuPsu1: EDSU_PSU = fi1.get('edsupsu');

    if (edsuPsu1 == null) {
      console.log(fi1.get('EDSU') + ' is missing edsu  for ' + fi1.get('EDSU') + ' layer ' + l.get('name'));
    }

    let psuToUse: string = edsuPsu1.PSU;

    if (prevClickIndex == clickedIndex) {
      psuToUse = edsuPsu1.PSU != this.pds.selectedPSU ? this.pds.selectedPSU : null;
    }

    const iFirst = Math.min(prevClickIndex, clickedIndex);
    const iLast = Math.max(prevClickIndex, clickedIndex);
    const changedEDSUs: string[] = [];

    for (let idx: number = iFirst; idx <= iLast; idx++) {
      const fi = (<VectorSource>l.getSource()).getFeatures()[idx];

      const edsuPsu: EDSU_PSU = fi.get('edsupsu');

      if (edsuPsu != null) {
        if (edsuPsu.PSU != psuToUse) {
          changedEDSUs.push(edsuPsu.EDSU);
          edsuPsu.PSU = psuToUse;
          MapSetup.updateEDSUSelection(fi, this.pds.selectedPSU);
        }
      }
    }

    if (changedEDSUs.length > 0) {
      const { selectedProject, selectedModel, activeProcessId } = this.ps;
      const { projectPath } = selectedProject;
      const { modelName } = selectedModel;
      const addOrRemoveOb = psuToUse != null ? this.dataService.addEDSU(psuToUse, changedEDSUs, projectPath, modelName, activeProcessId) : this.dataService.removeEDSU(changedEDSUs, projectPath, modelName, activeProcessId);
      this.ps.handleAPI(await addOrRemoveOb.toPromise());
    }
  }

  private async handleBioticPSUClickEvent(l: Layer, e: MapBrowserEvent<any>, fe: Feature<Geometry>) {
    // Controlling focus.
    //let farr: Feature[] = (<VectorSource>l.getSource()).getFeatures();
    let prevClickIndex = l.get('lastClickedIndex'); // handle range selection with respect to last clicked index
    const clickedIndex = (<VectorSource>l.getSource()).getFeatures().findIndex(fe1 => fe1 === fe);
    l.set('lastClickedIndex', clickedIndex);
    if (!shiftKeyOnly(e) || prevClickIndex == null) {
      prevClickIndex = clickedIndex;
    }

    const fi1 = (<VectorSource>l.getSource()).getFeatures()[prevClickIndex];
    const stationPsu1: Station_PSU = fi1.get('stationpsu');
    if (stationPsu1 == null) {
      console.log(fi1.get('Station') + ' is missing station for ' + fi1.get('Station') + ' layer ' + l.get('name'));
    }

    let psuToUse: string = stationPsu1.PSU;
    if (prevClickIndex == clickedIndex) {
      psuToUse = stationPsu1.PSU != this.pds.selectedPSU ? this.pds.selectedPSU : null;
    }

    const iFirst = Math.min(prevClickIndex, clickedIndex);
    const iLast = Math.max(prevClickIndex, clickedIndex);
    const changedStations: string[] = [];
    for (let idx: number = iFirst; idx <= iLast; idx++) {
      const fi = (<VectorSource>l.getSource()).getFeatures()[idx];
      const stationPsu: Station_PSU = fi.get('stationpsu');
      if (stationPsu != null) {
        if (stationPsu.PSU != psuToUse) {
          changedStations.push(stationPsu.Station);
          stationPsu.PSU = psuToUse;
          MapSetup.updateStationSelection(fi, this.pds.selectedPSU, this.ps.iaMode);
        }
      }
    }

    if (changedStations.length > 0) {
      const { selectedProject, selectedModel, activeProcessId } = this.ps;
      const { projectPath } = selectedProject;
      const { modelName } = selectedModel;
      const addOrRemoveOb = psuToUse != null ? this.dataService.addStation(psuToUse, changedStations, projectPath, modelName, activeProcessId) : this.dataService.removeStation(changedStations, projectPath, modelName, activeProcessId);
      this.ps.handleAPI(await addOrRemoveOb.toPromise());
    }
  }

  private handleBioticAssignment(fe: Feature<Geometry>) {
    const selected: boolean = MapSetup.isStationSelected(fe, this.pds);

    MapSetup.selectAssignedStation(fe, this.ps, this.pds, this.dataService, !selected);
    MapSetup.updateAssignedStationSelection(fe, this.pds);
  }

  private getClickableFeatures(pixel: number[], e: MapBrowserEvent<any>): Feature[] {
    const farr: Feature[] = [];

    this.map.forEachFeatureAtPixel(e.pixel, (f, l) => {
      if (l == null || f == null) {
        return;
      }

      const layerType: string = l.get('layerType');

      const { iaMode } = this.ps;
      if ((iaMode == 'acousticPSU' && layerType == 'EDSU') || (layerType == 'station' && (iaMode == 'bioticPSU' || iaMode == 'bioticAssignment'))) {
        farr.push(<Feature>f);
      }
    });

    const sortByZIndex = (a: Feature, b: Feature) => (<Layer>a.get('layer')).getZIndex() - (<Layer>b.get('layer')).getZIndex();

    farr
      .sort(sortByZIndex)
      .slice(0, 1)
      .forEach(async f => {
        const l: Layer = <Layer>f.get('layer');

        console.log('Z index: ' + l.getZIndex());
        const fe: Feature = <Feature>f;

        if (this.pds.selectedPSU == null) {
          return;
        }

        switch (this.ps.iaMode) {
          case 'acousticPSU': {
            this.handleAcousticPSUClickEvent(l, e, fe);
            break;
          }

          case 'bioticPSU': {
            this.handleBioticPSUClickEvent(l, e, fe);
            break;
          }

          case 'bioticAssignment': {
            this.handleBioticAssignment(fe);
            break;
          }
        }
      });

    return farr;
  }

  async ngOnInit() {
    await this.getMapInfo();
    this.initProjections(this.mapInfo.origin);
    this.createCoastLine();

    console.log('Creating map');
    this.createMap();

    console.log('Create overlay');
    this.createOverlay();

    this.map.addLayer(this.coastLine);

    this.setProjectionProj4(this.mapInfo.projection);

    this.initializeStratumInteractions();

    this.ps.processSubject.subscribe({
      next: (action: SubjectAction) => {
        this.handleProcessAction(action);
      },
    });

    this.ps.iaModeSubject.subscribe(iaMode => {
      this.handleIaMode(iaMode, this.proj);
    });

    this.pds.processDataSubject.subscribe(async evt => {
      this.processDataEventHandler(evt);
    });

    this.map.on('singleclick', e => {
      this.getClickableFeatures(e.pixel, e);
    });

    // Event handlers
    // ________________________________________________________________________________________________________________________________________________________

    this.map.on('change', function (evt) {
      console.info(evt);
    });

    this.map.on('pointermove', e => this.displayTooltip(e));
    this.map.getViewport().addEventListener('contextmenu', evt => {
      this.openCm(evt);
    });
    this.map.getView().on('change:resolution', async _evt => {
      await this.updateMapInfoInBackend();
    });
  }

  async handleIaMode(iaMode: string, proj) {
    // console.log('pspspspsps', this.ps);
    const { selectedProject, selectedModel, activeProcessId } = this.ps;
    const { projectPath } = selectedProject;
    const { modelName } = selectedModel;

    const layerName: string = this.ps.getActiveProcess() != null ? this.ps.getActiveProcess().processID + '-' + iaMode : null;

    this.resetInteractions();

    switch (iaMode) {
      case 'none': {
        this.resetLayersToProcess(activeProcessId);
        break;
      }

      case 'reset': {
        this.layerMap.forEach((value, _key, _map) => {
          value.forEach(l => this.map.removeLayer(l));
        });
        this.layerMap.clear();
        break;
      }

      case 'station': {
        this.resetLayersToProcess(activeProcessId);
        const mapData = await this.dataService.getMapData(projectPath, modelName, this.ps.getActiveProcess().processID).toPromise();
        const data: { stationPoints: string; stationInfo: NamedStringTable; haulInfo: NamedStringTable } = mapData;

        const layerIdx = this.getNumLayersWithLayerType(iaMode);

        const styles = MapSetup.getStationPointStyleCache(layerIdx);

        this.addLayerToProcess(activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 300, data.stationPoints, proj, styles, false, 4, [data.stationInfo, data.haulInfo]));
        break;
      }

      case 'EDSU': {
        this.resetLayersToProcess(activeProcessId);
        const mapData = await this.dataService.getMapData(projectPath, modelName, this.ps.getActiveProcess().processID).toPromise(); //MapSetup.getGeoJSONLayerFromURL("strata", '/assets/test/strata_test.json', s2, false)
        const data: { EDSUPoints: string; EDSULines: string; EDSUInfo: NamedStringTable } = mapData;

        const layerIdx = this.getNumLayersWithLayerType(iaMode);

        this.addLayerToProcess(activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode + 'line', 200, data.EDSULines, proj, [MapSetup.getEDSULineStyle(layerIdx)], false, 2, []));
        this.addLayerToProcess(activeProcessId, MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 210, data.EDSUPoints, proj, MapSetup.getEDSUPointStyleCache(layerIdx), false, 3, [data.EDSUInfo]));
        break;
      }

      case 'stratum': {
        this.resetLayersToProcess(activeProcessId);
        const data: { stratumPolygon: string } = await this.dataService.getMapData(projectPath, modelName, this.ps.getActiveProcess().processID).toPromise(); //MapSetup.getGeoJSONLayerFromURL("strata", '/assets/test/strata_test.json', s2, false)

        const layer: Layer = MapSetup.getGeoJSONLayerFromFeatureString(layerName, iaMode, 100, data.stratumPolygon, proj, [MapSetup.getStratumStyle(), MapSetup.getFocusedStratumStyle()], false, 1, []);

        this.addLayerToProcess(activeProcessId, layer);
        this.stratumDraw = MapSetup.createStratumDrawInteraction(this.dialog, <VectorSource>layer.getSource(), this.dataService, this.ps, proj, this);
        break;
      }

      default: {
        // console.log('Unknown iaMode: ' + iaMode);
      }
    }

    this.tool = 'freemove';
  }

  onResized(_event: ResizeObserverEntry) {
    if (this.map != null) {
      this.map.updateSize();
    }
  }

  async prepCm() {
    // comment: add list of outputtablenames to runModel result.
    const m: MenuItem[] = [];

    const originHandler = evt => {
      if (this.proj == 'StoX_001_LAEA') {
        let coords = this.map.getEventCoordinate(evt.originalEvent);

        console.log(coords);
        coords = transform(coords, this.proj, 'EPSG:4326');
        console.log(coords);
        if (isNaN(coords[0]) || isNaN(coords[1])) {
          return;
        }

        console.log('Init projection with new coords' + coords);
        //this.setProjectionProj4('EPSG:4326');
        this.initProjections(coords);
        this.proj = 'StoX_001_LAEA_PREV';
        this.setProjectionProj4('StoX_001_LAEA', coords);
        this.updateMapInfoInBackend();
      }
    };

    m.push({ label: 'Select projection origin', icon: 'rib absa originicon', command: originHandler.bind(this) });

    this.cm.model = m;
  }

  async openCm(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    await this.prepCm();
    this.cm.show(event);

    return false;
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

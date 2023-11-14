import { MatDialog } from '@angular/material/dialog';
import MousePosition from 'ol/control/MousePosition';
import { Coordinate } from 'ol/coordinate';
import { createStringXY } from 'ol/coordinate';
import { shiftKeyOnly, singleClick } from 'ol/events/condition';
import { FeatureLike } from 'ol/Feature';
import Feature from 'ol/Feature';
import { GeoJSON } from 'ol/format';
import { MultiPoint } from 'ol/geom';
import Point from 'ol/geom/Point';
import { Draw, Modify, Select } from 'ol/interaction';
import { Layer, Vector } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { StyleFunction } from 'ol/style/Style';

import { ActiveProcessResult } from '../data/runresult';
import { StratumNameDlgComponent } from '../dlg/stratum-name-dlg/stratum-name-dlg.component';
import { DataService } from '../service/data.service';
import { ProcessDataService } from '../service/processdata.service';
import { ProjectService } from '../service/project.service';
import { HTMLUtil } from '../utils/htmlutil';
import { EDSU_PSU, Station_PSU, Stratum_PSU } from './../data/processdata';
import { NamedStringIndex, NamedStringTable } from './../data/types';
import { Color } from './Color';
import { MapSymbol } from './maptypes';
declare const Buffer;

export class MapSetup {
  //public static DISTANCE_POINT_COLOR: string = 'rgb(248, 211, 221)';
  public static DISTANCE_ABSENT_POINT_COLOR: string = 'rgb(253, 244, 247)';
  public static DISTANCE_POINT_SELECTED_COLOR: string = 'rgb(166, 200, 176)';
  //public static STATION_POINT_COLOR: string = 'rgb(56, 141, 226, 0.95)';
  public static STATION_POINT_SELECTED_COLOR: string = 'rgb(238, 215, 123, 0.95)';
  public static POINT_OUTLINE_COLOR: string = 'rgb(0, 0, 0, 0.3)';
  public static BG_COLOR = 'rgb(252, 255, 198)';

  static getMapStyle() {
    return new Style({
      fill: new Fill({
        color: 'rgb(252, 255, 198)',
      }),
      stroke: new Stroke({
        color: Color.darken(MapSetup.BG_COLOR, 0.87),
        width: 1,
      }),
    });
  }

  static getPointStyleRect(fillColor: string, outlineColor: string, size: number): Style {
    return MapSetup.getPointStyle(fillColor, outlineColor, 1, { shape: 'rect', width: size, height: size });
  }

  static getPointStyleCircle(fillColor: string, outlineColor: string, size: number): Style {
    return MapSetup.getPointStyle(fillColor, outlineColor, 1, { shape: 'circle', radius: size });
  }

  static getPointStyle(fillColor: string, outlineColor: string, strokeWidth: number, symb: MapSymbol): Style {
    let symbFormatted: string = symb.shape,
      svgWidth: number = null,
      svgHeight: number = null;
    const halfStrokeWidth: number = strokeWidth / 2;

    switch (
      symb.shape // type-guard for algebraic type (discriminant union)
    ) {
      case 'rect':
        symbFormatted += HTMLUtil.formatTagPropPx('x', halfStrokeWidth) + HTMLUtil.formatTagPropPx('y', halfStrokeWidth) + HTMLUtil.formatTagPropPx('width', symb.width) + HTMLUtil.formatTagPropPx('height', symb.height);
        svgWidth = symb.width + strokeWidth;
        svgHeight = symb.height + strokeWidth;
        break;

      case 'circle':
        const cx: number = symb.radius + halfStrokeWidth,
          cy: number = cx;

        symbFormatted += HTMLUtil.formatTagPropPx('cx', cx) + HTMLUtil.formatTagPropPx('cy', cy) + HTMLUtil.formatTagPropPx('r', symb.radius);
        svgWidth = symb.radius * 2 + strokeWidth;
        svgHeight = svgWidth;
        break;
    }

    const svg = '<svg width="' + svgWidth + 'px" height="' + svgHeight + 'px" version="1.1" xmlns="http://www.w3.org/2000/svg">' + '<' + symbFormatted + HTMLUtil.formatTagProp('fill', fillColor) + HTMLUtil.formatTagPropPx('stroke-width', strokeWidth) + HTMLUtil.formatTagProp('stroke', outlineColor) + '/>' + '</svg>';

    const style = new Style({
      image: new Icon({
        opacity: 1,
        src: 'data:image/svg+xml;utf8,' + svg,
        scale: 1.0,
      }),
    });

    return style;
  }

  static getLineStyle(strokeColor: string, width: number) {
    return new Style({
      stroke: new Stroke({
        color: strokeColor,
        width,
      }),
    });
  }

  // This function lets the feature determine by callback the selection of style into the stylecache.
  static getStyleCacheFunction(): StyleFunction {
    return (feature: FeatureLike, resolution: number) => {
      const styleCache: Style[] = feature.get('styleCache');

      const styleSelection: number = feature.get('selection');

      return styleCache[styleSelection];
    };
  }

  static getEDSUPointStyleCache(layerIdx: number): Style[] {
    const edsuRadius: number = 6; // px

    const pointColor: string = MapSetup.DISTANCE_POINT_COLORS[layerIdx % MapSetup.DISTANCE_POINT_COLORS.length];

    const outlineColor: string = 'rgb(0, 0, 0, 0.1)';

    const focusColor: string = Color.darken(MapSetup.DISTANCE_POINT_SELECTED_COLOR, 0.5);

    return [
      MapSetup.getPointStyleCircle(pointColor, outlineColor, edsuRadius), // 0: present
      MapSetup.getPointStyleCircle(MapSetup.DISTANCE_POINT_SELECTED_COLOR, outlineColor, edsuRadius), // 1: selected
      MapSetup.getPointStyleCircle(focusColor, outlineColor, edsuRadius), // 2: focused
      MapSetup.getPointStyleCircle(MapSetup.DISTANCE_ABSENT_POINT_COLOR, outlineColor, edsuRadius), // 3 : absent
    ];
  }

  static STATION_POINT_COLORS: string[] = ['rgb(92,172,238)', 'rgb(78,96,188)', 'rgb(88,0,139)', 'rgb(169,10,186)', 'rgb(199,21,90)'];
  static DISTANCE_POINT_COLORS: string[] = ['rgb(255,192,203)', 'rgb(196,96,101)', 'rgb(139,0,0)', 'rgb(188,59,0)', 'rgb(238,118,0)'];

  static getStationPointStyleCache(layerIdx: number): Style[] {
    const pointColor = MapSetup.STATION_POINT_COLORS[layerIdx % MapSetup.STATION_POINT_COLORS.length];
    const symSize: number = 14;

    return [
      MapSetup.getPointStyleRect(pointColor, MapSetup.POINT_OUTLINE_COLOR, symSize), // Not selected (previous station layer color)
      MapSetup.getPointStyleRect(Color.darken(MapSetup.DISTANCE_POINT_SELECTED_COLOR, 0.5), MapSetup.POINT_OUTLINE_COLOR, symSize), // Used PSU
      MapSetup.getPointStyleRect(Color.darken(MapSetup.DISTANCE_POINT_SELECTED_COLOR, 0.3), MapSetup.POINT_OUTLINE_COLOR, symSize), // Selected PSU
    ];
  }

  static getEDSULineStyle(layerIdx: number): Style {
    const ptCol = MapSetup.DISTANCE_POINT_COLORS[layerIdx % MapSetup.DISTANCE_POINT_COLORS.length];

    return MapSetup.getLineStyle(Color.darken(ptCol, 0.9), 2);
  }

  static getPolygonStyle(fillColor: string, strokeColor: string, strokeWidth: number): Style {
    return new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth,
      }),
      fill: new Fill({
        color: fillColor,
      }),
    });
  }

  static getStratumStyle(): Style {
    return MapSetup.getPolygonStyle('rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.2)', 1);
  }

  static getFocusedStratumStyle(): Style {
    return MapSetup.getPolygonStyle('rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.3)', 1);
  }

  static getStratumNodeStyle(): Style {
    const s: Style = MapSetup.getPointStyleRect('rgba(255, 0, 0, 0.7)', MapSetup.POINT_OUTLINE_COLOR, 6);

    s.setGeometry(f => {
      const coordinates: Coordinate[] = [].concat(...(<Point>f.getGeometry()).getCoordinates());

      return new MultiPoint(coordinates);
    });

    return s;
  }

  static getStratumSelectStyle(): Style {
    return MapSetup.getPolygonStyle('rgba(255, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)', 2);
  }

  static createStratumModifyInteraction(select: Select, dataService: DataService, ps: ProjectService, mapInteraction: MapInteraction) {
    const m: Modify = new Modify({
      features: select.getFeatures() /*,
                        deleteCondition: e => singleClick(e) && shiftKeyOnly(e)*/,
    });

    m.on('modifyend', async function (e) {
      // Add the features back to API.
      //console.log("> " + JSON.stringify(e.features.getArray()));
      const fcloned: Feature[] = e.features.getArray().map(f => {
        const f2: Feature = (f as Feature).clone();

        f2.set('layer', null);
        f2.set('styleCache', null);

        return f2;
      });

      console.log('> ' + JSON.stringify(fcloned));

      const s: string = new GeoJSON().writeFeatures(fcloned, { featureProjection: mapInteraction.getProj(), dataProjection: 'EPSG:4326' });

      /*let s2 : Feature[] = (new GeoJSON).readFeatures(JSON.parse(s), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326',
            })*/
      //console.log("> " + s);
      ps.handleAPI(await dataService.modifyStratum(s, ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise());
    });

    return m;
  }

  static createStratumSelectInteraction() {
    return new Select({
      condition: singleClick,
      toggleCondition: shiftKeyOnly,
      layers(layer) {
        return layer.get('layerType') == 'stratum';
      },
      style: [MapSetup.getStratumSelectStyle(), MapSetup.getStratumNodeStyle()],
      multi: false,
    });
  }

  static createStratumDrawInteraction(dialog: MatDialog, source: VectorSource, dataService: DataService, ps: ProjectService, proj: string, mapInteraction: MapInteraction) {
    const d: Draw = new Draw({
      source,
      type: 'Polygon',
    });

    d.on('drawend', async e => {
      // Add the features back to API.
      /*let s2 : Feature[] = (new GeoJSON).readFeatures(JSON.parse(s), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326',
            })*/

      console.log('> ' + 'get a name of the strata');
      const dialogRef = dialog.open(StratumNameDlgComponent, {
        width: '250px',
        disableClose: true,
        data: { stratum: '', mapInteraction },
      });

      const f: Feature = e.feature.clone(); // survive event e change after subdialog by cloning feature

      const strataName: any = await dialogRef.afterClosed().toPromise();

      /*            let f2 : Feature = (new GeoJSON).readFeatures(JSON.parse(stratum), {
                            dataProjection: 'EPSG:4326',
                            featureProjection: proj
                        })*/
      console.log('> ' + 'Strata name ' + strataName + ' with hex ' + MapSetup.toHex(strataName));
      if (typeof strataName == 'string') {
        // a valid stratum name has been entered
        f.setProperties({ StratumName: strataName });
        const stratum: string = new GeoJSON().writeFeatures([f], { featureProjection: proj, dataProjection: 'EPSG:4326' });

        console.log('> ' + stratum);
        const res: ActiveProcessResult = ps.handleAPI(await dataService.addStratum(stratum, ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise());

        console.log('> ' + 'res :' + JSON.stringify(res));
        ps.iaMode = 'stratum'; // trigger the gui
      }

      mapInteraction.resetInteraction();
    });

    return d;
  }

  // Hex helper
  static toHex(str: string) {
    let result = '';

    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }

    return result;
  }

  /**
   * getGEOJSONLayerFromURL - create a GEOJSON layer
   * @param name
   * @param url
   * @param style
   * @param selectable
   */
  static getGeoJSONLayerFromFeatureString(name: string, layerType: string, zIndex: number, feat: string, proj: string, style: Style[], selectable: boolean, layerOrder: number, infoTables: NamedStringTable[]): Layer {
    const s: VectorSource = new VectorSource({
      format: new GeoJSON(),
      useSpatialIndex: false,
    });

    const v: Vector<any> = new Vector<any>({
      source: s,
      style: MapSetup.getStyleCacheFunction(),
      zIndex,
    });

    console.log('layertype', layerType);
    // Set layer properties
    v.set('selectable', selectable);
    v.set('name', name);
    v.set('layerType', layerType);
    v.set('style', style);
    v.set('hasTooltip', true);
    v.set('layerOrder', layerOrder);
    v.set('infoTables', infoTables);

    s.on('addfeature', evt => {
      evt.feature.set('layer', v);
      evt.feature.set('styleCache', style);
      //evt.feature.set("absent", false); // this property must be provided in geojson
      evt.feature.set('selection', 0);

      if (layerType == 'EDSU') {
        MapSetup.updateEDSUSelection(evt.feature, null);
      }

      if (layerType == 'station') {
        MapSetup.updateStationSelection(evt.feature, null);
      }

      if (layerType == 'stratum') {
        MapSetup.updateStratumSelection(evt.feature, null);
      }

      MapSetup.connectInfoProperties(evt.feature);
    });
    s.addFeatures(
      new GeoJSON().readFeatures(JSON.parse(feat), {
        dataProjection: 'EPSG:4326',
        featureProjection: proj,
      })
    );

    return v;
  }

  /** Connects primary and secondary tables to a given feature */
  public static connectInfoProperties(feature: Feature) {
    const l: Layer = <Layer>feature.get('layer');

    const lt: string = <string>l.get('layerType');

    let infoTables: NamedStringTable[] = <NamedStringTable[]>l.get('infoTables');

    let primaryKeyName: string = null;

    let secondaryKeyName: string = null;

    let primaryKeyValue: string = null;

    let primaryTable: NamedStringTable = null;

    let secondaryTable: NamedStringTable = null;

    switch (lt) {
      case 'station': {
        primaryKeyName = 'Station';
        secondaryKeyName = 'Haul';
        break;
      }

      case 'EDSU': {
        primaryKeyName = 'EDSU';
        break;
      }

      case 'stratum': {
        primaryKeyName = 'StratumName';
        const stratumIndex: NamedStringIndex = {};

        stratumIndex[primaryKeyName] = feature.get(primaryKeyName);
        infoTables = [[stratumIndex]];
        break;
      }
    }

    if (primaryKeyName != null) {
      primaryKeyValue = feature.get(primaryKeyName);
    }

    primaryTable = infoTables.length > 0 ? infoTables[0] : null;
    secondaryTable = infoTables.length > 1 ? infoTables[1] : null;
    //Lookup primary key "Station": "2017102/4/2017/4174/2/160" into Station table
    if (primaryTable != null && primaryKeyName != null && primaryKeyValue != null) {
      const primaryInfoLookup: NamedStringIndex = primaryTable.find(idx => idx[primaryKeyName] == primaryKeyValue);

      feature.set('primaryInfo', primaryInfoLookup);
      //Lookup primary key "Station": "2017102/4/2017/4174/2/160" into Haul table
      if (secondaryTable != null) {
        const secondaryTable: NamedStringTable = infoTables[1];

        const secondaryInfoLookup: NamedStringIndex[] = secondaryTable.filter(idxs => idxs[primaryKeyName] == primaryKeyValue);

        feature.set('secondaryInfo', secondaryInfoLookup);
      }
    }
  }

  public static getGridLayer(proj, centerLongitude: number): Vector<any> {
    const gridLines = {
      type: 'FeatureCollection',
      features: [],
    };

    const style = new Style({
      stroke: new Stroke({
        color: 'rgb(223, 242, 255)',
        width: 1,
      }),
    });

    const lines = [];

    // Define the longitude 120 degrees to each side of the centerLongitude:
    for (let iy = -85; iy <= 85; iy += 5) {
      const line = [];

      for (let ix = centerLongitude - 175; ix <= centerLongitude + 175; ix += 5) {
        line.push([ix, iy]);
      }

      lines.push(line);
    }

    for (let ix = centerLongitude - 175; ix <= centerLongitude + 175; ix += 5) {
      const line = [];

      for (let iy = -85; iy <= 85; iy += 5) {
        line.push([ix, iy]);
      }

      lines.push(line);
    }

    lines.forEach(l =>
      gridLines.features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: l,
        },
      })
    );
    const s: VectorSource = new VectorSource({
      format: new GeoJSON(),
      features: new GeoJSON().readFeatures(gridLines, {
        dataProjection: 'EPSG:4326',
        featureProjection: proj,
      }),
    });

    const v: Vector<any> = new Vector({
      source: s,
      style,
      zIndex: 10,
    });

    s.on('addfeature', ft => {
      ft.feature.set('layer', v);
    });

    // Set layer properties
    v.set('selectable', false);
    v.set('name', 'grid');
    v.set('layerType', 'grid');
    v.set('style', style);

    return v;
  }

  static getMousePositionControl() {
    return new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326',
      // comment the following two lines to have the mouse position
      // be placed within the map.
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      placeholder: '&nbsp;',
    });
  }

  static updateEDSUSelection(f: Feature, selectedPSU) {
    const edsuPsu: EDSU_PSU = f.get('edsupsu');
    const selected: boolean = edsuPsu?.PSU != null && edsuPsu.PSU.length > 0 && edsuPsu.PSU !== 'NA';
    const focused: boolean = selected && selectedPSU != null && edsuPsu.PSU == selectedPSU;
    const selection = focused != null && focused ? 2 : selected != null && selected ? 1 : 0;

    f.set('selection', selection); // Set the style selection
  }

  static updateStationSelection(f: Feature, selectedPSU) {
    const stationPsu: Station_PSU = f.get('stationpsu');
    const selected: boolean = stationPsu?.PSU != null && stationPsu.PSU.length > 0 && stationPsu.PSU !== 'NA';
    const focused: boolean = selected && selectedPSU != null && stationPsu.PSU == selectedPSU;
    const selection = focused != null && focused ? 2 : selected != null && selected ? 1 : 0;

    // console.log('> ' + 'updateStationSelection: ', stationPsu, selection);

    // Update style for station layer
    // 0: not selected by any PSU
    // 1: selected by some PSU
    // 2: selected by selected PSU
    f.set('selection', selection);
  }

  static updateStratumSelection(f: Feature, selectedStratum) {
    const stratumName = f.get('StratumName');

    const focused: boolean = stratumName != null && stratumName.length != null && selectedStratum != null && stratumName == selectedStratum;

    f.set('selection', focused ? 1 : 0);
  }

  static isStationSelected(f: Feature, pds: ProcessDataService): boolean {
    const secInfos: NamedStringIndex[] = f.get('secondaryInfo');

    let selected: boolean = false;

    if (secInfos != null && pds.bioticAssignmentData != null) {
      selected = secInfos.find(secInfo => pds.bioticAssignmentData.BioticAssignment.find(asg => secInfo['Haul'] == asg.Haul && pds.selectedPSU == asg.PSU) != null) != null;
    }

    return selected != null && selected;
  }

  static async selectAssignedStation(f: Feature, ps: ProjectService, pds: ProcessDataService, ds: DataService, on: boolean) {
    const psu = pds.selectedPSU;

    if (psu == null) {
      return; // not possible to select stratum when selected psu is null
    }

    const sp: Stratum_PSU = pds.acousticPSU.Stratum_PSU.find(sp => sp.PSU == psu);

    const stratum = sp == null ? null : sp.Stratum;

    if (stratum == null) {
      return; // no stratum associated with the selected psu.
    }

    const secInfos: NamedStringIndex[] = f.get('secondaryInfo');

    const hauls: string[] = secInfos.map(secInfo => secInfo['Haul']);

    console.log('> ' + 'selectAssignedStation: ' + on ? 'on' : 'off');
    const res: ActiveProcessResult = ps.handleAPI(await (on ? ds.addHaulToAssignment(ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId, stratum, psu, hauls).toPromise() : ds.removeHaulFromAssignment(ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId, stratum, psu, hauls).toPromise()));

    // update the cache - NOTE: should we get the new assignments from backend on result?
    hauls.forEach(haul => {
      const idx = pds.bioticAssignmentData.BioticAssignment.findIndex(asg => asg.Haul == haul && psu == asg.PSU);

      console.log('> ' + 'haul ' + haul + ' idx ' + idx);
      if (on) {
        if (idx < 0) {
          console.log('> ' + 'push assignment');
          pds.bioticAssignmentData.BioticAssignment.push({
            PSU: pds.selectedPSU,
            Haul: haul,
          });
        }
      } else {
        if (idx >= 0) {
          console.log('> ' + 'remove assignment');
          pds.bioticAssignmentData.BioticAssignment.splice(idx, 1);
        }
      }
    });
    MapSetup.updateAssignedStationSelection(f, pds);
  }

  static updateAssignedStationSelection(f: Feature, pds: ProcessDataService) {
    f.set('selection', MapSetup.isStationSelected(f, pds) ? 1 : 0);
  }
}

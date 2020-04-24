import { Fill, Stroke, Style, RegularShape, Circle, Icon } from 'ol/style';
import { StyleLike, StyleFunction } from 'ol/style/Style';
import { FeatureLike } from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import { Layer, Vector } from 'ol/layer';
import BaseObject from 'ol/Object';
import { Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { MultiPoint } from 'ol/geom';

import { Button } from 'primeng/button';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import GeometryType from 'ol/geom/GeometryType';
import { fromLonLat } from 'ol/proj';
//import { rgb } from 'color-convert/conversions';
import { click, singleClick, shiftKeyOnly } from 'ol/events/condition';
import { Select, Draw, Modify, Snap } from 'ol/interaction';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';
import { MatDialog } from '@angular/material/dialog';
import { StratumNameDlgComponent } from '../dlg/stratum-name-dlg/stratum-name-dlg.component';
import { Color } from './Color';
import { clone } from 'ol/extent';
import { ProcessResult } from '../data/runresult';
import { HTMLUtil } from '../utils/htmlutil'
import { MapSymbol, RectangleSymbol, CircleSymbol } from './maptypes'
import { EDSU_PSU } from './../data/processdata'

export class MapSetup {
    public static DISTANCE_POINT_COLOR: string = 'rgb(248, 211, 221)';
    public static DISTANCE_ABSENT_POINT_COLOR: string = 'rgb(253, 244, 247)';
    public static DISTANCE_POINT_SELECTED_COLOR: string = 'rgb(166, 200, 176)';
    public static STATION_POINT_COLOR: string = 'rgb(56, 141, 226, 0.95)';
    public static POINT_OUTLINE_COLOR: string = 'rgb(0, 0, 0, 0.3)';
    public static BG_COLOR = 'rgb(252, 255, 198)';

    static getMapStyle() {
        return new Style({
            fill: new Fill({
                color: 'rgb(252, 255, 198)'
            }),
            stroke: new Stroke({
                color: Color.darken(MapSetup.BG_COLOR, 0.87),
                width: 1
            })
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
            svgHeight: number = null,
            halfStrokeWidth: number = strokeWidth / 2;
        switch (symb.shape) { // type-guard for algebraic type (discriminant union)
            case 'rect':
                symbFormatted += HTMLUtil.formatTagPropPx('x', halfStrokeWidth) +
                    HTMLUtil.formatTagPropPx('y', halfStrokeWidth) +
                    HTMLUtil.formatTagPropPx('width', symb.width) +
                    HTMLUtil.formatTagPropPx('height', symb.height);
                svgWidth = symb.width + strokeWidth;
                svgHeight = symb.height + strokeWidth;
                break;
            case 'circle':
                let cx: number = symb.radius + halfStrokeWidth,
                    cy: number = cx;
                symbFormatted += HTMLUtil.formatTagPropPx('cx', cx) +
                    HTMLUtil.formatTagPropPx('cy', cy) + HTMLUtil.formatTagPropPx('r', symb.radius);
                svgWidth = symb.radius * 2 + strokeWidth;
                svgHeight = svgWidth;
                break;
        }
        var svg = '<svg width="' + svgWidth + 'px" height="' + svgHeight + 'px" version="1.1" xmlns="http://www.w3.org/2000/svg">'
            + '<' + symbFormatted +
            HTMLUtil.formatTagProp('fill', fillColor) +
            HTMLUtil.formatTagPropPx('stroke-width', strokeWidth) +
            HTMLUtil.formatTagProp('stroke', outlineColor) +
            '/>' + '</svg>';

        var style = new Style({
            image: new Icon({
                opacity: 1,
                src: 'data:image/svg+xml;utf8,' + svg,
                scale: 1.0
            })
        });
        return style;
        /*return new Style({
            image: new RegularShape({
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({
                    color: MapSetup.darken(fillColor, 0.7),
                    width: 1.2
                }),
                points: size,
                radius: size,
                angle: Math.PI / size
            })
        });*/
    }
    static getLineStyle(strokeColor: string, width: number) {
        return new Style({
            stroke: new Stroke({
                color: strokeColor,
                width: width
            })
        });
    }

    static getAcousticPointStyle(): Style {
        return this.getPointStyleCircle(this.DISTANCE_POINT_COLOR, this.POINT_OUTLINE_COLOR, 6);
    }
    static getAcousticPointStyleFocused(): Style {
        return this.getPointStyleCircle(Color.darken(this.DISTANCE_POINT_SELECTED_COLOR, 0.5), this.POINT_OUTLINE_COLOR, 6);
    }
    static getAcousticPointStyleSelected(): Style {
        return this.getPointStyleCircle(this.DISTANCE_POINT_SELECTED_COLOR, this.POINT_OUTLINE_COLOR, 6);
    }
    static getStationPointStyle(): Style {
        return this.getPointStyleRect(this.STATION_POINT_COLOR, this.POINT_OUTLINE_COLOR, 14);
    }
    static getStyleCacheFunction(): StyleFunction {
        // This function lets the feature determine by callback the selection of style into the stylecache.
        return (feature: FeatureLike, resolution: number) => {
            let l: Layer = feature.get("layer");
            let styleCache: Style[] = feature.get("styleCache");
            let styleSelection: number = feature.get("selection");
            return styleCache[styleSelection];
        }
    }
    static getEDSUPointStyleCache(): Style[] {
        let edsuRadius: number = 6; // px
        let pointColor: string = this.DISTANCE_POINT_COLOR;
        let outlineColor: string = 'rgb(0, 0, 0, 0.1)'
        let focusColor: string = Color.darken(this.DISTANCE_POINT_SELECTED_COLOR, 0.5)
        let focusLineColor: string = Color.darken(focusColor, 0.5)
        return [
            this.getPointStyleCircle(pointColor, outlineColor, edsuRadius), // 0: present
            this.getPointStyleCircle(this.DISTANCE_POINT_SELECTED_COLOR, outlineColor, edsuRadius), // 1: selected
            this.getPointStyleCircle(focusColor, outlineColor, edsuRadius), // 2: focused
            this.getPointStyleCircle(this.DISTANCE_ABSENT_POINT_COLOR, outlineColor, edsuRadius), // 3 : absent
        ];
    }

    static getEDSULineStyle(): Style {
        return this.getLineStyle(Color.darken(this.DISTANCE_POINT_COLOR, 0.9), 2);
    }
    static getPolygonStyle(fillColor: string, strokeColor: string, strokeWidth: number): Style {
        return new Style({
            stroke: new Stroke({
                color: strokeColor,
                width: strokeWidth
            }),
            fill: new Fill({
                color: fillColor
            })
        });
    }
    static getStratumStyle(): Style {
        return MapSetup.getPolygonStyle('rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.2)', 1);
    }
    static getStratumNodeStyle(): Style {
        let s: Style = MapSetup.getPointStyleRect("rgba(255, 0, 0, 0.7)", MapSetup.POINT_OUTLINE_COLOR, 6);
        s.setGeometry(f => {
            var coordinates: Coordinate[] = [].concat(...(<Point>f.getGeometry()).getCoordinates());
            return new MultiPoint(coordinates);
        })
        return s;

    }
    static getStratumSelectStyle(): Style {
        return MapSetup.getPolygonStyle('rgba(255, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)', 2);
    }
    static createStratumModifyInteraction(select: Select, dataService: DataService, ps: ProjectService, proj: string) {
        let m: Modify = new Modify({
            features: select.getFeatures()/*,
                        deleteCondition: e => singleClick(e) && shiftKeyOnly(e)*/
        })
        m.on('modifyend', async function (e) {
            // Add the features back to API.
            //console.log(JSON.stringify(e.features.getArray()));
            let fcloned: Feature[] = e.features.getArray().map(f => { 
                let f2: Feature = f.clone(); 
                f2.set("layer", null);
                f2.set("styleCache", null);
                return f2;  
            });
            console.log(JSON.stringify(fcloned));

            let s: string = (new GeoJSON()).writeFeatures(fcloned, { featureProjection: proj, dataProjection: 'EPSG:4326' });
            /*let s2 : Feature[] = (new GeoJSON).readFeatures(JSON.parse(s), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326',
            })*/
            //console.log(s);
            let res: ProcessResult = await dataService.modifyStratum(s, ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();
            this.ps.selectedProject.saved = res.saved; 
            //ps.activeProcessId = res.activeProcessID; // reset active processid
            console.log("res :" + res);
        });
        return m;
    }
    static createStratumSelectInteraction() {
        return new Select({
            condition: singleClick,
            toggleCondition: shiftKeyOnly,
            layers: function (layer) {
                return layer.get('layerType') == 'stratum';
            },
            style: [this.getStratumSelectStyle(), MapSetup.getStratumNodeStyle()],
            multi: false
        });
    }
    static createStratumDrawInteraction(dialog: MatDialog, source: VectorSource,
        dataService: DataService, ps: ProjectService, proj: string) {
        let d: Draw = new Draw({
            source: source,
            type: GeometryType.POLYGON
        })
        d.on('drawend', async function (e) {
            // Add the features back to API.
            /*let s2 : Feature[] = (new GeoJSON).readFeatures(JSON.parse(s), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326',
            })*/

            console.log("get a name of the strata");
            const dialogRef = dialog.open(StratumNameDlgComponent, {
                width: '250px',
                disableClose: true,
                data: { stratum: '' }
            });
            let f: Feature = e.feature.clone(); // survive event e change after subdialog by cloning feature
            let strataName: any = await dialogRef.afterClosed().toPromise();
            /*            let f2 : Feature = (new GeoJSON).readFeatures(JSON.parse(stratum), {
                            dataProjection: 'EPSG:4326',
                            featureProjection: proj
                        })*/
            if (typeof (strataName) == 'string') {
                console.log("converting " + strataName);
                // a valid stratum name has been entered
                //f.setId(Math.max(...source.getFeatures().map(f2 => f2.getId() != null ? +f2.getId() : 0)) + 1);
                f.setProperties({ 'polygonName': strataName });
                let stratum: string = (new GeoJSON()).writeFeatures([f], { featureProjection: proj, dataProjection: 'EPSG:4326' });
                console.log(stratum);
                //source.getFeatures().map(f => f.getId())
                //e.setId(33); // find the max id + 1
                let res: ProcessResult = await dataService.addStratum(stratum, ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();
                //ps.activeProcessId = res.activeProcessID; // reset active processid
                this.ps.selectedProject.saved = res.saved; 
            }            //console.log("res :" + res); 

        });
        return d;
    }

    /**
     * getGEOJSONLayerFromURL - create a GEOJSON layer
     * @param name 
     * @param url 
     * @param style 
     * @param selectable 
     */
    static getGeoJSONLayerFromFeatureString(name: string, layerType : string, zIndex : number, feat: string, proj: string, style: Style[],
        selectable: boolean, layerOrder: number, infoTables : any[]): Layer {
        var s: VectorSource = new VectorSource({
            format: new GeoJSON(),
            useSpatialIndex: false
        });
        var v: Vector = new Vector({
            source: s,
            style: this.getStyleCacheFunction(),
            zIndex: zIndex
        });
        s.on("addfeature", evt => {
            evt.feature.set("layer", v);
            evt.feature.set("styleCache", style);
            //evt.feature.set("absent", false); // this property must be provided in geojson
            MapSetup.updateEDSUSelection(evt.feature, null);
            //evt.feature.set("selection", 0); // selection 0 by default.
            //ft.feature.set("feature", ft); // set a reference to itsself
        })
        s.addFeatures((new GeoJSON).readFeatures(JSON.parse(feat), {
            dataProjection: 'EPSG:4326',
            featureProjection: proj
        }));

        // Set layer properties
        v.set("selectable", selectable);
        v.set("name", name);
        v.set("layerType", layerType);
        v.set("style", style);
        v.set("hasTooltip", true);
        v.set("layerOrder", layerOrder);
        v.set("infoTables", infoTables)
        // Create a feature->layer link
        //v.getSource().getFeatures().forEach(f => f.setProperties({ "layer": name }));
        return v;
    }
    public static getGridLayer(proj): Layer {
        var gridLines = {
            'type': 'FeatureCollection',
            'features': []
        };
        let style = new Style({
            stroke: new Stroke({
                color: 'rgb(223, 242, 255)',
                width: 1
            })
        });
        let lines = []
        // Why is -50 a limit here?
        for (let iy = -50; iy <= 90; iy += 5) {
            let line = [];
            for (let ix = -180; ix <= 180; ix += 5) {
                line.push([ix, iy]);
            }
            lines.push(line);
        }
        for (let ix = -180; ix <= 180; ix += 5) {
            let line = [];
            for (let iy = -50; iy <= 90; iy += 5) {
                line.push([ix, iy]);
            }
            lines.push(line);
        }
        lines.forEach(l =>
            gridLines.features.push({
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': l
                }
            }));
        //let feat: Feature[] = []
        //feat.push(new Feature({ id: 'f1', geometry: new Point([1, 62]) }));
        var s: VectorSource = new VectorSource({
            format: new GeoJSON(),
            features: (new GeoJSON).readFeatures(gridLines, {
                dataProjection: 'EPSG:4326',
                featureProjection: proj
            })
        });
        var v: Vector = new Vector({
            source: s,
            style: style,
            zIndex: 10
        });
        s.on("addfeature", ft => {
            ft.feature.set("layer", v);
            //ft.feature.set("feature", ft); // set a reference to itsself
        })

        // Set layer properties
        v.set("selectable", false);
        v.set("name", "grid");
        v.set("layerType", "grid");
        v.set("style", style);
        // Create a feature->layer link
        //v.getSource().getFeatures().forEach(f => f.setProperties({ "layer": name }));
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
            undefinedHTML: '&nbsp;'
        });

    }
    static updateEDSUSelection(f: Feature, selectedPSU) {
        let absent: boolean = f.get("absent");
        let edsuPsu: EDSU_PSU = f.get("edsupsu");
        let selected: boolean = edsuPsu != null && edsuPsu.PSU != null && edsuPsu.PSU.length > 0;//f.get("selected");
        let focused: boolean = selected && selectedPSU != null && edsuPsu.PSU == selectedPSU;
        let selection =
            absent != null && absent ? 3 :
                focused != null && focused ? 2 :
                    selected != null && selected ? 1 : 0;
        f.set("selection", selection); // Set the style selection.
    }
}
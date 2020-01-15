import { Fill, Stroke, Style, RegularShape, Circle, Icon } from 'ol/style';
import { Coordinate } from 'ol/coordinate';
import { Layer, Vector } from 'ol/layer';
import BaseObject from 'ol/Object';
import { Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { MultiPoint } from 'ol/geom';
import * as Color from 'color';
import { Button } from 'primeng/button';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import GeometryType from 'ol/geom/GeometryType';
import { fromLonLat } from 'ol/proj';
import { rgb } from 'color-convert/conversions';
import { click, singleClick, shiftKeyOnly } from 'ol/events/condition';
import { Select, Draw, Modify, Snap } from 'ol/interaction';
import { DataService } from '../service/data.service';
import { ProjectService } from '../service/project.service';

export class MapSetup {
    public static DISTANCE_POINT_COLOR: string = 'rgb(248, 211, 221)';
    public static DISTANCE_POINT_ANYSELECTED_COLOR: string = 'rgb(166, 200, 176)';
    public static DISTANCE_ABSENCE_POINT_COLOR: string = 'rgb(253, 244, 247)';
    public static STATION_POINT_COLOR: string = 'rgb(56, 141, 226, 0.95)';
    public static POINT_OUTLINE_COLOR: string = 'rgb(0, 0, 0, 0.3)';
    public static BG_COLOR = 'rgb(252, 255, 198)';
    static darken(c: string, f: number): string {
        return Color.rgb(Math.trunc(Color(c).red() * f), Math.trunc(Color(c).green() * f), Math.trunc(Color(c).blue() * f)).string();
    }
    static getMapStyle() {
        return new Style({
            fill: new Fill({
                color: 'rgb(252, 255, 198)'
            }),
            stroke: new Stroke({
                color: this.darken(MapSetup.BG_COLOR, 0.87),
                width: 1
            })
        });
    }
    static getPointStyle(fillColor: string, outlineColor : string, size: number): Style {
        var svg = '<svg width="' + size + 'px" height="' + size + 'px" version="1.1" xmlns="http://www.w3.org/2000/svg">'
            + '<rect width="' + size + 'px" height="' + size + 'px" style="fill:' + fillColor + 
            ';stroke-width:3;stroke:' + outlineColor + '" />'
            + '</svg>';

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

    static getAcousticPointStyle(): Style {
        return this.getPointStyle(this.DISTANCE_POINT_COLOR, this.POINT_OUTLINE_COLOR, 6);
    }
    static getAcousticPointStyleSelected(): Style {
        return this.getPointStyle(MapSetup.darken(this.DISTANCE_POINT_ANYSELECTED_COLOR, 0.5), this.POINT_OUTLINE_COLOR, 6);
    }
    static getAcousticPointStyleAnySelected(): Style {
        return this.getPointStyle(this.DISTANCE_POINT_ANYSELECTED_COLOR, this.POINT_OUTLINE_COLOR, 6);
    }
    static getStationPointStyle(): Style {
        return this.getPointStyle(this.STATION_POINT_COLOR, this.POINT_OUTLINE_COLOR, 14);
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
        let s: Style = MapSetup.getPointStyle("rgba(255, 0, 0, 0.7)", MapSetup.POINT_OUTLINE_COLOR, 6);
        s.setGeometry(f => {
            var coordinates: Coordinate[] = [].concat(...(<Point>f.getGeometry()).getCoordinates());
            return new MultiPoint(coordinates);
        })
        return s;

    }
    static getStratumSelectStyle(): Style {
        return MapSetup.getPolygonStyle('rgba(255, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)', 2);
    }
    static createStratumModifyInteraction(select: Select, dataService: DataService, ps: ProjectService, proj : string) {
        let m: Modify = new Modify({
            features: select.getFeatures()/*,
                        deleteCondition: e => singleClick(e) && shiftKeyOnly(e)*/
        })
        m.on('modifyend', async function (e) {
            // Add the features back to API.
            let s : string = (new GeoJSON()).writeFeatures(e.features.getArray(), { featureProjection:proj, dataProjection: 'EPSG:4326' });
            /*let s2 : Feature[] = (new GeoJSON).readFeatures(JSON.parse(s), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326',
            })*/
            //console.log(s);
            let res : string = await dataService.modifyStratum(s, ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();
            console.log("res :" + res); 
        });
        return m;
    }
    static createStratumSelectInteraction() {
        return new Select({
            condition: singleClick,
            toggleCondition: shiftKeyOnly,
            layers: function (layer) {
                return layer.get('name') == 'stratum';
            },
            style: [this.getStratumSelectStyle(), MapSetup.getStratumNodeStyle()],
            multi: false
        });
    }
    static createStratumDrawInteraction(source: VectorSource, dataService: DataService, ps: ProjectService, proj : string) {
        let d: Draw = new Draw({
            source: source, 
            type: GeometryType.POLYGON
        })
        d.on('drawend', async function (e) {
            // Add the features back to API.
            let s : string = (new GeoJSON()).writeFeatures([e.feature], { featureProjection:proj, dataProjection: 'EPSG:4326' });
            /*let s2 : Feature[] = (new GeoJSON).readFeatures(JSON.parse(s), {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:4326',
            })*/
            console.log("get a name of the strata");
            //let res : string = await dataService.modifyStratum(s, ps.selectedProject.projectPath, ps.selectedModel.modelName, ps.activeProcessId).toPromise();
            //console.log("res :" + res); 
        });
        return d;
    }

    /**
     * getGEOJSONLayerFromURL - create a GEOJSON layer
     * @param name 
     * @param url 
     * @param styles 
     * @param selectable 
     */
    static getGeoJSONLayerFromFeatureString(name: string, feat: string, proj: string, styles: Style[], selectable: boolean): Layer {
        var s: VectorSource = new VectorSource({
            format: new GeoJSON(),
            features: (new GeoJSON).readFeatures(JSON.parse(feat), {
                dataProjection: 'EPSG:4326',
                featureProjection: proj
            })
        });
        var v: Vector = new Vector({
            source: s,
            style: styles,
        });
        s.on("addfeature", ft => {
            ft.feature.set("layer", v);
            //ft.feature.set("feature", ft); // set a reference to itsself
        })

        // Set layer properties
        v.set("selectable", selectable);
        v.set("name", name);
        v.set("style", styles);
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
            style: style
        });
        s.on("addfeature", ft => {
            ft.feature.set("layer", v);
            //ft.feature.set("feature", ft); // set a reference to itsself
        })

        // Set layer properties
        v.set("selectable", false);
        v.set("name", name);
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
}
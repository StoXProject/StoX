import { Fill, Stroke, Style, RegularShape } from 'ol/style';
import { Layer, Vector } from 'ol/layer';
import BaseObject from 'ol/Object';
import { Vector as VectorSource } from 'ol/source';
import {GeoJSON} from 'ol/format';
import * as Color from 'color';
import { Button } from 'primeng/button';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { rgb } from 'color-convert/conversions';
import { click, singleClick, shiftKeyOnly } from 'ol/events/condition';
import { Select, Draw, Modify, Snap } from 'ol/interaction';

export class MapSetup {
    public static DISTANCE_POINT_COLOR: string = 'rgb(248, 211, 221)';
    public static DISTANCE_POINT_ANYSELECTED_COLOR: string = 'rgb(166, 200, 176)';
    public static DISTANCE_ABSENCE_POINT_COLOR: string = 'rgb(253, 244, 247)';
    public static STATION_POINT_COLOR: string = 'rgb(56, 141, 226, 240)';
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
    static getPointStyle(fillColor: string, size: number): Style {

        return new Style({
            image: new RegularShape({
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({
                    color: MapSetup.darken(fillColor, 0.9),
                    width: 1.2/*,
                    lineCap:"butt",
                    lineJoin:"bevel"*/
                }),
                points: size,
                radius: size,
                angle: Math.PI / size
            })
        });
    }

    static getAcousticPointStyle(): Style {
        return this.getPointStyle(this.DISTANCE_POINT_COLOR, 6);
    }
    static getAcousticPointStyleSelected(): Style {
        return this.getPointStyle(MapSetup.darken(this.DISTANCE_POINT_ANYSELECTED_COLOR, 0.5), 6);
    }
    static getAcousticPointStyleAnySelected(): Style {
        return this.getPointStyle(this.DISTANCE_POINT_ANYSELECTED_COLOR, 6);
    }
    static getStationPointStyle(): Style {
        return this.getPointStyle(this.STATION_POINT_COLOR, 8);
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
    static getStratumSelectStyle(): Style {
        return MapSetup.getPolygonStyle('rgba(255, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)', 2);
    }
    static createStratumModifyInteraction(select: Select) {
        let m: Modify = new Modify({
            features: select.getFeatures()/*,
            deleteCondition: e => singleClick(e) && shiftKeyOnly(e)*/
        })
        m.on('modifyend', function (e) {
            // Add the features back to API.
            console.log((new GeoJSON()).writeFeatures(e.features.getArray()));
            console.log("modifyend features:", e.features.getArray());
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
            style: this.getStratumSelectStyle(),
            multi: false
        });
    }

    /**
     * getGEOJSONLayerFromURL - create a GEOJSON layer
     * @param name 
     * @param url 
     * @param style 
     * @param selectable 
     */
    static getGeoJSONLayerFromFeatureString(name: string, feat: string, proj: string, style: Style, selectable: boolean): Layer {
        var s: VectorSource = new VectorSource({
            format: new GeoJSON(),
            features: (new GeoJSON).readFeatures(JSON.parse(feat), {
                dataProjection: 'EPSG:4326',
                featureProjection: proj
            })
        });
        var v: Vector = new Vector({
            source: s,
            style: style,
        });
        s.on("addfeature", ft => {
            ft.feature.set("layer", v);
            //ft.feature.set("feature", ft); // set a reference to itsself
        })

        // Set layer properties
        v.set("selectable", selectable);
        v.set("name", name);
        v.set("style", style);
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
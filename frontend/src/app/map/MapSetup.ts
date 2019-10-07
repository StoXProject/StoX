import { Fill, Stroke, Style, RegularShape } from 'ol/style';
import { Layer, Vector } from 'ol/layer';
import BaseObject from 'ol/Object';
import Source from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as Color from 'color';
import { Button } from 'primeng/button';
export class MapSetup {
    public static DISTANCE_POINT_COLOR: string = 'rgb(248, 211, 221)';
    public static DISTANCE_POINT_ANYSELECTED_COLOR: string = 'rgb(166, 200, 176)';
    public static DISTANCE_ABSENCE_POINT_COLOR: string = 'rgb(253, 244, 247)';
    public static STATION_POINT_COLOR: string = 'rgb(56, 141, 226, 240)';

    static darken(c: string, f: number): string {
        return Color.rgb(Math.trunc(Color(c).red() * f), Math.trunc(Color(c).green() * f), Math.trunc(Color(c).blue() * f)).string();
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
    static getStationPointStyle(): Style {
        return this.getPointStyle(this.STATION_POINT_COLOR, 8);
    }
    /**
     * getGEOJSONLayerFromURL - create a GEOJSON layer
     * @param name 
     * @param url 
     * @param style 
     * @param selectable 
     */
    static getGeoJSONLayerFromURL(name: string, url: string, style: Style, selectable: boolean): Layer {
        var s: Source = new Source({
            format: new GeoJSON(),
            /*features: (new GeoJSON).readFeatures(JSON.parse(st), {
              defaultDataProjection: 'EPSG:4326',
              featureProjection: proj
            })*/
            url: url
        });
        var v: Vector = new Vector({
            source: s,
            style: style,
        });
        s.on("addfeature", ft => {
            ft.feature.set("layer", v);
            ft.feature.set("feature", ft); // set a reference to itsself
        })

        // Set layer properties
        v.set("selectable", selectable);
        v.set("name", name);
        v.set("style", style);
        // Create a feature->layer link
        //v.getSource().getFeatures().forEach(f => f.setProperties({ "layer": name }));
        return v;
    }
}
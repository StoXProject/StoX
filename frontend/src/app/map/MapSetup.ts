import { Fill, Stroke, Style, RegularShape } from 'ol/style';
import { Layer, Vector } from 'ol/layer';
import BaseObject from 'ol/Object';
import Source from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

export class MapSetup {
    public static DISTANCE_POINT_COLOR: string = 'rgb(248, 211, 221)';
    public static DISTANCE_ABSENCE_POINT_COLOR: string = 'rgb(253, 244, 247)';
    public static STATION_POINT_COLOR: string = 'rgb(56, 141, 226, 240)';

    static getPointStyle(fillColor: string, size: number): Style {

        return new Style({
            image: new RegularShape({
                fill: new Fill({ color: fillColor }),
                stroke: new Stroke({ color: 'black', width: 1 }),
                points: size,
                radius: size,
                angle: Math.PI / size
            })
        });
    }

    static getAcousticPointStyle(): Style {
        return this.getPointStyle(this.DISTANCE_POINT_COLOR, 6);
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
        s.on("addfeature", ft => {
            ft.feature.set("layer", name);
        })
        var v: Vector = new Vector({
            source: s,
            style: style,
        });

        // Set layer properties
        v.set("selectable", selectable);
        v.set("name", name);
        // Create a feature->layer link
        //v.getSource().getFeatures().forEach(f => f.setProperties({ "layer": name }));
        return v;
    }
}
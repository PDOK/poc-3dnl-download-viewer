
import { Map, View } from 'ol'
import WMTSSource from 'ol/source/WMTS'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorSource } from 'ol/source'
import { register } from 'ol/proj/proj4.js'
import { fromLonLat } from 'ol/proj'
import proj4 from 'proj4'
import Projection from 'ol/proj/Projection'
import { getTopLeft } from 'ol/extent.js'
import LayerSwitcher from 'ol-layerswitcher'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { click, pointerMove, altKeyOnly } from 'ol/events/condition'
import Select from 'ol/interaction/Select'

import 'ol/ol.css'
import 'ol-layerswitcher/src/ol-layerswitcher.css'

import bladIndexAhn from './ahn3_bladindex.json'
import bladIndex2000 from './bladindex_2000_clipped.json'
import bladIndex5000 from './bladindex_5000_clipped.json'


const BRTA_ATTRIBUTION = 'Kaartgegevens: © <a href="http://www.kadaster.nl">Kadaster</a>, <a href="http://openstreetmap.org">OpenStreetMap</a><span class="printhide">-auteurs (<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>).</span>'

proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)
const rdProjection = new Projection({
  code: 'EPSG:28992',
  extent: [-285401.92, 22598.08, 595401.92, 903401.92]
})

const resolutions = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210]
const matrixIds = new Array(15)
for (var i = 0; i < 15; ++i) {
  matrixIds[i] = i
}

function getWmtsLayer(layername) {
  return new TileLayer({
    type: 'base',
    title: `${layername} WMTS`,
    extent: rdProjection.extent,
    source: new WMTSSource({
      url: 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts',
      layer: layername,
      matrixSet: 'EPSG:28992',
      format: 'image/png',
      attributions: BRTA_ATTRIBUTION,
      projection: rdProjection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(rdProjection.getExtent()),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      style: 'default'
    })
  })
}

const brtWmtsLayer = getWmtsLayer('brtachtergrondkaart')

const vectorLayerAhn = new VectorLayer({
  title: 'bladindex AHN3',
  visible: false,
  source: new VectorSource({
    features: (new GeoJSON()).readFeatures(bladIndexAhn),
    projection: rdProjection
  })
});


const vectorLayer2000 = new VectorLayer({
  title: 'bladindex 2000',
  visible: false,
  source: new VectorSource({
    features: (new GeoJSON()).readFeatures(bladIndex2000),
    projection: rdProjection
  })
});

const vectorLayer5000 = new VectorLayer({
  title: 'bladindex 5000',
  visible: false,
  source: new VectorSource({
    features: (new GeoJSON()).readFeatures(bladIndex5000),
    projection: rdProjection
  })
});




var layerSwitcher = new LayerSwitcher({
  tipLabel: 'Legend', // Optional label for button
  groupSelectStyle: 'none' // Can be 'children' [default], 'group' or 'none'
})

// bladindex_1000_clipped retrieved with fetch, parcel running out of memory when including file as import
fetch('./bladindex_1000_clipped.json')
  .then(response => response.json())
  .then(function (data) {
    const vectorLayer1000 = new VectorLayer({
      minZoom: 10,
      visible: false,
      title: 'bladindex 1000',
      source: new VectorSource({
        features: (new GeoJSON()).readFeatures(data),
        projection: rdProjection
      })
    });
    const map = new Map({
      layers: [
        brtWmtsLayer,
        vectorLayerAhn,
        vectorLayer1000,
        vectorLayer2000,
        vectorLayer5000,
      ],
      target: 'map',
      view: new View({
        projection: 'EPSG:28992',
        center: fromLonLat([5.43, 52.18], rdProjection),
        zoom: 8
      })
    })

    map.addControl(layerSwitcher)

    function getDownloads(properties) {
      let html = '<ul>'
      let bladnr = properties['bladnr'].toUpperCase()
      if (properties['has_data_05m_dsm']) {
        let anchor = `<li><a href="https://download.pdok.nl/rws/ahn3/v1_0/05m_dsm/R_${bladnr}.ZIP">ahn3_05m_dsm</a></li>`
        html = `${html}${anchor}`
      }
      html = `${html}</ul>`
      return html
    }

    var select = new Select()
    map.addInteraction(select);
    select.on('select', function (e) {
      if (e.selected.length > 0) {
        let featureSelected = e.selected[0];
        let layer = select.getLayer(featureSelected);
        let layerTitle = layer.get("title")
        let attribute = 'id'
        if (layerTitle === 'bladindex AHN3'){
          attribute = 'bladnr'
        }
        let bladnr = featureSelected.getProperties()[attribute]
        document.getElementById('status').innerHTML = `bladnummer: ${bladnr}`
      } else {
        document.getElementById('status').innerHTML = ''
      }
    });
  });

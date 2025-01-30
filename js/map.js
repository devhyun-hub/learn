import Map from "../ol/Map.js";
import View from "../ol/View.js";

import TileLayer from "../ol/layer/Tile.js";
import TileWMS from "../ol/source/TileWMS.js";

import OSM from "../ol/source/OSM.js";

const map = new Map({
  target: "map",
  layers: [
    //[OSM example]
    new TileLayer({
      source: new OSM(),
    }),
    //[tileLayer example]
    // new TileLayer({
    //   source: new TileWMS({
    //     projection: "EPSG:4326",
    //     url: "https://ahocevar.com/geoserver/wms",
    //     params: {
    //       LAYERS: "ne:NE1_HR_LC_SR_W_DR",
    //       TILED: true,
    //     },
    //   }),
    // }),
  ],
  view: new View({
    // projection: "EPSG:3857", //좌표계 설정
    // center: ol.proj.fromLonLat([129, 35.5]),
    center: [0, 0],
    zoom: 2,
  }),
});

//확대버튼
document.querySelector("#zoomIn").addEventListener("click", function () {
  const view = map.getView();
  const zoom = view.getZoom();
  view.setZoom(zoom + 1);
});

//축소버튼
document.querySelector("#zoomOut").addEventListener("click", function () {
  const view = map.getView();
  const zoom = view.getZoom();
  view.setZoom(zoom - 1);
});

import Map from "../ol/Map.js"; //필수설정값
import View from "../ol/View.js"; //필수설정값
import TileLayer from "../ol/layer/Tile.js"; //필수설정값
import OSM from "../ol/source/OSM.js"; //필수설정값

//레이어 제어
import VectorSource from "../ol/source/Vector.js"; //레이어 제어(필수JS) EX6 최신
import VectorLayer from "../ol/layer/Vector.js"; //레이어 제어(필수JS)   EX6 최신
import Feature from "../ol/Feature.js";
import {
  Circle,
  Fill,
  Icon,
  IconImage,
  Image,
  RegularShape,
  Stroke,
  Style,
  Text,
} from "../ol/style.js"; //스타일에 관한 설정은 여기서 따른다
import Point from "../ol/geom/Point.js";

//import { fromExtent } from "../ol/geom/Polygon.js";
//import GeoJSON from "../ol/format/GeoJSON.js"; //json 파일 포맷
//import VectorImageLayer from "../ol/layer/VectorImage.js";
//import TileWMS from "../ol/source/TileWMS.js";

//openlayers examples 참조
//Measure using vector styles 거리재기, 면적재기

//참조레이어 객체 생성

//백터레이어 추가
//const vectorSource = new VectorSource();

const count = 1000;
const features = new Array(count); //피처 배열 생성
const e = 4500000; //임의의 값

//피처 생성 및 추가
for (let i = 0; i < count; ++i) {
  features[i] = new Feature({
    geometry: new Point([2 * e * Math.random() - e, 2 * e * Math.random() - e]),
    i: i,
    size: i % 2 ? 10 : 20,
  });
}
//feautre 스타일 설정
let styles = {
  10: new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({ color: "#666666" }),
      stroke: new Stroke({ color: "#bada55", width: 1 }),
    }),
  }),
  20: new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({ color: "#666666" }),
      stroke: new Stroke({ color: "#bada55", width: 1 }),
    }),
  }),
};
//구 호출방식 ol.source.Vector
const vectorSource = new ol.source.Vector({
  features: features,
  wrapX: false,
});
// 벡터 레이어 생성
const vector = new VectorLayer({
  source: vectorSource,
  style: (feature) => {
    return styles[feature.get("size")];
  },
});

const tileLayer = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: "map",
  layers: [tileLayer, vector],
  view: new View({
    // projection: "EPSG:3857", //좌표계 설정
    //center: ol.proj.fromLonLat([129, 35.5]),
    center: [0, 0],
    zoom: 2,
  }),
});

map.get;

//확대버튼(default 값)
// document.querySelector("#zoomIn").addEventListener("click", function () {
//   const view = map.getView();
//   const zoom = view.getZoom();
//   view.setZoom(zoom + 1);
// });

//축소버튼(default 값)
// document.querySelector("#zoomOut").addEventListener("click", function () {
//   const view = map.getView();
//   const zoom = view.getZoom();
//   view.setZoom(zoom - 1);
// });

//맵제어
// map.on("click", function (evt) {
//   alert("");
// });

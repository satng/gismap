/* eslint-disable func-names */
/* eslint-disable no-plusplus */
// 测量工具组
import * as Cesium from 'cesium';

// 测量线段

class MeasureLine {
  constructor(viewer) {
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
    this.positions = [];
    this.poly = null;
    this.distance = 0;
    this.cartesian = null;
    this.floatingPoint = null;
    this.labelPt = null;
    this.viewer = viewer;

    this.PolyLinePrimitive = (function () {
      function _(positions) {
        this.options = {
          name: '直线',
          polyline: {
            show: true,
            positions: [],
            material: Cesium.Color.CHARTREUSE,
            width: 5,
            clampToGround: true,
          },
        };
        this.positions = positions;
        this._init();
      }
      _.prototype._init = function () {
        const _self = this;
        const _update = function () {
          return _self.positions;
        };
        // 实时更新polyline.positions
        this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
        viewer.entities.add(this.options);
      };

      return _;
    }());

    this.init(viewer);
  }

  init() {
    this.handleEvent();
  }

  getTerrainDistance(point1cartographic, point2cartographic) {
    const { viewer } = this;
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    const s = geodesic.surfaceDistance;
    const cartoPts = [point1cartographic];
    for (let jj = 1000; jj < s; jj += 1000) {
      // 分段采样计算距离
      const cartoPt = geodesic.interpolateUsingSurfaceDistance(jj);
      cartoPts.push(cartoPt);
    }
    cartoPts.push(point2cartographic);
    // 返回两点之间的距离
    const promise = Cesium.sampleTerrain(viewer.terrainProvider, 8, cartoPts);
    Cesium.when(promise, (updatedPositions) => {
      for (let jj = 0; jj < updatedPositions.length - 1; jj++) {
        const geoD = new Cesium.EllipsoidGeodesic();
        geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);
        let innerS = geoD.surfaceDistance;
        innerS = Math.sqrt(innerS ** 2 + (updatedPositions[jj + 1].height - updatedPositions[jj].height) ** 2);
        this.distance += innerS;
      }
      // 在三维场景中添加Label
      const lon1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(this.labelPt).longitude;
      const lat1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(this.labelPt).latitude;
      const lonLat = `(${Cesium.Math.toDegrees(lon1).toFixed(2)},${Cesium.Math.toDegrees(lat1).toFixed(2)})`;
      let textDisance = `${this.distance.toFixed(2)}米`;
      if (this.distance > 10000) { textDisance = `${(this.distance / 1000.0).toFixed(2)}千米`; }
      this.floatingPoint = viewer.entities.add({
        name: '贴地距离',
        position: this.labelPt,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: lonLat + textDisance,
          font: '18px sans-serif',
          fillColor: Cesium.Color.GOLD,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(20, -20),
        },
      });
    });
  }

  // 空间两点距离计算函数
  getSpaceDistance($positions) {
    // 只计算最后一截，与前面累加
    // 因move和鼠标左击事件，最后两个点坐标重复
    const i = $positions.length - 3;
    const point1cartographic = Cesium.Cartographic.fromCartesian($positions[i]);
    const point2cartographic = Cesium.Cartographic.fromCartesian($positions[i + 1]);
    this.getTerrainDistance(point1cartographic, point2cartographic);
  }

  handleEvent() {
    const { viewer } = this;
    this.handler.setInputAction((movement) => {
      const ray = viewer.camera.getPickRay(movement.endPosition);
      this.cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      // 跳出地球时异常
      if (!Cesium.defined(this.cartesian)) { return; }
      if (this.positions.length >= 2) {
        if (!Cesium.defined(this.poly)) {
          this.poly = new this.PolyLinePrimitive(this.positions);
        } else {
          this.positions.pop();
          this.positions.push(this.cartesian);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction((movement) => {
      const ray = viewer.camera.getPickRay(movement.position);
      this.cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      // 跳出地球时异常
      if (!Cesium.defined(this.cartesian)) { return; }
      if (this.positions.length === 0) {
        this.positions.push(this.cartesian.clone());
      }
      this.positions.push(this.cartesian);
      // 记录鼠标单击时的节点位置，异步计算贴地距离
      this.labelPt = this.positions[this.positions.length - 1];
      if (this.positions.length > 2) {
        this.getSpaceDistance(this.positions);
      } else if (this.positions.length === 2) {
        // 在三维场景中添加Label
        this.floatingPoint = viewer.entities.add({
          name: '空间距离',
          position: this.labelPt,
          point: {
            pixelSize: 5,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(() => {
      this.handler.destroy(); // 关闭事件句柄
      this.handler = undefined;
      this.positions.pop(); // 最后一个点无效
      if (this.positions.length === 1) { viewer.entities.remove(this.floatingPoint); }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  destroy() {
    console.log(this.handler);
    this.handler.destroy();
  }
}

// // 面积测量
// class MeasurePolygn {

// }

// 线长度测量
function measureLine(viewer) {
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
  const positions = [];
  let poly = null;
  let distance = 0;
  let cartesian = null;
  let floatingPoint;
  let labelPt;

  const PolyLinePrimitive = (function () {
    function _(positions) {
      this.options = {
        name: '直线',
        polyline: {
          show: true,
          positions: [],
          material: Cesium.Color.CHARTREUSE,
          width: 5,
          clampToGround: true,
        },
      };
      this.positions = positions;
      this._init();
    }

    _.prototype._init = function () {
      const _self = this;
      const _update = function () {
        return _self.positions;
      };
      // 实时更新polyline.positions
      this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
      const addedEntity = viewer.entities.add(this.options);
    };

    return _;
  }());

  function getTerrainDistance(point1cartographic, point2cartographic) {
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    const s = geodesic.surfaceDistance;
    const cartoPts = [point1cartographic];
    for (let jj = 1000; jj < s; jj += 1000) {
      // 分段采样计算距离
      const cartoPt = geodesic.interpolateUsingSurfaceDistance(jj);
      cartoPts.push(cartoPt);
    }
    cartoPts.push(point2cartographic);
    // 返回两点之间的距离
    const promise = Cesium.sampleTerrain(viewer.terrainProvider, 8, cartoPts);
    Cesium.when(promise, (updatedPositions) => {
      for (let jj = 0; jj < updatedPositions.length - 1; jj++) {
        const geoD = new Cesium.EllipsoidGeodesic();
        geoD.setEndPoints(updatedPositions[jj], updatedPositions[jj + 1]);
        let innerS = geoD.surfaceDistance;
        innerS = Math.sqrt(innerS ** 2 + (updatedPositions[jj + 1].height - updatedPositions[jj].height) ** 2);
        distance += innerS;
      }
      // 在三维场景中添加Label
      const lon1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(labelPt).longitude;
      const lat1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(labelPt).latitude;
      const lonLat = `(${Cesium.Math.toDegrees(lon1).toFixed(2)},${Cesium.Math.toDegrees(lat1).toFixed(2)})`;
      let textDisance = `${distance.toFixed(2)}米`;
      if (distance > 10000) { textDisance = `${(distance / 1000.0).toFixed(2)}千米`; }
      floatingPoint = viewer.entities.add({
        name: '贴地距离',
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: lonLat + textDisance,
          font: '18px sans-serif',
          fillColor: Cesium.Color.GOLD,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(20, -20),
        },
      });
    });
  }

  // 空间两点距离计算函数
  function getSpaceDistance($positions) {
    // 只计算最后一截，与前面累加
    // 因move和鼠标左击事件，最后两个点坐标重复
    const i = $positions.length - 3;
    const point1cartographic = Cesium.Cartographic.fromCartesian($positions[i]);
    const point2cartographic = Cesium.Cartographic.fromCartesian($positions[i + 1]);
    getTerrainDistance(point1cartographic, point2cartographic);
  }

  handler.setInputAction((movement) => {
    const ray = viewer.camera.getPickRay(movement.endPosition);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    // 跳出地球时异常
    if (!Cesium.defined(cartesian)) { return; }
    if (positions.length >= 2) {
      if (!Cesium.defined(poly)) {
        poly = new PolyLinePrimitive(positions);
      } else {
        positions.pop();
        positions.push(cartesian);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction((movement) => {
    const ray = viewer.camera.getPickRay(movement.position);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!Cesium.defined(cartesian)) // 跳出地球时异常
    { return; }
    if (positions.length === 0) {
      positions.push(cartesian.clone());
    }
    positions.push(cartesian);
    // 记录鼠标单击时的节点位置，异步计算贴地距离
    labelPt = positions[positions.length - 1];
    if (positions.length > 2) {
      getSpaceDistance(positions);
    } else if (positions.length === 2) {
      // 在三维场景中添加Label
      floatingPoint = viewer.entities.add({
        name: '空间距离',
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
      });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(() => {
    handler.destroy(); // 关闭事件句柄
    handler = undefined;
    positions.pop(); // 最后一个点无效
    if (positions.length === 1) { viewer.entities.remove(floatingPoint); }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

// 面积测量
function measurePolygn(viewer) {
  // 鼠标事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
  const positions = [];
  const tempPoints = [];
  let polygon = null;
  let cartesian = null;
  let floatingPoint;// 浮动点
  handler.setInputAction((movement) => {
    const ray = viewer.camera.getPickRay(movement.endPosition);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    positions.pop();// 移除最后一个
    positions.push(cartesian);
    if (positions.length >= 2) {
      const dynamicPositions = new Cesium.CallbackProperty((() => {
        return new Cesium.PolygonHierarchy(positions);
        return positions;
      }), false);
      polygon = PolygonPrimitive(dynamicPositions);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction((movement) => {
    const ray = viewer.camera.getPickRay(movement.position);
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (positions.length == 0) {
      positions.push(cartesian.clone());
    }
    positions.push(cartesian);
    // 在三维场景中添加点
    const cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
    const longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    const latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
    const heightString = cartographic.height;
    const labelText = `(${longitudeString.toFixed(2)},${latitudeString.toFixed(2)})`;
    tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString });
    floatingPoint = viewer.entities.add({
      name: '多边形面积',
      position: positions[positions.length - 1],
      point: {
        pixelSize: 5,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: labelText,
        font: '18px sans-serif',
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -20),
      },
    });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction(() => {
    handler.destroy();
    positions.pop();
    const textArea = `${getArea(tempPoints)}平方公里`;
    viewer.entities.add({
      name: '多边形面积',
      position: positions[positions.length - 1],
      label: {
        text: textArea,
        font: '18px sans-serif',
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(20, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  const radiansPerDegree = Math.PI / 180.0;// 角度转化为弧度(rad)
  const degreesPerRadian = 180.0 / Math.PI;// 弧度转化为角度

  /* 方向 */
  function Bearing(from, to) {
    const lat1 = from.lat * radiansPerDegree;
    const lon1 = from.lon * radiansPerDegree;
    const lat2 = to.lat * radiansPerDegree;
    const lon2 = to.lon * radiansPerDegree;
    let angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
    if (angle < 0) {
      angle += Math.PI * 2.0;
    }
    angle *= degreesPerRadian;// 角度
    return angle;
  }
  /* 角度 */
  function Angle(p1, p2, p3) {
    const bearing21 = Bearing(p2, p1);
    const bearing23 = Bearing(p2, p3);
    let angle = bearing21 - bearing23;
    if (angle < 0) {
      angle += 360;
    }
    return angle;
  }

  function distance(point1, point2) {
    const point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    const point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    /** 根据经纬度计算出距离* */
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    let s = geodesic.surfaceDistance;
    // 返回两点之间的距离
    s = Math.sqrt(s ** 2 + (point2cartographic.height - point1cartographic.height) ** 2);
    return s;
  }
  // 计算多边形面积
  function getArea(points) {
    let res = 0;
    // 拆分三角曲面
    for (let i = 0; i < points.length - 2; i++) {
      const j = (i + 1) % points.length;
      const k = (i + 2) % points.length;
      const totalAngle = Angle(points[i], points[j], points[k]);
      const disTemp1 = distance(positions[i], positions[j]);
      const disTemp2 = distance(positions[j], positions[k]);
      res += disTemp1 * disTemp2 * Math.abs(Math.sin(totalAngle));
    }
    return (res / 1000000.0).toFixed(4);
  }

  function PolygonPrimitive($positions) {
    polygon = viewer.entities.add({
      polygon: {
        hierarchy: $positions,
        material: Cesium.Color.GREEN.withAlpha(0.1),
      },
    });
  }
}

export default {
  MeasureLine,
  // MeasurePolygn,
  measureLine,
  measurePolygn,
};
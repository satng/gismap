/* eslint-disable no-use-before-define */
/*
 * @Author: R10
 * @Date: 2022-06-06 17:25:07
 * @LastEditTime: 2022-06-08 17:02:59
 * @LastEditors: R10
 * @Description:
 * @FilePath: /gismap/src/code/paint/shape.js
 */
import * as Cesium from 'cesium';
import { point as turfPoint, distance } from '@turf/turf';
import {
  ScreenSpaceEventHandler, ScreenSpaceEventType,
  Entity, Color, CallbackProperty, Cartesian3, Cartesian2,
  Rectangle, Ellipsoid, ColorMaterialProperty, PolygonHierarchy,
  ArcType,
} from 'cesium';
import { getWGS84FromDKR } from '../common/utils';

function getPointFromWindowPoint(point, viewer) {
  if (viewer.scene.terrainProvider.constructor.name === 'EllipsoidTerrainProvider') {
    return viewer.camera.pickEllipsoid(point, viewer.scene.globe.ellipsoid);
  }
  const ray = viewer.scene.camera.getPickRay(point);
  return viewer.scene.globe.pick(ray, viewer.scene);
}
/**
 *
 * 鼠标矩形绘制
 * @param {object} data
 * @returns {entity} entity
 * @memberof GisMap
 */
function paintRect(data, callback) {
  const pointsArr = [];
  const shape = {
    points: [],
    rect: null,
    entity: null,
  };
  let labelEntity = null;
  let text = '';
  let tempPosition;
  const handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
  // 鼠标点击
  handler.setInputAction((movement) => {
    tempPosition = getPointFromWindowPoint(movement.position, this.viewer);
    // 选择的点在球面上
    if (tempPosition) {
      if (shape.points.length === 0) {
        pointsArr.push(tempPosition);
        const cartesian = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition);
        shape.points.push(cartesian);
        shape.rect = Rectangle.fromCartographicArray(shape.points);
        shape.rect.east += 0.000001;
        shape.rect.north += 0.000001;
        shape.entity = this.viewer.entities.add({
          rectangle: {
            coordinates: shape.rect,
            outline: false,
            material: Color.RED.withAlpha(0.5),
          },
        });
        shape.bufferEntity = shape.entity;
      } else if (shape.points.length >= 2) {
        handler.destroy();
        this.viewer.entities.remove(labelEntity);
        if (callback) {
          callback({ id: shape.entity._id, positions: pointsArr });
        }
      }
    }
  }, ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动
  handler.setInputAction((movement) => {
    if (!movement.endPosition) return false;
    if (!labelEntity) {
      labelEntity = new Entity({
        position: new CallbackProperty(() => {
          const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
          const position = cartesian ? getWGS84FromDKR(cartesian) : {};
          return cartesian ? Cartesian3.fromDegrees(...Object.values(position)) : Cartesian3.fromDegrees(0, 0);
        }, false),
        label: {
          text: new CallbackProperty(() => text, false),
          font: '14px Source Han Sans CN',
          fillColor: Color.fromCssColorString('#fff'),
          pixelOffset: new Cartesian2(0, -16), // 偏移
        },
      });
      this.viewer.entities.add(labelEntity);
    }
    const moveEndPosition = getPointFromWindowPoint(movement.endPosition, this.viewer);
    if (shape.points.length === 0) {
      text = '点击绘制';
      return;
    }
    text = '再次点击结束绘制';

    if (moveEndPosition) {
      pointsArr[1] = moveEndPosition;
      const cartesian = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition);
      shape.points[1] = cartesian;
      shape.rect = Rectangle.fromCartographicArray(shape.points);
      if (shape.rect.west === shape.rect.east) {
        shape.rect.east += 0.000001;
      }
      if (shape.rect.south === shape.rect.north) {
        shape.rect.north += 0.000001;
      }
      shape.entity.rectangle.coordinates = shape.rect;
      // 再次点击结束
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);
}

/**
 *
 * 鼠标绘制圆
 * @param {object} data
 * @returns {entity} entity
 * @memberof GisMap
 */
function paintCircle(data, callback) {
  const circle = {
    points: [],
    entity: null,
    r: 1,
  };
  let tempPosition;
  let cartographic1;
  let labelEntity;
  let tempLon;
  let tempLat;
  let p = null;
  let text = '';
  const handle = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
  handle.setInputAction((click) => {
    tempPosition = getPointFromWindowPoint(click.position, this.viewer);
    if (tempPosition) {
      // eslint-disable-next-line no-inner-declarations
      function callBackPos() {
        if (circle.points.length === 0) return;
        const minLon = Cesium.Math.toDegrees(circle.points[0].longitude);
        const minLat = Cesium.Math.toDegrees(circle.points[0].latitude);
        const maxLon = Cesium.Math.toDegrees(circle.points[1].longitude);
        const maxLat = Cesium.Math.toDegrees(circle.points[1].latitude);
        const from = turfPoint([minLon, minLat]);
        const to = turfPoint([maxLon, maxLat]);
        const r = distance(from, to, { units: 'kilometers' });
        if (r) return r * 1000;
        return 1;
      }
      if (circle.points.length === 0) {
        p = click.position;
        cartographic1 = Ellipsoid.WGS84.cartesianToCartographic(tempPosition);
        if (!tempPosition) return false;
        circle.points.push(this.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
        circle.points.push(this.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
        tempLon = Cesium.Math.toDegrees(cartographic1.longitude);
        tempLat = Cesium.Math.toDegrees(cartographic1.latitude);
        circle.entity = this.viewer.entities.add({
          position: Cartesian3.fromDegrees(tempLon, tempLat),
          ellipse: {
            semiMinorAxis: new CallbackProperty(callBackPos, false),
            semiMajorAxis: new CallbackProperty(callBackPos, false),
            outline: false,
            material: data?.color ? Color.fromCssColorString(data.color) : Color.AQUA.withAlpha(0.5),
            height: 1,
          },
        });
      } else {
        // const tempCircle = new CircleOutlineGeometry({
        //   center: Cartesian3.fromDegrees(tempLon, tempLat),
        //   radius: callBackPos(),
        //   granularity: Math.PI / 2,
        // });
        // const geometry = CircleOutlineGeometry.createGeometry(tempCircle);
        // let float64ArrayPositionsIn = geometry.attributes.position.values
        handle.destroy();
        this.viewer.entities.remove(labelEntity);
        const r = parseFloat(callBackPos());
        if (callback) {
          callback({
            id: circle.entity._id,
            centerPoint: [tempLon, tempLat],
            radius: r,
          });
        }
      }
    }
  }, ScreenSpaceEventType.LEFT_CLICK);
  handle.setInputAction((movement) => {
    const moveEndPosition = getPointFromWindowPoint(movement.endPosition, this.viewer);
    if (circle.points.length === 0) {
      if (!labelEntity) {
        text = '点击绘制';
        labelEntity = new Entity({
          position: new CallbackProperty(() => {
            const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
            const position = cartesian ? getWGS84FromDKR(cartesian) : {};
            return cartesian ? Cartesian3.fromDegrees(...Object.values(position)) : Cartesian3.fromDegrees(0, 0);
          }, false),
          label: {
            text: new CallbackProperty(() => text, false),
            font: '14px Source Han Sans CN',
            fillColor: Color.fromCssColorString('#fff'),
            pixelOffset: new Cartesian2(0, -16), // 偏移
          },
          zIndex: 100,
        });
        this.viewer.entities.add(labelEntity);
      }
      return false;
    }
    text = '点击结束';
    // 选择的点在球面上
    if (moveEndPosition) {
      // 再次点击结束
      circle.points.pop();
      circle.points.push(this.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition));
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);
}

/**
 *
 * 多边形绘制
 * @param {object} data
 * @returns {entity} entity
 * @memberof GisMap
 */
function paintPolygon(data, callback) {
  let labelEntity = null;
  let text = '';
  let poly;
  const positions = [];
  const drawPolygon = () => {
    poly = this.viewer.entities.add({
      name: '多边形',
      polygon: {
        hierarchy: new CallbackProperty(() => new PolygonHierarchy(positions), false),
        outline: false,
        material: data?.color ? Color.fromCssColorString(data.color) : Color.RED.withAlpha(0.5),
      },
      arcType: ArcType.GEODESIC,
    });
  };
  const handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
  // 单击画点
  handler.setInputAction((movement) => {
    const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
    // if (positions.length === 0) {
    //   positions.push(cartesian.clone());
    // }
    if (cartesian) {
      positions.push(cartesian);
    }
  }, ScreenSpaceEventType.LEFT_CLICK);
  // 鼠标移动
  handler.setInputAction((movement) => {
    if (!labelEntity) {
      labelEntity = new Entity({
        position: new CallbackProperty(() => {
          const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
          const position = cartesian ? getWGS84FromDKR(cartesian) : {};
          return cartesian ? Cartesian3.fromDegrees(...Object.values(position)) : Cartesian3.fromDegrees(0, 0);
        }, false),
        label: {
          text: new CallbackProperty(() => text, false),
          font: '14px Source Han Sans CN',
          fillColor: Color.fromCssColorString('#fff'),
          pixelOffset: new Cartesian2(0, -16), // 偏移
        },
      });
      this.viewer.entities.add(labelEntity);
    }
    const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
    if (cartesian !== undefined) {
      positions.pop();
      positions.push(cartesian);
    }
    if (positions.length > 2) {
      text = '点击右键结束';
    }
    if (positions.length >= 2) {
      if (!poly) {
        drawPolygon(positions);
      }
    } else {
      text = '点击绘制';
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);
  // 鼠标点击
  handler.setInputAction(() => {
    handler.destroy();
    this.viewer.entities.remove(labelEntity);
    if (callback) {
      callback({
        id: poly._id,
        positions,
      });
    }
  }, ScreenSpaceEventType.RIGHT_CLICK);
}

export default {
  paintRect,
  paintCircle,
  paintPolygon,
};
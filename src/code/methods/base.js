import Canvas2Image from './canvas2image';
import * as Cesium from "cesium"
// view zoomTo
// function zoomTo() {
//   this.viewer.zoomTo();
// }

/**
   *
   * 缩进视图
   * @memberof GisMap
   * @param {number} [scale = 0.5] 缩进视视图系数1为，缩进已有距离一半,默认0.5
   * @return {number} scale
   */
function zoomIn(scale = 0.5) {
  // 获取当前镜头位置的笛卡尔坐标
  const cameraPos = this.camera.position;

  // // 获取当前坐标系标准
  const { ellipsoid } = this.scene.globe;

  // // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
  const cartographic = ellipsoid.cartesianToCartographic(cameraPos);

  // // 获取镜头的高度
  const { height } = cartographic;
  const _scale = (1 - (1 / (scale + 1))) * height;
  // 优化？
  this.camera.zoomIn(_scale);
  return scale;
}

/**
   *
   * 放大视图
   * @memberof GisMap
   * @param {number} [scale = 0.5] 放大视系数1为一倍视距,默认0.5
   * @return {number} scale
   */
function zoomOut(scale = 0.5) {
  // 获取当前镜头位置的笛卡尔坐标
  const cameraPos = this.camera.position;

  // // 获取当前坐标系标准
  const { ellipsoid } = this.scene.globe;

  // // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
  const cartographic = ellipsoid.cartesianToCartographic(cameraPos);

  // // 获取镜头的高度
  const { height } = cartographic;
  const _scale = height * (1 + scale);
  this.camera.zoomOut(_scale);
  return _scale;
}

/**
   *
   * 切换2D/3D模式
   * @memberof GisMap
   * @param {"2｜3"} [mode] 2或3，不传参数默认切换
   * @returns {"2｜3"}
   * 
   */
function setSceneMode2D3D(mode) {
  let _mode = 3;
  const { Cesium } = this;
  if (mode === 3) {
    this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
    _mode = 3
  } else if (mode === 2) {
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    _mode = 2
  } else if (this.viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
    this.viewer.scene.mode = Cesium.SceneMode.SCENE2D;
    _mode = 2
  } else {
    this.viewer.scene.mode = Cesium.SceneMode.SCENE3D;
    _mode = 3
  }
  return _mode
}
/**
 * 自定义星空背景图
 * @memberof GisMap
 * @param {string[]} sources 参考视角[右,左,下,上,前,后]
 */
function setSky(sources) {
  const { viewer, Cesium } = this;
  viewer.scene.skyBox = new Cesium.SkyBox({
    sources: {
      positiveX: sources[0],
      negativeX: sources[1],
      positiveY: sources[2],
      negativeY: sources[3],
      positiveZ: sources[4],
      negativeZ: sources[5],
    },
  });
}
/**
 *
 * 恢复默认星空背景图
 * @memberof GisMap
 */
function resetSky() {
  const { viewer, Cesium } = this;
  const baseUrl = globalThis.CESIUM_BASE_URL;
  viewer.scene.skyBox = new Cesium.SkyBox({
    sources: {
      positiveX: `${baseUrl}/Assets/Textures/SkyBox/tycho2t3_80_px.jpg`,
      negativeX: `${baseUrl}/Assets/Textures/SkyBox//tycho2t3_80_mx.jpg`,
      positiveY: `${baseUrl}/Assets/Textures/SkyBox//tycho2t3_80_py.jpg`,
      negativeY: `${baseUrl}/Assets/Textures/SkyBox//tycho2t3_80_my.jpg`,
      positiveZ: `${baseUrl}/Assets/Textures/SkyBox//tycho2t3_80_pz.jpg`,
      negativeZ: `${baseUrl}/Assets/Textures/SkyBox//tycho2t3_80_mz.jpg`,
    },
  });
}

/**
 *
 * 隐藏星空背景
 * @memberof GisMap
 */
function clearSky() {
  const { viewer } = this;
  viewer.scene.skyBox.show = false;
}
/**
 *
 *  截屏截图功能
 * @memberof GisMap
 * @param {('file'|'base64'|'img')} [type = 'file']  返回图片类型 【file】返回下载文件；【base64】返回base64格式数据 【img】返回DOM
 * @param {number} [width]  返回图片宽度 默认为画布宽度
 * @param {number} [height] 返回图片高度 默认为画布高度
 * @return {img} img 图片
 */
// eslint-disable-next-line default-param-last
function canvas2image(type = 'file', width, height) {
  const { viewer } = this;
  const { canvas } = viewer.scene;
  const _width = width || canvas.width;
  const _height = height || canvas.height;
  let img = null;
  switch (type) {
    case 'base64':
      img = Canvas2Image.saveAsData(canvas, _width, _height, 'png');
      break;
    case 'img':
      img = Canvas2Image.convertToImage(canvas, _width, _height, 'png');
      break;
    default:
      img = Canvas2Image.saveAsImage(canvas, _width, _height, 'png');
      break;
  }

  return img;
}

/**
 *
 * 高质量画质 （抗锯齿效果）
 * @memberof GisMap
 */
function hightQuality() {
  this.scene.fxaa = true;
  // this.scene.msaaSamples = 2;
  this.scene.postProcessStages.fxaa.enabled = true;
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    this.viewer.resolutionScale = window.devicePixelRatio;
  }
}


/**
 *
 * 低质量画质 （流畅度优先）
 * @memberof GisMap
 */
function lowQuality() {
  this.scene.fxaa = false;
  this.scene.postProcessStages.fxaa.enabled = false;
  if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
    this.viewer.resolutionScale = 1.0;
  }

}


// Cartesian 转 经纬度坐标
function getPositionByCartesian(cartesian3) {
  const { viewer, Cesium } = this
  var ellipsoid = viewer.scene.globe.ellipsoid;
  var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
  var latitude = Cesium.Math.toDegrees(cartographic.latitude);
  var longitude = Cesium.Math.toDegrees(cartographic.longitude);
  var height = cartographic.height;

  return {
    longitude,
    latitude,
    height
  }
}
// 地球自转
function globeRotate() {
  const { viewer } = this
  if (viewer.scene.mode !== Cesium.SceneMode.SCENE3D) {
    return ture;
  }
  let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(viewer.clock.currentTime);
  if (icrfToFixed) {
    let camera = viewer.camera;
    let offset = Cesium.Cartesian3.clone(camera.position);
    let transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
    // 偏移相机，否则会场景旋转而地球不转
    camera.lookAtTransform(transform, offset);
  }
}
// 地球自转
function globeRotateStart(speed = 15) {
  const { viewer } = this
  viewer.clock.shouldAnimate = true;
  viewer.clock.multiplier = speed * 1000;
  // 初始化为单位矩阵
  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  viewer.scene.postUpdate.addEventListener(globeRotate, this);
}
// 地球自转
function globeRotateStop() {
  const { viewer } = this
  viewer.clock.shouldAnimate = true;
  viewer.clock.multiplier = 1;
  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  viewer.scene.postUpdate.removeEventListener(globeRotate, this);

}



export default {
  zoomOut,
  zoomIn,
  setSceneMode2D3D,
  setSky,
  resetSky,
  clearSky,
  canvas2image,
  hightQuality,
  lowQuality,
  getPositionByCartesian,
  globeRotateStart,
  globeRotateStop
};

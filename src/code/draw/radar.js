/*
 * @Author: R10
 * @Date: 2022-06-02 10:17:54
 * @LastEditTime: 2022-06-02 11:48:10
 * @LastEditors: R10
 * @Description:
 * @FilePath: /gismap/src/code/draw/radar.js
 */
import {
  Cartographic, Cartesian4, Cartesian3, PostProcessStage, Matrix4, Quaternion, Matrix3, Math,
} from 'cesium';
/**
 *圆形扩大扫描圈
 */
function addCircleScanPostStage(viewer, cartographicCenter, maxRadius, scanColor, duration) {
  const ScanSegmentShader = 'uniform sampler2D colorTexture;\n'
    + 'uniform sampler2D depthTexture;\n'
    + 'varying vec2 v_textureCoordinates;\n'
    + 'uniform vec4 u_scanCenterEC;\n'
    + 'uniform vec3 u_scanPlaneNormalEC;\n'
    + 'uniform float u_radius;\n'
    + 'uniform vec4 u_scanColor;\n'
    + 'vec4 toEye(in vec2 uv, in float depth)\n'
    + ' {\n'
    + ' vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n'
    + ' vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n'
    + ' posInCamera =posInCamera / posInCamera.w;\n'
    + ' return posInCamera;\n'
    + ' }\n'
    + 'vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n'
    + '{\n'
    + 'vec3 v01 = point -planeOrigin;\n'
    + 'float d = dot(planeNormal, v01) ;\n'
    + 'return (point - planeNormal * d);\n'
    + '}\n'
    + 'float getDepth(in vec4 depth)\n'
    + '{\n'
    + 'float z_window = czm_unpackDepth(depth);\n'
    + 'z_window = czm_reverseLogDepth(z_window);\n'
    + 'float n_range = czm_depthRange.near;\n'
    + 'float f_range = czm_depthRange.far;\n'
    + 'return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n'
    + '}\n'
    + 'void main()\n'
    + '{\n'
    + 'gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n'
    + 'float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n'
    + 'vec4 viewPos = toEye(v_textureCoordinates, depth);\n'
    + 'vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n'
    + 'float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n'
    + 'if(dis < u_radius)\n'
    + '{\n'
    + 'float f = 1.0 -abs(u_radius - dis) / u_radius;\n'
    + 'f = pow(f, 4.0);\n'
    + 'gl_FragColor = mix(gl_FragColor, u_scanColor, f);\n'
    + '}\n'
    + '}\n';

  const _Cartesian3Center = Cartographic.toCartesian(cartographicCenter);
  const _Cartesian4Center = new Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
  const _CartographicCenter1 = new Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
  const _Cartesian3Center1 = Cartographic.toCartesian(_CartographicCenter1);
  const _Cartesian4Center1 = new Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
  const _time = (new Date()).getTime();
  const _scratchCartesian4Center = new Cartesian4();
  const _scratchCartesian4Center1 = new Cartesian4();
  const _scratchCartesian3Normal = new Cartesian3();
  const ScanPostStage = new PostProcessStage({
    fragmentShader: ScanSegmentShader,
    uniforms: {
      u_scanCenterEC() {
        return Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
      },
      u_scanPlaneNormalEC() {
        const temp = Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
        const temp1 = Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
        _scratchCartesian3Normal.x = temp1.x - temp.x;
        _scratchCartesian3Normal.y = temp1.y - temp.y;
        _scratchCartesian3Normal.z = temp1.z - temp.z;
        Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
        return _scratchCartesian3Normal;
      },
      u_radius() {
        // eslint-disable-next-line no-mixed-operators
        return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
      },
      u_scanColor: scanColor,
    },
  });
  viewer.scene.postProcessStages.add(ScanPostStage);
  return (ScanPostStage);
}
function addCircleScan(data) {
  this.viewer.scene.globe.depthTestAgainstTerrain = true; // 防止移动、放大缩小会视觉偏移depthTestAgainstTerrain // 设置该属性为true以后，标绘将位于地形的顶部；若是设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引起标绘消失的bug。
  const CartographicCenter = new Cartographic(Math.toRadians(data.longitude), Math.toRadians(data.latitude), 0); // 中心位子
  return addCircleScanPostStage(this.viewer, CartographicCenter, data.r, data.scanColor, data.interval);
}

/**
     *区域雷达扫描
     * */
function addRadarScanPostStage(viewer, cartographicCenter, radius, scanColor, duration) {
  const ScanSegmentShader = 'uniform sampler2D colorTexture;\n'
    + 'uniform sampler2D depthTexture;\n'
    + 'varying vec2 v_textureCoordinates;\n'
    + 'uniform vec4 u_scanCenterEC;\n'
    + 'uniform vec3 u_scanPlaneNormalEC;\n'
    + 'uniform vec3 u_scanLineNormalEC;\n'
    + 'uniform float u_radius;\n'
    + 'uniform vec4 u_scanColor;\n'
    + 'vec4 toEye(in vec2 uv, in float depth)\n'
    + ' {\n'
    + ' vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n'
    + ' vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n'
    + ' posInCamera =posInCamera / posInCamera.w;\n'
    + ' return posInCamera;\n'
    + ' }\n'
    + 'bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n'
    + '{\n'
    + 'vec3 v01 = testPt - ptOnLine;\n'
    + 'normalize(v01);\n'
    + 'vec3 temp = cross(v01, lineNormal);\n'
    + 'float d = dot(temp, u_scanPlaneNormalEC);\n'
    + 'return d > 0.5;\n'
    + '}\n'
    + 'vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n'
    + '{\n'
    + 'vec3 v01 = point -planeOrigin;\n'
    + 'float d = dot(planeNormal, v01) ;\n'
    + 'return (point - planeNormal * d);\n'
    + '}\n'
    + 'float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n'
    + '{\n'
    + 'vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n'
    + 'return length(tempPt - ptOnLine);\n'
    + '}\n'
    + 'float getDepth(in vec4 depth)\n'
    + '{\n'
    + 'float z_window = czm_unpackDepth(depth);\n'
    + 'z_window = czm_reverseLogDepth(z_window);\n'
    + 'float n_range = czm_depthRange.near;\n'
    + 'float f_range = czm_depthRange.far;\n'
    + 'return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n'
    + '}\n'
    + 'void main()\n'
    + '{\n'
    + 'gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n'
    + 'float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n'
    + 'vec4 viewPos = toEye(v_textureCoordinates, depth);\n'
    + 'vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n'
    + 'float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n'
    + 'float twou_radius = u_radius * 1.5;\n'
    + 'if(dis < u_radius)\n'
    + '{\n'
    + 'float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n'
    + 'f0 = pow(f0, 64.0);\n'
    + 'vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n'
    + 'float f = 0.0;\n'
    + 'if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n'
    + '{\n'
    + 'float dis1= length(prjOnPlane.xyz - lineEndPt);\n'
    + 'f = abs(twou_radius -dis1) / twou_radius;\n'
    + 'f = pow(f, 3.0);\n'
    + '}\n'
    + 'gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);\n'
    + '}\n'
    + '}\n';

  const _Cartesian3Center = Cartographic.toCartesian(cartographicCenter);
  const _Cartesian4Center = new Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
  const _CartographicCenter1 = new Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
  const _Cartesian3Center1 = Cartographic.toCartesian(_CartographicCenter1);
  const _Cartesian4Center1 = new Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
  const _CartographicCenter2 = new Cartographic(cartographicCenter.longitude + Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
  const _Cartesian3Center2 = Cartographic.toCartesian(_CartographicCenter2);
  const _Cartesian4Center2 = new Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
  const _RotateQ = new Quaternion();
  const _RotateM = new Matrix3();
  const _time = (new Date()).getTime();
  const _scratchCartesian4Center = new Cartesian4();
  const _scratchCartesian4Center1 = new Cartesian4();
  const _scratchCartesian4Center2 = new Cartesian4();
  const _scratchCartesian3Normal = new Cartesian3();
  const _scratchCartesian3Normal1 = new Cartesian3();
  const ScanPostStage = new PostProcessStage({
    fragmentShader: ScanSegmentShader,
    uniforms: {
      u_scanCenterEC() {
        return Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
      },
      u_scanPlaneNormalEC() {
        const temp = Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
        const temp1 = Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
        _scratchCartesian3Normal.x = temp1.x - temp.x;
        _scratchCartesian3Normal.y = temp1.y - temp.y;
        _scratchCartesian3Normal.z = temp1.z - temp.z;
        Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
        return _scratchCartesian3Normal;
      },
      u_radius: radius,
      u_scanLineNormalEC() {
        const temp = Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
        const temp1 = Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
        const temp2 = Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);
        _scratchCartesian3Normal.x = temp1.x - temp.x;
        _scratchCartesian3Normal.y = temp1.y - temp.y;
        _scratchCartesian3Normal.z = temp1.z - temp.z;
        Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
        _scratchCartesian3Normal1.x = temp2.x - temp.x;
        _scratchCartesian3Normal1.y = temp2.y - temp.y;
        _scratchCartesian3Normal1.z = temp2.z - temp.z;
        const tempTime = (((new Date()).getTime() - _time) % duration) / duration;
        Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Math.PI * 2, _RotateQ);
        Matrix3.fromQuaternion(_RotateQ, _RotateM);
        Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
        Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
        return _scratchCartesian3Normal1;
      },
      u_scanColor: scanColor,
    },
  });
  viewer.scene.postProcessStages.add(ScanPostStage);
  return (ScanPostStage);
}
function addRadarScan(data) {
  this.viewer.scene.globe.depthTestAgainstTerrain = true; // 防止移动、放大缩小会视觉偏移depthTestAgainstTerrain // 设置该属性为true以后，标绘将位于地形的顶部；若是设为false（默认值），那么标绘将位于平面上。缺陷：开启该属性有可能在切换图层时会引起标绘消失的bug。
  const CartographicCenter = new Cartographic(Math.toRadians(data.longitude), Math.toRadians(data.latitude), 0); // 中心位子
  return addRadarScanPostStage(this.viewer, CartographicCenter, data.r, data.scanColor, data.interval);
}

export default {
  addRadarScan,
  addCircleScan,
};

// 颜色注意必须是var scanColor = new Color(1.0, 0.0, 0.0, 1);rgba形式的‘red’和‘#fff’都不行

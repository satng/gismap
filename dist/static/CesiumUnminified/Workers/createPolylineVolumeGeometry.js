define(["./defaultValue-81eec7ed","./Matrix2-c430e55a","./arrayRemoveDuplicates-1a15bd09","./BoundingRectangle-3072993b","./Transforms-4ee811db","./ComponentDatatype-9e86ac8f","./PolylineVolumeGeometryLibrary-d36d4567","./RuntimeError-8952249c","./GeometryAttribute-51ed9bde","./GeometryAttributes-32b29525","./GeometryPipeline-7b7ac762","./IndexDatatype-bed3935d","./PolygonPipeline-0605b100","./VertexFormat-7df34ea5","./_commonjsHelpers-3aae1032-26891ab7","./combine-3c023bda","./WebGLConstants-508b9636","./EllipsoidTangentPlane-0152c019","./AxisAlignedBoundingBox-52bc7e5b","./IntersectionTests-4d132f79","./Plane-7e828ad8","./PolylinePipeline-b3067570","./EllipsoidGeodesic-22d2f504","./EllipsoidRhumbLine-c86f0674","./AttributeCompression-046b70bd","./EncodedCartesian3-a57a8b60"],(function(e,t,n,o,i,r,a,l,s,p,d,c,u,m,y,g,h,f,b,E,P,_,v,k,V,L){"use strict";function w(n){const o=(n=e.defaultValue(n,e.defaultValue.EMPTY_OBJECT)).polylinePositions,i=n.shapePositions;if(!e.defined(o))throw new l.DeveloperError("options.polylinePositions is required.");if(!e.defined(i))throw new l.DeveloperError("options.shapePositions is required.");this._positions=o,this._shape=i,this._ellipsoid=t.Ellipsoid.clone(e.defaultValue(n.ellipsoid,t.Ellipsoid.WGS84)),this._cornerType=e.defaultValue(n.cornerType,a.CornerType.ROUNDED),this._vertexFormat=m.VertexFormat.clone(e.defaultValue(n.vertexFormat,m.VertexFormat.DEFAULT)),this._granularity=e.defaultValue(n.granularity,r.CesiumMath.RADIANS_PER_DEGREE),this._workerName="createPolylineVolumeGeometry";let s=1+o.length*t.Cartesian3.packedLength;s+=1+i.length*t.Cartesian2.packedLength,this.packedLength=s+t.Ellipsoid.packedLength+m.VertexFormat.packedLength+2}w.pack=function(n,o,i){if(!e.defined(n))throw new l.DeveloperError("value is required");if(!e.defined(o))throw new l.DeveloperError("array is required");let r;i=e.defaultValue(i,0);const a=n._positions;let s=a.length;for(o[i++]=s,r=0;r<s;++r,i+=t.Cartesian3.packedLength)t.Cartesian3.pack(a[r],o,i);const p=n._shape;for(s=p.length,o[i++]=s,r=0;r<s;++r,i+=t.Cartesian2.packedLength)t.Cartesian2.pack(p[r],o,i);return t.Ellipsoid.pack(n._ellipsoid,o,i),i+=t.Ellipsoid.packedLength,m.VertexFormat.pack(n._vertexFormat,o,i),i+=m.VertexFormat.packedLength,o[i++]=n._cornerType,o[i]=n._granularity,o};const x=t.Ellipsoid.clone(t.Ellipsoid.UNIT_SPHERE),C=new m.VertexFormat,D={polylinePositions:void 0,shapePositions:void 0,ellipsoid:x,vertexFormat:C,cornerType:void 0,granularity:void 0};w.unpack=function(n,o,i){if(!e.defined(n))throw new l.DeveloperError("array is required");let r;o=e.defaultValue(o,0);let a=n[o++];const s=new Array(a);for(r=0;r<a;++r,o+=t.Cartesian3.packedLength)s[r]=t.Cartesian3.unpack(n,o);a=n[o++];const p=new Array(a);for(r=0;r<a;++r,o+=t.Cartesian2.packedLength)p[r]=t.Cartesian2.unpack(n,o);const d=t.Ellipsoid.unpack(n,o,x);o+=t.Ellipsoid.packedLength;const c=m.VertexFormat.unpack(n,o,C);o+=m.VertexFormat.packedLength;const u=n[o++],y=n[o];return e.defined(i)?(i._positions=s,i._shape=p,i._ellipsoid=t.Ellipsoid.clone(d,i._ellipsoid),i._vertexFormat=m.VertexFormat.clone(c,i._vertexFormat),i._cornerType=u,i._granularity=y,i):(D.polylinePositions=s,D.shapePositions=p,D.cornerType=u,D.granularity=y,new w(D))};const F=new o.BoundingRectangle;return w.createGeometry=function(e){const l=e._positions,m=n.arrayRemoveDuplicates(l,t.Cartesian3.equalsEpsilon);let y=e._shape;if(y=a.PolylineVolumeGeometryLibrary.removeDuplicatesFromShape(y),m.length<2||y.length<3)return;u.PolygonPipeline.computeWindingOrder2D(y)===u.WindingOrder.CLOCKWISE&&y.reverse();const g=o.BoundingRectangle.fromPoints(y,F);return function(e,t,n,o){const l=new p.GeometryAttributes;o.position&&(l.position=new s.GeometryAttribute({componentDatatype:r.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:e}));const m=t.length,y=e.length/3,g=(y-2*m)/(2*m),h=u.PolygonPipeline.triangulate(t),f=(g-1)*m*6+2*h.length,b=c.IndexDatatype.createTypedArray(y,f);let E,P,_,v,k,V;const L=2*m;let w=0;for(E=0;E<g-1;E++){for(P=0;P<m-1;P++)_=2*P+E*m*2,V=_+L,v=_+1,k=v+L,b[w++]=v,b[w++]=_,b[w++]=k,b[w++]=k,b[w++]=_,b[w++]=V;_=2*m-2+E*m*2,v=_+1,k=v+L,V=_+L,b[w++]=v,b[w++]=_,b[w++]=k,b[w++]=k,b[w++]=_,b[w++]=V}if(o.st||o.tangent||o.bitangent){const e=new Float32Array(2*y),o=1/(g-1),i=1/n.height,a=n.height/2;let p,d,c=0;for(E=0;E<g;E++){for(p=E*o,d=i*(t[0].y+a),e[c++]=p,e[c++]=d,P=1;P<m;P++)d=i*(t[P].y+a),e[c++]=p,e[c++]=d,e[c++]=p,e[c++]=d;d=i*(t[0].y+a),e[c++]=p,e[c++]=d}for(P=0;P<m;P++)p=0,d=i*(t[P].y+a),e[c++]=p,e[c++]=d;for(P=0;P<m;P++)p=(g-1)*o,d=i*(t[P].y+a),e[c++]=p,e[c++]=d;l.st=new s.GeometryAttribute({componentDatatype:r.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:new Float32Array(e)})}const x=y-2*m;for(E=0;E<h.length;E+=3){const e=h[E]+x,t=h[E+1]+x,n=h[E+2]+x;b[w++]=e,b[w++]=t,b[w++]=n,b[w++]=n+m,b[w++]=t+m,b[w++]=e+m}let C=new s.Geometry({attributes:l,indices:b,boundingSphere:i.BoundingSphere.fromVertices(e),primitiveType:s.PrimitiveType.TRIANGLES});if(o.normal&&(C=d.GeometryPipeline.computeNormal(C)),o.tangent||o.bitangent){try{C=d.GeometryPipeline.computeTangentAndBitangent(C)}catch(e){a.oneTimeWarning("polyline-volume-tangent-bitangent","Unable to compute tangents and bitangents for polyline volume geometry")}o.tangent||(C.attributes.tangent=void 0),o.bitangent||(C.attributes.bitangent=void 0),o.st||(C.attributes.st=void 0)}return C}(a.PolylineVolumeGeometryLibrary.computePositions(m,y,g,e,!0),y,g,e._vertexFormat)},function(n,o){return e.defined(o)&&(n=w.unpack(n,o)),n._ellipsoid=t.Ellipsoid.clone(n._ellipsoid),w.createGeometry(n)}}));
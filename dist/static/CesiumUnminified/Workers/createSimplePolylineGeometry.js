define(["./defaultValue-81eec7ed","./Matrix2-c430e55a","./ArcType-fc72c06c","./Transforms-4ee811db","./Color-8d08a55c","./ComponentDatatype-9e86ac8f","./RuntimeError-8952249c","./GeometryAttribute-51ed9bde","./GeometryAttributes-32b29525","./IndexDatatype-bed3935d","./PolylinePipeline-b3067570","./_commonjsHelpers-3aae1032-26891ab7","./combine-3c023bda","./WebGLConstants-508b9636","./EllipsoidGeodesic-22d2f504","./EllipsoidRhumbLine-c86f0674","./IntersectionTests-4d132f79","./Plane-7e828ad8"],(function(e,o,t,r,l,n,i,a,s,d,c,p,f,u,y,h,C,g){"use strict";function m(e,o,t,r,n,i,a){const s=c.PolylinePipeline.numberOfPoints(e,o,n);let d;const p=t.red,f=t.green,u=t.blue,y=t.alpha,h=r.red,C=r.green,g=r.blue,m=r.alpha;if(l.Color.equals(t,r)){for(d=0;d<s;d++)i[a++]=l.Color.floatToByte(p),i[a++]=l.Color.floatToByte(f),i[a++]=l.Color.floatToByte(u),i[a++]=l.Color.floatToByte(y);return a}const T=(h-p)/s,E=(C-f)/s,b=(g-u)/s,_=(m-y)/s;let P=a;for(d=0;d<s;d++)i[P++]=l.Color.floatToByte(p+d*T),i[P++]=l.Color.floatToByte(f+d*E),i[P++]=l.Color.floatToByte(u+d*b),i[P++]=l.Color.floatToByte(y+d*_);return P}function T(r){const a=(r=e.defaultValue(r,e.defaultValue.EMPTY_OBJECT)).positions,s=r.colors,d=e.defaultValue(r.colorsPerVertex,!1);if(!e.defined(a)||a.length<2)throw new i.DeveloperError("At least two positions are required.");if(e.defined(s)&&(d&&s.length<a.length||!d&&s.length<a.length-1))throw new i.DeveloperError("colors has an invalid length.");this._positions=a,this._colors=s,this._colorsPerVertex=d,this._arcType=e.defaultValue(r.arcType,t.ArcType.GEODESIC),this._granularity=e.defaultValue(r.granularity,n.CesiumMath.RADIANS_PER_DEGREE),this._ellipsoid=e.defaultValue(r.ellipsoid,o.Ellipsoid.WGS84),this._workerName="createSimplePolylineGeometry";let c=1+a.length*o.Cartesian3.packedLength;c+=e.defined(s)?1+s.length*l.Color.packedLength:1,this.packedLength=c+o.Ellipsoid.packedLength+3}T.pack=function(t,r,n){if(!e.defined(t))throw new i.DeveloperError("value is required");if(!e.defined(r))throw new i.DeveloperError("array is required");let a;n=e.defaultValue(n,0);const s=t._positions;let d=s.length;for(r[n++]=d,a=0;a<d;++a,n+=o.Cartesian3.packedLength)o.Cartesian3.pack(s[a],r,n);const c=t._colors;for(d=e.defined(c)?c.length:0,r[n++]=d,a=0;a<d;++a,n+=l.Color.packedLength)l.Color.pack(c[a],r,n);return o.Ellipsoid.pack(t._ellipsoid,r,n),n+=o.Ellipsoid.packedLength,r[n++]=t._colorsPerVertex?1:0,r[n++]=t._arcType,r[n]=t._granularity,r},T.unpack=function(t,r,n){if(!e.defined(t))throw new i.DeveloperError("array is required");let a;r=e.defaultValue(r,0);let s=t[r++];const d=new Array(s);for(a=0;a<s;++a,r+=o.Cartesian3.packedLength)d[a]=o.Cartesian3.unpack(t,r);s=t[r++];const c=s>0?new Array(s):void 0;for(a=0;a<s;++a,r+=l.Color.packedLength)c[a]=l.Color.unpack(t,r);const p=o.Ellipsoid.unpack(t,r);r+=o.Ellipsoid.packedLength;const f=1===t[r++],u=t[r++],y=t[r];return e.defined(n)?(n._positions=d,n._colors=c,n._ellipsoid=p,n._colorsPerVertex=f,n._arcType=u,n._granularity=y,n):new T({positions:d,colors:c,ellipsoid:p,colorsPerVertex:f,arcType:u,granularity:y})};const E=new Array(2),b=new Array(2),_={positions:E,height:b,ellipsoid:void 0,minDistance:void 0,granularity:void 0};return T.createGeometry=function(i){const p=i._positions,f=i._colors,u=i._colorsPerVertex,y=i._arcType,h=i._granularity,C=i._ellipsoid,g=n.CesiumMath.chordLength(h,C.maximumRadius),T=e.defined(f)&&!u;let P;const A=p.length;let B,w,k,D,G=0;if(y===t.ArcType.GEODESIC||y===t.ArcType.RHUMB){let o,r,i;y===t.ArcType.GEODESIC?(o=n.CesiumMath.chordLength(h,C.maximumRadius),r=c.PolylinePipeline.numberOfPoints,i=c.PolylinePipeline.generateArc):(o=h,r=c.PolylinePipeline.numberOfPointsRhumbLine,i=c.PolylinePipeline.generateRhumbArc);const a=c.PolylinePipeline.extractHeights(p,C),s=_;if(y===t.ArcType.GEODESIC?s.minDistance=g:s.granularity=h,s.ellipsoid=C,T){let t=0;for(P=0;P<A-1;P++)t+=r(p[P],p[P+1],o)+1;B=new Float64Array(3*t),k=new Uint8Array(4*t),s.positions=E,s.height=b;let n=0;for(P=0;P<A-1;++P){E[0]=p[P],E[1]=p[P+1],b[0]=a[P],b[1]=a[P+1];const o=i(s);if(e.defined(f)){const e=o.length/3;D=f[P];for(let o=0;o<e;++o)k[n++]=l.Color.floatToByte(D.red),k[n++]=l.Color.floatToByte(D.green),k[n++]=l.Color.floatToByte(D.blue),k[n++]=l.Color.floatToByte(D.alpha)}B.set(o,G),G+=o.length}}else if(s.positions=p,s.height=a,B=new Float64Array(i(s)),e.defined(f)){for(k=new Uint8Array(B.length/3*4),P=0;P<A-1;++P)G=m(p[P],p[P+1],f[P],f[P+1],g,k,G);const e=f[A-1];k[G++]=l.Color.floatToByte(e.red),k[G++]=l.Color.floatToByte(e.green),k[G++]=l.Color.floatToByte(e.blue),k[G++]=l.Color.floatToByte(e.alpha)}}else{w=T?2*A-2:A,B=new Float64Array(3*w),k=e.defined(f)?new Uint8Array(4*w):void 0;let t=0,r=0;for(P=0;P<A;++P){const n=p[P];if(T&&P>0&&(o.Cartesian3.pack(n,B,t),t+=3,D=f[P-1],k[r++]=l.Color.floatToByte(D.red),k[r++]=l.Color.floatToByte(D.green),k[r++]=l.Color.floatToByte(D.blue),k[r++]=l.Color.floatToByte(D.alpha)),T&&P===A-1)break;o.Cartesian3.pack(n,B,t),t+=3,e.defined(f)&&(D=f[P],k[r++]=l.Color.floatToByte(D.red),k[r++]=l.Color.floatToByte(D.green),k[r++]=l.Color.floatToByte(D.blue),k[r++]=l.Color.floatToByte(D.alpha))}}const L=new s.GeometryAttributes;L.position=new a.GeometryAttribute({componentDatatype:n.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:B}),e.defined(f)&&(L.color=new a.GeometryAttribute({componentDatatype:n.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:4,values:k,normalize:!0})),w=B.length/3;const v=2*(w-1),V=d.IndexDatatype.createTypedArray(w,v);let x=0;for(P=0;P<w-1;++P)V[x++]=P,V[x++]=P+1;return new a.Geometry({attributes:L,indices:V,primitiveType:a.PrimitiveType.LINES,boundingSphere:r.BoundingSphere.fromPoints(p)})},function(t,r){return e.defined(r)&&(t=T.unpack(t,r)),t._ellipsoid=o.Ellipsoid.clone(t._ellipsoid),T.createGeometry(t)}}));
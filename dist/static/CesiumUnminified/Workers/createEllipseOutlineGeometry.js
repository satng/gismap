define(["./Matrix2-c430e55a","./defaultValue-81eec7ed","./EllipseOutlineGeometry-e8bb826f","./RuntimeError-8952249c","./ComponentDatatype-9e86ac8f","./WebGLConstants-508b9636","./GeometryOffsetAttribute-2bff0974","./Transforms-4ee811db","./_commonjsHelpers-3aae1032-26891ab7","./combine-3c023bda","./EllipseGeometryLibrary-688714cd","./GeometryAttribute-51ed9bde","./GeometryAttributes-32b29525","./IndexDatatype-bed3935d"],(function(e,t,r,i,n,o,l,a,s,c,b,d,u,m){"use strict";return function(i,n){return t.defined(n)&&(i=r.EllipseOutlineGeometry.unpack(i,n)),i._center=e.Cartesian3.clone(i._center),i._ellipsoid=e.Ellipsoid.clone(i._ellipsoid),r.EllipseOutlineGeometry.createGeometry(i)}}));
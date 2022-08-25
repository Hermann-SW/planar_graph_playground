"use strict"; // avoid module leak

var exports = {};
var scad = exports;

if (true) {
    var fs = require("fs");
    var writer;
    var eps = 1e-6;

    function rad2deg(r) {
        return r / Math.PI * 180;
    }

    function srad2deg(p) {
        return [rad2deg(p[0]), rad2deg(p[1])];
    }

    function out(x) {
        return (typeof(x) === 'object') ? JSON.stringify(x) : x;
    }

    exports.wlog_ = function (...s) {
        writer.write(out(s[0]));
        for(var i=1; i<s.length; ++i) {
            writer.write(" " + out(s[i]));
        }
    }
    var wlog_ = exports.wlog_;
    exports.wlog = function (...s) {
        writer.write(out(s[0]));
        for(var i=1; i<s.length; ++i) {
            writer.write(" " + out(s[i]));
        }
        writer.write("\n");
    }
    var wlog = exports.wlog;

    exports.open = function (name = 'x.jscad') {
        writer = fs.createWriteStream(name);
    };

    exports.close = function () {
        writer.close();
    };

    exports.header = function (coords, sc) {
        wlog("const jscad = require('@jscad/modeling')");
        wlog("const { colorize } = jscad.colors");
        wlog("const { cuboid, cube, sphere, cylinder, circle, polygon } = jscad.primitives");
        wlog("const { rotate, translate } = jscad.transforms");
        wlog("const { degToRad } = jscad.utils");
        wlog("const { add, normalize, length, scale, dot } = jscad.maths.vec3");
        wlog("const { extrudeRotate, extrudeLinear } = require('@jscad/modeling').extrusions");
        wlog("const { intersect, subtract, union } = require('@jscad/modeling').booleans");
        wlog("const { hull, hullChain } = require('@jscad/modeling').hulls");
        wlog("const { vectorText } = require('@jscad/modeling').text");

        wlog("function getParameterDefinitions() {");
        wlog("  return [");
        wlog("     { name: 'faces', type: 'choice', values: ['Pentagons', '6coloring', 'None'], initial: 'Pentagons', caption: 'face coloring:' },");
        wlog("    ,{ name: 'white', type: 'checkbox', checked: true, initial: '20', caption: 'surface of sphere:' },");
        wlog("    ,{ name: 'half', type: 'checkbox', checked: true, initial: '20', caption: 'half vertex:' },");
        wlog("    ,{ name: 'vtxt', type: 'choice', values: ['Id', 'Type', 'theta', 'phi', 'None'], initial: 'Type', caption: 'vtxt:' },");
        wlog("    ,{ name: 'look_inside', type: 'choice', values: ['no', 'yes'], initial: 'no', caption: 'look_inside:' }");
        wlog("  ];");
        wlog("}");

        wlog("function map_3D(c, sc) {");
        wlog("  return [Math.cos(degToRad(c[0]))*Math.sin(degToRad(c[1]))*sc, Math.sin(degToRad(c[0]))*Math.sin(degToRad(c[1]))*sc, Math.cos(degToRad(c[1]))*sc]");
        wlog("}");

        wlog("eps = 1e-6");

        wlog("sc =", sc);
        wlog("coords =[");
        coords.forEach(function (p, i) {
            if (i > 0) {
                wlog(",", srad2deg(p));
            } else {
                wlog(srad2deg(p));
            }
        });
        wlog("]");

        wlog("function vertex(_v, half=false) {");
        wlog("    p = coords[_v] ");
        wlog("    v = map_3D(p,sc)");
	wlog("    s = sphere({radius: 0.5, center: v})");
	wlog("    if (half) {");
        wlog("        la1 = degToRad(p[0])");
        wlog("        ph1 = degToRad(90 - p[1])");
        wlog("        return colorize([0, 0.7, 0],");
        wlog("            subtract(s,");
        wlog("                translate([0, 0, 0],");
        wlog("                    rotate([0, 0, la1],");
        wlog("                        rotate([0, -ph1, 0],");
        wlog("                            translate([sc+0.5, 0],");
        wlog("                                rotate([degToRad(90), 0, degToRad(90)],");
        wlog("                                    translate([-0, -0, -1],");
        wlog("                                         cuboid({size: [1, 1, 0.8]})");
        wlog("                                    )");
        wlog("                                )");
        wlog("                            )");
        wlog("                        )");
        wlog("                    )");
        wlog("                )");
        wlog("            )");
        wlog("        )");
        wlog("    } else {");
        wlog("        return colorize([0, 0.7, 0], s)");
        wlog("    }");
        wlog("}");

        wlog("function txt(mesg, w) {");
        wlog("    const lineRadius = w / 2");
        wlog("    const lineCorner = circle({ radius: lineRadius })");
        wlog("");
        wlog("    const lineSegmentPointArrays = vectorText({ x: 0, y: 0, height: 0.25, input: mesg })");
        wlog("");
        wlog("    const lineSegments = []");
        wlog("    lineSegmentPointArrays.forEach(function(segmentPoints) {");
        wlog("        const corners = segmentPoints.map((point) => translate(point, lineCorner))");
        wlog("        lineSegments.push(hullChain(corners))");
        wlog("    })");
        wlog("    const message2D = union(lineSegments)");
        wlog("    return extrudeLinear({ height: w }, message2D)");
        wlog("}");

        wlog("function vtxt(_p1, num) {");
        wlog("    str = num.toString()");
        wlog("    p1 = coords[_p1]");
        wlog("    la1 = degToRad(p1[0])");
        wlog("    ph1 = degToRad(90 - p1[1])");
        wlog("    return translate([0, 0, 0],");
        wlog("        rotate([0, 0, la1],");
        wlog("            rotate([0, -ph1, 0],");
        wlog("                translate([sc+0.5, 0.15-0.25*str.length],");
        wlog("                    rotate([degToRad(90), 0, degToRad(90)],");
        wlog("                        colorize([0, 0, 0],");
        wlog("                            txt(str, 0.05)");
        wlog("                        )");
        wlog("                    )");
        wlog("                )");
        wlog("            )");
        wlog("        )");
        wlog("    )");
        wlog("}");

        wlog("/*");
        wlog("function edge(_v, _w) {");
        wlog("    v = map_3D(coords[_v], sc)");
        wlog("    w = map_3D(coords[_w], sc)");
        wlog("    d = [0, 0, 0]");
        wlog("    x = [0, 0, 0]");
        wlog("    subtract(d, w, v)");
        wlog("    add(x, v, w)");
        wlog("    scale(w, x, 0.5)");
        wlog("    return colorize([0, 0, 1, 1], ");
        wlog("        translate(w, ");
        wlog("            rotate([0, Math.acos(d[2]/length(d)), Math.atan2(d[1], d[0])],");
        wlog("                cylinder({radius: 0.1, height: length(d)})");
        wlog("            )");
        wlog("        )");
        wlog("    )");
        wlog("}");
        wlog("*/");
    };

    exports.header2 = function () {
        wlog("function edge2(_p1, _p2, _e) {");
        wlog("    p1 = coords[_p1]");
        wlog("    p2 = coords[_p2]");
        wlog("    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course");
        wlog("    la1 = degToRad(p1[0])");
        wlog("    la2 = degToRad(p2[0])");
        wlog("    l12 = la2 - la1");
        wlog("    ph1 = degToRad(90 - p1[1])");
        wlog("    ph2 = degToRad(90 - p2[1])");
        wlog("    al1 = Math.atan2(Math.cos(ph2)*Math.sin(l12), Math.cos(ph1)*Math.sin(ph2)-Math.sin(ph1)*Math.cos(ph2)*Math.cos(l12))");
        wlog("    // delta sigma_12");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae");
        wlog("    s12 = Math.acos(Math.sin(ph1)*Math.sin(ph2)+Math.cos(ph1)*Math.cos(ph2)*Math.cos(l12))");
        wlog("    return rotate([0, 0, la1],");
        wlog("        rotate([0, -ph1, 0],");
        wlog("            rotate([degToRad(90)-al1, 0, 0],");
        wlog("                colorize([0, 0, 0.7],");
        wlog("                    extrudeRotate({segments: 32, angle: s12},");
        wlog("                        circle({radius: 0.1, center: [sc,0]})");
        wlog("                    )");
        wlog("                )");
        wlog("            )");
        wlog("        )");
        wlog("    )");
        wlog("}");

        wlog("function sp_tria2(r, tang, pang, thi, points, segments) {");
        wlog("    const coords = []");
        wlog("    pts2 = Math.trunc(points / 2)");
        wlog("    ");
        wlog("    for(i = 0; i<pts2; i=i+1) {");
        wlog("        th = i*(tang/(pts2-1))");
        wlog("        coords.push([(r-thi/2)*Math.sin(th), (r-thi/2)*Math.cos(th)])");
        wlog("    }");
        wlog("    for(i = pts2-1; i>=0; i=i-1) {");
        wlog("        th = i*(tang/(pts2-1))");
        wlog("        coords.push([(r+thi/2)*Math.sin(th), (r+thi/2)*Math.cos(th)])");
        wlog("    }");
        wlog("    return extrudeRotate({segments: segments, angle: pang}, ");
        wlog("        polygon({points: coords})");
        wlog("    )");
        wlog("}");

        wlog("function sp_tria(_p1, _p2, _p3, sub) {");
        wlog("    p1 = coords[_p1]");
        wlog("    p2 = coords[_p2]");
        wlog("    p3 = coords[_p3]");
        wlog("    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course");
        wlog("    la1 = degToRad(p1[0])");
        wlog("    la2 = degToRad(p2[0])");
        wlog("    la3 = degToRad(p3[0])");
        wlog("    l12 = la2 - la1");
        wlog("    l13 = la3 - la1");
        wlog("    l32 = la2 - la3");
        wlog("    l23 = la3 - la2");
        wlog("    l31 = la1 - la3");
        wlog("    ph1 = degToRad(90 - p1[1])");
        wlog("    ph2 = degToRad(90 - p2[1])");
        wlog("    ph3 = degToRad(90 - p3[1])");
        wlog("    al12 = Math.atan2(Math.cos(ph2)*Math.sin(l12), Math.cos(ph1)*Math.sin(ph2)-Math.sin(ph1)*Math.cos(ph2)*Math.cos(l12))");
        wlog("    al13 = Math.atan2(Math.cos(ph3)*Math.sin(l13), Math.cos(ph1)*Math.sin(ph3)-Math.sin(ph1)*Math.cos(ph3)*Math.cos(l13))");
        wlog("    al31 = Math.atan2(Math.cos(ph1)*Math.sin(l31), Math.cos(ph3)*Math.sin(ph1)-Math.sin(ph3)*Math.cos(ph1)*Math.cos(l31))");
        wlog("    al32 = Math.atan2(Math.cos(ph2)*Math.sin(l32), Math.cos(ph3)*Math.sin(ph2)-Math.sin(ph3)*Math.cos(ph2)*Math.cos(l32))");
        wlog("    // delta sigma_xy");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae");
        wlog("    s12 = Math.acos(Math.sin(ph1)*Math.sin(ph2)+Math.cos(ph1)*Math.cos(ph2)*Math.cos(l12))");
        wlog("    s23 = Math.acos(Math.sin(ph2)*Math.sin(ph3)+Math.cos(ph2)*Math.cos(ph3)*Math.cos(l23))");
        wlog("    s13 = Math.acos(Math.sin(ph1)*Math.sin(ph3)+Math.cos(ph1)*Math.cos(ph3)*Math.cos(l13))");
        wlog("");
        wlog("    if (s13 < s12) {");
        wlog("        if (s12 >= s23) {");
        wlog("            return sp_tria(_p1, _p3, _p2, sub)");
        wlog("        } else {");
        wlog("            return sp_tria(_p2, _p1, _p3, sub)");
        wlog("        }");
        wlog("    } else {");
        wlog("        if (s13 < s23) {");
        wlog("            return sp_tria(_p2, _p1, _p3, sub)");
        wlog("        } else if (Math.abs(s13-s12-s23) >= eps) {");
        wlog("            function mpi(ang) { return (ang < -Math.PI) ? 2*Math.PI + ang : ((ang > Math.PI) ? ang - 2*Math.PI : ang) }");
        wlog("");
        wlog("            v1 = map_3D(p1, 1)");
        wlog("            v2 = map_3D(p2, 1)");
        wlog("            v3 = map_3D(p3, 1)");
        wlog("            ms = [0, 0, 0]");
        wlog("            ms2 = [0, 0, 0]");
        wlog("            sv1=[0, 0, 0]");
        wlog("            sv2=[0, 0, 0]");
        wlog("            sv3=[0, 0, 0]");
        wlog("            s1=[0, 0, 0]");
        wlog("            s2=[0, 0, 0]");
        wlog("            s3=[0, 0, 0]");
        wlog("            add(ms, v1, v2)");
        wlog("            add(ms, ms, v3)");
        wlog("            normalize(ms2, ms)");
        wlog("            mi = Math.min(dot(v1, ms2), dot(v2, ms2), dot(v3, ms2))");
        wlog("");
        wlog("            scale(sv1, v1, sc)");
        wlog("            scale(sv2, v2, sc)");
        wlog("            scale(sv3, v3, sc)");
        wlog("            scale(s1, sv1, 1/mi)");
        wlog("            scale(s2, sv2, 1/mi)");
        wlog("            scale(s3, sv3, 1/mi)");
        wlog("");
        wlog("            return colorize([0.5, 0.5, 0.5],");
        wlog("                subtract(");
        wlog("                    intersect(");
        wlog("                        union(");
        wlog("                            translate([0, 0, 0],");
        wlog("                                rotate([0, 0, la1-degToRad(180)],");
        wlog("                                    rotate([0, ph1-degToRad(90), 0],");
        wlog("                                        rotate([0,0,-al13],");
        wlog("                                            sp_tria2(sc, s12, mpi(al13-al12), 0.1, 24, 30)");
        wlog("                                        )");
        wlog("                                    )");
        wlog("                                )");
        wlog("                            ),");
        wlog("                            translate([0, 0, 0],");
        wlog("                                rotate([0, 0, la3-degToRad(180)],");
        wlog("                                    rotate([0, ph3-degToRad(90), 0],");
        wlog("                                        rotate([0, 0, -al31],");
        wlog("                                            sp_tria2(sc, s23, mpi(al31-al32), 0.1, 24, 30)");
        wlog("                                        )");
        wlog("                                    )");
        wlog("                                )");
        wlog("                            )");
        wlog("                        ),");
        wlog("                        hull(");
        wlog("                            cube({center: sv1, size: 0.01})");
        wlog("                            ,cube({center: sv2, size: 0.01})");
        wlog("                            ,cube({center: sv3, size: 0.01})");
        wlog("                            ,cube({center: s1, size: 0.01})");
        wlog("                            ,cube({center: s2, size: 0.01})");
        wlog("                            ,cube({center: s3, size: 0.01})");
        wlog("                        )");
        wlog("                   )");
        wlog("                   ,sub)");
        wlog("                )");
        wlog("        } else {");
        wlog("            return cube({size: 0.01})");
        wlog("        }");
        wlog("    }");
        wlog("}");
    };
}

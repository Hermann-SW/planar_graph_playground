"use strict"; // avoid module leak

var exports = {};
var scad = exports;

if (true) {
    var fs = require("fs");
    var writer;

    function rad2deg(r) {
        return r / Math.PI * 180;
    }

    function srad2deg(p) {
        return [rad2deg(p[0]), rad2deg(p[1])];
    }

    function out(x) {
        return (typeof(x) === 'object') ? JSON.stringify(x) : x;
    }

    exports.wlog = function (...s) {
        writer.write(out(s[0]));
        for(var i=1; i<s.length; ++i) {
            writer.write(" " + out(s[i]));
        }
        writer.write("\n");
    }
    var wlog = exports.wlog;

    exports.open = function (name = 'x.scad') {
        writer = fs.createWriteStream(name);
    };

    exports.close = function () {
        writer.close();
    };

    exports.header = function (coords, sc) {
        wlog("$vpr = [355, 45, 0];");
        wlog("$fn = 25;");
        wlog("$vpt = [0,0,0];");

        wlog("function map_3D(c) = [cos(c[0])*sin(c[1]), sin(c[0])*sin(c[1]), cos(c[1])];");

        wlog("sc =", sc,";");
        wlog("coords =[");
        coords.forEach(function (p, i) {
            if (i > 0) {
                wlog(",", srad2deg(p));
            } else {
                wlog(srad2deg(p));
            }
        });
        wlog("];");

        wlog("module vertex(_v, c, half=false) {");
        wlog("    p = coords[_v];");
        wlog("    v = map_3D(p) * sc;");
        wlog("    difference(){");
        wlog("        color(c) translate(v) sphere(0.5);");
        wlog("        if (half) {");
        wlog("            la1 = p[0];");
        wlog("            ph1 = 90 - p[1];");
        wlog("            translate([0, 0, 0]) rotate([0, 0, la1]) rotate([0, -ph1, 0])");
        wlog("                translate([sc+0.5, 0]) rotate([90,0,90]) color([0,0,0])");
        wlog("            translate([-0.5,-0.5,-1]) cube([1,1,0.4]);");
        wlog("        }");
        wlog("    }");
        wlog("}");

        wlog("module vtxt(_p1, num) {");
        wlog("    p1 = coords[_p1];");
        wlog("    la1 = p1[0];");
        wlog("    ph1 = 90 - p1[1];");
        wlog("    translate([0, 0, 0]) rotate([0, 0, la1]) rotate([0, -ph1, 0])");
        wlog("        translate([sc+0.5, 0]) rotate([90,0,90]) color([0,0,0])");
        wlog("            linear_extrude(0.01)");
        wlog("    text(str(num), size=0.5, halign=\"center\", valign=\"center\");");
        wlog("}");

        wlog("module edge(_v,_w) {");
        wlog("    v = map_3D(coords[_v]) * sc;");
        wlog("    w = map_3D(coords[_w]) * sc - v;");
        wlog("    translate(v)");
        wlog("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
        wlog("    cylinder(norm(w),0.1,0.1);");
        wlog("}");
    };

    exports.header2 = function () {
        wlog("module edge2(_p1,_p2,_e) {");
        wlog("    p1 = coords[_p1];");
        wlog("    p2 = coords[_p2];");
        wlog("    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course");
        wlog("    la1 = p1[0];");
        wlog("    la2 = p2[0];");
        wlog("    l12 = la2 - la1;");
        wlog("    ph1 = 90 - p1[1];");
        wlog("    ph2 = 90 - p2[1];");
        wlog("    al1 = atan2(cos(ph2)*sin(l12), cos(ph1)*sin(ph2)-sin(ph1)*cos(ph2)*cos(l12));");
        wlog("    // delta sigma_12");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae");
        wlog("    s12 = acos(sin(ph1)*sin(ph2)+cos(ph1)*cos(ph2)*cos(l12));");
        wlog("    translate([0, 0, 0]) rotate([0, 0, la1]) rotate([0, -ph1, 0])");
        wlog("      rotate([90 - al1, 0, 0])");
        wlog("        rotate_extrude(angle=s12, convexity=10, $fn=100)");
        wlog("            translate([sc, 0]) circle(0.1, $fn=25);");
        wlog("}");

        wlog("module sp_tria2(r, tang, pang, thi, ord, ord2) {");
        wlog("    ang= [ for (i = [0:ord]) i*(tang/ord) ];");
        wlog("    rang=[ for (i = [ord:-1:0]) i*(tang/ord) ];");
        wlog("    coords=concat(");
        wlog("        [ for (th=ang)  [(r-thi/2)*sin(th), (r-thi/2)*cos(th)]],");
        wlog("        [ for (th=rang) [(r+thi/2)*sin(th), (r+thi/2)*cos(th)] ]");
        wlog("    );");
        wlog("    rotate_extrude(angle=pang, $fn=ord2) polygon(coords);");
        wlog("}");

        wlog("module sp_tria(_p1, _p2, _p3) {");
        wlog("    p1 = coords[_p1];");
        wlog("    p2 = coords[_p2];");
        wlog("    p3 = coords[_p3];");
        wlog("    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course");
        wlog("    la1 = p1[0];");
        wlog("    la2 = p2[0];");
        wlog("    la3 = p3[0];");
        wlog("    l12 = la2 - la1;");
        wlog("    l13 = la3 - la1;");
        wlog("    l32 = la2 - la3;");
        wlog("    l23 = la3 - la2;");
        wlog("    l31 = la1 - la3;");
        wlog("    ph1 = 90 - p1[1];");
        wlog("    ph2 = 90 - p2[1];");
        wlog("    ph3 = 90 - p3[1];");
        wlog("    al12 = atan2(cos(ph2)*sin(l12), cos(ph1)*sin(ph2)-sin(ph1)*cos(ph2)*cos(l12));");
        wlog("    al13 = atan2(cos(ph3)*sin(l13), cos(ph1)*sin(ph3)-sin(ph1)*cos(ph3)*cos(l13));");
        wlog("    al31 = atan2(cos(ph1)*sin(l31), cos(ph3)*sin(ph1)-sin(ph3)*cos(ph1)*cos(l31));");
        wlog("    al32 = atan2(cos(ph2)*sin(l32), cos(ph3)*sin(ph2)-sin(ph3)*cos(ph2)*cos(l32));");
        wlog("    // delta sigma_xy");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae");
        wlog("    s12 = acos(sin(ph1)*sin(ph2)+cos(ph1)*cos(ph2)*cos(l12));");
        wlog("    s23 = acos(sin(ph2)*sin(ph3)+cos(ph2)*cos(ph3)*cos(l23));");
        wlog("    s13 = acos(sin(ph1)*sin(ph3)+cos(ph1)*cos(ph3)*cos(l13));");

        wlog("    if (s13 < s12) {");
        wlog("        if (s12 >= s23) {");
        wlog("            sp_tria(_p1, _p3, _p2);");
        wlog("        } else {");
        wlog("            sp_tria(_p2, _p1, _p3);");
        wlog("        }");
        wlog("    } else {");
        wlog("        if (s13 < s23) {");
        wlog("            sp_tria(_p2, _p1, _p3);");
        wlog("        }");
        wlog("    }");

        wlog("    function m180(ang) =  (ang < -180) ? 360 + ang : ((ang > 180) ? ang - 360 :ang);");

        wlog("    if ((s13 >= s12) && (s13 >= s23)) {");
        wlog("        v1 = map_3D(p1);");
        wlog("        v2 = map_3D(p2);");
        wlog("        v3 = map_3D(p3);");

        wlog("        ms = v1+v2+v3;");
        wlog("        ms2 = ms / sqrt(ms*ms);");
        wlog("        mi = min(v1*ms2, v2*ms2, v3*ms2)-0.1;");

        wlog("        sv1 = v1 * sc;");
        wlog("        sv2 = v2 * sc;");
        wlog("        sv3 = v3 * sc;");
        wlog("        s1 = sv1 / mi;");
        wlog("        s2 = sv2 / mi;");
        wlog("        s3 = sv3 / mi;");

        wlog("        intersection() {");
        wlog("            union() {");
        wlog("                color([0.5,0.5,0.5]) translate([0,0,0])");
        wlog("                    rotate([0,0,la1-180])");
        wlog("                    rotate([0,ph1-90,0])");
        wlog("                    rotate([0,0,-al13])");
        wlog("                    sp_tria2(sc, s12, m180(al13-al12), 0.1, 40, 40);");

        wlog("                color([0.5,0.5,0.5]) translate([0,0,0])");
        wlog("                    rotate([0,0,la3-180])");
        wlog("                    rotate([0,ph3-90,0])");
        wlog("                    rotate([0,0,-al31])");
        wlog("                    sp_tria2(sc, s23, m180(al31-al32), 0.1, 40, 40);");
        wlog("            }");
    
        wlog("            hull() {");
        wlog("                translate(sv1) cube(0.01);");
        wlog("                translate(sv2) cube(0.01);");
        wlog("                translate(sv3) cube(0.01);");
        wlog("                translate(s1) cube(0.01);");
        wlog("                translate(s2) cube(0.01);");
        wlog("                translate(s3) cube(0.01);");
        wlog("            }");
        wlog("        }");

        wlog("    }");
        wlog("}");
    };
}

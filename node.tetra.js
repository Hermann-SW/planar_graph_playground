// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "tutte.js"
#include "undirected_graph.js"

var coords;
var coords2;
var coords3;

var fs = require("fs");

var writer;
var white = (process.argv.length > 3);
var sele = (process.argv.length > 4) ? parseInt(process.argv[4]) : -1;

var V = 0;
var i;

function out(x) {
    return (typeof(x) === 'object') ? JSON.stringify(x) : x;
}

function wlog(...s) {
    writer.write(out(s[0]));
    for(var i=1; i<s.length; ++i) {
        writer.write(" " + out(s[i]));
    }
    writer.write("\n");
}

function rad2deg(r) {
    return r / Math.PI * 180;
}

function srad2deg(p) {
    return [rad2deg(p[0]), rad2deg(p[1])];
}

function tetra(G, M, sc = 1, visited) {
    var vec = [0,0,1];
    wlog("$vpr = [",-rad2deg(Math.acos(vec[2])),",0,",
                    -rad2deg(Math.atan2(vec[0], vec[1])),"];");
    wlog("$fn = 25;");
    wlog("$vpt = [0,0,0];");

    wlog("function map_3D(c) = [cos(c[0])*sin(c[1]), sin(c[0])*sin(c[1]), cos(c[1])];");

    wlog("sc =", sc,";");
    wlog("coords =[");
    wlog(srad2deg(coords[0]));
    forall_vertices_after(G, 0, function(v) {
        wlog(",", srad2deg(coords[v]));
    });
    wlog("];");

    wlog("module edge(_v,_w) {");
    wlog("    v = map_3D(coords[_v]) * sc;");
    wlog("    w = map_3D(coords[_w]) * sc - v;");
    wlog("    translate(v)");
    wlog("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
    wlog("    cylinder(norm(w),0.1,0.1);");
    wlog("}");
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
    wlog("    al0 = atan2(sin(al1)*cos(ph1), sqrt(cos(al1)*cos(al1)+sin(al1)*sin(al1)*sin(ph1)*sin(ph1)));");
    wlog("    s01 = atan2(tan(ph1), cos(al1));");
    wlog("    l01 = atan2(sin(al0)*sin(s01), cos(s01));");
    wlog("    la0 = la1 - l01;");
    wlog("    // delta sigma_12");
    wlog("    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae");
    wlog("    s12 = acos(sin(ph1)*sin(ph2)+cos(ph1)*cos(ph2)*cos(l12));");
    wlog("    translate([0, 0, 0]) rotate([0, 0, la1]) rotate([0, -ph1, 0])");
    wlog("      rotate([90 - al1, 0, 0])");
    wlog("        rotate_extrude(angle=s12, convexity=10, $fn=100)");
    wlog("            translate([sc, 0]) circle(0.1, $fn=25);");
    wlog("}");
    wlog("module vertex(_v, c) {");
    wlog("    v = map_3D(coords[_v]) * sc;");
    wlog("    color(c) translate(v) sphere(0.5);");
    wlog("}");
    wlog("module vtxt(_p1) {");
    wlog("    p1 = coords[_p1];");
    wlog("    la1 = p1[0];");
    wlog("    ph1 = 90 - p1[1];");
    wlog("    translate([0, 0, 0]) rotate([0, 0, la1]) rotate([0, -ph1, 0])");
    wlog("        translate([sc+0.5, 0]) rotate([90,0,90]) color([0,0,0])");
    wlog("            linear_extrude(0.01)");
    wlog("    text(str(_p1), size=0.5, halign=\"center\", valign=\"center\");");
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

    forall_edges(G, function(e) {
        if (evisited[e]) {
            if (e===sele) { wlog("color([1,0,0])"); } else { wlog("color([0,0,1])"); }
            wlog("edge2(", source(G, e), ",", target(G, e), ",", e, ");");
        }
    });
    console.log("M.length:", M.length);

    var Ms = [M[0], M[1], M[2], M[3]];
    forall_vertices(G, function(v) {
        wlog( "vertex(", v, ",", Ms.includes(v) ? [1,0,0] : [0,1,0], ");");
    });

    pentagons(G).forEach(function(face) {
        var doit = face.every(function(v) {
            return visited[v];
        });

        if (doit) {
            wlog("echo(",face,");");
            face.forEach(function(v) {
                wlog("vtxt(", v, ");");
            });

            wlog("sp_tria(", face[0], ",", face[1], ",", face[2], ");");
            wlog("sp_tria(", face[0], ",", face[2], ",", face[3], ");");
            wlog("sp_tria(", face[0], ",", face[3], ",", face[4], ");");
        }
    });

    if (white) {
        var alpha = parseInt((process.argv[3] + ".100").substring(6)) / 100;
        wlog("color([1,1,1,", alpha, "]) translate([0,0,0]) sphere(sc, $fn=180);");
    }
}

function ok(a,b,c,d,e,f) {
    var m = Math.max(a, b, c, d, e, f);
    return (((m - a) <= 1) && ((m - b) <= 1) && ((m - c) <= 1) &&
            ((m - d) <= 1) && ((m - e) <= 1) && ((m - f) <= 1));
}

assert.assert(process.argv.length > 2);

var adj = parse2file(process.argv[2]);

var G = from_adjacency_list(adj);

assert.assert(is_embedding(G));

var pent = pentagons(G);
console.log(pent.length + " pentagons for graph");
console.log(n_faces_planar(G) - pent.length + " non-pentagons for graph");

var dist;
var next;
[dist, next] = floyd_warshall_path(G);

var max = 0;
var M = [0,0,0,0];
var i;
var j;

forall_vertices(G, function(a) {
    forall_vertices_after(G, a, function(b) {
        forall_vertices_after(G, b, function(c) {
            forall_vertices_after(G, c, function(d) {
                if (dist[a][b] + dist[a][c] + dist[a][d] +
                    dist[b][c] + dist[b][d] + dist[c][d] > max) {
                    if (ok(dist[a][b], dist[a][c], dist[a][d],
                           dist[b][c], dist[b][d], dist[c][d])) {

                        max = dist[a][b] + dist[a][c] + dist[a][d] +
                              dist[b][c] + dist[b][d] + dist[c][d];
                        M = [a, b, c, d];
                    }
                }
            });
        });
    });
});

console.log("vertices:", String(M));
console.log("max:", max);
console.log("dists:", dist[M[0]][M[1]], dist[M[0]][M[2]], dist[M[0]][M[3]],
                      dist[M[1]][M[2]], dist[M[1]][M[3]], dist[M[2]][M[3]]);

for(i=0; i<4; i=i+1) {
    for(j=i+1; j<4; j=j+1) {
        if (new Set(fw_path(G, next, M[i], M[j]).concat(fw_path(G, next, M[j], M[i]))).size !== dist[M[i]][M[j]]) {
            console.log("edges2:", fw_path(G, next, M[i], M[j]), fw_path(G, next, M[j], M[i]));
            process.exit(1);
        }
    }
}

function mark(G, visited, evisited, v, w) {
    var e;
    var o;
    var dp = (coords[w][0] - coords[v][0]) / (dist[v][w]);
    var dt = (coords[w][1] - coords[v][1]) / (dist[v][w]);
    e = next[v][w];
    while (v != w) {
        evisited[e] = true;
        o = v;
        v = opposite(G, v, e);
        e = next[v][w];
        assert.assert(!visited[v]);
        visited[v] = true;
        if (v != w) {
            coords[v][0] = coords[o][0]+dp;
            coords[v][1] = coords[o][1]+dt;
            M.push(v);
        }
    }
}

function mark2(G, visited, evisited, v, w) {
    var e;
    var dir = v < w;
    var o;
    var dp = 0;
    var dt = -2 * coords[w][1] / (dist[v][w]);
    if (coords[w][1] > Math.PI/2) {
        dt = 2 * (Math.PI - coords[w][1]) / dist[v][w];
    }
    e = next[v][w];
    while (v != w) {
        evisited[e] = true;
        o = v;
        v = opposite(G, v, e);
        e = next[v][w];
        if (v != w) {
            coords[v][0] = coords[o][0];
            coords[v][1] = coords[o][1] + dt;
            if (coords[v][1] < 0 || coords[v][1] > Math.PI) {
                break;
            }
            if (dir && (coords[v][1] === 0 || coords[v][1] === Math.PI)) {
                break;
            }
            M.push(v);
            assert.assert(!visited[v]);
            visited[v] = true;
        }
    }
}

function srch(G, visited, evisited, v) {
    if (!visited[v]) {
        visited[v] = true;
        forall_incident_edges(G, v, function(e) {
            evisited[e] = true;
            srch(G, visited, evisited, opposite(G, v, e));
        });
    }
}

function esrch(G, visited, evisited, v, w) {
    do {
        var e = next[v][w];
        var f = next_incident_edge(G, v, e);
        if (!evisited[f]) {
            var x = opposite(G, v, f);
            evisited[f] = true;
            if (!visited[x]) {
                srch(G, visited, evisited, x);
//                break;
            }
        }
        v = opposite(G, v, e);
    } while (v !== w);
}

coords = filled_array(n_vertices(G), 2, -1);

coords[M[0]] = [3*Math.PI/2, Math.acos(+Math.sqrt(1/3))];
coords[M[1]] = [  Math.PI/2, Math.acos(+Math.sqrt(1/3))];

var visited = filled_array(n_vertices(G), 1, false);
var evisited = filled_array(n_edges(G), 1, false);

var e;
var orient;
e = next_incident_edge(G, M[3], next[M[3]][M[2]]);
while ((e !== next[M[3]][M[1]]) && (e !== next[M[3]][M[0]])) {
    e = next_incident_edge(G, M[3], e);
}
orient = (e === next[M[3]][M[1]]);

console.log(orient);
assert.assert(orient === false); // for now

    coords[M[3]] = [    Math.PI, Math.acos(-Math.sqrt(1/3))];
    coords[M[2]] = [          0, Math.acos(-Math.sqrt(1/3))];

    mark2(G, visited, evisited, M[2], M[3]);
    mark2(G, visited, evisited, M[3], M[2]);

    mark(G, visited, evisited, M[2], M[1]);
    mark(G, visited, evisited, M[1], M[3]);

    mark(G, visited, evisited, M[3], M[0]);
    mark2(G, visited, evisited, M[0], M[1]);
    mark2(G, visited, evisited, M[1], M[0]);

if (true){
    esrch(G, visited, evisited, M[1], M[3]);
    esrch(G, visited, evisited, M[3], M[0]);
    esrch(G, visited, evisited, M[0], M[1]);

    esrch(G, visited, evisited, M[3], M[1]);
    esrch(G, visited, evisited, M[1], M[2]);
    esrch(G, visited, evisited, M[2], M[3]);
}
    assert.assert(visited[M[2]] === false);
    coords[M[2]] = [2*Math.PI, Math.acos(-Math.sqrt(1/3))];


    mark(G, visited, evisited, M[0], M[2]);

if(true)
forall_vertices(G, function(v) {
    if (!visited[v]) {
        coords[v][0] = 4 * Math.PI;
        coords[v][1] = Math.PI / 2;
        M.push(v);
    }
});

    coords2 = tutte.convex_face_coordinates(G, M, coords);

if (true)
forall_vertices(G, function(v) {
    if (coords[v][0] < Math.PI) {
        coords[v][0] = coords[v][0] + 2 * Math.PI;
    }
});
if (false) {
    esrch(G, visited, evisited, M[2], M[0]);
    esrch(G, visited, evisited, M[0], M[3]);
    esrch(G, visited, evisited, M[3], M[2]);

    esrch(G, visited, evisited, M[0], M[2]);
    esrch(G, visited, evisited, M[2], M[1]);
    esrch(G, visited, evisited, M[1], M[0]);
}

if(false)
forall_vertices(G, function(v) {
    if (!visited[v]) {
        coords[v][0] = 4 * Math.PI;
        coords[v][1] = Math.PI / 2;
        M.push(v);
    }
});
    coords3 = tutte.convex_face_coordinates(G, M, coords);




console.log("vertices:", String(M));

forall_vertices(G, function(v) {
        coords[v][0] = coords2[0][v];
        coords[v][1] = coords2[1][v];
});

V = M[0];

writer = fs.createWriteStream('x.scad')

tetra(G, M, Math.sqrt(n_vertices(G)), visited);

writer.close();


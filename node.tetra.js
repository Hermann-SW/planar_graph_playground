// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "tutte.js"
#include "undirected_graph.js"

var coords;
var coords2;

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

function tetra(G, M, sc = 1, edges, visited) {
    var vec = [0,0,1];
    wlog("$vpr = [",-rad2deg(Math.acos(vec[2])),",0,",
                    -rad2deg(Math.atan2(vec[0], vec[1])),"];");
    wlog("$fn = 25;");
    wlog("$vpt = [0,0,0];");

    wlog("function scale_3D(v, f) = [f * v[0], f * v[1], f * v[2]];");
    wlog("function map_3D(c) = [cos(c[0])*sin(c[1]), sin(c[0])*sin(c[1]), cos(c[1])];");

    wlog("sc =", sc,";");
    wlog("coords =[");
    wlog(srad2deg(coords[0]));
    forall_vertices_after(G, 0, function(v) {
        wlog(",", srad2deg(coords[v]));
    });
    wlog("];");

    wlog("module edge(_v,_w) {");
    wlog("    v = scale_3D(map_3D(coords[_v]), sc);");
    wlog("    w = scale_3D(map_3D(coords[_w]), sc) - v;");
    wlog("    translate(v)");
    wlog("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
    wlog("    cylinder(norm(w),0.1,0.1);");
    wlog("}");
    wlog("module edge2(_p1,_p2) {");
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
    wlog("    v = scale_3D(map_3D(coords[_v]), sc);");
    wlog("    color(c) translate(v) sphere(0.5);");
    wlog("}");

    forall_edges(G, function(e) {
        if (visited[source(G, e)] && visited[target(G, e)]) {
            if (e===sele) { wlog("color([1,0,0])"); } else { wlog("color([0,1,0])"); }
            wlog("edge(", source(G, e), ",", target(G, e), ");");
            if (e===sele) { wlog("color([1,0,0])"); } else { wlog("color([0,0,1])"); }
            wlog("edge2(", source(G, e), ",", target(G, e), ");");

        }
    });
    console.log("M.length:", M.length);

    M.forEach(function(v) {
        wlog( "vertex(", v, ",", (sele !== -1 && v===source(G, sele)) ? [1,0,0] : [0,1,0], ");");
    });

    if (white) {
        wlog("color([1,1,1]) translate([0,0,0]) sphere(", 0.8*sc, ");");
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
var edges = [].concat(fw_path(G, next, M[0], M[1]),
                      fw_path(G, next, M[0], M[2]),
//                      fw_path(G, next, M[0], M[3]),
//                      fw_path(G, next, M[1], M[2]),
                      fw_path(G, next, M[1], M[3]),
                      fw_path(G, next, M[2], M[3]));
console.log("edges:", String(edges));

for(i=0; i<4; i=i+1) {
    for(j=i+1; j<4; j=j+1) {
        if (new Set(fw_path(G, next, M[i], M[j]).concat(fw_path(G, next, M[j], M[i]))).size !== dist[M[i]][M[j]]) {
            console.log("edges2:", fw_path(G, next, M[i], M[j]), fw_path(G, next, M[j], M[i]));
            process.exit(1);
        }
    }
}

function mark(G, visited, v, w) {
    var e;
    var o;
    var dp = (coords[w][0] - coords[v][0]) / (dist[v][w]);
    var dt = (coords[w][1] - coords[v][1]) / (dist[v][w]);
    e = next[v][w];
    while (v != w) {
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

function mark2(G, visited, v, w) {
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

function srch(G, visited, v) {
    if (!visited[v]) {
        visited[v] = true;
        forall_incident_edges(G, v, function(e) {
            srch(G, visited, opposite(G, v, e));
        });
    }
}

var deg1 = Math.PI / 180;

coords = filled_array(n_vertices(G), 2, -1);
coords[M[0]] = [3*Math.PI/2, Math.acos(+Math.sqrt(1/3))];
coords[M[1]] = [  Math.PI/2, Math.acos(+Math.sqrt(1/3))];
coords[M[2]] = [    Math.PI, Math.acos(-Math.sqrt(1/3))];
coords[M[3]] = [          0, Math.acos(-Math.sqrt(1/3))];

var visited = filled_array(n_vertices(G), 1, false);

mark2(G, visited, M[0], M[1]);
 mark2(G, visited, M[1], M[0]);
 mark(G, visited, M[1], M[3]);
 mark2(G, visited, M[3], M[2]);
mark2(G, visited, M[2], M[3]);
mark(G, visited, M[2], M[0]);
visited[M[1]]=true;
visited[M[2]]=true;

var e;
e = next_incident_edge(G, M[0], next[M[0]][M[1]]);
if (e == next[M[0]][M[2]]) {
    e = next_incident_edge(G, M[0], e);
}
srch(G, visited, opposite(G, M[0], e));

forall_vertices(G, function(v) {
    if (!visited[v]) {
        coords[v][0] = 0.75 * Math.PI;
        coords[v][1] = Math.PI / 2;
        M.push(v);
/*
        while (degree(G, v) > 0) {
            var e = first_incident_edge(G, v);
            remove_edge1(G, opposite(G, v, e), e);
            remove_edge1(G, v, e);
        }
*/
    }
});

console.log("vertices:", String(M));

if (true) {
forall_vertices(G, function(v) {
    if (coords[v][0] < Math.PI) {
        coords[v][0] = coords[v][0] + 2 * Math.PI;
    }
});
}

coords2 = tutte.convex_face_coordinates(G, M, coords);

forall_vertices(G, function(v) {
    coords[v][0] = coords2[0][v];
    coords[v][1] = coords2[1][v];
});

V = M[0];

writer = fs.createWriteStream('x.scad')

tetra(G, M, Math.sqrt(n_vertices(G)), edges, visited);

writer.close();


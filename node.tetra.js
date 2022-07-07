// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "undirected_graph.js"

var coords;

var fs = require("fs");

var writer;
var white = (process.argv.length > 3);

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

function scale_3D(v, f) {
    return [f * v[0], f * v[1], f * v[2]];
}

function map_3D(p, t) {
    return [Math.cos(p) * Math.sin(t), Math.sin(p) * Math.sin(t), Math.cos(t)];
}

function pdist(p1, p2) {
    var d = p1 - p2;
    if (d < -Math.PI) {
        return d + 2*Math.PI;
    } else if (d > Math.PI) {
        return d - 2*Math.PI;
    }
    return d;
}

function tetra(G, M, sc = 1) {
    var vec = [0,0,1];

    wlog("$vpr = [",-rad2deg(Math.acos(vec[2])),",0,",
                    -rad2deg(Math.atan2(vec[0], vec[1])),"];");
    wlog("$fn = 25;");
    wlog("$vpt = [0,0,0];");
    wlog("module edge(v,w) {");
    wlog("    w = w - v;");
    wlog("    translate(v)");
    wlog("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
    wlog("    cylinder(norm(w),0.1,0.1);");
    wlog("}");
    wlog("module vertex(v, c) { color(c) translate(v) sphere(0.5); }");
/*
    forall_edges(G, function (e) {
        wlog("edge(", scale_3D(coords[source(G, e)], sc), ",", scale_3D(coords[target(G, e)], sc), ");");
    });

    forall_vertices(G, function (v) {
        wlog("vertex(", scale_3D(coords[v][0], coords[v][1], sc), ",", (v==V) ? [1,0,0] : [0,1,0], ");");
    });
*/
    console.log("M.length:", M.length);

    M.forEach(function(v) {
        wlog( "vertex(", scale_3D(map_3D(coords[v][0], coords[v][1]), sc), ",", (v===V) ? [1,0,0] : [0,1,0], ");");
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
                      fw_path(G, next, M[0], M[3]),
                      fw_path(G, next, M[1], M[2]),
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
    var dp = pdist(coords[w][0], coords[v][0]) / (dist[v][w]);
    var dt = (coords[w][1] - coords[v][1]) / (dist[v][w]);
    e = next[v][w];
    while (v != w) {
        o = v;
        v = opposite(G, v, e);
        e = next[v][w];
        assert.assert(!visited[v]);
        if (v===6) {
            console.log(v, w);
        }
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

coords = filled_array(n_vertices(G), 2, -1);
coords[M[0]] = [3*Math.PI/2, Math.acos(+Math.sqrt(1/3))];
coords[M[1]] = [  Math.PI/2, Math.acos(+Math.sqrt(1/3))];
coords[M[2]] = [    Math.PI, Math.acos(-Math.sqrt(1/3))];
coords[M[3]] = [          0, Math.acos(-Math.sqrt(1/3))];

var visited = filled_array(n_vertices(G), 1, false);

mark(G, visited, M[0], M[2]);
mark(G, visited, M[2], M[1]);
mark(G, visited, M[1], M[3]);
mark(G, visited, M[3], M[0]);

mark2(G, visited, M[0], M[1]);
mark2(G, visited, M[1], M[0]);
mark2(G, visited, M[3], M[2]);
mark2(G, visited, M[2], M[3]);

var e;
e = next_incident_edge(G, M[0], next[M[0]][M[1]]);
if (e == next[M[0]][M[3]]) {
    e = next_incident_edge(G, M[0], e);
}
srch(G, visited, opposite(G, M[0], e));

console.log("vertices:", String(M));



// V = M[0];

writer = fs.createWriteStream('x.scad')

tetra(G, M, Math.sqrt(n_vertices(G)));

writer.close();


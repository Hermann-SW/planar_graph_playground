// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "tutte.js"
#include "undirected_graph.js"

#include "scad.js"

var coords;
var coords2;
var coords3;

var white = (process.argv.length > 3);
var sele = (process.argv.length > 4) ? parseInt(process.argv[4]) : -1;

var V = 0;
var i;

function tetra(G, M, sc = 1, visited) {
    scad.open('x.scad');
    scad.header(coords, sc);
    scad.header2();

    forall_edges(G, function(e) {
        if (evisited[e]) {
            if (e===sele) { scad.wlog("color([1,0,0])"); } else { scad.wlog("color([0,0,1])"); }
            scad.wlog("edge2(", source(G, e), ",", target(G, e), ",", e, ");");
        }
    });
    console.log("M.length:", M.length);

    var Ms = [M[0], M[1], M[2], M[3]];
    forall_vertices(G, function(v) {
        scad.wlog( "vertex(", v, ",", Ms.includes(v) ? [1,0,0] : [0,1,0], ");");
    });

    pentagons(G).forEach(function(face) {
        var doit = face.every(function(v) {
            return visited[v];
        });

        if (doit) {
            scad.wlog("echo(",face,");");
            face.forEach(function(v) {
                scad.wlog("vtxt(", v, ");");
            });

            scad.wlog("sp_tria(", face[0], ",", face[1], ",", face[2], ");");
            scad.wlog("sp_tria(", face[0], ",", face[2], ",", face[3], ");");
            scad.wlog("sp_tria(", face[0], ",", face[3], ",", face[4], ");");
        }
    });

    if (white) {
        var alpha = parseInt((process.argv[3] + ".100").substring(6)) / 100;
        scad.wlog("color([1,1,1,", alpha, "]) translate([0,0,0]) sphere(sc, $fn=180);");
    }

    scad.close();
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


tetra(G, M, Math.sqrt(n_vertices(G)), visited);

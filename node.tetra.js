// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "undirected_graph.js"

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
//                      fw_path(G, next, M[0], M[2]),
                      fw_path(G, next, M[0], M[3]),
                      fw_path(G, next, M[1], M[2]),
//                      fw_path(G, next, M[1], M[3]),
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
    e = next[v][w];
    while (v != w) {
        v = opposite(G, v, e);
        e = next[v][w];
        assert.assert(!visited[v]);
        visited[v] = true;
    }
}

function srch(G, visited, v) {
    if (!visited[v]) {
        visited[v] = true;
        M.push(v);
        forall_incident_edges(G, v, function(e) {
            srch(G, visited, opposite(G, v, e));
        });
    }
}

var visited = filled_array(n_vertices(G), 1, false);

mark(G, visited, M[0], M[1]);
mark(G, visited, M[1], M[2]);
mark(G, visited, M[2], M[3]);
mark(G, visited, M[3], M[0]);

var e;
e = next_incident_edge(G, M[0], next[M[0]][M[1]]);
if (e == next[M[0]][M[3]]) {
    e = next_incident_edge(G, M[0], e);
}
srch(G, visited, opposite(G, M[0], e));

console.log("vertices:", String(M));

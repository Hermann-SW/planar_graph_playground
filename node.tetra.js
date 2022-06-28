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

var dist = floyd_warshall(G);

var max = 0;
var M = [0,0,0,0];

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

console.log("vertices:", M);
console.log("max:", max);
console.log("dists:", dist[M[0]][M[1]], dist[M[0]][M[2]], dist[M[0]][M[3]],
                      dist[M[1]][M[2]], dist[M[1]][M[3]], dist[M[2]][M[3]]);

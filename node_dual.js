#include "assert.js"
#include "fullerenes.js"
#include "undirected_graph.js"
#include "gauss-jordan.js"

var lookup = [];
var K4 = [[1, 3, 2], [2, 3, 0], [0, 3, 1], [0, 1, 2]];
var K5me = [[1, 2, 3, 4], [2, 0, 4], [4, 3, 0, 1], [4, 0, 2], [1, 0, 3, 2]];
var D;
var G = from_adjacency_list(K5me);

assert.assert(is_embedding(G));
console.log("is_embedding(K5-e) verified, has " + n_faces_planar(G) + " faces");
print_graph(G, "K5-e: ");

D = dual_graph(G);
assert.assert(is_embedding(D));
console.log("is_embedding(dual_graph(K5-e)) verified, has " + n_faces_planar(D) + " faces");
print_graph(D, "dual_graph(K5-e): ");

assert.assert(is_identical_graph(G, dual_graph(D)));
console.log("is_identical(K5-e, dual_graph(dual_graph(K5-e))) verified");


#include "assert.js"
#include "fullerenes.js"
#include "undirected_graph.js"
#include "gauss-jordan.js"

var G = from_adjacency_list(F[0]);
assert.assert(is_embedding(G));

console.log("is_embedding(C20) verified, has " + n_faces_planar(G) + " faces");
print_graph(G, "C20: ");

#include "assert.js"
#include "fullerenes.js"
#include "undirected_graph.js"
#include "gauss-jordan.js"

var lookup=[];
var G = from_adjacency_list(F[0]);
assert.assert(is_embedding(G));

console.log(G.E);

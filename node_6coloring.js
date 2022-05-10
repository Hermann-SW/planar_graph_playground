// Copyright: https://mit-license.org/

#include "assert.js"
#include "gauss-jordan.js"
#include "undirected_graph.js"

assert.assert(process.argv.length > 2);
var dual = (process.argv.length > 3);

var adj = JSON.parse(require('fs').readFileSync(process.argv[2], 'utf8'));

var G = from_adjacency_list(adj);

assert.assert(is_embedding(G));

var pent = pentagons(G);
console.log(pent.length + " pentagons for graph");

var D = dual_graph(G);
console.log(pentagons(D).length + " pentagons for dual graph");

if (n_vertices(G) <= 100) {
    print_graph(dual ? D : G, dual ? "dual graph: " : "graph: ")
}

console.log("6-coloring of", dual ? "dual" : "", "graph")
if (dual) {
    G = D;
}

var col = six_coloring(G);
var str = ""
forall_vertices(G, function (v) {
        str += col[v];
});
console.log(str);

// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "undirected_graph.js"

assert.assert(process.argv.length > 2);

var adj = parse2file(process.argv[2]);

var G = from_adjacency_list(adj);

assert.assert(is_embedding(G));

if (process.argv.length > 3) {
    var D = dual_graph(G);

    assert.assert(is_embedding(D));

    G = D;
}

console.log("LEDA.GRAPH\nint\nint");
console.log(n_vertices(G));
forall_vertices(G, function(v) {
    console.log(0);
});
console.log(n_edges(G));
forall_edges(G, function(e) {
    console.log(source(G, e)+1, target(G, e)+1, 0);
});

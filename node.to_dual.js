#include "assert.js"
#include "util.js"
#include "fullerenes.js"
#include "undirected_graph.js"

var sel = (
    process.argv.length > 2
    ? process.argv[2]
    : "graphs/10.a"
);

var L;
var G;
var D;

L = parse2file(sel);
G = from_adjacency_list(L);

assert.assert(is_embedding(G));

D = dual_graph(G);

console.log("[");
var first = true;
forall_vertices(D, function(v) {
    var a = [];
    forall_incident_edges(D, v, function(e) {
        a.push(opposite(D, v, e));
    });
    if (!first) {
        console.log(",", a);
    } else {
        first = false;
        console.log(a);
    }
});
console.log("]");

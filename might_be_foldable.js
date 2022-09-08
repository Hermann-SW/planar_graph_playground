#include "assert.js"
#include "util.js"
#include "undirected_graph.js"

var D;
assert.assert(process.argv.length > 2);
var sel = process.argv[2];

forall_graphs(sel, -1, function (G, i) {

    assert.assert(is_embedding(G));
    D = dual_graph(G);
    assert.assert(is_embedding(D));
    assert.assert(is_embedding(dual_graph(D)));

    var good = true;
    forall_edges(D, function(e) {
        var v = source(D, e);
        // var w = target(D, e);
        // if (degree(D, v) === degree(D, w))
        {
            var f = next_incident_edge(D, v, e);
            var g = prev_incident_edge(D, v, e);
            if (degree(D, opposite(D, v, f)) !== degree(D, opposite(D, v, g))) {
                good = false;
            }
        }
    });

    if (good) {
        console.log(i, "might be foldable");
    }
});

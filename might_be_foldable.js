#include "assert.js"
#include "util.js"
#include "undirected_graph.js"

function forall_graphs(name, f) {
    var F = require('fs').readFileSync(name, 'utf8').split("\n");

    var l = 1;
    var i = 0;
    while (l < F.length-1) {
        var L = [];
        while (F[l] !== "0") {
            var v = F[l].trim().replace(/ +/g, " ").split(" ")
            L.push([Number(v[4])-1, Number(v[5])-1, Number(v[6])-1]);
            l = l + 1;
        }
        i = i + 1;
        var G = from_adjacency_list(L);
        f(G, i);
        l = l + 1;
    }
}

var D;
assert.assert(process.argv.length > 2);
var sel = process.argv[2];

forall_graphs(sel, function (G, i) {

    assert.assert(is_embedding(G));
    D = dual_graph(G);
    assert.assert(is_embedding(D));
    assert.assert(is_embedding(dual_graph(D)));

    var good = true;
    forall_edges(D, function(e) {
        var v = source(D, e);
        var w = target(D, e);
        if (degree(D, v) === degree(D, w))
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

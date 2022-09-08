#include "assert.js"
#include "util.js"
#include "undirected_graph.js"

function forall_graphs(name, fil, f) {
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
        if ((fil === -1) || (fil === i)) {
            var G = from_adjacency_list(L);
            f(G, i);
        }
        l = l + 1;
    }
}

var D;
assert.assert(process.argv.length > 2);
var sel = process.argv[2];
var dual = process.argv[process.argv.length-1] === "-dual";
var fil = (process.argv.length > 3 + dual) ? Number(process.argv[3]) : -1;

var M = [-1, -1, -1, -1, -1, -1, -1];

forall_graphs(sel, fil, function (G, i) {

    assert.assert(is_embedding(G));
    D = dual_graph(G);
    assert.assert(is_embedding(D));
    assert.assert(is_embedding(dual_graph(D)));

    if (dual) {
        G = D;
    }

    var col = six_coloring(G);
    var ma = -1;
    col.forEach(function (c) {
        if (c > ma)  { ma = c; }
    });
    if (M[ma+1] === -1) {
        M[ma+1] = i;
    }
});

M.forEach(function (c, i) {
    if (c !== -1) {
        console.log(i, "colors:", c);
    }
});

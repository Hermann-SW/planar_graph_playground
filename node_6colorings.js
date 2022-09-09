#include "assert.js"
#include "util.js"
#include "undirected_graph.js"

var D;
assert.assert(process.argv.length > 2);
var sel = process.argv[2];
var dual = process.argv[process.argv.length-1] === "-dual";
var fil = (process.argv.length > 3 + dual) ? Number(process.argv[3]) : -1;

var M = [-1, -1, -1, -1, -1, -1, -1];

forall_plantri_fullerenes(sel, fil, function (G, i) {

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

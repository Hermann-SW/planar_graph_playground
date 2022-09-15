#include "../../assert.js"
#include "../../util.js"
#include "../../undirected_graph.js"

var fs = require("fs");

function write(out, h, A) {
    var writer = fs.createWriteStream(out+"."+h+"xy.js");
    writer.write(JSON.stringify(A));
    writer.close();
}

assert.assert(process.argv.length > 3);
var sel = process.argv[2];
var out = process.argv[3];

var L100 = [[]];
var h=0;
forall_plantri_fullerenes(sel, -1, function (G, i) {
    assert.assert(is_embedding(G));

    L100.push(to_adjacency_lists(G));

    if (i % 100 === 99) {
        write(out, h, L100);
        L100 = [];
        h=h+1;
    }
});

if (L100.length > 0) {
    write(out, h, L100);
}

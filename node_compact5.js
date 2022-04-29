#include "assert.js"
#include "fullerenes.js"
#include "undirected_graph.js"
#include "gauss-jordan.js"

var sel = (
    process.argv.length > 2
    ? process.argv[2]
    : "graphs/10.a"
);

var L;
var G;

const fs = require('fs');

try {
  const data = fs.readFileSync(sel, 'utf8');
  L = JSON.parse(data);
} catch (err) {
  console.error(err);
}

G = from_adjacency_list(L);

L.forEach(function (l, v) {
    l.forEach(function (w, j) {
        assert.assert(w === opposite(G, v, G.V[v][j]));
    });
});

console.log("identical vertex ordering in adjacency list and graph verified");

assert.assert(is_embedding(G));
console.log("is_embedding(" + sel + ") verified, has " + n_faces_planar(G) + " faces");

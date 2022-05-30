#include "assert.js"
#include "util.js"
#include "fullerenes.js"
#include "undirected_graph.js"
#include "node_compact5.sj"

function _main(argc, argv) {
    var sel = (
        argc > 2
        ? argv[2]
        : "graphs/10.a"
    );

    var L;
    var G;

  _ L = parse2file(sel);
  _ G = from_adjacency_list(L);

  _ L.forEach(function (l, v) {
        l.forEach(function (w, j) {
            assert.assert(w === opposite(G, v, G.V[v][j]));
        });
    });

  _ assert.assert(is_embedding(G));

  _ compact5_traversal(G, {});

  _ assert.assert(max_degree(G) <= 5);
  _
    console.log("identical vertex ordering in adjacency list and graph verified");
    console.log("is_embedding(" + sel + ") verified, has " + n_faces_planar(G) + " faces");
    console.log("compat5_traversal(G, {}) done");
    console.log("maxdegree(G) <=5 verified");
}

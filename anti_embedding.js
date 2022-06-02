// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "undirected_graph.js"
#include "mersenne-twister.js"

function chi(G) {
    var nfaces = 0;

    planar_face_traversal(G, {begin_face: function () {
        nfaces += 1;
    }});

    return n_vertices(G) - n_edges(G) + nfaces;
}

function swap_edge(G, v, e) {
    var i = ind(G, v, e);
    var f = next_incident_edge(G, v, e);
    var j = ind(G, v, f);
    var a = G.E[e][i][1];
    var b = G.E[f][j][1];
    G.V[v][b] = e;
    G.E[e][i][1] = b;
    G.V[v][a] = f;
    G.E[f][j][1] = a;
}

function adj_list_str(G) {
    var str = "[";
    forall_vertices(G, function (v) {
        str = str + "[";
        forall_incident_edges(G, v, function (e) {
            str = str + opposite(G, v, e);
            if (next_incident_edge(G,v,e) !== first_incident_edge(G,v)) {
                str = str + ",";
            }
        });
        str = str + "]";
        if (v !== n_vertices(G)-1) {
            str = str + ",";
        }
    });
    return str + "]";
}

assert.assert(process.argv.length > 3);
var N = parseInt(process.argv[3]);
var seed = (process.argv.length === 5) ? parseInt(process.argv[4]) : 1234;

console.log("N=", N, "seed=", seed);

var mt19937 = new MersenneTwister(seed);

function rand_uint32() {
    return mt19937.genrand_int32();
}

function random_edge(G) {
    return rand_uint32() % n_edges(G);
}

var adj = parse2file(process.argv[2]);

var G = from_adjacency_list(adj);

var m = chi(G);
console.log(m);

while (N > 0) {
    var e = random_edge(G);
    var v = (rand_uint32() >= 2*(1<<30)) ? source(G, e) : target(G, e);

    swap_edge(G, v, e);

    if (chi(G) < m) {
        m = chi(G);
        console.log(m, adj_list_str(G));
    }

    N = N - 1;
}

function degree(G, v) {
    return G[v].length;
}

function n_vertices(G) {
    return G.length;
}

function forall_vertices(G, f) {
    var v;
    for (v = 0; v < G.length; v += 1) {
        f(v);
    }
}

function forall_edges(G, f) {
    var v;
    for (v = 0; v < G.length; v += 1) {
        G[v].forEach(function (w) {
            f(v, w);
        });
    }
}

function n_edges(G) {
    var m = 0;

    forall_vertices(G, function (v) {
        m += degree(G, v);
    });

    return m / 2;
}

function nextAdjacentEdge(G, v, w) {
    var j = G[w].indexOf(v);
    if (j === -1) {
        return -1;
    }
    return G[w][(j + 1) % 3];
}

function traverse_face(Emb, v, w) {
    var a;
    var o = v;
    var face = [o];
    while (w !== o) {
        face.push(w);
        a = nextAdjacentEdge(Emb, v, w);
        if (a === -1) {
            return -1;
        }
        v = w;
        w = a;
    }
    return face;
}

function is_embedding(G) {
    var e = n_edges(G);
    var vw2e = linear.zero(n_vertices(G), n_vertices(G));
    var visited = linear.fill(2 * e, 1, false);
    var a;
    var f = 0;

    e = 0;
    forall_edges(G, function (v, w) {
        vw2e[v][w] = e;
        e += 1;
    });

    forall_edges(G, function (v, w) {
        e = vw2e[v][w];
        if (!visited[e]) {
            while (!visited[e]) {
                visited[e] = true;
                a = nextAdjacentEdge(G, v, w);
                assert.assert(a !== -1);

                v = w;
                w = a;
                e = vw2e[v][w];
            }
            f += 1;
        }
    });

    return n_vertices(G) - n_edges(G) + f === 2;
}

function pentagons(Emb) {
    var e = n_edges(Emb);
    var vw2e = linear.zero(n_vertices(Emb), n_vertices(Emb));
    var visited = linear.fill(2 * e, 1, false);
    var a;
    var pent = [];
    var face;

    e = 0;
    forall_edges(Emb, function (v, w) {
        vw2e[v][w] = e;
        e += 1;
    });

    forall_edges(Emb, function (v, w) {
        e = vw2e[v][w];
        if (!visited[e]) {
            face = [];
            while (!visited[e]) {
                visited[e] = true;
                face.push(v);
                a = nextAdjacentEdge(Emb, v, w);
                assert.assert(a !== -1);

                v = w;
                w = a;
                e = vw2e[v][w];
            }
            if (face.length === 5) {
                pent.push(face);
            }
        }
    });

    return pent;
}

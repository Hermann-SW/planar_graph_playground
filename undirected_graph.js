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
            if (v < w) {
                f(v, w);
            }
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

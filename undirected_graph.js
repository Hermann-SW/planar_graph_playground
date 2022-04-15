function degree(G, v) {
    return G.V[v].length;
}

function n_vertices(G) {
    return G.V.length;
}

function n_edges(G) {
    return G.E.length;
}

function forall_vertices(G, f) {
    var v;
    for (v = 0; v < n_vertices(G); v += 1) {
        f(v);
    }
}

function forall_edges(G, f) {
    var e;
    for (e = 0; e < n_edges(G); e += 1) {
        f(e);
    }
}

function any_edge(G) {
    return (
        (G.E.length > 0)
        ? 0
        : -1
    );
}

function forall_adjacent_edges(G, v, f) {
    G.V[v].forEach(function (e) {
        f(e);
    });
}

function source(G, e) {
    return G.E[e][0][0];
}

function target(G, e) {
    return G.E[e][1][0];
}

function new_vertex(G) {
    var v = n_vertices(G);
    G.V.push([]);
    return v;
}

function new_edge_vertex(G, v, e) {
    G.E[e].push([v, degree(G, v)]);
    G.V[v].push(e);
    return e;
}

function new_edge1(G, v) {
    var e = n_edges(G);
    G.E.push([]);
    return new_edge_vertex(G, v, e);
}

function new_edge(G, v, w) {
    return new_edge_vertex(G, w, new_edge1(G, v));
}

function new_graph(n) {
    const A = Array.from(new Array(n), function () {
        return [];
    });
    return {E: [], V: A};
}

function choose2(n) {
    return n * (n + 1) / 2;
}

function from_adjacency_list(L) {
    var e;
    var G = new_graph(L.length);

    L.forEach(function (l, v) {
        l.forEach(function (w) {
            if (v < w) {
                lookup[choose2(w) + v] = new_edge1(G, v);
                e = lookup[choose2(w) + v];
            } else {
                e = lookup[choose2(v) + w];
                new_edge_vertex(G, v, e);
            }
        });
    });

    return G;
}

function opposite(G, v, e) {
    return (
        (v === source(G, e))
        ? target(G, e)
        : source(G, e)
    );
}

function ind(G, v, e) {
    return (
        (v === source(G, e))
        ? 0
        : 1
    );
}

function nextAdjacentEdge(G, v, e) {
    if (v === source(G, e)) {
        return G.V[v][(G.E[e][0][1] + 1) % degree(G, v)];
    } else {
        return G.V[v][(G.E[e][1][1] + 1) % degree(G, v)];
    }
}

function face_vertices(Emb, v, e) {
    var o = e;
    var face = [];
    do {
        v = opposite(Emb, v, e);
        e = nextAdjacentEdge(Emb, v, e);
        face.push(v);
    } while (e !== o);
    return face;
}

function traverse_face(G, visited, v, e, i, pftv) {
    while (!visited[e][i]) {
        visited[e][i] = true;
        if (pftv.next_vertex) {
            pftv.next_vertex(v);
        }
        v = opposite(G, v, e);
        e = nextAdjacentEdge(G, v, e);
        i = ind(G, v, e);
    }
}

function check_traverse(G, visited, v, e, pftv) {
    var i = ind(G, v, e);
    if (!visited[e][i]) {
        if (pftv.begin_face) {
            pftv.begin_face();
        }
        traverse_face(G, visited, v, e, i, pftv);
        if (pftv.end_face) {
            pftv.end_face();
        }
    }
}

function is_embedding(G) {
    var visited = linear.fill(n_edges(G), 2, false);
    var nfaces = 0;

    forall_edges(G, function (g) {
        check_traverse(G, visited, source(G, g), g, {begin_face: function () {
            nfaces += 1;
        }});
        check_traverse(G, visited, target(G, g), g, {begin_face: function () {
            nfaces += 1;
        }});
    });

    return n_vertices(G) - n_edges(G) + nfaces === 2;
}

function pentagons(Emb) {
    var visited = linear.fill(n_edges(Emb), 2, false);
    var pent = [];
    var face;

    var pftv = {
        begin_face: function () {
            face = [];
        },
        end_face: function () {
            if (face.length === 5) {
                pent.push(face);
            }
        },
        next_vertex: function (v) {
            face.push(v);
        }
    };

    forall_edges(Emb, function (g) {
        check_traverse(Emb, visited, source(Emb, g), g, pftv);
        check_traverse(Emb, visited, target(Emb, g), g, pftv);
    });

    return pent;
}

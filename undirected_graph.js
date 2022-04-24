function degree(G, v) {
    return G.V[v].length;
}

function n_vertices(G) {
    return G.V.length;
}

function n_edges(G) {
    return G.E.length;
}

function n_faces(G, chi) {
    return chi + n_edges(G) - n_vertices(G);
}

function n_faces_planar(G) {
    return n_faces(G, 2);
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

function new_graph(n, m) {
    if (m === undefined) {
        m = 0;
    }
    return {E: Array.from(new Array(m), function () {
        return [];
    }),
        V: Array.from(new Array(n), function () {
        return [];
    })};
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

function next_adjacent_edge(G, v, e) {
    var j = ind(G, v, e);
    return G.V[v][(G.E[e][j][1] + 1) % degree(G, v)];
}

function ud2st(str) {
    return (
        (str === undefined)
        ? ""
        : str
    );
}

function print_vertex(G, v) {
    var str = v + ":";
    forall_adjacent_edges(G, v, function (e) {
        str += " (" + e + ")" + opposite(G, v, e);
    });
    console.log(str);
}

function print_graph(G, str) {
    console.log(ud2st(str) + n_vertices(G) + " vertices, " + n_edges(G) + " edges");
    forall_vertices(G, function (v) {
        print_vertex(G, v);
    });
}

function face_vertices(Emb, v, e) {
    var o = e;
    var face = [];
    do {
        v = opposite(Emb, v, e);
        e = next_adjacent_edge(Emb, v, e);
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
        if (pftv.next_edge) {
            pftv.next_edge(e);
        }
        if (pftv.next_vertex_edge) {
            pftv.next_vertex_edge(v, e);
        }
        v = opposite(G, v, e);
        e = next_adjacent_edge(G, v, e);
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

function check_traverse2(G, visited, g, pftv) {
    check_traverse(G, visited, source(G, g), g, pftv);
    check_traverse(G, visited, target(G, g), g, pftv);
}

function planar_face_traversal(G, pftv) {
    var visited = linear.fill(n_edges(G), 2, false);

    if (pftv.begin_traversal) {
        pftv.begin_traversal();
    }

    forall_edges(G, function (g) {
        check_traverse2(G, visited, g, pftv);
    });

    if (pftv.end_traversal) {
        pftv.end_traversal();
    }
}

function is_embedding(G) {
    var nfaces = 0;

    planar_face_traversal(G, {begin_face: function () {
        nfaces += 1;
    }});

    return n_vertices(G) - n_edges(G) + nfaces === 2;
}

function pentagons(Emb) {
    var pent = [];
    var face;

    planar_face_traversal(Emb, {begin_face: function () {
        face = [];
    }, end_face: function () {
        if (face.length === 5) {
            pent.push(face);
        }
    }, next_vertex: function (v) {
        face.push(v);
    }});

    return pent;
}

function dual_graph(G) {
    var last_face = -1;
    var D = new_graph(n_faces_planar(G), n_edges(G));

    planar_face_traversal(G, {begin_face: function () {
        last_face += 1;
    }, next_edge: function (e) {
        new_edge_vertex(D, last_face, e);
    }});

    return D;
}

function is_identical_graph(G, H) {
    if (n_vertices(G) !== n_vertices(H)) {
        return false;
    }
    if (n_edges(G) !== n_edges(H)) {
        return false;
    }
    if (!G.V.every(function (al, v) {
        return al.every(function (e, j) {
            return e === H.V[v][j];
        });
    })) {
        return false;
    }
    if (!G.E.every(function (vt, e) {
        return vt.every(function (v2, j) {
            return v2.every(function (x, k) {
                return x === H.E[e][j][k];
            });
        });
    })) {
        return false;
    }
    return true;
}

function is_same_embedding(G, H) {
    var o;
    if (n_vertices(G) !== n_vertices(H)) {
        return false;
    }
    if (n_edges(G) !== n_edges(H)) {
        return false;
    }
    if (!G.V.every(function (al, v) {
	if (al.length !== degree(H, v)) {
	    return false;
	}
	if (al.length === 0) {
	    return true;
	}
	for(o=0; o < al.length; ++o) {
	    if (al[o] === H.V[v][0]) {
		break;
	    }
	}
	if (o == al.length) {
	    return false;
	}
	if (!H.V[v].every(function(e, i) {
	    return al[(o+i)%al.length] === e;
	})) {
	    return false;
	}
	return true;
    })) {
        return false;
    }
    if (!G.E.every(function (vt, e) {
	return ((vt[0][0] === H.E[e][0][0]) && (vt[1][0] === H.E[e][1][0]));
    })) {
        return false;
    }
    return true;
}

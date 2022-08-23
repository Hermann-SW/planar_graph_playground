function _f(g) {
    return g || function (_i) {
        _i = _i;
    };
}

function planar_face_traversal_visitor() {
    return {};
}

function compact5_traversal_visitor() {
    return {};
}

function empty_graph() {
    return {E: [], V: []};
}

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

function forall_vertices_after(G, u, f) {
    var v;
    for (v = u+1; v < n_vertices(G); v += 1) {
        f(v);
    }
}

function max_degree(G) {
    var mdeg = -1;

    forall_vertices(G, function (v) {
        if (degree(G, v) > mdeg) {
            mdeg = degree(G, v);
        }
    });

    return mdeg;
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

function first_incident_edge(G, v) {
    return (
        degree(G, v) == 0
        ? -1
        : G.V[v][0]
    );
}

function forall_incident_edges(G, v, f) {
    G.V[v].forEach(function (e) {
        f(e);
    });
}

function forall_incident2_edges(G, a, f) {
    a.forEach(function (v) {
        G.V[v].forEach(function (e) {
            f(v, e);
        });
    });
}

function source(G, e) {
    return G.E[e][0][0];
}

function target(G, e) {
    return G.E[e][1][0];
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

function next_incident_edge(G, v, e) {
    var j = ind(G, v, e);
    return G.V[v][(G.E[e][j][1] + 1) % degree(G, v)];
}

function prev_incident_edge(G, v, e) {
    var j = ind(G, v, e);
    return G.V[v][(G.E[e][j][1] + degree(G, v) - 1) % degree(G, v)];
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
    return {E: filled_array(m, 0), V: filled_array(n, 0)};
}

function remove_edge1(G, v, e) {
    var i = ind(G, v, e);
    var f = G.V[v].pop();
    var j;
    if (e !== f) {
        j = ind(G, v, f);
        G.E[f][j][1] = G.E[e][i][1];
        G.V[v][G.E[f][j][1]] = f;
    }
    G.E[e][i][1] = -1;
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
    forall_incident_edges(G, v, function (e) {
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

function compact5_traversal(G, c5v) {
    var S = [];
    var small = filled_array(n_vertices(G), 1, false);
    var v;

    _f(c5v.begin_traversal)();

    forall_vertices(G, function (v) {
        if (degree(G, v) < 6) {
            S.push(v);
            small[v] = true;
        }
    });

    while (S.length > 0) {
        v = S.pop();

        _f(c5v.begin_vertex)(v);
        forall_incident_edges(G, v, function (e) {
            var w = opposite(G, v, e);
            _f(c5v.next_edge)(e);
            _f(c5v.next_vertex_edge)(v, e);
            remove_edge1(G, w, e);
            if ((!small[w]) && (degree(G, w) < 6)) {
                S.push(w);
                small[w] = true;
            }
        });
        _f(c5v.end_vertex)(v);
    }
    _f(c5v.end_traversal)();
}

function compact5_find(C, v, w) {
    var ret = -1;
    forall_incident_edges(C, v, function (e) {
        if (opposite(C, v, e) === w) {
            ret = e;
        }
    });
    forall_incident_edges(C, w, function (e) {
        if (opposite(C, w, e) === v) {
            ret = e;
        }
    });
    return ret;
}

function from_adjacency_list(L) {
    var C = new_graph(L.length);
    var G;
    var e;

    L.forEach(function (l, v) {
        l.forEach(function (w) {
            if (v < w) {
                new_edge(C, v, w);
            }
        });
    });

    compact5_traversal(C, {});

    if (max_degree(C) > 5) {
        return empty_graph();
    }

    G = new_graph(L.length);

    L.forEach(function (l, v) {
        l.forEach(function (w) {
            if (v < w) {
                new_edge1(G, v);
            } else {
                e = compact5_find(C, v, w);
                assert.assert(e !== -1);
                new_edge_vertex(G, v, e);
            }
        });
    });

    return G;
}

function from_adjacency_list_lookup(L) {
    var e;
    var G = new_graph(L.length);
    var lookup;

    function choose2(n) {
        return n * (n + 1) / 2;
    }
    lookup = filled_array(choose2(L.length), 1);

    L.forEach(function (l, v) {
        l.forEach(function (w) {
            if (v < w) {
                lookup[choose2(w) + v] = new_edge1(G, v);
            } else {
                e = lookup[choose2(v) + w];
                if (e === -1) {
                    return empty_graph();
                }
                new_edge_vertex(G, v, e);
            }
        });
    });

    return G;
}

function six_coloring(G) {
    var S = [];
    var col = filled_array(n_vertices(G), 1, -1);
    var mc = [0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,
              0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0];
    var v;
    var bs;

    compact5_traversal(G, {begin_vertex: function (v) {
        S.push(v);
    }});
    while (S.length > 0) {
        bs = 0;
        v = S.pop();
        forall_incident_edges(G, v, function (e) {
            bs |= 1 << col[opposite(G, v, e)];
        });
        assert.assert(bs < mc.length);
        col[v] = mc[bs];
    }
    return col;
}

function face_vertices(Emb, v, e) {
    var o = e;
    var face = [];
    do {
        v = opposite(Emb, v, e);
        e = next_incident_edge(Emb, v, e);
        face.push(v);
    } while (e !== o);
    return face;
}

function traverse_face(G, visited, v, e, i, pftv) {
    while (!visited[e][i]) {
        visited[e][i] = true;
        _f(pftv.next_vertex)(v);
        _f(pftv.next_edge)(e);
        _f(pftv.next_vertex_edge)(v, e);
        v = opposite(G, v, e);
        e = next_incident_edge(G, v, e);
        i = ind(G, v, e);
    }
}

function check_traverse(G, visited, v, e, pftv) {
    var i = ind(G, v, e);
    if (!visited[e][i]) {
        _f(pftv.begin_face)();
        traverse_face(G, visited, v, e, i, pftv);
        _f(pftv.end_face)();
    }
}

function check_traverse2(G, visited, g, pftv) {
    check_traverse(G, visited, source(G, g), g, pftv);
    check_traverse(G, visited, target(G, g), g, pftv);
}

function planar_face_traversal(G, pftv) {
    var visited = filled_array(n_edges(G), 2, false);

    _f(pftv.begin_traversal)();

    forall_edges(G, function (g) {
        check_traverse2(G, visited, g, pftv);
    });

    _f(pftv.end_traversal)();
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

function faces(Emb) {
    var ret = [];
    var face;

    planar_face_traversal(Emb, {begin_face: function () {
        face = [];
    }, end_face: function () {
        ret.push(face);
    }, next_vertex: function (v) {
        face.push(v);
    }});

    return ret;
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

function floyd_warshall(G) {
    var dist = filled_array(n_vertices(G), n_vertices(G), Infinity);

    forall_edges(G, function(e) {
        dist[source(G, e)][target(G, e)] = 1;
        dist[target(G, e)][source(G, e)] = 1;
    });
    forall_vertices(G, function(v) {
        dist[v][v] = 0;
    });

    forall_vertices(G, function(k) {
        forall_vertices(G, function(i) {
            forall_vertices(G, function(j) {
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            });
        });
    });

    return dist;
}

function floyd_warshall_path(G) {
    var dist = filled_array(n_vertices(G), n_vertices(G), Infinity);
    var next = filled_array(n_vertices(G), n_vertices(G), -1);

    forall_edges(G, function(e) {
        dist[source(G, e)][target(G, e)] = 1;
        next[source(G, e)][target(G, e)] = e;
        dist[target(G, e)][source(G, e)] = 1;
        next[target(G, e)][source(G, e)] = e;
    });
    forall_vertices(G, function(v) {
        dist[v][v] = 0;
        next[v][v] = v;
    });

    forall_vertices(G, function(k) {
        forall_vertices(G, function(i) {
            forall_vertices(G, function(j) {
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            });
        });
    });

    return [dist, next];
}

function fw_path(G, next, u, v) {
    var path = [];
    if (next[u][v] == -1) {
        return path;
    }
    while (u !== v) {
        var e = next[u][v];
        path.push(e);
        u = opposite(G, u, e);
    }
    return path;
}

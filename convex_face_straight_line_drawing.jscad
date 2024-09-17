"use strict";

var exports = {};
var assert = exports;

if (true) {
    exports.assert = function (condition, message) {
        var found;
        if (!condition) {
            found = false;
            new Error().stack.split("\n").forEach(function (l) {
                if (found) {
                    alert((message || "Assertion failed") + l);
                    throw (message || "Assertion failed") + l;
                }
                found = l.includes("assert.js");
            });
            throw (message || "Assertion failed");
        }
    };
}
function filled_array(n, m, v) {
    var zm = new Array(n);

    if (v === undefined) {
        v = 0;
    }

    if (m==1)
        zm.fill(v);
    else
        for (var j=0; j<n; j++) {
            zm[j] = filled_array(m, 1, v);
        }
    return zm;
}

function zero(n, m) {
    return filled_array(n, m, 0);
}

function parse2file(name) {
    return JSON.parse(require('fs').readFileSync(name, 'utf8'));
}
"use strict";





var exports = {};
var linear = exports;

if (true) {







function Mat(data, mirror) {

  this.data = new Array(data.length);
  for (var i=0, cols=data[0].length; i<data.length; i++) {
    this.data[i] = new Array(cols);
    for(var j=0; j<cols; j++) {
      this.data[i][j] = data[i][j];
    }
  }

  if (mirror) {
    if (typeof mirror[0] !== "object") {
      for (var i=0; i<mirror.length; i++) {
        mirror[i] = [mirror[i]];
      }
    }
    this.mirror = new Mat(mirror);
  }
}




Mat.prototype.swap = function (i, j) {
  if (this.mirror) this.mirror.swap(i,j);
  var tmp = this.data[i];
  this.data[i] = this.data[j];
  this.data[j] = tmp;
}




Mat.prototype.multline = function (i, l) {
  if (this.mirror) this.mirror.multline(i,l);
  var line = this.data[i];
  for (var k=line.length-1; k>=0; k--) {
    line[k] *= l;
  }
}




Mat.prototype.addmul = function (i, j, l) {
  if (this.mirror) this.mirror.addmul(i,j,l);
  var lineI = this.data[i], lineJ = this.data[j];
  for (var k=lineI.length-1; k>=0; k--) {
    lineI[k] = lineI[k] + l*lineJ[k];
  }
}




Mat.prototype.hasNullLine = function (i) {
  for (var j=0; j<this.data[i].length; j++) {
    if (this.data[i][j] !== 0) {
      return false;
    }
  }
  return true;
}

Mat.prototype.gauss = function() {
  var pivot = 0,
      lines = this.data.length,
      columns = this.data[0].length,
      nullLines = [];

  for (var j=0; j<columns; j++) {

    var maxValue = 0, maxLine = 0;
    for (var k=pivot; k<lines; k++) {
      var val = this.data[k][j];
      if (Math.abs(val) > Math.abs(maxValue)) {
        maxLine = k;
        maxValue = val;
      }
    }
    if (maxValue === 0) {

      nullLines.push(pivot);
    } else {

      this.multline(maxLine, 1/maxValue);
      this.swap(maxLine, pivot);
      for (var i=0; i<lines; i++) {
        if (i !== pivot) {
          this.addmul(i, pivot, -this.data[i][j]);
        }
      }
    }
    pivot++;
  }


  for (var i=0; i<nullLines.length; i++) {
    if (!this.mirror.hasNullLine(nullLines[i])) {
      throw new Error("singular matrix");
    }
  }
  return this.mirror.data;
}







exports.solve = function solve(A, b) {
  var result = new Mat(A,b).gauss();
  if (result.length > 0 && result[0].length === 1) {

    for (var i=0; i<result.length; i++) result[i] = result[i][0];
  }
  return result;
}

function identity(n) {
  var id = new Array(n);
  for (var i=0; i<n; i++) {
    id[i] = new Array(n);
    for (var j=0; j<n; j++) {
      id[i][j] = (i === j) ? 1 : 0;
    }
  }
  return id;
}




exports.invert = function invert(A) {
  return new Mat(A, identity(A.length)).gauss();
}

}
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
        if (n === undefined) {
            n = 0;
        }
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

function to_adjacency_lists(G) {
    var L = [];
    forall_vertices(G, function(v) {
        var a = [];
        forall_incident_edges(G, v, function(e) {
            a.push(opposite(G, v, e));
        });
        L.push(a);
    });
    return L;
}

function forall_plantri_fullerenes(name, fil, f) {
    var F = require('fs').readFileSync(name, 'utf8').split("\n");

    var l = 1;
    var i = 0;
    while (l < F.length-1) {
        var L = [];
        while (F[l] !== "0") {
            var v = F[l].trim().replace(/ +/g, " ").split(" ")
            L.push([Number(v[4])-1, Number(v[5])-1, Number(v[6])-1]);
            l = l + 1;
        }
        i = i + 1;
        if ((fil === -1) || (fil === i)) {
            var G = from_adjacency_list(L);
            f(G, i);
        }
        l = l + 1;
    }
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

function floyd_warshall(G, w=[]) {
    var dist = filled_array(n_vertices(G), n_vertices(G), Infinity);

    if (w.length === 0) {
        w = filled_array(n_edges(G), 1, 1);
    }

    forall_edges(G, function(e) {
        dist[source(G, e)][target(G, e)] = w[e];
        dist[target(G, e)][source(G, e)] = w[e];
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

function floyd_warshall_path(G, w=[]) {
    var dist = filled_array(n_vertices(G), n_vertices(G), Infinity);
    var next = filled_array(n_vertices(G), n_vertices(G), -1);

    if (w.length === 0) {
        w = filled_array(n_edges(G), 1, 1);
    }

    forall_edges(G, function(e) {
        dist[source(G, e)][target(G, e)] = w[e];
        next[source(G, e)][target(G, e)] = e;
        dist[target(G, e)][source(G, e)] = w[e];
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
"use strict";

var exports = {};
var tutte = exports;

if (true) {
    exports.convex_face_coordinates = function (Emb, face, factor) {
        var n = n_vertices(Emb);
        var v;
        var w;

        var X = zero(n, n);
        var Y = zero(n, n);
        var x = zero(n, 1);
        var y = zero(n, 1);

        if (typeof(factor) === "number") {
            var angle = Math.PI;
            var delta = factor * (2 * Math.PI) / face.length;

            assert.assert(is_embedding(Emb));
            face.forEach(function (v) {
                x[v] = Math.sin(angle);
                y[v] = Math.cos(angle);
                angle -= delta;
            });
        } else {
            var coords = factor;
            face.forEach(function(v) {
                x[v] = coords[v][0];
                y[v] = coords[v][1];
            });
        }

        forall_vertices(G, function(v) {
            if (face.includes(v)) {
                X[v][v] = 1;
                Y[v][v] = 1;
            } else {
                X[v][v] = -1;
                Y[v][v] = -1;

                forall_incident_edges(Emb, v, function (e) {
                    w = opposite(Emb, v, e);
                    X[v][w] = 1.0 / degree(Emb, v);
                    Y[v][w] = 1.0 / degree(Emb, v);
                });
            }
        });
        return [linear.solve(X, x), linear.solve(Y, y)];
    };
}
var F =
[
[[1,6,3,4,2,5],[0,5,6],[0,4,3,5],[5,2,4,0,6],[0,3,2],[1,0,2,3,6],[1,5,3,0]],
    [[9,10,1],[0,2,15],[1,14,3],[2,4,16],[3,13,5],[4,6,17],[5,12,7],[6,8,18],[7,11,9],[8,0,19],[0,11,14],[10,8,12],[11,6,13],[12,4,14],[13,2,10],[1,16,19],[15,3,17],[16,5,18],[17,7,19],[18,9,15]],
    [[9,10,1],[0,2,25],[1,18,3],[2,4,26],[3,16,5],[4,6,27],[5,14,7],[6,8,28],[7,12,9],[8,0,29],[0,11,19],[10,12,21],[11,8,13],[12,14,22],[13,6,15],[14,16,23],[15,4,17],[16,18,24],[17,2,19],[18,10,20],[19,21,24],[20,11,22],[21,13,23],[22,15,24],[23,17,20],[1,26,29],[25,3,27],[26,5,28],[27,7,29],[28,9,25]],
    [[9,10,1],[0,2,35],[1,18,3],[2,4,36],[3,16,5],[4,6,37],[5,14,7],[6,8,38],[7,12,9],[8,0,39],[0,11,19],[10,12,22],[11,8,13],[12,14,24],[13,6,15],[14,16,26],[15,4,17],[16,18,28],[17,2,19],[18,10,20],[19,21,29],[20,22,31],[21,11,23],[22,24,32],[23,13,25],[24,26,33],[25,15,27],[26,28,34],[27,17,29],[28,20,30],[29,31,34],[30,21,32],[31,23,33],[32,25,34],[33,27,30],[1,36,39],[35,3,37],[36,5,38],[37,7,39],[38,9,35]],
    [[9,10,1],[0,2,45],[1,18,3],[2,4,46],[3,16,5],[4,6,47],[5,14,7],[6,8,48],[7,12,9],[8,0,49],[0,11,19],[10,12,22],[11,8,13],[12,14,24],[13,6,15],[14,16,26],[15,4,17],[16,18,28],[17,2,19],[18,10,20],[19,21,29],[20,22,32],[21,11,23],[22,24,34],[23,13,25],[24,26,36],[25,15,27],[26,28,38],[27,17,29],[28,20,30],[29,31,39],[30,32,41],[31,21,33],[32,34,42],[33,23,35],[34,36,43],[35,25,37],[36,38,44],[37,27,39],[38,30,40],[39,41,44],[40,31,42],[41,33,43],[42,35,44],[43,37,40],[1,46,49],[45,3,47],[46,5,48],[47,7,49],[48,9,45]],
    [[17,18,1],[0,2,39],[1,31,3],[2,4,40],[3,29,5],[4,6,42],[5,28,7],[6,8,44],[7,26,9],[8,10,45],[9,24,11],[10,12,47],[11,23,13],[12,14,49],[13,21,15],[14,16,50],[15,19,17],[16,0,52],[0,19,32],[18,16,20],[19,21,34],[20,14,22],[21,23,35],[22,12,24],[23,10,25],[24,26,36],[25,8,27],[26,28,37],[27,6,29],[28,4,30],[29,31,38],[30,2,32],[31,18,33],[32,34,38],[33,20,35],[34,22,36],[35,25,37],[36,27,38],[37,30,33],[1,40,53],[39,3,41],[40,42,55],[41,5,43],[42,44,56],[43,7,45],[44,9,46],[45,47,57],[46,11,48],[47,49,58],[48,13,50],[49,15,51],[50,52,59],[51,17,53],[52,39,54],[53,55,59],[54,41,56],[55,43,57],[56,46,58],[57,48,59],[58,51,54]],
    [[19,20,1],[0,2,48],[1,36,3],[2,4,49],[3,34,5],[4,6,51],[5,32,7],[6,8,52],[7,30,9],[8,10,54],[9,29,11],[10,12,56],[11,27,13],[12,14,57],[13,25,15],[14,16,59],[15,23,17],[16,18,60],[17,21,19],[18,0,62],[0,21,37],[20,18,22],[21,23,39],[22,16,24],[23,25,40],[24,14,26],[25,27,42],[26,12,28],[27,29,43],[28,10,30],[29,8,31],[30,32,44],[31,6,33],[32,34,45],[33,4,35],[34,36,47],[35,2,37],[36,20,38],[37,39,47],[38,22,40],[39,24,41],[40,42,46],[41,26,43],[42,28,44],[43,31,45],[44,33,46],[45,47,41],[46,35,38],[1,49,63],[48,3,50],[49,51,65],[50,5,52],[51,7,53],[52,54,66],[53,9,55],[54,56,67],[55,11,57],[56,13,58],[57,59,68],[58,15,60],[59,17,61],[60,62,69],[61,19,63],[62,48,64],[63,65,69],[64,50,66],[65,53,67],[66,55,68],[67,58,69],[68,61,64]],
[
[ 1, 20, 19 ]
, [ 0, 2, 30 ]
, [ 1, 3, 176 ]
, [ 2, 4, 178 ]
, [ 3, 5, 75 ]
, [ 4, 6, 83 ]
, [ 5, 7, 186 ]
, [ 6, 8, 181 ]
, [ 7, 9, 100 ]
, [ 8, 10, 143 ]
, [ 9, 11, 148 ]
, [ 10, 12, 131 ]
, [ 11, 13, 33 ]
, [ 12, 14, 39 ]
, [ 13, 15, 52 ]
, [ 14, 16, 52 ]
, [ 15, 17, 40 ]
, [ 16, 18, 31 ]
, [ 17, 19, 32 ]
, [ 18, 0, 189 ]
, [ 0, 21, 192 ]
, [ 20, 22, 32 ]
, [ 21, 23, 31 ]
, [ 22, 24, 116 ]
, [ 23, 25, 116 ]
, [ 24, 26, 43 ]
, [ 25, 27, 96 ]
, [ 26, 28, 98 ]
, [ 27, 29, 77 ]
, [ 28, 30, 169 ]
, [ 29, 1, 177 ]
, [ 17, 22, 44 ]
, [ 21, 18, 188 ]
, [ 12, 34, 130 ]
, [ 33, 35, 195 ]
, [ 34, 36, 73 ]
, [ 35, 37, 72 ]
, [ 36, 38, 72 ]
, [ 37, 39, 87 ]
, [ 38, 13, 53 ]
, [ 16, 41, 63 ]
, [ 40, 42, 99 ]
, [ 41, 43, 99 ]
, [ 42, 44, 25 ]
, [ 43, 31, 116 ]
, [ 46, 130, 51 ]
, [ 45, 47, 81 ]
, [ 46, 48, 80 ]
, [ 47, 49, 66 ]
, [ 48, 50, 65 ]
, [ 49, 51, 185 ]
, [ 50, 45, 193 ]
, [ 15, 53, 14 ]
, [ 52, 54, 39 ]
, [ 53, 55, 87 ]
, [ 54, 56, 127 ]
, [ 55, 57, 127 ]
, [ 56, 58, 124 ]
, [ 57, 59, 123 ]
, [ 58, 60, 122 ]
, [ 59, 61, 64 ]
, [ 60, 62, 68 ]
, [ 61, 63, 96 ]
, [ 62, 40, 99 ]
, [ 60, 65, 69 ]
, [ 64, 49, 74 ]
, [ 48, 67, 149 ]
, [ 66, 68, 150 ]
, [ 67, 61, 125 ]
, [ 64, 70, 122 ]
, [ 69, 71, 84 ]
, [ 70, 72, 84 ]
, [ 71, 36, 37 ]
, [ 35, 74, 191 ]
, [ 73, 65, 184 ]
, [ 4, 76, 167 ]
, [ 75, 77, 169 ]
, [ 76, 78, 28 ]
, [ 77, 79, 98 ]
, [ 78, 80, 149 ]
, [ 79, 47, 149 ]
, [ 46, 82, 154 ]
, [ 81, 83, 171 ]
, [ 82, 5, 170 ]
, [ 71, 85, 70 ]
, [ 84, 86, 124 ]
, [ 85, 87, 127 ]
, [ 86, 38, 54 ]
, [ 89, 100, 95 ]
, [ 88, 90, 115 ]
, [ 89, 91, 134 ]
, [ 90, 92, 183 ]
, [ 91, 93, 145 ]
, [ 92, 94, 145 ]
, [ 93, 95, 144 ]
, [ 94, 88, 144 ]
, [ 26, 97, 62 ]
, [ 96, 98, 126 ]
, [ 97, 27, 78 ]
, [ 42, 63, 41 ]
, [ 88, 101, 8 ]
, [ 100, 102, 181 ]
, [ 101, 103, 190 ]
, [ 102, 104, 174 ]
, [ 103, 105, 170 ]
, [ 104, 106, 159 ]
, [ 105, 107, 156 ]
, [ 106, 108, 151 ]
, [ 107, 109, 151 ]
, [ 108, 110, 121 ]
, [ 109, 111, 121 ]
, [ 110, 112, 120 ]
, [ 111, 113, 173 ]
, [ 112, 114, 173 ]
, [ 113, 115, 135 ]
, [ 114, 89, 134 ]
, [ 23, 24, 44 ]
, [ 118, 130, 121 ]
, [ 117, 119, 129 ]
, [ 118, 120, 135 ]
, [ 119, 111, 173 ]
, [ 110, 117, 109 ]
, [ 69, 123, 59 ]
, [ 122, 124, 58 ]
, [ 123, 85, 57 ]
, [ 68, 126, 150 ]
, [ 125, 97, 150 ]
, [ 56, 86, 55 ]
, [ 129, 136, 133 ]
, [ 128, 118, 135 ]
, [ 117, 33, 45 ]
, [ 11, 132, 147 ]
, [ 131, 133, 164 ]
, [ 132, 128, 155 ]
, [ 115, 90, 142 ]
, [ 114, 129, 119 ]
, [ 128, 137, 155 ]
, [ 136, 138, 194 ]
, [ 137, 139, 166 ]
, [ 138, 140, 165 ]
, [ 139, 141, 147 ]
, [ 140, 142, 146 ]
, [ 141, 134, 183 ]
, [ 144, 9, 148 ]
, [ 143, 94, 95 ]
, [ 93, 146, 92 ]
, [ 145, 141, 183 ]
, [ 140, 148, 131 ]
, [ 147, 143, 10 ]
, [ 66, 79, 80 ]
, [ 126, 67, 125 ]
, [ 108, 152, 107 ]
, [ 151, 153, 158 ]
, [ 152, 154, 158 ]
, [ 153, 81, 171 ]
, [ 133, 136, 180 ]
, [ 106, 157, 159 ]
, [ 156, 158, 161 ]
, [ 157, 152, 153 ]
, [ 156, 160, 105 ]
, [ 159, 161, 172 ]
, [ 160, 157, 172 ]
, [ 163, 182, 166 ]
, [ 162, 164, 179 ]
, [ 163, 165, 132 ]
, [ 164, 166, 139 ]
, [ 165, 162, 138 ]
, [ 75, 168, 178 ]
, [ 167, 169, 177 ]
, [ 168, 76, 29 ]
, [ 104, 83, 175 ]
, [ 82, 172, 154 ]
, [ 171, 160, 161 ]
, [ 113, 120, 112 ]
, [ 103, 175, 187 ]
, [ 174, 170, 186 ]
, [ 2, 178, 177 ]
, [ 30, 176, 168 ]
, [ 176, 3, 167 ]
, [ 163, 180, 182 ]
, [ 179, 155, 194 ]
, [ 7, 101, 190 ]
, [ 162, 179, 194 ]
, [ 91, 146, 142 ]
, [ 74, 185, 191 ]
, [ 184, 50, 193 ]
, [ 175, 6, 187 ]
, [ 174, 186, 190 ]
, [ 32, 189, 192 ]
, [ 188, 19, 192 ]
, [ 187, 181, 102 ]
, [ 73, 184, 195 ]
, [ 20, 188, 189 ]
, [ 51, 195, 185 ]
, [ 137, 182, 180 ]
, [ 193, 34, 191 ]
],
[[19,20,1],[0,2,80],[1,38,3],[2,4,81],[3,36,5],[4,6,83],[5,34,7],[6,8,84],[7,32,9],[8,10,86],[9,30,11],[10,12,87],[11,28,13],[12,14,89],[13,26,15],[14,16,90],[15,24,17],[16,18,92],[17,22,19],[18,0,93],[0,21,39],[20,22,41],[21,18,23],[22,24,43],[23,16,25],[24,26,45],[25,14,27],[26,28,47],[27,12,29],[28,30,49],[29,10,31],[30,32,51],[31,8,33],[32,34,53],[33,6,35],[34,36,55],[35,4,37],[36,38,57],[37,2,39],[38,20,40],[39,41,58],[40,21,42],[41,43,60],[42,23,44],[43,45,62],[44,25,46],[45,47,64],[46,27,48],[47,49,65],[48,29,50],[49,51,67],[50,31,52],[51,53,69],[52,33,54],[53,55,70],[54,35,56],[55,57,72],[56,37,58],[57,40,59],[58,60,73],[59,42,61],[60,62,75],[61,44,63],[62,64,76],[63,46,65],[64,48,66],[65,67,77],[66,50,68],[67,69,78],[68,52,70],[69,54,71],[70,72,79],[71,56,73],[72,59,74],[73,75,79],[74,61,76],[75,63,77],[76,66,78],[77,68,79],[78,71,74],[1,81,94],[80,3,82],[81,83,96],[82,5,84],[83,7,85],[84,86,97],[85,9,87],[86,11,88],[87,89,98],[88,13,90],[89,15,91],[90,92,99],[91,17,93],[92,19,94],[93,80,95],[94,96,99],[95,82,97],[96,85,98],[97,88,99],[98,91,95]],
[
[1,42,43,96,9,63,68,46,64,84,71,23,3,99,77,6,4,2,67,93]
,[0,93,73,2,78,17,37,15,14,28,94,57,42]
,[0,4,78,1,73,67]
,[0,23,86,97,8,10,11,36,99]
,[2,0,6,72,60,15,37,78]
,[29,9,62,7,56,74,86]
,[4,0,77,99,36,81,66,21,22,82,49,7,20,15,72]
,[6,49,8,56,5,62,27,31,20]
,[7,49,19,13,11,10,3,97,69,56]
,[0,96,35,94,28,27,39,62,5,29,70,38,63]
,[3,8,11]
,[10,8,13,19,21,81,36,3]
,[16,50,59,53,89,25,88,64]
,[11,8,19]
,[1,15,20,27,28]
,[6,20,14,1,37,4,60,72]
,[12,64,46,79,80,41,38,45,32,52,29,48,18,91,61,40,24,50]
,[1,78,37]
,[23,26,40,91,16,48,29]
,[13,8,49,82,22,21,11]
,[7,31,55,27,14,15,6]
,[19,22,6,66,81,11]
,[6,21,19,82]
,[24,26,18,29,86,3,0,71,51,44,30]
,[50,16,40,26,23,30,92,75,54,51,25,83,59]
,[64,88,12,89,53,83,24,51,71,84]
,[24,40,18,23]
,[7,62,39,9,28,14,20,55,31]
,[27,9,94,1,14]
,[9,5,86,23,18,48,16,52,32,98,58,70]
,[24,23,44,92]
,[20,7,27,55]
,[29,52,16,45,33,58,98]
,[32,45,38,87,58]
,[47,44,51,54,75]
,[9,96,76,57,94]
,[3,11,81,6,99]
,[15,1,17,78,4]
,[16,41,63,9,70,58,87,33,45]
,[27,62,9]
,[18,26,24,16,61,91]
,[38,16,80,65,63]
,[43,0,1,57,76]
,[0,42,76,96]
,[30,23,51,34,47,85,92]
,[38,33,32,16]
,[16,64,0,68,79]
,[44,34,75,85]
,[18,16,29]
,[19,8,7,6,82]
,[16,24,59,12]
,[23,71,25,24,54,34,44]
,[29,16,32]
,[25,89,12,59,83]
,[34,51,24,75]
,[27,20,31]
,[5,7,8,69,90,74]
,[42,1,94,35,76]
,[29,98,32,33,87,38,70]
,[50,24,83,53,12]
,[4,72,15]
,[40,16,91]
,[9,39,27,7,5]
,[9,38,41,65,68,0]
,[25,84,0,46,16,12,88]
,[41,80,68,63]
,[21,6,81]
,[0,2,73,95,93]
,[46,0,63,65,80,79]
,[8,97,90,56]
,[9,29,58,38]
,[23,0,84,25,51]
,[6,15,60,4]
,[67,2,1,93,95]
,[86,5,56,90]
,[34,54,24,92,85,47]
,[42,57,35,96,43]
,[0,99,6]
,[17,1,2,4,37]
,[16,46,68,80]
,[79,68,65,41,16]
,[36,11,21,66,6]
,[22,19,49,6]
,[24,25,53,59]
,[0,64,25,71]
,[47,75,92,44]
,[3,23,29,5,74,90,97]
,[33,38,58]
,[25,64,12]
,[25,12,53]
,[69,97,86,74,56]
,[18,40,61,16]
,[24,30,44,85,75]
,[0,67,95,73,1]
,[35,57,1,28,9]
,[73,93,67]
,[43,76,35,9,0]
,[90,69,8,3,86]
,[32,58,29]
,[77,0,3,36,6]
],
]
;
"use strict";

var G;
var coords;

function doi(x) {
    var e;

    G = from_adjacency_list(F[x]);

    assert.assert(is_embedding(G));

    e = (
        (n_edges(G) > 16)
        ? 16
        : any_edge(G)
    );

    doit(G, source(G, e), e);
}

function doit(F, v, e) {
    var slider = 100;
    var slider2 = 800;
    var check = false
    var selInd = 0;
    var size = slider2;
    var r = 12;
    var pent;
    var spl = -1;
    var tst;
    var lmin = 99999;
    var lcur;
    var cx;
    var cy;
    var dx;
    var dy;
    var w;

    var H = (
        check
        ? dual_graph(F)
        : F
    );

    var visited = filled_array(n_edges(G), 2, false);
    var face = [];

    traverse_face(H, visited, v, e, ind(H, v, e), {next_vertex: function (v) {
        face.push(v);
    }});
    assert.assert(face.length > 0);

    coords = tutte.convex_face_coordinates(H, face, slider / 100.0);
}

const jscad = require('@jscad/modeling')
const { colorize } = jscad.colors
const { cube, sphere, cylinder, circle } = jscad.primitives
const { rotate, translate } = jscad.transforms
const { vec2, vec3, plane } = jscad.maths
const { extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract } = require('@jscad/modeling').booleans

function getParameterDefinitions() {
  return [
    { name: 'gra', type: 'slider', initial: 1, min: 0, max: 9, step: 1,
      fps: 1, live: true, autostart: false, loop:'reverse', caption: 'graph:'},
    { name: 'sca', type: 'slider', initial: 1, min: 0, max: 2, step: 0.1,
      fps: 10, live: true, autostart: false, loop:'reverse', caption: 'scale:'}
  ];
}

var sc = 10
var er = sc / 200
var sca = 1

let cachedSphere = sphere({radius:3*er})

function vertex3(_v) {
    var p = [coords[0][_v], coords[1][_v]] 
    var v = [p[0]*sc*sca,p[1]*sc*sca,0]
    var s = translate(v, cachedSphere)
    return colorize([0, 0.7, 0], s)
}

let edgeCylinder = cylinder({radius:er, height:1})

function edge1(v, w) {
    var d = [0, 0, 0]
    var x = [0, 0, 0]
    jscad.maths.vec3.subtract(d, w, v)
    vec3.add(x, v, w)
    vec3.scale(w, x, 0.5)
    return colorize([0, 0, 1, 1], 
        translate(w, 
            rotate([0, Math.acos(d[2]/vec3.length(d)), Math.atan2(d[1], d[0])],
                jscad.transforms.scale([1, 1, vec3.length(d)], edgeCylinder)
            )
        )
    )
}

function main(params) {
   sca = params.sca

   doi(params.gra);

   var out=[]

   forall_vertices(G, function(v) {
        out.push(vertex3(v))
   })
                   
   forall_edges(G, function(e) {
      var v = source(G, e)
      var w = target(G, e)
     
      out.push(colorize([0,0,0],edge1(
        [sca*sc*coords[0][v], sca*sc*coords[1][v], 0],
        [sca*sc*coords[0][w], sca*sc*coords[1][w], 0])))
    })

    return out
}

module.exports = { main, getParameterDefinitions }

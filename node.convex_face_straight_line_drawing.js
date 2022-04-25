#include "assert.js"
#include "gauss-jordan.js"
#include "undirected_graph.js"
#include "tutte.js"
#include "ps.js"
#include "fullerenes.js"


var G;
var lookup = [];
var K4 = [[1, 3, 2], [2, 3, 0], [0, 3, 1], [0, 1, 2]];
var K4noemb = [[3, 1, 2], [2, 0, 3], [0, 3, 1], [0, 1, 2]];
var coords;

var map = ps.map;

function dist(v, evt, size, r) {
    return Math.sqrt((map(coords[0][v]) - evt.layerX)**2 + (map(coords[1][v]) - evt.layerY)**2);
}

function doi(x) {
    var e;

    G = from_adjacency_list(F[x]);
    //G = from_adjacency_list(K4noemb);

    assert.assert(is_embedding(G));

    e = (n_edges(G) > 9) ? 9 : any_edge(G);

    doit(G, source(G, e), e);
}

function doit(G, v, e) {
    var slider = 100;
    var slider2 = 592;
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

    var visited = linear.fill(n_edges(G), 2, false);
    var face = [];

    traverse_face(G, visited, v, e, ind(G, v, e), { next_vertex: function (v) { face.push(v); } } );
    assert.assert(face.length > 0);

    coords = tutte.convex_face_coordinates(G, face, slider / 100.0);

    forall_edges(G, function (e) {
        v = source(G, e);
        w = target(G, e);
        cx = map(coords[0][v]);
        cy = map(coords[1][v]);
        dx = map(coords[0][w]);
        dy = map(coords[1][w]);
        dx -= cx;
        dy -= cy;
        lcur = Math.sqrt(dx * dx + dy * dy);
        if (lcur < lmin) {
            lmin = lcur;
        }
    });
    if (lmin < 2 * r + 2) {
        r = lmin / 3;
    }

    pent = pentagons(G);
    if (face.length === 5) {
        tst = linear.fill(n_vertices(G), 1, false);
        face.forEach(function (v) {
            tst[v] = true;
        });
        pent.forEach(function (c, i) {
            var good = true;
            c.forEach(function (v) {
                if (!tst[v]) {
                    good = false;
                }
            });
            if (good) {
                spl = i;
            }
        });
        if (spl !== -1) {
            pent.splice(spl, 1);
        }

    }

    ps.header(selInd, slider, slider2, "");

    ps.straight_line_drawing(G, coords, pent, size, r, (face.length === 5) ? face : []);
}

doi(1);

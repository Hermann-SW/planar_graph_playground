#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "undirected_graph.js"
#include "tutte.js"
#include "ps.js"


var sel = (
    (process.argv.length > 2)
    ? process.argv[2]
    : "graphs/C30.a"
);

function doi(x) {
    var e;
    var L;
    var G;

    L = parse2file(x);
    G = from_adjacency_list(L);

    assert.assert(is_embedding(G));

    e = (
        (n_edges(G) > 9)
        ? 9
        : any_edge(G)
    );

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

    var visited = filled_array(n_edges(G), 2, false);
    var face = [];
    var deg;
    var last_face;

    ps.set(size, r);

    traverse_face(G, visited, v, e, ind(G, v, e), {next_vertex: function (v) {
        face.push(v);
    }});
    assert.assert(face.length > 0);

    var coords = tutte.convex_face_coordinates(G, face, slider / 100.0);

    forall_edges(G, function (e) {
        v = source(G, e);
        w = target(G, e);
        cx = ps.scrx(coords[0][v]);
        cy = ps.scry(coords[1][v]);
        dx = ps.scrx(coords[0][w]);
        dy = ps.scry(coords[1][w]);
        dx -= cx;
        dy -= cy;
        lcur = Math.sqrt(dx * dx + dy * dy);
        if (lcur < lmin) {
            lmin = lcur;
        }
    });
    if (lmin < 2 * r + 2) {
        r = lmin / 3;
        ps.set(size, r);
    }

    pent = pentagons(G);
    if (face.length === 5) {
        tst = filled_array(n_vertices(G), 1, false);
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

    ps.header();
    ps.header2();

    ps.straight_line_drawing(G, coords, pent, size, r, (
        (face.length === 5)
        ? face
        : []
    ), false);

    last_face = -1;
    planar_face_traversal(G, {begin_face: function () {
        last_face += 1;
    }, next_vertex_edge: function (v, e) {
        var rgb = ["0 0 1", "0 1 0", "1 0 0", "0.5 0.5 1"];
        w = opposite(G, v, e);
        cx = (ps.scrx(coords[0][v]) + ps.scrx(coords[0][w])) / 2;
        cy = (ps.scry(coords[1][v]) + ps.scry(coords[1][w])) / 2;
        deg = Math.atan2(coords[1][v] - coords[1][w], coords[0][w] - coords[0][v]) * 180 / Math.PI;
        console.log("15 15 " + rgb[last_face % rgb.length] + " " + deg + " " + cx + " " + cy + " parrow");
    }});

    console.log("showpage");
}

doi(sel);

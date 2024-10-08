#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "undirected_graph.js"
#include "tutte.js"
#include "ps.js"
#include "fullerenes.js"


var sel = (
    (process.argv.length > 2)
    ? process.argv[2]
    : "graphs/C30.a"
);
var G;

var do_pent = process.env.ARGV0.includes("pent");

var vtcs = [];
var edgs = [];
if (process.argv.length > 3) {
    process.argv[3].split(",").forEach(function(v) {
        vtcs.push(parseInt(v));
    });
}
if (process.argv.length > 4) {
    process.argv[4].split(",").forEach(function(e) {
        edgs.push(parseInt(e));
    });
}

function doi(x, dual) {
    var e;
    var L;

    L = parse2file(x);
    G = from_adjacency_list(L);

    assert.assert(is_embedding(G));

    if (dual) {
        G = dual_graph(G);
    }

    e = 0;

    doit(G, source(G, e), e);
}

function doit(G, v, e) {
    var slider = 100;
    var slider2 = 592;
    var size = slider2;
    var r = 12;
    var lmin = 99999;
    var lcur;
    var cx;
    var cy;
    var dx;
    var dy;
    var w;
    var coords;

    var visited = filled_array(n_edges(G), 2, false);
    var face = [];
    var pent = [];
    var tst;
    var spl;
    var last_face;
    var D;
    var col;
    var rgb = ["0 0 1", "0 1 0", "1 0 0", "0 1 1", "1 0.5 0", "0 0.5 1"];
    var scrx = ps.scrx;
    var scry = ps.scry;

    traverse_face(G, visited, v, e, ind(G, v, e), {next_vertex: function (v) {
        face.push(v);
    }});
    assert.assert(face.length > 0);

    coords = tutte.convex_face_coordinates(G, face, slider / 100.0);


    ps.header();
    ps.header2();

    ps.set_(size, r);


    forall_edges(G, function (e) {
        v = source(G, e);
        w = target(G, e);
        cx = scrx(coords[0][v]);
        cy = scry(coords[1][v]);
        dx = scrx(coords[0][w]);
        dy = scry(coords[1][w]);
        dx -= cx;
        dy -= cy;
        lcur = Math.sqrt(dx * dx + dy * dy);
        if (lcur < lmin) {
            lmin = lcur;
        }
    });
    if (lmin < 2 * r + 2) {
        r = lmin / 3;
        ps.set_(size, r);
    }


    if (do_pent) {
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
    } else {
        D = dual_graph(G);
        col = six_coloring(D);

        ps.fill_outer_face(face, coords, rgb[col[0]]);

        last_face = -1;
        planar_face_traversal(G, {begin_face: function () {
            last_face += 1;
            w = rgb[col[last_face]];
            if (last_face) {
                console.log(w + " setrgbcolor");
            }
        }, end_face: function () {
            if (last_face) {
                console.log('poly fill');
            }
        }, next_vertex: function (v) {
            if (last_face) {
                console.log(" " + frm(scrx(coords[0][v])) + " " + frm(scry(coords[1][v])));
            }
        }});
    }

    ps.straight_line_drawing(G, coords, pent, size, r, (
        (face.length === 5)
        ? face
        : []
    ), false, vtcs, edgs);


    last_face = -1;
    planar_face_traversal(G, {begin_face: function () {
        last_face += 1;
        cx = 0;
        cy = 0;
        w = 0;
    }, end_face: function () {
        if (last_face !== 0) {
            console.log('0 0 (' + last_face + ') ' + frm(cx / w) + ' ' + frm(cy / w) + ' txtdistdeg');
        }
    }, next_vertex: function (v) {
        cx += scrx(coords[0][v]);
        cy += scry(coords[1][v]);
        w += 1;
    }});


    console.log("showpage");
}

doi(sel, (process.argv.length > 3) && (process.argv[3] === "-dual"));

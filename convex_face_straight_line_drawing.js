"use strict";

var G;
var lookup = [];
var K4 = [[1, 3, 2], [2, 3, 0], [0, 3, 1], [0, 1, 2]];
var K4noemb = [[3, 1, 2], [2, 0, 3], [0, 3, 1], [0, 1, 2]];
var coords;

function scr(xy, length, r) {
    return length / 2 + (length / 2 - r) * xy;
}

function dist(v, evt, size, r) {
    return Math.sqrt((scr(coords[0][v], size, r) - evt.layerX)**2 + (scr(coords[1][v], size, r) - evt.layerY)**2);
}

function clck(e, evt, size, r) {
    if (dist(source(G, e), evt, size, r) < dist(target(G, e), evt, size, r)) {
        doit(G, source(G, e), e);
    } else {
        doit(G, target(G, e), e);
    }
}

function doi(x) {
    var e;

    G = from_adjacency_list(F[x]);
    //G = from_adjacency_list(K4noemb);

    assert.assert(is_embedding(G));

    e = (
        (n_edges(G) > 16)
        ? 16
        : any_edge(G)
    );

    doit(G, source(G, e), e);
}

function doit(F, v, e) {
    var slider = document.getElementById("myRange").value;
    var slider2 = document.getElementById("myRange2").value;
    var selInd = document.forms[0].elements[0].selectedIndex;
    var check = document.getElementById("myCheckbox").checked;
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

    var visited = linear.fill(n_edges(G), 2, false);
    var face = [];

    traverse_face(H, visited, v, e, ind(H, v, e), {next_vertex: function (v) {
        face.push(v);
    }});
    assert.assert(face.length > 0);

    coords = tutte.convex_face_coordinates(H, face, slider / 100.0);

    forall_edges(H, function (e) {
        v = source(H, e);
        w = target(H, e);
        cx = size / 2 + (size / 2 - r) * coords[0][v];
        cy = size / 2 + (size / 2 - r) * coords[1][v];
        dx = size / 2 + (size / 2 - r) * coords[0][w];
        dy = size / 2 + (size / 2 - r) * coords[1][w];
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

    pent = pentagons(H);
    if (face.length === 5) {
        tst = linear.fill(n_vertices(H), 1, false);
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

    htmlsvg.header(selInd, slider, slider2, "", check);

    htmlsvg.straight_line_drawing(H, coords, pent, size, r, (
        (face.length === 5)
        ? face
        : []
    ), check);
}

doi(0);

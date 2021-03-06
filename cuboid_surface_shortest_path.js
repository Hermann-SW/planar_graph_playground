"use strict";

var down = -1;
var G;

function clck(v) {
    if (down < 0) {
        down = v;
    } else {
        doit(G, down, v);
        down = -1;
    }
}

function doi(x) {
    x = x;
    G = {E: [[[0,0],[2,2]], [[0,1],[1,0]], [[0,2],[4,1]], [[1,1],[3,2]], [[1,2],[5,1]], [[2,0],[6,1]], [[2,1],[3,0]], [[3,1],[7,2]], [[4,0],[6,2]], [[4,2],[5,0]], [[5,2],[7,1]], [[6,0],[7,0]]],
         V: [[0,1,2], [1,3,4], [5,6,0], [6,7,3], [8,2,9], [9,4,10], [11,5,8], [11,10,7]]};
    doit(G, 0, 1);
}

function doit(G, v, e) {
    var slider = 100; // document.getElementById("myRange").value;
    var slider2 = document.getElementById("myRange2").value;
    var selInd = document.forms[0].elements[0].selectedIndex;
    var size = slider2;
    var r = 12;
    var coords;
    var s = [0.4, 0.1];
    var t = [0.9, 0.6];

    var visited = filled_array(n_edges(G), 2, false);
    var face = [];
    traverse_face(G, visited, v, e, ind(G, v, e), {next_vertex: function (v) {
        face.push(v);
    }});

    coords = tutte.convex_face_coordinates(G, face, slider / 100.0);

    forall_vertices(G, function (v) {
        var ang = 3 * Math.PI / 4;
        var nx = Math.cos(ang) * coords[0][v] - Math.sin(ang) * coords[1][v];
        var ny = Math.sin(ang) * coords[0][v] + Math.cos(ang) * coords[1][v];
        coords[0][v] = -nx;
        coords[1][v] = ny;
    });

    htmlsvg.header(selInd, slider, slider2, "hidden");

    htmlsvg.straight_line_drawing(G, coords, [s, t], size, r);
}

doi(0);

#include "assert.js"
#include "util.js"
#include "undirected_graph.js"
#include "ps.js"

var K4 = [[1, 3, 2], [2, 3, 0], [0, 3, 1], [0, 1, 2]];
var K4noemb = [[3, 1, 2], [2, 0, 3], [0, 3, 1], [1, 2, 0]];
var F = [K4, K4noemb];

var acoords = [[[0.9, 0, -0.9, 0], [-0.8, 0.9, -0.8, 0]], [[0.9, 0, -0.9, 0.8], [-0.8, 0.9, -0.8, 0]]];

function draw(x) {
    var coords = acoords[x];

    var G = from_adjacency_list(F[x]);

    var size = 592;
    var r = 12;
    var last_face;

    ps.set_(size, r);

    ps.straight_line_drawing(G, coords, [], size, r, [], false);


    last_face = -1;
    planar_face_traversal(G, {begin_face: function () {
        last_face += 1;
    }, next_vertex_edge: function (v, e) {
        var rgb = ["0 0 1", "0 1 0", "1 0 0", "0.5 0.5 1"];
        var w = opposite(G, v, e);
        var cx = (ps.scrx(coords[0][v]) + ps.scrx(coords[0][w])) / 2;
        var cy = (ps.scry(coords[1][v]) + ps.scry(coords[1][w])) / 2;
        var deg = ps.r2d(Math.atan2(coords[1][v] - coords[1][w], coords[0][w] - coords[0][v]));
        console.log("30 6 " + rgb[last_face % rgb.length] + " " + frm(deg) + " " + ps.frm(cx) + " " + ps.frm(cy) + " parrow");
    }});


    console.log("0 0 (is_embedding=" + is_embedding(G) + ",");
    console.log(" n_faces_planar=" + n_faces_planar(G) + ",");
    console.log(" traversed faces=" + (last_face + 1) + ") 300 20 txtdistdeg");
    console.log("0 0 (from_adjacency_list( " + JSON.stringify(F[x]) + " )) 300 570 txtdistdeg");

    console.log("showpage");
}

ps.header();
ps.header2();
draw(0);

console.log("2 99 translate");
console.log("newpath 0 0 moveto 591 0 lineto 591 591 lineto 0 591 lineto closepath stroke");
draw(1);

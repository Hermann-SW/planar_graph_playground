#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "undirected_graph.js"
#include "tutte.js"

var sel = (
    (process.argv.length > 2)
    ? process.argv[2]
    : "graphs/C20.a"
);
var L = parse2file(sel);
var G = from_adjacency_list(L);
var coords = filled_array(n_vertices(G), 3, -1);
var visited = filled_array(n_edges(G), 2, false);
var face = [];
var e = any_edge(G);
var v = source(G, e);
var coords2D;

function length_2D(x, y) {
    return Math.hypot(x, y);
}

function scale_3D(v, f) {
    return [f * v[0], f * v[1], f * v[2]];
}

function map_3D(x, y) {
    var a = Math.atan2(y, x);
    var l = 0.8 * Math.PI * Math.sqrt(length_2D(x, y));
    return [Math.sin(a) * Math.sin(l), Math.cos(a) * Math.sin(l), Math.cos(l)];
}

function straight_line_drawing_3D(G) {
    console.log("$fn = 25;");
    console.log("module edge(v,w) {");
    console.log("    w = w - v;");
    console.log("    translate(v)");
    console.log("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
    console.log("    cylinder(norm(w),0.1,0.1);");
    console.log("}");
    console.log("module vertex(v) { translate(v) sphere(0.5); }");

    forall_edges(G, function (e) {
        console.log("edge(", coords[source(G, e)], ",", coords[target(G, e)], ");");
    });

    forall_vertices(G, function (v) {
        console.log("vertex(", coords[v], ");");
    });
}


assert.assert(is_embedding(G));

traverse_face(G, visited, v, e, ind(G, v, e), {next_vertex: function (v) {
    face.push(v);
}});
assert.assert(face.length > 0);

coords2D = tutte.convex_face_coordinates(G, face, 1);


forall_vertices(G, function (v) {
    coords[v] = map_3D(coords2D[0][v], coords2D[1][v]);
});


forall_vertices(G, function (v) {
    coords[v] = scale_3D(coords[v], Math.sqrt(n_vertices(G)));
});

straight_line_drawing_3D(G);

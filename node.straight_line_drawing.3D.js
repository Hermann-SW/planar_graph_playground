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
var white = (process.argv.length > 3);
var L = parse2file(sel);
var G = from_adjacency_list(L);
var coords = filled_array(n_vertices(G), 3, -1);
var visited = filled_array(n_edges(G), 2, false);
var face = [];
var e = any_edge(G);
var v = source(G, e);
var coords2D;
var s;
var V;
var sum;
var nor;


function rad2deg(r) {
    return r / Math.PI * 180;
}

function length_2D(x, y) {
    return Math.hypot(x, y);
}

function length_3D(v) {
    return Math.hypot(v[0], v[1], v[2]);
}

function dist_3D(p, q) {
    return length_3D(sub_3D(p, q));
}

function add_3D(p, q) {
    return [p[0]+q[0],p[1]+q[1],p[2]+q[2]];
}

function sub_3D(p, q) {
    return [p[0]-q[0],p[1]-q[1],p[2]-q[2]];
}

function scale_3D(v, f) {
    return [f * v[0], f * v[1], f * v[2]];
}


function norm_3D(v) {
    return scale_3D(v, 1 / length_3D(v));
}

function map_3D(x, y) {
    var a = Math.atan2(y, x);
    var l = 0.9 * Math.PI * length_2D(x, y);
    return [Math.sin(a) * Math.sin(l), Math.cos(a) * Math.sin(l), Math.cos(l)];
}

function center_3D(p, q, r) {
    return [(p[0]+q[0]+r[0])/3,(p[1]+q[1]+r[1])/3,(p[2]+q[2]+r[2])/3];
}

function straight_line_drawing_3D(G) {
    console.log("$fn = 25;");
    console.log("$vpt = [0,0,0];");
    console.log("module edge(v,w) {");
    console.log("    w = w - v;");
    console.log("    translate(v)");
    console.log("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
    console.log("    cylinder(norm(w),0.1,0.1);");
    console.log("}");
    console.log("module vertex(v, c) { color(c) translate(v) sphere(0.5); }");

    forall_edges(G, function (e) {
        console.log("edge(", coords[source(G, e)], ",", coords[target(G, e)], ");");
    });

    forall_vertices(G, function (v) {
        console.log("vertex(", coords[v], ",", (v==V) ? [1,0,0] : [0,1,0], ");");
    });

    if (white) {
        console.log("color([1,1,1]) translate([0,0,0]) sphere(", Math.sqrt(n_vertices(G)) - 1, ");");
    }
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

sum = filled_array(n_vertices(G), 1, [0,0,0]);
nor = filled_array(n_vertices(G), 1, [0,0,0]);

forall_vertices(G, function (v) {
    var visited = filled_array(n_edges(G), 2, false);
    var face = [];
    forall_incident_edges(G, v, function(e) {
        traverse_face(G, visited, v, e, ind(G, v, e), {next_vertex: function (w) {
            if (v !== w) {
                face.push(w);
            }
        }});
    });
    face.forEach(function (x) {
        sum[v] = add_3D(sum[v], coords[x]);
    });
    nor[v] = norm_3D(sum[v]);
});

V = 0;
forall_vertices(G, function (v) {
    if (dist_3D(nor[V], coords[V]) < dist_3D(nor[v], coords[v])) {
        V = v;
    }
});

console.log("$vpr = [",-rad2deg(Math.acos(coords[V][2])),",0,",
                       -rad2deg(Math.atan2(coords[V][0], coords[V][1])),"];");

coords[V] = nor[V];

forall_vertices(G, function (v) {
    coords[v] = scale_3D(coords[v], Math.sqrt(n_vertices(G)));
});

straight_line_drawing_3D(G);

#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "undirected_graph.js"
#include "tutte.js"


var fs = require("fs");

var sel = (
    (process.argv.length > 2)
    ? process.argv[2]
    : "graphs/C20.a"
);
var white = (process.argv.length > 3);
var L = parse2file(sel);
var G = from_adjacency_list(L);
var coords = filled_array(n_vertices(G), 3, -1);
var face = [];
var e = any_edge(G);
var v = source(G, e);
var coords2D;
var s;
var V;
var sum;
var nor;
var bucket = Array.from(Array(2001), function() {return [];});
var bucketm = -1;
var writer;
var old;

function out(x) {
    return (typeof(x) === 'object') ? JSON.stringify(x) : x;
}

function wlog(...s) {
    writer.write(out(s[0]));
    for(var i=1; i<s.length; ++i) {
        writer.write(" " + out(s[i]));
    }
    writer.write("\n");
}

function wait(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

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

function buc(d) {
    return Math.floor(d * 1000);
}

function straight_line_drawing_3D(G, sc) {
    wlog("$fn = 25;");
    wlog("$vpt = [0,0,0];");
    wlog("module edge(v,w) {");
    wlog("    w = w - v;");
    wlog("    translate(v)");
    wlog("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
    wlog("    cylinder(norm(w),0.1,0.1);");
    wlog("}");
    wlog("module vertex(v, c) { color(c) translate(v) sphere(0.5); }");

    forall_edges(G, function (e) {
        wlog("edge(", scale_3D(coords[source(G, e)], sc), ",", scale_3D(coords[target(G, e)], sc), ");");
    });

    forall_vertices(G, function (v) {
        wlog("vertex(", scale_3D(coords[v], sc), ",", (v==V) ? [1,0,0] : [0,1,0], ");");
    });

    if (white) {
        wlog("color([1,1,1]) translate([0,0,0]) sphere(", sc - 1, ");");
    }
}


assert.assert(is_embedding(G));

face = face_vertices(G, v, e);
assert.assert(face.length > 0);

coords2D = tutte.convex_face_coordinates(G, face, 1);


forall_vertices(G, function (v) {
    coords[v] = map_3D(coords2D[0][v], coords2D[1][v]);
});

sum = filled_array(n_vertices(G), 1, [0,0,0]);
nor = filled_array(n_vertices(G), 1, [0,0,0]);

forall_vertices(G, function (v) {
    var face = [];
    forall_incident_edges(G, v, function(e) {
        face = face.concat(face_vertices(G, v, e));
    });
    face.forEach(function (x) {
        if (x !== v) {
            sum[v] = add_3D(sum[v], coords[x]);
        }
    });
    nor[v] = norm_3D(sum[v]);
});

forall_vertices(G, function (v) {
    var b = buc(dist_3D(nor[v], coords[v]));
    bucket[b].push(v);
    if (b > bucketm) {
        bucketm = b;
    }
});

        writer = fs.createWriteStream('x.scad') 

        V = bucket[bucketm].pop();

        wlog("$vpr = [",-rad2deg(Math.acos(coords[V][2])),",0,",
                        -rad2deg(Math.atan2(coords[V][0], coords[V][1])),"];");
        straight_line_drawing_3D(G, Math.sqrt(n_vertices(G)));

        writer.close();

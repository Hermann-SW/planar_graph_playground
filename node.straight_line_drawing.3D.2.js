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
var sca = (
    (process.argv.length > 3)
    ? parseFloat(process.argv[3])
    : 3
);
var blue = (process.argv.length > 4) && process.argv[4].includes("b");

var white = (process.argv.length > 4) && process.argv[4].includes("w");

var esel = (process.argv.length > 5) ? parseInt(process.argv[5]) : -1;

var L = parse2file(sel);
var G = from_adjacency_list(L);
var coords = filled_array(n_vertices(G), 3, -1);
var face = [];
var e = any_edge(G);
var v = source(G, e);
var coords2D;
var coordsb;
var ecoords;
var SC = 10;
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

function mul_3D(p, q) {
    return [p[0]*q[0],p[1]*q[1],p[2]*q[2]];
}

function dot_3D(p, q) {
    return p[0]*q[0]+p[1]*q[1]+p[2]*q[2];
}

function scale_3D(v, f) {
    return [f * v[0], f * v[1], f * v[2]];
}


function norm_3D(v) {
    return scale_3D(v, 1 / length_3D(v));
}

function cross_3D(v, w) {
    return [v[1]*w[2]-v[2]*w[1], v[2]*w[0]-v[0]*w[2], v[0]*w[1]-v[1]*w[0]];
}

function angle_3D(v) {
    s = (dot_3D([0,1,0], v) < 0) ? -1 : 1;
    return s * Math.acos(dot_3D(norm_3D(v), [1,0,0]));;
}

function plane_3D(u, v, w) {
    var n = norm_3D(cross_3D(sub_3D(v, u), sub_3D(w, u)));
    n.push(dot_3D(u, n));
    return n;
}

function map_3D(x, y) {
    var a = Math.atan2(y, x);
    var l = sca*length_2D(x, y);
    var X = l -l*(l*l/(4+l*l));
    var Y = 2*(l*l/(4+l*l))- 1;
    return [Math.cos(a) * X, Math.sin(a) * X, Y];
}

function center_3D(p, q, r) {
    return [(p[0]+q[0]+r[0])/3,(p[1]+q[1]+r[1])/3,(p[2]+q[2]+r[2])/3];
}

function buc(d) {
    return Math.floor(d * 1000);
}

function rotZ(v, a) {
    return [v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]];
}

function rotY(v, a) {
   return [v[0]*Math.cos(a)-v[2]*Math.sin(a),v[1],v[0]*Math.sin(a)+v[2]*Math.cos(a)];
}

function straight_line_drawing_3D(G, sc) {
    wlog("$fn = 25;");
    wlog("$vpt = [0,0,0];");
    wlog("sc_ = ", sc, ";");
    wlog("module edge(v,w) {");
    wlog("    w = w - v;");
    wlog("    translate(v)");
    wlog("    rotate([0, acos(w[2]/norm(w)), atan2(w[1], w[0])])");
    wlog("    cylinder(norm(w),0.1,0.1);");
    wlog("}");
    wlog("function cart2pol(p) = [atan2(p[1],p[0]), acos(p[2]/sc_)];");
    wlog("function cart2pol2(p) = [atan2(p[1],p[0]), acos(p[2]/norm(p))];");
    wlog("function dot3D(v,w) = v[0]*w[0]+v[1]*w[1]+v[2]*w[2];");
    wlog("function angle(v,w,c) = acos(dot3D((v-c)/norm(v-c),(w-c)/norm(w-c)));");
    wlog("function rotZ(v, a) = [v[0]*cos(a)-v[1]*sin(a),v[0]*sin(a)+v[1]*cos(a),v[2]];");
    wlog("function rotY(v, a) = [v[0]*cos(a)-v[2]*sin(a),v[1],v[0]*sin(a)+v[2]*cos(a)];");
    wlog("function rotX(v, a) = [v[0],v[1]*cos(a)-v[2]*sin(a),v[1]*sin(a)+v[2]*cos(a)];");
    wlog("function cross3D(v,w) = [v[1]*w[2]-v[2]*w[1], v[2]*w[0]-v[0]*w[2], v[0]*w[1]-v[1]*w[0]];");
    wlog("module edge3(v,w,c) {");
    wlog("    echo(\"angle \",angle(v,w,c));");
    wlog("    p = cart2pol2(c);");
    wlog("    r = norm(c  - v);");
    wlog("    u = rotZ(rotY([1,0,0],-p[1]),p[0]);");
    wlog("    d = rotZ(rotY([0,1,0],-p[1]),p[0]);");
    wlog("    translate(c)");
    wlog("    rotate([0,0,p[0]])");
    wlog("    rotate([0,p[1],0])");
    wlog("    {");
    wlog("    rotate([0,0,30])");
//    wlog("    rotate([0,0,angle(u,v,c)]);");
    wlog("    rotate_extrude(angle=angle(v,w,c), convexity=10, $fn=100)");
    wlog("    translate([r, 0, 0])");
    wlog("    circle(r=0.1, $fn=100);");
    wlog("    }");
//    wlog("    edge(c,c+r*u);");
//    wlog("    edge(c,c+r*d);");
    wlog("}");
        wlog("module edge2(_p1,_p2,_e) {");
        wlog("    p1 = cart2pol(_p1);");
        wlog("    p2 = cart2pol(_p2);");
        wlog("    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course");
        wlog("    la1 = p1[0];");
        wlog("    la2 = p2[0];");
        wlog("    l12 = la2 - la1;");
        wlog("    ph1 = 90 - p1[1];");
        wlog("    ph2 = 90 - p2[1];");
        wlog("    al1 = atan2(cos(ph2)*sin(l12), cos(ph1)*sin(ph2)-sin(ph1)*cos(ph2)*cos(l12));");
        wlog("    // delta sigma_12");
        wlog("    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae");
        wlog("    s12 = acos(sin(ph1)*sin(ph2)+cos(ph1)*cos(ph2)*cos(l12));");
        wlog("    translate([0, 0, 0]) rotate([0, 0, la1]) rotate([0, -ph1, 0])");
        wlog("      rotate([90 - al1, 0, 0])");
        wlog("        color([0,0,1])");
        wlog("          rotate_extrude(angle=s12, convexity=10, $fn=100)");
        wlog("            translate([sc_, 0]) circle(0.1, $fn=25);");
        wlog("}");
    wlog("module vertex(v, c) { color(c) translate(v) sphere(0.5); }");

    forall_edges(G, function (e) {
      if (e==esel) {
            var M = scale_3D(ecoords[e], sc);
            var V = scale_3D(coords[source(G, e)], sc);
            var W = scale_3D(coords[target(G, e)], sc);
            var pla = plane_3D(M, V, W);
	    var C = scale_3D(pla, pla[3]);
        wlog("color([0.7,0.7,0.7]) edge3(", W, ",", V, ",", C, ");");
        wlog("color([1,1,1]) translate(", C, ") sphere(0.3);");
      }
      else
        wlog("edge2(", scale_3D(coords[source(G, e)], sc), ",", scale_3D(coords[target(G, e)], sc), ");");
    });

    forall_vertices(G, function (v) {
        wlog("vertex(", scale_3D(coords[v], sc), ",", (v==V) ? [1,0,0] : [0,1,0], ");");
    });

    forall_edges(G, function (e) {
        wlog("color(", e==esel ? [0.7,0.7,0.7] : [0,0,0], ") edge([", coords2D[0][source(G, e)]*sc*sca,",",coords2D[1][source(G, e)]*sc*sca,",",-sc, "],[", coords2D[0][target(G, e)]*sc*sca,",",coords2D[1][target(G,e)]*sc*sca,",",-sc, "]);");
	if (e == esel) {
	    var m = [(coords2D[0][source(G, e)] + coords2D[0][target(G, e)])/2,
	             (coords2D[1][source(G, e)] + coords2D[1][target(G, e)])/2];
            wlog("vertex(", scale_3D(map_3D(m[0], m[1]), sc), ",[0.7,0.7,0.7]);");
            wlog("vertex([", m[0]*sc*sca, ",", m[1]*sc*sca, ",", -sc, "],[0.7,0.7,0.7]);");
	        m = [(2*coords2D[0][source(G, e)] + coords2D[0][target(G, e)])/3,
	             (2*coords2D[1][source(G, e)] + coords2D[1][target(G, e)])/3];
            wlog("vertex(", scale_3D(map_3D(m[0], m[1]), sc), ",[0.7,0.7,0.7]);");
            wlog("vertex([", m[0]*sc*sca, ",", m[1]*sc*sca, ",", -sc, "],[0.7,0.7,0.7]);");
	        m = [(coords2D[0][source(G, e)] + 2*coords2D[0][target(G, e)])/3,
	             (coords2D[1][source(G, e)] + 2*coords2D[1][target(G, e)])/3];
            wlog("vertex(", scale_3D(map_3D(m[0], m[1]), sc), ",[0.7,0.7,0.7]);");
            wlog("vertex([", m[0]*sc*sca, ",", m[1]*sc*sca, ",", -sc, "],[0.7,0.7,0.7]);");
	        m = [(coords2D[0][source(G, e)] + 3*coords2D[0][target(G, e)])/4,
	             (coords2D[1][source(G, e)] + 3*coords2D[1][target(G, e)])/4];
            wlog("vertex(", scale_3D(map_3D(m[0], m[1]), sc), ",[0.7,0.7,0.7]);");
            wlog("vertex([", m[0]*sc*sca, ",", m[1]*sc*sca, ",", -sc, "],[0.7,0.7,0.7]);");
	        m = [(1*coords2D[0][source(G, e)] + 0*coords2D[0][target(G, e)])/1,
	             (1*coords2D[1][source(G, e)] + 0*coords2D[1][target(G, e)])/1];
            wlog("vertex(", scale_3D(map_3D(m[0], m[1]), sc), ",[0.7,0.7,0.7]);");
	        m = [(0*coords2D[0][source(G, e)] + 1*coords2D[0][target(G, e)])/1,
	             (0*coords2D[1][source(G, e)] + 1*coords2D[1][target(G, e)])/1];
            wlog("vertex(", scale_3D(map_3D(m[0], m[1]), sc), ",[0.7,0.7,0.7]);");

	        m = [(coords2D[0][source(G, e)] + coords2D[0][target(G, e)])/2,
	             (coords2D[1][source(G, e)] + coords2D[1][target(G, e)])/2];
            var M = scale_3D(map_3D(m[0], m[1]), sc);
            var V = scale_3D(map_3D(coords2D[0][source(G, e)], coords2D[1][source(G, e)]), sc);
            var W = scale_3D(map_3D(coords2D[0][target(G, e)], coords2D[1][target(G, e)]), sc);
            var pla = plane_3D(M, V, W);
	    var C = scale_3D(pla, pla[3]);
//            wlog("color([250/255,165/255,0]) edge3(", V, ",", W, ",", C, ");");
	}
    });

    forall_vertices(G, function (v) {
        var cent = [0, 0, 0];
        forall_incident_edges(G, v, function(e) {
            var w = opposite(G, v, e);
	    cent = add_3D(cent, coords[w]);
        });
        cent = norm_3D(cent);
        // console.log(v,": ",coords[v],", ",cent);
        coordsb[v] = cent;
        cent = scale_3D(cent, sc);
        if (blue) wlog("vertex(", cent,",",[0,0,1],");");
    });

    if (white) {
        wlog("color([1,1,1]) translate([0,0,0]) sphere(", sc - 1, ", $fn=360 );");
    }
}


assert.assert(is_embedding(G));

face = face_vertices(G, v, e);
assert.assert(face.length > 0);

coords2D = tutte.convex_face_coordinates(G, face, 1);
coordsb = filled_array(n_vertices(G), 1, [0,0,0]);


forall_vertices(G, function (v) {
    coords[v] = map_3D(coords2D[0][v], coords2D[1][v]);
});

ecoords = filled_array(n_edges(G), 1, [0,0]);

forall_edges(G, function (e) {
    v = coords2D[source(G, e)];
    var w = coords2D[target(G, e)];
    ecoords[e] = map_3D((coords2D[0][source(G, e)] + coords2D[0][target(G, e)])/2,
	                (coords2D[1][source(G, e)] + coords2D[1][target(G, e)])/2);
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

V = bucket[bucketm].pop();


async function amain() {
    var ms = 1000;
    var fastforward = 0;

    for(var i=0;i<1;++i) {
        writer = fs.createWriteStream('x.scad') 

        wlog("// $vpr = [",-rad2deg(Math.acos(coords[V][2])),",0,",
                        -rad2deg(Math.atan2(coords[V][0], coords[V][1])),"];");
        wlog("$vpr = [90,0,10*"+i+"];");
        //wlog("$vpr = [45,0,22.5];");
        straight_line_drawing_3D(G, SC); //Math.sqrt(n_vertices(G)));

        writer.close();

        if (i>=fastforward)  await wait(ms);

        forall_vertices(G, function (v) {
            coords[v] = coordsb[v];
        });
    }
}

amain();

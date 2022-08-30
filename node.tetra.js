// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "gauss-jordan.js"
#include "tutte.js"
#include "undirected_graph.js"

#ifdef JSCAD_
if (process === undefined) {
    var process = { "argv": [ "", "", "3", "white", "-11" ], "exit": function(){} };
}

var graphs = [
#include "graphs/C20.a"
,
#include "graphs/C36.10.a"
,
#include "graphs/C36.14.r.a"
,
#include "graphs/C60.a"
];
#else
#ifndef JSCAD
#include "scad.js"
#else
#include "jscad.js"
#endif
#endif

var coords;
var coords2;
var coords3;

var white = (process.argv.length > 3);
var sele = (process.argv.length > 4) ? parseInt(process.argv[4]) : -1;
var vtype = false;
var dopent = (sele === -3) || (sele === -5) || (sele === -10);
var do6col = (sele === -11);
var vhalf = (sele < -5);
var half0 = true;
var dothe = false;
var dophi = false;
if ((sele === -10) || (sele === -11)) {
    vtype = true;
    sele = -1;
    half0 = false;
    dopent = true;
}
if (sele === -12) {
    vtype = false;
    sele = -1;
    half0 = true;
    dopent = true;
    dothe=true;
}
if (sele === -13) {
    vtype = false;
    sele = -1;
    half0 = true;
    dopent = true;
    dophi=true;
}
var no_e21 = (sele === -9);
var dotxt = (sele === -4) || (sele === -5) || (sele < -6);
var Mc20 = [];
if (sele === -8)  Mc20 = [10, 2, 1, 0];
if (sele === -9)  Mc20 = [0, 11, 13, 2];
if (sele < 0) {
    sele = -1;
}

#ifndef JSCAD_
#ifndef JSCAD
function tetra(G, M, sc = 1, visited, pent, col = []) {
    var pal = [ [0.9, 0.0, 0], [0, 0.7, 0.7], [0, 0.9, 0], [0.7, 0, 0.7], [0, 0, 0.9], [0.7, 0.7, 0] ]
    console.log("pal:", pal)

    scad.open();
    scad.wlog("look_inside=false;");
    scad.header(coords, sc);
    scad.header2();

    scad.wlog("module cut(li){");
    scad.wlog("   difference(){");
    scad.wlog("      children();");
    scad.wlog("      if (li) { translate([0,0,0]) color([0,0,0]) cube([sc+0.1,sc+0.1,sc+0.1]); }");
    scad.wlog("   }");
    scad.wlog("}");

    scad.wlog("rotate([0,-$t*360,0]) union(){");

    console.log("M.length:", M.length);

    var Ms = [M[0], M[1], M[2], M[3]];
    forall_vertices(G, function(v) {
	if (Ms.includes(v)) {
	    scad.wlog("color([1, 0, 0])");
	}
        scad.wlog( "vertex(", v, ",", vhalf && ((vtype[v] !== 0) || half0), ");");
        if (dothe) {
            scad.wlog("vtxt(", v, ",", (coords[v][1]/Math.PI*180).toFixed(1), ");");
        }
	else if (dophi) {
            scad.wlog("vtxt(", v, ",", (coords[v][0]/Math.PI*180).toFixed(1), ");");
        }
	else if (dotxt) {
            scad.wlog("vtxt(", v, ",", v, ");");
        }
    });

    forall_edges(G, function(e) {
        if (!no_e21 || (e !== 21)) {
            if (evisited[e]) { scad.wlog("color([1,0.66666,0])"); }
            scad.wlog("edge2(", source(G, e), ",", target(G, e), ",", e, ");");
        }
    });

    if (vtype.length > 0) {
        forall_vertices(G, function(v) {
            scad.wlog("vtxt(", v, ",", vtype[v], ");");
        });
    }

    pent.forEach(function(face) {
        scad.wlog("echo(",face,");");

        scad.wlog("cut(look_inside) {");
	scad.wlog("  sp_tria(", face[0], ",", face[1], ",", face[2], ");");
        scad.wlog("  sp_tria(", face[0], ",", face[2], ",", face[3], ");");
        scad.wlog("  sp_tria(", face[0], ",", face[3], ",", face[4], ");");
        scad.wlog("}");
    });

    if (col.length !== 0) {
        faces(G).forEach(function(face, i) {
            console.log(face, i, col[i])
            while (face.length >= 3) {
                scad.wlog("cut(look_inside) color(", pal[col[i]], ") sp_tria(", face[0],",", face[face.length-2], ",", face[face.length-1], ");");
                face.pop()
            }
        })
    }

    if (white) {
        var alpha = parseInt((process.argv[3] + ".100").substring(6)) / 100;
        scad.wlog("cut(look_inside) difference(){");
        scad.wlog("  color([1,1,1,", alpha, "]) translate([0,0,0]) sphere(sc, $fn=180);");
        scad.wlog("  color([1,1,1,", alpha, "]) translate([0,0,0]) sphere(sc-0.1, $fn=180);");
        scad.wlog("}");
    }

    scad.wlog("}");

    scad.close();
}
#else
function tetra(G, M, sc = 1, visited, pent, col = []) {
    scad.open();
    scad.header(coords, sc);
    scad.header2();

    scad.wlog("function main(params) {");
    scad.wlog("    sub = [cube({size: (params.look_inside === 'yes')?sc+0.1:0.01, center: [sc/2,-sc/2,sc/2]})]");

    var pal = [ [0.7, 0.0, 0], [0, 0.4, 0.4], [0, 0.7, 0], [0.4, 0, 0.4], [0, 0, 0.7], [0.4, 0.4, 0] ]

    scad.wlog("pentagons = (params.faces !== 'Pentagons') ? [] : [[]");
    pent.forEach(function(face) {
        console.log(face);

	scad.wlog(",sp_tria(", face[0], ",", face[1], ",", face[2], ", sub)");
        scad.wlog(",sp_tria(", face[0], ",", face[2], ",", face[3], ", sub)");
        scad.wlog(",sp_tria(", face[0], ",", face[3], ",", face[4], ", sub)");
    });
    scad.wlog("]");

    scad.wlog("sixcol = (params.faces !== '6coloring') ? [] : [[]");
    faces(G).forEach(function(face, i) {
        console.log(face, i, col[i])
        while (face.length >= 3) {
            scad.wlog(", colorize(", pal[col[i]], ", sp_tria(", face[0],",", face[face.length-2], ",", face[face.length-1], ", sub))");
            face.pop()
        }
    })
    scad.wlog("]");

    scad.wlog("white = (!params.white) ? [] : [[]");
    scad.wlog(", colorize([1,1,1],");
    scad.wlog("      subtract(");
    scad.wlog("          sphere({radius: sc, segments: 30})");
    scad.wlog("          ,sphere({radius: sc-0.1, segments: 30})");
    scad.wlog("          ,sub ");
    scad.wlog("      )");
    scad.wlog("  )");
    scad.wlog("]");

    scad.wlog_("vtype = [");
    forall_vertices(G, function(v) {
	scad.wlog_(v>0 ? "," : " ");
	scad.wlog("[", v, ",", vtype[v].toString(), ", coords[", v, "][1].toFixed(1), coords[", v, "][0].toFixed(1)]");
    });
    scad.wlog("]");

    scad.wlog("tvtxt = (params.vtxt === 'Type') ? 1 : (params.vtxt === 'theta') ? 2 : (params.vtxt === 'phi') ? 3 : 0");

    if (vtype.length > 0) {
	scad.wlog("vtxts = (params.vtxt === 'None') ? [] : [");
        forall_vertices(G, function(v) {
	    scad.wlog_(v>0 ? "," : " ");
            scad.wlog("vtxt(", v, ", vtype[", v, "][tvtxt])");
        });
        scad.wlog("]");
    }

    scad.wlog("    return[");


    console.log("M.length:", M.length);

    var Ms = [M[0], M[1], M[2], M[3]];
    forall_vertices(G, function(v) {
	scad.wlog_(",");
	if (Ms.includes(v)) {
	    scad.wlog_("colorize([0.7, 0, 0], ");
	}
        scad.wlog_("vertex(", v, ", params.half && ((tvtxt !== 1) || (vtype[", v, "][1] !== 0)))");
	if (Ms.includes(v)) {
	    scad.wlog(")");
	} else {
	    scad.wlog("");
	}
    });

    forall_edges(G, function(e) {
        if (!no_e21 || (e !== 21)) {
	    scad.wlog_(",");
            if (evisited[e]) { scad.wlog_("colorize([1,0.66666,0],"); }
            scad.wlog_("edge2(", source(G, e), ",", target(G, e), ",", e, ")");
            if (evisited[e]) { scad.wlog(")"); } else { scad.wlog(""); }
        }
    });

    scad.wlog(",pentagons");
    scad.wlog(",sixcol");
    scad.wlog(",white");
    scad.wlog(",vtxts");

    scad.wlog("] }");
    scad.wlog("module.exports = { main, getParameterDefinitions }");

    scad.close();
}
#endif
#else
#include "jscad_.js"

#endif

function ok(a,b,c,d,e,f) {
    var m = Math.max(a, b, c, d, e, f);
    return (((m - a) <= 1) && ((m - b) <= 1) && ((m - c) <= 1) &&
            ((m - d) <= 1) && ((m - e) <= 1) && ((m - f) <= 1));
}

assert.assert(process.argv.length > 2, "less than two args");

#ifndef JSCAD_
var adj = parse2file(process.argv[2]);
#else
var gnum = -1;
if (gname === "graphs/C20.a")  { gnum = 0; }
if (gname === "graphs/C36.10.a")  { gnum = 1; }
if (gname === "graphs/C36.14.r.a")  { gnum = 2; }
if (gname === "graphs/C60.a")  { gnum = 3; }
console.log("gname:", gname)
console.log("gnum:", gnum)
assert.assert(gnum !== -1, "graph selected not incorporated");
var adj = graphs[parseInt(gnum)];
#endif

var G = from_adjacency_list(adj);

assert.assert(is_embedding(G), "no embedding");

var pent = pentagons(G);
console.log(pent.length + " pentagons for graph");
console.log(n_faces_planar(G) - pent.length + " non-pentagons for graph");

var col = [];
if (do6col) {
    var D = dual_graph(G);
    col = six_coloring(D);
    var ma = -1;
    col.forEach(function (c) {
        if (c > ma)  { ma = c; }
    });
    console.log(ma+1, "colors used");
#if !defined(JSCAD) && !defined(JSCAD_)
    pent = [];
#endif
}
var dist;
var next;
[dist, next] = floyd_warshall_path(G);

var max = 0;
var M = [0,0,0,0];
var i;
var j;

forall_vertices(G, function(a) {
    forall_vertices_after(G, a, function(b) {
        forall_vertices_after(G, b, function(c) {
            forall_vertices_after(G, c, function(d) {
                if (dist[a][b] + dist[a][c] + dist[a][d] +
                    dist[b][c] + dist[b][d] + dist[c][d] > max) {
                    if (ok(dist[a][b], dist[a][c], dist[a][d],
                           dist[b][c], dist[b][d], dist[c][d])) {

                        max = dist[a][b] + dist[a][c] + dist[a][d] +
                              dist[b][c] + dist[b][d] + dist[c][d];
                        M = [a, b, c, d];
                    }
                }
            });
        });
    });
});

if (Mc20.length > 0)  M = Mc20;

console.log("vertices:", String(M));
console.log("max:", max);
console.log("dists:", dist[M[0]][M[1]], dist[M[0]][M[2]], dist[M[0]][M[3]],
                      dist[M[1]][M[2]], dist[M[1]][M[3]], dist[M[2]][M[3]]);

for(i=0; i<4; i=i+1) {
    for(j=i+1; j<4; j=j+1) {
        if (new Set(fw_path(G, next, M[i], M[j]).concat(fw_path(G, next, M[j], M[i]))).size !== dist[M[i]][M[j]]) {
            console.log("edges2:", fw_path(G, next, M[i], M[j]), fw_path(G, next, M[j], M[i]));
            process.exit(1);
        }
    }
}

function mark(G, visited, evisited, v, w) {
    var e;
    var o;
    var dp = (coords[w][0] - coords[v][0]) / (dist[v][w]);
    var dt = (coords[w][1] - coords[v][1]) / (dist[v][w]);
    e = next[v][w];
    while (v != w) {
        evisited[e] = true;
        o = v;
        v = opposite(G, v, e);
        e = next[v][w];
        assert.assert(!visited[v], "mark, visited");
        visited[v] = true;
        if (v != w) {
            coords[v][0] = coords[o][0]+dp;
            coords[v][1] = coords[o][1]+dt;
            M.push(v);
        }
    }
}

function mark2(G, visited, evisited, v, w) {
    var e;
    var dir = v < w;
    var o;
    var dp = 0;
    var dt = -2 * coords[w][1] / (dist[v][w]);
    if (coords[w][1] > Math.PI/2) {
        dt = 2 * (Math.PI - coords[w][1]) / dist[v][w];
    }
    e = next[v][w];
    while (v != w) {
        evisited[e] = true;
        o = v;
        v = opposite(G, v, e);
        e = next[v][w];
        if (v != w) {
            coords[v][0] = coords[o][0];
            coords[v][1] = coords[o][1] + dt;
            if (coords[v][1] < 0 || coords[v][1] > Math.PI) {
                coords[v][0] = coords[v][0] < Math.PI ? coords[v][0] + Math.PI : coords[o][0] - Math.PI;
                if (coords[o][1] !== 0 && coords[o][1] !== Math.PI) {
		    coords[v][1] = coords[o][1];
		} else {
		    coords[v][1] = coords[v][1] - 2*dt;
		}
                break;
            }
            if (dir && (coords[v][1] === 0 || coords[v][1] === Math.PI)) {
                break;
            }
            M.push(v);
            assert.assert(!visited[v], "mark2, visited");
            visited[v] = true;
        }
    }
}

function rmark2(G, visited, evisited, v, w) {
    var e;
    e = next[v][w];
    while (v != w) {
	console.log(v, (coords[v][0]/Math.PI*180).toFixed(1), (coords[v][1]/Math.PI*180).toFixed(1), visited[v], evisited[e]);
        v = opposite(G, v, e);
        e = next[v][w];
    }
    console.log(v, (coords[v][0]/Math.PI*180).toFixed(1), (coords[v][1]/Math.PI*180).toFixed(1), visited[v]);
}

function srch(G, visited, evisited, v) {
    if (!visited[v]) {
        visited[v] = true;
        forall_incident_edges(G, v, function(e) {
            evisited[e] = true;
            srch(G, visited, evisited, opposite(G, v, e));
        });
    }
}

function esrch(G, visited, evisited, v, w) {
    do {
        var e = next[v][w];
        var f = next_incident_edge(G, v, e);
        if (!evisited[f]) {
            var x = opposite(G, v, f);
            evisited[f] = true;
            if (!visited[x]) {
                srch(G, visited, evisited, x);
//                break;
            }
        }
        v = opposite(G, v, e);
    } while (v !== w);
}

coords = filled_array(n_vertices(G), 2, -1);

var visited;
var evisited;

function doit(side) {
    coords[M[0]] = [3*Math.PI/2, Math.acos(+Math.sqrt(1/3))];
    coords[M[1]] = [  Math.PI/2, Math.acos(+Math.sqrt(1/3))];

    visited = filled_array(n_vertices(G), 1, false);
    evisited = filled_array(n_edges(G), 1, false);

    var e;
    var orient;
    e = next_incident_edge(G, M[3], next[M[3]][M[2]]);
    while ((e !== next[M[3]][M[1]]) && (e !== next[M[3]][M[0]])) {
        e = next_incident_edge(G, M[3], e);
    }
    orient = (e === next[M[3]][M[1]]);

    console.log(orient);
    assert.assert(orient === false, "doit, wrong orient"); // for now

    coords[M[3]] = [    Math.PI, Math.acos(-Math.sqrt(1/3))];
    coords[M[2]] = [          0, Math.acos(-Math.sqrt(1/3))];

    mark2(G, visited, evisited, M[2], M[3]);
    mark2(G, visited, evisited, M[3], M[2]);
//    rmark2(G, visited, evisited, M[2], M[3]);

    mark(G, visited, evisited, M[2], M[1]);
    assert.assert(!visited[M[3]], "doit, visited M[3]");
    visited[M[3]] = true;

    mark(G, visited, evisited, M[3], M[0]);
    mark2(G, visited, evisited, M[0], M[1]);
    mark2(G, visited, evisited, M[1], M[0]);
//    rmark2(G, visited, evisited, M[0], M[1]);

    assert.assert(visited[M[2]] === false, "doit, visited M[2]");
//    coords[M[2]] = [2*Math.PI, Math.acos(-Math.sqrt(1/3))];

    visited[M[2]] = true;


    if (side){
        esrch(G, visited, evisited, M[3], M[0]);
        esrch(G, visited, evisited, M[0], M[1]);

        esrch(G, visited, evisited, M[1], M[2]);
        esrch(G, visited, evisited, M[2], M[3]);
    } else {
        forall_vertices(G, function(v) {
            if (coords[v][0] < Math.PI) {
                coords[v][0] = coords[v][0] + 2 * Math.PI;
            }
        });

        esrch(G, visited, evisited, M[0], M[3]);
        esrch(G, visited, evisited, M[3], M[2]);

        esrch(G, visited, evisited, M[2], M[1]);
        esrch(G, visited, evisited, M[1], M[0]);
    }

    forall_vertices(G, function(v) {
        if (!visited[v]) {
            coords[v][0] = 4 * Math.PI;
            coords[v][1] = Math.PI / 2;
            M.push(v);
        }
    });

    return tutte.convex_face_coordinates(G, M, coords);
}

var first = true;
coords2 = doit(first);
var evisited_ = evisited;
M = M.slice(0,4);
coords3 = doit(!first);

console.log("vertices:", String(M));

vtype = vtype ? filled_array(n_vertices(G), 1, 0) : [];

forall_vertices(G, function(v) {
    if (coords2[0][v] == 4 * Math.PI) {
        coords[v][0] = coords3[0][v];
        coords[v][1] = coords3[1][v];
        if (vtype.length > 0)  vtype[v] = 2;
    } else {
        coords[v][0] = coords2[0][v];
        coords[v][1] = coords2[1][v];
        if (vtype.length > 0)  vtype[v] = 1;
    }
});

forall_edges(G, function(e) {
    evisited[e] = (evisited[e] && evisited_[e]);
    if (evisited[e] && (vtype.length > 0)) {
        vtype[source(G, e)] = 0;
        vtype[target(G, e)] = 0;
    }
});

if (vtype.length > 0) {
    var c=[0,0,0];
    forall_vertices(G, function(v) {
        c[vtype[v]] = c[vtype[v]] + 1;
    });
    console.log(c);
}

var V12 = [];
forall_vertices(G, function(v) {
    if ((v < 3) || (v > 2)) {
        V12.push(v);
    }
});
var coords4 = tutte.convex_face_coordinates(G, V12, coords);

forall_vertices(G, function(v) {
    if (vtype[v] === 0) {
        coords[v][0] = coords4[0][v];
        coords[v][1] = coords4[1][v];
    }
});

if (!dopent) {
  pent = [];
}

#ifndef JSCAD_
tetra(G, M, Math.sqrt(n_vertices(G)), visited, pent, col);
#else

var sc = Math.sqrt(n_vertices(G))

function main(params) {
    var tvtxt = (params.vtxt === 'Type') ? 1 : (params.vtxt === 'theta') ? 2 : (params.vtxt === 'phi') ? 3 : 0

    var vtype_ = []
    forall_vertices(G, function(v) {
	vtype_.push([v, vtype[v].toString(), rad2deg(coords[v][1]).toFixed(1), rad2deg(coords[v][0]).toFixed(1)])
    })

    var sub = [cube({size: (params.look_inside === 'yes')?sc+0.1:0.01, center: [sc/2,-sc/2,sc/2]})]

    var pal = [ [0.7, 0.0, 0], [0, 0.4, 0.4], [0, 0.7, 0], [0.4, 0, 0.4], [0, 0, 0.7], [0.4, 0.4, 0] ]
    console.log("pal:", pal)

    var ret = []

    console.log("M.length main:", M.length);

    var Ms = [M[0], M[1], M[2], M[3]]

    forall_vertices(G, function(v) {
	if (Ms.includes(v)) {
	    ret.push(colorize([0.7, 0, 0], 
                         vertex(v, params.half && ((tvtxt !== 1) || (vtype[v] !== 0)))
	             )
            )
        } else {
	    ret.push(vertex(v, params.half && ((tvtxt !== 1) || (vtype[v] !== 0))))
        }
    });

    forall_edges(G, function(e) {
        if (!no_e21 || (e !== 21)) {
            if (evisited[e]) {
		ret.push(colorize([1,0.66666,0],
                                  edge2(source(G, e), target(G, e), e)
                         )
                )
            } else {
		ret.push(edge2(source(G, e), target(G, e), e))
            }
        }
    });

    if (params.faces === 'Pentagons') {
        pent.forEach(function(face) {
            console.log(face)

	    ret.push(sp_tria(face[0], face[1], face[2], sub))
            ret.push(sp_tria(face[0], face[2], face[3], sub))
            ret.push(sp_tria(face[0], face[3], face[4], sub))
        })
    }

    if (params.faces === '6coloring') {
        faces(G).forEach(function(face, i) {
            console.log(face, i, col[i])
            while (face.length >= 3) {
                ret.push(colorize(pal[col[i]], sp_tria(face[0], face.at(-2), face.at(-1), sub)))
                face.pop()
            }
	})
    }

    if (params.white) {
        ret.push(colorize([1,1,1],
                     subtract(
                         sphere({radius: sc, segments: 30})
                         ,sphere({radius: sc-0.1, segments: 30})
                         ,sub 
                     )
                 )
        )
    }

    if (params.vtxt !== 'None') {
        forall_vertices(G, function(v) {
            ret.push(vtxt(v, vtype_[v][tvtxt]))
        });
    }

    return ret
}
module.exports = { main, getParameterDefinitions }
#endif

// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"
#include "undirected_graph.js"
#include "scad.js"

var X = 1;
var sx = process.argv.length > 2 ? parseFloat(process.argv[2]) : 0.4;
var sy = process.argv.length > 3 ? parseFloat(process.argv[3]) : 0.1;
var Y = process.argv.length > 4 ? parseFloat(process.argv[4]) : 1;
var Z = process.argv.length > 5 ? parseFloat(process.argv[5]) : 1;
var N = process.argv.length > 6 ? parseInt(process.argv[6]) : 20;
var n = process.argv.length > 7 ? parseInt(process.argv[7]) : 5;
var h;
var i;
var j;
var k;

var edg = [[[],[],[],[]],[[],[],[],[]],[[],[],[],[]]];

var G = new_graph();

var s = new_vertex(G);

var corner = [new_vertex(G), new_vertex(G), new_vertex(G), new_vertex(G), 
              new_vertex(G), new_vertex(G), new_vertex(G), new_vertex(G)];

var topc = [];
for(i=1; i<n; ++i)
    for(j=1; j<n; ++j)
        topc.push(new_vertex(G));

for(i=0; i<=1; ++i)
    for(j=0; j<=2; j+=2)
        for(k=1; k<N; ++k) {
            edg[0][i+j].push(new_vertex(G));
            edg[1][i+j].push(new_vertex(G));
            edg[2][i+j].push(new_vertex(G));
        }


var coords = filled_array(n_vertices(G), 3, -1);

coords[s] = [sx, sy, 0];

coords[corner[0]] = [0, 0, 0];
coords[corner[1]] = [X, 0, 0];
coords[corner[2]] = [0, Y, 0];
coords[corner[3]] = [X, Y, 0];
coords[corner[4]] = [0, 0, Z];
coords[corner[5]] = [X, 0, Z];
coords[corner[6]] = [0, Y, Z];
coords[corner[7]] = [X, Y, Z];
 
for(i=1; i<n; ++i)
    for(j=1; j<n; ++j)
        coords[topc[(j-1)*(n-1) + i-1]] = [X*i/n, Y*j/n, Z];

for(k=1; k<N; ++k) {
    coords[edg[0][0][k-1]] =  [X*k/N, 0, 0];
    coords[edg[0][1][k-1]] =  [X*k/N, 0, Z];
    coords[edg[0][2][k-1]] =  [X*k/N, Y, 0];
    coords[edg[0][3][k-1]] =  [X*k/N, Y, Z];

    coords[edg[1][0][k-1]] =  [0, Y*k/N, 0];
    coords[edg[1][1][k-1]] =  [0, Y*k/N, Z];
    coords[edg[1][2][k-1]] =  [X, Y*k/N, 0];
    coords[edg[1][3][k-1]] =  [X, Y*k/N, Z];

    coords[edg[2][0][k-1]] =  [0, 0, Z*k/N];
    coords[edg[2][1][k-1]] =  [X, 0, Z*k/N];
    coords[edg[2][2][k-1]] =  [0, Y, Z*k/N];
    coords[edg[2][3][k-1]] =  [X, Y, Z*k/N];
}


function mk_complete(vs) {
    vs.forEach(function (v) {
        vs.forEach(function (w) {
            if (v < w)
                new_edge(G, v, w);
        });
    });
}

function mk_complete_bipartite(vs, ws) {
    vs.forEach(function (v) {
        ws.forEach(function (w) {
            new_edge(G, v, w);
        });
    });
}

var bot = [corner[0],corner[1],corner[2],corner[3]]; 
mk_complete_bipartite([s], bot.concat(edg[0][0],edg[0][2],edg[1][0],edg[1][2]));

var fro = [corner[0],corner[1],corner[4],corner[5]];
mk_complete(fro.concat(edg[0][0],edg[0][1],edg[2][0],edg[2][1]));

var lft = [corner[0],corner[2],corner[4],corner[6]];
mk_complete(lft.concat(edg[1][0],edg[1][1],edg[2][0],edg[2][2]));

var rgt = [corner[1],corner[3],corner[5],corner[7]];
mk_complete(rgt.concat(edg[1][2],edg[1][3],edg[2][1],edg[2][3]));

var bck = [corner[2],corner[3],corner[6],corner[7]];
mk_complete(bck.concat(edg[0][2],edg[0][3],edg[2][2],edg[2][3]));

var top = [corner[4],corner[5],corner[6],corner[7]];
mk_complete_bipartite(topc, top.concat(edg[0][1],edg[0][3],edg[1][1],edg[1][3]));


function dist3D(p, q) {
    var d = [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
    return Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]);
}

var w = filled_array(n_edges(G), 1, -1);
forall_edges(G, function(e) {
    w[e] = dist3D(coords[source(G, e)], coords[target(G, e)]);
});


var dist;
var next;
[dist, next] = floyd_warshall_path(G, w);

/*
topc.forEach(function (v) {
    console.log(dist[s][v]);
});
*/


scad.open();
scad.header3(coords, X, Y, Z);

scad.wlog("rotate([0,0,0]) union(){");

scad.wlog("  white_cube();");

forall_vertices(G, function(v) {
    scad.wlog("  vertex(", v, ",", 1/(2.5*N), ");");
});

function nedges(v, w) {
    var cnt = 0; 
    while (v !== w) {
        var e = next[v][w];
        cnt += 1;
        v = opposite(G, v, e);
    }
    return cnt;
}

topc.forEach(function (v) {
    var cnt = nedges(v, s);
    assert.assert( (cnt > 2) && (cnt < 5) );
    var col = (cnt === 4) ? [0,0,1] : [1,0.666666,0];

    while (v !== s) {
        var e = next[v][s];
        scad.wlog("color(",col,") edge(",source(G, e),",",target(G, e),",",0.005,");");
        v = opposite(G, v, e);
    }
});

scad.wlog("}");
scad.close();

console.log(n_vertices(G), n_edges(G));

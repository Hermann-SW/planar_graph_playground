"use strict"; // avoid module leak

var exports = {};
var htmlsvg = exports;

if (true) {
    var params;
    var jscad = `
const jscad = require('@jscad/modeling')
const { colorize } = jscad.colors
const { cube, sphere, cylinder, circle } = jscad.primitives
const { rotate, translate, scale } = jscad.transforms
const { vec2, vec3, plane } = jscad.maths
const { extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract } = require('@jscad/modeling').booleans

// init scale so that half of vertices are mapped above equator
var sorted = coords.slice()
sorted.sort(function(a,b){return vec2.length(a)-vec2.length(b)})
var scini = 4 / (vec2.length(sorted[Math.floor((sorted.length-2)/2)]) +
             vec2.length(sorted[Math.ceil((sorted.length-1)/2)]))
scini -= 2

// round scini according slider step
const scstep = 0.2
scini = Math.round(scini * (1 / scstep)) / (1 / scstep)
const emax = (adj.reduce((sum, a) => sum + a.length, 0)) / 2 - 1

function getParameterDefinitions() {
  return [
    { name: 'etype', type: 'int', initial: 3, min: 1, max: 3, step: 1, caption: 'etype:' },
    { name: 'sphere', type: 'checkbox', checked: true, initial: 1, caption: 'show sphere:' },
    { name: 'plan', type: 'checkbox', checked: true, initial: 1, caption: 'show planar:' },
    { name: 'sca', type: 'slider', initial: scini, min: 0, max: 2*scini+2, step: scstep,
      fps: 10, live: true, autostart: false, loop:'reverse', caption: 'scale (+2):'},
    { name: 'e', type: 'slider', initial: 0, min: 0, max: emax, step: 1,
      fps: 1, live: true, autostart: false, loop:'reverse', caption: 'e:'}
  ]
}

var sc = 10
var er = sc / 200
var sca = 2
const N = [0, 0, sc]  // north pole
const rmax = 1000

function _() { return vec3.create() }
function ang(x,y,d) { return (vec3.dot(y, d) < 0 ? -1 : 1) * vec3.angle(x, d) }
function colinear(v, w, m) {
    const mmv = vec3.subtract(_(), m, v)
    const wmv = vec3.subtract(_(), w, v)
    return Math.abs(vec3.angle(mmv, wmv)) < 1e-9
}

function map3D(x, y) {
    const a = Math.atan2(y, x)
    const L = sca*vec2.length([x, y])
    const X = L -L*(L*L/(4+L*L))
    const Y = 2*(L*L/(4+L*L))- 1
    return [sc * Math.cos(a) * X, sc * Math.sin(a) * X, sc * Y]
}

function cart2pol(p, f=sc) {
    return [Math.atan2(p[1],p[0]), Math.acos(p[2]/f)]
}

function pol2cart(p, f=sc) {
    return [Math.cos(p[0])*f*Math.sin(p[1]), Math.sin(p[0])*f*Math.sin(p[1]), Math.cos(p[1])*f]
}

let cachedSphere = sphere({radius:3*er})

function vertex(_v, plan=false, sf=1) {
    const v = plan ? _v : map3D(coords[_v][0],coords[_v][1])
    const s = translate(v, scale([sf,sf,sf],cachedSphere))
    return colorize([0, 0.7, 0], s)
}

let edgeCylinder = cylinder({radius:er, height:1})

function edge(_v, _w, plan=false) {
    const v = plan ? _v : map3D(coords[_v][0], coords[_v][1])
    const w = plan ? _w : map3D(coords[_w][0], coords[_w][1])
    var d = [0, 0, 0]
    var x = [0, 0, 0]
    jscad.maths.vec3.subtract(d, w, v)
    vec3.add(x, v, w)
    vec3.scale(x, x, 0.5)
    return colorize([0, 0, 1, 1], 
        translate(x, 
            rotate([0, Math.acos(d[2]/vec3.length(d)), Math.atan2(d[1], d[0])],
                jscad.transforms.scale([1, 1, vec3.length(d)], edgeCylinder)
            )
        )
    )
}

function edge2(_p1, _p2) {
    const v = map3D(coords[_p1][0], coords[_p1][1])
    const w = map3D(coords[_p2][0], coords[_p2][1])
    const p1 = cart2pol(v)
    const p2 = cart2pol(w)
    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy
    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course
    const la1 = p1[0]
    const la2 = p2[0]
    const l12 = la2 - la1
    const ph1 = Math.PI/2 - p1[1]
    const ph2 = Math.PI/2 - p2[1]
    const al1 = Math.atan2(Math.cos(ph2)*Math.sin(l12), Math.cos(ph1)*Math.sin(ph2)-Math.sin(ph1)*Math.cos(ph2)*Math.cos(l12))
    // delta sigma_12
    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae
    const s12 = Math.acos(Math.sin(ph1)*Math.sin(ph2)+Math.cos(ph1)*Math.cos(ph2)*Math.cos(l12))
    return rotate([0, -ph1, la1],
        rotate([Math.PI/2-al1, 0, 0],
            makeArc2(sc, s12, 64)
        )
    )
}

function edge3(_p1, _p2) {
    const v = map3D(coords[_p1][0], coords[_p1][1])
    const w = map3D(coords[_p2][0], coords[_p2][1])
    const pla = plane.fromPoints(plane.create(), N, v, w)
    const c = vec3.scale(_(), pla, pla[3])
    if (pla[3] == 0) {
        return edge2(_p1, _p2)
    }
    const p = cart2pol(c, Math.abs(pla[3]))
    const vmc = vec3.subtract(_(), v, c)
    const wmc = vec3.subtract(_(), w, c)
    const r = vec3.length(vmc)
    const x = vec3.rotateZ(_(), vec3.rotateY(_(), [1,0,0], [0,0,0], p[1]), [0,0,0], p[0])
    const y = vec3.rotateZ(_(), vec3.rotateY(_(), [0,1,0], [0,0,0], p[1]), [0,0,0], p[0])
    return [
        translate(c,
            rotate([0,p[1],p[0]],
                rotate([0,0,ang(x,y,vmc)],
                    makeArc2(r, ang(x,y,wmc)-ang(x,y,vmc), 64)
                )
            )
        )
    ]
}

// cool "makeArc2()" replaces "extrudeRotate()", from hrgdavor@gmail.com
//
let cachedCylinder = rotate([-Math.PI/2,0,0],cylinder({radius:er, height:1, center:[0,0,0.5]}))

function makeArc2(radius, angle, segments=64) {
    let correction = 0
    if(angle < 0){
        correction = angle
        angle *= -1
    }
    // match how jscad calculates segments
    let stepA = Math.PI/(segments)*2
    let steps = Math.ceil(angle / stepA)
    stepA = angle / steps
  
    let offset = 0, next=0
    let out = []
    while(offset < angle){
        next += stepA
        if(next > angle) next=angle
        let len = (next-offset) * radius
        let x = Math.cos(offset) * radius
        let y = Math.sin(offset) * radius
        let part = colorize([0,0,1],translate([x,y,0],rotate([0,0,(next-(next-offset)/2)],
            jscad.transforms.scale([1,len,1], cachedCylinder)
        )))
    
        out.push( correction ? rotate([0,0,correction], part):part)
        offset = next
    }
    if(!out.length) { throw("makeArc2(",radius,",",angle,",",segments,") problem") }
    return out
}

function circleCenter(A,B,C)
{
    var yDelta_a = B[1] - A[1]
    var xDelta_a = B[0] - A[0]
    var yDelta_b = C[1] - B[1]
    var xDelta_b = C[0] - B[0]

    var center = [0,0,-sc,0]

    var aSlope = yDelta_a / xDelta_a
    var bSlope = yDelta_b / xDelta_b

    center[0] = (aSlope*bSlope*(A[1] - C[1]) + bSlope*(A[0] + B[0]) - aSlope*(B[0]+C[0]) )/(2* (bSlope-aSlope) )
    center[1] = -1*(center[0] - (A[0]+B[0])/2)/aSlope +  (A[1]+B[1])/2
    center[3] = vec2.length(vec2.subtract(_(), A, center))
    return center
}

function main(params) {
    var out=[]
    var e = 0

    sca = params.sca + 2
    const ef = (params.etype == 1) ? edge : (params.etype == 2) ? edge2 : edge3
    if (params.sphere) {
        out.push(colorize([1,1,1],
            sphere({radius: sc-1, segments: 30}))
        )
    }

    out.push(colorize([1,1,0], vertex(N, true)))

    for(var i=0; i < adj.length; ++i) {
        // forall_vertices

        out.push(vertex(i))

        if (params.plan) {
            out.push(colorize([0.7,0,0],vertex(
                [sca*sc*coords[i][0], sca*sc*coords[i][1], -sc], true)))
        }

        for(var j=0; j < adj[i].length; ++j) {
            if (i < adj[i][j]) {
                // forall_edges

                out.push(ef(i, adj[i][j]))

                if (params.plan) {
                    out.push(colorize([0,0,0],edge(
                        [sca*sc*coords[i][0], sca*sc*coords[i][1], -sc],
                        [sca*sc*coords[adj[i][j]][0], sca*sc*coords[adj[i][j]][1], -sc],
                        true)))
                    if (params.etype == 1) {
                        const p = map3D(coords[i][0], coords[i][1])
                        const q = map3D(coords[adj[i][j]][0], coords[adj[i][j]][1])
                        const d = vec3.subtract(_(), q, p)
                        for(var k=1; k<8; ++k) {
                            const m = vec3.add(_(), p, vec3.scale(_(), d, k/8))
                            const D = vec3.subtract(_(), [0,0,sc], m)
                            const P = vec3.subtract(_(), [0,0,sc], vec3.scale(_(), D, (2*sc)/D[2]))
                            out.push(colorize([0,0,0.7], vertex(P, true)))
                        }
                    }
                    if (params.etype == 2) {
                        const p = map3D(coords[i][0], coords[i][1])
                        const q = map3D(coords[adj[i][j]][0], coords[adj[i][j]][1])
                        const d = vec3.subtract(_(), q, p)
                        for(var k=1; k<8; ++k) {
                            const m = vec3.add(_(), p, vec3.scale(_(), d, k/8))
                            const D = vec3.subtract(_(), [0,0,sc],
			                  vec3.scale(_(), vec3.normalize(_(), m), sc))
                            const P = vec3.subtract(_(), [0,0,sc],
			                  vec3.scale(_(), D, (2*sc)/D[2]))
                            out.push(colorize([0,0,0.7], vertex(P, true)))
                        }
                        if (e == params.e) {
                            const V = [sca*sc*coords[i][0], sca*sc*coords[i][1], -sc]
                            const W = [sca*sc*coords[adj[i][j]][0], sca*sc*coords[adj[i][j]][1], -sc]
                            const m = vec3.add(_(), p, vec3.scale(_(), d, 0.5))
                            const D = vec3.subtract(_(), [0,0,sc],
                                                    vec3.scale(_(), vec3.normalize(_(), m), sc))
                            const P = vec3.subtract(_(), [0,0,sc],
			                              vec3.scale(_(), D, (2*sc)/D[2]))
                            out.push(colorize([1,1,0], vertex(V, true, 2)))
                            out.push(colorize([1,1,0], vertex(W, true, 2)))
                            out.push(colorize([1,1,0], vertex(P, true, 2)))

                            if (!colinear(V, W, P)) {
                                const R = circleCenter(V, W, P)
                                if (R[3] < rmax && R[3] != NaN) {
                                    out.push(colorize([1,1,0], translate([0,0,-sc],
                                             circle({center: R, radius: R[3], segments: 120}))))
                                }
                            }
                        }
                    }
                }

                e += 1
            }
        }
    }

    return out
}

module.exports = { main, getParameterDefinitions }
// `

    exports.straight_line_drawing = function (G, coords, pent, length, r, outer, dual) {
        var bx;
        var by;
        var cx;
        var cy;
        var dx;
        var dy;
        var v;
        var w;
        var vcol;

        document.write('<svg width="' + length + '" height="' + length + '">');
        document.write('<style> .l { stroke:black; stroke-width:2; fill:none; } </style>');

        if ((pent.length > 0) && (pent[0].length === 5)) {

            pent.forEach(function (face) {
                document.write('<polygon points="');
                face.forEach(function (v) {
                    cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
                    cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
                    document.write(cx + ',' + cy + ' ');
                });
                document.write('" stroke="#00ced1" stroke-width="1" fill="#00ced1" opacity="1.0" />');
            });

            if (pent.length !== 12) {
                document.write('<polygon points="');
                document.write(0 + ',' + 0 + ' ');

                outer.forEach(function (v) {
                    cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
                    cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
                    document.write(cx + ',' + cy + ' ');
                });
                document.write(0 + ',' + length + ' ');
                document.write(length + ',' + length + ' ');
                document.write(length + ',' + 0 + ' ');

                document.write('" stroke="#00ced1" stroke-width="1" fill="#00ced1" opacity="1.0" />');

                document.write('<polygon points="');
                document.write(0 + ',' + 0 + ' ');
                cx = length / 2 + (length / 2 - r - 10) * coords[0][outer[0]];
                cy = length / 2 + (length / 2 - r - 10) * coords[1][outer[0]];
                document.write(cx + ',' + cy + ' ');
                cx = length / 2 + (length / 2 - r - 10) * coords[0][outer[4]];
                cy = length / 2 + (length / 2 - r - 10) * coords[1][outer[4]];
                document.write(cx + ',' + cy + ' ');
                document.write(0 + ',' + length + ' ');
                document.write('" stroke="#00ced1" stroke-width="1" fill="#00ced1" opacity="1.0" />');

            }
        }

        forall_edges(G, function (e) {
            v = source(G, e);
            w = target(G, e);
            if (v < w) {
                cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
                cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
                dx = length / 2 + (length / 2 - r - 10) * coords[0][w];
                dy = length / 2 + (length / 2 - r - 10) * coords[1][w];
                document.write('<line onmousedown="javascript:clck(' + e + ',event,' + length + ',' + r + ')" class="l" x1="' + cx + '" y1="' + cy + '" x2="' + dx + '" y2="' + dy + '"></line>');
            }
        });

        forall_vertices(G, function (v) {
            cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
            cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
            vcol = (
                (dual && (degree(G, v) === 5))
                ? "#00ced1"
                : "white"
            );
            document.write('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="black" fill="' + vcol + '"></circle>');

            if (r >= 12) {
                document.write('<text x="' + cx + '" y="' + (cy + 1) + '" alignment-baseline="middle" text-anchor="middle">' + (v + 1) + '</text>');
            }
        });

        if ((pent.length > 0) && (pent[0].length === 2)) {
            cx = length / 2 + (length / 2 - r - 10) * (coords[0][0] + pent[0][0] * (coords[0][3] - coords[0][0]));
            cy = length / 2 + (length / 2 - r - 10) * (coords[1][0] + pent[0][1] * (coords[1][3] - coords[1][0]));
            dx = length / 2 + (length / 2 - r - 10) * (coords[0][4] + pent[1][0] * (coords[0][7] - coords[0][4]));
            dy = length / 2 + (length / 2 - r - 10) * (coords[1][4] + pent[1][1] * (coords[1][7] - coords[1][4]));

            document.write('<polyline points="');
            document.write(dx + ',' + dy + ' ');
            bx = length / 2 + (length / 2 - r - 10) * coords[0][7];
            by = length / 2 + (length / 2 - r - 10) * ((coords[1][7] + coords[1][5]) / 2);
            document.write(bx + ',' + by + ' ');
            bx = length / 2 + (length / 2 - r - 10) * ((coords[0][1] + coords[0][5]) / 2);
            by = length / 2 + (length / 2 - r - 10) * ((coords[1][1] + coords[1][5]) / 2);
            document.write(bx + ',' + by + ' ');
            bx = length / 2 + (length / 2 - r - 10) * ((coords[0][1] + coords[0][0]) / 2);
            by = length / 2 + (length / 2 - r - 10) * ((coords[1][1] + coords[1][0]) / 2);
            document.write(bx + ',' + by + ' ');
            document.write(cx + ',' + cy + ' ');
            document.write('" stroke="blue" strokeThickness="2" fill="none"/>');

            document.write('<circle cx="' + dx + '" cy="' + dy + '" r="' + r + '" stroke="red" fill="red"></circle>');
            document.write('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="green" fill="green"></circle>');
        }

        document.write('<polygon points="');
        document.write('0,0 ' + length + ',0 ' + length + ',' + length + ' 0,' + length);
        document.write('" stroke="blue" strokeThickness="1" fill="none"/>');

        document.write('</svg>');

        var coords_ = []
        for(var i=0; i<coords[0].length; ++i)  coords_[i]=[coords[0][i],coords[1][i]]
        params = "\"use strict\"\n" +
                 "const coords = " + JSON.stringify(coords_) + "\n" +
                 "const adj = " + JSON.stringify(to_adjacency_lists(G)) + "\n";
    };

    exports.header = function (selInd, slider, slider2, hidden, check) {
        document.body.innerHTML = '';

        document.write("<img align=left src=\"res/spherical_circle.icon.png\"/>");
        document.write('<div><form id="myForm">');
        document.write('<select ' + hidden + ' id="frm" size="1" onInput="javascript:doi(document.forms[0].elements[0].selectedIndex)">');
        document.write('  <option ' + (
            (selInd === 0)
            ? "selected"
            : ""
        ) + ' value="mp7">mp7</option>');
        document.write('  <option ' + (
            (selInd === 1)
            ? "selected"
            : ""
        ) + ' value="C20">C20</option>');
        document.write('  <option ' + (
            (selInd === 2)
            ? "selected"
            : ""
        ) + ' value="C30">C30</option>');
        document.write('  <option ' + (
            (selInd === 3)
            ? "selected"
            : ""
        ) + ' value="C40">C40</option>');
        document.write('  <option ' + (
            (selInd === 4)
            ? "selected"
            : ""
        ) + ' value="C50">C50</option>');
        document.write('  <option ' + (
            (selInd === 5)
            ? "selected"
            : ""
        ) + ' value="C60">C60</option>');
        document.write('  <option ' + (
            (selInd === 6)
            ? "selected"
            : ""
        ) + ' value="C70">C70</option>');
        document.write('  <option ' + (
            (selInd === 7)
            ? "selected"
            : ""
        ) + ' value="D100">D100</option>');
        document.write('  <option ' + (
            (selInd === 8)
            ? "selected"
            : ""
        ) + ' value="I100.1">I100.1</option>');
        document.write('  <option ' + (
            (selInd === 9)
            ? "selected"
            : ""
        ) + ' value="100">100</option>');

        document.write('</select> <a href="https://github.com/Hermann-SW/planar_graph_playground#planar_graph_playground">planar_graph_playground github repo</a> hosting this "' + (
            hidden
            ? "cuboid surface shortest path"
            : "convex face planar straight line drawing"
        ) + '" tool');
        document.write('</form></div>');

        if (!hidden) {
        document.write("<div><button onclick=\"javascript:window.open('https:///jscad.app/#data:application/json,'+encodeURIComponent(params+jscad+Date.now()),'_stereographic_projection')\">stereographic projection</button>&nbsp;&nbsp;");
            document.write('<label for="myRange">factor: </label><input type="range" min="50" max="120" value="' + slider + '" id="myRange" name="myRangeN" onInput="javascript:doi(' + selInd + ')">');
        }

        document.write('<label for="myRange2">&nbsp;&nbsp;&nbsp;size: </label><input type="range" min="500" max="7000" value="' + slider2 + '" id="myRange2" onChange="javascript:doi(' + selInd + ')">');

        if (!hidden) {
            document.write('<label for="myCheckbox">&nbsp;&nbsp;&nbsp;dual: </label><input type="checkbox" id="myCheckbox" onChange="javaScript:doi(' + selInd + ')"' + (
                check
                ? " checked"
                : ""
            ) + '>');
        }
        document.write("&nbsp;&nbsp;<button onclick=\"javascript:window.open('https://github.com/Hermann-SW/planar_graph_playground?tab=readme-ov-file#new-edge-representation-allows-for-better-edge-selection','_help')\">help</button>");
        document.write("</div><br clear=\"all\">");
    };

}

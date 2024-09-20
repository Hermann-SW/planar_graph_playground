"use strict"
const coords = [[1.2246467991473532e-16,-1],[0.8660254037844387,0.4999999999999999],[-0.34540897607587423,-0.33236994219653165],[-0.3003556313703254,-0.2890173410404623],[-0.21525486914873318,-0.5404624277456647],[-0.8660254037844385,0.5000000000000003],[-0.07508890784258128,-0.07225433526011554]]
const adj = [[1,6,3,4,2,5],[0,5,6],[0,4,3,5],[5,2,4,0,6],[0,3,2],[1,0,2,3,6],[1,5,3,0]]

const jscad = require('@jscad/modeling')
const { colorize } = jscad.colors
const { cube, sphere, cylinder, circle } = jscad.primitives
const { rotate, translate } = jscad.transforms
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

function getParameterDefinitions() {
  return [
    { name: 'etype', type: 'int', initial: 3, min: 1, max: 3, step: 1, caption: 'etype:' },
    { name: 'sphere', type: 'checkbox', checked: true, initial: 1, caption: 'show sphere:' },
    { name: 'plan', type: 'checkbox', checked: true, initial: 1, caption: 'show planar:' },
    { name: 'sca', type: 'slider', initial: scini, min: 0, max: 2*scini+2, step: scstep,
      fps: 10, live: true, autostart: false, loop:'reverse', caption: 'scale (+2):'}
  ];
}

var sc = 10
var er = sc / 200
var sca = 2

function _() { return vec3.create() }
function ang(x,y,d) { return (vec3.dot(y, d) < 0 ? -1 : 1) * vec3.angle(x, d) }
function colinear(v, w, m) {
    const mmv = vec3.subtract(_(), m, v)
    const wmv = vec3.subtract(_(), w, v)
    return vec3.dot(mmv, wmv) == 0
}

function map3D(x, y) {
    const a = Math.atan2(y, x);
    const L = sca*vec2.length([x, y]);
    const X = L -L*(L*L/(4+L*L));
    const Y = 2*(L*L/(4+L*L))- 1;
    return [sc * Math.cos(a) * X, sc * Math.sin(a) * X, sc * Y];
}

function cart2pol(p, f=sc) {
    return [Math.atan2(p[1],p[0]), Math.acos(p[2]/f)];
}

let cachedSphere = sphere({radius:3*er})

function vertex(_v, plan=false) {
    const v = plan ? _v : map3D(coords[_v][0],coords[_v][1])
    const s = translate(v, cachedSphere)
    return colorize([0, 0.7, 0], s)
}

let edgeCylinder = cylinder({radius:er, height:1})

function edge(_v, _w, plan=false) {
    var v
    var w
    if (plan) {
        v = _v
        w = _w
    } else {
        v = map3D(coords[_v][0], coords[_v][1])
        w = map3D(coords[_w][0], coords[_w][1])
    }
    var d = [0, 0, 0]
    var x = [0, 0, 0]
    jscad.maths.vec3.subtract(d, w, v)
    vec3.add(x, v, w)
    vec3.scale(w, x, 0.5)
    return colorize([0, 0, 1, 1], 
        translate(w, 
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
    const m = map3D((coords[_p1][0]+coords[_p2][0])/2,
                    (coords[_p1][1]+coords[_p2][1])/2)
    if (colinear(v, w, m)) {
        return edge2(_p1, _p2);
    }
    const pla = plane.fromPoints(plane.create(), m, v, w);
    const c = vec3.scale(_(), pla, pla[3]);
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
    if(!out.length) { alert("plaese report this problem"); return [] }
    return out
}

function main(params) {
    var out=[]

    sca = params.sca + 2
    const ef = (params.etype == 1) ? edge : (params.etype == 2) ? edge2 : edge3;
    if (params.sphere) {
        out.push(colorize([1,1,1],
            sphere({radius: sc-1, segments: 30}))
        )
    }

    for(var i=0; i < adj.length; ++i) {
        // forall_vertices

        out.push(vertex(i))

        if (params.plan && params.etype==1) {
            out.push(colorize([0.7,0,0],vertex(
              [sca*sc*coords[i][0], sca*sc*coords[i][1], -sc], true)))
        }

        out.push(colorize([1,1,0],vertex([0,0,sc], true)))

        for(var j=0; j < adj[i].length; ++j) {
            if (i < adj[i][j]) {
                // forall_edges

                out.push(ef(i, adj[i][j]))

                if (params.plan) {
                  if (params.etype % 2 == 1) {
                    out.push(colorize([0,0,0],edge(
                      [sca*sc*coords[i][0], sca*sc*coords[i][1], -sc],
                      [sca*sc*coords[adj[i][j]][0], sca*sc*coords[adj[i][j]][1], -sc],
                      true)))
                  }
                  if (params.etype == 1) {
                    const p = map3D(coords[i][0], coords[i][1])
                    const q = map3D(coords[adj[i][j]][0], coords[adj[i][j]][1])
                    const d = vec3.subtract(_(), q, p)
                    for(var k=1; k<8; ++k) {
                      const m = vec3.add(_(), p, vec3.scale(_(), d, k/8))
                      const D = vec3.subtract(_(), [0,0,sc], m)
                      const P = vec3.subtract(_(), [0,0,sc], vec3.scale(_(), D, (2*sc)/(D[2])))
                      out.push(colorize([0,0,0.7],vertex(P, true)))
                    }
                  }
                }
            }
        }
    }

    return out
}

module.exports = { main, getParameterDefinitions }

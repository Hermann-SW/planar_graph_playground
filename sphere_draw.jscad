const jscad = require('@jscad/modeling')
const { colorize } = jscad.colors
const { cube, sphere, cylinder, circle } = jscad.primitives
const { rotate, translate } = jscad.transforms
const { degToRad } = jscad.utils
const { add, normalize, length, scale, dot } = jscad.maths.vec3
const { extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract } = require('@jscad/modeling').booleans

function getParameterDefinitions() {
  return [
    { name: 'etype', type: 'int', initial: 2, min: 1, max: 2, step: 1, caption: 'etype:' },
    { name: 'white', type: 'checkbox', checked: true, initial: '20', caption: 'surface of sphere:' }
  ];
}

function map_3D(c, sc) {
  return [Math.cos(degToRad(c[0]))*Math.sin(degToRad(c[1]))*sc, Math.sin(degToRad(c[0]))*Math.sin(degToRad(c[1]))*sc, Math.cos(degToRad(c[1]))*sc]
}

eps = 0.00001
sc = 10
er = sc / 200

coords =[
[270,54.735610317245346]
, [270,18.24520343908178]
, [90,18.24520343908178]
, [90,54.735610317245346]
, [58.12151774966443,77.20966313919999]
, [62.04418827260525,114.64747531665705]
, [0,161.7547965609182]
, [180,161.7547965609182]
, [242.04418827260523,114.64747531665704]
, [238.12151774966446,77.20966313919999]
, [321.98895293184864,75.02203375014706]
, [308.0110470681513,104.97796624985293]
, [0,125.26438968275465]
, [31.878482250335562,102.79033686080001]
, [387.9558117273947,65.35252468334295]
, [207.95581172739477,65.35252468334296]
, [141.9889529318487,75.02203375014707]
, [128.0110470681513,104.97796624985293]
, [180,125.26438968275465]
, [211.87848225033554,102.79033686080001]
]
adj = [[9,10,1],[0,2,15],[1,14,3],[2,4,16],[3,13,5],[4,6,17],[5,12,7],[6,8,18],[7,11,9],[8,0,19],[0,11,14],[10,8,12],[11,6,13],[12,4,14],[13,2,10],[1,16,19],[15,3,17],[16,5,18],[17,7,19],[18,9,15]]

function vertex(_v) {
    p = coords[_v] 
    v = map_3D(p,sc)
    s = sphere({radius: 3*er, center: v})
    return colorize([0, 0.7, 0], s)
}

function edge(_v, _w) {
    v = map_3D(coords[_v], sc)
    w = map_3D(coords[_w], sc)
    d = [0, 0, 0]
    x = [0, 0, 0]
    jscad.maths.vec3.subtract(d, w, v)
    add(x, v, w)
    scale(w, x, 0.5)
    if (length(d) >= eps) {
        return colorize([0, 0, 1, 1], 
            translate(w, 
                rotate([0, Math.acos(d[2]/length(d)), Math.atan2(d[1], d[0])],
                    cylinder({radius: er, height: length(d)})
                )
            )
        )
    } else {
        return cube({size: 0.01})
    }
}

function edge2(_p1, _p2) {
    p1 = coords[_p1]
    p2 = coords[_p2]
    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy
    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course
    la1 = degToRad(p1[0])
    la2 = degToRad(p2[0])
    l12 = la2 - la1
    ph1 = degToRad(90 - p1[1])
    ph2 = degToRad(90 - p2[1])
    al1 = Math.atan2(Math.cos(ph2)*Math.sin(l12), Math.cos(ph1)*Math.sin(ph2)-Math.sin(ph1)*Math.cos(ph2)*Math.cos(l12))
    // delta sigma_12
    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae
    s12 = Math.acos(Math.sin(ph1)*Math.sin(ph2)+Math.cos(ph1)*Math.cos(ph2)*Math.cos(l12))
    return rotate([0, 0, la1],
        rotate([0, -ph1, 0],
            rotate([degToRad(90)-al1, 0, 0],
                colorize([0, 0, 0.7],
                    extrudeRotate({segments: 64, angle: s12},
                        circle({radius: er, center: [sc,0]})
                    )
                )
            )
        )
    )
}

function main(params) {
    white = (!params.white) ? [] : [
        colorize([1,1,1],
            sphere({radius: sc-1, segments: 30})
        )
    ]

    out=[]
    ef = edge2;
    if (params.etype == 1)  ef = edge;

    for(i=0; i<adj.length; ++i) {
        for(j=0; j<adj[i].length; ++j) {
            out.push(ef(i, adj[i][j]))
        }
    }
    for(i=0; i<adj.length; ++i) { out.push(vertex(i)) }

    return [out, white]
}

module.exports = { main, getParameterDefinitions }

const jscad = require('@jscad/modeling')
const { colorize } = jscad.colors
const { cube, sphere, cylinder, circle } = jscad.primitives
const { rotate, translate } = jscad.transforms
const { degToRad } = jscad.utils
const { add, normalize, length, scale, dot } = jscad.maths.vec3
const { vec2 } = jscad.maths
const { extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract } = require('@jscad/modeling').booleans

function getParameterDefinitions() {
  return [
    { name: 'etype', type: 'int', initial: 2, min: 1, max: 2, step: 1, caption: 'etype:' },
    { name: 'white', type: 'checkbox', checked: true, initial: '20', caption: 'surface of sphere:' },
    { name: 'sca', type: 'slider', initial: 4, min: 0, max: 6, step: 0.2, fps: 10,
      live: true, autostart: false, loop:'reverse', caption: 'scale:'} 
  ];
}

eps = 0.00001
sc = 10
er = sc / 200
sca = 2

function map_3D(x, y) {
    var a = Math.atan2(y, x);
    var l = sca*vec2.length([x, y]);
    var X = l -l*(l*l/(4+l*l));
    var Y = 2*(l*l/(4+l*l))- 1;
    return [sc * Math.cos(a) * X, sc * Math.sin(a) * X, sc * Y];
}

function cart2pol(p) {
    return [Math.atan2(p[1],p[0]), Math.acos(p[2]/sc)];
}

coords =[
  [ -0.8660254037844385, 0.5000000000000003 ],
  [ 1.2246467991473532e-16, -1 ],
  [ -0.1151363253586247, 0.4653179190751446 ],
  [ -0.10011854379010833, 0.40462427745664753 ],
  [ -0.36042675764439047, 0.45664739884393085 ],
  [ 0.8660254037844387, 0.4999999999999999 ],
  [ -0.02502963594752705, 0.10115606936416192 ]
]

adj = [[1,6,3,4,2,5],[0,5,6],[0,4,3,5],[5,2,4,0,6],[0,3,2],[1,0,2,3,6],[1,5,3,0]]

function vertex(_v) {
    p = coords[_v] 
    v = map_3D(p[0],p[1])
    s = sphere({radius: 3*er, center: v})
    return colorize([0, 0.7, 0], s)
}

function edge(_v, _w) {
    v = map_3D(coords[_v][0], coords[_v][1])
    w = map_3D(coords[_w][0], coords[_w][1])
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
    v = map_3D(coords[_p1][0], coords[_p1][1])
    w = map_3D(coords[_p2][0], coords[_p2][1])
    p1 = cart2pol(v)
    p2 = cart2pol(w)
    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy
    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course
    la1 = p1[0]
    la2 = p2[0]
    l12 = la2 - la1
    ph1 = Math.PI/2 - p1[1]
    ph2 = Math.PI/2 - p2[1]
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
    sca = params.sca
  
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

coords =[[ -0.8660254037844385, 0.5000000000000003 ], [ 1.2246467991473532e-16, -1 ], [ -0.1151363253586247, 0.4653179190751446 ], [ -0.10011854379010833, 0.40462427745664753 ], [ -0.36042675764439047, 0.45664739884393085 ], [ 0.8660254037844387, 0.4999999999999999 ], [ -0.02502963594752705, 0.10115606936416192 ]]
adj = [[1,6,3,4,2,5],[0,5,6],[0,4,3,5],[5,2,4,0,6],[0,3,2],[1,0,2,3,6],[1,5,3,0]]

const jscad = require('@jscad/modeling')
const { colorize } = jscad.colors
const { cube, sphere, cylinder, circle } = jscad.primitives
const { rotate, translate } = jscad.transforms
const { vec2, vec3, plane } = jscad.maths
const { extrudeRotate } = require('@jscad/modeling').extrusions
const { subtract } = require('@jscad/modeling').booleans

function getParameterDefinitions() {
  return [
    { name: 'etype', type: 'int', initial: 3, min: 1, max: 3, step: 1, caption: 'etype:' },
    { name: 'sphere', type: 'checkbox', checked: true, initial: 1, caption: 'show sphere:' },
    { name: 'plan', type: 'checkbox', checked: true, initial: 1, caption: 'show planar:' },
    { name: 'sca', type: 'slider', initial: 4, min: 0, max: 6, step: 0.2, fps: 10,
      live: true, autostart: false, loop:'reverse', caption: 'scale:'} 
  ];
}

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

function cart2pol(p, f=sc) {
    return [Math.atan2(p[1],p[0]), Math.acos(p[2]/f)];
}

function vertex(_v) {
    p = coords[_v] 
    v = map_3D(p[0],p[1])
    s = sphere({radius: 3*er, center: v})
    return colorize([0, 0.7, 0], s)
}

function edge(_v, _w, plan=false) {
    if (plan) {
        v = _v
        w = _w
    } else {
        v = map_3D(coords[_v][0], coords[_v][1])
        w = map_3D(coords[_w][0], coords[_w][1])
    }
    d = [0, 0, 0]
    x = [0, 0, 0]
    jscad.maths.vec3.subtract(d, w, v)
    vec3.add(x, v, w)
    vec3.scale(w, x, 0.5)
    return colorize([0, 0, 1, 1], 
        translate(w, 
            rotate([0, Math.acos(d[2]/vec3.length(d)), Math.atan2(d[1], d[0])],
                cylinder({radius: er, height: vec3.length(d)})
            )
        )
    )
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
            rotate([Math.PI/2-al1, 0, 0],
                colorize([0, 0, 0.7],
                    extrudeRotate({segments: 64, angle: s12},
                        circle({radius: er, center: [sc,0]})
                    )
                )
            )
        )
    )
}

function rotZ(v, a) { return [v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]] }
function rotY(v, a) { return [v[0]*Math.cos(a)-v[2]*Math.sin(a),v[1],v[0]*Math.sin(a)+v[2]*Math.cos(a)] }
function dot3D(v,w) { return v[0]*w[0]+v[1]*w[1]+v[2]*w[2] }
function angle(x,y,d) { return (dot3D(y, vec3.normalize(vec3.create(), d))<0?-1:1)*Math.acos(dot3D(x,vec3.normalize(vec3.create(),d))) }

function edge3(_p1, _p2) {
    v = map_3D(coords[_p1][0], coords[_p1][1])
    w = map_3D(coords[_p2][0], coords[_p2][1])
    m = map_3D((coords[_p1][0]+coords[_p2][0])/2,
               (coords[_p1][1]+coords[_p2][1])/2)
    mmv = vec3.subtract(vec3.create(), m, v)
    wmv = vec3.subtract(vec3.create(), w, v)
    if (dot3D(mmv, wmv) == 0) {
        return edge2(_p1, _p2);
    }
    pla = plane.fromPoints(plane.create(), m, v, w);
    c = vec3.scale(vec3.create(), pla, pla[3]);
    p = cart2pol(c, Math.abs(pla[3]))
    vmc = vec3.subtract(vec3.create(), v, c)
    wmc = vec3.subtract(vec3.create(), w, c)
    r = vec3.length(vmc)
    x = rotZ(rotY([1,0,0],-p[1]),p[0])
    y = rotZ(rotY([0,1,0],-p[1]),p[0])
    return [
        translate(c,
            rotate([0,0,p[0]],
                rotate([0,p[1],0],
                    rotate([0,0,angle(x,y,vmc)],
                        colorize([0,0,1],
                            extrudeRotate({segments: 64, angle: angle(x,y,wmc)-angle(x,y,vmc)},
                                circle({radius: er, center: [r,0]})
                            )
                        )
                    )
                )
            )
        )
    ]
}

function main(params) {
    out=[]

    sca = params.sca
    ef = (params.etype == 1) ? edge : (params.etype == 2) ? edge2 : edge3;
    if (params.sphere) {
        out.push(colorize([1,1,1],
            sphere({radius: sc-1, segments: 30}))
        )
    }

    for(i=0; i<adj.length; ++i) {
        // forall_vertices

        out.push(vertex(i))

        for(j=0; j<adj[i].length; ++j) {
            if (i<adj[i][j]) {
                // forall_edges

                out.push(ef(i, adj[i][j]))

                if (params.plan) {
                    out.push(colorize([0,0,0],edge(
                      [sca*sc*coords[i][0], sca*sc*coords[i][1], -sc],
                      [sca*sc*coords[adj[i][j]][0], sca*sc*coords[adj[i][j]][1], -sc],
                      true)))
                }
            }
        }
    }

    return out
}

module.exports = { main, getParameterDefinitions }

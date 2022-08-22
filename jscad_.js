    function rad2deg(r) {
        return r / Math.PI * 180;
    }

    function srad2deg(p) {
        return [rad2deg(p[0]), rad2deg(p[1])];
    }

    function out(x) {
        return (typeof(x) === 'object') ? JSON.stringify(x) : x;
    }

const jscad = require('@jscad/modeling')
const { colorize } = jscad.colors
const { cuboid, cube, sphere, cylinder, circle, polygon } = jscad.primitives
const { rotate, translate } = jscad.transforms
const { degToRad } = jscad.utils
const { add, normalize, length, scale, dot } = jscad.maths.vec3
const { extrudeRotate, extrudeLinear } = require('@jscad/modeling').extrusions
const { intersect, subtract, union } = require('@jscad/modeling').booleans
const { hull, hullChain } = require('@jscad/modeling').hulls
const { vectorText } = require('@jscad/modeling').text

function getParameterDefinitions() {
  return [
     { name: 'faces', type: 'choice', values: ['Pentagons', '6coloring', 'None'], initial: 'Pentagons', caption: 'face coloring:' },
    ,{ name: 'white', type: 'checkbox', checked: true, initial: '20', caption: 'surface of sphere:' },
    ,{ name: 'half', type: 'checkbox', checked: true, initial: '20', caption: 'half vertex:' },
    ,{ name: 'vtxt', type: 'choice', values: ['Id', 'Type', 'theta', 'phi', 'None'], initial: 'phi', caption: 'vtxt:' },
    ,{ name: 'look_inside', type: 'choice', values: ['no', 'yes'], initial: 'no', caption: 'look_inside:' }
  ];
}

function map_3D(c, sc) {
  return [Math.cos(c[0])*Math.sin(c[1])*sc, Math.sin(c[0])*Math.sin(c[1])*sc, Math.cos(c[1])*sc]
}

var eps = 1e-6

function vertex(_v, half=false) {
    const p = coords[_v] 
    const v = map_3D(p,sc)
    const s = sphere({radius: 0.5, center: v})
    if (half) {
        const la1 = p[0]
        const ph1 = degToRad(90) - p[1]
        return colorize([0, 0.7, 0],
            subtract(s,
                translate([0, 0, 0],
                    rotate([0, 0, la1],
                        rotate([0, -ph1, 0],
                            translate([sc+0.5, 0],
                                rotate([degToRad(90), 0, degToRad(90)],
                                    translate([-0, -0, -1],
                                         cuboid({size: [1, 1, 0.8]})
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    } else {
        return colorize([0, 0.7, 0], s)
    }
}

function txt(mesg, w) {
    const lineRadius = w / 2
    const lineCorner = circle({ radius: lineRadius })

    const lineSegmentPointArrays = vectorText({ x: 0, y: 0, height: 0.25, input: mesg })

    const lineSegments = []
    lineSegmentPointArrays.forEach(function(segmentPoints) {
        const corners = segmentPoints.map((point) => translate(point, lineCorner))
        lineSegments.push(hullChain(corners))
    })
    const message2D = union(lineSegments)
    return extrudeLinear({ height: w }, message2D)
}

function vtxt(_p1, num) {
    const str = num.toString()
    const p1 = coords[_p1]
    const la1 = p1[0]
    const ph1 = degToRad(90) - p1[1]
    return translate([0, 0, 0],
        rotate([0, 0, la1],
            rotate([0, -ph1, 0],
                translate([sc+0.5, 0.15-0.25*str.length],
                    rotate([degToRad(90), 0, degToRad(90)],
                        colorize([0, 0, 0],
                            txt(str, 0.05)
                        )
                    )
                )
            )
        )
    )
}

/*
function edge(_v, _w) {");
    const v = map_3D(coords[_v], sc)
    const w = map_3D(coords[_w], sc)
    var d = [0, 0, 0]
    var x = [0, 0, 0]
    subtract(d, w, v)
    add(x, v, w)
    scale(w, x, 0.5)
    return colorize([0, 0, 1, 1], 
        translate(w, 
            rotate([0, Math.acos(d[2]/length(d)), Math.atan2(d[1], d[0])],
                cylinder({radius: 0.1, height: length(d)})
            )
        )
    )
}
*/


function edge2(_p1, _p2, _e) {
    const p1 = coords[_p1]
    const p2 = coords[_p2]
    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy
    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course
    const la1 = p1[0]
    const la2 = p2[0]
    const l12 = la2 - la1
    const ph1 = degToRad(90) - p1[1]
    const ph2 = degToRad(90) - p2[1]
    const al1 = Math.atan2(Math.cos(ph2)*Math.sin(l12), Math.cos(ph1)*Math.sin(ph2)-Math.sin(ph1)*Math.cos(ph2)*Math.cos(l12))
    // delta sigma_12
    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae
    const s12 = Math.acos(Math.sin(ph1)*Math.sin(ph2)+Math.cos(ph1)*Math.cos(ph2)*Math.cos(l12))
    return rotate([0, 0, la1],
        rotate([0, -ph1, 0],
            rotate([degToRad(90)-al1, 0, 0],
                colorize([0, 0, 0.7],
                    extrudeRotate({segments: 32, angle: s12},
                        circle({radius: 0.1, center: [sc,0]})
                    )
                )
            )
        )
    )
}

function sp_tria2(r, tang, pang, thi, points, segments) {
    const coords = []
    const pts2 = Math.trunc(points / 2)

    for(i = 0; i<pts2; i=i+1) {
        var th = i*(tang/(pts2-1))
        coords.push([(r-thi/2)*Math.sin(th), (r-thi/2)*Math.cos(th)])
    }
    for(i = pts2-1; i>=0; i=i-1) {
        th = i*(tang/(pts2-1))
        coords.push([(r+thi/2)*Math.sin(th), (r+thi/2)*Math.cos(th)])
    }
    return extrudeRotate({segments: segments, angle: pang}, 
        polygon({points: coords})
    )
}

function sp_tria(_p1, _p2, _p3, sub) {
    const p1 = coords[_p1]
    const p2 = coords[_p2]
    const p3 = coords[_p3]
    // al/la/ph: alpha/lambda/phi | lxy/sxy: delta lambda_xy/sigma_xy
    // https://en.wikipedia.org/wiki/Great-circle_navigation#Course
    const la1 = p1[0]
    const la2 = p2[0]
    const la3 = p3[0]
    const l12 = la2 - la1
    const l13 = la3 - la1
    const l32 = la2 - la3
    const l23 = la3 - la2
    const l31 = la1 - la3
    const ph1 = degToRad(90) - p1[1]
    const ph2 = degToRad(90) - p2[1]
    const ph3 = degToRad(90) - p3[1]
    const al12 = Math.atan2(Math.cos(ph2)*Math.sin(l12), Math.cos(ph1)*Math.sin(ph2)-Math.sin(ph1)*Math.cos(ph2)*Math.cos(l12))
    const al13 = Math.atan2(Math.cos(ph3)*Math.sin(l13), Math.cos(ph1)*Math.sin(ph3)-Math.sin(ph1)*Math.cos(ph3)*Math.cos(l13))
    const al31 = Math.atan2(Math.cos(ph1)*Math.sin(l31), Math.cos(ph3)*Math.sin(ph1)-Math.sin(ph3)*Math.cos(ph1)*Math.cos(l31))
    const al32 = Math.atan2(Math.cos(ph2)*Math.sin(l32), Math.cos(ph3)*Math.sin(ph2)-Math.sin(ph3)*Math.cos(ph2)*Math.cos(l32))
    // delta sigma_xy
    // https://en.wikipedia.org/wiki/Great-circle_distance#Formulae
    const s12 = Math.acos(Math.sin(ph1)*Math.sin(ph2)+Math.cos(ph1)*Math.cos(ph2)*Math.cos(l12))
    const s23 = Math.acos(Math.sin(ph2)*Math.sin(ph3)+Math.cos(ph2)*Math.cos(ph3)*Math.cos(l23))
    const s13 = Math.acos(Math.sin(ph1)*Math.sin(ph3)+Math.cos(ph1)*Math.cos(ph3)*Math.cos(l13))

    if (s13 < s12) {
        if (s12 >= s23) {
            return sp_tria(_p1, _p3, _p2, sub)
        } else {
            return sp_tria(_p2, _p1, _p3, sub)
        }
    } else {
        if (s13 < s23) {
            return sp_tria(_p2, _p1, _p3, sub)
        } else if (Math.abs(s13-s12-s23) >= eps) {
            function mpi(ang) { return (ang < -Math.PI) ? 2*Math.PI + ang : ((ang > Math.PI) ? ang - 2*Math.PI : ang) }

            const v1 = map_3D(p1, 1)
            const v2 = map_3D(p2, 1)
            const v3 = map_3D(p3, 1)
            var ms = [0, 0, 0]
            var ms2 = [0, 0, 0]
            var sv1=[0, 0, 0]
            var sv2=[0, 0, 0]
            var sv3=[0, 0, 0]
            var s1=[0, 0, 0]
            var s2=[0, 0, 0]
            var s3=[0, 0, 0]
            add(ms, v1, v2)
            add(ms, ms, v3)
            normalize(ms2, ms)
            const mi = Math.min(dot(v1, ms2), dot(v2, ms2), dot(v3, ms2))

            scale(sv1, v1, sc)
            scale(sv2, v2, sc)
            scale(sv3, v3, sc)
            scale(s1, sv1, 1/mi)
            scale(s2, sv2, 1/mi)
            scale(s3, sv3, 1/mi)

            return colorize([0.5, 0.5, 0.5],
                subtract(
                    intersect(
                        union(
                            translate([0, 0, 0],
                                rotate([0, 0, la1-degToRad(180)],
                                    rotate([0, ph1-degToRad(90), 0],
                                        rotate([0,0,-al13],
                                            sp_tria2(sc, s12, mpi(al13-al12), 0.1, 24, 30)
                                        )
                                    )
                                )
                            ),
                            translate([0, 0, 0],
                                rotate([0, 0, la3-degToRad(180)],
                                    rotate([0, ph3-degToRad(90), 0],
                                        rotate([0, 0, -al31],
                                            sp_tria2(sc, s23, mpi(al31-al32), 0.1, 24, 30)
                                        )
                                    )
                                )
                            )
                        ),
                        hull(
                            cube({center: sv1, size: 0.01})
                            ,cube({center: sv2, size: 0.01})
                            ,cube({center: sv3, size: 0.01})
                            ,cube({center: s1, size: 0.01})
                            ,cube({center: s2, size: 0.01})
                            ,cube({center: s3, size: 0.01})
                        )
                   )
                   ,sub)
               )
        }
    }
}

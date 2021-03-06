"use strict"; // avoid module leak

var exports = {};
var ps = exports;

if (true) {
    var scrx;
    var scry;
    var set_;
    var frm;
    var r2d;
    var d2r;

    exports.set_ = function (length, r) {
        exports.length = length;
        exports.r = r;
    };

    exports.scrx = function (v) {
        return exports.length / 2 + (exports.length / 2 - exports.r - 10) * v;
    };

    exports.scry = function (v) {
        return exports.length / 2 - (exports.length / 2 - exports.r - 10) * v;
    };

    exports.frm = function (d) {
        return d.toFixed(1);
    }

    exports.r2d = function (r) {
        return r / Math.PI * 180;
    }

    exports.d2r = function (d) {
        return d / 180 * Math.PI;
    }

    scrx = exports.scrx;
    scry = exports.scry;
    set_  = exports.set_;
    frm  = exports.frm;
    d2r = exports.d2r;
    r2d = exports.r2d;


    exports.fill_outer_face = function (face, coords, rgb) {
        var size = exports.length;

        console.log(rgb + " setrgbcolor");

        console.log(' 0 ' + size);

        face.forEach(function (v) {
            console.log(' ' + frm(scrx(coords[0][v])) + ' ' + frm(scry(coords[1][v])));
        });
        console.log(' ' + 0 + ' ' + (size - 10));
        console.log(' 0 0');
        console.log(' ' + size + ' 0');
        console.log(' ' + size + ' ' + size);

        console.log('poly fill');


        console.log('  0 ' + size);
        console.log(' 0 ' + (size-10));
        console.log(' ' + frm(scrx(coords[0][face[face.length - 1]])) + ' ' + frm(scry(coords[1][face[face.length - 1]])));
        console.log(' ' + frm(scrx(coords[0][face[0]])) + ' ' + frm(scry(coords[1][face[0]])));
        console.log('poly fill');
    }

    exports.straight_line_drawing = function (G, coords, pent, length, r, outer, showpage, vcol = [], ecol = []) {
        var bx;
        var by;
        var cx;
        var cy;
        var dx;
        var dy;
        var v;
        var w;

        set_(length, r);

        if ((pent.length > 0) && (pent[0].length === 5)) {

            pent.forEach(function (face) {
                console.log(".75 setgray");
                face.forEach(function (v) {
                    console.log(' ' + frm(scrx(coords[0][v])) + ' ' + frm(scry(coords[1][v])));
                });
                console.log('poly fill');
            });

            if (outer.length === 5) {
                exports.fill_outer_face(outer, coords, "0.75 0.75 0.75");
            }
        }

        forall_edges(G, function (e) {
            v = source(G, e);
            w = target(G, e);
            if (v < w) {
                console.log(ecol.includes(e) ? "3 setlinewidth" : "1 setlinewidth");
                console.log("0 setgray");
                console.log(' ' + frm(scrx(coords[0][v])) + ' ' + frm(scry(coords[1][v])));
                console.log(' ' + frm(scrx(coords[0][w])) + ' ' + frm(scry(coords[1][w])));
                console.log('poly stroke');
            }
        });

        console.log("0 setgray 1 setlinewidth");

        forall_vertices(G, function (v) {
            console.log('(' + v + ') ' + frm(r) + ' ' + frm(scrx(coords[0][v])) + ' ' + frm(scry(coords[1][v])) + ' vertex');
            if (vcol.includes(v)) {
                console.log(frm(scrx(coords[0][v])) + ' ' + frm(scry(coords[1][v])) + ' ' + frm(r) + ' vmark');
            }
        });

        if ((pent.length > 0) && (pent[0].length === 2)) {
            cx = scrx(coords[0][0] + pent[0][0] * (coords[0][3] - coords[0][0]));
            cy = scry(coords[1][0] + pent[0][1] * (coords[1][3] - coords[1][0]));
            dx = scrx(coords[0][4] + pent[1][0] * (coords[0][7] - coords[0][4]));
            dy = scry(coords[1][4] + pent[1][1] * (coords[1][7] - coords[1][4]));

            console.log(".75 setgray");
            console.log(' ' + frm(dx) + ',' + frm(dy));
            bx = scrx(coords[0][7]);
            by = scry((coords[1][7] + coords[1][5]) / 2);
            console.log(' ' + frm(bx) + ',' + frm(by));
            bx = scrx((coords[0][1] + coords[0][5]) / 2);
            by = scry((coords[1][1] + coords[1][5]) / 2);
            console.log(' ' + frm(bx) + ',' + frm(by));
            bx = scrx((coords[0][1] + coords[0][0]) / 2);
            by = scry((coords[1][1] + coords[1][0]) / 2);
            console.log(' ' + frm(bx) + ',' + frm(by));
            console.log(' ' + frm(cx) + ',' + frm(cy));
            console.log('poly stroke');
        }

        if (showpage === undefined) {
            showpage = true;
        }

        if (showpage) {
            console.log('showpage');
        }
    };

    exports.header = function () {
        console.log("%!");
        console.log("1 setlinewidth");
        console.log("/Times-Roman findfont 12 scalefont setfont");

        console.log("2 99 translate");
        console.log("newpath 0 0 moveto 591 0 lineto 591 591 lineto 0 591 lineto closepath stroke");

        console.log("/vertex { 2 copy 5 4 roll dup 4 1 roll");
        console.log("  newpath 0 360 arc closepath");
        console.log("  gsave 1.0 setgray fill grestore");
        console.log("  stroke");
        console.log("  12 ge { ");
        console.log("    newpath moveto");
        console.log("    gsave dup false charpath flattenpath pathbbox grestore");
        console.log("    exch 4 1 roll exch sub -.5 mul 3 1 roll sub -.5 mul exch");
        console.log("    rmoveto show");
        console.log("  } { pop pop pop } ifelse");
        console.log("} def");

        console.log("/vmark {");
        console.log("  newpath 0 360 arc closepath");
        console.log("  gsave 0.25 setgray fill grestore");
        console.log("  stroke");
        console.log("} def");

        console.log("/txtdistdeg {");
        console.log("  newpath moveto");
        console.log("  gsave dup false charpath flattenpath pathbbox grestore");
        console.log("  exch 4 1 roll exch sub -.5 mul 3 1 roll sub -.5 mul exch");
        console.log("  5 3 roll gsave");
        console.log("  rotate 0 exch rmoveto");
        console.log("  rmoveto show");
        console.log("  grestore");
        console.log("} def");

        console.log("/poly {");
        console.log("  newpath");
        console.log("  moveto");
        console.log("  {");
        console.log("    count 0 eq { exit } if");
        console.log("    lineto");
        console.log("  } loop");
        console.log("} def");

    };

    exports.header2 = function () {
        console.log("%% http://computer-programming-forum.com/36-postscript/3d1b79b93a578811.htm");
        console.log("/arrow          %% angle /arrow -- draws arrowhead");
        console.log("{");
        console.log("gsave");
        console.log("  currentpoint translate 90 sub rotate .5 .5 scale");
        console.log("  newpath");
        console.log("  0.1 setlinewidth");
        console.log("  0 -15 moveto");
        console.log("  -6 -18 lineto");
        console.log("  -4 -15 -1 -9 0 0 curveto");
        console.log("  1 -9 4 -15 6 -18 curveto");
        console.log("  0 -15 lineto");
        console.log("  fill");
        console.log("grestore");
        console.log("} def");

        console.log("/arrowto        %% x1 y1 arrowto -- draws line with arrowhead");
        console.log("{");
        console.log("  2 copy                  % x1 y1 x1 y1");
        console.log("  currentpoint            % x1 y1 x1 y1 x0 y0");
        console.log("  3 -1 roll exch          % x1 y1 x1 x0 y1 y0");
        console.log("  sub                     % x1 y1 x1 x0 y1-y0");
        console.log("  3 1 roll                % x1 y1 y1-y0 x1 x0");
        console.log("  sub                     % x1 y1 y1-y0 x1-x0");
        console.log("  atan                    % x1 y1 theta");
        console.log("  3 1 roll                % theta x1 y1");
        console.log("  2 copy lineto           % theta x1 y1");
        console.log("  2 copy stroke moveto    % theta x1 y1");
        console.log("  3 -1 roll arrow         % x1 y1");
        console.log("  moveto");
        console.log("} def");

        console.log("/rarrowto {     %%  dx dy rarrowto --");
        console.log("  exch currentpoint       % dy dx x0 y0");
        console.log("  4 1 roll                % y0 dy dx x0");
        console.log("  add 3 1 roll            % x0+dx y0 dy");
        console.log("  add arrowto");
        console.log("} def");

        console.log("%% len dist cr cg cb angle x1 y1");
        console.log("/parrow {");
        console.log("  gsave");
        console.log("  newpath translate 0 0 moveto");
        console.log("  rotate");
        console.log("  setrgbcolor");
        console.log("  0 exch rmoveto");
        console.log("  0 rarrowto ");
        console.log("  grestore");
        console.log("} def");
    }


    exports.vertex_indicator = function (G, v, e, coords, r, da) {
        var w = opposite(G, v, e);
        var deg = r2d(Math.atan2(coords[1][v] - coords[1][w], coords[0][w] - coords[0][v]));
        console.log("gsave");
        v = w;
        e = next_incident_edge(G, v, e);
        w = opposite(G, v, e);
        var deg2 = r2d(Math.atan2(coords[1][v] - coords[1][w], coords[0][w] - coords[0][v]));
        var R = r;
        var t = (deg + 540 - deg2) % 360;
        var T = Math.tan(d2r(t))**2;
        var f = Math.sin(d2r(da)) * Math.sqrt((Math.sqrt(T + 1) + 1)**2 / T + 1);
        console.log("0 0 1 setrgbcolor");

        if (t > 2*da) {
            console.log("newpath " + frm(scrx(coords[0][v])) + " " + frm(scry(coords[1][v])) +
                        " " + frm(r) + " " + frm(deg2 + da) + " " + frm(deg -180 - da) +
                        " arc stroke");
            console.log("gsave " + frm(scrx(coords[0][v]) + R*Math.cos(d2r(deg - 180 - da))) +
                        " " + frm(scry(coords[1][v]) + R * Math.sin(d2r(deg - 180 - da))) +
                        " translate 0 0 moveto " + frm(deg - 180) + " rotate " + frm(r) +
                        " 0 lineto stroke grestore");
            console.log(frm(2*r) + " 0 0 0 1 " + frm(deg2) + " " +
                        frm(scrx(coords[0][v]) + R*Math.cos(d2r(deg2 + da))) + " " +
                        frm(scry(coords[1][v]) + R * Math.sin(d2r(deg2 + da))) + " parrow");
        } else {
            R = r*f;

            console.log("gsave " + frm(scrx(coords[0][v]) + R*Math.cos(d2r(deg - 180 - t/2))) +
                        " " + frm(scry(coords[1][v]) + R * Math.sin(d2r(deg - 180 - t/2))) +
                        " translate 0 0 moveto " + frm(deg - 180) + " rotate " + frm(r) +
                        " 0 lineto stroke grestore");
            console.log(frm(2*r) + " 0 0 0 1 " + frm(deg2) + " " +
                        frm(scrx(coords[0][v]) + R*Math.cos(d2r(deg2 + t/2))) + " " +
                        frm(scry(coords[1][v]) + R * Math.sin(d2r(deg2 + t/2))) + " parrow");
        }

        console.log("grestore");
    }
}

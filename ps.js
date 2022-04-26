"use strict"; // avoid module leak

var exports = {};
var ps = exports;

if (true) {
    var scrx;
    var scry;

    exports.set = function (length, r) {
        exports.length = length;
        exports.r = r;
    };

    exports.scrx = function (v) {
        return exports.length / 2 + (exports.length / 2 - exports.r - 10) * v;
    };

    exports.scry = function (v) {
        return exports.length / 2 - (exports.length / 2 - exports.r - 10) * v;
    };

    scrx = exports.scrx;
    scry = exports.scry;

    exports.straight_line_drawing = function (G, coords, pent, length, r, outer, showpage) {
        var bx;
        var by;
        var cx;
        var cy;
        var dx;
        var dy;
        var v;
        var w;

        exports.set(length, r);

        if ((pent.length > 0) && (pent[0].length === 5)) {

            pent.forEach(function (face) {
                console.log(".75 setgray");
                face.forEach(function (v) {
                    console.log(' ' + scrx(coords[0][v]) + ' ' + scry(coords[1][v]));
                });
                console.log('poly fill');
            });

            if (pent.length !== 12) {
                console.log(".75 setgray");
                console.log(' 0 0');

                outer.forEach(function (v) {
                    console.log(' ' + scrx(coords[0][v]) + ' ' + scry(coords[1][v]));
                });
                console.log(' ' + 0 + ' ' + length);
                console.log(' ' + length + ' ' + length);
                console.log(' ' + length + ' ' + 0);

                console.log('poly fill');

                console.log(".75 setgray");
                console.log(' 0 0');
                console.log(' ' + scrx(coords[0][0]) + ' ' + scry(coords[1][0]));
                console.log(' ' + scrx(coords[0][4]) + ' ' + scry(coords[1][4]));
                console.log(' ' + 0 + ' ' + length);
                console.log('poly fill');
            }
        }

        forall_edges(G, function (e) {
            v = source(G, e);
            w = target(G, e);
            if (v < w) {
                console.log("0 setgray");
                console.log(' ' + scrx(coords[0][v]) + ' ' + scry(coords[1][v]));
                console.log(' ' + scrx(coords[0][w]) + ' ' + scry(coords[1][w]));
                console.log('poly stroke');
            }
        });

        forall_vertices(G, function (v) {
            console.log('(' + (v + 1) + ') ' + r + ' ' + scrx(coords[0][v]) + ' ' + scry(coords[1][v]) + ' vertex');
        });

        if ((pent.length > 0) && (pent[0].length === 2)) {
            cx = scrx(coords[0][0] + pent[0][0] * (coords[0][3] - coords[0][0]));
            cy = scry(coords[1][0] + pent[0][1] * (coords[1][3] - coords[1][0]));
            dx = scrx(coords[0][4] + pent[1][0] * (coords[0][7] - coords[0][4]));
            dy = scry(coords[1][4] + pent[1][1] * (coords[1][7] - coords[1][4]));

            console.log(".75 setgray");
            console.log(' ' + dx + ',' + dy);
            bx = scrx(coords[0][7]);
            by = scry((coords[1][7] + coords[1][5]) / 2);
            console.log(' ' + bx + ',' + by);
            bx = scrx((coords[0][1] + coords[0][5]) / 2);
            by = scry((coords[1][1] + coords[1][5]) / 2);
            console.log(' ' + bx + ',' + by);
            bx = scrx((coords[0][1] + coords[0][0]) / 2);
            by = scry((coords[1][1] + coords[1][0]) / 2);
            console.log(' ' + bx + ',' + by);
            console.log(' ' + cx + ',' + cy);
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
        console.log("% " + process.argv.length + " " + process.argv[0]);
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
}

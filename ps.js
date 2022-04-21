"use strict"; // avoid module leak

var exports = {};
var ps = exports;

if (true) {
    exports.straight_line_drawing = function (G, coords, pent, length, r, outer) {
        var bx;
        var by;
        var cx;
        var cy;
        var dx;
        var dy;
        var v;
        var w;

        if ((pent.length > 0) && (pent[0].length === 5)) {

            pent.forEach(function (face) {
                console.log(".75 setgray");
                face.forEach(function (v) {
                    cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
                    cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
                    console.log(' ' + cx + ' ' + cy);
                });
                console.log('poly fill');
            });

            if (pent.length !== 12) {
                console.log(".75 setgray");
                console.log(' 0 0');

                outer.forEach(function (v) {
                    cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
                    cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
                    console.log(' ' + cx + ' ' + cy);
                });
                console.log(' ' + 0 + ' ' + length);
                console.log(' ' + length + ' ' + length);
                console.log(' ' + length + ' ' + 0);

                console.log('poly fill');

                console.log(".75 setgray");
                console.log(' 0 0');
                cx = length / 2 + (length / 2 - r - 10) * coords[0][outer[0]];
                cy = length / 2 + (length / 2 - r - 10) * coords[1][outer[0]];
                console.log(' ' + cx + ' ' + cy);
                cx = length / 2 + (length / 2 - r - 10) * coords[0][outer[4]];
                cy = length / 2 + (length / 2 - r - 10) * coords[1][outer[4]];
                console.log(' ' + cx + ' ' + cy);
                console.log(' ' + 0 + ' ' + length);
                console.log('poly fill');
            }
        }

        forall_edges(G, function (e) {
            v = source(G, e);
            w = target(G, e);
            if (v < w) {
                console.log("0 setgray");
                cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
                cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
                console.log(' ' + cx + ' ' + cy);
                dx = length / 2 + (length / 2 - r - 10) * coords[0][w];
                dy = length / 2 + (length / 2 - r - 10) * coords[1][w];
                console.log(' ' + dx + ' ' + dy);
                console.log('poly stroke');
            }
        });

        forall_vertices(G, function (v) {
            cx = length / 2 + (length / 2 - r - 10) * coords[0][v];
            cy = length / 2 + (length / 2 - r - 10) * coords[1][v];
            console.log('(' + (v + 1) + ') ' + r + ' ' + cx + ' ' + cy + ' vertex');
        });

        if ((pent.length > 0) && (pent[0].length === 2)) {
            cx = length / 2 + (length / 2 - r - 10) * (coords[0][0] + pent[0][0] * (coords[0][3] - coords[0][0]));
            cy = length / 2 + (length / 2 - r - 10) * (coords[1][0] + pent[0][1] * (coords[1][3] - coords[1][0]));
            dx = length / 2 + (length / 2 - r - 10) * (coords[0][4] + pent[1][0] * (coords[0][7] - coords[0][4]));
            dy = length / 2 + (length / 2 - r - 10) * (coords[1][4] + pent[1][1] * (coords[1][7] - coords[1][4]));

            console.log(".75 setgray");
            conssole.log(' ' + dx + ',' + dy);
            bx = length / 2 + (length / 2 - r - 10) * coords[0][7];
            by = length / 2 + (length / 2 - r - 10) * ((coords[1][7] + coords[1][5]) / 2);
            conssole.log(' ' + bx + ',' + by);
            bx = length / 2 + (length / 2 - r - 10) * ((coords[0][1] + coords[0][5]) / 2);
            by = length / 2 + (length / 2 - r - 10) * ((coords[1][1] + coords[1][5]) / 2);
            conssole.log(' ' + bx + ',' + by);
            bx = length / 2 + (length / 2 - r - 10) * ((coords[0][1] + coords[0][0]) / 2);
            by = length / 2 + (length / 2 - r - 10) * ((coords[1][1] + coords[1][0]) / 2);
            conssole.log(' ' + bx + ',' + by);
            conssole.log(' ' + cx + ',' + cy);
            console.log('poly stroke');

//            document.write('<circle cx="' + dx + '" cy="' + dy + '" r="' + r + '" stroke="red" fill="red"></circle>');
//            document.write('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="green" fill="green"></circle>');
        }

        console.log('showpage');
    };

    exports.header = function (selInd, slider, slider2, hidden) {
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

        console.log("/poly {");
        console.log("  newpath");
        console.log("  moveto");
        console.log("  {");
        console.log("    count 0 eq { exit } if");
        console.log("    lineto");
        console.log("  } loop");
        console.log("} def");

    }
}

"use strict"; // avoid module leak

var exports = {};
var htmlsvg = exports;

if (true) {
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
    };

    exports.header = function (selInd, slider, slider2, hidden, check) {
        document.body.innerHTML = '';

        document.write('<div><form id="myForm">');
        document.write('<select ' + hidden + ' id="frm" size="1" onInput="javascript:doi(document.forms[0].elements[0].selectedIndex)">');
        document.write('  <option ' + (
            (selInd === 0)
            ? "selected"
            : ""
        ) + ' value="C20">C20</option>');
        document.write('  <option ' + (
            (selInd === 1)
            ? "selected"
            : ""
        ) + ' value="C30">C30</option>');
        document.write('  <option ' + (
            (selInd === 2)
            ? "selected"
            : ""
        ) + ' value="C40">C40</option>');
        document.write('  <option ' + (
            (selInd === 3)
            ? "selected"
            : ""
        ) + ' value="C50">C50</option>');
        document.write('  <option ' + (
            (selInd === 4)
            ? "selected"
            : ""
        ) + ' value="C60">C60</option>');
        document.write('  <option ' + (
            (selInd === 5)
            ? "selected"
            : ""
        ) + ' value="C60">C70</option>');

        document.write('</select> <a href="https://github.com/Hermann-SW/planar_graph_playground#planar_graph_playground">planar_graph_playground github repo</a> hosting this "' + (
            hidden
            ? "cuboid surface shortest path"
            : "convex face planar straight line drawing"
        ) + '" tool"');
        document.write('</form></div>');

        if (!hidden) {
            document.write('Clicking on an edge redraws with that edge being top right edge. Its vertex closer to mouse pointer becomes top vertex.');
            document.write('<div><label for="myRange">factor: </label><input type="range" min="50" max="120" value="' + slider + '" id="myRange" name="myRangeN" onInput="javascript:doi(' + selInd + ')">');
        }

        document.write('<label for="myRange2">&nbsp;&nbsp;&nbsp;size: </label><input type="range" min="500" max="7000" value="' + slider2 + '" id="myRange2" onChange="javascript:doi(' + selInd + ')">');

        document.write('<label for="myCheckbox">&nbsp;&nbsp;&nbsp;dual: </label><input type="checkbox" id="myCheckbox" onChange="javaScript:doi(' + selInd + ')"' + (
            check
            ? " checked"
            : ""
        ) + '></div>');
    };

}

"use strict"; // avoid module leak

var exports = {};
var htmlsvg = exports;

if (true) {
    exports.straight_line_drawing = function (G, coords, length, r) {
        var cx;
        var cy;
        var dx;
        var dy;

        document.write('<svg width="' + length + '" height="' + length + '">');
        document.write('<style> .l { stroke:black; stroke-width:2; fill:none; } </style>');

        forall_edges(G, function (v, w) {
            if (v < w) {
                cx = length / 2 + (length / 2 - r) * coords[0][v];
                cy = length / 2 + (length / 2 - r) * coords[1][v];
                dx = length / 2 + (length / 2 - r) * coords[0][w];
                dy = length / 2 + (length / 2 - r) * coords[1][w];
                document.write('<line class="l" x1="' + cx + '" y1="' + cy + '" x2="' + dx + '" y2="' + dy + '"></line>');
            }
        });

        forall_vertices(G, function (v) {
            cx = length / 2 + (length / 2 - r) * coords[0][v];
            cy = length / 2 + (length / 2 - r) * coords[1][v];
            document.write('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="black" fill="white"></circle>');
            document.write('<text onclick="clck(' + v + ')" x="' + cx + '" y="' + (cy + 1) + '" alignment-baseline="middle" text-anchor="middle">' + (v + 1) + '</text>');
        });

        document.write('</svg>');
    };

    exports.header = function (selInd, slider, slider2) {
        document.body.innerHTML = '';

        document.write('<div><form id="myForm">');
        document.write('<select id="frm" size="1" onInput="javascript:doi(document.forms[0].elements[0].selectedIndex)">');
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

        document.write('</select> <a href="https://github.com/Hermann-SW/planar_graph_playground#planar_graph_playground">planar_graph_playground github repo</a> hosting this tool');
        document.write('</form></div>');

        document.write('<div><label for="myRange">factor: </label><input type="range" min="50" max="120" value="' + slider + '" id="myRange" name="myRangeN" onInput="javascript:doi(selInd)"></div>');

        document.write('<div><label for="myRange2">size: </label><input type="range" min="500" max="5000" value="' + slider2 + '" id="myRange2" onChange="javascript:doi(selInd)"></div>');
    };

}

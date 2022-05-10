"use strict"; // avoid module leak

#include "gauss-jordan.js"

var exports = {};
var tutte = exports;

if (true) {
    exports.convex_face_coordinates = function (Emb, face, factor) {
        var n = n_vertices(Emb);
        var v;
        var w;

        var X = zero(n, n);
        var Y = zero(n, n);
        var x = zero(n, 1);
        var y = zero(n, 1);

        var angle = Math.PI;
        var delta = factor * (2 * Math.PI) / face.length;

        assert.assert(is_embedding(Emb));
        face.forEach(function (v) {
            x[v] = Math.sin(angle);
            y[v] = Math.cos(angle);
            angle -= delta;
        });

        for (v = 0; v < n; v += 1) {
            if (face.includes(v)) {
                X[v][v] = 1;
                Y[v][v] = 1;
            } else {
                X[v][v] = -1;
                Y[v][v] = -1;

                forall_incident_edges(Emb, v, function (e) {
                    w = opposite(Emb, v, e);
                    X[v][w] = 1.0 / degree(Emb, v);
                    Y[v][w] = 1.0 / degree(Emb, v);
                });
            }
        }
        return [linear.solve(X, x), linear.solve(Y, y)];
    };
}

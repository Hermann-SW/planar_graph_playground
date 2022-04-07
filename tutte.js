function tutte(Emb, face, factor) {
    var n = Emb.length;
    var v;

    var X = linear.zero(n, n);
    var Y = linear.zero(n, n);
    var x = linear.zero(n, 1);
    var y = linear.zero(n, 1);

    var angle = Math.PI;
    var delta = factor * (2 * Math.PI) / face.length;
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

            Emb[v].forEach(function (w) {
                X[v][w] = 1.0 / degree(Emb, v);
                Y[v][w] = 1.0 / degree(Emb, v);
            });
        }
    }

    return [linear.solve(X, x), linear.solve(Y, y)];
}

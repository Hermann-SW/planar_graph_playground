function filled_array(n, m, v) {
    var zm = new Array(n);

    if (v === undefined) {
        v = 0;
    }
     
    if (m==1)
        zm.fill(v);
    else
        for (var j=0; j<n; j++) {
            zm[j] = filled_array(m, 1, v);
        }
    return zm;
}

function zero(n, m) {
    return filled_array(n, m, 0);
}


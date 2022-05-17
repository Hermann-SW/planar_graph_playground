var _ts = ["               init: ", "         parse2file: ",
                      "from_adjacency_list: ", "  graph list verify: ",
                      "       is_embedding: ", " compact5_traversal: ",
                      "         max_degree: ", "               exit: ",
                      "                sum: "];
var _t = new Array(9);
var __t = 0;
#define _  { \
    _t[__t] = new Date(); \
    __t = __t + 1; \
}

function _tdif(s, i, j) {
    console.error(_ts[s] + ((_t[j] - _t[i]) / 1000.0).toFixed(3) + "s");
}

_
_main(process.argv.length, process.argv);

_
for(var i=0; i < __t - 1; ++i) {
    _tdif(i, i, i+1);
}
_tdif(__t - 1, 0, __t - 1);

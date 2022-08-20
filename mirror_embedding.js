// Copyright: https://mit-license.org/

#include "assert.js"
#include "util.js"

assert.assert(process.argv.length > 2);

var adj = parse2file(process.argv[2]);

adj.forEach(function(l) {
    l.reverse();
});

console.log(adj);

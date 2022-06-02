var N = (process.argv.length >= 3) ? parseInt(process.argv[2]) : 10;
var seed = (process.argv.length === 4) ? parseInt(process.argv[3]) : 1234;

var mt19937 = new MersenneTwister(seed);

function rand_uint32() {
    return mt19937.genrand_int32();
}

for(; N > 0; N = N - 1) {
    console.log(rand_uint32());
}

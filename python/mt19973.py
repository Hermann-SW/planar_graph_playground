import numpy.random as vrng
from sys import argv

N = int(argv[1]) if len(argv) > 1 else 10
seed = int(argv[2]) if len(argv) > 2 else 1234

mt19937 = vrng.RandomState(seed)

def rand_uint32():
    return mt19937.randint(0,2**32)

for _ in range(N):
    print(rand_uint32())


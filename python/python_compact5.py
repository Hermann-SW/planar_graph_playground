''' python_compact5.py '''
from sys import argv

#include "undirected_graph.py"
#include "fullerenes.py"

sel = argv[1] if len(argv) > 1 else  "../graphs/10.a"

L = parse2file(sel)
G = from_adjacency_list(L)

for (v, l) in enumerate(L):
    for (j, w) in enumerate(l):
        assert w == opposite(G, v, G.V[v][j])

print("identical vertex ordering in adjacency list and graph verified")

assert is_embedding(G)
print("is_embedding(" + str(sel) + ") verified, has " + str(n_faces_planar(G)) + " faces")

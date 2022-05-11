''' xxx '''
from sys import argv
#include "undirected_graph.py"

assert len(argv) > 1
dual = len(argv) > 2

adj = parse2file(argv[1])

G = from_adjacency_list(adj)

assert is_embedding(G)

pent = pentagons(G)
print(len(pent), "pentagons for graph")

D = dual_graph(G)
print(len(pentagons(D)), "pentagons for dual graph")

if n_vertices(G) <= 100:
    print_graph(D if dual else G, "dual graph: " if dual else  "graph: ")

print("6-coloring of","dual" if dual else "", "graph")
if dual:
    G = D

col = six_coloring(G)

forall_vertices(G, lambda v: print(col[v], end=""))
print()

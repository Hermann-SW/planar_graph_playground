''' python_test.py '''

#include "util.py"
#include "undirected_graph.py"
#include "fullerenes.py"

G = from_adjacency_list(F[0])
assert is_embedding(G)

print("is_embedding(C20) verified, has " + str(n_faces_planar(G)) + " faces")
print_graph(G, "C20: ")

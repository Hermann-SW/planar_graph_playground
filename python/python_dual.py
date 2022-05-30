''' python_dual.py '''

#include "util.py"
#include "undirected_graph.py"
#include "fullerenes.py"

K4 = [[1, 3, 2], [2, 3, 0], [0, 3, 1], [0, 1, 2]]
K5me = [[1, 2, 3, 4], [2, 0, 4], [4, 3, 0, 1], [4, 0, 2], [1, 0, 3, 2]]
K = from_adjacency_list(K5me)

assert is_embedding(K)
print("is_embedding(K5-e) verified, has " + str(n_faces_planar(K)) + " faces")
print_graph(K, "K5-e: ")

D = dual_graph(K)
assert is_embedding(D)
print("is_embedding(dual_graph(K5-e)) verified, has " + str(n_faces_planar(D)) + " faces")
print_graph(D, "dual_graph(K5-e): ")


#pragma assert is_identical_graph(K, dual_graph(D))
#pragma print("is_identical(K5-e, dual_graph(dual_graph(K5-e))) verified")

#pragma print_graph(dual_graph(D), "dual_graph(dual_graph(K5-e)): ")

#pragma assert is_same_embedding(K, dual_graph(D))
#pragma print("is_same_embedding(K5-e, dual_graph(dual_graph(K5-e))) verified")

for [c, L] in list(enumerate(F)):
    K = from_adjacency_list(L)
    assert is_embedding(K)
    D = dual_graph(K)
    assert is_embedding(D)
    assert is_embedding(dual_graph(D))
    assert is_embedding(dual_graph(D))
    print("is_embedding() for C" + str(20 + c * 10) + ", its dual and dual(dual()) verified")

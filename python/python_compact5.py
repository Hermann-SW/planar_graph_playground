''' python_compact5.py '''
#include "undirected_graph.py"
#include "fullerenes.py"

#include "python_compact5.yp"

def _main(argc, argv):
    sel = argv[1] if argc > 1 else  "../graphs/10.a"
    _
    L = parse2file(sel)
    _
    G = from_adjacency_list(L)
    _
    for (v, l) in enumerate(L):
        for (j, w) in enumerate(l):
            assert w == opposite(G, v, G.V[v][j])

    _
    assert is_embedding(G)
    _
    compact5_traversal(G, compact5_traversal_visitor())
    _
    assert max_degree(G) <= 5
    _

    print("identical vertex ordering in adjacency list and graph verified")
    print("is_embedding(" + str(sel) + ") verified, has " + str(n_faces_planar(G)) + " faces")
    print("compat5_traversal(G, {}) done")
    print("maxdegree(G) <=5 verified")

_summary()

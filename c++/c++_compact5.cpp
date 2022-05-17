// Copyright: https://mit-license.org/

#include <vector>
#include "c++/undirected_graph.hpp"
#include "c++/c++_compact5.hpp"

int _main(int argc, char *argv[]) {
    const char *sel = (argc > 1 ? argv[1] : "../graphs/10.a");

  _ std::vector<std::vector<int>> L = parse2file(sel);
  _ graph G = from_adjacency_list(L);

  _ for (vertex v = 0; v < static_cast<vertex>(L.size()); ++v) {
        for (int j = 0; j < static_cast<int>(L[v].size()); ++j) {
            vertex w = L[v][j];
            assert(w == opposite(G, v, G.V[v][j]));
        }
    }

  _ assert(is_embedding(G));

  _ compact5_traversal(G, {});

  _ assert(max_degree(G) <= 5);
  _

    std::cout
        << "identical vertex ordering in adjacency list and graph verified"
        << std::endl;
    std::cout << "is_embedding(" << sel << ") verified, has "
              << n_faces_planar(G) << " faces" << std::endl;
    std::cout << "compat5_traversal(G, {}) done" << std::endl;
    std::cout << "maxdegree(G) <=5 verified" << std::endl;

    return 0;
}

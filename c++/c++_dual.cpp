// Copyright: https://mit-license.org/

#include "c++/util.hpp"
#include "c++/fullerenes.hpp"
#include "c++/undirected_graph.hpp"

std::vector<std::vector<vertex>> K4 =
    {{1, 3, 2}, {2, 3, 0}, {0, 3, 1}, {0, 1, 2}};
std::vector<std::vector<vertex>> K5me =
    {{1, 2, 3, 4}, {2, 0, 4}, {4, 3, 0, 1}, {4, 0, 2}, {1, 0, 3, 2}};
graph D;
graph  G = from_adjacency_list(K5me);

int main() {
    assert(is_embedding(G));
    std::cout << "is_embedding(K5-e) verified, has " << n_faces_planar(G)
              << " faces" << std::endl;
    print_graph(G, "K5-e: ");

    D = dual_graph(G);
    assert(is_embedding(D));
    std::cout << "is_embedding(dual_graph(K5-e)) verified, has "
              << n_faces_planar(D) << " faces" << std::endl;
    print_graph(D, "dual_graph(K5-e): ");

    print_graph(dual_graph(D), "dual_graph(dual_graph(K5-e)): ");

    for (int i = 0; i < static_cast<int>(F.size()); ++i) {
        G = from_adjacency_list(F[i]);
        assert(is_embedding(G));
        D = dual_graph(G);
        assert(is_embedding(D));
        assert(is_embedding(dual_graph(D)));
        std::cout << "is_embedding() for C" << (20 + i * 10)
                  << ", its dual and dual(dual()) verified" << std::endl;
    }
}


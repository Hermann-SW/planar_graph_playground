// Copyright: https://mit-license.org/

#include "c++/util.hpp"
#include "c++/fullerenes.hpp"
#include "c++/undirected_graph.hpp"

int main() {
    graph G = from_adjacency_list(F[0]);
    assert(is_embedding(G));

    std::cout << "is_embedding(C20) verified, has " << n_faces_planar(G)
              << " faces" << std::endl;
    print_graph(G, "C20: ");
}

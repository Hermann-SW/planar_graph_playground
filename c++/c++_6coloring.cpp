// Copyright: https://mit-license.org/

#include "c++/util.hpp"
#include "c++/undirected_graph.hpp"

int main(int argc, char *argv[]) {
    assert(argc > 1);
    bool dual = (argc > 2);

    std::vector<std::vector<int>> adj = parse2file(argv[1]);

    graph G = from_adjacency_list(adj);

    assert(is_embedding(G));

    std::vector<std::vector<vertex>> pent = pentagons(G);
    std::cout << pent.size() << " pentagons for graph" << std::endl;

    graph D = dual_graph(G);
    std::cout << pentagons(D).size() << " pentagons for dual graph"
              << std::endl;

    if (n_vertices(G) <= 100) {
        print_graph(dual ? D : G, dual ? "dual graph: " : "graph: ");
    }

    std::cout << "6-coloring of" << (dual ? " dual" : " ") << " graph"
              << std::endl;
    if (dual) {
        G = D;
    }

    std::vector<int> col = six_coloring(G);

    forall_vertices(G, [col](vertex v) {
        std::cout << col[v];
    });
    std::cout << std::endl;
}

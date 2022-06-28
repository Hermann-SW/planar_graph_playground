// Copyright: https://mit-license.org/

from sys import argv

#include "util.py"
#include "undirected_graph.py"

def ok(a,b,c,d,e,f):
    m = max(a, b, c, d, e, f)
    return ((m - a) <= 1) and ((m - b) <= 1) and ((m - c) <= 1) and ((m - d) <= 1) and ((m - e) <= 1) and ((m - f) <= 1)

assert len(argv) > 1

adj = parse2file(argv[1])

G = from_adjacency_list(adj)

assert is_embedding(G)

pent = pentagons(G)
print(str(len(pent)) + " pentagons for graph")
print(str(n_faces_planar(G) - len(pent)) + " non-pentagons for graph")

dist = [floyd_warshall(G)]

maxi = [0]
M = [[0,0,0,0]]

def update(D, m, M, a, b, c, d):
    if  D[0][a][b] + D[0][a][c] + D[0][a][d] + D[0][b][c] + D[0][b][d] + D[0][c][d] > m[0]:
        if ok(D[0][a][b], D[0][a][c], D[0][a][d], D[0][b][c], D[0][b][d], D[0][c][d]):
            m[0] = D[0][a][b] + D[0][a][c] + D[0][a][d] + D[0][b][c] + D[0][b][d] + D[0][c][d]
            M[0] = [a, b, c, d]

forall_vertices(G, lambda a:
    forall_vertices_after(G, a, lambda b:
        forall_vertices_after(G, b, lambda c:
            forall_vertices_after(G, c, lambda d:
                update(dist, maxi, M, a, b, c, d)
            )
        )
    )
)

print("vertices:", M[0])
print("max:", maxi[0])
print("dists:", dist[0][M[0][0]][M[0][1]], dist[0][M[0][0]][M[0][2]], dist[0][M[0][0]][M[0][3]],
                dist[0][M[0][1]][M[0][2]], dist[0][M[0][1]][M[0][3]], dist[0][M[0][2]][M[0][3]])

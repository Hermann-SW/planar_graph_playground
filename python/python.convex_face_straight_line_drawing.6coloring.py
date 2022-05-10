''' python.convex_face_straight_line_drawing.6coloring.py '''
from sys import argv

#include "undirected_graph.py"
#include "tutte.py"
#include "ps.py"
#include "fullerenes.py"

tutte = tutte()
ps = ps()

sel = argv[1] if len(argv) > 1 else "../graphs/C30.a"

def doi(x, dual):
    L = parse2file(x)
    G = from_adjacency_list(L)

    assert is_embedding(G)

    if dual:
        G = dual_graph(G)

    e = any_edge(G)

    doit(G, source(G, e), e)


def doit(G, v, e):
    slider = 100
    slider2 = 592
    size = slider2
    r = 12
    lmin = [99999]

    visited = filled_array(n_edges(G), 2, False)
    face = []
    rgb = ["0 0 1", "0 1 0", "1 0 0", "0 1 1", "1 0.5 0", "0 0.5 1"]

    pftv             = planar_face_traversal_visitor()
    pftv.next_vertex = face.append
    traverse_face(G, visited, v, e, ind(G, v, e), pftv)
    assert len(face) > 0

    coords = tutte.convex_face_coordinates(G, face, slider / 100.0)


    ps.header()
    ps.header2()

    ps.set(size, r)


    def min_edge(G, e, coords, lmin):
        v = source(G, e)
        w = target(G, e)
        cx = ps.scrx(coords[0][v])
        cy = ps.scry(coords[1][v])
        dx = ps.scrx(coords[0][w])
        dy = ps.scry(coords[1][w])
        dx -= cx
        dy -= cy
        lcur = math.sqrt(dx * dx + dy * dy)
        if lcur < lmin[0]:
            lmin[0] = lcur

    forall_edges(G, lambda e: min_edge(G, e, coords, lmin))

    if lmin[0] < 2 * r + 2:
        r = lmin[0] / 3
        ps.set(size, r)


    D = dual_graph(G)
    col = six_coloring(D)


    ps.fill_outer_face(face, coords, rgb[col[0]])


    def bf(last_face):
        last_face[0] += 1
        w = rgb[col[last_face[0]]]
        if last_face[0]:
            print(w + " setrgbcolor")

    def ef(last_face):
        if last_face:
            print("poly fill")

    def nv(v, last_face):
        if last_face:
            print(" " + str(ps.scrx(coords[0][v])) + " " + str(ps.scry(coords[1][v])))

    last_face = [-1]
    pftv                  = planar_face_traversal_visitor()
    pftv.begin_face       = lambda: bf(last_face)
    pftv.end_face         = lambda: ef(last_face[0])
    pftv.next_vertex      = lambda v: nv(v, last_face[0])
    planar_face_traversal(G, pftv)


    ps.straight_line_drawing(G, coords, [], size, r, [], False)


    last_face = [-1]
    cx = [0]
    cy = [0]
    w = [0]

    def bf2():
        last_face[0] += 1
        cx[0] = 0
        cy[0] = 0
        w[0] = 0

    def ef2():
        if last_face[0] != 0:
            print('0 0 (' + str(last_face[0]) + ') ' + str(cx[0] / w[0]) +
                  ' ' + str(cy[0] / w[0]) + ' txtdistdeg')

    def nv2(v):
        cx[0] += ps.scrx(coords[0][v])
        cy[0] += ps.scry(coords[1][v])
        w[0] += 1

    pftv                  = planar_face_traversal_visitor()
    pftv.begin_face       = bf2
    pftv.end_face         = ef2
    pftv.next_vertex      = nv2
    planar_face_traversal(G, pftv)

    print("showpage")

doi(sel, len(argv) > 2 and argv[2] == "-dual")

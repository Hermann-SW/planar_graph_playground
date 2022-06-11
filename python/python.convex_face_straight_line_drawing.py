''' python.convex_face_straight_line_drawing.py '''

#include "util.py"
#include "undirected_graph.py"
#include "tutte.py"
#include "ps.py"
#include "fullerenes.py"

tutte = tutte()
ps = ps()

K4 = [[1, 3, 2], [2, 3, 0], [0, 3, 1], [0, 1, 2]]
K4noemb = [[3, 1, 2], [2, 0, 3], [0, 3, 1], [0, 1, 2]]

def doi(x):
    G = from_adjacency_list(F[x])

    assert is_embedding(G)

    e = 9 if n_edges(G) > 9 else any_edge(G)

    doit(G, source(G, e), e)


def doit(G, v, e):
    slider = 100
    slider2 = 592
    size = slider2
    r = 12
    spl = -1

    ps.set_(size, r)

    visited = filled_array(n_edges(G), 2, False)
    face = []

    pftv            = planar_face_traversal_visitor()
    pftv.next_vertex = face.append
    traverse_face(G, visited, v, e, ind(G, v, e), pftv)
    assert len(face) > 0

    coords = tutte.convex_face_coordinates(G, face, slider / 100.0)

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

    lmin = [99999]
    forall_edges(G, lambda e: min_edge(G, e, coords, lmin))

    if lmin[0] < 2 * r + 2:
        r = lmin[0] / 3
        ps.set_(size, r)

    pent = pentagons(G)
    if len(face) == 5:
        tst = filled_array(n_vertices(G), 1, False)
        for w in face:
            tst[w] = True

        for [i, c] in list(enumerate(pent)):
            good = True
            for w in c:
                if not tst[w]:
                    good = False

            if good:
                spl = i

        if spl != -1:
            del pent[spl]

    ps.header()

    ps.straight_line_drawing(G, coords, pent, size, r, face if len(face) == 5 else [], False)

    def draw_edge_label(G, e, coords):
        v = source(G, e)
        w = target(G, e)
        cx = (ps.scrx(coords[0][v]) + ps.scrx(coords[0][w])) / 2
        cy = (ps.scry(coords[1][v]) + ps.scry(coords[1][w])) / 2
        print("() 1 " + ps.frm(cx) + " " + ps.frm(cy) + " vertex")
        deg = ps.r2d(math.atan2(coords[1][v] - coords[1][w], coords[0][w] - coords[0][v]))
        print("9 " + ps.frm(deg) + " (" + str(e) + ") " + ps.frm(cx) + " " + ps.frm(cy) + " txtdistdeg")

    forall_edges(G, lambda e: draw_edge_label(G, e, coords))

    print("showpage")

doi(1)

''' embedding_demo.py '''
import io

#include "util.py"
#include "undirected_graph.py"
#include "ps.py"

def print_to_string(*args, **kwargs):
    output = io.StringIO()
    print(*args, file=output, **kwargs)
    contents = output.getvalue()
    output.close()
    return contents


ps = ps()

K4      = [[1, 3, 2], [2, 3, 0], [0, 3, 1], [0, 1, 2]]
K4noemb = [[3, 1, 2], [2, 0, 3], [0, 3, 1], [1, 2, 0]]
F       = [ K4, K4noemb ]

acoords = [ [[0.9,0,-0.9,0], [-0.8,0.9,-0.8,0]], [[0.9,0,-0.9,0.8], [-0.8,0.9,-0.8,0]] ]


def draw(x):
    coords = acoords[x]

    G = from_adjacency_list(F[x])

    size = 592
    r = 12

    ps.set_(size, r)

    ps.straight_line_drawing(G, coords, [], size, r, [], False)


    def assgn(G, v, e, arr, x):
        arr[e][ind(G, v, e)] = x

    eface = filled_array(n_edges(G), 2, -1)
    last_face = [-1]
    cnt = [-1]
    pftv                  = planar_face_traversal_visitor()
    pftv.begin_face       = lambda: (incr(last_face), aset(cnt,0))
    pftv.next_vertex_edge = lambda v, e: (assgn(G, v, e, eface,
                                                str(last_face[0])+"_"+chr(97+cnt[0])),
                                          incr(cnt))
    planar_face_traversal(G, pftv)


    def draw_edge_label(G, e, coords):
        v = source(G, e)
        w = target(G, e)
        cx = (ps.scrx(coords[0][v]) + ps.scrx(coords[0][w])) / 2
        cy = (ps.scry(coords[1][v]) + ps.scry(coords[1][w])) / 2
        deg = ps.r2d(math.atan2(coords[1][v] - coords[1][w], coords[0][w] - coords[0][v]))
        print("12 " + ps.frm(deg) + " (" + eface[e][0] + ") " +
              ps.frm(cx) + " " + ps.frm(cy) + " txtdistdeg")
        print("12 " + ps.frm(180+deg) + " (" + eface[e][1] + ") " +
              ps.frm(cx) + " " + ps.frm(cy) + " txtdistdeg")

    forall_edges(G, lambda e: draw_edge_label(G, e, coords))


    print("0 0 (is_embedding=" + str(is_embedding(G)) + ",")
    print(" n_faces_planar=" + str(n_faces_planar(G)) + ",") 
    print(" traversed faces=" + str(last_face[0]+1) +") 300 20 txtdistdeg")
    print(r"0 0 (from_adjacency_list( " + print_to_string(F[x], end="") + r" )) 300 570 txtdistdeg")

    print("showpage")


ps.header()
draw(0)

print("2 99 translate")
print("newpath 0 0 moveto 591 0 lineto 591 591 lineto 0 591 lineto closepath stroke")
draw(1)

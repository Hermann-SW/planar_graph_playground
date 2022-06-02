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


    rgb = [ "0 0 1", "0 1 0", "1 0 0", "0.5 0.5 1" ]

    def draw_vertex_edge_vector(G, v, e, rgb):
        w = opposite(G, v, e)
        cx = (ps.scrx(coords[0][v]) + ps.scrx(coords[0][w])) / 2
        cy = (ps.scry(coords[1][v]) + ps.scry(coords[1][w])) / 2
        deg = math.atan2(coords[1][v] - coords[1][w], coords[0][w] - coords[0][v]) * 180 / math.pi
        print("30 6 " + rgb + " " + ps.frm(deg) +
              " " + ps.frm(cx) + " " + ps.frm(cy) + " parrow")

    last_face = [-1]
    pftv                  = planar_face_traversal_visitor()
    pftv.begin_face       = lambda: incr(last_face)
    pftv.next_vertex_edge = lambda v, e: draw_vertex_edge_vector(G, v, e,
                                                                 rgb[last_face[0] % len(rgb)])
    planar_face_traversal(G, pftv)


    print("0 0 (is_embedding=" + str(is_embedding(G)) + ",")
    print(" n_faces_planar=" + str(n_faces_planar(G)) + ",") 
    print(" traversed faces=" + str(last_face[0]+1) +") 300 20 txtdistdeg")
    print(r"0 0 (from_adjacency_list( " + print_to_string(F[x], end="") + r" )) 300 570 txtdistdeg")

    print("showpage")


ps.header()
ps.header2()
draw(0)

print("2 99 translate")
print("newpath 0 0 moveto 591 0 lineto 591 591 lineto 0 591 lineto closepath stroke")
draw(1)

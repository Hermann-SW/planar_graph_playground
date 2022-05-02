def filled_array(n, m, v=0):
    A = []
    for _ in range(n):
        a = []
        for _ in range(m):
            a.append(v)
        A.append(a)
    return A

def incr(arr, i=0):
    arr[i] += 1

def aset(arr, x, i=0):
    arr[i] = x

class graph:
    def __init__(self, n, m):
        self.V = filled_array(n, 0)
        self.E = filled_array(m, 0)

def dummy(_self, _v=0, _e=0):
    pass

class planar_face_traversal_visitor:
    begin_traversal  = lambda self: dummy
    end_traversal    = lambda self: dummy
    begin_face       = lambda self: dummy
    end_face         = lambda self: dummy
    next_vertex      = lambda self, v: dummy
    next_edge        = lambda self, e: dummy
    next_vertex_edge = lambda self, v, e: dummy

    def __init__(self):
        pass


def degree(G, v):
    return len(G.V[v])

def n_vertices(G):
    return len(G.V)

def n_edges(G):
    return len(G.E)

def n_faces(G, chi):
    return chi + n_edges(G) - n_vertices(G)

def n_faces_planar(G):
    return n_faces(G, 2)

def forall_vertices(G, f):
    for v in range(n_vertices(G)):
        f(v)

def forall_edges(G, f):
    for e in range(n_edges(G)):
        f(e)

def any_edge(G):
    return 0 if (len(G.E) > 0) else -1

def forall_incident_edges(G, v, f):
    for e in G.V[v]:
        f(e)

def source(G, e):
    return G.E[e][0][0]

def target(G, e):
    return G.E[e][1][0]

def new_vertex(G):
    v = n_vertices(G)
    G.V.append([])
    return v

def new_edge_vertex(G, v, e):
    G.E[e].append([v, degree(G, v)])
    G.V[v].append(e)
    return e

def new_edge1(G, v):
    e = n_edges(G)
    G.E.append([])
    return new_edge_vertex(G, v, e)

def new_edge(G, v, w):
    return new_edge_vertex(G, w, new_edge1(G, v))

def new_graph(n, m=0):
    return graph(n, m)

def choose2(n):
    return n * (n + 1) // 2

def from_adjacency_list(L):
    lookup = [0]*choose2(len(L))

    G = new_graph(len(L))

    for [v,l] in list(enumerate(L)):
        for w in l:
            if v < w:
                lookup[choose2(w) + v] = new_edge1(G, v)
            else:
                e = lookup[choose2(v) + w]
                new_edge_vertex(G, v, e)

    return G

def opposite(G, v, e):
    return target(G, e) if (v == source(G, e)) else source(G, e)

def ind(G, v, e):
    return 0 if (v == source(G, e)) else 1

def next_incident_edge(G, v, e):
    j = ind(G, v, e)
    return G.V[v][(G.E[e][j][1] + 1) % degree(G, v)]

def print_vertex(G, v):
    print(str(v) + ":", end="")
    forall_incident_edges(G, v, lambda e: print(" ("+str(e)+")"+str(opposite(G, v, e)), end=""))
    print()
    
def print_graph(G, st=""):
    print(st+str(n_vertices(G))+" vertices, "+str(n_edges(G))+" edges")
    forall_vertices(G, lambda v: print_vertex(G, v))

def face_vertices(Emb, v, e):
    o = e
    face = []
    while True:
        v = opposite(Emb, v, e)
        e = next_incident_edge(Emb, v, e)
        face.append(v)
        if e == o:
            break

    return face

def traverse_face(G, visited, v, e, i, pftv):
    while not visited[e][i]:
        visited[e][i] = True
        pftv.next_vertex(v)
        pftv.next_edge(e)
        pftv.next_vertex_edge(v, e)
        v = opposite(G, v, e)
        e = next_incident_edge(G, v, e)
        i = ind(G, v, e)

def check_traverse(G, visited, v, e, pftv):
    i = ind(G, v, e)
    if not visited[e][i]:
        pftv.begin_face()
        traverse_face(G, visited, v, e, i, pftv)
        pftv.end_face()

def check_traverse2(G, visited, g, pftv):
    check_traverse(G, visited, source(G, g), g, pftv)
    check_traverse(G, visited, target(G, g), g, pftv)

def planar_face_traversal(G, pftv):
#pragma    visited = [[False,False]]*n_edges(G)
    visited = filled_array(n_edges(G), 2, False)

    pftv.begin_traversal()

    forall_edges(G, lambda g: check_traverse2(G, visited, g, pftv))

    pftv.end_traversal()

def is_embedding(G):
    nfaces = [0]

    pftv            = planar_face_traversal_visitor()
    pftv.begin_face = lambda: incr(nfaces)
    planar_face_traversal(G, pftv)

    return n_vertices(G) - n_edges(G) + nfaces[0] == 2

def pentagons(Emb):
    def init_face(f):
        f[0] = []

    def append_pent(p, f):
        if f.length == 5:
            p[0].append(f)

    def face_add(f, v):
        f[0].append(v)
    
    pent = [[]]
    face = [[]]

    pftv = planar_face_traversal_visitor()
    pftv.begin_face  = lambda: init_face(face)
    pftv.end_face    = lambda: append_pent(pent, face[0])
    pftv.next_vertex = lambda v: face_add(face, v)

    planar_face_traversal(Emb, pftv)

    return pent

def dual_graph(G):
    last_face = [-1]

    D = new_graph(n_faces_planar(G), n_edges(G))

    pftv            = planar_face_traversal_visitor()
    pftv.begin_face = lambda: incr(last_face)
    pftv.next_edge  = lambda e: new_edge_vertex(D, last_face[0], e)
    planar_face_traversal(G, pftv)

    return D

def is_identical_graph(G, H):
    if n_vertices(G) != n_vertices(H):
        return False
    if n_edges(G) != n_edges(H):
        return False
    for [i,v] in list(enumerate(G.V)):
        for [j,e] in list(enumerate(v)):
            if e != H.V[i][j]:
                return False
    for [i,e] in list(enumerate(G.E)):
        for [j,v] in list(enumerate(e)):
            for [k,x] in list(enumerate(v)):
                if x != H.E[i][j][k]:
                    return False
    return True



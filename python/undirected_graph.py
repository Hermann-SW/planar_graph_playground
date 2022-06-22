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

class compact5_traversal_visitor:
    begin_traversal  = lambda self: dummy
    end_traversal    = lambda self: dummy
    begin_vertex     = lambda self, v: dummy
    end_vertex       = lambda self, v: dummy
    next_edge        = lambda self, e: dummy
    next_vertex_edge = lambda self, v, e: dummy

    def __init__(self):
        pass

def empty_graph():
    return graph(0, 0)

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

def max_degree(G):
    mdeg = [-1]

    def update_mdeg(v):
        if degree(G, v) > mdeg[0]:
            mdeg[0] = degree(G, v)

    forall_vertices(G, update_mdeg)

    return mdeg[0]

def forall_edges(G, f):
    for e in range(n_edges(G)):
        f(e)

def any_edge(G):
    return 0 if (len(G.E) > 0) else -1

def first_incident_edge(G, v):
    return  -1 if degree(G, v) == 0 else G.V[v][0]

def forall_incident_edges(G, v, f):
    for e in G.V[v]:
        f(e)

def forall_incident2_edges(G, a, f):
    for v in a:
        for e in G.V[v]:
            f(v, e)

def source(G, e):
    return G.E[e][0][0]

def target(G, e):
    return G.E[e][1][0]

def opposite(G, v, e):
    return target(G, e) if (v == source(G, e)) else source(G, e)

def ind(G, v, e):
    return 0 if (v == source(G, e)) else 1

def next_incident_edge(G, v, e):
    j = ind(G, v, e)
    return G.V[v][(G.E[e][j][1] + 1) % degree(G, v)]

def prev_incident_edge(G, v, e):
    j = ind(G, v, e)
    return G.V[v][(G.E[e][j][1] + degree(G, v) - 1) % degree(G, v)]

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

def remove_edge1(G, v, e):
    i = ind(G, v, e)
    f = G.V[v].pop()
    if e != f: 
        j = ind(G, v, f)
        G.E[f][j][1] = G.E[e][i][1]
        G.V[v][G.E[f][j][1]] = f

    G.E[e][i][1] = -1

def print_vertex(G, v):
    print(str(v) + ":", end="")
    forall_incident_edges(G, v, lambda e: print(" ("+str(e)+")"+str(opposite(G, v, e)), end=""))
    print()
    
def print_graph(G, st=""):
    print(st+str(n_vertices(G))+" vertices, "+str(n_edges(G))+" edges")
    forall_vertices(G, lambda v: print_vertex(G, v))

def compact5_traversal(G, c5v):
    S = []
    small = filled_array(n_vertices(G), 1, False)

    c5v.begin_traversal()

    def update_small(v):
        if degree(G, v) < 6:
            S.append(v)
            small[v] = True

    forall_vertices(G, update_small)

    while len(S) > 0:
        v = S.pop()

        c5v.begin_vertex(v)

        def work_edge(v, e):
            w = opposite(G, v, e)
            c5v.next_edge(e)
            c5v.next_vertex_edge(v, e)
            remove_edge1(G, w, e)
            if (not(small[w]) and (degree(G, w) < 6)):
                S.append(w) 
                small[w] = True

        forall_incident_edges(G, v, lambda e: work_edge(v, e))

        c5v.end_vertex(v)

    c5v.end_traversal()

def compact5_find(C, v, w):
    ret = [-1]

    def update_ret(u, x, e):
        if opposite(C, u, e) == x:
            ret[0] = e

    forall_incident_edges(C, v, lambda e: update_ret(v, w, e))
    forall_incident_edges(C, w, lambda e: update_ret(w, v, e))

    return ret[0]

def from_adjacency_list(L):
    C = new_graph(len(L))

    for (v, l) in enumerate(L):
        for w in l:
            if v < w:
                new_edge(C, v, w)

    compact5_traversal(C, compact5_traversal_visitor())

    if max_degree(C) > 5:
        return empty_graph()

    G = new_graph(len(L))

    for (v, l) in enumerate(L):
        for w in l:
            if v < w:
                new_edge1(G, v)
            else:
                e = compact5_find(C, v, w)
                assert e != -1
                new_edge_vertex(G, v, e)

    return G

def from_adjacency_list_lookup(L):
    def choose2(n):
        return n * (n + 1) // 2

    lookup = filled_array(choose2(len(L)), 1) 

    G = new_graph(len(L))

    for [v,l] in list(enumerate(L)):
        for w in l:
            if v < w:
                lookup[choose2(w) + v] = new_edge1(G, v)
            else:
                e = lookup[choose2(v) + w]
                new_edge_vertex(G, v, e)

    return G

def six_coloring(G):
    S = []
    col = filled_array(n_vertices(G), 1, -1)
    mc = [0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,
          0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0]

    c5tv = compact5_traversal_visitor()
    c5tv.begin_vertex = S.append
    compact5_traversal(G, c5tv)

    bs = [ 0 ]

    def edge_bit(v, e):
        bs[0] |= 1 << col[opposite(G, v, e)]

    while len(S) > 0:
        bs[0] = 0
        v = S.pop()
        forall_incident_edges(G, v, lambda e: edge_bit(v, e))

        assert bs[0] < len(mc)
        col[v] = mc[bs[0]]

    return col

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

    pent = [[],[]]
    face = [[]]

    pftv = planar_face_traversal_visitor()
    pftv.begin_face  = lambda: init_face(face)
    pftv.end_face    = lambda: pent[0 if len(face[0]) == 5 else 1].append(face[0])
    pftv.next_vertex = lambda v: face[0].append(v)
#pragma    pftv.next_vertex = face[0].append

    planar_face_traversal(Emb, pftv)

    return pent[0]

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



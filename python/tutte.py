
class tutte:
    ''' tutte '''
    def __init__(self):
        self.x = 42

    @staticmethod
    def convex_face_coordinates(Emb, face, factor):
        n = n_vertices(Emb)

        X = np.zeros((n, n))
        Y = np.zeros((n, n))
        x = np.zeros(n)
        y = np.zeros(n)

        angle = math.pi
        delta = factor * (2 * math.pi) / len(face)

        assert is_embedding(Emb)
        for v in face:
            x[v] = math.sin(angle)
            y[v] = math.cos(angle)
            angle -= delta

        def handle_edge(Emb, v, e):
            w = opposite(Emb, v, e)
            X[v][w] = 1.0 / degree(Emb, v)
            Y[v][w] = 1.0 / degree(Emb, v)

        for v in range(n):
            if v in face:
                X[v][v] = 1
                Y[v][v] = 1
            else:
                X[v][v] = -1
                Y[v][v] = -1

                forall_incident_edges(Emb, v, lambda e: handle_edge(Emb, v, e))

        return [np.linalg.solve(X, x), np.linalg.solve(Y, y)]

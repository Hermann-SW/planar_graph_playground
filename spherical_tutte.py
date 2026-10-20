import ast
import gzip
import os
import sys
import numpy as np
from scipy import sparse
from scipy.sparse.linalg import spsolve
import matplotlib.pyplot as plt
from matplotlib.widgets import Button, Slider, TextBox


# =============================================================================
# 1. File Loaders (.a and .gz) & Planar Graph Parser
# =============================================================================
def load_graph_file_a(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read().strip()
    raw_input = ast.literal_eval(content)
    if not isinstance(raw_input, list) or not raw_input:
        raise ValueError(f"Expected a non-empty nested list in {filepath}")
    n_verts = max(v for row in raw_input for v in row) + 1
    return n_verts, raw_input


def load_all_graphs_from_gz(filepath):
    """
    Parses all graphs from a multi-graph '.gz' writegraph3d file into a list.
    """
    all_graphs = []
    current_graph = []

    with gzip.open(filepath, "rt", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith(">>"):
                continue
            parts = line.split()
            if parts[0] == "0":
                if current_graph:
                    all_graphs.append(current_graph)
                    current_graph = []
                continue
            nbrs_0based = [int(tok) - 1 for tok in parts[4:]]
            current_graph.append(nbrs_0based)

    if current_graph:
        all_graphs.append(current_graph)

    if not all_graphs:
        raise ValueError(f"No valid graphs found in {filepath}")

    return all_graphs


def parse_planar_graph_input(n_verts, data):
    is_rotation_system = False
    if len(data) == n_verts:
        sets = [set(row) for row in data]
        if all(
            0 <= v < n_verts and v != u and (u in sets[v])
            for u in range(n_verts)
            for v in sets[u]
        ):
            is_rotation_system = True

    if is_rotation_system:
        adj = [list(row) for row in data]
        edge_set = set()
        for u in range(n_verts):
            for v in adj[u]:
                edge_set.add((min(u, v), max(u, v)))
        edges = sorted(edge_set)

        visited_half_edges = set()
        faces = []
        for u in range(n_verts):
            for v in adj[u]:
                if (u, v) in visited_half_edges:
                    continue
                face = []
                curr_u, curr_v = u, v
                while (curr_u, curr_v) not in visited_half_edges:
                    visited_half_edges.add((curr_u, curr_v))
                    face.append(curr_u)
                    nbrs_v = adj[curr_v]
                    idx = nbrs_v.index(curr_u)
                    next_w = nbrs_v[(idx + 1) % len(nbrs_v)]
                    curr_u, curr_v = curr_v, next_w
                faces.append(face)

        face_sizes = sorted({len(f) for f in faces})
        print(
            f"[Input Auto-Detect] Planar Rotation System: "
            f"|V|={n_verts}, |E|={len(edges)}, |F|={len(faces)} faces (sizes: {face_sizes})",
            flush=True,
        )
        return edges, faces, adj
    else:
        faces = [list(f) for f in data]
        edge_set = set()
        adj_sets = [set() for _ in range(n_verts)]
        for f in faces:
            k = len(f)
            for i in range(k):
                u, v = f[i], f[(i + 1) % k]
                edge_set.add((min(u, v), max(u, v)))
                adj_sets[u].add(v)
                adj_sets[v].add(u)
        edges = sorted(edge_set)
        adj = [sorted(list(s)) for s in adj_sets]
        face_sizes = sorted({len(f) for f in faces})
        print(
            f"[Input Auto-Detect] Face List: "
            f"|V|={n_verts}, |E|={len(edges)}, |F|={len(faces)} faces (sizes: {face_sizes})",
            flush=True,
        )
        return edges, faces, adj


# =============================================================================
# 2. Stage 1: Well-Conditioned 2D Tutte Init + Optional Corner Triples
# =============================================================================
def face_determinants(X, tris_arr):
    if len(tris_arr) == 0:
        return np.ones(0, dtype=np.float64)
    U = X[tris_arr[:, 0]]
    V = X[tris_arr[:, 1]]
    W = X[tris_arr[:, 2]]
    return np.sum(np.cross(U, V) * W, axis=1)


def gnomonic_polygon_tutte_init(n_verts, edges, faces, adj, radius=1.8):
    n_faces = len(faces)
    n_total = n_verts + n_faces

    outer_face_idx = int(np.argmax([len(f) for f in faces]))
    outer_face = list(faces[outer_face_idx])
    south_vertex = n_verts + outer_face_idx

    k_out = len(outer_face)
    angles = np.linspace(0.0, 2.0 * np.pi, k_out, endpoint=False)
    bnd_xy = np.column_stack([radius * np.cos(angles), radius * np.sin(angles)])

    pinned_set = set(outer_face)
    int_real_verts = sorted(set(range(n_verts)) - pinned_set)
    int_map = {v: i for i, v in enumerate(int_real_verts)}
    bnd_map = {v: i for i, v in enumerate(outer_face)}
    n_int = len(int_real_verts)

    L_II = sparse.lil_matrix((n_int, n_int), dtype=np.float64)
    rhs = np.zeros((n_int, 2), dtype=np.float64)

    for row, u in enumerate(int_real_verts):
        deg_u = 0.0
        for v in adj[u]:
            if v in int_map:
                L_II[row, int_map[v]] = -1.0
                deg_u += 1.0
            elif v in bnd_map:
                rhs[row] += bnd_xy[bnd_map[v]]
                deg_u += 1.0
        L_II[row, row] = deg_u

    int_xy = spsolve(L_II.tocsr(), rhs)

    xy_real = np.zeros((n_verts, 2), dtype=np.float64)
    for i, v in enumerate(outer_face):
        xy_real[v] = bnd_xy[i]
    for i, v in enumerate(int_real_verts):
        xy_real[v] = int_xy[i]

    oriented_faces = []
    for f_idx, f in enumerate(faces):
        pts = xy_real[f]
        x_p, y_p = pts[:, 0], pts[:, 1]
        area_2d = 0.5 * np.sum(x_p * np.roll(y_p, -1) - np.roll(x_p, -1) * y_p)
        if f_idx != outer_face_idx:
            oriented_faces.append(list(f) if area_2d > 0.0 else list(reversed(f)))
        else:
            oriented_faces.append(list(f) if area_2d < 0.0 else list(reversed(f)))

    X_aug = np.zeros((n_total, 3), dtype=np.float64)
    for v in range(n_verts):
        p = np.array([xy_real[v, 0], xy_real[v, 1], 1.0])
        X_aug[v] = p / np.linalg.norm(p)

    for f_idx, f in enumerate(oriented_faces):
        c_v = n_verts + f_idx
        if f_idx == outer_face_idx:
            X_aug[c_v] = np.array([0.0, 0.0, -1.0])
        else:
            c_xy = np.mean(xy_real[f], axis=0)
            p = np.array([c_xy[0], c_xy[1], 1.0])
            X_aug[c_v] = p / np.linalg.norm(p)

    edge_to_face_sizes = {e: [] for e in edges}
    for f in oriented_faces:
        k = len(f)
        for i in range(k):
            u, v = f[i], f[(i + 1) % k]
            key = (min(u, v), max(u, v))
            if key in edge_to_face_sizes:
                edge_to_face_sizes[key].append(k)

    edge_weights = np.ones(len(edges), dtype=np.float64)
    for idx, e in enumerate(edges):
        sizes = edge_to_face_sizes[e]
        if len(sizes) >= 2:
            edge_weights[idx] = 0.5 * ((sizes[0] / 5.0) ** 1.6 + (sizes[1] / 5.0) ** 1.6)

    star_tris = []
    star_weights = []
    corner_tris = []
    corner_weights = []
    inner_spokes = []
    inner_spoke_w = []
    outer_spokes = []

    for f_idx, f in enumerate(oriented_faces):
        c_v = n_verts + f_idx
        k = len(f)
        for i in range(k):
            u_prev = f[(i - 1) % k]
            u_curr = f[i]
            u_next = f[(i + 1) % k]

            star_tris.append([c_v, u_curr, u_next])
            star_weights.append(1.0 / k)

            if f_idx == outer_face_idx:
                outer_spokes.append((c_v, u_curr))
            else:
                inner_spokes.append((c_v, u_curr))
                inner_spoke_w.append(1.0 / k)

            if k >= 4:
                corner_tris.append([u_prev, u_curr, u_next])
                corner_weights.append(1.2 if k >= 10 else 0.8)

    c_tris_arr = (
        np.asarray(corner_tris, dtype=np.int64).reshape(-1, 3)
        if len(corner_tris) > 0
        else np.zeros((0, 3), dtype=np.int64)
    )
    c_weights_arr = (
        np.asarray(corner_weights, dtype=np.float64)
        if len(corner_weights) > 0
        else np.zeros(0, dtype=np.float64)
    )

    return (
        X_aug,
        oriented_faces,
        outer_face_idx,
        edge_weights,
        np.asarray(star_tris, dtype=np.int64),
        np.asarray(star_weights, dtype=np.float64),
        c_tris_arr,
        c_weights_arr,
        np.asarray(inner_spokes, dtype=np.int64),
        np.asarray(inner_spoke_w, dtype=np.float64),
        np.asarray(outer_spokes, dtype=np.int64),
    )


# =============================================================================
# 3. Stage 2: Barrier-Spring Solver
# =============================================================================
def optimize_spherical_barrier_equilibrium(
    X_aug_init,
    n_verts,
    real_edges,
    edge_weights,
    outer_face_idx,
    star_tris,
    star_w,
    corner_tris,
    corner_w,
    inner_spokes,
    inner_spoke_w,
    outer_spokes,
    tol=1e-10,
):
    X = X_aug_init.copy()
    edges_arr = np.asarray(real_edges, dtype=np.int64)
    edge_w_col = edge_weights[:, None]
    south_vertex = n_verts + outer_face_idx

    n_corners = len(corner_tris)
    if n_corners > 0:
        init_c_dets = face_determinants(X, corner_tris)
        is_hard = init_c_dets > 1e-5
    else:
        is_hard = np.zeros(0, dtype=bool)

    schedule = [
        (350, 0.25, 0.08, 12.0, 0.06, 0.90, 12.0, True),
        (350, 0.08, 0.06, 20.0, 0.02, 0.15, 24.0, False),
        (450, 0.02, 0.04, 30.0, 0.005, 0.01, 45.0, False),
    ]

    total_iters = 0
    grad_norm = 0.0
    tau = 0.015
    eps_0 = 0.003

    for (
        max_iter,
        mu_star,
        mu_corner,
        w_push,
        w_in_sp,
        w_out_sp,
        k_centroid,
        pin_south,
    ) in schedule:
        eff_star_w = mu_star * star_w
        eff_in_spoke_w = (w_in_sp * inner_spoke_w)[:, None]

        def compute_energy_and_grad(Y, hard_mask):
            s_dets = face_determinants(Y, star_tris)
            if np.any(s_dets <= 1e-13):
                return np.inf, None

            if n_corners > 0:
                c_dets = face_determinants(Y, corner_tris)
                if np.any(c_dets[hard_mask] <= 1e-13):
                    return np.inf, None

            grad = np.zeros_like(Y)

            diffs_real = Y[edges_arr[:, 0]] - Y[edges_arr[:, 1]]
            e_spring = 0.5 * np.sum(edge_w_col * (diffs_real * diffs_real))
            np.add.at(grad, edges_arr[:, 0], edge_w_col * diffs_real)
            np.add.at(grad, edges_arr[:, 1], -edge_w_col * diffs_real)

            diffs_in = Y[inner_spokes[:, 0]] - Y[inner_spokes[:, 1]]
            e_in_sp = 0.5 * np.sum(eff_in_spoke_w * (diffs_in * diffs_in))
            np.add.at(grad, inner_spokes[:, 0], eff_in_spoke_w * diffs_in)
            np.add.at(grad, inner_spokes[:, 1], -eff_in_spoke_w * diffs_in)

            diffs_out = Y[outer_spokes[:, 0]] - Y[outer_spokes[:, 1]]
            e_out_sp = 0.5 * w_out_sp * np.sum(diffs_out * diffs_out)
            np.add.at(grad, outer_spokes[:, 0], w_out_sp * diffs_out)
            np.add.at(grad, outer_spokes[:, 1], -w_out_sp * diffs_out)

            e_star_bar = -np.sum(eff_star_w * np.log(s_dets))
            Us = Y[star_tris[:, 0]]
            Vs = Y[star_tris[:, 1]]
            Ws = Y[star_tris[:, 2]]
            inv_s = (eff_star_w / s_dets)[:, None]
            np.add.at(grad, star_tris[:, 0], -inv_s * np.cross(Vs, Ws))
            np.add.at(grad, star_tris[:, 1], -inv_s * np.cross(Ws, Us))
            np.add.at(grad, star_tris[:, 2], -inv_s * np.cross(Us, Vs))

            e_corner = 0.0
            if n_corners > 0:
                Uc = Y[corner_tris[:, 0]]
                Vc = Y[corner_tris[:, 1]]
                Wc = Y[corner_tris[:, 2]]

                dE_dc = np.zeros(n_corners, dtype=np.float64)

                if np.any(hard_mask):
                    hw = mu_corner * corner_w[hard_mask]
                    hd = c_dets[hard_mask]
                    e_corner += -np.sum(hw * np.log(hd))
                    dE_dc[hard_mask] = -hw / hd

                soft_mask = ~hard_mask
                if np.any(soft_mask):
                    sw = w_push * corner_w[soft_mask]
                    sd = c_dets[soft_mask]
                    delta = tau - sd
                    rad = np.sqrt(delta * delta + eps_0 * eps_0)
                    e_corner += np.sum(sw * (rad + delta))
                    dE_dc[soft_mask] = -sw * (1.0 + delta / rad)

                dE_col = dE_dc[:, None]
                np.add.at(grad, corner_tris[:, 0], dE_col * np.cross(Vc, Wc))
                np.add.at(grad, corner_tris[:, 1], dE_col * np.cross(Wc, Uc))
                np.add.at(grad, corner_tris[:, 2], dE_col * np.cross(Uc, Vc))

            centroid = np.mean(Y[:n_verts], axis=0)
            e_cent = 0.5 * k_centroid * n_verts * np.dot(centroid, centroid)
            grad[:n_verts] += k_centroid * centroid[None, :]

            if pin_south:
                grad[south_vertex] = 0.0

            r_grad = grad - np.sum(grad * Y, axis=1, keepdims=True) * Y
            total_e = e_spring + e_in_sp + e_out_sp + e_star_bar + e_corner + e_cent
            return total_e, r_grad

        step_size = 0.12
        for _ in range(max_iter):
            total_iters += 1

            if n_corners > 0 and not np.all(is_hard):
                curr_c_dets = face_determinants(X, corner_tris)
                newly_convex = (~is_hard) & (curr_c_dets > 1e-4)
                if np.any(newly_convex):
                    is_hard = is_hard | newly_convex

            energy, r_grad = compute_energy_and_grad(X, is_hard)
            v_norms = np.linalg.norm(r_grad, axis=1)
            grad_norm = np.max(v_norms[:n_verts])
            if (
                grad_norm < tol
                and np.max(v_norms) < tol * 5.0
                and (n_corners == 0 or np.all(is_hard))
            ):
                break

            scales = np.minimum(1.0, 4.0 / np.maximum(v_norms, 1e-12))[:, None]
            search_dir = -scales * r_grad
            dir_deriv = np.sum(r_grad * search_dir)

            alpha = step_size
            accepted = False
            for _ in range(30):
                X_cand = X + alpha * search_dir
                X_cand /= np.linalg.norm(X_cand, axis=1, keepdims=True)
                if pin_south:
                    X_cand[south_vertex] = np.array([0.0, 0.0, -1.0])
                e_cand, _ = compute_energy_and_grad(X_cand, is_hard)
                if e_cand <= energy + 1e-4 * alpha * dir_deriv:
                    X = X_cand
                    step_size = min(0.25, alpha * 1.25)
                    accepted = True
                    break
                alpha *= 0.5

            if not accepted:
                break

    return X[:n_verts].copy(), X, total_iters, grad_norm


# =============================================================================
# 4. Verification, Tutte Weights & Crossings
# =============================================================================
def verify_spherical_face_convexity(X, oriented_faces):
    convex_face_count = 0
    max_interior_angle_deg = 0.0
    non_convex_faces = []

    for f_idx, f in enumerate(oriented_faces):
        k = len(f)
        face_max_angle = 0.0
        for i in range(k):
            x_prev = X[f[(i - 1) % k]]
            x_curr = X[f[i]]
            x_next = X[f[(i + 1) % k]]

            t_prev = x_prev - np.dot(x_prev, x_curr) * x_curr
            t_next = x_next - np.dot(x_next, x_curr) * x_curr
            t_prev /= np.linalg.norm(t_prev)
            t_next /= np.linalg.norm(t_next)

            cos_a = np.clip(np.dot(t_prev, t_next), -1.0, 1.0)
            sin_a = np.dot(np.cross(t_next, t_prev), x_curr)
            angle_deg = np.degrees(np.arctan2(sin_a, cos_a)) % 360.0
            face_max_angle = max(face_max_angle, angle_deg)

        max_interior_angle_deg = max(max_interior_angle_deg, face_max_angle)
        if face_max_angle < 180.0 - 1e-5:
            convex_face_count += 1
        else:
            non_convex_faces.append((f_idx, k, face_max_angle))

    return convex_face_count, max_interior_angle_deg, non_convex_faces


def compute_spherical_tutte_weights(X, adj):
    n_verts = len(X)
    weights = []
    for i in range(n_verts):
        xi = X[i]
        nbrs = adj[i]
        ref = np.array([1.0, 0.0, 0.0]) if abs(xi[0]) < 0.9 else np.array([0.0, 1.0, 0.0])
        e1 = np.cross(xi, ref)
        e1 /= np.linalg.norm(e1)
        e2 = np.cross(xi, e1)

        t_vecs = X[nbrs] - (X[nbrs] @ xi)[:, None] * xi
        t_norms = np.linalg.norm(t_vecs, axis=1)
        angles = np.arctan2(t_vecs @ e2, t_vecs @ e1)
        order = np.argsort(angles)

        sorted_angles = angles[order]
        phi = np.mod(np.roll(sorted_angles, -1) - sorted_angles, 2.0 * np.pi)
        tan_half = np.tan(0.5 * phi)
        w_sorted = (np.roll(tan_half, 1) + tan_half) / t_norms[order]

        w_i = np.zeros(len(nbrs), dtype=np.float64)
        w_i[order] = w_sorted
        w_i /= np.sum(w_i)
        weights.append(w_i)
    return weights


def verify_tutte_barycentric_equilibrium(X, adj, weights):
    max_res = 0.0
    for i in range(len(X)):
        b_i = weights[i] @ X[adj[i]]
        b_i_unit = b_i / np.linalg.norm(b_i)
        tangential = b_i_unit - np.dot(b_i_unit, X[i]) * X[i]
        max_res = max(max_res, np.linalg.norm(tangential))
    return max_res


def count_great_circle_crossings(X, edges, eps=1e-9):
    n_edges = len(edges)
    crossing_pairs = []
    A = X[[e[0] for e in edges]]
    B = X[[e[1] for e in edges]]
    normals = np.cross(A, B)
    n_norms = np.linalg.norm(normals, axis=1)

    for i in range(n_edges):
        if n_norms[i] < eps:
            continue
        u1, v1 = edges[i]
        a1, b1, n1 = A[i], B[i], normals[i] / n_norms[i]
        for j in range(i + 1, n_edges):
            u2, v2 = edges[j]
            if u1 in (u2, v2) or v1 in (u2, v2) or n_norms[j] < eps:
                continue
            a2, b2, n2 = A[j], B[j], normals[j] / n_norms[j]
            line_dir = np.cross(n1, n2)
            l_norm = np.linalg.norm(line_dir)
            if l_norm < eps:
                continue
            p = line_dir / l_norm
            for sign in (1.0, -1.0):
                cand = sign * p
                if (
                    np.dot(np.cross(a1, cand), n1) > eps
                    and np.dot(np.cross(cand, b1), n1) > eps
                    and np.dot(np.cross(a2, cand), n2) > eps
                    and np.dot(np.cross(cand, b2), n2) > eps
                ):
                    crossing_pairs.append(((u1, v1), (u2, v2)))
                    break
    return len(crossing_pairs), crossing_pairs


def sample_great_circle_arc(x_u, x_v, num_points=40):
    omega = np.arccos(np.clip(np.dot(x_u, x_v), -1.0, 1.0))
    if omega < 1e-10:
        return np.repeat(x_u[None, :], num_points, axis=0)
    t = np.linspace(0.0, 1.0, num_points)[:, None]
    return (np.sin((1.0 - t) * omega) * x_u + np.sin(t * omega) * x_v) / np.sin(omega)


def solve_full_spherical_embedding(raw_input, label=""):
    """
    Runs the complete Stage 1 -> Stage 3 spherical Tutte pipeline on `raw_input`
    and returns `(n_verts, edges, faces, adj, X_eq)`.
    """
    n_verts = max(v for row in raw_input for v in row) + 1
    if label:
        print(f"\n=== Computing Spherical Embedding for {label} (n_verts={n_verts}) ===", flush=True)

    edges, faces, adj = parse_planar_graph_input(n_verts, raw_input)
    print("-" * 80, flush=True)

    (
        X_aug_init,
        oriented_faces,
        outer_face_idx,
        edge_weights,
        star_tris,
        star_w,
        corner_tris,
        corner_w,
        inner_spokes,
        inner_spoke_w,
        outer_spokes,
    ) = gnomonic_polygon_tutte_init(n_verts, edges, faces, adj, radius=1.8)

    init_star_dets = face_determinants(X_aug_init, star_tris)
    init_crossings, _ = count_great_circle_crossings(X_aug_init[:n_verts], edges)
    print(
        f"[Stage 1 Init]   Crossings = {init_crossings} | "
        f"Min Star det = {np.min(init_star_dets):+.3e}",
        flush=True,
    )

    X_eq, X_aug_eq, iters, grad_norm = optimize_spherical_barrier_equilibrium(
        X_aug_init,
        n_verts,
        edges,
        edge_weights,
        outer_face_idx,
        star_tris,
        star_w,
        corner_tris,
        corner_w,
        inner_spokes,
        inner_spoke_w,
        outer_spokes,
    )
    eq_star_dets = face_determinants(X_aug_eq, star_tris)
    eq_corner_dets = face_determinants(X_aug_eq, corner_tris)
    eq_crossings, crossing_list = count_great_circle_crossings(X_eq, edges)

    convex_faces, max_angle_deg, non_convex_list = verify_spherical_face_convexity(
        X_eq, oriented_faces
    )
    weights = compute_spherical_tutte_weights(X_eq, adj)
    min_weight = min(np.min(w) for w in weights)
    tutte_res = verify_tutte_barycentric_equilibrium(X_eq, adj, weights)
    singular_vals = np.linalg.svd(X_eq / np.sqrt(n_verts), compute_uv=False)

    dots = np.clip(
        np.sum(X_eq[[e[0] for e in edges]] * X_eq[[e[1] for e in edges]], axis=1),
        -1.0,
        1.0,
    )
    arc_deg = np.degrees(np.arccos(dots))

    min_corner_str = (
        f"{np.min(eq_corner_dets):+.3e}"
        if len(eq_corner_dets) > 0
        else "N/A (pure triangulation)"
    )
    print(
        f"[Stage 2 Equil]  Crossings = {eq_crossings} | "
        f"Min Star det = {np.min(eq_star_dets):+.3e} | "
        f"Min Corner det = {min_corner_str} ({iters} steps)"
    )
    print(
        f"[Face Convexity] Strictly Convex Faces = {convex_faces}/{len(faces)} | "
        f"Max Interior Angle = {max_angle_deg:.2f}° (< 180°)"
    )
    print(
        f"[Stage 3 Tutte]  Min Weight w_ij = {min_weight:+.4e} (>0) | "
        f"Barycentric Residual = {tutte_res:.3e}"
    )
    print(
        f"[Edge Lengths]   Min = {np.min(arc_deg):.2f}°, "
        f"Max = {np.max(arc_deg):.2f}°, Mean = {np.mean(arc_deg):.2f}°"
    )
    print(
        f"[3D Isotropy]    ||Centroid|| = {np.linalg.norm(np.mean(X_eq, axis=0)):.3e} | "
        f"σ1={singular_vals[0]:.3f}, σ2={singular_vals[1]:.3f}, σ3={singular_vals[2]:.3f}",
        flush=True,
    )

    assert eq_crossings == 0, f"Found crossings: {crossing_list}"
    assert convex_faces == len(faces), f"Non-convex faces detected: {non_convex_list}"
    assert min_weight > 0.0, f"Non-positive Tutte weight detected: {min_weight}"

    return n_verts, edges, faces, adj, X_eq


# =============================================================================
# 5. Interactive 3D Matplotlib Viewer (+ Multi-Graph .gz Slider/TextBox/+/- UI)
# =============================================================================
def get_camera_view_vector(ax):
    elev_rad = np.radians(ax.elev)
    azim_rad = np.radians(ax.azim)
    return np.array([
        np.cos(elev_rad) * np.cos(azim_rad),
        np.cos(elev_rad) * np.sin(azim_rad),
        np.sin(elev_rad),
    ])


def compute_horizon_ring(v_cam, num_points=120):
    ref = np.array([1.0, 0.0, 0.0]) if abs(v_cam[0]) < 0.9 else np.array([0.0, 1.0, 0.0])
    e1 = np.cross(v_cam, ref)
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(v_cam, e1)
    t = np.linspace(0.0, 2.0 * np.pi, num_points)[:, None]
    return np.cos(t) * e1 + np.sin(t) * e2


def plot_spherical_graph_matplotlib(
    X_init,
    edges_init,
    faces_init,
    filepath,
    annotate_vertices=True,
    is_gz=False,
    all_gz_graphs=None,
    initial_graph_idx=1,
):
    fig = plt.figure(figsize=(10.5, 9.8), dpi=110)
    # Leave extra bottom margin when `.gz` controls are shown
    bottom_margin = 0.14 if is_gz else 0.09
    ax = fig.add_axes([0.02, bottom_margin, 0.96, 0.92 - bottom_margin], projection="3d")

    u = np.linspace(0, 2 * np.pi, 48)
    v = np.linspace(0, np.pi, 24)
    xs = np.outer(np.cos(u), np.sin(v))
    ys = np.outer(np.sin(u), np.sin(v))
    zs = np.outer(np.ones_like(u), np.cos(v))
    ax.plot_surface(xs, ys, zs, color="#e0f2fe", alpha=0.15, edgecolor="none")
    ax.plot_wireframe(xs, ys, zs, color="#94a3b8", alpha=0.12, linewidth=0.5, rstride=4, cstride=4)

    # Mutable graph geometry state so switching graphs updates artists in-place
    g_state = {
        "X": X_init,
        "edges": edges_init,
        "faces": faces_init,
        "full_arcs": [
            sample_great_circle_arc(X_init[u_i], X_init[v_i], num_points=40)
            for u_i, v_i in edges_init
        ],
        "current_idx": initial_graph_idx,
        "total_graphs": len(all_gz_graphs) if (is_gz and all_gz_graphs is not None) else 1,
        "cache": {initial_graph_idx: (len(X_init), edges_init, faces_init, X_init)},
        "updating_widgets": False,
        "slider_dragging": False,
    }

    edge_lines = []
    for idx, arc in enumerate(g_state["full_arcs"]):
        (line,) = ax.plot(
            arc[:, 0], arc[:, 1], arc[:, 2],
            color="#0284c7", linewidth=1.8, alpha=0.88,
            label="Great-Circle Edges" if idx == 0 else None,
        )
        edge_lines.append(line)

    v_cam_init = get_camera_view_vector(ax)
    hr = compute_horizon_ring(v_cam_init)
    (horizon_line,) = ax.plot(
        hr[:, 0], hr[:, 1], hr[:, 2],
        "--", color="#475569", linewidth=1.2, alpha=0.6, visible=False,
        label="Horizon Rim ($\\mathbf{x}\\cdot\\mathbf{v}_{\\mathrm{cam}}=0$)",
    )

    (vertex_markers,) = ax.plot(
        X_init[:, 0], X_init[:, 1], X_init[:, 2],
        linestyle="none", marker="o", markersize=7.5,
        markerfacecolor="#dc2626", markeredgecolor="white", markeredgewidth=0.9,
        label="Vertices on $S^2$", zorder=5,
    )

    text_artists = []
    if annotate_vertices:
        for idx, (vx, vy, vz) in enumerate(X_init):
            txt = ax.text(
                vx * 1.08, vy * 1.08, vz * 1.08, str(idx),
                fontsize=8.5, color="#0f172a", fontweight="bold", ha="center", va="center",
            )
            text_artists.append(txt)

    centroid = np.mean(X_init, axis=0)
    (centroid_marker,) = ax.plot(
        [centroid[0]], [centroid[1]], [centroid[2]],
        linestyle="none", marker="*", markersize=12,
        markerfacecolor="#eab308", markeredgecolor="#1e293b", markeredgewidth=1.0,
        label=f"Centroid (||μ|| = {np.linalg.norm(centroid):.2e})", zorder=6,
    )

    view_state = {
        "top_half_only": False,
        "clip_straddling": True,
        "last_angles": (ax.elev, ax.azim),
    }

    base_name = os.path.basename(filepath)

    def make_title_str():
        X_c = g_state["X"]
        E_c = g_state["edges"]
        F_c = g_state["faces"]
        if is_gz:
            return (
                f"Strictly Convex Spherical Tutte — {base_name} "
                f"[Graph {g_state['current_idx']}/{g_state['total_graphs']}] "
                f"(|V|={len(X_c)}, |E|={len(E_c)}, |F|={len(F_c)})"
            )
        return (
            f"Strictly Convex Spherical Tutte — {base_name} "
            f"(|V|={len(X_c)}, |E|={len(E_c)}, |F|={len(F_c)})"
        )

    def update_visibility():
        X = g_state["X"]
        edges = g_state["edges"]
        full_arcs = g_state["full_arcs"]

        if not view_state["top_half_only"]:
            vertex_markers.set_data_3d(X[:, 0], X[:, 1], X[:, 2])
            for idx, txt in enumerate(text_artists):
                if idx < len(X):
                    txt.set_position_3d((X[idx, 0] * 1.08, X[idx, 1] * 1.08, X[idx, 2] * 1.08))
                    txt.set_visible(True)
                else:
                    txt.set_visible(False)
            for idx, line in enumerate(edge_lines):
                if idx < len(full_arcs):
                    arc = full_arcs[idx]
                    line.set_data_3d(arc[:, 0], arc[:, 1], arc[:, 2])
                    line.set_linestyle("-")
                    line.set_alpha(0.88)
                    line.set_visible(True)
                else:
                    line.set_visible(False)
            horizon_line.set_visible(False)
            return

        v_cam = get_camera_view_vector(ax)
        dots = X @ v_cam
        in_top = dots >= 0.0

        hr_pts = compute_horizon_ring(v_cam)
        horizon_line.set_data_3d(hr_pts[:, 0], hr_pts[:, 1], hr_pts[:, 2])
        horizon_line.set_visible(True)

        X_top = X[in_top]
        vertex_markers.set_data_3d(X_top[:, 0], X_top[:, 1], X_top[:, 2])
        for idx, txt in enumerate(text_artists):
            if idx < len(X):
                txt.set_position_3d((X[idx, 0] * 1.08, X[idx, 1] * 1.08, X[idx, 2] * 1.08))
                txt.set_visible(bool(in_top[idx]))
            else:
                txt.set_visible(False)

        for idx, line in enumerate(edge_lines):
            if idx >= len(edges):
                line.set_visible(False)
                continue

            u_i, v_i = edges[idx]
            u_top, v_top = in_top[u_i], in_top[v_i]

            if u_top and v_top:
                arc = full_arcs[idx]
                line.set_data_3d(arc[:, 0], arc[:, 1], arc[:, 2])
                line.set_linestyle("-")
                line.set_alpha(0.92)
                line.set_visible(True)
            elif not u_top and not v_top:
                line.set_visible(False)
            else:
                if not view_state["clip_straddling"]:
                    line.set_visible(False)
                else:
                    front_v = u_i if u_top else v_i
                    back_v = v_i if u_top else u_i
                    d_front, d_back = dots[front_v], dots[back_v]
                    s = d_front / (d_front - d_back)
                    p_hor = (1.0 - s) * X[front_v] + s * X[back_v]
                    p_hor /= np.linalg.norm(p_hor)

                    clipped_arc = sample_great_circle_arc(X[front_v], p_hor, num_points=20)
                    line.set_data_3d(clipped_arc[:, 0], clipped_arc[:, 1], clipped_arc[:, 2])
                    line.set_linestyle("--")
                    line.set_alpha(0.55)
                    line.set_visible(True)

    # Row 1 Buttons: Top Half Only & Boundary Mode
    row1_y = 0.08 if is_gz else 0.02
    ax_btn_top = fig.add_axes([0.18, row1_y, 0.30, 0.042])
    ax_btn_bnd = fig.add_axes([0.52, row1_y, 0.32, 0.042])
    btn_top = Button(ax_btn_top, "Top Half Only: OFF (Key 't')", color="#f1f5f9", hovercolor="#e2e8f0")
    btn_bnd = Button(ax_btn_bnd, "Boundary Edges: Clip (Key 'b')", color="#f1f5f9", hovercolor="#e2e8f0")

    def toggle_top_half(event=None):
        view_state["top_half_only"] = not view_state["top_half_only"]
        status = "ON" if view_state["top_half_only"] else "OFF"
        btn_top.label.set_text(f"Top Half Only: {status} (Key 't')")
        btn_top.color = "#bae6fd" if view_state["top_half_only"] else "#f1f5f9"
        update_visibility()
        fig.canvas.draw_idle()

    def toggle_boundary_mode(event=None):
        view_state["clip_straddling"] = not view_state["clip_straddling"]
        mode_str = "Clip" if view_state["clip_straddling"] else "Hide"
        btn_bnd.label.set_text(f"Boundary Edges: {mode_str} (Key 'b')")
        if view_state["top_half_only"]:
            update_visibility()
            fig.canvas.draw_idle()

    btn_top.on_clicked(toggle_top_half)
    btn_bnd.on_clicked(toggle_boundary_mode)

    # Row 2 Controls (Only when a "*.gz" file is loaded): Slider, TextBox, '-' and '+' Buttons
    gz_widgets = {}
    if is_gz and all_gz_graphs is not None:
        total_g = g_state["total_graphs"]

        ax_slider = fig.add_axes([0.10, 0.02, 0.50, 0.038])
        ax_text = fig.add_axes([0.70, 0.02, 0.09, 0.038])
        ax_minus = fig.add_axes([0.81, 0.02, 0.045, 0.038])
        ax_plus = fig.add_axes([0.865, 0.02, 0.045, 0.038])

        slider_gz = Slider(
            ax=ax_slider,
            label=f"Graph (1..{total_g}) ",
            valmin=1,
            valmax=max(1, total_g),
            valinit=initial_graph_idx,
            valstep=1,
            color="#0284c7",
        )
        textbox_gz = TextBox(ax_text, "Go to: ", initial=str(initial_graph_idx))
        btn_minus = Button(ax_minus, "-", color="#f1f5f9", hovercolor="#e2e8f0")
        btn_plus = Button(ax_plus, "+", color="#f1f5f9", hovercolor="#e2e8f0")

        gz_widgets["slider"] = slider_gz
        gz_widgets["textbox"] = textbox_gz
        gz_widgets["minus"] = btn_minus
        gz_widgets["plus"] = btn_plus

        def update_minus_plus_colors():
            idx = g_state["current_idx"]
            btn_minus.color = "#e2e8f0" if idx <= 1 else "#f1f5f9"
            btn_plus.color = "#e2e8f0" if idx >= total_g else "#f1f5f9"

        update_minus_plus_colors()

        def load_and_display_graph(target_idx):
            target_idx = int(target_idx)
            if target_idx < 1 or target_idx > total_g:
                print(
                    f"[UI Warning] Graph index {target_idx} out of range (1..{total_g}).",
                    flush=True,
                )
                g_state["updating_widgets"] = True
                textbox_gz.set_val(str(g_state["current_idx"]))
                slider_gz.set_val(g_state["current_idx"])
                g_state["updating_widgets"] = False
                return

            if target_idx == g_state["current_idx"]:
                return

            # Show computing status in window title while solving
            ax.set_title(
                f"Computing Graph #{target_idx}/{total_g} from {base_name} ...",
                fontsize=12, fontweight="bold", color="#b45309", pad=12,
            )
            fig.canvas.draw()
            fig.canvas.flush_events()

            if target_idx in g_state["cache"]:
                n_v, edges_new, faces_new, X_new = g_state["cache"][target_idx]
            else:
                raw_g = all_gz_graphs[target_idx - 1]
                n_v, edges_new, faces_new, _, X_new = solve_full_spherical_embedding(
                    raw_g, label=f"{base_name} [Graph #{target_idx}/{total_g}]"
                )
                g_state["cache"][target_idx] = (n_v, edges_new, faces_new, X_new)

            # Expand artist pools if the new graph has more vertices or edges
            while len(edge_lines) < len(edges_new):
                (new_line,) = ax.plot([], [], [], color="#0284c7", linewidth=1.8, alpha=0.88)
                edge_lines.append(new_line)

            if annotate_vertices:
                while len(text_artists) < len(X_new):
                    new_txt = ax.text(
                        0.0, 0.0, 0.0, str(len(text_artists)),
                        fontsize=8.5, color="#0f172a", fontweight="bold", ha="center", va="center",
                    )
                    text_artists.append(new_txt)

            g_state["X"] = X_new
            g_state["edges"] = edges_new
            g_state["faces"] = faces_new
            g_state["full_arcs"] = [
                sample_great_circle_arc(X_new[u_i], X_new[v_i], num_points=40)
                for u_i, v_i in edges_new
            ]
            g_state["current_idx"] = target_idx

            c_new = np.mean(X_new, axis=0)
            centroid_marker.set_data_3d([c_new[0]], [c_new[1]], [c_new[2]])

            # Synchronize Slider and TextBox without triggering recursive callbacks
            g_state["updating_widgets"] = True
            if int(round(slider_gz.val)) != target_idx:
                slider_gz.set_val(target_idx)
            if textbox_gz.text.strip() != str(target_idx):
                textbox_gz.set_val(str(target_idx))
            g_state["updating_widgets"] = False

            update_minus_plus_colors()
            ax.set_title(make_title_str(), fontsize=12, fontweight="bold", color="#0f172a", pad=12)
            update_visibility()
            fig.canvas.draw_idle()

        def on_slider_change(val):
            if g_state["updating_widgets"]:
                return
            idx = int(round(val))
            # While dragging across 1812 isomers, update the text box live and solve on release
            g_state["updating_widgets"] = True
            textbox_gz.set_val(str(idx))
            g_state["updating_widgets"] = False
            if not g_state["slider_dragging"]:
                load_and_display_graph(idx)

        def on_mouse_press_slider(event):
            if event.inaxes == ax_slider:
                g_state["slider_dragging"] = True

        def on_mouse_release_slider(event):
            if g_state["slider_dragging"]:
                g_state["slider_dragging"] = False
                load_and_display_graph(int(round(slider_gz.val)))

        def on_textbox_submit(text):
            if g_state["updating_widgets"]:
                return
            try:
                val = int(text.strip())
            except ValueError:
                g_state["updating_widgets"] = True
                textbox_gz.set_val(str(g_state["current_idx"]))
                g_state["updating_widgets"] = False
                return
            load_and_display_graph(val)

        def on_minus_clicked(event):
            if g_state["current_idx"] > 1:
                load_and_display_graph(g_state["current_idx"] - 1)

        def on_plus_clicked(event):
            if g_state["current_idx"] < total_g:
                load_and_display_graph(g_state["current_idx"] + 1)

        slider_gz.on_changed(on_slider_change)
        textbox_gz.on_submit(on_textbox_submit)
        btn_minus.on_clicked(on_minus_clicked)
        btn_plus.on_clicked(on_plus_clicked)
        fig.canvas.mpl_connect("button_press_event", on_mouse_press_slider)
        fig.canvas.mpl_connect("button_release_event", on_mouse_release_slider)

    def on_mouse_motion(event):
        if view_state["top_half_only"]:
            curr_angles = (ax.elev, ax.azim)
            if curr_angles != view_state["last_angles"]:
                view_state["last_angles"] = curr_angles
                update_visibility()
                fig.canvas.draw_idle()

    def on_key_press(event):
        # Ignore shortcuts while typing in the TextBox
        if is_gz and "textbox" in gz_widgets and gz_widgets["textbox"].capturekeystrokes:
            return
        if event.key == "t":
            toggle_top_half()
        elif event.key == "b":
            toggle_boundary_mode()

    fig.canvas.mpl_connect("motion_notify_event", on_mouse_motion)
    fig.canvas.mpl_connect("button_release_event", on_mouse_motion)
    fig.canvas.mpl_connect("key_press_event", on_key_press)

    ax.set_xlim([-1.1, 1.1])
    ax.set_ylim([-1.1, 1.1])
    ax.set_zlim([-1.1, 1.1])
    ax.set_box_aspect((1, 1, 1))
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_title(make_title_str(), fontsize=12, fontweight="bold", color="#0f172a", pad=12)
    ax.legend(loc="upper right")
    plt.show()


# =============================================================================
# 6. CLI Entry Point
# =============================================================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <path_to_graph_file (.a or .gz)> [graph_index]")
        print(f"Examples:")
        print(f"  python {sys.argv[0]} graphs/C24.a")
        print(f"  python {sys.argv[0]} graphs/C36.txt.gz 5")
        sys.exit(1)

    filepath = sys.argv[1]
    graph_idx = int(sys.argv[2]) if len(sys.argv) >= 3 else 1

    is_gz_file = filepath.endswith(".gz") or filepath.endswith(".gzip")
    if not is_gz_file and not (filepath.endswith(".a") or filepath.endswith(".txt")):
        with open(filepath, "rb") as f_check:
            is_gz_file = f_check.read(2) == b"\x1f\x8b"

    if is_gz_file:
        all_gz_graphs = load_all_graphs_from_gz(filepath)
        total_graphs = len(all_gz_graphs)
        if graph_idx < 1 or graph_idx > total_graphs:
            print(
                f"Error: Graph index {graph_idx} out of range for '{filepath}' "
                f"(file contains {total_graphs} graphs, valid range: 1..{total_graphs}).",
                file=sys.stderr,
            )
            sys.exit(1)
        raw_input = all_gz_graphs[graph_idx - 1]
        print(
            f"[Multi-Graph Loader] Loaded graph {graph_idx} of {total_graphs} from '{filepath}'",
            flush=True,
        )
    else:
        all_gz_graphs = None
        _, raw_input = load_graph_file_a(filepath)

    base_label = (
        f"{os.path.basename(filepath)} [Graph #{graph_idx}/{len(all_gz_graphs)}]"
        if is_gz_file
        else os.path.basename(filepath)
    )
    n_verts, edges, faces, adj, X_eq = solve_full_spherical_embedding(raw_input, label=base_label)

    plot_spherical_graph_matplotlib(
        X_eq,
        edges,
        faces,
        filepath=filepath,
        annotate_vertices=True,
        is_gz=is_gz_file,
        all_gz_graphs=all_gz_graphs,
        initial_graph_idx=graph_idx,
    )

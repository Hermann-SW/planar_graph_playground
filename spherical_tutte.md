
1) "In graph drawing and geometric graph theory, a Tutte embedding or barycentric embedding of a simple, 3-vertex-connected, planar graph is a crossing-free straight-line embedding with the properties that the outer face is a convex polygon and that each interior vertex is at the average (or barycenter) of its neighbors' positions."
I want to embed such a planar graph onto unit sphere. If using spring embedding type algorithm the danger is that all snaps together in a single point on the sphere. Is there a known algorithm maps the vertices of graph to locations on sphere such the edges are the great circle arcs between its vertex coordinates and such that the edges around each vertex satisfy some kind of equilibrium?
2) I clicked "Yes" on proposed next step, resulted in this prompt:  
Write a complete Python implementation (using NumPy/SciPy) that computes a crossing-free spherical Tutte embedding of a 3-connected planar graph using a two-hemisphere gnomonic initialization followed by center-of-mass normalized spherical relaxation.
3) does the Möbius-Balanced Spherical Tutte provide coordinates on sphere for each vertex of the graph?
4) Add a 3D visualization function using Matplotlib or Plotly to plot the computed spherical vertex coordinates and great-circle arc edges on the unit sphere.
5) I copied screenshot in addtion to this prompt:  
all in single plane, not the wanted embedding
6) Looks much better. Is the displayed crossing free sphere embedding the starting config for spring embedding, or the final result in equilibrium? Why am I not able to copy in a screenhot anymore?
7) I copied screenshot in addtion to this prompt:  
There is an edge crossing 2--5 with 8--11, that is not the requested imbedding
8) nice! I copied in faces from another embedding:
    n_verts = 20
    faces=[[9,10,1],[0,2,15],[1,14,3],[2,4,16],[3,13,5],[4,6,17],[5,12,7],[6,8,18],[7,11,9],[8,0,19],[0,11,14],[10,8,12],[11,6,13],[12,4,14],[13,2,10],[1,16,19],[15,3,17],[16,5,18],[17,7,19],[18,9,15]]
Starting this keeps running withut any output, not even  the line with edges faces, vertices
9) I copied in two screenshots in addtion to this prompt:  
that works great. I copied in one C36 and it was displayed nicely as well. And a not that symmetric C70 without any issues. Please modify the script that it reads the faces from a file (example below) and computes n_verts as maximal number inside those arrays +1. So "python sperical_tutte.py graphs/C24.a"

```
hermann@8840hs:~/planar_graph_playground$ cat graphs/C24.a 
[[11,12,1],[0,2,18],[1,17,3],[2,4,19],[3,16,5],[4,6,20],[5,15,7],[6,8,21],[7,14,9],[8,10,22],[9,13,11],[10,0,23],[0,13,17],[12,10,14],[13,8,15],[14,6,16],[15,4,17],[16,2,12],[1,19,23],[18,3,20],[19,5,21],[20,7,22],[21,9,23],[22,11,18]]
hermann@8840hs:~/planar_graph_playground$ 
```
10) Nice. For analyzing some anomalies I want t discuss with you, please add toggle "top half only" that does the following:  
- top half is the half in direction to screen
- draw only vertices that are in top half
- draw edges between top half vertices
- draw no edges between back half vertices
- decide how to draw or not draw edges between a top half and bottom half vertex
is it possible that the display keeps changing while rotating, or do I need to press a "refresh" button to newly determine top half vertices from perspective I am interested in?
11) I copied screenshot in addition to this prompt:  
Thanks, drawing top only it is much easier to spot this very big face. I do not know how graph D100 was created, just found it in graphs directory. Does the face look like the algorithm correctly did its job? I don not mean there are edge crossings. But why keeps the face that big and gets not a bit smaller? Does the screenshot show equilibrium?
12)
```
hermann@8840hs:~/planar_graph_playground$ python spherical_tutte.py graphs/D100.a 
Loaded 'graphs/D100.a' -> computed n_verts = 196
[Input Auto-Detect] Planar Rotation System: |V|=196, |E|=294, |F|=100 faces (sizes: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 18, 20])
--------------------------------------------------------------------------------
[Stage 1 Init]   Crossings = 0 | Min Barrier det = +3.6032e-07
[Stage 2 Equil]  Crossings = 0 | Min Barrier det = +1.2442e-08 (1450 total steps)
[Stage 3 Tutte]  Min Weight w_ij = -1.5033e+00 (>0) | Barycentric Residual = 4.871e-16
[Edge Lengths]   Min = 0.05°, Max = 114.49°, Mean = 4.71°
[3D Isotropy]    ||Centroid|| = 8.419e-01 | σ1=0.860, σ2=0.453, σ3=0.235
Traceback (most recent call last):
  File "/home/hermann/planar_graph_playground/spherical_tutte.py", line 657, in <module>
    assert min_weight > 0.0, f"Non-convex corner detected (min Tutte weight = {min_weight})!"
           ^^^^^^^^^^^^^^^^
AssertionError: Non-convex corner detected (min Tutte weight = -1.5032578441631688)!
hermann@8840hs:~/planar_graph_playground$ 
```
13) I copied screenshot in addtion to this prompt:  
works better, but the 20-gon and a neighboring more than 10-gon are not convex
14)
```
hermann@8840hs:~/planar_graph_playground$ python spherical_tutte.py graphs/D100.a 
Loaded 'graphs/D100.a' -> computed n_verts = 196
[Input Auto-Detect] Planar Rotation System: |V|=196, |E|=294, |F|=100 faces (sizes: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 18, 20])
--------------------------------------------------------------------------------
[Stage 1 Init]   Crossings = 0 | Min Star det = +2.500e-07 | Min Corner det = +4.289e-07
[Stage 2 Equil]  Crossings = 0 | Min Barrier det = +1.5097e-07 (1150 total steps)
[Face Convexity] Strictly Convex Faces = 99/100 | Max Interior Angle = 230.45° (< 180°)
[Stage 3 Tutte]  Min Weight w_ij = -8.9751e-01 (>0) | Barycentric Residual = 5.237e-16
[Edge Lengths]   Min = 0.11°, Max = 117.70°, Mean = 5.69°
[3D Isotropy]    ||Centroid|| = 7.337e-01 | σ1=0.785, σ2=0.552, σ3=0.282
Traceback (most recent call last):
  File "/home/hermann/planar_graph_playground/spherical_tutte.py", line 827, in <module>
    assert convex_faces == len(faces), f"Non-convex faces detected: {non_convex_list}"
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: Non-convex faces detected: [(16, 3, 230.44546608024046)]
hermann@8840hs:~/planar_graph_playground$ 
15) good. Can you implement a 2nd file input function and decide which to use on suffix, ".a" current and ".gz" the new format. Examples for both below. ".a" is 0-based, the last 3colmns in .gz show vertex numbers 1-based

hermann@8840hs:~/planar_graph_playground$ cat graphs/C24.a
[[11,12,1],[0,2,18],[1,17,3],[2,4,19],[3,16,5],[4,6,20],[5,15,7],[6,8,21],[7,14,9],[8,10,22],[9,13,11],[10,0,23],[0,13,17],[12,10,14],[13,8,15],[14,6,16],[15,4,17],[16,2,12],[1,19,23],[18,3,20],[19,5,21],[20,7,22],[21,9,23],[22,11,18]]
hermann@8840hs:~/planar_graph_playground$ zcat graphs/C24.txt.gz 
>>writegraph3d planar <<
 1  0 0 0   12 13  2
 2  0 0 0    1  3 19
 3  0 0 0    2 18  4
 4  0 0 0    3  5 20
 5  0 0 0    4 17  6
 6  0 0 0    5  7 21
 7  0 0 0    6 16  8
 8  0 0 0    7  9 22
 9  0 0 0    8 15 10
10  0 0 0    9 11 23
11  0 0 0   10 14 12
12  0 0 0   11  1 24
13  0 0 0    1 14 18
14  0 0 0   13 11 15
15  0 0 0   14  9 16
16  0 0 0   15  7 17
17  0 0 0   16  5 18
18  0 0 0   17  3 13
19  0 0 0    2 20 24
20  0 0 0   19  4 21
21  0 0 0   20  6 22
22  0 0 0   21  8 23
23  0 0 0   22 10 24
24  0 0 0   23 12 19
0
hermann@8840hs:~/planar_graph_playground$
```
16) Did the code miss gunzip?
In my example I used zcat, not cat:
```
hermann@8840hs:~/planar_graph_playground$ python spherical_tutte.3.py graphs/C24.txt.gz 
Traceback (most recent call last):
  File "/home/hermann/planar_graph_playground/spherical_tutte.3.py", line 602, in <module>
    n_verts, raw_input = load_graph_file(filepath)
                         ^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/hermann/planar_graph_playground/spherical_tutte.3.py", line 20, in load_graph_file
    content = f.read().strip()
              ^^^^^^^^
  File "<frozen codecs>", line 322, in decode
UnicodeDecodeError: 'utf-8' codec can't decode byte 0x8b in position 1: invalid start byte
hermann@8840hs:~/planar_graph_playground$ 
```
17) works!
4 or five versions ago input graph input for complete graph on 5 vertices with one edge removed works. Now fails:
```
hermann@8840hs:~/planar_graph_playground$ cat graphs/K5me.a 
[[1, 2, 3, 4], [2, 0, 4], [4, 3, 0, 1], [4, 0, 2], [1, 0, 3, 2]]
hermann@8840hs:~/planar_graph_playground$ python spherical_tutte.py graphs/K5me.a 
Loaded 'graphs/K5me.a' -> computed n_verts = 5
[Input Auto-Detect] Planar Rotation System: |V|=5, |E|=9, |F|=6 faces (sizes: [3])
--------------------------------------------------------------------------------
[Stage 1 Init]   Crossings = 0 | Min Star det = +4.656e-02
Traceback (most recent call last):
  File "/home/hermann/planar_graph_playground/spherical_tutte.py", line 841, in <module>
    f"Min Corner det = {np.min(eq_corner_dets):+.3e} ({iters} steps)"
                        ^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3/dist-packages/numpy/core/fromnumeric.py", line 2953, in min
    return _wrapreduction(a, np.minimum, 'min', axis, None, out,
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3/dist-packages/numpy/core/fromnumeric.py", line 88, in _wrapreduction
    return ufunc.reduce(obj, axis, dtype, out, **passkwargs)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
ValueError: zero-size array to reduction operation minimum which has no identity
hermann@8840hs:~/planar_graph_playground$ 
```
18) 
```
pi@raspberrypi5:~/planar_graph_playground $ python spherical_tutte.py graphs/C36.txt.gz 1
  File "/home/pi/planar_graph_playground/spherical_tutte.py", line 75
    return n_verts, raw_input = load_graph_file_a(filepath) # handled below in main
                              ^
SyntaxError: invalid syntax
pi@raspberrypi5:~/planar_graph_playground $ 
```
19) Really cool ! Please add (only when a "*.gz" file is loaded )
-  a slider allowing to select any of the (1812 fullerenes for C60.txt.gz) 
-  add text field keeping the current graph number and allowing to select new 
-  a small + button allowing to go to next graph (if graph number is not last) 
- a small - button allowing to go to previous graph (if graph number is >1)
20) wow. Now a little tricky request. Please add toggle named "pentagons" disabled by default. If it is enabled, fill spherical all faces that are bounded by 5 edges with grey. The face should have distance to origin the same as all vertices on the sphere, so has to be curved. In case "Top Half Only" is deselected, all pentagons should be drawn, including those on back half. In case "Top Half Only" is selected, then the faces should be drawn clipped/not drawn like edges depending on renamed "Boundary: Clip" toggle
21) I copied screenshot in addition to this prompt:  
THANK YOU! This feature is really nice for "graphs/I*.txt.gz" files. They contain only those fullerenes with "independent" pentagons, so no pentagons join an edge. From the 1812 fullerenes with 60 atoms there is exactly one with this property. That is the so called "football fullerene" because it looks like a soccer balll
22) I need a small toogle "Node lables" selected by default. If deselected, only nodes, edges and pentagons are displayed, no node labels. 

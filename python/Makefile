all:


verify:
	./rpy python_test.py > out
	./rpy python_dual.py >> out
	./rpy python.convex_face_straight_line_drawing.py >> out
	./rpy embedding_demo.py >> out
	./rpy embedding_demo.2.py >> out
	./rpy embedding_demo.3.py >> out
	./rpy python_compact5.py 2>err >> out
	./rpy python.convex_face_straight_line_drawing.2.py >> out
	./rpy python.convex_face_straight_line_drawing.6coloring.py >> out
	diff out good 

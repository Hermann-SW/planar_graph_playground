all:

clean:
	rm -f err out

clean_all: clean
	rm -f ../err ../out
	cd ../c++; make clean

verify_all: verify
	cd ..; make verify
	cd ../c++; make verify
	echo
	diff out good
	diff ../out ../good
	diff ../c++/out ../c++/good
	./norm good | diff - ../good
	wc ../good

verify:
	./rpy python_test.py > out
	./rpy python_dual.py >> out
	./rpy python.convex_face_straight_line_drawing.py >> out
	./rpy embedding_demo.py >> out
	./rpy embedding_demo.2.py >> out
	./rpy embedding_demo.3.py >> out
	./rpy embedding_demo.4.py >> out
	./rpy python_compact5.py 2>err >> out
	./rpy python.convex_face_straight_line_drawing.2.py >> out
	./rpy python.convex_face_straight_line_drawing.6coloring.py >> out
	./rpy python.convex_face_straight_line_drawing.pentagons.py ../graphs/C36.1.a >> out
	./rpy python_6coloring.py ../graphs/10000.a 2>err >> out
	diff out good 

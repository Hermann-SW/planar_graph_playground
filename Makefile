all:

clean:
	rm -f err out

clean_all: clean
	rm -f python/err python/out
	cd c++; make clean

verify_all: verify
	cd c++; make verify
	cd python; make verify
	echo
	diff out good
	diff python/out python/good
	diff c++/out c++/good
	python/norm python/good | diff - good
	wc good

verify:
	./rjs node_test.js > out
	./rjs node_dual.js >> out
	./rjs node.convex_face_straight_line_drawing.js >> out
	./rjs embedding_demo.js >> out
	./rjs embedding_demo.2.js >> out
	./rjs embedding_demo.3.js >> out
	./rjs embedding_demo.4.js >> out
	./rjs node_compact5.js 2>err >> out
	./rjs node.convex_face_straight_line_drawing.2.js >> out
	./rjs node.convex_face_straight_line_drawing.6coloring.js >> out
	./rjs node.convex_face_straight_line_drawing.pentagons.js graphs/C36.1.a >> out
	./rjs node_6coloring.js graphs/10000.a 2>err >> out
	diff out good 

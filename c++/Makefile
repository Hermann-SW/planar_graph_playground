CC = g++
CCFLAGS = -Wall -Wextra -pedantic -std=c++14 -O3 -I.. -pg # -g

all: c++_test c++_dual c++_compact5 c++_6coloring

verify_all: verify
	cd ..; make verify
	cd ../python; make verify
	echo
	diff out good
	diff ../out ../good
	diff ../python/out ../python/good

verify: all
	./c++_test > out
	./c++_dual >> out
#	./c++.convex_face_straight_line_drawing >> out
#	./embedding_demo >> out
#	./embedding_demo.2 >> out
#	./embedding_demo.3 >> out
	./c++_compact5 2>err >> out
#	./c++.convex_face_straight_line_drawing.2 >> out
#	./c++.convex_face_straight_line_drawing.6coloring >> out
	./c++_6coloring ../graphs/10000.a 2>err >> out
	diff out good

cpplint:
	cd .. && cpplint c++/util.cpp 
	cd .. && cpplint c++/util.hpp 2>&1 | grep -v "Is this a non-const reference?"
	cd .. && cpplint c++/undirected_graph.hpp 2>&1 | grep -v "Is this a non-const reference?"
	cd .. && cpplint c++/c++_test.cpp
	cd .. && cpplint c++/c++_dual.cpp
	cd .. && cpplint c++/c++_compact5.cpp
	cd .. && cpplint c++/c++_6coloring.cpp

util.o: util.cpp util.hpp
	$(CC) $(CCFLAGS) -c util.cpp

fullerenes.o: fullerenes.cpp fullerenes.hpp
	$(CC) $(CCFLAGS) -c fullerenes.cpp

c++_test: c++_test.cpp util.o undirected_graph.hpp fullerenes.o fullerenes.hpp
	$(CC) $(CCFLAGS) c++_test.cpp util.o fullerenes.o -o c++_test

c++_dual: c++_dual.cpp util.o undirected_graph.hpp fullerenes.o fullerenes.hpp
	$(CC) $(CCFLAGS) c++_dual.cpp util.o fullerenes.o -o c++_dual

c++_compact5: c++_compact5.cpp c++_compact5.hpp  util.o undirected_graph.hpp
	$(CC) $(CCFLAGS) c++_compact5.cpp util.o -o c++_compact5

c++_6coloring: c++_6coloring.cpp util.o undirected_graph.hpp
	$(CC) $(CCFLAGS) c++_6coloring.cpp util.o -o c++_6coloring

clean:
	rm -f util.o fullerenes.o c++_test c++_dual c++_compact5 c++_6coloring
	rm -f err out
	rm -f gmon.out
	rm -f ../err ../out
	rm -f ../python/err ../python/out

CC = g++
CCFLAGS = -Wall -Wextra -pedantic -std=c++14 -O3 -I.. -pg # -g

all: c++_test c++_dual c++_compact5 c++_6coloring

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

#include <ctime>
#include <iostream>
#include <random>
  
int main(int argc, char *argv[])
{
  int N = (argc>1) ? atoi(argv[1]) : 10;
  int seed = (argc>2) ? atoi(argv[2]) : 1234;
  std::mt19937 rand_uint32(seed); 
 
  for(; N>0; --N) { 
    std::cout << rand_uint32() << std::endl; 
  }

  return 0;
}

#include <iomanip>

const char *_ts[9] = {"               init: ", "         parse2file: ",
                      "from_adjacency_list: ", "  graph list verify: ",
                      "       is_embedding: ", " compact5_traversal: ",
                      "         max_degree: ", "               exit: ",
                      "                sum: "};
struct timespec _t[9];
int __t = 0;
#define _ { clock_gettime(CLOCK_REALTIME, &_t[__t++]);  }

void _tdif(int s, int i, int j) {
    std::cerr << _ts[s] << (_t[j].tv_sec - _t[i].tv_sec) +
       (_t[j].tv_nsec - _t[i].tv_nsec)/1000000000.0 << "s" << std::endl;
}

int _main(int argc, char *argv[]);

int main(int argc, char *argv[]) {
  _ _main(argc, argv);

  _ std::cerr << std::fixed << std::setprecision(3);
    for(int i=0; i < __t - 1; ++i) {
        _tdif(i, i, i+1);
    }
    _tdif(__t - 1, 0, __t - 1);

    return 0;
}

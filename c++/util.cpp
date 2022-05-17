// Copyright: https://mit-license.org/
#include "c++/util.hpp"

char *readFile(const char *name) {
    FILE *src = fopen(name, "rb");
    assert(src);
    fseek(src, 0, SEEK_END);
    uint32_t l = ftell(src);
    rewind(src);
    char *buf = reinterpret_cast<char *>(malloc(l+1));
    assert(buf);
    fread(buf, 1, l, src);
    fclose(src);
    buf[l] = 0x0;
    return buf;
}

std::vector<int> parse(char **buf) {
    std::vector<int> result;
    char *p;

    for (p=*buf; *p != '['; ++p) {}

    for (; *p != ']'; ) {
        for (; isspace(*++p);) {}

        result.push_back(atoi(p));

        for (; (*p != ']') && (*p != ','); ++p) {}
    }

    *buf = p+1;

    return result;
}

std::vector<std::vector<int>> parse2(char *buf) {
    std::vector<std::vector<int>> result;
    char *p;

    for (p=buf; *p++ != '['; ) {}

    for (; *p != ']'; ) {
        for (; isspace(*p); ++p) {}

        result.push_back(parse(&p));

        for (; (*p != ']') && (*p != ','); ++p) {}
    }

    return result;
}

std::vector<std::vector<int>> parse2file(const char *name) {
    char *buf = readFile(name);
    std::vector<std::vector<int>> adj = parse2(buf);
    free(buf);
    return adj;
}

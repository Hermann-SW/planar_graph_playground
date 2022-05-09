def filled_array(n, m, v=0):
    A = []
    for _ in range(n):
        a = []
        for _ in range(m):
            a.append(v)
        A.append(a)
    return A

def incr(arr, i=0):
    arr[i] += 1

def aset(arr, x, i=0):
    arr[i] = x

def parse(st):
    result = []
    i = 0

    while st[i] != '[':
        i += 1

    while st[i] != ']':

        i += 1
        while st[i].isspace():
            i += 1

        j = i

        while not(st[i].isspace()) and (st[i] != ']') and (st[i] != ','):
            i += 1

        result.append(int(st[j:i]))

        while st[i] != ']' and st[i] != ',':
            i += 1

    return st[i+1:],result

def parse2(st):
    result = []
    i = 0

    while st[i] != '[':
        i += 1

    while st[i] != ']':

         i += 1
         while st[i].isspace():
             i += 1

         st, p = parse(st[i:])
         result.append(p)

         i = 0
         while st[i] != ']' and st[i] != ',':
             i += 1

    return st[i+1:],result

def parse3(st):
    result = []
    i = 0

    while st[i] != '[':
        i += 1

    while st[i] != ']':

         i += 1
         while st[i].isspace():
             i += 1

         st, p = parse2(st[i:])
         result.append(p)

         i = 0
         while st[i] != ']' and st[i] != ',':
             i += 1

    return result

def parse2file(name):
    return parse2(open(name).read())[1]

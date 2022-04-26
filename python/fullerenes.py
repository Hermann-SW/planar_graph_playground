with open('../fullerenes.js') as f:
    lines = f.readlines()

F = eval(''.join(lines[1:len(lines)-1]))

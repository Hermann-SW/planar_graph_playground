with open('../fullerenes.js') as f:
    lines = f.readlines()

F = parse3(''.join(lines[1:len(lines)-1]))

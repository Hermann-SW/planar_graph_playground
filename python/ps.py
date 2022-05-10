
class ps:
    ''' postscript '''
    def __init__(self):
        self._length = -1
        self._r = -1
        self._i = 1

    def set (self, length, r, i=1):
        self._length = length
        self._r = r
        self._i = i

    def scrx (self, v):
        return self._length / 2 + (self._length / 2 - self._r - 10) * v

    def scry (self, v):
        return self._length / 2 - (self._length / 2 - self._r - 10) * v

    def fill_outer_face (self, face, coords, rgb):
        size = self._length

        scrx = self.scrx
        scry = self.scry

        print(rgb, " setrgbcolor")

        print(' 0 ' + str(size))

        for v in face:
            print(' ' + str(scrx(coords[0][v])) + ' ' + str(scry(coords[1][v])))

        print(' ' + str(0) + ' ' + str(size - 10))
        print(' 0 0')
        print(' ' + str(size) + ' 0')
        print(' ' + str(size) + ' ' + str(size))

        print('poly fill')


        print('  0 ' + str(size))
        print(' 0 ' + str(size-10))
        print(' ' + str(scrx(coords[0][face[-1]])) + ' ' + str(scry(coords[1][face[-1]])))
        print(' ' + str(scrx(coords[0][face[0]])) + ' ' + str(scry(coords[1][face[0]])))
        print('poly fill')



    def straight_line_drawing (self, G, coords, pent, length, r, outer, showpage=True):
#pragma        set(length, r)

        scrx = self.scrx
        scry = self.scry

        if ((len(pent) > 0) and (len(pent[0]) == 5)):

            for face in pent:
                print(".75 setgray")
                for v in face:
                    print(' ' + str(scrx(coords[0][v])) + ' ' + str(scry(coords[1][v])))
                print('poly fill')

            if len(pent) != 12:
                print(".75 setgray")
                print(' 0 0')

                for v in outer:
                    print(' ' + str(scrx(coords[0][v])) + ' ' + str(scry(coords[1][v])))

                print(' ' + str(0) + ' ' + str(length))
                print(' ' + str(length) + ' ' + str(length))
                print(' ' + str(length) + ' ' + str(0))

                print('poly fill')

                print(".75 setgray")
                print(' 0 0')
                print(' ' + str(scrx(coords[0][0])) + ' ' + str(scry(coords[1][0])))
                print(' ' + str(scrx(coords[0][4])) + ' ' + str(scry(coords[1][4])))
                print(' ' + str(0) + ' ' + str(length))
                print('poly fill')

        def draw_edge(G, e, coords):
            v = source(G, e)
            w = target(G, e)
            if v < w:
                print("0 setgray")
                print(' ' + str(scrx(coords[0][v])) + ' ' + str(scry(coords[1][v])))
                print(' ' + str(scrx(coords[0][w])) + ' ' + str(scry(coords[1][w])))
                print('poly stroke')

        forall_edges(G, lambda e: draw_edge(G, e, coords))

        forall_vertices(G, lambda v: print('(' + str(v + self._i) + ') ' + 
            str(r) + ' ' + str(scrx(coords[0][v])) + ' ' + str(scry(coords[1][v])) + ' vertex'))

        if showpage:
            print('showpage')

    @staticmethod
    def header ():
        print("%!")
        print("1 setlinewidth")
        print("/Times-Roman findfont 12 scalefont setfont")

        print("2 99 translate")
        print("newpath 0 0 moveto 591 0 lineto 591 591 lineto 0 591 lineto closepath stroke")

        print("/vertex { 2 copy 5 4 roll dup 4 1 roll")
        print("  newpath 0 360 arc closepath")
        print("  gsave 1.0 setgray fill grestore")
        print("  stroke")
        print("  12 ge { ")
        print("    newpath moveto")
        print("    gsave dup false charpath flattenpath pathbbox grestore")
        print("    exch 4 1 roll exch sub -.5 mul 3 1 roll sub -.5 mul exch")
        print("    rmoveto show")
        print("  } { pop pop pop } ifelse")
        print("} def")

        print("/txtdistdeg {")
        print("  newpath moveto")
        print("  gsave dup false charpath flattenpath pathbbox grestore")
        print("  exch 4 1 roll exch sub -.5 mul 3 1 roll sub -.5 mul exch")
        print("  5 3 roll gsave")
        print("  rotate 0 exch rmoveto")
        print("  rmoveto show")
        print("  grestore")
        print("} def")

        print("/poly {")
        print("  newpath")
        print("  moveto")
        print("  {")
        print("    count 0 eq { exit } if")
        print("    lineto")
        print("  } loop")
        print("} def")

    @staticmethod
    def header2 ():
        print("%% http://computer-programming-forum.com/36-postscript/3d1b79b93a578811.htm")
        print("/arrow          %% angle /arrow -- draws arrowhead")
        print("{")
        print("gsave")
        print("  currentpoint translate 90 sub rotate .5 .5 scale")
        print("  newpath")
        print("  0.1 setlinewidth")
        print("  0 -15 moveto")
        print("  -6 -18 lineto")
        print("  -4 -15 -1 -9 0 0 curveto")
        print("  1 -9 4 -15 6 -18 curveto")
        print("  0 -15 lineto")
        print("  fill")
        print("grestore")
        print("} def")

        print("/arrowto        %% x1 y1 arrowto -- draws line with arrowhead")
        print("{")
        print("  2 copy                  % x1 y1 x1 y1")
        print("  currentpoint            % x1 y1 x1 y1 x0 y0")
        print("  3 -1 roll exch          % x1 y1 x1 x0 y1 y0")
        print("  sub                     % x1 y1 x1 x0 y1-y0")
        print("  3 1 roll                % x1 y1 y1-y0 x1 x0")
        print("  sub                     % x1 y1 y1-y0 x1-x0")
        print("  atan                    % x1 y1 theta")
        print("  3 1 roll                % theta x1 y1")
        print("  2 copy lineto           % theta x1 y1")
        print("  2 copy stroke moveto    % theta x1 y1")
        print("  3 -1 roll arrow         % x1 y1")
        print("  moveto")
        print("} def")

        print("/rarrowto {     %%  dx dy rarrowto --")
        print("  exch currentpoint       % dy dx x0 y0")
        print("  4 1 roll                % y0 dy dx x0")
        print("  add 3 1 roll            % x0+dx y0 dy")
        print("  add arrowto")
        print("} def")

        print("%% len dist cr cg cb angle x1 y1")
        print("/parrow {")
        print("  gsave")
        print("  newpath translate 0 0 moveto")
        print("  rotate")
        print("  setrgbcolor")
        print("  0 exch rmoveto")
        print("  0 rarrowto ")
        print("  grestore")
        print("} def")

# planar_graph_playground
JavaScript playground for drawing planar graphs (eg. fullerenes) in browser.

## gaus-jordan.js

Simple Node.JS solver for system of linear equations module is taken from:  
[https://github.com/lovasoa/linear-solve/blob/master/gauss-jordan.js](https://github.com/lovasoa/linear-solve/blob/master/gauss-jordan.js)

Made it usable for browser JavaScript by changing 1 line and deleting 5 lines only.

## assert.js

Simple ```assert()``` for JavaScript.

## undirected_graph.js

Implementation of undirect graph as well as embedding functions.  

Just ```forall_edges(G, f)``` as example ...

	function forall_edges(G, f) {
	    var v;
	    for (v = 0; v < G.length; v += 1) {
	        G[v].forEach(function (w) {
	            if (v < w) {
	                f(v, w);
	            }
	        });
	    }
	}

... used to draw SVG lines for all edges like this:  

	  forall_edges(G, function(v, w){
	    cx=l/2+(l/2-r)*coords[0][v];
	    cy=l/2+(l/2-r)*coords[1][v];
	    dx=l/2+(l/2-r)*coords[0][w];
	    dy=l/2+(l/2-r)*coords[1][w];
	    document.write('<line class="l" x1="'+cx+'" y1="'+cy+'" x2="'+dx+'" y2="'+dy+'"></line>');
	  })

## tutte.js

Function ```tutte(Emb, face, factor)``` computes x/y coordinates for convex planar straight line drawings of embedding ```Emb```, with array ```face``` vertices on the outer face.  
![from Goos Kant PhD](res/Goos_Kant_PhD.snippet.png)

## index.html

Browser demo application for drawing fullerenes C20, C30, ..., C70, with quite some browser interaction. See this forum posting for current details:  
[https://forums.raspberrypi.com/viewtopic.php?p=1991331#p1991331](https://forums.raspberrypi.com/viewtopic.php?p=1991331#p1991331)  

Peek screenrecorder animated .gif showcasing initial application:  
![Initial demo](res/Peek_2022-04-07_04-28.gif)

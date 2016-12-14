---
title: Exploring fractals
date: 2016-12-09
tags: []
author: Stefanie Schirmer
---
I really like JavaScript, and also the self-repeating patterns of nature. Leopard spots, sunflower seeds, surface tiles. Fractals are interesting self-similar structures that can often be viewed in 2d and look very organic. Can we explore them in Javascript?
Let's talk about what a fractal is. It is a mathematical object that is similar-but-different to itself in the previous level of detail. Patterns that you see on one level of detail may also repeat on the next lower level of detail and so on and so on. Potentially, there are infinitely many levels of detail.
A good real-life explanation of a fractal is the coastline of England (see Albrecht Beutelspacher's books). If we draw a coarse map, we leave out some bays and smaller nooks of the landscape. But if we draw a more fine-grained map, we would draw more details for the coastline and include more small nooks and bays. Interestingly, the coastline's patterns on the different maps still resemble each other. We could go down to the tiniest level of detail and still get a similar line pattern for the coastline of England. 

For my JavaScript program, the fractal is an equation that defines lots of "circular" functions, one for each parameter. So for each step of our iteration, we get a closed path that resembles a circle, and defines whether a point in 2d is inside or outside of that function - or on the island vs in the water.
A constant is added in each step, making the resulting shape more and more precise. For us this is happening in 2D.
```` javascript
// a and b are our components to start with,
// x and y is what we get by adding a and b to it
function iter(a, b, x, y, ba, mi) {
  var n = 0;
  var x2 = x*x;
  var y2 = y*y;

  do { // z -> z^2 + c
    y = 2*x*y + b;
    x = x2 - y2 + a;
    x2 = x*x;
    y2 = y*y;
    n++;
  }
  while (((x2+y2) < ba) && (n < mi));

  return n;
}
````

If you go to the research page header and play with the fractal explorer, and look just at the first preset (a view of Mandelbrot set) and do only one iteration and redraw, the screen is filled with one color. 
If you do two iterations you see a shape emerging. It is just a circle-like bubble. With the third iteration you see a T-like bubble inside of that one, with a third color, and so on and so on. We see the fractal being constructed and getting more fine-grained.
Let's see what it looks like.
<img src="http://i.imgur.com/0HtKiqP.png" alt="4 Iterations">
This image is for four iterations.
<img src="http://i.imgur.com/OmFVYC2.png" alt="6 Iterations">
Six iterations.
<img src="http://i.imgur.com/HZ3isRT.png" alt="20 Iterations">
20 iterations - this looks like the Mandelbrot set already. But if we zoom in we see it is very coarse, still.

Determining how every pixel should be colored is a lot of work, we have to check every pixel via the equation for each 2D coordinate and iteration value. To speed this up, we can use JavaScript webworkers. Each worker computes one row of pixels in parallel using multithreading.
You can try out the computation without or with multithreading (checkbox) and see the speedup we can get.

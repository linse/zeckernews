<script type="text/javascript">
  var canvas;
  var pixelWidth = 25;
  var colors = [];

  $(document).ready(load);

  // On resize of browser window, only act if width changes
  window.onresize = function() {
    var cachedWidth = $(window).width();
    $(window).resize(function(){
        var newWidth = $(window).width();
        if(newWidth !== cachedWidth){
            // here we resize the canvas and redraw
            load();
            // here we update the cached val
            cachedWidth = newWidth;
        }
    });
  }

  function load() {
    w = window.innerWidth;
    initialize("header");
    for (var i = 1; i <= 6; i++) {
        (function(index) {
            setTimeout(function() { draw(index); }, i * 100);
        })(i);
    }

  }
  
  function initialize(canvasElement) {
    // resize
    canvas = document.getElementById(canvasElement);
    canvas.width = $(window).width()
    // make colors
    for (var i = 1; i <= numPixels(canvas, pixelWidth); i++) {
      colors.push(i);
    }
  }

  function draw() {
    row = 0, col = 0, i = 0;
    // col by col
    shuffle(colors);
    for (col=0; col<=numCols(canvas, pixelWidth); col++) {
      for (row=0; row<=numRows(canvas, pixelWidth); row++) {
        fillPixel(colors[i++], pixelWidth);
      }
    }
  }

  function fillPixel(color, w) {
    var ctx = canvas.getContext("2d")
    ctx.globalAlpha = Math.random();
    ctx.beginPath();
    ctx.rect(col*w, row*w, w, w);
    ctx.fillStyle = rainbow(canvas, color, numPixels(canvas,w));
    ctx.fill();
    row;
  }

  function rainbow(c, color, numPixels) {
    color = color * 240 / (numPixels - Math.max(c.width,c.height)); // could be 255
    return 'hsl(' + color + ',100%,75%)';
  }

  function numPixels(canvas, pixelWidth) {
    return Math.ceil((canvas.width * canvas.height) / (pixelWidth * pixelWidth)) 
          + (Math.max(canvas.width, canvas.height));
  }

  function numCols(canvas, pixelWidth) {
    return Math.ceil(canvas.width / pixelWidth);
  }

  function numRows(canvas, pixelWidth) {
    return Math.ceil(canvas.height / pixelWidth);
  }

  function shuffle(a) {
      var j, x, i;
      for (i = a.length; i; i--) {
          j = Math.floor(Math.random() * i);
          x = a[i - 1];
          a[i - 1] = a[j];
          a[j] = x;
      }
  }
</script>

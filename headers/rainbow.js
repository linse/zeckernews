<script type="text/javascript">
  $(window).on('load',init);
  $(window).on('resize',init);

  function init() {
    for (var i = 1; i <= 6; i++) {
        (function(index) {
            setTimeout(function() { drawPixels(index); }, i * 100);
        })(i);
    }
  }

  function drawPixels(i) {
    var canvas = $('#header').get(0)
    resizeCanvas(canvas);

    var pixelWidth = 50;
    var colors = [];
    for (var i = 1; i <= numPixels(canvas, pixelWidth); i++) {
      colors.push(i);
    }
  
    col = 0; 
    row = 0;
  
    //shuffle(colors);
    colors.forEach(function(color) {
      fillPixel(canvas, color, pixelWidth);
    })
  }

  function resizeCanvas(canvas) {
    canvas.width = $(window).width()
  }

  function rainbow(c, color, numPixels) {
    color = color * 240 / (numPixels - Math.max(c.width,c.height)); // could be 255
    return 'hsl(' + color + ',100%,75%)';
  }

  function numPixels(canvas, pixelWidth) {
    return Math.ceil((canvas.width * canvas.height) / (pixelWidth * pixelWidth)) 
          + (Math.max(canvas.width, canvas.height));
  }

  function fillPixel(c, color, w) {
    var ctx = c.getContext("2d")
    if (row*w > c.height) {
      col++;
      row = 0;
    }
    ctx.beginPath();
    ctx.rect(col*w, row*w, w, w);
    ctx.fillStyle = rainbow(c, color, numPixels(c,w));
    ctx.fill();
    row++;
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
<meta name=viewport content='width=800'>
<canvas id="header" width="100%" height="200px" border="2px black">You need a HTML5 browser to see the fancy header.</canvas>

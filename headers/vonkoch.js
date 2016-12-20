  <script type="text/javascript">
    var mainCanvas;
    var circles;
    var mainContext;
    var mainSpeed = 2;

    window.onload = init;
    window.onresize = init;

    function init() {
      mainCanvas = document.getElementById("header");
      mainCanvas.width = window.innerWidth;
      mainContext = mainCanvas.getContext('2d');
      circles = [];
      drawShapes();
    }

    // radius and speed are for the movement
    // width, x and y are for the shape
    function Shape(radius, speed, width, xPos, yPos) {
      this.radius = radius;
      this.speed = speed;
      this.width = width;
      this.xPos = xPos;
      this.yPos = yPos;
      this.opacity = 0.05 + Math.random() * 0.3;
      this.rgb = { 'r': Math.floor(Math.random() * 256) , 
                   'g': Math.floor(Math.random() * 256), 
                   'b': Math.floor(Math.random() * 256) };
      // 0-3 are ok for anim still, and if we vary, we can go up to 5
      this.fractalDepth = Math.floor(Math.random() * 4);

      this.counter = 0;

      var signHelper = Math.floor(Math.random() * 2);

      if (signHelper == 1) {
        this.sign = -1;
      } else {
        this.sign = 1;
      }
    }

    var deg = Math.PI/180; // degree to Radiant

    // draw Von-Koch-Kurve in context c
    // left lower corner at x,y; leg length len
    function snowflake(c, n, x, y, len) {
      c.save();             // save current transformation state for later
      c.translate(x,y);     // move to the starting point
      c.moveTo(0,0);        // begin a new sub-path
      leg(n);               // draw first fractal leg
      c.rotate(-120 * deg); // rotate 120 deg, counter-clockwise
      leg(n);               // draw second leg
      c.rotate(-120 * deg); // rotate again
      leg(n);               // draw last leg
      c.closePath();        // close sub-path
      c.restore();          // restore original transformation state

      // draw one leg, 
      // leave with current point at the end of the leg
      // move coordinate system so that the current point becomes 0,0
      // so after drawing a leg you can simply call rotate
      function leg(n) {
        c.save();             // save current transformation state
        if (n == 0) {         // base case:
          c.lineTo(len, 0);   // just draw a horizontal line
        }
        else {                // recursive case: draw four horizontal line segments -v-
          c.scale(1/3,1/3);   // sub-lines have 1/3 of the side length
          leg(n-1);           // draw first line-segment
          c.rotate(60*deg);   // rotate 60 degrees, clockwise
          leg(n-1);           // draw second line-segment
          c.rotate(-120*deg); // rotate 120 degrees, back/counterclockwise
          leg(n-1);           // draw third line-segment
          c.rotate(60*deg);   // rotate back to the original direction
          leg(n-1);           // draw last line-segment
        }
        c.restore();          // restore the original transformation
        c.translate(len, 0);  // move to the end of the line
      }
    }

    // where the shape goes next
    Shape.prototype.update = function() {
      this.counter += this.sign * this.speed * mainSpeed;
      mainContext.beginPath();

      var newX = this.xPos + Math.cos(this.counter / 100) * this.radius;
      var newY = this.yPos + Math.sin(this.counter / 100) * this.radius;

      // a) von-Koch
      snowflake(mainContext, this.fractalDepth, newX, newY, this.width);

      mainContext.fillStyle = 'rgba(' + this.rgb.r +', 211, 238,' + this.opacity + ')';
      mainContext.fillStyle = 'rgba(' + this.rgb.r +', ' + this.rgb.g + ', '+ this.rgb.b + ',' + this.opacity + ')';
      mainContext.fill();
    };

    function drawShapes() {
      for (var i = 0; i < 350; i++) {
        var randomX = Math.round(-200+Math.random() * (window.innerWidth+200));
        var randomY = Math.round(Math.random() * (200+200));
        var speed = 0.2 + Math.random() * 3;
        var size = 5 + Math.random() * 200;

        var circle = new Shape(100, speed, size, randomX, randomY);
        if (circles) {
          circles.push(circle);
        }
      }
      draw();
    }
    drawShapes();

    function draw() {
      if (mainContext) {
        mainContext.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
      }

      if (circles) {
        for (var i = 0; i < circles.length; i++) {
          var myShape = circles[i];
          myShape.update();
        }
        requestAnimationFrame(draw);
      }
    }
  </script>

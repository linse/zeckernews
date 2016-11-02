<script type="text/javascript">

//function rainbow(c, color, numPixels) {
//    color = color * 240 / (numPixels - Math.max(c.width,c.height)); // could be 255
//    return 'hsl(' + color + ',100%,75%)';
//}
//
//function numPixels(canvas, pixelWidth) {
//    return Math.ceil((canvas.width * canvas.height) / (pixelWidth * pixelWidth)) 
//          + (Math.max(canvas.width,canvas.height));
//}
//
//function fillPixel(c, color, w) {
//    var ctx = c.getContext("2d")
//    if (row*w > c.height) {
//            col++;
//            row = 0;
//    }
//    ctx.beginPath();
//    ctx.rect(col*w, row*w, w, w);
//    ctx.fillStyle = rainbow(c, color, numPixels(c,w));
//    ctx.fill();
//    row++;
//}
//
//// filling the canvas black as a test
//function fillCanvas(c) {
//    var ctx = c.getContext("2d")
//    ctx.fillRect(0, 0, c.width, c.height);
//}
//
//function init() {
//    var c = document.getElementById("header")
//    resizeCanvas(c);
//    fillCanvas(c);
//
//    var pixelWidth = 20;
//    var colors = [];
//    for (var i = 1; i <= numPixels(c,pixelWidth); i++) {
//      colors.push(i);
//    }
//
//    col = 0; 
//    row = 0;
//
//    //shuffle(colors);
//    colors.forEach(function(color) {
//      fillPixel(c,color,pixelWidth);
//    })
//    //setTimeout(init, 100);
//    window.scrollTo(0, 170);
////    stickNav();
//}
//
//$(function() {
//  init();
//});
//
//
//window.onresize = init;
</script>

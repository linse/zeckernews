var ctx;
var W;
var H;
var col;
var row;
var numPixels;

function testResults(this.form) {
	alert("Test results")
}

function draw() {
	var canvas = document.getElementById('header');
	ctx = canvas.getContext("2d");
	// resize the canvas to occupy the full page
	W = window.innerWidth;
	H = canvas.height;// window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	// some variables
	col = 0;
	row = 0;
	w = 3;
	numPixels = Math.ceil((W * H) / (w*w))+(Math.max(W,H));
	init();
}

function rainbow(n) {
	n = n * 240 / (numPixels-Math.max(W,H)); // could be 255
	return 'hsl(' + n + ',100%,50%)';
} 

function init() {
	// filling the canvas white
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, W, H);

	var colors = []	
	for (var i = 1; i <= numPixels; i++) { 
		colors.push(i); 
	}
	col = 0; row = 0;

	shuffle(colors);
	colors.forEach(function(c) { 
		printPixel(c); 
	})
	setTimeout(init, 100);
}

function printPixel(c) {
	ctx.beginPath();
	if (row*w > H) {
		col++;
		row = 0; 
	}
	ctx.rect(col*w, row*w, w, w);
	ctx.fillStyle = rainbow(c);
	ctx.fill();
	row++;
}

function shuffle(array) {
	var currentIndex = array.length , temporaryValue , randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

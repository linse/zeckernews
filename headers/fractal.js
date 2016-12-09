<!-- INSERT FROM HERE needs assets: pics for slider and also the worker.js -->
<style>
body {
/* not worth it
    background-image:url(/fractal.jpg);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: top center; 
    margin: -15px;
    padding: -15px;
    width: 100%;*/
}

/* not in effect yet */
/*
.slider_bg {
  width: 152;
  height: 16;
  border:1px solid #aaa;
}

.slider {
  width: 19;
  height: 16;
}
*/

/* for fractal header */
#params {
  font-size: 14px; 
  background: rgba(255,255,150,.90);
  padding: 8px; 
  position: absolute; 
  top: 10px; 
  right: 10px
}

#params img {
  width: unset;
}
</style>

<script type="text/javascript">
function slider(presets, settings) {
  this.setValue = sliderSetValue;
  this.getPosition = sliderGetPos;
  
  // register in the global list
  if (!window.sliders)
    window.sliders = [];
  var id = this.id = window.sliders.length;
  window.sliders[id] = this;
  
  // save config parameters in the slider object
  var key;
  if (settings) {
    for (key in settings) {
      this[key] = settings[key];
    }
  }
  for (key in presets) {
    this[key] = presets[key];
  }
  this.pix2value = this.pathLength / (this.maxValue - this.minValue);
  if (this.value == null) {
    this.value = this.minValue;
  }
  
  // generate the control's HTML - somehow this does not work when styled via css?
  document.write('<div style="width:' + this.controlWidth + 'px;height:' + this.controlHeight 
            + 'px;border:1px solid #aaa" id="sl' + id + 'base" class="slider_bg">'
  	        + '<img src="' + this.imgSlider + '" width="' + this.sliderWidth + '" height="' + this.sliderHeight 
            + '" border="0" style="position:relative;left:' + this.pathLeft + 'px;top:' + this.pathTop 
            + 'px;z-index:' + this.zIndex + ';cursor:pointer;visibility:hidden;"'
            +' name="sl' + id + 'slider" id="sl' + id + 'slider" onmousedown="return sliderMouseDown(' + id + ')" class="slider"/></div>'
  );
  this.e_base   = get_element('sl' + id + 'base');
  this.e_slider = get_element('sl' + id + 'slider');
  
  if (document.addEventListener) {
    this.e_slider.addEventListener("touchstart", function (e_event) { sliderMouseDown(id, e_event) },  false);
    document.addEventListener("touchmove", sliderMouseMove,  false);
    document.addEventListener("touchend", sliderMouseUp,  false);
  }

  // safely hook document/window events
  if (!window.savedMouseMove && document.onmousemove != sliderMouseMove) {
    window.savedMouseMove = document.onmousemove;
    document.onmousemove = sliderMouseMove;
  }
  if (!window.savedMouseUp && document.onmouseup != sliderMouseUp) {
    window.savedMouseUp = document.onmouseup;
    document.onmouseup = sliderMouseUp;
  }
  
  // preset to the value in the input box if available
  var e_input = this.form == null
    ? get_element(this.name)
    : document.forms[this.form]
      ? document.forms[this.form].elements[this.name]
      : null;
  this.setValue(e_input && e_input.value != '' ? e_input.value : null, 1);
  this.e_slider.style.visibility = 'visible';
}

function sliderSetValue(value, b_noInputCheck) {
  if (value == null) {
    value = this.value == null ? this.minValue : this.value;
  }
  if (isNaN(value)) {
    return false;
  }
  // round to closest multiple if step is specified
  if (this.step) {
    value = Math.round((value - this.minValue) / this.step) * this.step + this.minValue;
  }
  // smooth out the result
  if (value % 1) {
    value = Math.round(value * 1e5) / 1e5;
  }
  
  if (value < this.minValue) {
    value = this.minValue;
  }
  if (value > this.maxValue) {
    value = this.maxValue;
  }
  
  this.value = value;
  
  // move the slider
  this.e_slider.style.left = (this.pathLeft + Math.round((value - this.minValue) * this.pix2value)) + 'px';
  
  // save new value
  var e_input;
  if (this.form == null) {
    e_input = get_element(this.name);
    if (!e_input)
      return b_noInputCheck ? null : sliderError(this.id, "Can not find the input with ID='" + this.name + "'.");
  }
  else {
    var e_form = document.forms[this.form];
    if (!e_form)
      return b_noInputCheck ? null : sliderError(this.id, "Can not find the form with NAME='" + this.form + "'.");
    e_input = e_form.elements[this.name];
    if (!e_input)
      return b_noInputCheck ? null : sliderError(this.id, "Can not find the input with NAME='" + this.name + "'.");
  }
  e_input.value = value;
}

// get absolute position of the element in the document
function sliderGetPos(b_base) {
  var pos = 0, coord = 'Left';
  var o_elem = o_elem2 = b_base ? this.e_base : this.e_slider;
  
  while (o_elem) {
    pos += o_elem["offset" + coord];
    o_elem = o_elem.offsetParent;
  }
  o_elem = o_elem2;
  
  var offset;
  while (o_elem.tagName != "BODY") {
    offset = o_elem["scroll" + coord];
    if (offset)
      pos -= o_elem["scroll" + coord];
    o_elem = o_elem.parentNode;
  }
  return pos;
}

function sliderMouseDown(id, e_event) {
  window.activeSliderId = id;
  sliderSaveTouch(e_event);

  var o_slider = sliders[id];
  window.mouseOffset = window.mouseX - o_slider.sliderWidth  / 2 - o_slider.getPosition(1) - parseInt(o_slider.e_slider.style.left);

  return false;
}

function sliderMouseUp(e_event, isWatching) {
  if (window.activeSliderId != null) {
    var o_slider = window.sliders[window.activeSliderId];
    o_slider.setValue(o_slider.minValue + (parseInt(o_slider.e_slider.style.left) - o_slider.pathLeft) / o_slider.pix2value);
    if (isWatching) {
	return;
    }
    window.activeSliderId = null;
    window.mouseOffset = null;
  }
  if (window.savedMouseUp) {
    return window.savedMouseUp(e_event);
  }
}

function sliderMouseMove(e_event) {
  if (!e_event && window.event) e_event = window.event;
  
  // save mouse coordinates
  if (e_event) {
    window.mouseX = e_event.clientX + scrollLeft();
    window.mouseY = e_event.clientY + scrollTop();
  }
  
  // check if in drag mode
  if (window.activeSliderId != null) {
    sliderSaveTouch(e_event);
    var o_slider = window.sliders[window.activeSliderId];
    
    var pxOffset;
    var sliderLeft = window.mouseX - o_slider.sliderWidth / 2 - o_slider.getPosition(1) - window.mouseOffset;
    // limit the slider movement
    if (sliderLeft < o_slider.pathLeft) {
      sliderLeft = o_slider.pathLeft;
    }
    var pxMax = o_slider.pathLeft + o_slider.pathLength;
    if (sliderLeft > pxMax) {
      sliderLeft = pxMax;
    }
    o_slider.e_slider.style.left = sliderLeft + 'px';
    pxOffset = sliderLeft - o_slider.pathLeft;
    sliderMouseUp(e_event, 1);
    return false;
  }

  if (window.savedMouseMove) {
    return window.savedMouseMove(e_event);
  }
}

function sliderSaveTouch(e_event) {
  if (!e_event || !e_event.touches) return;
  e_event.save_entDefault();
  var e_touch = e_event.touches[0] || e_event.changedTouches[0];
  window.mouseX = e_touch.pageX;
  window.mouseY = e_touch.pageY;
}

// get the scroller positions of the page
function scrollLeft() {
  return filterResults (
    window.pageXOffset ? window.pageXOffset : 0,
    document.documentElement ? document.documentElement.scrollLeft : 0,
    document.body ? document.body.scrollLeft : 0
  );
}

function scrollTop() {
  return filterResults (
    window.pageYOffset ? window.pageYOffset : 0,
    document.documentElement ? document.documentElement.scrollTop : 0,
    document.body ? document.body.scrollTop : 0
  );
}

function filterResults(win, docel, body) {
  var result = win ? win : 0;
  if (docel && (!result || (result > docel)))
    result = docel;
  return body && (!result || (result > body)) ? body : result;
}

function sliderError(id, message) {
  alert("Slider #" + id + " Error:\n" + message);
  window.activeSliderId = null;
}

get_element = document.all ?
  function (id) { return document.all[id] } :
  function (id) { return document.getElementById(id) };
</script>


<script type="text/javascript">
var vga_palette = [[0,0,0],[0,0,168],[0,168,0],[0,168,168],[168,0,0],[168,0,168],[168,84,0],[168,168,168],[84,84,84],[84,84,252],[84,252,84],[84,252,252],[252,84,84],[252,84,252],[252,252,84],[252,252,252],[0,0,0],[20,20,20],[32,32,32],[44,44,44],[56,56,56],[68,68,68],[80,80,80],[96,96,96],[112,112,112],[128,128,128],[144,144,144],[160,160,160],[180,180,180],[200,200,200],[224,224,224],[252,252,252],[0,0,252],[64,0,252],[124,0,252],[188,0,252],[252,0,252],[252,0,188],[252,0,124],[252,0,64],[252,0,0],[252,64,0],[252,124,0],[252,188,0],[252,252,0],[188,252,0],[124,252,0],[64,252,0],[0,252,0],[0,252,64],[0,252,124],[0,252,188],[0,252,252],[0,188,252],[0,124,252],[0,64,252],[124,124,252],[156,124,252],[188,124,252],[220,124,252],[252,124,252],[252,124,220],[252,124,188],[252,124,156],[252,124,124],[252,156,124],[252,188,124],[252,220,124],[252,252,124],[220,252,124],[188,252,124],[156,252,124],[124,252,124],[124,252,156],[124,252,188],[124,252,220],[124,252,252],[124,220,252],[124,188,252],[124,156,252],[180,180,252],[196,180,252],[216,180,252],[232,180,252],[252,180,252],[252,180,232],[252,180,216],[252,180,196],[252,180,180],[252,196,180],[252,216,180],[252,232,180],[252,252,180],[232,252,180],[216,252,180],[196,252,180],[180,252,180],[180,252,196],[180,252,216],[180,252,232],[180,252,252],[180,232,252],[180,216,252],[180,196,252],[0,0,112],[28,0,112],[56,0,112],[84,0,112],[112,0,112],[112,0,84],[112,0,56],[112,0,28],[112,0,0],[112,28,0],[112,56,0],[112,84,0],[112,112,0],[84,112,0],[56,112,0],[28,112,0],[0,112,0],[0,112,28],[0,112,56],[0,112,84],[0,112,112],[0,84,112],[0,56,112],[0,28,112],[56,56,112],[68,56,112],[84,56,112],[96,56,112],[112,56,112],[112,56,96],[112,56,84],[112,56,68],[112,56,56],[112,68,56],[112,84,56],[112,96,56],[112,112,56],[96,112,56],[84,112,56],[68,112,56],[56,112,56],[56,112,68],[56,112,84],[56,112,96],[56,112,112],[56,96,112],[56,84,112],[56,68,112],[80,80,112],[88,80,112],[96,80,112],[104,80,112],[112,80,112],[112,80,104],[112,80,96],[112,80,88],[112,80,80],[112,88,80],[112,96,80],[112,104,80],[112,112,80],[104,112,80],[96,112,80],[88,112,80],[80,112,80],[80,112,88],[80,112,96],[80,112,104],[80,112,112],[80,104,112],[80,96,112],[80,88,112],[0,0,64],[16,0,64],[32,0,64],[48,0,64],[64,0,64],[64,0,48],[64,0,32],[64,0,16],[64,0,0],[64,16,0],[64,32,0],[64,48,0],[64,64,0],[48,64,0],[32,64,0],[16,64,0],[0,64,0],[0,64,16],[0,64,32],[0,64,48],[0,64,64],[0,48,64],[0,32,64],[0,16,64],[32,32,64],[40,32,64],[48,32,64],[56,32,64],[64,32,64],[64,32,56],[64,32,48],[64,32,40],[64,32,32],[64,40,32],[64,48,32],[64,56,32],[64,64,32],[56,64,32],[48,64,32],[40,64,32],[32,64,32],[32,64,40],[32,64,48],[32,64,56],[32,64,64],[32,56,64],[32,48,64],[32,40,64],[44,44,64],[48,44,64],[52,44,64],[60,44,64],[64,44,64],[64,44,60],[64,44,52],[64,44,48],[64,44,44],[64,48,44],[64,52,44],[64,60,44],[64,64,44],[60,64,44],[52,64,44],[48,64,44],[44,64,44],[44,64,48],[44,64,52],[44,64,60],[44,64,64],[44,60,64],[44,52,64],[44,48,64],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];

var bw_palette = [[0,0,0],[252,252,252],[248,252,252],[252,248,252],[252,248,248],[248,248,248],[244,248,248],[248,244,252],[248,244,244],[244,244,244],[240,244,244],[244,240,248],[244,240,240],[240,240,240],[236,240,240],[240,236,244],[240,236,236],[236,236,236],[232,236,236],[236,232,240],[236,232,232],[232,232,232],[228,232,232],[232,228,236],[232,228,228],[228,228,228],[224,228,228],[228,224,232],[228,224,224],[224,224,224],[220,224,224],[224,220,228],[224,220,220],[220,220,220],[216,220,220],[220,216,224],[220,216,216],[216,216,216],[212,216,216],[216,212,220],[216,212,212],[212,212,212],[208,212,212],[212,208,216],[212,208,208],[208,208,208],[204,208,208],[208,204,212],[208,204,204],[204,204,204],[200,204,204],[204,200,208],[204,200,200],[200,200,200],[196,200,200],[200,196,204],[200,196,196],[196,196,196],[192,196,196],[196,192,200],[196,192,192],[192,192,192],[188,192,192],[192,188,196],[192,188,188],[188,188,188],[184,188,188],[188,184,192],[188,184,184],[184,184,184],[180,184,184],[184,180,188],[184,180,180],[180,180,180],[176,180,180],[180,176,184],[180,176,176],[176,176,176],[172,176,176],[176,172,180],[176,172,172],[172,172,172],[168,172,172],[172,168,176],[172,168,168],[168,168,168],[164,168,168],[168,164,172],[168,164,164],[164,164,164],[160,164,164],[164,160,168],[164,160,160],[160,160,160],[156,160,160],[160,156,164],[160,156,156],[156,156,156],[152,156,156],[156,152,160],[156,152,152],[152,152,152],[148,152,152],[152,148,156],[152,148,148],[148,148,148],[144,148,148],[148,144,152],[148,144,144],[144,144,144],[140,144,144],[144,140,148],[144,140,140],[140,140,140],[136,140,140],[140,136,144],[140,136,136],[136,136,136],[132,136,136],[136,132,140],[136,132,132],[132,132,132],[128,132,132],[132,128,136],[132,128,128],[128,128,128],[124,128,128],[128,124,132],[128,124,124],[124,124,124],[120,124,124],[124,120,128],[124,120,120],[120,120,120],[116,120,120],[120,116,124],[120,116,116],[116,116,116],[112,116,116],[116,112,120],[116,112,112],[112,112,112],[108,112,112],[112,108,116],[112,108,108],[108,108,108],[104,108,108],[108,104,112],[108,104,104],[104,104,104],[100,104,104],[104,100,108],[104,100,100],[100,100,100],[96,100,100],[100,96,104],[100,96,96],[96,96,96],[92,96,96],[96,92,100],[96,92,92],[92,92,92],[88,92,92],[92,88,96],[92,88,88],[88,88,88],[84,88,88],[88,84,92],[88,84,84],[84,84,84],[80,84,84],[84,80,88],[84,80,80],[80,80,80],[76,80,80],[80,76,84],[80,76,76],[76,76,76],[72,76,76],[76,72,80],[76,72,72],[72,72,72],[68,72,72],[72,68,76],[72,68,68],[68,68,68],[64,68,68],[68,64,72],[68,64,64],[64,64,64],[60,64,64],[64,60,68],[64,60,60],[60,60,60],[56,60,60],[60,56,64],[60,56,56],[56,56,56],[52,56,56],[56,52,60],[56,52,52],[52,52,52],[48,52,52],[52,48,56],[52,48,48],[48,48,48],[44,48,48],[48,44,52],[48,44,44],[44,44,44],[40,44,44],[44,40,48],[44,40,40],[40,40,40],[36,40,40],[40,36,44],[40,36,36],[36,36,36],[32,36,36],[36,32,40],[36,32,32],[32,32,32],[28,32,32],[32,28,36],[32,28,28],[28,28,28],[24,28,28],[28,24,32],[28,24,24],[24,24,24],[20,24,24],[24,20,28],[24,20,20],[20,20,20],[16,20,20],[20,16,24],[20,16,16],[16,16,16],[12,16,16],[16,12,20],[16,12,12],[12,12,12],[8,12,12],[12,8,16],[12,8,8],[8,8,8],[4,8,8],[8,4,12],[8,4,4],[4,4,4],[0,4,4],[4,0,8],[4,0,0],[0,0,0],[0,0,0],[0,0,0]];

var sepia_palette = [[0,0,0],[11,5,0],[23,11,0],[34,17,0],[45,22,0],[56,28,0],[66,33,0],[76,38,0],[84,42,0],[92,46,0],[99,49,0],[105,52,0],[110,55,0],[114,57,0],[117,58,0],[119,59,0],[120,60,0],[119,59,0],[117,58,0],[114,57,0],[110,55,0],[105,52,0],[99,49,0],[92,46,0],[84,42,0],[76,38,0],[66,33,0],[56,28,0],[45,22,0],[34,17,0],[23,11,0],[11,5,0],[0,0,0],[17,8,0],[35,17,0],[52,26,0],[68,34,0],[84,42,0],[100,50,0],[114,57,0],[127,63,0],[139,69,0],[149,74,0],[158,79,0],[166,83,0],[172,86,0],[176,88,0],[179,89,0],[180,90,0],[179,89,0],[176,88,0],[172,86,0],[166,83,0],[158,79,0],[149,74,0],[139,69,0],[127,63,0],[114,57,0],[100,50,0],[84,42,0],[68,34,0],[52,26,0],[35,17,0],[17,8,0],[0,0,0],[23,11,0],[46,23,0],[69,34,0],[91,45,0],[113,56,0],[133,66,0],[152,76,0],[169,84,0],[185,92,0],[199,99,0],[211,105,0],[221,110,0],[229,114,0],[235,117,0],[238,119,0],[240,120,0],[238,119,0],[235,117,0],[229,114,0],[221,110,0],[211,105,0],[199,99,0],[185,92,0],[169,84,0],[152,76,0],[133,66,0],[113,56,0],[91,45,0],[69,34,0],[46,23,0],[23,11,0],[0,0,0],[24,17,0],[49,35,0],[74,52,0],[97,68,0],[120,84,0],[141,100,0],[161,114,0],[180,127,0],[197,139,0],[212,149,0],[224,158,0],[235,166,0],[244,172,0],[250,176,0],[253,179,0],[255,180,0],[253,179,0],[250,176,0],[244,172,0],[235,166,0],[224,158,0],[212,149,0],[197,139,0],[180,127,0],[161,114,0],[141,100,0],[120,84,0],[97,68,0],[74,52,0],[49,35,0],[24,17,0],[0,0,0],[24,19,0],[49,39,0],[74,58,0],[97,76,0],[120,94,0],[141,111,0],[161,126,0],[180,141,0],[197,154,0],[212,166,0],[224,176,0],[235,184,0],[244,191,0],[250,196,0],[253,199,0],[255,200,0],[253,199,0],[250,196,0],[244,191,0],[235,184,0],[224,176,0],[212,166,0],[197,154,0],[180,141,0],[161,126,0],[141,111,0],[120,94,0],[97,76,0],[74,58,0],[49,39,0],[24,19,0],[0,0,0],[24,20,0],[49,40,0],[74,60,0],[97,80,0],[120,98,0],[141,116,0],[161,133,0],[180,148,0],[197,162,0],[212,174,0],[224,185,0],[235,194,0],[244,200,0],[250,205,0],[253,208,0],[255,210,0],[253,208,0],[250,205,0],[244,200,0],[235,194,0],[224,185,0],[212,174,0],[197,162,0],[180,148,0],[161,133,0],[141,116,0],[120,98,0],[97,80,0],[74,60,0],[49,40,0],[24,20,0],[0,0,0],[24,21,0],[49,42,0],[74,63,0],[97,84,0],[120,103,0],[141,122,0],[161,139,0],[180,155,0],[197,170,0],[212,182,0],[224,194,0],[235,203,0],[244,210,0],[250,215,0],[253,218,0],[255,220,0],[253,218,0],[250,215,0],[244,210,0],[235,203,0],[224,194,0],[212,182,0],[197,170,0],[180,155,0],[161,139,0],[141,122,0],[120,103,0],[97,84,0],[74,63,0],[49,42,0],[24,21,0],[0,0,0],[24,22,2],[49,44,5],[74,66,8],[97,88,11],[120,108,14],[141,127,16],[161,145,19],[180,162,21],[197,177,23],[212,191,24],[224,202,26],[235,212,27],[244,220,28],[250,225,29],[253,228,29],[255,230,30],[253,228,29],[250,225,29],[244,220,28],[235,212,27],[224,202,26],[212,191,24],[197,177,23],[180,162,21],[161,145,19],[141,127,16],[120,108,14],[97,88,11],[74,66,8],[49,44,5],[24,22,2]];

// first one is a dummy because proc coloring needs no palette
var palettes = [vga_palette, vga_palette, bw_palette, sepia_palette];
var palette = 0;

var ct2d;
var surfacewidth;
var surfaceheight;
var canvas;

var escapevalue = 4.0;
var maxiter = 150;

// currently visible zoom rectangle on canvas
var region = { startx: -2.4, starty: 1.2,
               extx: 3.2, exty: 2.4 }
// where in the fractal space?
var fractal = { re: 0.0, im: 0.0, julia: false };
// when we save, we save region and fractal
var save = { region: region, re: fractal.re, im: fractal.im };
// mouse click/drag data
var mouse = { down: false, b:0, bx:0, by:0 }

var lp1;
var lp2;
var gred = 6;
var ggreen = 12;
var gblue = 18;
var range = 1;


var backimg;
var mthread;
var maxthreads = 8;
var actthread = 1;
var workers = new Array();
var timeout = 0;

var gi = 0; // i-th circular surface map?
var start = 0;

function statsreport(msg) {
//tdiv=document.getElementById("rendtime");
//tdiv.innerHTML="Rend.Time: "+msg;
//xdiv=document.getElementById("divx");
//xdiv.innerHTML="x1: " + region.startx.toFixed(16) + "  x2: " + (region.startx+region.extx).toFixed(16);
//ydiv=document.getElementById("divy");
//ydiv.innerHTML="y1: " + region.starty.toFixed(16) + "  y2: " + (region.starty-region.exty).toFixed(16);
}

function statsreportpos(xre,yim) {
//  alert("x1: " + region.startx.toFixed(16) 
//    + "  x2: " + (region.startx+region.extx).toFixed(16) 
//     + "  x: " + xre.toFixed(16)
//   + "\n y1: " + region.starty.toFixed(16) 
//    + "  y2: " + (region.starty-region.exty).toFixed(16)
//     + "  y: " + yim.toFixed(16));
}

/* reset to mandel start */
function setMandel() {
  fractal = { re: 0.0, im: 0.0, julia: false };
}

/* reset to julia start */
function setJulia(real, imaginary) {
  fractal = { re: real, im: imaginary, julia: true };
}

function setColor(r, g, b, rng, p100) {
  sliders[0].setValue(r);
  sliders[1].setValue(g);
  sliders[2].setValue(b);
  gred = parseInt(document.getElementById("sliderred").value);
  ggreen = parseInt(document.getElementById("slidergreen").value);
  gblue = parseInt(document.getElementById("sliderblue").value);
  palette = 0;
  document.getElementById("proc").checked = true;
  document.getElementById("p100").checked = p100;
  range = rng;
}

function setRegion(sx, sy, ex, ey) {
  region.startx = sx;
  region.extx = ex;
  region.starty = sy;
  region.exty = ey;
}

function resetRegion(region) {
  region = region;
}

function setIterations(iters, esc) {
  escapevalue = esc;
  maxiter = iters;
  document.getElementById("iteration").value = maxiter;
  document.getElementById("escape").value = escapevalue;
}

function resetvalues(preset) {
  if (preset===0) {
    setMandel();
    // ideally something in between the two
    //setRegion(-2.4, 1.2, 3.2, 2.4);
    setRegion(-1.5530336967141098, 1.0940454648625746, 3.081684406066686, 2.196795086888102);
    setColor(6, 16, 12, 1, false);
    setIterations(150, 4.0);
  }
  else if (preset===1) {
    setRegion(-0.9901653, 0.30967819, 0.000049076112, 0.00003680);
    setMandel();
    setColor(73, 86, 100, 0.01, true);
    setIterations(1000, 4.0);
  }
  else if (preset===2) {
    setMandel();
    setRegion(-0.7473453988298784, 0.08786729413261629, 0.00003635204133733971, 0.00002727413261628675);
    setColor(5, 5, 5, 1, false);
    setIterations(500, 4.0);
  }
  else if (preset===3) {
    setMandel();
    setRegion(-0.7505856822290244, 0.09319188280359733, 0.0073114653345977, 0.005481528937150232);
    setColor(25, 25, 25, 0.01, true);
    setIterations(1000, 4.0);
  }
  else if (preset===4) {
    setMandel();
    setRegion(-1.2584439628969177, 0.3824003228346746, 1.2240005653474384e-7, 9.180012777720847e-8);
    setIterations(3000, 4.0);
    palette = 1;
    document.getElementById("vga").checked = true;
  }
  else if (preset===5) {
    setJulia(-0.777306122448979592, 0.118040816326530612);
    setRegion(-1.5530336967141098, 1.0940454648625746, 3.081684406066686, 2.196795086888102);
    setIterations(1000, 4.0);
    palette = 3;
    document.getElementById("sepia").checked = true;
  }
}

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


function drawrowmt () {
  gi = 0;
  for (var i = 0; i < maxthreads; i++) {
    var worker = workers[i];
    if (worker.idle) {
      var b = region.starty - (gi * lp2);
      var a = region.startx;
      worker.idle = false;
      worker.postMessage({
        gi:gi,
        a: a,
        b: b,
        re: fractal.re,
        im: fractal.im,
        lp1: lp1,
        maxiter: maxiter,
        escapevalue: escapevalue,
        surfacewidth: surfacewidth,
        julia: fractal.julia,
      })
      gi++;
    }
  }
}


function msghandler(worker, data) {
  var n;
  var offset = 0;
  var image = ct2d.createImageData(surfacewidth, 1);
  var pixels = image.data;
  var values = data.values;
  for (var j = 0; j < surfacewidth; j++) {
    n = values[j];
    if (n >= maxiter) {
      pixels[offset++] = 0;
      pixels[offset++] = 0;
      pixels[offset++] = 0;
      pixels[offset++] = 255;
    }
    else {
      if (palette==0) {
        pixels[offset++] = Math.round(n*gred*range) & 255;
        pixels[offset++] = Math.round(n*ggreen*range) & 255;
        pixels[offset++] = Math.round(n*gblue*range) & 255;
        pixels[offset++] = 255;
      }
      else {
        pixels[offset++] = palettes[palette][n & 255][0];
        pixels[offset++] = palettes[palette][n & 255][1];
        pixels[offset++] = palettes[palette][n & 255][2];
        pixels[offset++] = 255;
      }
    }
  }
  ct2d.putImageData(image, 0, data.gi);
  if (gi < surfaceheight) {
    var b = region.starty - (gi * lp2);
    var a = region.startx;
    worker.idle = false;
    worker.postMessage({
      gi:gi,
      a: a,
      b: b,
      re: fractal.re,
      im: fractal.im,
      lp1: lp1,
      maxiter: maxiter,
      escapevalue: escapevalue,
      surfacewidth: surfacewidth,
      julia: fractal.julia,
    })
    gi++;
  }
  else {
    worker.idle = true;
    if (actthread == maxthreads) {
      var elapsed = new Date().getTime() - start;
      statsreport(elapsed + " ms");
      actthread = 1;
    }
    else actthread++;
  }
}

// in: ct2d, surfacewidth, gi, lp2, lp1, re, im, escapevalue, maxiter 
function drawrows() {
  var n = 0;
  var offset = 0;

  var image = ct2d.createImageData(surfacewidth, 1);
  var pixels = image.data;

  var b = region.starty - (gi * lp2);
  var a = region.startx;

  for (var j = 0; j < surfacewidth; j++) {
    a = a + lp1;
    if (!fractal.julia)
      n = iter(a, b, fractal.re, fractal.im, escapevalue, maxiter);
    else
      n = iter(fractal.re, fractal.im, a, b, escapevalue, maxiter);

    if (n >= maxiter) { // end of iterations: paint it black
      pixels[offset++] = 0; // r
      pixels[offset++] = 0; // g
      pixels[offset++] = 0; // b
      pixels[offset++] = 255; // a
    }
    else {
      if (palette==0) { // procedural coloring
        pixels[offset++] = Math.round(n*gred*range) & 255;
        pixels[offset++] = Math.round(n*ggreen*range) & 255;
        pixels[offset++] = Math.round(n*gblue*range) & 255;
        pixels[offset++] = 255;
      }
      else { // palette coloring
        pixels[offset++] = palettes[palette][n & 255][0];
        pixels[offset++] = palettes[palette][n & 255][1];
        pixels[offset++] = palettes[palette][n & 255][2];
        pixels[offset++] = 255;
      }
    }
  }

  ct2d.putImageData(image, 0, gi);

  if (gi < surfaceheight - 1) {
    gi++;
    if (gi % 24 !== 0)
      drawrows();
    else
      setTimeout("drawrows()", 0);
  }
  else {
    var elapsed = new Date().getTime() - start;
    statsreport(elapsed + " ms");
  }
}

// here we also scale?
function draw() {
  start = new Date().getTime();
  gi = 0;
  //alert(surfacewidth + " / " + region.extx + " :: " + surfaceheight + " / " + region.exty);
  lp1 = region.extx / surfacewidth;
  lp2 = region.exty / surfaceheight;
  if (mthread.checked) drawrowmt(); else drawrows();
}


function getmousepos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function onmousedown(e) {
  mouse.down = true;
  mouse.b = e.button;

  // shared with ontouchstart
  var mousepos = getmousepos(canvas, e);
  mouse.bx = Math.round(mousepos.x);
  mouse.by = Math.round(mousepos.y);
  backimg = ct2d.getImageData(0, 0, surfacewidth, surfaceheight);
}

// draw a box and zoom into it
function onmousemove(e) {
  var mousepos = getmousepos(canvas, e);
  var currx = Math.round(mousepos.x);
  var curry = Math.round(mousepos.y);

  if (mouse.down && mouse.b == 0) {
    curry = mouse.by + (booltoint(curry > mouse.by) * 2 - 1) * Math.round(surfaceheight * Math.abs(currx - mouse.bx) / surfacewidth);
    ct2d.putImageData(backimg, 0, 0);
    ct2d.strokeStyle = "rgb(255,255,255)";
    ct2d.strokeRect(mouse.bx, mouse.by, currx - mouse.bx, curry - mouse.by);
  }
  var xre = region.startx + (currx * lp1);
  var yim = region.starty - (curry * lp2);
  statsreportpos(xre, yim);
}

function onmouseup(e) {
  if (mouse.down && e.button == 0 && !e.ctrlKey) {
    var mousepos = getmousepos(canvas, e);
    var currx = Math.round(mousepos.x);
    var curry = Math.round(mousepos.y);

    curry = mouse.by + (booltoint(curry > mouse.by) * 2 - 1) * Math.round(surfaceheight * Math.abs(currx - mouse.bx) / surfacewidth);

    // if it is a box drawn
    if ((Math.abs(currx - mouse.bx) > 3) && (Math.abs(curry - mouse.by) > 3)) {

      region.extx = (region.startx + (currx * lp1)) - (region.startx + (mouse.bx * lp1));
      region.exty = (region.starty - (mouse.by * lp2)) - (region.starty - (curry * lp2)) ;
      region.startx += mouse.bx * lp1;
      region.starty -= mouse.by * lp2;
    }
    // else it is a click: julia switch
    else {
      fractal.julia = !fractal.julia;

      if (fractal.julia) {
        save.region = region;
        save.re = fractal.re;
        save.im = fractal.im;
        setJulia(region.startx + (currx * lp1), region.starty - (curry * lp2));
        setRegion(-2, 1.5, 4, 3); // why? is it worth jumping around to see the full set?
      }
      else {
        // where were these saved?
        resetRegion(save.region);
        fractal.re = save.re;
        fractal.im = save.im;
      }
    }
    draw();
  }
  else if (mouse.down && e.button == 0 && e.ctrlKey) {
    var mousepos = getmousepos(canvas, e);
    var currx = Math.round(mousepos.x);
    var curry = Math.round(mousepos.y);

    curry = mouse.by + (booltoint(curry > mouse.by) * 2 - 1) * Math.round(surfaceheight * Math.abs(currx - mouse.bx) / surfacewidth);

    if ((Math.abs(currx - mouse.bx) > 3) && (Math.abs(curry - mouse.by) > 3)) {

      var visszx = oszt(surfacewidth, (currx - mouse.bx));
      var visszy = oszt(surfaceheight, (curry - mouse.by));
      region.extx = ((region.startx + region.extx) + ((surfacewidth - currx) * lp1 * visszx)) - (region.startx - (mouse.bx * lp1 * visszx));
      region.exty = (region.starty + (mouse.by * lp2 * visszy)) - ((region.starty - region.exty) - ((surfaceheight - curry) * lp2 * visszy));
      region.startx -= mouse.bx * lp1 * visszx;
      region.starty += mouse.by * lp2 * visszy;
      draw();
    }
  }
  else if (mouse.down && e.button == 2) {
    var mousepos = getmousepos(canvas, e);
    var currx = Math.round(mousepos.x);
    var curry = Math.round(mousepos.y);

    if ((Math.abs(currx - mouse.bx) > 3) || (Math.abs(curry - mouse.by) > 3)) {
      region.startx = region.startx + ((mouse.bx-currx)*lp1);
      region.starty = region.starty - ((mouse.by-curry)*lp2);

      draw();
    }
  }
  mouse.down = false;
}


// these two make zoom happen on two-finger / scroll which can be inconvenient
function wheel(event){
//  var delta = 0;
//  if (!event) event = window.event;
//  if (event.wheelDelta) {
//    delta = event.wheelDelta/120;
//  }
//  else if (event.detail) {
//    delta = -event.detail/3;
//  }
//  if (delta)
//    wheelhandle(delta);
//  if (event.save.entDefault)
//    event.save.entDefault();
//  event.returnValue = false;
}


function wheelhandle(delta) {
//  if (delta < 0) {
//    var visszx = oszt(surfacewidth, (surfacewidth - 8));
//    var visszy = oszt(surfaceheight, (surfaceheight - (8 * surfaceheight / surfacewidth)));
//  }
//  else {
//    var visszx = -1;
//    var visszy = -1;
//  }
//  region.extx += 8 * lp1 * visszx;
//  region.exty += (8 * surfaceheight / surfacewidth) * lp2 *  visszy;
//  region.startx -= 4 * lp1 * visszx;
//  region.starty += (4 * surfaceheight / surfacewidth) * lp2 * visszy;
//  if (mthread.checked) {
//    clearTimeout(timeout);
//    timeout = setTimeout("draw()",250);
//  }
//  else draw();
}

function zoomin() {
  var visszx = -1;
  var visszy = -1;
  zoom(visszx, visszy);
}

function zoomout() {
  var visszx = oszt(surfacewidth, (surfacewidth - 8));
  var visszy = oszt(surfaceheight, (surfaceheight - (8 * surfaceheight / surfacewidth)));
  zoom(visszx, visszy);
}

function zoom(visszx, visszy) {
  region.extx += 8 * lp1 * visszx;
  region.exty += (8 * surfaceheight / surfacewidth) * lp2 *  visszy;
  region.startx -= 4 * lp1 * visszx;
  region.starty += (4 * surfaceheight / surfacewidth) * lp2 * visszy;
  if (mthread.checked) {
    clearTimeout(timeout);
    timeout = setTimeout("draw()",250);
  }
  else draw();
}
//touch - same as mouse?

function ontouchstart(e) {
  e.save.entDefault();
  var touch = e.targetTouches[0];
  mouse.down = true;

  // shared with onmousedown
  var mousepos = getmousepos(canvas, touch);
  mouse.bx = Math.round(mousepos.x);
  mouse.by = Math.round(mousepos.y);
  backimg = ct2d.getImageData(0, 0, surfacewidth, surfaceheight);
}

function ontouchmove(e) {
  e.save.entDefault();
  var touch = e.targetTouches[0];

  var mousepos = getmousepos(canvas, touch);
  var currx = Math.round(mousepos.x);
  var curry = Math.round(mousepos.y);

  if (mouse.down) {
    curry = mouse.by + (booltoint(curry > mouse.by) * 2 - 1) * Math.round(surfaceheight * Math.abs(currx - mouse.bx) / surfacewidth);
    ct2d.putImageData(backimg, 0, 0);
    ct2d.strokeStyle = "rgb(255,255,255)";
    ct2d.strokeRect(mouse.bx, mouse.by, currx - mouse.bx, curry - mouse.by);
  }
  var xre = region.startx + (currx * lp1);
  var yim = region.starty - (curry * lp2);
  statsreportpos(xre,yim);
}

function ontouchend(e) {
  e.save.entDefault();
  var touch = e.changedTouches[0];
  if (mouse.down) {
    var mousepos = getmousepos(canvas, touch);
    var currx = Math.round(mousepos.x);
    var curry = Math.round(mousepos.y);

    curry = mouse.by + (booltoint(curry > mouse.by) * 2 - 1) * Math.round(surfaceheight * Math.abs(currx - mouse.bx) / surfacewidth);

    // if it is a drawn box
    if ((Math.abs(currx - mouse.bx) > 3) && (Math.abs(curry - mouse.by) > 3)) {
      region.extx = (region.startx + (currx * lp1)) - (region.startx + (mouse.bx * lp1));
      region.exty = (region.starty - (mouse.by * lp2)) - (region.starty - (curry * lp2)) ;
      region.startx += mouse.bx * lp1;
      region.starty -= mouse.by * lp2;
    }
    else { // else it is a click: julia switch
      fractal.julia = !fractal.julia;
      if (julia) {
        save.region = region;
        save.re = fractal.re;
        save.im = fractal.im;
        fractal.re = region.startx + (currx * lp1);
        fractal.im = region.starty - (curry * lp2);
        setRegion(-2,1.5,4,4);
      }
      else {
        resetRegion(save.region);
        fractal.re = save.re;
        fractal.im = save.im;
      }
    }
    draw();
  }
  mouse.down = false;
}


function radiovalue() {
  var radios = document.getElementsByTagName('input');
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].type === 'radio' && radios[i].checked) {
      return parseInt(radios[i].value);
    }
  }
}


function initialize(canvasElement, w, h) {
  mthread = document.getElementById("mthread");
  if (!window.Worker) {
    mthread.checked = false;
    mthread.disabled = true;
  }
  else {
    mthread.checked = true;
    for (var i = 0; i < maxthreads; i++) {
      var worker = new Worker("worker.js");
      worker.onmessage = function(e) { msghandler(e.target, e.data) }
      worker.idle = true;
      workers.push(worker);
    }
  }
  surfacewidth = w;
  surfaceheight = h;
  canvas = document.getElementById(canvasElement);

  if (canvas.addEventListener)
    canvas.addEventListener('DOMMouseScroll', wheel, false);
  canvas.onmousewheel = wheel;

  ct2d = canvas.getContext("2d");
  canvas.width = w;
  canvas.height = h;

  canvas.onmousedown = onmousedown;
  canvas.onmousemove = onmousemove;
  canvas.onmouseup = onmouseup;

  canvas.addEventListener('touchstart', ontouchstart);
  canvas.addEventListener('touchmove', ontouchmove);
  canvas.addEventListener('touchend', ontouchend);
}

function oszt(x, y) {
  if (y == 0) return 0;
  else return x / y;
}

function booltoint(b) {
  return b ? 1 : 0;
}

function pngconvert(canvasElement) {
  var canvas = document.getElementById(canvasElement);
  var url = canvas.toDataURL("image/png");
  var newwin = window.open();
  newwin.document.open();
  newwin.document.write('<html><head><title>Canvas image<\/title><\/head><body style="margin: 0"><img id="cnvimg"><\/body><\/html>');
  newwin.document.close();
  var cnvimg = newwin.document.getElementById("cnvimg");
  cnvimg.src = url;
}

function load(w, h) {
  w = window.innerWidth;
  h = window.innerWidth * 3/4;
  initialize("header", w, h);
  resetvalues(4);
  draw();
}

// On resize of browser window, resize the canvas and redraw
window.onresize = function() {
  w = window.innerWidth;
  h = window.innerWidth * 3/4;
  initialize("header", w, h);
  draw();
}

function paramschange() {
  maxiter = parseInt(document.getElementById("iteration").value);
  escapevalue = parseFloat(document.getElementById("escape").value);
  gred = parseInt(document.getElementById("sliderred").value);
  ggreen = parseInt(document.getElementById("slidergreen").value);
  gblue = parseInt(document.getElementById("sliderblue").value);
  range = document.getElementById("p100").checked ? 0.01 : 1;
  palette = radiovalue();
  draw();
}
</script>

<body onload="load(800,600)" style="margin:0px">
  <div id="params">
  <p style="margin:2px; margin-bottom: 8px">
    Click and drag to explore.<br>
    <a href="javascript:zoomin();">Zoom +</a> &#47;
    <a href="javascript:zoomout();">zoom -</a>
  </p>
  <p style="margin:2px; clear:both;">
    Max.Iteration: <input name="iteration" id="iteration" type="text" size="5" maxlength="5" value="150" style="float: right;">
  </p>
  <p style="margin:2px; clear:both;">
    Escape value: <input name="escape" id="escape" type="text" value="4" size="5" maxlength="7" style="float: right;">
  </p>
  <p style="margin:2px; margin-bottom:8px; clear:both;">
    Multithreading: <input name="mthread" id="mthread" type="checkbox" value="0" style="float: right;">
  </p>

  <fieldset style="padding:4px"><legend>Coloring</legend>
  <input id="proc" name="radiobutton" type="radio" value="0" checked="checked">
  Procedural<br>
  Red: &nbsp;&nbsp;
  <input name="sliderred" id="sliderred" type="Text" size="3" maxlength="3" onChange="sliders[0].setValue(this.value)">
  <script  type="text/javascript" language="JavaScript">
  var presets = {
  'controlWidth': 152,
  'controlHeight': 16,
  'sliderWidth': 19,
  'sliderHeight': 16,
  'pathLeft' : 0,
  'pathTop' : 0,
  'pathLength' : 132,
  'imgSlider': 'img/slider.gif',
  'zIndex': 1
  }
  var redInitVals = {
  'name': 'sliderred',
  'minValue' : 0,
  'maxValue' : 255,
  'value' : 8,
  'step' : 1
  }
  var greenInitVals = {
  'name': 'slidergreen',
  'minValue' : 0,
  'maxValue' : 255,
  'value' : 16,
  'step' : 1
  }
  var blueInitVals = {
  'name': 'sliderblue',
  'minValue' : 0,
  'maxValue' : 255,
  'value' : 24,
  'step' : 1
  }
  new slider(redInitVals, presets);
  </script>

  Green: <input name="slidergreen" id="slidergreen" type="Text" size="3" maxlength="3" onChange="sliders[1].setValue(this.value)">
  <script  type="text/javascript" language="JavaScript">
  new slider(greenInitVals, presets);
  </script>
  Blue: &nbsp;&nbsp;
  <input name="sliderblue" id="sliderblue" type="Text" size="3" maxlength="3" onChange="sliders[2].setValue(this.value)">
  <script  type="text/javascript" language="JavaScript">
  new slider(blueInitVals, presets);
  </script>
  /100
  <input  name="p100" id="p100" type="checkbox">
  <p></p>
  <input id="vga" name="radiobutton" type="radio" value="1"> VGA
  <input id="bw" name="radiobutton" type="radio" value="2"> B&amp;W
  <input id="sepia" name="radiobutton" type="radio" value="3"> Sepia
  </fieldset>
  <p style="margin:5px">
  <input type="button" name="ok" value="Redraw!" onClick="paramschange();">
  </p>
  <ul class="presets">
  <li>Presets
  <ul>
  <li><a href="javascript:resetvalues(0); draw();">Mandel Procedural</a></li>
  <li><a href="javascript:resetvalues(2); draw();">Mandel Grey Spiral</a></li>
  <li><a href="javascript:resetvalues(1); draw();">Mandel Lightning</a></li>
  <li><a href="javascript:resetvalues(3); draw();">Mandel Tiles</a></li>
  <li><a href="javascript:resetvalues(4); draw();">Mandel Oilspill</a></li>
  <li><a href="javascript:resetvalues(5); draw();">Julia Sepia</a></li>
  </ul>
  </li>
  <li><a href="javascript:pngconvert('header');">PNG Output</a></li>
  </ul>

  </div>

<!-- TO HERE -->

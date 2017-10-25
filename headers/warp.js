<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r61/three.min.js"></script>

<script id="vertexShader" type="x-shader/x-vertex">
  uniform float time;
  uniform vec2 resolution;
  void main()  {
    gl_Position = vec4( position, 1.0 );
  }
</script>

<script id="fragmentShader" type="x-shader/x-fragment">
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;

  float PI = 3.1415;

  highp float HueToRGB(highp float f1, highp float f2, highp float hue){
  
      highp float res;
      if((6.0 * hue) < 1.0){
          res = f1 + (f2 - f1) * 6.0 * hue;
      }
      else if((2.0*hue)<1.0){
          res = f2;
      }
      else if((3.0*hue)<2.0){
          res = f1 + (f2-f1) * ((2.0/3.0) - hue) * 6.0;
      }
      else{
          res = f1;
      }
  
      return res;
  }

  highp vec3 HSLToRGB(highp vec3 hsl){
      highp vec3 rgb;
  
      if(hsl.y == 0.0){
          rgb = vec3(hsl.z);
      }
      else{
          highp float f2;
  
          if(hsl.z<0.5){
              f2 = hsl.z * (1.0 + hsl.y);
          }
          else{
              f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);
          }
  
          highp float f1 = 2.0 * hsl.z - f2;
  
          rgb.r = HueToRGB(f1,f2, hsl.x + (1.0/3.0));
          rgb.g = HueToRGB(f1,f2, hsl.x);
          rgb.b = HueToRGB(f1,f2, hsl.x - (1.0/3.0));        
      }
  
      return rgb;
  }

  vec4 gray_red(float rgb) {
    highp vec3 hsl = vec3(mouse.y/resolution.y, 1.0, 1.0);
    highp vec3 myrgb = HSLToRGB(hsl);
    return vec4(rgb*mouse.y/resolution.y, rgb*mouse.x/resolution.x, rgb, 1.0);
  }

  vec4 color(float rgb) {
    return vec4(1.0-rgb, cos(rgb/8.0), rgb, 1.0);
  }

  vec4 time_color(float rgb, float time) {
    return vec4(1.0, 1.0, sin(2.0*PI*time)*rgb, 1.0);
  }

  float square(float x) {
    return x*x;
  }

  // fuse and roll
  void xy_sine_time() {
    vec2 c = gl_FragCoord.xy / resolution.x;// * 2.0); for retina screen
    float time = 0.002 * time * mouse.x/resolution.x;
    float rgb = 0.5 + sin(time*0.02)/2.0 
                    + sin(2.0*PI*20.0*sqrt((square(sin(time)-c.x) + square(c.y))))
                    + sin(2.0*PI*20.0*sqrt((square(c.x) + square(sin(time)-c.y))));
    gl_FragColor = gray_red(rgb);
  }

  void main()  {
    xy_sine_time();
  }
</script>

<script>
  var container;
  var camera, scene, renderer;
  var uniforms, material, mesh;
  var mouseX = 0, mouseY = 0,
  lat = 0, lon = 0, phy = 0, theta = 0;
  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;
  var startTime = Date.now();
  $(document).ready(() => {
    initGL();
    animate();
  });
  function initGL() {
    container = document.getElementById( 'container' );
    window.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    camera = new THREE.Camera();
    camera.position.z = 1;
    scene = new THREE.Scene();
    uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      mouse: { type: "v2", value: new THREE.Vector2() }
    };
    material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    });
    mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), material );
    scene.add( mesh );
    renderer = new THREE.WebGLRenderer();
    container.appendChild( renderer.domElement );
    canvas = renderer.domElement;
    setSize()
  }
  function setSize() {
    var width = window.innerWidth;
    container = document.getElementById( 'container' );
    var height = container.getBoundingClientRect().height;
    uniforms.resolution.value.x = width;
    uniforms.resolution.value.y = height;
    renderer.setSize( width, height );
  }
  function animate() {
    requestAnimationFrame( animate );
    render();
  }
  function render() {
    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.;
    uniforms.time.value = 60. * elapsedSeconds;
    uniforms.mouse.value.x = mouseX;
    uniforms.mouse.value.y = mouseY;
    renderer.render( scene, camera );
  }
  $(window).resize(function(){
    setSize();
  });
</script>
<body>
<meta name="viewport" content="width=800">
<div id="container" style="width:100%; height:200px;" border="2px black"></div>

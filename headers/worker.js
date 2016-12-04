function iter(a,b,x,y,ba,mi) {
  var n = 0;
  var x2 = x*x;
  var y2 = y*y;

  do {
    y = 2*x*y + b;                
    x = x2 - y2 + a;
    x2 = x*x;
    y2 = y*y;
    n++;
  }
  while (x2+y2 < ba && n < mi);
  return n;
}


self.onmessage = function (event) {
  var data = event.data;
  var a = data.a;
  var b = data.b;
  var re = data.re;
  var im = data.im;
  var lp1 = data.lp1;
  var maxiter = data.maxiter;
  var escapevalue = data.escapevalue;
  var surfacewidth =  data.surfacewidth;
  var julia = data.julia;
  data.values = [];
    
  for (var j = 0; j < surfacewidth; j++) {
    a = a+lp1;
    if (!julia)
      n = iter(a,b,re,im,escapevalue,maxiter);
    else
      n = iter(re,im,a,b,escapevalue,maxiter);
    data.values.push(n);
  }
     
  self.postMessage(data);
}


var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt')
};

var server = https.createServer(options, function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    console.log('POSTed: ' + body);
    // TODO contact github
    // we are on another port so we need to accept port 80's request
    res.setHeader('Access-Control-Allow-Origin', 'https://linse.me');
    res.end("Thank you");
  });
})

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");

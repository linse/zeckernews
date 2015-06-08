var https = require('https');
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;

var options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key','utf8'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt','utf8'),
  token: fs.readFileSync('/etc/zeckernews/token','utf8').trim(),
  port: 8888,
  local_repo: '/home/linse/zeckernews'
};

var server = https.createServer(options, function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // build and post gist from POSTed form message
    //console.log(body);
    rebuildZeckernews(puts);
    res.end("Send me moar pull requests!");
  });
})

// Listen on given port, IP defaults to 127.0.0.1
server.listen(options.port);

// Put a friendly message on the terminal
console.log("Comment server running at http://127.0.0.1:"+options.port+"/");
console.log("🎂");
var counter = 0;

function puts(error, stdout, stderr) { sys.puts(stdout) }
function devnull(error, stdout, stderr) { }

// TODO get rid of all the exec
// TODO what to actually append
// TODO rebuild!
function rebuildZeckernews(callback) {
  exec("cd "+options.local_repo
  +" && make generate", callback);
}

function deserializeForm(string) {
  var parts = string.split("&");
  if (parts.length != 3) {
    return; //throw "need request with filename, username, message from form!";
  }
  // throw away part before =, replace pluses which encode space
  parts = parts.map( function (p) {
    return p.split("=")[1]
  } );
  // decode as last step - so we don't remove pluses from form input
  return { 'file': parts[0],
           'name': decodeURIComponent(parts[1].replace(/\+/g," ")),
        'message': decodeURIComponent(parts[2].replace(/\+/g," ")) };
}

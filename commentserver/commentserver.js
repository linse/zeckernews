var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt'),
  token: fs.readFileSync('/etc/zeckernews/token'),
  port: 8000,
};

var server = https.createServer(options, function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // build and post gist from POSTed form message
    composeAndPostGist(body,counter++);
    res.end("Thank you");
  });
})

// Listen on given port, IP defaults to 127.0.0.1
server.listen(options.port);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:"+options.port+"/");
console.log("🎂");
var counter = 0;

function composeAndPostGist(content, counter) {
  patchGist('{"description":"🐞zeckernews","public":"true","files":{"Comment'
    +counter+'.txt":{"content":"'+deserializeMessage(content)+'"}}');
}

// this can be used to update the overall last comment
function patchGist(content) {
  sendGithubRequest('PATCH', '/gists/90095144cc601cf2030b', content);
}

function postGist(content) {
  sendGithubRequest('POST', '/gists', content);
}

function sendGithubRequest(method, path, content) {
  var post_req = https.request({
    method: method,
    hostname: 'api.github.com',
    path: path,
    headers: { 'Authorization': 'token '+options.token,
               'User-Agent': 'zeckernews' },
  },function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        //console.log('Response: ' + chunk);
    });
    // TODO signal when we are done - return gist id?
  });
   
  // post the data
  post_req.write(content);
  post_req.end();
}

// so far we just have one parameter: message=somemessage+with+pluses
function deserializeMessage(string) {
  var parts = string.split("=");
  var message = parts[1].replace(/\+/g," ");
  // decode as last step - don't remove pluses from form input
  return decodeURIComponent(message);
}

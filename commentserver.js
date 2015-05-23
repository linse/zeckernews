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
    // build and post gist from POSTed form message
    composeAndPostGist(decodeURI(body),counter++);
    res.end("Thank you");
  });
})

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
console.log("🎂");
var counter = 0;

function composeAndPostGist(content, counter) {
  patchGist('{"description":"🐞zeckernews","public":"true","files":{"Comment'+counter+'.txt":{"content":"'+content+'"}}');
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
    headers: { 'Authorization': 'token d433ba8b52b9a5cf75c194f7a9646c474a400ba7',
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

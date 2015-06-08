var https = require('https');
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;

var options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key','utf8'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt','utf8'),
  token: fs.readFileSync('/etc/zeckernews/token','utf8').trim(),
  port: 8000,
  local_repo: '/home/linse/zeckernews'
};

var server = https.createServer(options, function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // build and post gist from POSTed form message
    var formData = deserializeForm(body);
    composeAndPostPR(formData);
    res.end("Send me moar comments!");
  });
})

// Listen on given port, IP defaults to 127.0.0.1
server.listen(options.port);

// Put a friendly message on the terminal
console.log("Comment server running at http://127.0.0.1:"+options.port+"/");
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

function composeAndPostPR(formData) {
  if (!formData) { return; }
  formData.name = formData.name || "anonymous";
  console.log(formData);
  composePR(formData, function (error, stdout, stderr) { postPR(formData); }); 
}

function puts(error, stdout, stderr) { sys.puts(stdout) }
function devnull(error, stdout, stderr) { }

// TODO get rid of all the exec
// TODO what to actually append
// TODO rebuild!
function composePR(formData, callback) {
  exec("cd "+options.local_repo
  +" && git checkout -b "+formData.name // TODO what if branch exists
  +" && echo \""+formData.name+" posted a message "+formData.message
  +"\" >> "+options.local_repo+"/content/"+formData.file.replace("html","md") // TODO optionize
  +" && git commit -m "+formData.message+" content"
  +" && git push https://"+options.token+"@github.com/linse/zeckernews.git "+formData.name
  +" ; git checkout master", callback);
}

function postPR(formData) {
  var data = '{"title":"Comment PR: '+formData.message+'","body":"from the form","head":"'+formData.name+'","base":"master"}';
  console.log(data);
  sendGithubRequest('POST', '/repos/linse/zeckernews/pulls', data);
}

function getBranches() {
  sendGithubRequest('GET','/repos/linse/zeckernews/git/refs/heads','');
}

function pushBranch(branchname,sha) {
  var data = '{"ref":"/refs/heads/'+branchname+'","sha":"'+sha+'"}';
  sendGithubRequest('GET','/repos/linse/zeckernews/git/refs',data);
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

function deserializeForm(string) {
  var parts = string.split("&");
  if (parts.length != 3) {
    console.log("need request with filename, username, message from form!");
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

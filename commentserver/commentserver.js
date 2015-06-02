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

// TODO get rid of all the exec we can
function composeAndPostPR(formData) {
  formData.name = formData.name || "anonymous";
  console.log(formData);
  // new branch - TODO what if it exists?
  exec("cd "+options.local_repo+" && git checkout -b "+formData.name, puts); 
  // add comment
  exec("echo \""+formData.name+" posted a message "+formData.message
     +"\\n\" >> "+options.local_repo+"/content/"+formData.file.replace("html","md"), puts); // TODO optionize
  exec("cd "+options.local_repo+" && git commit -m "+formData.message+" content", puts); // TODO optionize, record this hash!
  exec("cd "+options.local_repo+" && git push https://"+options.token+"@github.com/linse/zeckernews.git "+formData.name, puts);
  exec("cd "+options.local_repo+" && git checkout master", puts); 
  var data = '{"title":"New comment PR","body":"from ","head":"'+formData.name+'","base":"master"}';
  sendGithubRequest('POST', '/repos/linse/zeckernews/pulls', data);
}

function puts(error, stdout, stderr) { sys.puts(stdout) }
function devnull(error, stdout, stderr) { }

// TODO branch with users name
// TODO what happens if branch already exists? (middle statment fail) - generate branchnames with increasing number or nonce?
function newBranch(name) {
  exec("cd "+options.local_repo+" && git checkout -b "+name, puts); 
  // needs auth exec("git push origin "+name, puts);
}

function appendTo(comment, filename) {
  exec("cat "+comment+" >> "+options.local_repo+"/"+filename, puts);
}

function commit() {
  exec("cd "+options.local_repo+" && git commit -a -m new comment", puts); 
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
    throw "need request with filename, username, message from form!";
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

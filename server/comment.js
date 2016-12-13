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



function composeAndPostPR(formData) {
  composePR(formData, function (error, stdout, stderr) { postPR(formData); }); 
}

function execLocal(cmd, callback) {
  exec("cd "+options.local_repo+" && "+cmd, callback);
}

function puts(error, stdout, stderr) { console.log(stdout) }

function composePR(formData, callback) {
  // git branch
  execLocal("git checkout -b "+formData.nonce, puts);
  // change source file - three newlines for patch trickery on PR step later
//  execLocal(" && echo \"\n\n\n____\n\n**"+formData.name+"** posted a message:\n\n> "+formData.message,
//  +"\n\n\" >> "+options.local_repo+"/content/"+formData.file+"/comment"+formData.nonce+".md" // TODO optionize
//  +" && git add "+options.local_repo+"/content/"+formData.file+"/comment"+formData.nonce+".md" // TODO optionize
//  // git commit
//  +" && git commit -m \""+formData.name+": "+formData.message+"\" content"
//  // git push - fails if the branch already exists - -f works but is dangerous thats why we use a nonce 
//  +" && git push https://"+options.token+"@github.com/linse/zeckernews.git "+formData.nonce
//  +" ; git checkout master", callback);
}

function postPR(formData) {
  var data = '{"title":"Comment PR from '+formData.name+'","body":"from the form","head":"'+formData.nonce+'","base":"master"}';
  console.log("postPR");
  console.log(data);
  sendGithubRequest('POST', '/repos/linse/zeckernews/pulls', data);
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
        // console.log('Response: ' + chunk);
    });
    // TODO signal when we are done
  });
   
  // post the data
  post_req.write(content);
  post_req.end();
}

function nonce(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function deserializeForm(string) {
  var parts = string.split("&");
  if (parts.length != 3) {
    console.log("need request with filename, username, message from form!");
    return;
  }
  // throw away part before =, replace pluses which encode space
  parts = parts.map( function (p) {
    return p.split("=")[1]
  } );
  // decode as last step - so we don't remove pluses from form input
  return { 'nonce': nonce(16),
            'file': parts[0].replace(/.html/g,""),
            'name': decodeURIComponent(parts[1].replace(/\+/g," ")),
         'message': decodeURIComponent(parts[2].replace(/\+/g," ")) };
}

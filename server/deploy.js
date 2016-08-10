var https = require('https');
var fs = require('fs');
var sys = require('sys');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

var options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key','utf8'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt','utf8'),
  token: fs.readFileSync('/etc/zeckernews/token','utf8').trim(),
  port: 8888,
  local_repo: '/home/linse/zeckernews'
};

// helpers to execute local commands, async and sync
function execLocal(cmd, callback) {
  exec("cd "+options.local_repo +" && "+cmd, callback); 
}

function execLocalSync(cmd) {
  return execSync("cd "+options.local_repo +" && "+cmd).toString().trim(); 
}

function puts(error, stdout, stderr) { console.log(stdout) }

var server = https.createServer(options, function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // webhook is called
    pullReq = JSON.parse(body);
    if (pullReq.action == 'closed') {
        pull();
        removeBranch(pullReq.pull_request.head.ref);
        // when pr was closed by merge
        if (pullReq.pull_request.merged_at != null) {
            rebuildZeckernews(puts);
        }
    }
    res.end("Send me moar pull requests!");
  });
})

// Listen on given port, IP defaults to 127.0.0.1
server.listen(options.port);

// Put a friendly message on the terminal
console.log("Deploy server running at http://127.0.0.1:"+options.port+"/");
console.log("🎂");
var counter = 0;


function pull() {
  execLocalSync("git checkout -q master && git pull"); 
}

function rebuildZeckernews(callback) {
  execLocal("make generate", callback);
}

// remove the branch we just closed or merged
function removeBranch(ref) {
  console.log("PR closed, removing local branch "+ref);
  execLocalSync("git branch -D "+ref
           +" && git remote prune origin");
}

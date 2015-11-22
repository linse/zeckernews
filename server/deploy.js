var https = require('https');
var fs = require('fs');
var sys = require('sys');
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
    // webhook is called
    pullReq = JSON.parse(body);
    // rebuild when pr was closed by merge
    if (pullReq.action == 'closed'
     && pullReq.pull_request.merged_at != null) {
        // gucke alle PR die nach mir kommen an, und schreibe ihre patches so um, dass sie hierunter gehanggt werden koennen
        // OODER stashe sie lokal und habe immer nur einen pull request offen
        removeBranch(puts);
        rebaseOpenPRs(puts);
        rebuildZeckernews(puts);
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

function puts(error, stdout, stderr) { sys.puts(stdout) }

// TODO get rid of all the exec
function rebuildZeckernews(callback) {
  exec("cd "+options.local_repo
  +" && git checkout master && git pull && make generate", callback);
}

function rebaseOpenPRs(callback) {
  // git format-patch origin/master makes patches from all commits on current branch that are not yet in origin/master
  // problem: we are in different branches!
}

function removeBranch(callback) {
  // remove all merged branches that are not master
  exec("cd "+options.local_repo
  +" && git pull && git branch --merged | grep -v 'master' | xargs -n 1 git branch -d", callback);
}

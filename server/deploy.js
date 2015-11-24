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
        pull(puts);
        removeBranch(puts);
        rebaseOpenPRs(pullReq, puts);
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
  exec("cd "+options.local_repo +" && make generate", callback);
}

function rebaseOpenPRs(pullReq, callback) {
  // git format-patch origin/master makes patches from all commits on current branch that are not yet in origin/master
  // problem: we are in different branches!
  // situation: vorheriger kommentar gemerged
  // welches file geaendert? wie viel zeilen?
  var sha = pullReq.pull_request.head.sha;
  var modifiles = execSync("cd "+options.local_repo 
      +" && git diff-tree --no-commit-id --name-only -r "+sha).toString().trim();

  // wieviele files wurden geaendert? hoffentlich nur eins!
  var atatline = execSync("cd "+options.local_repo 
      +" && git show "+sha+" | grep ^@@").toString().trim();
  console.log(modifiles);
  console.log(atatline);


  var elems = atatline.split(" ");
  // @@ line has: @@ <space> parent file offset,length <space> head offset,length .. blabla
  var par = elems[1].split(",")[1];
  var head = elems[2].split(",")[1];
  var commentLength = parseInt(head) - parseInt(par);
  console.log(commentLength);
  

  // forall branches
  
  //   wenn der branch das geandertee file betrifft, mach den patch, sonst nur rebase
  //   git show > patch
  //   git reset --hard HEAD~1
  //   git rebase master
  //   // patch the patch
  //   aendere die zeilennummer in dem @@ (hochzaehlen um hinzugekommene zeilen)

  //   git am < patch
  //    
}

function pull(callback) {
  execSync("cd "+options.local_repo +" && git checkout master && git pull", callback); 
}

function removeBranch(callback) {
  // remove all merged branches that are not master
  console.log("bin da");
  execSync("cd "+options.local_repo
  +" && git branch --merged | grep -v 'master' | xargs -n 1 git branch -d", callback);
}

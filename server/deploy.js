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
    if (pullReq.action == 'closed') {
        pull();
        removeBranch(pullReq.pull_request.head.ref);
        // rebase & rebuild when pr was closed by merge
        if (pullReq.pull_request.merged_at != null) {
            // look at all pr's below this, and rewrite their patches so they match the merged new text
            rebaseOpenPRs(pullReq, puts);
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

function puts(error, stdout, stderr) { sys.puts(stdout) }

function execLocal(cmd) {
  execSync("cd "+options.local_repo +" && "+cmd); 
}

function pull() {
  execSync("cd "+options.local_repo +" && git checkout -q master && git pull"); 
}

// TODO get rid of all the exec
function rebuildZeckernews(callback) {
  exec("cd "+options.local_repo +" && make generate", callback);
}

function rebaseOpenPRs(pullReq, callback) {
  // situation: a previous comment was merged. 
  // We have to rebase on the updated master.
  // What file was changed? How many lines?
  var sha = pullReq.pull_request.head.sha;
  var modifile = execSync("cd "+options.local_repo 
      +" && git diff-tree --no-commit-id --name-only -r "+sha).toString().trim();
  console.log(modifile);
  // Assert that just one file was modified, and not more.
  var match = /\r|\n/.exec(modifile);
  if (match) { // we have a newline
    console.log("Error: more than one modified file from PR! This is not a single comment!");
    return;
  }

  // git format-patch origin/master makes patches from all commits on current branch that are not yet in origin/master
  // problem: we are in different branches!
  var atatline = execSync("cd "+options.local_repo 
      +" && git show "+sha+" | grep ^@@").toString().trim();
  //console.log(atatline);
  var elems = atatline.split(" ");
  // @@ line has: @@ <space> parent file offset,length <space> head offset,length .. blabla
  var par = elems[1].split(",")[1];
  var head = elems[2].split(",")[1];
  var commentLength = parseInt(head) - parseInt(par);
  //console.log(commentLength);
  
  // forall branches
  var allBranches = execSync("cd "+options.local_repo+" && git branch | grep -v master").toString().trim();
  var branchesWithFile = execSync("cd "+options.local_repo+' && git for-each-ref --format="%(refname:short)" refs/heads | grep -v master | while read br; do git cherry master $br | while read x h; do if [ "`git log -n 1 --format=%H $h -- '+modifile+'`" = "$h" ]; then echo $br; fi; done; done | sort -u').toString().trim();
  // gucken ob mein branch auch weg ist? sollte ja da gemerged
  var branches = allBranches.split("\n");
  console.log("all branches"+allBranches);
  console.log("with file"+branchesWithFile);
  branches.forEach(function (branch) { 
    console.log("For "+branch);
  });
  //   wenn der branch das geandertee file betrifft, mach den patch, sonst nur rebase
  
  // branches that have the file
  //git for-each-ref --format="%(refname:short)" refs/heads | grep -v master | while read br; do git cherry master $br | while read x h; do if [ "`git log -n 1 --format=%H $h -- content/2015-*.md`" = "$h" ]; then echo $br; fi; done; done | sort -u
  //   git show > patch
  //   git reset --hard HEAD~1
  //   git rebase master
  //   // patch the patch
  //   aendere die zeilennummer in dem @@ (hochzaehlen um hinzugekommene zeilen)

  //   git am < patch
  //    
}

// remove the branch we just closed or merged
function removeBranch(ref) {
  console.log("remove merged branch "+ref);
  execSync("cd "+options.local_repo
      +" && git branch -D "+ref
      +" && git remote prune origin");
}

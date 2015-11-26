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
            rebaseOpenPRs(pullReq);
            rebuildZeckernews(puts);
        }
    }
    res.end("Send me moar pull requests!");
  });
})

// Listen on given port, IP defaults to 127.0.0.1
//server.listen(options.port);

// Put a friendly message on the terminal
console.log("Deploy server running at http://127.0.0.1:"+options.port+"/");
console.log("🎂");
var counter = 0;

// helpers to execute local commands, async and sync
function execLocal(cmd, callback) {
  exec("cd "+options.local_repo +" && "+cmd, callback); 
}

function execLocalSync(cmd) {
  return execSync("cd "+options.local_repo +" && "+cmd).toString().trim(); 
}

function puts(error, stdout, stderr) { console.log(stdout) }


function pull() {
  execLocalSync("git checkout -q master && git pull"); 
}

function rebuildZeckernews(callback) {
  execLocal("make generate", callback);
}

// What file was changed? How many lines?
function modifiedFile(sha) {
  var modifile = execLocalSync("git diff-tree --no-commit-id --name-only -r "+sha);
  // assert that just one file was modified
  var matchNewline = /\r|\n/.exec(modifile);
  if (matchNewline) {
    console.log("Error: more than one modified file from PR! This is not a single comment!");
    process.exit(1); // BOOOM!
  }
  return modifile;
}

// TODO we have to do this again for patching.. how about we record the patch, 
// find the line and replace it?
function commentLength(sha) {
  var atatline = execLocalSync("git show "+sha+" | grep ^@@").toString().trim();
  //console.log(atatline);
  var elems = atatline.split(" ");
  // @@ line has: @@ <space> parent file offset,length <space> head offset,length .. blabla
  var par = elems[1].split(",")[1];
  var head = elems[2].split(",")[1];
  return parseInt(head) - parseInt(par);
}

function getBranches(file) {
  var allBranches = execLocalSync("git branch | grep -v master");
  var branchesWithFile = execLocalSync('git for-each-ref --format="%(refname:short)" refs/heads | grep -v master '
      +'| while read br; do git cherry master $br '
      +'| while read x h; do if [ "`git log -n 1 --format=%H $h -- '+file+'`" = "$h" ]; then echo $br; fi; done; done | sort -u');
  return { all: allBranches.split("\n"), 
           withFile: branchesWithFile.split("\n") };
}

// TODO double check that it's just one hunk
function getPatch(branch) {
  return execLocalSync("git show "+branch);
}

function updateIfAtAtLine(c, i, a) {
  // TODO uebergebe die laenge, do something!
  return c;
}

function updatePatch(patch) {
  // do this line by line
  return patch.split('\n').map(updateIfAtAtLine).join('\n')
}

// a previous comment was merged 
// -> rebase other comments (on same file) onto updated master
function rebaseOpenPRs(pullReq) {
  var sha = pullReq.pull_request.head.sha;
  console.log("Yo we just merged "+sha+" and gotta rebase all affected branches!")

  // compute comment length from patch
  var length = commentLength(sha);
  console.log(length);
  
  // forall branches:
  // if branch affected by changed file, update patch, otherwise just rebase
  var file = modifiedFile(sha);
  var branches = getBranches(file);
  branches.all.forEach(function (branch) { 
    console.log("Rebase branch "+branch);
    if (branches.withFile.indexOf(branch) >= 0) {
      console.log("Update patch for branch "+branch);
      //   git show > patch
      var patch = getPatch(branch);
      console.log("GOT PATCH");
      console.log(patch);
  //   git reset --hard HEAD~1
  //   git rebase master
  //   // patch the patch
  //   aendere die zeilennummer in dem @@ (hochzaehlen um hinzugekommene zeilen)

  //   git am < patch
    }
  });
  
}

// remove the branch we just closed or merged
function removeBranch(ref) {
  console.log("remove merged branch "+ref);
  execLocalSync("git branch -D "+ref
           +" && git remote prune origin");
}

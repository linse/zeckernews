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
        // rebase & rebuild when pr was closed by merge - TODO and no leaf was merged whose deleted branch we will revisit then
        if (pullReq.pull_request.merged_at != null) {
            // look at all pr's below this, and rewrite their patches so they match the merged new text
            var otherBranches = execLocalSync('git branch -v | grep -v master');
            if (otherBranches !== '') {
                //rebaseOpenPRs(pullReq);
            }
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

// get comment length from merged change's sha
function commentLength(sha) {
  var atatline = execLocalSync("git show "+sha+" | grep ^@@");
  var elems = atatline.split(" ");
  // @@ line has: @@ <space> parent file offset,length <space> head offset,length .. blabla
  var par = elems[1].split(",")[1];
  var head = elems[2].split(",")[1];
  return parseInt(head) - parseInt(par);
}

// elem is offset,length - and could be negative
// TODO check if neg + neg are combined
function updateOffset(elem, length) {
  return elem.split(",").map(function (e,i,a) { 
               if (i==0) {
                 return parseInt(e)+length
               } else {
                 return e
               } } ).join(",");
}

// update the first number of each field.
function updateLine(atatline, length) {
  var elems = atatline.split(" ");
  // @@ line has: @@ <space> parent file offset,length <space> head offset,length .. blabla
  elems[1] = updateOffset(elems[1],-length); // offset of parent is negative
  elems[2] = updateOffset(elems[2], length);
  return elems.join(" ");
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

function updateIfAtAtLine(line,len) {
  var matchAtAt = /@@/.exec(line);
  if (matchAtAt) {
    return updateLine(line, len);
  }
  return line;
}

function updatePatch(patch, commentLen) {
  // do this line by line
  return patch.split('\n')
              .map(function (line) { return updateIfAtAtLine(line, commentLen) })
              .join('\n');
}

function returnIfPlus(line) {
  if (line.startsWith('+')) {
    return updateLine(line, len);
  }
  return line;
}


function getPlusLines(patch) {
  // do this line by line    // startsWith('+')
  return patch.split('\n').filter(function (line) { return line.indexOf('+')===0 })
}


function getComment(patch) {
  // take apart the patch to apply it
  //var pluslinesString = execLocalSync("echo \""+patch+"\" | grep \"^+\"");
  var pluslines = getPlusLines(patch);//pluslinesString.split("\n");

  // file to change
  var bfile = pluslines[0];
  console.log(pluslines)
  console.log(bfile)
  // remove start "+++ b/" to get the file we wanna change
  var filenameWithoutB = bfile.replace('+++ b/','')

  // comment to put again for new commit
  var addition = pluslines.slice(1,pluslines.length);
  // remove first char from each line, the '+'
  var linesWithoutPluses = addition.map(function (f) {return f.substring(1,f.length);})

  return { filename : filenameWithoutB,
           body: linesWithoutPluses.join("\n") }
}

// a previous comment was merged 
// -> rebase other comments (on same file) onto updated master
function rebaseOpenPRs(pullReq) {
  var sha = pullReq.pull_request.head.sha;
  console.log("Yo we just merged "+sha+" and gotta rebase all affected branches!")

  // compute comment length from patch
  var length = commentLength(sha);
  
  // forall branches:
  // if branch affected by changed file, update patch, otherwise just rebase
  var file = modifiedFile(sha);
  var branches = getBranches(file);
  branches.all.forEach(function (branch) { 
    console.log("Rebase branch "+branch);
    if (branches.withFile.indexOf(branch) >= 0) {
      console.log("Update patch for branch "+branch);
      // save changes in the patch
      var patch = getPatch(branch);

      // normal rebase would give us a conflict, so:
      // we forget the commit (have it in the patch), rebase, and make the change again
      execLocalSync("git branch -f "+branch+" master");
      execLocalSync("git checkout "+branch);
      var comment = getComment(patch);
      console.log("should re-apply"+comment);
      execLocalSync("echo \""+comment.body+"\" >> "+options.local_repo+"/"+comment.filename) // filename starts with "content"
      // TODO length restrict comment.body
      execLocalSync("git commit -m \"Merged comment branch "+branch+": "+comment.body+"\" content")
      execLocalSync("git branch --set-upstream "+branch+" origin/"+branch);
      // TODO THIS PULL FAILS
      execLocalSync("git pull");
      execLocalSync("git push -f origin "+branch);
      execLocalSync("git checkout master");
    }
  });
  
}

// remove the branch we just closed or merged
function removeBranch(ref) {
  console.log("PR closed, removing local branch "+ref);
  execLocalSync("git branch -D "+ref
           +" && git remote prune origin");
}

---
title: Comments for a static site - github is my moderation queue
date: 2016-12-05
tags: []
---
In the last post I described how I generate my website. 
Since the setup is not dynamic on the server, can we still let readers interact with it and have comments and a discussion?

I was thinking about this for a while, and also thought I don't want to use an external service such as disqus - why depend on another service if I can learn to build something instead? Then I thought a bit more -- how about using another provider I depend on already? How about using github for my comments?

So I set out to build a comment service that creates github pull requests to reflect peoples comments as changes to the source of my posts.
The gitub open pull request queue serves as my comment moderation queue. I either close a pull request and the comment does not pass moderation, or I merge the pull request, and the site gets rebuilt with the comment appended to it.
Due to the parasitic nature of this service, I called it "Zeckernews" - Zecke means tick, the blood sucking insect, in German.

We need a few dynamic pieces for this, but they can be mostly on the client. All the form actions and headers drawn and other fun stuff are in JavaScript on the client.
We only need two tiny and well-defined servers: A comment server and a deploy server.
The comment server accepts the requests from the comment form, and creates github pull requests for each one.
We can use github's API for this.
First we create the local change and push it:

````
function composePR(formData, callback) {
  // git branch
  exec("cd " + options.local_repo + " && git checkout -b " + formData.nonce
  // change source file
  + " && echo \"\n\n\n____\n\n**" + formData.name + "** posted a message:\n\n> " + formData.message
  + "\n\n\" >> " + options.local_repo + "/content/" + formData.file + "/comment" + formData.nonce+".md"
  + " && git add " + options.local_repo + "/content/" + formData.file + "/comment" + formData.nonce+".md"
  // git commit
  + " && git commit -m \"" + formData.name + ": " + formData.message + "\" content"
  // git push - fails if the branch already exists - thats why we use a nonce/a hash
  + " && git push https://" + options.token + "@github.com/linse/zeckernews.git " + formData.nonce
  + " ; git checkout master", callback);
}
````

Then we format it as an open pull request for github's API:

````
function postPR(formData) {
  var data = '{'title': 'Comment PR from ' + formData.name,
               'body': 'from the form',
               'head': "' + formData.nonce + '",
               'base': 'master'}';
  console.log('postPR');
  console.log(data);
  sendGithubRequest('POST', '/repos/linse/zeckernews/pulls', data);
}
````

In the last line we see how we send it via POST to github. 
This function looks like a standard HTTPS request to github's API server:
````
function sendGithubRequest(method, path, content) {
  var post_req = https.request({
    method: method,
    hostname: 'api.github.com',
    path: path,
    headers: { 'Authorization': 'token '+ options.token,
               'User-Agent': 'zeckernews' },
  },function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
       console.log('Response: ' + chunk);
    });
  });

  // post the data
  post_req.write(content);
  post_req.end();
}
````
Then I wrapped the whole thing in a tiny https server and run it as a daemon. Let's try this out.
<PIC OF THE FORM AND THE QUEUE>
So this is the first step. We made a comment and got an open pull request on github.
What can we do with this?

The next step is comment moderation. I have to take action on the pull request queue.
I either close a pull request:
<PIC OF ME CLOSING IT>
Or I approve it and merge the code change that it introduces.
<PIC OF ME MERGING IT>

Both actions trigger my deploy server, via github's webhook interface. 
This is the second server I have running. The deploy server is even more concise than the comment server.

````
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
````
You can see in the code that the case distinction is a bit convoluted.
We know that /something/ happened to a pull request if the webhook is triggered.
We would like to know whether the action was closing the PR - and then we still need to know whether it was closed by merge or just closed and abandoned.
This we can learn by parsing the result JSON and looking at the action and merged_at fields.
Based on these cases, we rebuild the blog post page if necessary.


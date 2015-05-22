var https = require('https');
var fs = require('fs');

var options = {
  key: fs.readFileSync('/etc/nginx/ssl/nginx.key'),
  cert: fs.readFileSync('/etc/nginx/ssl/nginx.crt')
};

var server = https.createServer(options, function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    // show the POSTed message
    if (body) {
      console.log(composeGist(decodeURI(body),counter++));
      // TODO contact github
    }
    res.end("Thank you");
  });
})

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
console.log("🎂");
var counter = 0;

function composeGist(content, counter) {
  //return 'curl --user "linse" --data \'{"description":"From commentserver","public":"true","files":{"Comment'+counter+'.txt":{"content":"'+data+'"}}\' https://api.github.com/gists';
  //curl -H "Authorization: token d433ba8b52b9a5cf75c194f7a9646c474a400ba7" --data '{"description":"From commentserver","public":"true","files":{"Comment11.txt":{"content":"message=hallo+oauth"}}' https://api.github.com/gists
  postGist('{"description":"From commentserver","public":"true","files":{"Comment'+counter+'.txt":{"content":"'+content+'"}}');
}

// TODO set this up to do what whe are duing via curl above
function postGist(content) {

    var post_req = https.request({
      method: 'POST',
      hostname: 'api.github.com',
      path: '/gists',
      headers: { 'Authorization': 'token d433ba8b52b9a5cf75c194f7a9646c474a400ba7',
                 'User-Agent': 'zeckernews' },
    },function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
   }
   );
   
   // post the data
  post_req.write(content);
  post_req.end();
   
}

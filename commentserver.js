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
    console.log('POSTed: ' + body + decodeURI(body) );
    console.log(composeGist(decodeURI(body),counter++));
    // TODO contact github
    // we are on another port so we need to accept port 80's request
    res.setHeader('Access-Control-Allow-Origin', 'https://linse.me');
    res.end("Thank you");
  });
})

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
console.log("🎂");
var counter = 0;

function composeGist(data,counter) {
  return 'curl --user "linse" --data \'{"description":"From commentserver","public":"true","files":{"Comment'+counter+'.txt":{"content":"'+data+'"}}\' https://api.github.com/gists';
}

// TODO set this up to do what whe are duing via curl above
function (e) {

    $.ajax({
      type: 'post',
      url: 'https://linse.me:8000',
      data: $('form').serialize(),
      success: function () {
        alert('form was submitted');
      }
    });

}

SHELL := /bin/bash

# where is the host config:
# /etc/nginx/sites-available/linse.me

# where are my files:
# ~/public_html/linse.me/public

indir = content
outdir = /home/linse/public_html/linse.me/public
host = linse.me

generate:
	for f in `ls $(indir)`; \
		do pandoc $(indir)/$$f -o $(outdir)/"$${f/%.*/.html}" -B before.html -A afterPost.html --css style.css; \
	done;

generate-index:
	(echo "# Posts Index"; \
	for f in `ls $(indir)`; \
		do echo "- <https://"$(host)/"$${f/%.*/.html}>"; \
	done) | pandoc -f markdown -o $(outdir)/index.html -B before.html -A after.html --css style.css;

set-style:
	cp style.css $(outdir)

## made it https like this:
#https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
#sudo mkdir /etc/nginx/ssl
#sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
#sudo vi /etc/nginx/sites-available/linse.me
#sudo service nginx restart

## added css
## added template

## add javascript for sparklepony header

# add js for comment magick
# write nodejs server, add keys and set it up under nginx location
# https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04
# 1 set up oauth and do gist via curl without password
#    curl https://api.github.com/authorizations \
#    > --user "linse" \
#    > --data '{"scopes":["gist"],"note":"zeckernews"}'
#    Enter host password for user 'linse':
#    {
#      "id": 18413790,
#      "url": "https://api.github.com/authorizations/18413790",
#      "app": {
#        "name": "zeckernews (API)",
#        "url": "https://developer.github.com/v3/oauth_authorizations/",
#        "client_id": "00000000000000000000"
#      },
#      "token": "d433ba8b52b9a5cf75c194f7a9646c474a400ba7",
#      "hashed_token": "643a5127976e8bdde49a05257010338ab6a431d37e36898dffac83000f8dd94b",
#      "token_last_eight": "4a400ba7",
#      "note": "zeckernews",
#      "note_url": null,
#      "created_at": "2015-05-22T22:12:08Z",
#      "updated_at": "2015-05-22T22:12:08Z",
#      "scopes": [
#        "gist"
#      ],
#      "fingerprint": null
#    }


# do gist via get request from the node server
#https://developer.github.com/v3/#user-agent-required

# modify existing gist

# TODO create a patch instead of a gist
### THIS IS FOR ALTERING THE SOURCE!

# TODO figure out how to host on github and create pr

# think about removing intermediate step - but token?
# TODO

#TODO make it look nice :)
# more headers: blank tv, game of life, fractals
# static triangle
#http://www.backslash.gr/content/blog/webdevelopment/6-navigation-menu-that-stays-on-top-with-jquery

#TODO test on phooone :D
#
#TODO add back and next links in post
#TODO add rewrite rules for host
#
#save/commit source:
#just commit this dir
#
#TODO:
#Add js hook for commenters - they trigger a git commit writing to the posting!
#but I will have to accept their pull request!
#
#deploy:
#I don't care I like dangerous things :D

SHELL := /bin/bash

# host config:
# /etc/nginx/sites-available/linse.me

# html files to be served:
# ~/public_html/linse.me/public

# TODO when comments are off, display a message about that on submit
# extract out the js header and make it animate

posts = content/posts
pages = content/pages
outdir = /home/linse/public_html/linse.me/public
host = linse.me
VPATH = content

all: set-style generate-posts generate-pages generate-index generate-feed

# find-xargs-ls magic => ordered by time; post first and then comments
generate-posts:
	git pull
	for p in `ls $(posts)`; \
    do f=`find './$(posts)/'$$p -type f -print0 | xargs -0 ls -rt1`; \
		  cat $$f | pandoc -o $(outdir)/"$$p.html" -B before.html -A afterPost.html --css style.css; \
	done;

# find-xargs-ls magic => ordered by time; post first and then comments
generate-pages:
	git pull
	for p in `ls $(pages)`; do \
		  cat $(pages)/$$p | pandoc -o $(outdir)/"$${p/%.md/.html}" -B before.html -A after.html --css style.css; \
	done;

# generate link name and link for each post in input dir
# b = base filename, dash separated; y = year dash replaced, m = month dash replaced, d = day dash replaced
# t = title, w = when (human readable date)
generate-index:
	(echo "# Posts Index"; \
	for f in `ls $(posts)`; \
		do b=$${f%.*}; y=$${b/-/\/}; m=$${y/-/\/};  d=$${m/-/\/}; t=$$(basename $$d); w=$$(dirname $$d) \
                   echo "- [$$w $$t](https://"$(host)"/$$d.html)"; \
	done) | pandoc -f markdown -o $(outdir)/index.html -B before.html -A after.html --css style.css;

generate-feed:
	(printf '<?xml version="1.0" encoding="utf-8"?>\n<rss version="2.0">'; \
	for p in `ls $(posts)`; \
    do f=`find './$(posts)/'$$p -type f -print0 | xargs -0 ls -rt1`; \
		  b=$${p%.*}; y=$${b/-/\/}; m=$${y/-/\/};  d=$${m/-/\/}; t=$$(basename $$d); w=$$(dirname $$d) \
		  cat $$f | pandoc --variable=link:"https://"$(host)"/$$d.html" --template templates/feeditem.xml --css style.css; \
	done; echo "</rss>";) > $(outdir)/feed.xml;

set-style:
	cp style.css $(outdir)

# TODO: make slug lowercase
post:
	@read -p 'Title? ' title; \
	date=`date +%Y-%m-%d`; \
  postdir=$(posts)/$$date-$${title// /-}; \
  mkdir -p $$postdir; \
	file=$$postdir/post.md; \
	separator='---'; \
	if [[ ! -s "$$file" ]]; then \
 	  printf "%s\ntitle: %s\ndate: %s\ntags: []\n%s\n\n" $$separator "$$title" $$date $$separator >> "$$file"; \
	fi; \
	vim +6 $$file;

clean:
	rm $(outdir)/*;

# the right way:
#$(outdir)/%.html: %.md
#	pandoc $< -o $@

## made it https like this:
#https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
#sudo mkdir /etc/nginx/ssl
#sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
#sudo vi /etc/nginx/sites-available/linse.me
#        location /comment {
#                proxy_pass https://linse.me:8000;
#                proxy_http_version 1.1;
#                proxy_set_header Upgrade $http_upgrade;
#                proxy_set_header Connection 'upgrade';
#                proxy_set_header Host $host;
#                proxy_cache_bypass $http_upgrade;
#        }
#
#        location /deploy {
#                proxy_pass https://linse.me:6666;
#                proxy_http_version 1.1;
#                proxy_set_header Upgrade $http_upgrade;
#                proxy_set_header Connection 'upgrade';
#                proxy_set_header Host $host;
#                proxy_cache_bypass $http_upgrade;
#        }
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

# do gist via get request from the node server
#https://developer.github.com/v3/#user-agent-required

# modify existing gist
# decode + deserialize message
# remove token

# daemonize
# by hand https://www.digitalocean.com/community/tutorials/how-to-write-a-linux-daemon-with-node-js-on-a-vps
# by npm http://stackoverflow.com/questions/4903570/how-does-one-start-a-node-js-server-as-a-daemon-process
# commentserver/commentserver start

# create a patch instead of a gist
### THIS IS FOR ALTERING THE SOURCE!

# figure out how to host on github and create pr

#Add js hook for commenters - they trigger a git commit writing to the posting!
#but I will have to accept their pull request!

# run webhook for deploying

# think about removing intermediate step - but token?

# add rewrite rules for host
# (see nginx setup)

#TODO make it look nice :)
# more headers: blank tv, game of life, fractals
# static triangle
#http://www.backslash.gr/content/blog/webdevelopment/6-navigation-menu-that-stays-on-top-with-jquery

#TODO test on phooone :D
#
#TODO add back and next links in post
#
#save/commit source:
#just commit this dir
#
#TODO:
# TODO
# local branch cannot exist or we fail
# remote branch cannot exist or we fail
# something's up with multiwords - dont work in both name or form!
# we have to clean up all the branches
# unmerged requests sneak in via others

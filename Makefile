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
		do pandoc $(indir)/$$f -o $(outdir)/"$${f/%.*/.html}" -B before.html -A after.html --css style.css; \
	done;

generate-index:
	(echo "# Posts Index"; \
	for f in `ls $(indir)`; \
		do echo "- <https://"$(host)/"$${f/%.*/.html}>"; \
	done) | pandoc -f markdown -o $(outdir)/index.html -B before.html -A after.html --css style.css;

set-style:
	cp style.css $(outdir)
	cp header.js $(outdir)

## made it https like this:
#https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
#sudo mkdir /etc/nginx/ssl
#sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
#sudo vi /etc/nginx/sites-available/linse.me
#sudo service nginx restart

## added css
## added template

## add javascript for sparklepony header

## TODO add js for comment magick

#TODO css broke the metadata
#TODO make it look nice :)
# more headers: blank tv, game of life, fractals
# static triangle

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

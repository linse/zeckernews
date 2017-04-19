---
title: LetsEncrypt with acmetool
date: 2017-01-08
tags: []
teaser: Let's Encrypt is an awesome, free and automated certificate authority if you want to get SSL certificates to serve over https. I use acmetool to get my certs from them.
---
I serve this page using https. In the past, I'd have to use a self signed certificate or otherwise buy one from an official certificate authority (CA). 
Since 2016 there is a new, free and automated CA founded by people from the EFF, called Let's Encrypt. To request certificates from Let's Encrypt, you can use their automated tool "certbot". I use an alternative called acmetool, since it had better nginx support when I set this up.

Install acmetool as explained on [https://github.com/hlandau/acme](https://github.com/hlandau/acme).
To set up your account, you can run 
    sudo acmetool quickstart
It asks you whether you want a test certificate or the real thing. A test certificate is not from a trusted CA, but it has less restrictive rate limiting, and is good for testing the automated certificate retrieval process.
To get a certificate, you need to prove that you control your webserver. To do this, you need to "solve a challenge". I picked the stateless challenge, which just requires a change to your webserver's setup. 
Acmetool quickstart will ask you about what challenge you want to pick.

For the stateless challenge, you need to add a section to your webserver config that handles challenge traffic on port 80. For nginx it looks like this:

    server {
      listen 80 default_server;
      listen [::]:80 default_server;
      ..
  
      location ~ "^/\.well-known/acme-challenge/([-_a-zA-Z0-9]+)$" {
        default_type text/plain;
        return 200 "$1.ACCOUNT_THUMBPRINT";
      }
  
      ..
Your account thumbprint is different for the staging / test certificates and for the real certificates. You can get both of them via

    sudo acmetool account-thumbprint

There is a lot more information about the challenges at [https://hlandau.github.io/acme/userguide#web-server-configuration-challenges](https://hlandau.github.io/acme/userguide#web-server-configuration-challenges).

Now that you've set up the challenges, you are ready to get some certificates for your domains.
You can do this with 

    sudo acmetool want mydomain.net

If you have multiple subdomains and want to use the same certificate, you can request them all in one `want` command. If you want to use multiple certificates, you should issue multiple want commands.

To make your webserver use the certificate, you have to add two more bits of configuration, `ssl_certificate` and `ssl_certificate_key`.

    server {
      listen 443 ssl;
      ..
      server_name mydomain.net;
      ssl_certificate /var/lib/acme/live/mydomain.net/fullchain;
      ssl_certificate_key /var/lib/acme/live/mydomain.net/privkey;
      ..

Restart your webserver (for me: `sudo /etc/init.d/nginx restart`), and you're done.

---
title: My first Solr instance
date: 2018-01-16
tags: []
---
On Etsy's search infrastructure team I interact with Solr and Elasticsearch a lot. The systems are very mature and usually I can just follow our runbooks for everyday tasks like reindexing or basic troubleshooting.
When trying something out, I got curious about what's the simplest way to run a Solr instance for testing.

## Run Solr in Docker

```
# run a standard solr in docker
docker run solr:latest
# run a specific version of solr
docker run solr:6.6.0
```
Other possibility: Build it yourself
For this you need a Dockerfile, I based mine on https://github.com/docker-solr/docker-solr/.
```
# build docker container and pack from current directory
docker build -t search/docker-solr:latest .
```
Run the container, with a core called "books" (pick depending on the search you're building).
A solr core is an index + metadata for that index, such as transaction logs.
Let's start the container in the background, give it a name and map the port out of the container, maybe also enable CORS.
```
# run docker container - see at http://localhost:8984/solr/#/
docker run -d -p 8984:8983 --name solr -e ENABLE_CORS=true 
  -e CORE_NAME=books search/docker-solr:latest
```
You can see your containers with `docker ps solr` and delete them with `docker rm solr`.

## Index data

I found that the simplest way to add index data is via the network API, let's try it via curl.
Be careful, the url path differs depending on whether you send a single document or a list of documents.
For one doc it is `solr/books/update` and for multipe `solr/books/update/json/docs`.
```
# add something to index
curl -X POST -H 'Content-Type: application/json' 
  'http://localhost:8984/solr/books/update/json/docs' --data-binary '
{
  "id": "1",
  "title": "The neverending story"
}'
# delete something
curl -X POST -H 'Content-Type: application/json' 
  'http://localhost:8984/solr/books/update/json/docs' --data-binary '
{ "delete":"1" }'
# delete everything
curl -X POST -H 'Content-Type: application/json' 
  'http://localhost:8984/solr/books/update' --data-binary '
{
    "delete": {
        "query": "*:*"
    },
    "commit": {}
}'
```

## Simple indexer
Now we need to get some data that we would like to index. Currently, the index is empty:
```
$ curl 'http://localhost:8984/solr/books/query?debug=query&q=*:*'
{
  "responseHeader":{
    "status":0,
    "QTime":1,
    "params":{
      "q":"*:*",
      "debug":"query"}},
  "response":{"numFound":0,"start":0,"docs":[]
  },
  "debug":{
    "rawquerystring":"*:*",
    "querystring":"*:*",
    "parsedquery":"MatchAllDocsQuery(*:*)",
    "parsedquery_toString":"*:*",
    "QParser":"LuceneQParser"}}
```

I started with a small set of popular items to index that I had in a tab-separated file. Let's assume we're indexing books.
```
$ cat popular-books.tsv
Neverending Solr
Goedel Solr Bach
Solr Crash
```
I'm also adding consecutive numbers so we can address books by document Id. This is not really necessary for all indexes but makes our example more realistic.

```
# 101 books from popular-books.tsv
# with line numbers as fake document ids
awk '{print NR  "\t" $s}' popular-books.tsv

# line numbers as fake document ids for index again
curl 'http://localhost:8984/solr/books/update/csv?commit=true&fieldnames=id,book' \
 --data-binary @<(awk '{print NR  "," $s}' popular-books.tsv) \
 -H 'Content-type:text/plain; charset=utf-8'
```
This works really well and indexing is done in an instant.

Our index now looks like this:
```
$ curl 'http://localhost:8984/solr/books/query?debug=query&q=*:*'
{
  "responseHeader":{
    "status":0,
    "QTime":1,
    "params":{
      "q":"*:*",
      "debug":"query"}},
  "response":{"numFound":3,"start":0,"docs":[
      {
        "id":"1",
        "book":["Neverending Solr"],
        "_version_":1591714613158739968},
      {
        "id":"2",
        "book":["Goedel Solr Bach"],
        "_version_":1591714613161885696},
      {
        "id":"3",
        "book":["Solr Crash"],
        "_version_":1591714613162934272}]
  },
  "debug":{
    "rawquerystring":"*:*",
    "querystring":"*:*",
    "parsedquery":"MatchAllDocsQuery(*:*)",
    "parsedquery_toString":"*:*",
    "QParser":"LuceneQParser"}}
```
Let's try it with some real data. Imagine I'm having 3.75 Million books to index, in a sequence file on hadoop.
```
# 3750618 real docs on hadoop
seqcat booklist | cut -f 1 | awk '{print NR  "," $s}'

# upload the real docs as index - need to remove comma 
via tr or we crash on values={'1047632','the bible ','',}
curl 'http://localhost:8984/solr/books/update/csv?commit=true&fieldnames=id,book' \
 --data-binary @<(seqcat booklist | cut -f 1 | tr -d ',' | awk '{print NR  "," $s}') 
  -H 'Content-type:text/plain; charset=utf-8'
```
The resulting index has 3750618 (all) documents.

Let's check via a test query:
```
# do the test query
curl 'http://localhost:8984/solr/books/query?q=Bach'
# get all
curl 'http://localhost:8984/solr/books/query?debug=query&q=*:*'
```
Here we can see all documents that match the query, and see that all 3750618 documents made it to our index.
Our really simple Solr search is working now.

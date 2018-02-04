---
title: Make as a static site generator
date: 2016-09-13
tags: []
teaser: <img src="https://i.imgur.com/stTqczq.jpg" alt="Calafou"></img>No bandwidth but a Makefile. :)
---
When I applied at Etsy, I was at the backbone conference in Calafou, a tech collective in rural Spain. The bandwith in the countryside was limited, and I had to hand in an assignment which analyzed a lot of data that had to be downloaded from the web. So I decided that my solution should never download the same data twice. This lead me to solving the assignment with a Makefile.
<img src="https://i.imgur.com/stTqczq.jpg" alt="Calafou"></img>

I program in many languages and each one has different ways to build projects. Since it is hard to remember the build specifics, I put them in a Makefile. Even when I wrote my thesis in LaTeX, I had a Makefile. 

For data analysis projects I also used Makefiles, because some steps take time and it does not always make sense to rerun the entire pipeline, but it is important to run for example the cleanup step before we can run the normalization and the statistical analysis.

That's three main advantages:

- Avoiding duplicate steps
- Writing down build commands in one place
- Specifying dependencies and having them met

At the same time, I had a website that was runnig wordpress. And that wordpress blog took part in a DDoS pingback flood attack - very embarrassing. At that point I just used wget -r to download the entire wordpress blog, and serve it as a static site. :-D
Awesome hack, but quite hard to update the blog content after that.



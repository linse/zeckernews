<script type="text/javascript">
    document.addEventListener("DOMContentLoaded",
        function() {
            var div, n,
                v = document.getElementsByClassName("youtube-player");
            for (n = 0; n < v.length; n++) {
                if (v[n].dataset.id !== undefined) {
                    div = $('<div>', { "data-id": v[n].dataset.id } );
                    thumb = $(thumbnail(v[n].dataset.id));
                    console.log(thumb.children('img'));
                    div.append(thumb);
                    div.on('click', iframe);
                    v[n].appendChild(div[0]);
                }
            }
        });

  function thumbnail(id) {
      var thumburl = 'https://i.ytimg.com/vi/' + id;
      var thumb = '<img src="' + thumburl + '"/>',
          play = '<div class="play"></div>';
      return thumb.replace("ID", id) + play;
  }

  function iframe() {
      var iframe = document.createElement("iframe");
      var embed = "https://www.youtube.com/embed/ID?autoplay=1";
      iframe.setAttribute("src", embed.replace("ID", this.dataset.id));
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "1");
      this.parentNode.replaceChild(iframe, this);
  }
</script>

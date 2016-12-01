<script type="text/javascript">
    document.addEventListener("DOMContentLoaded",
        function() {
            var div, n,
                v = document.getElementsByClassName("youtube-player");
            for (n = 0; n < v.length; n++) {
                if (v[n].dataset.id !== undefined) {
                    div = $('<div>', { "data-id": v[n].dataset.id } );
                    thumb = $(labnolThumb(v[n].dataset.id));
                    console.log(thumb.children('img'));
                    div.append(thumb);
                    div.on('click', labnolIframe);
                    v[n].appendChild(div[0]);
                }
            }
        });

  function makeThumbnail(id) {
    var el = document.createElement('img');
    el.onload = function(ev) {
      ev.target.onload = null;
      if (ev.target.height < 600) {
        ev.target.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
      }
      return true;
    }
    el.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
    return el;
  }

  function labnolThumb(id) {
      var thumburl = 'https://i.ytimg.com/vi/' + id;
      var thumb = '<img src="' + thumburl + '"/>',
          play = '<div class="play"></div>';
      //var el = document.createElement('img');
      //el.src = thumburl;
      // onerror does not work because even though we have 404 we still get an image
      //thumb = '<img src="https://i.ytimg.com/vi/ID/maxresdefault.jpg" onerror="this.onerror=null;this.src=\'https://www.google.com/images/srpr/logo11w.png\'" />';

      //var url = 'https://i.ytimg.com/vi/ID/maxresdefault.jpg'.replace("ID", id);
      //<img src="imagenotfound.gif" alt="Image not found" onerror="this.onerror=null;this.src='"+url+"';" />

      return thumb.replace("ID", id) + play;
  }

  function labnolIframe() {
      var iframe = document.createElement("iframe");
      var embed = "https://www.youtube.com/embed/ID?autoplay=1";
      iframe.setAttribute("src", embed.replace("ID", this.dataset.id));
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "1");
      this.parentNode.replaceChild(iframe, this);
  }
</script>

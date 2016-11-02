<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
<link href="https://linse.me/feed.xml" rel="alternate" type="application/rss+xml" title="Posts RSS" />
<script type="text/javascript">
  window.onload = function() {
    $('.slippy-nav').addClass('original').clone().insertAfter('.slippy-nav')
                    .addClass('cloned').css('position','fixed').css('top','0').css('margin-top','0').css('z-index','500')
                    .removeClass('original').hide();
    var scrollIntervalID = setInterval(stickIt.bind(null, $('.original'), $('.cloned')), 10);
  }

  function stickNav(slippynavPosition) {
    console.log(slippynavPosition);
  }

  function stickIt(original, cloned) {
    var orgElementTop = original.offset().top;               
  
    if ($(window).scrollTop() >= orgElementTop) { // scrolled past the original position
      // cloned should always have same geometry as original
      var leftOriginal = original.offset().left;
      var widthOriginal = original.css('width');
      // now only show the cloned, sticky element.
      cloned.css('left',leftOriginal+'px').css('top',0).css('width',widthOriginal).show();
      original.css('visibility','hidden');
    } else { // not scrolled past the slippy-nav
      cloned.hide();
      // only show the original slippy-nav
      original.css('visibility','visible');
    }
  }
</script>

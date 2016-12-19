<meta name=viewport content='width=800'>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
<link href="https://linse.me/feed.xml" rel="alternate" type="application/rss+xml" title="Posts RSS" />
<script type="text/javascript">
  $(window).on('load',init);
//  $(window).on('resize',init);
//  $(window).on('beforeunload',init);

  function init() {
    $('.slippy-nav').addClass('original').clone().insertAfter('.slippy-nav')
                    .addClass('cloned').css('position','fixed').css('top','0').css('margin-top','0').css('z-index','500')
                    .removeClass('original').hide();
    var scrollIntervalID = setInterval(stickNav.bind(null, $('.original'), $('.cloned')), 10);
  }

  function stickNav(original, cloned) {
    var scrollPosition = $(window).scrollTop();
    var originalPosition = original.offset().top;
    if (scrollPosition >= originalPosition) {
      onlyShowCloned(original, cloned);
    } else {
      onlyShowOriginal(original, cloned);
    }
  }

  function onlyShowCloned(original, cloned) {
    // cloned should have same geometry as original
    var left = original.offset().left;
    var width = original.css('width');
    cloned.css('left',left+'px').css('top',0).css('width',width).show();
    original.css('visibility','hidden');
  }

  function onlyShowOriginal(original, cloned) {
    cloned.hide();
    original.css('visibility','visible');
  }
</script>

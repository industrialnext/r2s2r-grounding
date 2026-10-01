// Play muted loops only while on screen; load nothing until first visible.
(function () {
  var videos = document.querySelectorAll('video[data-lazy]');
  if (!('IntersectionObserver' in window)) {
    videos.forEach(function (v) { v.preload = 'auto'; v.play().catch(function () {}); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) v.play().catch(function () {});
      else v.pause();
    });
  }, { rootMargin: '200px 0px' });
  videos.forEach(function (v) { io.observe(v); });
})();

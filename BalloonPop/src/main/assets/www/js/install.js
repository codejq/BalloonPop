// "Install app": add Balloon Pop to the home screen.
//  - Android / desktop Chrome & Edge: the browser's own install prompt (beforeinstallprompt).
//  - iPhone / iPad: Safari has no install prompt, so we show the Share → "Add to Home Screen" steps.
// The button is hidden once the game runs as an installed app, and inside the Android wrapper app.
(function () {
  const btn = document.getElementById('btn-install');
  const help = document.getElementById('overlay-install');
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inWrapperApp = !!window.android;
  let deferred = null;

  function installed() {
    return navigator.standalone === true ||
      ['standalone', 'fullscreen', 'minimal-ui'].some(function (m) { return matchMedia('(display-mode: ' + m + ')').matches; });
  }
  function update() {
    btn.hidden = installed() || inWrapperApp || !(deferred || isIOS);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();          // keep the prompt for our own button
    deferred = e;
    update();
  });
  window.addEventListener('appinstalled', function () { deferred = null; update(); });

  btn.addEventListener('click', function () {
    GameAudio.Sfx.click();
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; update(); });
    } else if (isIOS) {
      help.hidden = false;
      document.getElementById('btn-install-close').focus();
    }
  });
  function close() { help.hidden = true; }
  document.getElementById('btn-install-close').addEventListener('click', function () { GameAudio.Sfx.click(); close(); });
  help.addEventListener('click', function (e) { if (e.target === help) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !help.hidden) close(); });

  update();
})();

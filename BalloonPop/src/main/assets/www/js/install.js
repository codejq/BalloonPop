// "Install app": add Balloon Pop to the home screen.
//  - Phones and tablets get a popup a moment after the home screen opens: Install / Later / No thanks.
//      Later     -> ask again after SNOOZE_DAYS
//      No thanks -> never ask again (the Install button in Settings still works)
//  - Android: Install opens the browser's own install prompt (beforeinstallprompt).
//  - iPhone / iPad: Safari has no install prompt, so Install shows the Share -> "Add to Home Screen" steps.
// Nothing is shown once the game runs as an installed app, inside the Android wrapper app,
// in agent mode (?agent=1) or in automated browsers, so it never blocks an AI agent.
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const settingsBtn = $('btn-install');
  const ask = $('overlay-install-ask');
  const steps = $('overlay-install');
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = isIOS || /android/i.test(ua) ||
    (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820);
  const inWrapperApp = !!window.android;
  const automated = navigator.webdriver === true || new URLSearchParams(location.search).get('agent') === '1';
  const ASK_DELAY = 2500;
  const SNOOZE_DAYS = 3;
  let deferred = null;
  let askedThisVisit = false;

  const memory = {
    get: function () { try { return JSON.parse(localStorage.getItem('bp.install')) || {}; } catch (e) { return {}; } },
    set: function (v) { try { localStorage.setItem('bp.install', JSON.stringify(v)); } catch (e) {} }
  };

  function installed() {
    return navigator.standalone === true ||
      ['standalone', 'fullscreen', 'minimal-ui'].some(function (m) { return matchMedia('(display-mode: ' + m + ')').matches; });
  }
  function installable() { return !installed() && !inWrapperApp && !!(deferred || isIOS); }

  function update() { settingsBtn.hidden = !installable(); }

  // ------------------------------------------------------------ popup
  function mayAsk() {
    const m = memory.get();
    return isMobile && !automated && !askedThisVisit && installable() && !m.never && Date.now() >= (m.snoozeUntil || 0);
  }
  function calmMoment() {   // on the home screen with no other dialog open
    return $('screen-home').classList.contains('active') &&
      Array.prototype.every.call(document.querySelectorAll('.overlay'), function (o) { return o.hidden; });
  }
  function showAsk() {
    askedThisVisit = true;
    ask.hidden = false;
    $('btn-ask-install').focus();
  }
  let waiting = null;
  function scheduleAsk() {
    if (waiting || !mayAsk()) return;
    waiting = setTimeout(function check() {
      if (!mayAsk()) { waiting = null; return; }
      if (calmMoment()) { waiting = null; showAsk(); }
      else waiting = setTimeout(check, 2000);   // wait until the player is back on the home screen
    }, ASK_DELAY);
  }
  function snooze() {
    const m = memory.get();
    m.snoozeUntil = Date.now() + SNOOZE_DAYS * 864e5;
    memory.set(m);
  }
  function closeAsk() { ask.hidden = true; }

  // ------------------------------------------------------------ installing
  function install() {
    if (deferred) {
      const d = deferred;
      d.prompt();
      d.userChoice.then(function (choice) {
        if (!choice || choice.outcome !== 'accepted') snooze();   // closed the system prompt = "later"
      }).finally(function () { deferred = null; update(); });
    } else if (isIOS) {
      snooze();   // we can't tell if they finish; once installed, it runs standalone and never asks
      steps.hidden = false;
      $('btn-install-close').focus();
    }
  }

  $('btn-ask-install').addEventListener('click', function () { GameAudio.Sfx.click(); closeAsk(); install(); });
  $('btn-ask-later').addEventListener('click', function () { GameAudio.Sfx.click(); snooze(); closeAsk(); });
  $('btn-ask-never').addEventListener('click', function () {
    GameAudio.Sfx.click();
    const m = memory.get(); m.never = true; memory.set(m);
    closeAsk();
  });
  ask.addEventListener('click', function (e) { if (e.target === ask) { snooze(); closeAsk(); } });   // tap outside = later

  settingsBtn.addEventListener('click', function () {
    GameAudio.Sfx.click();
    $('overlay-settings').hidden = true;
    install();
  });
  function closeSteps() { steps.hidden = true; }
  $('btn-install-close').addEventListener('click', function () { GameAudio.Sfx.click(); closeSteps(); });
  steps.addEventListener('click', function (e) { if (e.target === steps) closeSteps(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!ask.hidden) { snooze(); closeAsk(); }
    else if (!steps.hidden) closeSteps();
  });

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();          // keep the prompt for our own popup / button
    deferred = e;
    update();
    scheduleAsk();
  });
  window.addEventListener('appinstalled', function () { deferred = null; closeAsk(); update(); });

  update();
  scheduleAsk();   // iOS: no install event, so ask on load

  // For testing and support: BalloonInstall.ask() shows the popup now; reset() forgets Later / No thanks.
  window.BalloonInstall = {
    ask: showAsk,
    reset: function () { memory.set({}); askedThisVisit = false; },
    state: function () { return { mobile: isMobile, ios: isIOS, installable: installable(), installed: installed(), memory: memory.get() }; }
  };
})();

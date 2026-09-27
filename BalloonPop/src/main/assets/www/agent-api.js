// Balloon Pop agent API: lets LLM agents and scripts play the game.
// Everything is exposed on window.BalloonPop. See llms.txt for the full guide.
(function () {
  function status() {
    if (celebrate.style.display === 'block') return 'won';
    if (sorryTryAgain.style.display === 'block') return 'lost';
    return startGameBtn.style.display === 'none' ? 'playing' : 'idle';
  }

  function describe(el) {
    const r = el.getBoundingClientRect();
    return {
      id: el.id,
      type: el.dataset.type,            // 'normal' | 'heart' | 'evil'
      color: el.dataset.color,
      shouldPop: el.dataset.type !== 'evil',
      x: Math.round(r.left + r.width / 2),   // viewport centre, for mouse clicks
      y: Math.round(r.top + r.height / 2),
      visible: r.bottom > 0 && r.top < window.innerHeight
    };
  }

  const api = {
    version: 1,

    help: function () {
      return [
        'Balloon Pop - agent API',
        'Goal: reach 150 points within 3 minutes. Normal/heart balloons +1, evil balloons -10. Below -100 you lose.',
        'BalloonPop.start(opts?)        start a game; opts.speed slows balloons (e.g. 0.2)',
        'BalloonPop.getState()          {status, score, timeLeft, balloons:[{id,type,shouldPop,x,y,visible}]}',
        'BalloonPop.pop(id)             pop one balloon; returns {ok, type, points, score}',
        'BalloonPop.popAllSafe()        pop every visible non-evil balloon; returns number popped',
        'BalloonPop.setSpeed(n)         balloon speed multiplier for new balloons (1 = normal)',
        'BalloonPop.stop()              end the current game'
      ].join('\n');
    },

    getState: function () {
      return {
        status: status(),               // 'idle' | 'playing' | 'won' | 'lost'
        score: score,
        winScore: 150,
        loseScore: -100,
        timeLeft: document.getElementById('clockTimer').textContent || null,
        speed: gameSpeed,
        balloons: Array.from(balloonsContainer.querySelectorAll('.balloon')).map(describe)
      };
    },

    start: function (opts) {
      if (opts && opts.speed) api.setSpeed(opts.speed);
      if (status() !== 'playing') startGameBtn.click();
      return api.getState();
    },

    stop: function () {
      if (status() === 'playing') stopGame();
      return api.getState();
    },

    setSpeed: function (n) {
      n = parseFloat(n);
      if (!(n > 0)) throw new Error('speed must be a positive number');
      gameSpeed = n;
      return gameSpeed;
    },

    pop: function (id) {
      const el = document.getElementById(id);
      if (!el || !el.classList.contains('balloon')) {
        return { ok: false, error: 'No balloon with id ' + id + ' (it may have floated away)', score: score };
      }
      const type = el.dataset.type;
      handleBalloonClick.call(el, { preventDefault: function () {} });
      return { ok: true, type: type, points: type === 'evil' ? -10 : 1, score: score };
    },

    popAllSafe: function () {
      let n = 0;
      api.getState().balloons.forEach(function (b) {
        if (b.shouldPop && b.visible && api.pop(b.id).ok) n++;
      });
      return n;
    }
  };

  window.BalloonPop = api;
})();

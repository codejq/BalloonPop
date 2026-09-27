// Balloon Pop agent API: lets LLM agents and scripts play the game.
// Everything is exposed on window.BalloonPop. See llms.txt for the full guide.
(function () {
  const G = window.BalloonGame;

  const api = {
    version: 2,

    help: function () {
      return [
        'Balloon Pop - agent API (window.BalloonPop)',
        'Modes: freeplay (score 150 in 3 min; evil balloons -10, heart +5), colors, shapes, numbers, letters.',
        'In learning modes a prompt names a target ("Find: red"); pop balloons whose isTarget is true.',
        'BalloonPop.modes()                          list modes and their level counts',
        'BalloonPop.start({mode, level, explore, learn, speed})  start a game (speed < 1 slows balloons, e.g. 0.3)',
        '  learn: true (numbers/letters) = pop items in order 1,2,3 / A,B,C; wrong balloons do not pop',
        'BalloonPop.getState()                       {status, mode, level, target, score, goal, correct, balloons:[...]}',
        'BalloonPop.pop(id)                          pop one balloon -> {ok, correct, points, score}',
        'BalloonPop.popAllSafe()                     pop every visible balloon with shouldPop true',
        'BalloonPop.pause() / resume() / home()',
        'BalloonPop.setSpeed(n) / setLanguage(code) / languages()'
      ].join('\n');
    },

    modes: G.modes,
    languages: G.languages,

    getState: function () { return G.state(); },

    start: function (opts) { G.start(opts || {}); return G.state(); },

    pop: function (id) { return G.pop(id); },

    popAllSafe: function () {
      // Re-read the state after every pop: in learning modes the target changes after each correct pop.
      let n = 0;
      for (let guard = 0; guard < 50; guard++) {
        const s = G.state();
        if (s.status !== 'playing') break;
        const b = s.balloons.find(function (x) { return x.shouldPop && x.visible; });
        if (!b || !G.pop(b.id).ok) break;
        n++;
      }
      return n;
    },

    pause: function () { G.pause(); return G.state(); },
    resume: function () { G.resume(); return G.state(); },
    home: function () { G.home(); return G.state(); },
    stop: function () { G.home(); return G.state(); },
    setSpeed: G.setSpeed,
    setLanguage: G.setLanguage
  };

  window.BalloonPop = api;
})();

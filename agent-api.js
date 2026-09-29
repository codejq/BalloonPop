// Balloon Pop agent API: lets LLM agents and scripts play the game.
//  - window.BalloonPop: JavaScript API (see help() and llms.txt)
//  - WebMCP: the same actions registered as tools on navigator.modelContext, when the browser supports it
//  - Agent mode (?agent=1 or start({agent: true})): turn-based, the game waits while the agent thinks
(function () {
  const G = window.BalloonGame;

  const api = {
    version: 3,

    help: function () {
      return [
        'Balloon Pop - agent API (window.BalloonPop)',
        'Modes: freeplay (score 150 in 3 min; evil balloons -10, heart +5), colors, shapes, numbers, letters.',
        'In learning modes a prompt names a target ("Find: red"); pop balloons whose shouldPop is true.',
        'Agent mode (recommended for slow agents): the game is frozen until you act, then runs ~1.5 s.',
        '',
        'BalloonPop.start({mode, level, learn, explore, agent, speed})  start a game; agent: true = turn-based',
        '  learn: true (numbers/letters) = pop items in order 1,2,3 / A,B,C; wrong balloons do not pop',
        'BalloonPop.describe()        plain-text summary of the screen: target, balloons, what to pop',
        'BalloonPop.getState()        same as JSON: {status, target, score, goal, correct, balloons:[{id, shouldPop, x, y}]}',
        'BalloonPop.pop(id)           pop one balloon -> {ok, correct, points, score}',
        'BalloonPop.popAllSafe()      pop every visible balloon with shouldPop true',
        'await BalloonPop.step(ms)    let the game run for ms (agent mode), returns the new state',
        'BalloonPop.setAgentMode(on, stepMs)',
        'BalloonPop.modes() / pause() / resume() / home() / setSpeed(n) / setLanguage(code) / languages()'
      ].join('\n');
    },

    modes: G.modes,
    languages: G.languages,
    describe: G.describe,
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

    step: G.step,
    setAgentMode: G.setAgentMode,
    pause: function () { G.pause(); return G.state(); },
    resume: function () { G.resume(); return G.state(); },
    home: function () { G.home(); return G.state(); },
    stop: function () { G.home(); return G.state(); },
    setSpeed: G.setSpeed,
    setLanguage: G.setLanguage
  };

  window.BalloonPop = api;

  // ------------------------------------------------------------ WebMCP tools
  const mc = navigator.modelContext;
  if (mc && typeof mc.registerTool === 'function') {
    const text = function (t) { return { content: [{ type: 'text', text: t }] }; };
    const tools = [
      {
        name: 'balloonpop_start',
        description: 'Start a Balloon Pop game in turn-based agent mode (the game waits for your moves). ' +
          'freeplay: pop anything but evil balloons, 150 points wins. colors/shapes/numbers/letters: pop the balloon that matches the prompt. ' +
          'learn (numbers/letters only): pop items in order. Returns a description of the screen.',
        inputSchema: {
          type: 'object',
          properties: {
            mode: { type: 'string', enum: ['freeplay', 'colors', 'shapes', 'numbers', 'letters'] },
            level: { type: 'integer', minimum: 1, description: 'Level (learning modes). Default 1.' },
            learn: { type: 'boolean', description: 'Learn in order (numbers/letters).' },
            explore: { type: 'boolean', description: 'Explore mode: no goal, every pop says its name.' }
          },
          required: ['mode']
        },
        execute: function (input) {
          G.setAgentMode(true);
          G.start(Object.assign({ agent: true }, input));
          return G.step(1200).then(function () { return text(G.describe()); });
        }
      },
      {
        name: 'balloonpop_look',
        description: 'Describe the Balloon Pop screen: the target, the score and every visible balloon with its id and whether to pop it.',
        inputSchema: { type: 'object', properties: {} },
        annotations: { readOnlyHint: true },
        execute: function () { return Promise.resolve(text(G.describe())); }
      },
      {
        name: 'balloonpop_pop',
        description: 'Pop one balloon by id (from balloonpop_look). Returns whether it was correct and the updated screen.',
        inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        execute: function (input) {
          const r = G.pop(input.id);
          return G.step(900).then(function () { return text(JSON.stringify(r) + '\n\n' + G.describe()); });
        }
      },
      {
        name: 'balloonpop_pop_all_safe',
        description: 'Pop every visible balloon that should be popped, then let the game run briefly. Returns how many were popped and the updated screen.',
        inputSchema: { type: 'object', properties: {} },
        execute: function () {
          const n = api.popAllSafe();
          return G.step(1200).then(function () { return text('Popped ' + n + '.\n\n' + G.describe()); });
        }
      },
      {
        name: 'balloonpop_wait',
        description: 'Let the game run for a moment so new balloons float up, then describe the screen.',
        inputSchema: { type: 'object', properties: { ms: { type: 'integer', minimum: 200, maximum: 10000 } } },
        execute: function (input) {
          return G.step((input && input.ms) || 1500).then(function () { return text(G.describe()); });
        }
      }
    ];
    tools.forEach(function (t) { try { mc.registerTool(t); } catch (e) { /* older WebMCP builds */ } });
  }
})();

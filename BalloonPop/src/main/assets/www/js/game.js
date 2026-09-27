// Balloon Pop: game modes, levels, balloons, HUD and screens.
(function () {
  const $ = function (s) { return document.querySelector(s); };
  const Sfx = GameAudio.Sfx;
  const Voice = GameAudio.Voice;

  // ------------------------------------------------------------ storage
  const store = {
    get: function (k, d) { try { const v = localStorage.getItem('bp.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('bp.' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const params = new URLSearchParams(location.search);
  const settings = Object.assign(
    { lang: I18N.bestMatch(navigator.language), sound: true, voice: true, speed: 'normal' },
    store.get('settings', {})
  );
  if (params.get('lang') && I18N.LANGS[params.get('lang')]) settings.lang = params.get('lang');
  const progress = store.get('progress', {});      // progress[mode][level] = best stars (1-3)
  const SPEEDS = { slow: 0.65, normal: 1, fast: 1.35 };
  let speedOverride = parseFloat(params.get('speed')) || null;   // numeric speed for agents / tests

  // ------------------------------------------------------------ modes & levels
  const range = function (a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const C = I18N.COLOR_KEYS;
  const S = I18N.SHAPE_KEYS;
  const MODES = {
    freeplay: { color: '#f97316' },
    colors: { cat: 'colors', color: '#ef4444', levels: [['red', 'yellow', 'blue'], ['red', 'yellow', 'blue', 'green', 'orange'], C.slice(0, 7), C] },
    shapes: { cat: 'shapes', color: '#22c55e', levels: [S.slice(0, 3), S.slice(0, 5), S.slice(0, 7), S] },
    numbers: { cat: 'numbers', color: '#3b82f6', levels: [range(1, 5), range(1, 10), range(11, 20), range(1, 20)] },
    letters: { cat: 'letters', color: '#a855f7' }
  };
  const MODE_ORDER = ['freeplay', 'colors', 'shapes', 'numbers', 'letters'];

  function levelsFor(mode) {
    if (mode !== 'letters') return MODES[mode].levels || [];
    const n = I18N.alphabet(settings.lang).length;
    const idx = range(0, n - 1);
    const lv = [];
    for (let i = 0; i < n; i += 6) lv.push(idx.slice(i, i + 6));
    if (lv.length > 1 && lv[lv.length - 1].length < 3) lv[lv.length - 2] = lv[lv.length - 2].concat(lv.pop());
    lv.push(idx);   // final level: the whole alphabet
    return lv;
  }
  function allItems(mode) {
    if (mode === 'colors') return C;
    if (mode === 'shapes') return S;
    if (mode === 'numbers') return range(1, 20);
    if (mode === 'letters') return range(0, I18N.alphabet(settings.lang).length - 1);
    return [];
  }

  const L = function () { return I18N.LANGS[settings.lang]; };
  const t = function (k) { return L().ui[k] || I18N.LANGS.en.ui[k] || k; };

  // Everything the game needs to show and say for one item.
  function describe(mode, key) {
    switch (mode) {
      case 'colors': return { cat: 'colors', key: key, word: L().colors[C.indexOf(key)] };
      case 'shapes': return { cat: 'shapes', key: key, word: L().shapes[S.indexOf(key)] };
      case 'numbers': return { cat: 'numbers', key: key, word: String(key), glyph: String(key) };
      case 'letters': { const ch = I18N.alphabet(settings.lang)[key]; return { cat: 'letters', key: key, word: ch, glyph: ch }; }
    }
  }
  const speakPart = function (d) { return { cat: d.cat, key: d.key, text: d.word }; };
  function praisePart() {
    const i = Math.floor(Math.random() * L().praise.length);
    return { cat: 'praise', key: i, text: L().praise[i] };
  }

  // ------------------------------------------------------------ screens
  let screen = 'home';
  function show(id) {
    screen = id;
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.toggle('active', s.id === 'screen-' + id); });
  }
  function overlay(id, on) { $('#overlay-' + id).hidden = !on; }

  // ------------------------------------------------------------ home
  function modeIcon(mode) {
    switch (mode) {
      case 'freeplay': return Art.balloon({ color: 'orange' });
      case 'colors': return '<svg viewBox="0 0 60 60"><circle cx="22" cy="24" r="14" fill="#ef4444"/><circle cx="38" cy="24" r="14" fill="#3b82f6" opacity=".9"/><circle cx="30" cy="38" r="14" fill="#facc15" opacity=".9"/></svg>';
      case 'shapes': return Art.shapeIcon('star', '#22c55e');
      case 'numbers': return '123';
      case 'letters': return I18N.alphabet(settings.lang).slice(0, 3).join('');
    }
  }
  function hasLearn(mode) { return mode === 'numbers' || mode === 'letters'; }
  function starsTotal(mode) {
    const p = progress[mode] || {};
    let n = 0;
    for (const k in p) n += p[k];
    return n;
  }
  function renderHome() {
    $('#logo').innerHTML = Art.balloon({ color: 'red' }) + Art.balloon({ color: 'yellow' }) + Art.balloon({ color: 'blue' });
    $('#modes').innerHTML = MODE_ORDER.map(function (m) {
      let extra = '';
      if (m === 'freeplay') { const b = store.get('best.freeplay', null); extra = b != null ? '🏆 ' + t('bestScore') + ': ' + b : ''; }
      else { const n = starsTotal(m); extra = n ? '★ ' + n + ' / ' + (levelsFor(m).length + (hasLearn(m) ? 1 : 0)) * 3 : ''; }
      return '<button class="mode-card" data-mode="' + m + '" style="--c:' + MODES[m].color + '">' +
        '<span class="mode-icon">' + modeIcon(m) + '</span><span class="mode-text"><strong>' + t(m) + '</strong><small>' + t(m + 'Desc') + '</small>' +
        '<span class="stars-total">' + extra + '</span></span></button>';
    }).join('');
  }
  $('#modes').addEventListener('click', function (e) {
    const b = e.target.closest('.mode-card');
    if (!b) return;
    Sfx.click();
    if (b.dataset.mode === 'freeplay') start({ mode: 'freeplay' });
    else openLevels(b.dataset.mode);
  });

  // ------------------------------------------------------------ levels
  let levelsMode = null;
  function openLevels(mode) {
    levelsMode = mode;
    renderLevels();
    show('levels');
    Voice.preload(MODES[mode].cat, allItems(mode));
  }
  function levelLabel(mode, items) {
    const first = describe(mode, items[0]).word;
    const last = describe(mode, items[items.length - 1]).word;
    if (mode === 'numbers' || mode === 'letters') return first + '–' + last;
    return items.length + ' ' + t(mode).toLowerCase();
  }
  function renderLevels() {
    const mode = levelsMode;
    $('#levels-title').textContent = t(mode);
    const p = progress[mode] || {};
    const learn = $('#btn-learn');
    learn.hidden = !hasLearn(mode);
    if (hasLearn(mode)) {
      const firstThree = mode === 'numbers' ? '1, 2, 3' : I18N.alphabet(settings.lang).slice(0, 3).join(', ');
      $('#learn-title').textContent = t('learn') + ' ' + firstThree;
      $('#learn-desc').textContent = t(mode === 'numbers' ? 'learnNumbersDesc' : 'learnLettersDesc');
      const ls = p.learn || 0;
      $('#learn-stars').innerHTML = '<b>★</b>'.repeat(ls) + '★'.repeat(3 - ls);
    }
    $('#level-grid').innerHTML = levelsFor(mode).map(function (items, i) {
      const lv = i + 1;
      const unlocked = lv === 1 || (p[lv - 1] || 0) > 0;
      const stars = p[lv] || 0;
      return '<button class="level-btn" data-level="' + lv + '"' + (unlocked ? '' : ' disabled') +
        ' aria-label="' + t('level') + ' ' + lv + (unlocked ? '' : ' 🔒') + '">' +
        '<span class="num">' + (unlocked ? lv : '🔒') + '</span><span class="range">' + levelLabel(mode, items) + '</span>' +
        '<span class="stars">' + '<b>★</b>'.repeat(stars) + '★'.repeat(3 - stars) + '</span></button>';
    }).join('');
  }
  $('#level-grid').addEventListener('click', function (e) {
    const b = e.target.closest('.level-btn');
    if (!b || b.disabled) return;
    Sfx.click();
    start({ mode: levelsMode, level: +b.dataset.level });
  });
  $('#btn-learn').addEventListener('click', function () { Sfx.click(); start({ mode: levelsMode, learn: true }); });
  $('#btn-explore').addEventListener('click', function () { Sfx.click(); start({ mode: levelsMode, explore: true }); });
  $('#btn-levels-back').addEventListener('click', function () { Sfx.click(); renderHome(); show('home'); });

  // ------------------------------------------------------------ game state
  const stage = $('#stage');
  let G = null;
  let seq = 0;

  function speedMul() {
    return speedOverride || SPEEDS[settings.speed] || 1;
  }

  function start(opts) {
    stopGame();
    const mode = opts.mode;
    const levels = levelsFor(mode);
    const learn = !!opts.learn && hasLearn(mode);
    const explore = !!opts.explore && !learn;
    const level = mode === 'freeplay' || explore || learn ? 0 : Math.max(1, Math.min(opts.level || 1, levels.length));
    G = {
      mode: mode, level: level, explore: explore, learn: learn, idx: 0,
      items: mode === 'freeplay' ? [] : explore || learn ? allItems(mode) : levels[level - 1],
      goal: Math.min(12, 5 + level * 2),
      target: null, correct: 0, mistakes: 0, score: 0, popped: 0,
      timeLeft: 180000, status: 'playing', spawnAcc: 99999, last: 0,
      balloons: new Map(), lanes: []
    };
    stage.innerHTML = '';
    stage.classList.remove('paused');
    overlay('result', false);
    overlay('pause', false);
    show('game');
    layout();
    if (MODES[mode].cat) Voice.preload(MODES[mode].cat, G.items);
    Voice.preload('praise', [0, 1, 2, 3]);
    if (G.learn) { setLearnTarget(); Voice.say(speakPart(describe(mode, G.target))); }
    else if (mode !== 'freeplay' && !G.explore) nextTarget(false);
    else setPrompt(null);
    renderStats();
    G.raf = requestAnimationFrame(tick);
  }

  function stopGame() {
    if (!G) return;
    cancelAnimationFrame(G.raf);
    Voice.stop();
    G = null;
  }

  function tick(now) {
    if (!G) return;
    const dt = G.last ? Math.min(100, now - G.last) : 16;
    G.last = now;
    if (G.status === 'playing') {
      G.spawnAcc += dt;
      const interval = (G.mode === 'freeplay' ? 480 : 1150) / speedMul();
      if (G.spawnAcc >= interval) { G.spawnAcc = 0; spawn(); }
      if (G.mode === 'freeplay') {
        G.timeLeft -= dt;
        renderStats();
        if (G.timeLeft <= 0) { G.timeLeft = 0; finish('lost', 'timeUp'); }
      }
    }
    G.raf = requestAnimationFrame(tick);
  }

  // ------------------------------------------------------------ layout & balloons
  let W = 0, H = 0, BW = 80;
  function layout() {
    W = stage.clientWidth || window.innerWidth;
    H = stage.clientHeight || window.innerHeight;
    BW = Math.round(Math.max(64, Math.min(132, W * 0.16, H * 0.2)));
    stage.style.setProperty('--bw', BW + 'px');
    stage.style.setProperty('--rise', -(H + 10) + 'px');
  }
  window.addEventListener('resize', layout);

  function maxOnScreen() {
    const fit = W / BW;
    return G.mode === 'freeplay' ? Math.max(4, Math.min(12, Math.round(fit * 1.3))) : Math.max(3, Math.min(8, Math.round(fit)));
  }

  function pickX() {
    const lanes = Math.max(2, Math.floor(W / (BW * 0.95)));
    const laneW = W / lanes;
    const recent = G.lanes.slice(-Math.floor(lanes / 2));
    let lane, tries = 0;
    do { lane = Math.floor(Math.random() * lanes); } while (recent.indexOf(lane) !== -1 && ++tries < 10);
    G.lanes.push(lane);
    if (G.lanes.length > 10) G.lanes.shift();
    return lane * laneW + Math.random() * Math.max(0, laneW - BW);
  }

  const pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  function spawn() {
    if (G.balloons.size >= maxOnScreen()) return;
    const data = { id: 'balloon-' + (++seq) };

    if (G.mode === 'freeplay') {
      data.kind = Math.random() < 1 / 8 ? 'evil' : Math.random() < 1 / 30 ? 'heart' : 'normal';
      data.color = pick(Art.BRIGHT);
    } else {
      let key;
      if (G.explore) key = pick(G.items);
      else if (G.learn) {
        // The next item in the sequence, mixed with its neighbours so order matters.
        const targetOnScreen = Array.from(G.balloons.values()).some(function (b) { return b.key === G.target; });
        const near = G.items.slice(Math.max(0, G.idx - 2), G.idx + 4).filter(function (k) { return k !== G.target; });
        key = !targetOnScreen || Math.random() < 0.45 || !near.length ? G.target : pick(near);
      } else {
        const targetOnScreen = Array.from(G.balloons.values()).some(function (b) { return b.key === G.target; });
        const others = G.items.filter(function (k) { return k !== G.target; });
        key = !targetOnScreen || Math.random() < 0.35 || !others.length ? G.target : pick(others);
      }
      data.key = key;
      data.kind = 'normal';
      data.color = G.mode === 'colors' ? key : pick(Art.BRIGHT);
      data.info = describe(G.mode, key);
    }

    const el = document.createElement('div');
    el.className = 'balloon';
    el.id = data.id;
    el.setAttribute('role', 'button');
    el.dataset.kind = data.kind;
    el.setAttribute('aria-label', ariaLabel(data));
    const dur = (G.mode === 'freeplay' ? 7 : 9.5 / (1 + (G.level - 1) * 0.12)) / speedMul();
    el.style.cssText = 'left:' + pickX().toFixed(0) + 'px;--dur:' + dur.toFixed(2) + 's;--sway:' + (1.6 + Math.random() * 1.4).toFixed(2) + 's';
    el.innerHTML = '<div class="sway">' + Art.balloon({
      color: data.color, kind: data.kind,
      shape: G.mode === 'shapes' ? data.key : null,
      text: data.info && data.info.glyph != null ? data.info.glyph : null,
      face: G.mode === 'freeplay' || G.mode === 'colors'
    }) + '</div>';

    el.addEventListener('pointerdown', onPop);
    if (G.mode === 'freeplay') {
      // The original game pops balloons by hovering with the mouse.
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') onPop.call(el, e); });
    }
    el.addEventListener('animationend', function (e) {
      if (e.animationName === 'bp-rise') { el.remove(); if (G) G.balloons.delete(data.id); }
    });
    data.el = el;
    G.balloons.set(data.id, data);
    stage.appendChild(el);
  }

  function ariaLabel(d) {
    if (d.kind === 'evil') return 'Evil balloon - do NOT pop (-10 points)';
    if (d.kind === 'heart') return 'Heart balloon (+5 points)';
    if (d.info) return d.info.word + ' balloon';
    return d.color + ' balloon (+1 point)';
  }

  // ------------------------------------------------------------ popping
  function onPop(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!G || G.status !== 'playing') return;
    const data = G.balloons.get(this.id);
    if (!data || data.popped) return;
    popBalloon(data);
  }

  function popBalloon(data) {
    if (G.learn && data.key !== G.target) {
      G.mistakes++;
      Sfx.wrong();
      data.el.classList.remove('wrong'); void data.el.offsetWidth; data.el.classList.add('wrong');
      const pr = $('#prompt');
      pr.classList.remove('shake'); void pr.offsetWidth; pr.classList.add('shake');
      Voice.say(speakPart(describe(G.mode, G.target)));
      renderStats();
      return { type: data.kind, points: 0, correct: false, score: G.score };
    }
    data.popped = true;
    G.balloons.delete(data.id);
    const el = data.el;
    const r = el.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const x = r.left - s.left + r.width / 2;
    const y = r.top - s.top + r.width * 0.55;
    el.classList.add('popping');
    setTimeout(function () { el.remove(); }, 500);
    const hex = data.kind === 'evil' ? '#dc2626' : data.kind === 'heart' ? '#ec4899' : Art.COLORS[data.color];
    burst(x, y, hex);
    Sfx.balloon(data.kind);
    let result = { type: data.kind, points: 0 };

    if (G.mode === 'freeplay') {
      if (data.kind === 'evil') { G.score -= 10; floatText(x, y, '-10', true); shakeStage(); result.points = -10; }
      else if (data.kind === 'heart') { G.score += 5; floatText(x, y, '+5 ♥'); result.points = 5; }
      else { G.score += 1; floatText(x, y, '+1'); result.points = 1; }
      G.popped++;
      renderStats();
      if (G.score >= 150) finish('won');
      else if (G.score < -100) finish('lost', 'tooLow');
    } else if (G.learn) {
      G.correct++;
      G.idx++;
      Sfx.correct();
      floatText(x, y, data.info.word);
      Voice.say(speakPart(data.info));   // count / spell along out loud
      result.correct = true;
      result.points = 1;
      renderStats();
      if (G.idx >= G.items.length) finish('won');
      else setLearnTarget();
    } else if (G.explore) {
      G.popped++;
      Voice.say(speakPart(data.info));
      floatText(x, y, data.info.word);
      renderStats();
      result.points = 1;
    } else if (data.key === G.target) {
      G.correct++;
      Sfx.correct();
      floatText(x, y, '★');
      result.correct = true;
      result.points = 1;
      renderStats();
      if (G.correct >= G.goal) finish('won');
      else nextTarget(true);
    } else {
      G.mistakes++;
      Sfx.wrong();
      floatText(x, y, data.info.word, true);
      const p = $('#prompt');
      p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake');
      Voice.say([speakPart(data.info), { pause: 300 }, speakPart(describe(G.mode, G.target))]);
      result.correct = false;
      renderStats();
    }
    result.score = G.score;
    return result;
  }

  function burst(x, y, color) {
    const b = document.createElement('div');
    b.className = 'burst';
    b.style.cssText = 'left:' + x + 'px;top:' + y + 'px;--c:' + color;
    let html = '';
    for (let i = 0; i < 12; i++) {
      const a = Math.PI * 2 * i / 12 + Math.random() * 0.4;
      const d = BW * (0.6 + Math.random() * 0.7);
      html += '<i style="--dx:' + (Math.cos(a) * d).toFixed(0) + 'px;--dy:' + (Math.sin(a) * d).toFixed(0) + 'px"></i>';
    }
    b.innerHTML = html;
    const ring = document.createElement('div');
    ring.className = 'ring';
    ring.style.cssText = 'left:' + x + 'px;top:' + y + 'px;--c:' + color;
    stage.appendChild(b);
    stage.appendChild(ring);
    setTimeout(function () { b.remove(); ring.remove(); }, 700);
  }

  function floatText(x, y, text, bad) {
    const f = document.createElement('div');
    f.className = 'float-text' + (bad ? ' bad' : '');
    f.style.left = x + 'px';
    f.style.top = y + 'px';
    f.textContent = text;
    stage.appendChild(f);
    setTimeout(function () { f.remove(); }, 900);
  }

  function shakeStage() {
    stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
    if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) {}
  }

  // ------------------------------------------------------------ prompt & HUD
  function nextTarget(praise) {
    const choices = G.items.length > 1 ? G.items.filter(function (k) { return k !== G.target; }) : G.items;
    G.target = pick(choices);
    const d = describe(G.mode, G.target);
    setPrompt(d);
    const parts = praise ? [praisePart(), { pause: 250 }, speakPart(d)] : [speakPart(d)];
    Voice.say(parts);
  }

  function setLearnTarget() {
    G.target = G.items[G.idx];
    const d = describe(G.mode, G.target);
    const cells = [];
    for (let i = G.idx - 2; i <= G.idx + 2; i++) {
      if (i < 0 || i >= G.items.length) { cells.push('<span class="cell empty"></span>'); continue; }
      const cls = i < G.idx ? 'done' : i === G.idx ? 'now' : 'later';
      cells.push('<span class="cell ' + cls + '">' + describe(G.mode, G.items[i]).glyph + '</span>');
    }
    let dots = '';
    if (G.mode === 'numbers') {
      for (let i = 0; i < G.target; i++) dots += '<i></i>';
      dots = '<span class="dots" aria-hidden="true">' + dots + '</span>';
    }
    const p = $('#prompt');
    p.innerHTML = '<span class="track">' + cells.join('') + '</span>' + dots + '<span class="p-speaker">🔊</span>';
    p.setAttribute('aria-label', t('find') + ' ' + d.word + '. ' + t('tapToHear'));
    p.classList.remove('bounce'); void p.offsetWidth; p.classList.add('bounce');
  }

  function setPrompt(d) {
    const p = $('#prompt');
    if (!d) { p.innerHTML = ''; return; }
    let icon;
    if (d.cat === 'colors') icon = '<span class="p-icon" style="background:' + Art.COLORS[d.key] + (d.key === 'white' ? ';border:2px solid #cbd5e1' : '') + '"></span>';
    else if (d.cat === 'shapes') icon = '<span class="p-icon">' + Art.shapeIcon(d.key, '#334155') + '</span>';
    else icon = '<span class="p-icon glyph">' + d.glyph + '</span>';
    // Numbers and letters already show the glyph in the icon, so don't repeat it as a word.
    const word = d.glyph != null ? '' : '<span class="p-word">' + d.word + '</span>';
    p.innerHTML = icon + '<span class="p-label">' + t('find') + '</span>' + word + '<span class="p-speaker">🔊</span>';
    p.setAttribute('aria-label', t('find') + ' ' + d.word + '. ' + t('tapToHear'));
    p.classList.remove('bounce'); void p.offsetWidth; p.classList.add('bounce');
  }
  $('#prompt').addEventListener('click', function () {
    if (G && G.target != null) Voice.say(speakPart(describe(G.mode, G.target)));
  });

  function renderStats() {
    const s = $('#stats');
    if (!G) return;
    if (G.mode === 'freeplay') {
      const sec = Math.ceil(G.timeLeft / 1000);
      const time = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
      s.innerHTML = '<span class="stat' + (G.score < 0 ? ' bad' : '') + '">' + G.score + '<small>' + t('score') + ' / 150</small></span>' +
        '<span class="stat' + (sec <= 15 ? ' low' : '') + '">' + time + '<small>' + t('time') + '</small></span>';
    } else if (G.learn) {
      s.innerHTML = '<span class="stat">' + G.idx + ' / ' + G.items.length + '<small>' + t('learn') + '</small></span>';
    } else if (G.explore) {
      s.innerHTML = '<span class="stat">' + G.popped + '<small>' + t('popped') + '</small></span>';
    } else {
      let dots = '';
      for (let i = 0; i < G.goal; i++) dots += '<i class="' + (i < G.correct ? 'on' : '') + '"></i>';
      s.innerHTML = '<span class="stat">' + t('level') + ' ' + G.level + '<small><span class="progress" aria-label="' + G.correct + ' / ' + G.goal + '">' + dots + '</span></small></span>';
    }
  }

  // ------------------------------------------------------------ pause / finish
  function pause() {
    if (!G || G.status !== 'playing') return;
    G.status = 'paused';
    stage.classList.add('paused');
    Voice.stop();
    overlay('pause', true);
    $('#btn-resume').focus();
  }
  function resume() {
    if (!G || G.status !== 'paused') return;
    G.status = 'playing';
    G.last = 0;
    stage.classList.remove('paused');
    overlay('pause', false);
  }
  $('#btn-pause').addEventListener('click', function () { Sfx.click(); pause(); });
  $('#btn-resume').addEventListener('click', function () { Sfx.click(); resume(); });
  $('#btn-restart').addEventListener('click', function () { Sfx.click(); restart(); });
  $('#btn-quit').addEventListener('click', function () { Sfx.click(); goHome(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });

  function restart() { if (G) start({ mode: G.mode, level: G.level, explore: G.explore, learn: G.learn }); }
  function goHome() {
    const mode = G && G.mode;
    stopGame();
    overlay('pause', false);
    overlay('result', false);
    stage.innerHTML = '';
    if (mode && mode !== 'freeplay') openLevels(mode);
    else { renderHome(); show('home'); }
  }

  function finish(result, reason) {
    G.status = result;
    G.balloons.forEach(function (b) { b.el.classList.add('popping'); });
    const title = $('#result-title');
    const starsEl = $('#result-stars');
    const detail = $('#result-detail');
    const next = $('#btn-next');
    let stars = 0;

    if (G.mode === 'freeplay') {
      const best = store.get('best.freeplay', null);
      const score = G.score;
      if (best == null || score > best) store.set('best.freeplay', score);
      title.textContent = result === 'won' ? t('youWin') : t(reason);
      stars = result === 'won' ? (G.timeLeft > 60000 ? 3 : G.timeLeft > 20000 ? 2 : 1) : 0;
      detail.textContent = t('score') + ': ' + score + (best != null ? ' · ' + t('bestScore') + ': ' + Math.max(best, score) : '');
      next.hidden = true;
      $('#btn-result-back').textContent = t('home');
    } else {
      stars = G.mistakes <= 1 ? 3 : G.mistakes <= 4 ? 2 : 1;
      const p = progress[G.mode] = progress[G.mode] || {};
      const slot = G.learn ? 'learn' : G.level;
      p[slot] = Math.max(p[slot] || 0, stars);
      store.set('progress', progress);
      title.textContent = t('levelComplete');
      detail.textContent = t('mistakes') + ': ' + G.mistakes;
      next.hidden = G.learn || G.level >= levelsFor(G.mode).length;
      $('#btn-result-back').textContent = t('levels');
    }
    starsEl.innerHTML = [1, 2, 3].map(function (i) {
      return '<span class="' + (i <= stars ? 'on' : '') + '" style="animation-delay:' + (0.25 + i * 0.25) + 's">★</span>';
    }).join('');

    const finished = G;
    setTimeout(function () {
      if (G !== finished) return;   // a new game started in the meantime
      overlay('result', true);
      (next.hidden ? $('#btn-again') : next).focus();
      if (result === 'won') {
        Sfx.win();
        confetti();
        Voice.say(praisePart());
        for (let i = 0; i < stars; i++) setTimeout(function () { Sfx.star(i); }, 600 + i * 250);
      } else Sfx.lose();
    }, 450);
  }
  $('#btn-next').addEventListener('click', function () { Sfx.click(); start({ mode: G.mode, level: G.level + 1 }); });
  $('#btn-again').addEventListener('click', function () { Sfx.click(); restart(); });
  $('#btn-result-back').addEventListener('click', function () { Sfx.click(); goHome(); });

  // ------------------------------------------------------------ confetti
  function confetti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confetti');
    const cx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    cx.scale(dpr, dpr);
    const colors = Object.values(Art.COLORS).filter(function (c) { return c !== '#1f2937'; });
    const bits = [];
    for (let i = 0; i < 160; i++) {
      bits.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5, vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: pick(colors) });
    }
    const t0 = performance.now();
    (function frame(now) {
      cx.clearRect(0, 0, innerWidth, innerHeight);
      bits.forEach(function (b) {
        b.x += b.vx; b.y += b.vy; b.vy += 0.04; b.r += b.vr;
        cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
      });
      if (now - t0 < 3500) requestAnimationFrame(frame);
      else cx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  // ------------------------------------------------------------ settings & i18n
  function applyLanguage() {
    const lang = L();
    document.documentElement.lang = settings.lang;
    document.documentElement.dir = lang.dir || 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.title = t(el.dataset.i18nTitle); });
    GameAudio.settings.lang = settings.lang;
    renderHome();
    if (levelsMode) renderLevels();
    updateVoiceHint();
  }
  function saveSettings() {
    store.set('settings', settings);
    GameAudio.settings.sound = settings.sound;
    GameAudio.settings.voice = settings.voice;
  }
  function updateVoiceHint() {
    const h = $('#voice-hint');
    const ok = Voice.available(settings.lang);
    h.hidden = ok;
    h.textContent = ok ? '' : t('noVoice');
  }
  function renderSettings() {
    $('#set-lang').innerHTML = Object.keys(I18N.LANGS).map(function (k) {
      return '<option value="' + k + '"' + (k === settings.lang ? ' selected' : '') + '>' + I18N.LANGS[k].name + '</option>';
    }).join('');
    $('#set-sound').checked = settings.sound;
    $('#set-voice').checked = settings.voice;
    document.querySelectorAll('#set-speed button').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.speed === settings.speed)); });
    updateVoiceHint();
  }
  $('#btn-settings').addEventListener('click', function () { Sfx.click(); renderSettings(); overlay('settings', true); $('#set-lang').focus(); });
  $('#btn-settings-close').addEventListener('click', function () { Sfx.click(); overlay('settings', false); });
  $('#set-lang').addEventListener('change', function (e) {
    settings.lang = e.target.value; saveSettings(); applyLanguage();
    Voice.ready.then(function () { Voice.say(praisePart()); });
  });
  $('#set-sound').addEventListener('change', function (e) { settings.sound = e.target.checked; saveSettings(); Sfx.click(); });
  $('#set-voice').addEventListener('change', function (e) { settings.voice = e.target.checked; saveSettings(); });
  $('#set-speed').addEventListener('click', function (e) {
    const b = e.target.closest('button');
    if (!b) return;
    settings.speed = b.dataset.speed; speedOverride = null; saveSettings(); renderSettings(); Sfx.click();
  });

  // Close overlays with Escape; pause with Escape during play; space repeats the prompt.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!$('#overlay-settings').hidden) overlay('settings', false);
      else if (G && G.status === 'playing') pause();
      else if (G && G.status === 'paused') resume();
    } else if ((e.key === ' ' || e.key === 'Enter') && G && G.status === 'playing' && document.activeElement === document.body) {
      e.preventDefault();
      $('#prompt').click();
    }
  });

  // ------------------------------------------------------------ clouds
  function makeClouds() {
    const box = $('#clouds');
    let html = '';
    for (let i = 0; i < 5; i++) {
      const w = 120 + Math.random() * 180;
      const dur = 60 + Math.random() * 80;
      html += '<div class="cloud" style="top:' + (5 + i * 15 + Math.random() * 6) + '%;width:' + w.toFixed(0) + 'px;' +
        'animation-duration:' + dur.toFixed(0) + 's;animation-delay:-' + (Math.random() * dur).toFixed(0) + 's">' + Art.cloud(w) + '</div>';
    }
    box.innerHTML = html;
  }

  // ------------------------------------------------------------ boot
  saveSettings();
  makeClouds();
  applyLanguage();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  // Deep links, e.g. ?mode=colors&level=2, ?mode=letters&explore=1 or ?mode=numbers&learn=1
  const deepMode = params.get('mode');
  if (MODES[deepMode]) {
    if (deepMode === 'freeplay' || params.get('level') || params.get('explore') || params.get('learn')) {
      start({ mode: deepMode, level: +params.get('level') || 1, explore: params.get('explore') === '1', learn: params.get('learn') === '1' });
    } else openLevels(deepMode);
  }

  // ------------------------------------------------------------ API for agents (see agent-api.js)
  window.BalloonGame = {
    modes: function () {
      return MODE_ORDER.map(function (m) {
        return { mode: m, levels: m === 'freeplay' ? 1 : levelsFor(m).length, explore: m !== 'freeplay', learn: hasLearn(m) };
      });
    },
    state: function () {
      const st = { screen: screen, language: settings.lang, speed: speedMul() };
      if (!G) return Object.assign(st, { status: 'menu' });
      const sr = stage.getBoundingClientRect();
      return Object.assign(st, {
        status: G.status, mode: G.mode, level: G.level, explore: G.explore, learn: G.learn,
        target: G.target == null ? null : { key: G.target, word: describe(G.mode, G.target).word },
        score: G.score, goal: G.mode === 'freeplay' ? 150 : G.explore ? null : G.learn ? G.items.length : G.goal,
        correct: G.correct, mistakes: G.mistakes, popped: G.popped,
        timeLeft: G.mode === 'freeplay' ? Math.ceil(G.timeLeft / 1000) : null,
        balloons: Array.from(G.balloons.values()).map(function (b) {
          const r = b.el.getBoundingClientRect();
          const isTarget = G.target != null && b.key === G.target;
          return {
            id: b.id, kind: b.kind, color: b.color,
            value: b.info ? b.info.word : null, key: b.key == null ? null : b.key,
            isTarget: isTarget,
            shouldPop: G.mode === 'freeplay' ? b.kind !== 'evil' : G.explore ? true : isTarget,
            x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.width * 0.55),
            visible: r.bottom > sr.top && r.top < sr.bottom
          };
        })
      });
    },
    start: function (o) { o = o || {}; if (o.speed) speedOverride = +o.speed; start({ mode: o.mode || 'freeplay', level: o.level, explore: o.explore, learn: o.learn }); },
    pop: function (id) {
      if (!G || G.status !== 'playing') return { ok: false, error: 'No game in progress' };
      const d = G.balloons.get(id);
      if (!d) return { ok: false, error: 'No balloon with id ' + id + ' (it may have floated away)' };
      return Object.assign({ ok: true }, popBalloon(d));
    },
    pause: pause,
    resume: resume,
    home: goHome,
    setSpeed: function (n) { n = +n; if (!(n > 0)) throw new Error('speed must be a positive number'); speedOverride = n; return n; },
    setLanguage: function (l) { if (!I18N.LANGS[l]) throw new Error('Unknown language ' + l); settings.lang = l; saveSettings(); applyLanguage(); return l; },
    languages: function () { return Object.keys(I18N.LANGS); }
  };
})();

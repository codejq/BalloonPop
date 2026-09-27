// Sound for Balloon Pop.
//  - Sfx:   every sound effect is synthesised with the Web Audio API (no audio files needed).
//  - Voice: spoken words come from pre-rendered clips in voices/<lang>/ (see tools/generate_voices.py).
//           Clips are decoded once and kept in memory; the service worker keeps the files offline.
//           Languages without clips fall back to live text-to-speech (Android bridge or speechSynthesis).
(function () {
  let ctx = null;
  let master = null;
  const settings = { sound: true, voice: true, lang: 'en' };

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Browsers only allow audio after a user gesture, so unlock on the first one.
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, ac, { once: true, passive: true });
  });

  function tone(opts) {
    const c = ac();
    if (!c || !settings.sound) return;
    const t = c.currentTime + (opts.delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(opts.from, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + opts.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.vol || 0.3, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + opts.dur + 0.05);
  }

  let noiseBuf = null;
  function noise(dur, freq, vol) {
    const c = ac();
    if (!c || !settings.sound) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(freq, t);
    f.frequency.exponentialRampToValueAtTime(freq / 3, t + dur);
    f.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur);
  }

  // Custom sound files from sounds/sounds.js override the synthesised pop / heart / evil sounds.
  const custom = window.CUSTOM_SOUNDS || {};
  function playFile(name) {
    const url = custom[name];
    if (!url || !settings.sound) return false;
    load(url).then(function (clip) {
      if (clip instanceof AudioBuffer) {
        const src = ctx.createBufferSource();
        src.buffer = clip;
        src.connect(master);
        src.start();
      } else {
        const a = clip.cloneNode();   // clones let quick pops overlap
        a.volume = 0.6;
        a.play().catch(function () {});
      }
    });
    return true;
  }

  const Sfx = {
    // The sound for popping one balloon: a custom file if configured, otherwise synthesised.
    balloon: function (kind) {
      if (kind === 'evil') { if (!playFile('evil')) { Sfx.pop(); Sfx.evil(); } }
      else if (kind === 'heart') { if (!playFile('heart')) { Sfx.pop(); Sfx.heart(); } }
      else if (!playFile('pop')) Sfx.pop();
    },
    pop: function () {
      noise(0.12, 2600 + Math.random() * 1200, 0.9);
      tone({ from: 700 + Math.random() * 300, to: 180, dur: 0.09, vol: 0.25, type: 'triangle' });
    },
    correct: function () {
      tone({ from: 880, dur: 0.14, vol: 0.18 });
      tone({ from: 1318.5, dur: 0.22, vol: 0.18, delay: 0.09 });
    },
    wrong: function () {
      tone({ from: 320, to: 140, dur: 0.35, vol: 0.25, type: 'sine' });
      tone({ from: 330, to: 150, dur: 0.35, vol: 0.12, type: 'triangle', delay: 0.02 });
    },
    evil: function () {
      tone({ from: 220, to: 70, dur: 0.45, vol: 0.2, type: 'sawtooth' });
      noise(0.3, 900, 0.5);
    },
    heart: function () {
      [659.3, 830.6, 987.8, 1318.5].forEach(function (f, i) { tone({ from: f, dur: 0.18, vol: 0.14, delay: i * 0.06 }); });
    },
    click: function () { tone({ from: 1200, to: 900, dur: 0.05, vol: 0.12, type: 'triangle' }); },
    star: function (i) { tone({ from: 1046.5 * Math.pow(1.26, i || 0), dur: 0.25, vol: 0.16, type: 'triangle' }); },
    win: function () {
      [523.3, 659.3, 784, 1046.5, 784, 1046.5].forEach(function (f, i) {
        tone({ from: f, dur: i === 5 ? 0.6 : 0.16, vol: 0.18, type: 'triangle', delay: i * 0.12 });
      });
    },
    lose: function () {
      [392, 349.2, 311.1, 261.6].forEach(function (f, i) { tone({ from: f, dur: 0.3, vol: 0.16, type: 'triangle', delay: i * 0.2 }); });
    }
  };

  // ---------------------------------------------------------------- voice
  // voices/manifest.js (loaded before this file) lists the languages that have clips.
  let manifest = window.VOICE_MANIFEST || { langs: {} };
  const manifestReady = window.VOICE_MANIFEST ? Promise.resolve() : fetch('voices/manifest.json')
    .then(function (r) { return r.ok ? r.json() : manifest; })
    .then(function (m) { manifest = m; })
    .catch(function () {});

  const buffers = new Map();   // url -> Promise<AudioBuffer | HTMLAudioElement>
  let current = null;          // what is playing now
  let queueToken = 0;

  function hasClips(lang) { return !!(manifest.langs && manifest.langs[lang]); }
  function clipUrl(lang, cat, key) {
    return 'voices/' + lang + '/' + cat + '/' + key + '.mp3?v=' + (manifest.version || 1);
  }

  function load(url) {
    if (buffers.has(url)) return buffers.get(url);
    const c = ac();
    const p = fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (data) {
        if (!c) throw new Error('no audio context');
        return new Promise(function (res, rej) { c.decodeAudioData(data, res, rej); });
      })
      .catch(function () {
        // file:// (Android WebView) cannot fetch, so use a preloaded <audio> element instead.
        const a = new Audio(url);
        a.preload = 'auto';
        return a;
      });
    buffers.set(url, p);
    return p;
  }

  function stopCurrent() {
    if (!current) return;
    try { current.stop ? current.stop() : (current.pause(), current.currentTime = 0); } catch (e) {}
    current = null;
  }

  function playClip(url) {
    return load(url).then(function (clip) {
      return new Promise(function (resolve) {
        if (clip instanceof AudioBuffer) {
          const src = ctx.createBufferSource();
          src.buffer = clip;
          const g = ctx.createGain();
          g.gain.value = 1.4;
          src.connect(g).connect(ctx.destination);
          src.onended = resolve;
          current = src;
          src.start();
        } else {
          current = clip;
          clip.currentTime = 0;
          clip.onended = resolve;
          clip.play().catch(resolve);
        }
      });
    });
  }

  function speakLive(text) {
    const L = I18N.LANGS[settings.lang];
    if (window.android && typeof window.android.speak === 'function') {
      try { window.android.speak(String(text), L.speech); } catch (e) {}
      return new Promise(function (r) { setTimeout(r, 400 + String(text).length * 70); });
    }
    if (!('speechSynthesis' in window)) return Promise.resolve();
    return new Promise(function (resolve) {
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = L.speech;
      const v = pickVoice(settings.lang);
      if (v) u.voice = v;
      u.rate = 0.9;
      u.pitch = 1.15;
      u.onend = u.onerror = resolve;
      speechSynthesis.speak(u);
      setTimeout(resolve, 4000);
    });
  }

  const voiceCache = {};
  function pickVoice(lang) {
    if (!('speechSynthesis' in window)) return null;
    if (voiceCache[lang] !== undefined) return voiceCache[lang];
    const all = speechSynthesis.getVoices();
    if (!all.length) return null;
    const tag = I18N.LANGS[lang].speech.toLowerCase();
    const same = all.filter(function (v) { return v.lang.toLowerCase().replace('_', '-').indexOf(lang) === 0; });
    voiceCache[lang] = same.find(function (v) { return v.lang.toLowerCase().replace('_', '-') === tag; }) || same[0] || null;
    return voiceCache[lang];
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function () { for (const k in voiceCache) delete voiceCache[k]; };
  }

  const Voice = {
    ready: manifestReady,
    hasClips: hasClips,

    // Is any voice available for this language? (pre-rendered clips always count)
    available: function (lang) {
      if (hasClips(lang)) return true;
      if (window.android && window.android.speak) return true;
      if (!('speechSynthesis' in window)) return false;
      return speechSynthesis.getVoices().length === 0 || !!pickVoice(lang);
    },

    // Decode a category's clips ahead of time so the first word plays instantly.
    preload: function (cat, keys) {
      manifestReady.then(function () {
        if (!hasClips(settings.lang)) return;
        keys.forEach(function (k) { load(clipUrl(settings.lang, cat, k)); });
      });
    },

    // Speak a sequence of {cat, key, text} parts; a new call interrupts the previous one.
    say: function (parts) {
      parts = [].concat(parts);
      const token = ++queueToken;
      stopCurrent();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      if (!settings.voice) return Promise.resolve();
      return manifestReady.then(function () {
        return parts.reduce(function (p, part) {
          return p.then(function () {
            if (token !== queueToken) return;
            if (part.pause) return new Promise(function (r) { setTimeout(r, part.pause); });
            if (hasClips(settings.lang) && part.cat) return playClip(clipUrl(settings.lang, part.cat, part.key));
            return speakLive(part.text);
          });
        }, Promise.resolve());
      });
    },

    stop: function () {
      queueToken++;
      stopCurrent();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      if (window.android && window.android.stopSpeaking) { try { window.android.stopSpeaking(); } catch (e) {} }
    }
  };

  // Decode custom sounds early so the first pop plays without delay.
  ['pop', 'heart', 'evil'].forEach(function (n) { if (custom[n]) load(custom[n]); });

  window.GameAudio = { Sfx: Sfx, Voice: Voice, settings: settings, unlock: ac };
})();

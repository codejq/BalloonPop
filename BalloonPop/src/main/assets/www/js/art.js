// All game artwork is drawn here as SVG, so it stays sharp on every screen size.
(function () {
  const COLORS = {
    red: '#ef4444', orange: '#fb923c', yellow: '#facc15', green: '#22c55e', blue: '#3b82f6',
    purple: '#a855f7', pink: '#f472b6', white: '#f8fafc', black: '#1f2937'
  };
  const BRIGHT = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

  function starPoints(cx, cy, outer, inner, n) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = Math.PI / n * i - Math.PI / 2;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  // Shapes are drawn around (50, 56) inside a 100-wide balloon.
  function shape(name, fill) {
    const a = 'fill="' + fill + '" stroke="rgba(0,0,0,.18)" stroke-width="2" stroke-linejoin="round"';
    switch (name) {
      case 'circle': return '<circle cx="50" cy="56" r="21" ' + a + '/>';
      case 'square': return '<rect x="30" y="36" width="40" height="40" rx="3" ' + a + '/>';
      case 'triangle': return '<path d="M50 31 L75 76 L25 76 Z" ' + a + '/>';
      case 'star': return '<polygon points="' + starPoints(50, 58, 26, 11, 5) + '" ' + a + '/>';
      case 'heart': return '<path d="M50 79 C22 60 24 35 40 36 C46 36 50 41 50 45 C50 41 54 36 60 36 C76 35 78 60 50 79 Z" ' + a + '/>';
      case 'diamond': return '<path d="M50 29 L73 56 L50 83 L27 56 Z" ' + a + '/>';
      case 'rectangle': return '<rect x="22" y="42" width="56" height="28" rx="3" ' + a + '/>';
      case 'oval': return '<ellipse cx="50" cy="56" rx="27" ry="17" ' + a + '/>';
    }
    return '';
  }

  function face(evil) {
    const pupil = evil ? '#b91c1c' : '#1f2937';
    let s = '<g class="face">' +
      '<g class="eyes"><circle cx="36" cy="46" r="9" fill="#fff"/><circle cx="64" cy="46" r="9" fill="#fff"/>' +
      '<circle cx="37" cy="47" r="4.2" fill="' + pupil + '"/><circle cx="65" cy="47" r="4.2" fill="' + pupil + '"/>' +
      '<circle cx="38.5" cy="45.5" r="1.4" fill="#fff"/><circle cx="66.5" cy="45.5" r="1.4" fill="#fff"/></g>';
    if (evil) {
      s += '<path d="M25 33 L45 40 M75 33 L55 40" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M36 72 Q50 62 64 72" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round"/>';
    } else {
      s += '<circle cx="28" cy="62" r="5" fill="#fff" opacity=".28"/><circle cx="72" cy="62" r="5" fill="#fff" opacity=".28"/>' +
        '<path d="M38 64 Q50 76 62 64" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    return s + '</g>';
  }

  const BODY = 'M50 4 C23 4 6 25 6 52 C6 81 31 103 50 107 C69 103 94 81 94 52 C94 25 77 4 50 4 Z';
  const HEART_BODY = 'M50 104 C14 78 2 48 16 26 C28 8 46 14 50 28 C54 14 72 8 84 26 C98 48 86 78 50 104 Z';

  // opts: {color, kind: 'normal'|'evil'|'heart', face: bool, shape, text}
  function balloon(opts) {
    const kind = opts.kind || 'normal';
    const fill = kind === 'evil' ? '#dc2626' : kind === 'heart' ? '#ec4899' : COLORS[opts.color] || opts.color;
    const light = opts.color === 'white' || opts.color === 'yellow';
    const ink = light ? '#334155' : '#ffffff';
    let body;
    if (kind === 'evil') body = '<polygon points="' + starPoints(50, 54, 50, 38, 14) + '" fill="' + fill + '"/>' +
      '<polygon points="' + starPoints(50, 54, 50, 38, 14) + '" fill="url(#bp-shade)"/>';
    else {
      const d = kind === 'heart' ? HEART_BODY : BODY;
      body = '<path d="' + d + '" fill="' + fill + '"/><path d="' + d + '" fill="url(#bp-shade)"/>' +
        (opts.color === 'white' ? '<path d="' + d + '" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>' : '');
    }
    let content = '';
    if (opts.shape) content = shape(opts.shape, light ? '#334155' : '#ffffff');
    else if (opts.text != null) {
      const t = String(opts.text);
      const size = t.length > 1 ? 40 : 50;
      content = '<text x="50" y="58" text-anchor="middle" dominant-baseline="central" font-size="' + size + '" ' +
        'font-weight="800" fill="' + ink + '" stroke="rgba(0,0,0,.18)" stroke-width="2" paint-order="stroke" ' +
        'font-family="Baloo 2, Nunito, system-ui, sans-serif">' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text>';
    } else if (opts.face !== false) content = face(kind === 'evil');

    const knotY = kind === 'heart' ? 102 : 105;
    return '<svg class="balloon-svg" viewBox="0 0 100 160" aria-hidden="true">' +
      '<path class="string" d="M50 ' + (knotY + 6) + ' q-7 12 0 24 t0 24" stroke="rgba(15,23,42,.35)" stroke-width="1.6" fill="none"/>' +
      '<g class="body">' + body +
      '<ellipse cx="31" cy="30" rx="8" ry="15" transform="rotate(-25 31 30)" fill="#fff" opacity=".45"/>' +
      '<path d="M44 ' + (knotY + 7) + ' L56 ' + (knotY + 7) + ' L50 ' + (knotY - 1) + ' Z" fill="' + fill + '"/>' +
      content + '</g></svg>';
  }

  function shapeIcon(name, fill) {
    return '<svg viewBox="20 26 60 60" aria-hidden="true">' + shape(name, fill || '#334155') + '</svg>';
  }

  function cloud(w) {
    return '<svg viewBox="0 0 200 90" width="' + w + '" aria-hidden="true"><g fill="#fff">' +
      '<ellipse cx="100" cy="62" rx="90" ry="24"/><circle cx="70" cy="48" r="30"/><circle cx="112" cy="38" r="36"/>' +
      '<circle cx="150" cy="54" r="24"/></g><ellipse cx="100" cy="74" rx="84" ry="10" fill="#dbeafe" opacity=".7"/></svg>';
  }

  window.Art = { COLORS: COLORS, BRIGHT: BRIGHT, balloon: balloon, shapeIcon: shapeIcon, cloud: cloud };
})();

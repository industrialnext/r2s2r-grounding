// Interactive results charts. Data: paper Table 2 (and the results sheet it was built from).
(function () {
  var CONDITIONS = [
    { key: 'total',   label: 'All trials',     n: 50 },
    { key: 'nominal', label: 'Nominal',        n: 24 },
    { key: 'red',     label: 'Red light',      n: 8 },
    { key: 'fast',    label: 'Fast belt',      n: 8 },
    { key: 'novel',   label: 'Novel objects',  n: 9 },
    { key: 'shifted', label: 'All shifted',    n: 26 }
  ];
  var CLIP_CONDITIONS = ['nominal', 'red', 'fast', 'novel'];

  // 500M policy trained from scratch; order matches Fig. 2a.
  // `file` names the rollout clips (static/videos/rollout-<file>-<condition>.mp4);
  // `ok` is whether the shown rollout succeeded (taro_policy_conditions_20_table2 clip_index.csv):
  // clips show a success where the policy's Table 2 rate is >= 50%, a failure otherwise.
  var SCRATCH = [
    { id: 'real',     file: 'real',       label: 'Real only',         tone: 'real',     s: { total: 26, nominal: 16, shifted: 10, red: 2, fast: 4, novel: 4 },
      ok: { nominal: true,  red: false, fast: true,  novel: false } },
    { id: 'ungr',     file: 'ungrounded', label: 'Ungrounded',        tone: 'mid',      s: { total: 29, nominal: 18, shifted: 11, red: 0, fast: 6, novel: 5 },
      ok: { nominal: true,  red: false, fast: true,  novel: true } },
    { id: 'behavior', file: 'behavior',   label: 'Behavior grounded', tone: 'mid',      s: { total: 34, nominal: 20, shifted: 14, red: 3, fast: 6, novel: 4 },
      ok: { nominal: true,  red: false, fast: true,  novel: false } },
    { id: 'world',    file: 'world',      label: 'World grounded',    tone: 'mid',      s: { total: 38, nominal: 21, shifted: 17, red: 3, fast: 8, novel: 6 },
      ok: { nominal: true,  red: false, fast: true,  novel: true } },
    { id: 'full',     file: 'grounded',   label: 'Fully grounded',    tone: 'grounded', s: { total: 43, nominal: 23, shifted: 20, red: 7, fast: 6, novel: 6 },
      ok: { nominal: true,  red: true,  fast: true,  novel: true } }
  ];

  // Post-trained foundation models; order matches Fig. 2b. Results sheet columns F, G, D, E, J, I.
  var FOUNDATION = [
    { group: 'π0.5',         label: 'Real 100',                  tone: 'real',     s: { total: 19, nominal: 13, shifted: 6,  red: 3, fast: 1, novel: 2 } },
    { group: 'π0.5',         label: 'Real 1000',                 tone: 'real',     s: { total: 44, nominal: 24, shifted: 20, red: 7, fast: 8, novel: 4 } },
    { group: 'Our 2B model', label: 'Real 100',                  tone: 'real',     s: { total: 28, nominal: 14, shifted: 14, red: 8, fast: 2, novel: 4 } },
    { group: 'Our 2B model', label: 'Real 1000',                 tone: 'real',     s: { total: 41, nominal: 24, shifted: 17, red: 8, fast: 6, novel: 3 } },
    { group: 'Our 2B model', label: 'Real 100 + ungrounded sim', tone: 'mid',      s: { total: 40, nominal: 22, shifted: 18, red: 6, fast: 8, novel: 4 } },
    { group: 'Our 2B model', label: 'Real 100 + grounded sim',   tone: 'grounded', s: { total: 45, nominal: 24, shifted: 21, red: 8, fast: 6, novel: 6 } }
  ];

  // 95% Wilson score interval, as in the paper.
  function wilson(k, n) {
    var z = 1.96, p = k / n, z2 = z * z;
    var denom = 1 + z2 / n;
    var center = (p + z2 / (2 * n)) / denom;
    var half = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / denom;
    return [Math.max(0, center - half), Math.min(1, center + half)];
  }

  function pct(x) { return Math.round(x * 100); }
  function cond(key) { return CONDITIONS.filter(function (c) { return c.key === key; })[0]; }

  // Hover / focus tooltip.
  function showTip(row, chart, tip, x, y) {
    tip.innerHTML = row.dataset.tip;
    tip.hidden = false;
    var box = chart.getBoundingClientRect();
    var left = Math.min(Math.max(x - box.left + 12, 0), box.width - tip.offsetWidth);
    tip.style.left = left + 'px';
    tip.style.top = (y - box.top + 14) + 'px';
  }
  function bindTip(row, chart, tip) {
    row.addEventListener('mousemove', function (e) { showTip(row, chart, tip, e.clientX, e.clientY); });
    row.addEventListener('mouseleave', function () { tip.hidden = true; });
    row.addEventListener('focus', function () {
      var r = row.querySelector('.bar').getBoundingClientRect();
      showTip(row, chart, tip, r.right, r.top);
    });
    row.addEventListener('blur', function () { tip.hidden = true; });
  }

  // Builds a bar chart with a condition selector inside `card`.
  // opts: { items, storageKey, name(item), takeaway(cond, items) -> string, onChange(key) }
  function buildChart(card, opts) {
    var controls = card.querySelector('.segmented');
    var chart = card.querySelector('.bar-chart');
    var tip = chart.querySelector('.chart-tooltip');
    var takeaway = card.querySelector('.chart-takeaway');

    var current = 'total';
    try { current = localStorage.getItem(opts.storageKey) || 'total'; } catch (e) {}
    if (!cond(current)) current = 'total';

    CONDITIONS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.dataset.key = c.key;
      b.innerHTML = c.label + ' <span class="n">/' + c.n + '</span>';
      b.addEventListener('click', function () { select(c.key); });
      controls.appendChild(b);
    });
    controls.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var i = CONDITIONS.indexOf(cond(current));
      i = (i + (e.key === 'ArrowRight' ? 1 : CONDITIONS.length - 1)) % CONDITIONS.length;
      select(CONDITIONS[i].key);
      controls.querySelector('[data-key="' + CONDITIONS[i].key + '"]').focus();
      e.preventDefault();
    });

    // Rows: optional group heading, then label | track with bar | value.
    var lastGroup = null;
    var rows = opts.items.map(function (d) {
      if (d.group && d.group !== lastGroup) {
        var h = document.createElement('div');
        h.className = 'bar-group';
        h.textContent = d.group;
        chart.appendChild(h);
        lastGroup = d.group;
      }
      var row = document.createElement('div');
      row.className = 'bar-row';
      row.tabIndex = 0;
      row.innerHTML =
        '<span class="bar-label">' + d.label + '</span>' +
        '<span class="bar-track"><span class="bar tone-' + d.tone + '"></span></span>' +
        '<span class="bar-value"></span>';
      chart.appendChild(row);
      bindTip(row, chart, tip);
      return row;
    });

    function render() {
      var c = cond(current);
      controls.querySelectorAll('button').forEach(function (b) {
        var on = b.dataset.key === current;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
      opts.items.forEach(function (d, i) {
        var k = d.s[current], ci = wilson(k, c.n), row = rows[i];
        row.querySelector('.bar').style.width = (k / c.n * 100) + '%';
        row.querySelector('.bar-value').innerHTML = pct(k / c.n) + '% <span class="frac">' + k + '/' + c.n + '</span>';
        row.dataset.tip = '<strong>' + opts.name(d) + '</strong> · ' + c.label +
          '<br>' + k + '/' + c.n + ' successes (' + pct(k / c.n) + '%)' +
          '<br>95% CI ' + pct(ci[0]) + '–' + pct(ci[1]) + '%';
        row.setAttribute('aria-label', opts.name(d) + ', ' + c.label + ': ' + k + ' of ' + c.n +
          ' (' + pct(k / c.n) + '%), 95% interval ' + pct(ci[0]) + ' to ' + pct(ci[1]) + '%');
      });
      var text = opts.takeaway(c);
      if (c.n <= 9) text += ' Only ' + c.n + ' trials per policy here, so read differences as trends.';
      takeaway.textContent = text;
      if (opts.onChange) opts.onChange(current);
    }

    function select(key) {
      current = key;
      try { localStorage.setItem(opts.storageKey, key); } catch (e) {}
      render();
    }

    render();
  }

  function change(a, b, n) {
    var d = pct(b / n) - pct(a / n);
    return pct(a / n) + '% → ' + pct(b / n) + '% (' + (d >= 0 ? '+' : '') + d + ' points)';
  }

  // Rollout tiles: one clip per policy for the selected condition.
  // "All trials" shows one random condition per policy, fixed for the page view;
  // "All shifted" leaves whatever clips are showing (random ones if none yet).
  var tiles = {};
  document.querySelectorAll('.rollouts [data-policy]').forEach(function (el) { tiles[el.dataset.policy] = el; });
  var randomCond = {};
  SCRATCH.forEach(function (p) {
    randomCond[p.id] = CLIP_CONDITIONS[Math.floor(Math.random() * CLIP_CONDITIONS.length)];
  });
  var visible = new Set();

  function updateClips(current) {
    SCRATCH.forEach(function (p) {
      var tile = tiles[p.id];
      if (!tile) return;
      var v = tile.querySelector('video');
      if (current === 'shifted' && v.dataset.clip) return;
      var key = (current === 'total' || current === 'shifted') ? randomCond[p.id] : current;
      var name = p.file + '-' + key;
      if (v.dataset.clip === name) return;
      v.dataset.clip = name;
      v.poster = 'static/images/posters/rollout-' + name + '.jpg';
      v.src = 'static/videos/rollout-' + name + '.mp4';
      v.setAttribute('aria-label', p.label + ' policy, ' + cond(key).label.toLowerCase() + ' rollout');
      tile.querySelector('.clip-cond').textContent =
        cond(key).label + ' · ' + p.s[key] + '/' + cond(key).n + ' overall';
      tile.querySelector('.clip-outcome').textContent = p.ok[key] ? '✓ This rollout: success' : '✗ This rollout: failure';
      if (visible.has(v)) v.play().catch(function () {});
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { visible.add(v); v.play().catch(function () {}); }
        else { visible.delete(v); v.pause(); }
      });
    }, { rootMargin: '200px 0px' });
    Object.keys(tiles).forEach(function (id) { io.observe(tiles[id].querySelector('video')); });
  }

  var scratchCard = document.getElementById('scratch-card');
  if (scratchCard) {
    buildChart(scratchCard, {
      items: SCRATCH,
      storageKey: 'r2s2r-condition',
      name: function (d) { return d.label; },
      takeaway: function (c) {
        return 'Real only → fully grounded: ' + change(SCRATCH[0].s[c.key], SCRATCH[4].s[c.key], c.n) + '.';
      },
      onChange: updateClips
    });
  }

  var fmCard = document.getElementById('fm-card');
  if (fmCard) {
    buildChart(fmCard, {
      items: FOUNDATION,
      storageKey: 'r2s2r-fm-condition',
      name: function (d) { return d.group + ' · ' + d.label; },
      takeaway: function (c) {
        return 'Our 2B model, real 100 → real 100 + grounded sim: ' +
          change(FOUNDATION[2].s[c.key], FOUNDATION[5].s[c.key], c.n) + '.';
      }
    });
  }
})();

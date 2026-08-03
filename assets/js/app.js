/* =========================================================
   小松 主弥 ポートフォリオ ／ 8bit RPG UI
   app.js
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     0. 設定
     ========================================================= */
  const CONFIG = {
    // サイトカウンター
    //   driver: 'local'  … このブラウザの来訪回数を数える（サーバー不要・既定）
    //   driver: 'remote' … endpoint に GET して { count: 数値 } を受け取る
    counter: {
      driver: 'remote',
      endpoint: 'https://api.counterapi.dev/v1/kmtkzy1379/portfolio/up',
      countPath: 'count',      // レスポンス内のカウント値のキー
      digits: 6
    },
    storageKeys: {
      settings: 'kzy.settings.v1',
      progress: 'kzy.progress.v1',
      visits:   'kzy.visits.v1'
    }
  };

  const TOTAL = DATA.allItemIds.length;

  /* =========================================================
     1. ストレージ（localStorage が使えない環境ではメモリに退避）
     ========================================================= */
  const mem = {};
  const Store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) return JSON.parse(raw);
      } catch (e) { if (key in mem) return mem[key]; }
      return (key in mem) ? mem[key] : fallback;
    },
    set(key, val) {
      mem[key] = val;
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
    }
  };

  /* =========================================================
     2. 設定（テーマ・SE・アニメーション）
     ========================================================= */
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const settings = Object.assign({
    se: false,          // 既定OFF（いきなり音が鳴って驚かないように）
    anim: !prefersReduced,
    theme: 'dark',
    shot: 'color',      // 既定はカラー表示
    scan: 'on',
    mascot: true        // おとも表示（なかまにするまで設定には出さない）
  }, Store.get(CONFIG.storageKeys.settings, {}));

  function applySettings() {
    const html = document.documentElement;
    html.dataset.theme = settings.theme;
    html.dataset.anim = settings.anim ? 'on' : 'off';
    html.dataset.shot = settings.shot;
    html.dataset.scan = settings.scan;
    const sb = document.getElementById('hudSound');
    if (sb) {
      sb.classList.toggle('is-off', !settings.se);
      sb.textContent = settings.se ? '♪' : '♪';
    }
    Store.set(CONFIG.storageKeys.settings, settings);
  }

  /* =========================================================
     3. サウンド（WebAudio の矩形波 ＋ 同梱mp3）
     ========================================================= */
  const Sound = {
    ctx: null,
    files: {},
    boot() {
      ['wallet_open', 'wallet_close'].forEach((n) => {
        const a = new Audio('ButtonSound/' + n + '.mp3');
        a.preload = 'auto';
        a.volume = 0.35;
        this.files[n] = a;
      });
    },
    resume() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) { try { this.ctx = new AC(); } catch (e) { this.ctx = null; } }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone(freq, dur, delay, vol, type) {
      if (!settings.se || !this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.08));
      osc.connect(g).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + (dur || 0.08) + 0.02);
    },
    file(name) {
      if (!settings.se) return;
      const a = this.files[name];
      if (!a) return;
      try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) { /* ignore */ }
    },
    cursor()  { this.tone(740, 0.045, 0, 0.035); },
    select()  { this.tone(880, 0.05, 0, 0.05); this.tone(1320, 0.09, 0.05, 0.045); },
    back()    { this.tone(500, 0.06, 0, 0.04); this.tone(330, 0.09, 0.05, 0.035); },
    open()    { this.file('wallet_open'); },
    close()   { this.file('wallet_close'); },
    toggle()  { this.tone(1046, 0.05, 0, 0.045); },
    type()    { this.tone(1600, 0.012, 0, 0.012, 'square'); },
    exp() {
      [880, 1108, 1318, 1760].forEach((f, i) => this.tone(f, 0.09, i * 0.055, 0.045));
    },
    fanfare() {
      const seq = [
        [523, 0.00, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12],
        [1046, 0.36, 0.30], [880, 0.70, 0.14], [1046, 0.86, 0.14],
        [1318, 1.02, 0.50], [1046, 1.02, 0.50], [1568, 1.55, 0.70]
      ];
      seq.forEach((s) => this.tone(s[0], s[2], s[1], 0.055));
      [261, 329, 392, 523].forEach((f, i) => this.tone(f, 0.5, 1.55 + i * 0.02, 0.03, 'triangle'));
    }
  };

  /* =========================================================
     4. 進行状況（ゲージ）
     ========================================================= */
  const progress = Object.assign({ seen: [], master: false, mascot: false },
    Store.get(CONFIG.storageKeys.progress, {}));
  if (!Array.isArray(progress.seen)) progress.seen = [];

  function isSeen(id) { return progress.seen.indexOf(id) !== -1; }
  function seenCount() {
    return progress.seen.filter((id) => DATA.allItemIds.indexOf(id) !== -1).length;
  }
  function level() { return Math.min(6, 1 + Math.floor(seenCount() / 3)); }

  function saveProgress() { Store.set(CONFIG.storageKeys.progress, progress); }

  function markSeen(id, label) {
    if (isSeen(id)) return false;
    progress.seen.push(id);
    saveProgress();
    updateGauge();
    Sound.exp();
    toast('＋1 EXP　「' + label + '」を よんだ！');
    refreshChecks();
    if (seenCount() >= TOTAL && !progress.master) {
      progress.master = true;
      saveProgress();
      setTimeout(showMaster, 900);
    }
    return true;
  }

  function updateGauge() {
    const n = seenCount();
    const pct = TOTAL ? Math.round((n / TOTAL) * 100) : 0;
    const fill = document.getElementById('gaugeFill');
    const lv = document.getElementById('hudLv');
    const exp = document.getElementById('hudExp');
    if (fill) fill.style.width = pct + '%';
    if (lv) lv.textContent = level();
    if (exp) exp.textContent = n + ' / ' + TOTAL + '　(' + pct + '%)';
    const g = fill && fill.parentElement;
    if (g) g.classList.toggle('is-full', n >= TOTAL);
  }

  /* 一覧のチェック表示を再計算 */
  function refreshChecks() {
    document.querySelectorAll('[data-seen-id]').forEach((el) => {
      const done = isSeen(el.getAttribute('data-seen-id'));
      el.classList.toggle('is-seen', done);
      const chk = el.querySelector('.js-chk');
      if (chk) chk.textContent = done ? '✔ よみおわり' : '未読';
    });
    document.querySelectorAll('[data-group]').forEach((el) => {
      const g = el.getAttribute('data-group');
      const ids = DATA.allItemIds.filter((id) => id.indexOf(g + ':') === 0);
      const done = ids.filter(isSeen).length;
      const cnt = el.querySelector('.js-count');
      if (cnt) cnt.textContent = done + '/' + ids.length;
      el.classList.toggle('is-done', done === ids.length && ids.length > 0);
    });
  }

  /* =========================================================
     5. トースト
     ========================================================= */
  function toast(msg) {
    const layer = document.getElementById('toasts');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    layer.appendChild(el);
    setTimeout(() => el.remove(), settings.anim ? 2700 : 1600);
  }

  /* =========================================================
     6. タイプライター
     ========================================================= */
  function typeText(el, text, speed, done) {
    if (!settings.anim) { el.textContent = text; if (done) done(); return { skip() {} }; }
    let i = 0;
    el.textContent = '';
    const timer = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i % 3 === 0) Sound.type();
      if (i >= text.length) { clearInterval(timer); if (done) done(); }
    }, speed || 45);
    return { skip() { clearInterval(timer); el.textContent = text; if (done) done(); } };
  }

  /* =========================================================
     7. ドット絵スプライト（画像がない作品用）
     ========================================================= */
  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  /* 手描きのドット絵を描く（DATA.sprites） */
  function drawPixelArt(ctx, grid, w, h, fg, dim) {
    const rows = grid.length;
    const cols = grid[0].length;
    const px = Math.max(1, Math.floor(Math.min(w / (cols + 3), h / (rows + 2))));
    const ox = Math.floor((w - px * cols) / 2);
    const oy = Math.floor((h - px * rows) / 2);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = grid[y][x];
        if (c === '.') continue;
        ctx.fillStyle = (c === '#') ? fg : dim;
        ctx.fillRect(ox + x * px, oy + y * px, px, px);
      }
    }
  }

  function paintSprites(root) {
    (root || document).querySelectorAll('canvas.js-sprite').forEach((cv) => {
      if (cv.dataset.painted) return;
      cv.dataset.painted = '1';
      const seed = cv.getAttribute('data-seed') || 'x';
      const art = cv.getAttribute('data-art');
      const w = cv.clientWidth || 320;
      const h = cv.clientHeight || 180;
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d');
      const cs = getComputedStyle(document.documentElement);
      const fg = cs.getPropertyValue('--fg').trim() || '#fff';
      const bg = cs.getPropertyValue('--bg').trim() || '#000';
      const dim = cs.getPropertyValue('--dim').trim() || '#888';

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      /* 背景のディザ */
      let s = hash32(seed);
      const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
      ctx.fillStyle = fg;
      ctx.globalAlpha = 0.12;
      const cell = 8;
      for (let y = 0; y < h; y += cell) {
        for (let x = 0; x < w; x += cell) {
          if (rnd() > 0.86) ctx.fillRect(x, y, cell, cell);
        }
      }
      ctx.globalAlpha = 1;

      /* 手描きスプライトがある作品はそれを描く */
      if (art && DATA.sprites && DATA.sprites[art]) {
        drawPixelArt(ctx, DATA.sprites[art], w, h, fg, dim);
        return;
      }

      /* 無ければ ID から自動生成（左右対称 10x10） */
      const N = 10;
      const px = Math.floor(Math.min(w, h) / (N + 4));
      const ox = Math.floor((w - px * N) / 2);
      const oy = Math.floor((h - px * N) / 2);
      const grid = [];
      for (let y = 0; y < N; y++) {
        grid[y] = [];
        for (let x = 0; x < Math.ceil(N / 2); x++) {
          const edge = (y === 0 || y === N - 1);
          grid[y][x] = edge ? (rnd() > 0.7 ? 1 : 0) : (rnd() > 0.42 ? 1 : 0);
        }
      }
      ctx.fillStyle = fg;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const v = grid[y][x < N / 2 ? x : N - 1 - x];
          if (v) ctx.fillRect(ox + x * px, oy + y * px, px, px);
        }
      }
      /* 枠 */
      ctx.strokeStyle = fg;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.strokeRect(ox - px, oy - px, px * (N + 2), px * (N + 2));
      ctx.globalAlpha = 1;
    });
  }

  /* =========================================================
     8. ブロック描画
     ========================================================= */
  function renderBlocks(blocks) {
    return (blocks || []).map((b) => {
      switch (b.type) {
        case 'h':  return '<h3>' + b.text + '</h3>';
        case 'h3': return '<h4>' + b.text + '</h4>';
        case 'p':  return '<p>' + b.text + '</p>';
        case 'ul': return '<ul>' + b.items.map((i) => '<li>' + i + '</li>').join('') + '</ul>';
        case 'note':  return '<div class="note">' + b.text + '</div>';
        case 'quote': return '<div class="quote">' + b.text + '</div>';
        case 'table': {
          const head = b.head && b.head.some((h) => h !== '')
            ? '<thead><tr>' + b.head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead>'
            : '';
          const body = '<tbody>' + b.rows.map((r) =>
            '<tr>' + r.map((c, i) => (i === 0 && !b.head ? '<th>' + c + '</th>' : '<td>' + c + '</td>')).join('') + '</tr>'
          ).join('') + '</tbody>';
          return '<div class="tablewrap"><table>' + head + body + '</table></div>';
        }
        case 'img':
          return '<div class="shot' + (b.size === 'icon' ? ' shot--icon' : '') + '"><figure><div class="frame">' +
            '<img src="' + b.src + '" alt="' + (b.caption || '') + '" loading="lazy" decoding="async">' +
            '</div>' + (b.caption ? '<figcaption>' + b.caption + '</figcaption>' : '') + '</figure></div>';
        case 'sprite':
          return '<div class="shot shot--sprite"><figure><div class="frame">' +
            '<canvas class="js-sprite" data-seed="' + b.art + '" data-art="' + b.art + '"></canvas>' +
            '</div>' + (b.caption ? '<figcaption>' + b.caption + '</figcaption>' : '') + '</figure></div>';
        case 'gallery':
          return '<div class="gallery">' + b.items.map((it) =>
            '<div class="shot"><figure><div class="frame">' +
            '<img src="' + it.src + '" alt="' + (it.caption || '') + '" loading="lazy" decoding="async">' +
            '</div><figcaption>' + (it.caption || '') + '</figcaption></figure></div>'
          ).join('') + '</div>';
        case 'video':
          return '<div class="shot"><figure><div class="frame">' +
            '<video controls preload="none" playsinline' +
            (b.poster ? ' poster="' + b.poster + '"' : '') + ' src="' + b.src + '"></video>' +
            '</div>' + (b.caption ? '<figcaption>' + b.caption + '</figcaption>' : '') + '</figure></div>';
        case 'links':
          return '<div class="links">' + b.items.map((it) => {
            if (!it.url) return '<span class="dead">' + it.label + (it.note ? '（' + it.note + '）' : '') + '</span>';
            if (it.internal) return '<a href="' + it.url + '">' + it.label + '</a>';
            const yid = youtubeId(it.url);
            if (yid) {
              return '<div class="yt">' +
                '<button class="yt__head js-yt" type="button" aria-expanded="false" data-yt="' + yid + '">' +
                  '<span class="yt__mark">▶</span>' +
                  '<span class="yt__label">' + it.label + '</span>' +
                  '<span class="yt__hint">ここで さいせい</span>' +
                '</button>' +
                '<div class="yt__panel" hidden></div>' +
              '</div>';
            }
            return '<a href="' + it.url + '" target="_blank" rel="noopener noreferrer">' + it.label + '</a>';
          }).join('') + '</div>';
        default: return '';
      }
    }).join('');
  }

  /* YouTube のURLなら動画IDを返す（それ以外は null） */
  function youtubeId(url) {
    const m = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/(?:embed|shorts)\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  /* アコーディオン1つ分 */
  function accordion(opts) {
    return '' +
      '<div class="acc" data-seen-id="' + opts.seenId + '">' +
        '<button class="acc__head js-acc js-nav" type="button" aria-expanded="false">' +
          '<span class="acc__mark">▶</span>' +
          '<span class="acc__t">' +
            '<span class="acc__name">' + opts.name + '</span>' +
            (opts.role ? '<span class="acc__role">' + opts.role + '</span>' : '') +
          '</span>' +
          '<span class="acc__meta">' +
            (opts.period ? '<span class="acc__period">' + opts.period + '</span>' : '') +
            '<span class="acc__chk js-chk"></span>' +
          '</span>' +
        '</button>' +
        '<div class="acc__panel body" hidden>' + renderBlocks(opts.blocks) + '</div>' +
      '</div>';
  }

  /* =========================================================
     9. 画面
     ========================================================= */
  const view = document.getElementById('view');

  function screenIntro() {
    const p = DATA.profile;
    return '' +
    '<section class="screen intro">' +
      '<div class="intro__plate js-enter" role="button" tabindex="0">' +
        '<div class="intro__job">' + p.job + '</div>' +
        '<h1 class="intro__name">' + p.name + '</h1>' +
        '<div class="intro__kana">' + p.kana + '</div>' +
        '<div class="intro__meta">' + p.school + '<br>' + p.graduate + '</div>' +
        '<ul class="intro__skills">' + p.skills.map((s) => '<li>' + s + '</li>').join('') + '</ul>' +
        '<p class="intro__lead">' + p.lead + '</p>' +
      '</div>' +

      '<div class="hint">' +
        '<span class="hint__arrow">▼</span>' +
        '<b>スワイプ</b> または <b>タップ</b> で メニューへ' +
      '</div>' +
      '<button class="enter-btn js-enter" type="button">▶ メニューへ すすむ</button>' +

      '<div class="pickup-head">もっと しる（' + DATA.introItems.length + '）</div>' +
      DATA.introItems.map((it) => accordion({
        seenId: 'intro:' + it.id,
        name: it.label,
        role: it.title,
        blocks: it.blocks
      })).join('') +
    '</section>';
  }

  function screenMenu() {
    const items = [
      { to: '#/works',    name: 'さくひん',            desc: '個人開発した作品を見る', group: 'work' },
      { to: '#/history',  name: 'インターン・かつどう', desc: 'oh my teeth と参加イベント', group: 'hist' },
      { to: '#/settings', name: 'せってい',            desc: '音・アニメーション・テーマ', group: null }
    ];
    if (progress.master) {
      items.push({ to: '#/master', name: '★ しょうごう', desc: '小松マスターの証', group: null });
    }
    return '' +
    '<section class="screen menu">' +
      '<div class="win win--tight"><p id="menuMsg" style="margin:0">　</p></div>' +
      '<div class="cmd">' +
        items.map((it) =>
          '<button class="cmd__item js-nav" type="button" data-to="' + it.to + '"' +
            (it.group ? ' data-group="' + it.group + '"' : '') + '>' +
            '<span class="cur">▶</span>' +
            '<span class="cmd__body">' +
              '<span class="cmd__name">' + it.name + '</span><br>' +
              '<span class="cmd__desc">' + it.desc + '</span>' +
            '</span>' +
            (it.group ? '<span class="cmd__count js-count"></span>' : '') +
          '</button>'
        ).join('') +
      '</div>' +
      '<p class="menu__lead">↑↓ で せんたく ／ Enter で けってい ／ Esc で もどる</p>' +
    '</section>';
  }

  function screenWorks() {
    const pick = DATA.works.filter((w) => w.pickup);
    const rest = DATA.works.filter((w) => !w.pickup);

    const pcards = pick.map((w, i) =>
      '<button class="pcard js-nav" type="button" data-to="#/works/' + w.id + '" data-seen-id="work:' + w.id + '">' +
        '<span class="pcard__ribbon">PICK UP!</span>' +
        '<span class="pcard__shine"></span>' +
        '<span class="pcard__thumb">' +
          (w.cover
            ? '<img src="' + w.cover + '" alt="" loading="lazy" decoding="async">'
            : '<canvas class="js-sprite" data-seed="' + w.id + '"' +
              (w.sprite ? ' data-art="' + w.sprite + '"' : '') + '></canvas>') +
        '</span>' +
        '<span class="pcard__body">' +
          '<span class="pcard__no">NO.' + ('0' + (i + 1)).slice(-2) + '　' + w.status + '</span>' +
          '<span class="pcard__name">' + w.title + '</span>' +
          '<span class="pcard__sub">' + w.sub + '</span>' +
          '<span class="pcard__tags">' + w.tags.map((t) => '<span>' + t + '</span>').join('') + '</span>' +
          '<span class="pcard__go">くわしく みる</span>' +
        '</span>' +
      '</button>'
    ).join('');

    const list = rest.map((w) =>
      '<button class="wlist__item js-nav" type="button" data-to="#/works/' + w.id + '" data-seen-id="work:' + w.id + '">' +
        '<span class="cur">▶</span>' +
        '<span class="wlist__t">' +
          '<span class="wlist__name">' + w.title + '</span><br>' +
          '<span class="wlist__sub">' + w.sub + '</span>' +
        '</span>' +
        '<span class="wlist__chk js-chk"></span>' +
      '</button>'
    ).join('');

    return '' +
    '<section class="screen works">' +
      '<div class="pickup-head">★ ピックアップ ★</div>' +
      '<div class="pickup-grid">' + pcards + '</div>' +
      '<div class="pickup-head">そのほかの さくひん</div>' +
      '<div class="wlist">' + list + '</div>' +
    '</section>';
  }

  function screenWorkDetail(id) {
    const idx = DATA.works.findIndex((w) => w.id === id);
    if (idx < 0) { location.hash = '#/works'; return ''; }
    const w = DATA.works[idx];
    const prev = DATA.works[idx - 1];
    const next = DATA.works[idx + 1];

    return '' +
    '<section class="screen detail">' +
      '<div class="detail__head">' +
        '<div class="detail__no">' + (w.pickup ? '★ PICK UP ★　' : '') + 'NO.' + ('0' + (idx + 1)).slice(-2) + '</div>' +
        '<h2 class="detail__title">' + w.title + '</h2>' +
        '<div class="detail__sub">' + w.sub + '</div>' +
        '<div class="detail__status">' + w.status + '</div>' +
      '</div>' +
      '<div class="body">' + renderBlocks(w.blocks) + '</div>' +
      '<div class="pager">' +
        '<button type="button" class="js-nav" data-to="' + (prev ? '#/works/' + prev.id : '') + '"' +
          (prev ? '' : ' disabled') + '>◀ ' + (prev ? prev.title : 'なし') + '</button>' +
        '<button type="button" class="js-nav" data-to="#/works">■ いちらん</button>' +
        '<button type="button" class="js-nav" data-to="' + (next ? '#/works/' + next.id : '') + '"' +
          (next ? '' : ' disabled') + '>' + (next ? next.title : 'なし') + ' ▶</button>' +
      '</div>' +
    '</section>';
  }

  function screenHistory() {
    const main = DATA.history.filter((h) => h.main);
    const rest = DATA.history.filter((h) => !h.main);
    return '' +
    '<section class="screen hist">' +
      '<div class="pickup-head">★ げんざい ★</div>' +
      main.map((h) => accordion({
        seenId: 'hist:' + h.id,
        name: h.title,
        role: h.role,
        period: h.period,
        blocks: h.blocks
      })).join('') +
      '<div class="pickup-head">これまでの かつどう</div>' +
      '<div class="timeline">' +
        rest.map((h) =>
          '<div class="timeline__item">' + accordion({
            seenId: 'hist:' + h.id,
            name: h.title,
            role: h.role,
            period: h.period,
            blocks: h.blocks
          }) + '</div>'
        ).join('') +
      '</div>' +
    '</section>';
  }

  function setRow(key, name, desc, val) {
    return '<button class="set__row js-set js-nav" type="button" data-key="' + key + '">' +
      '<span class="cur">▶</span>' +
      '<span class="set__t"><span class="set__name">' + name + '</span><br>' +
      '<span class="set__desc">' + desc + '</span></span>' +
      '<span class="set__val">' + val + '</span></button>';
  }

  function screenSettings() {
    return '' +
    '<section class="screen set">' +
      '<div class="cmd">' +
        setRow('se', 'こうかおん（SE）', 'カーソル音・決定音・ファンファーレ', settings.se ? 'ON' : 'OFF') +
        setRow('anim', 'アニメーション', '点滅・スクロール演出をまとめて切り替え', settings.anim ? 'ON' : 'OFF') +
        setRow('theme', 'がめん', 'くろ（ダーク） / しろ（ライト）', settings.theme === 'dark' ? 'くろ' : 'しろ') +
        setRow('shot', 'スクリーンショット', 'モノクロ表示 / 元のカラー表示', settings.shot === 'mono' ? 'モノクロ' : 'カラー') +
        setRow('scan', 'そうさせん', 'ブラウン管風の走査線', settings.scan === 'on' ? 'ON' : 'OFF') +
        /* なかまにするまで、この行そのものを出さない */
        (progress.mascot
          ? setRow('mascot', 'おとも', '画面のはしに いるキャラの表示', settings.mascot ? 'ON' : 'OFF')
          : '') +
        setRow('log', '小松の記憶（閲覧の記録）', 'どこを読んだかの一覧を見る', seenCount() + ' / ' + TOTAL) +
        setRow('reset', '小松の記憶 を けす', '閲覧の記録（ゲージ）を消去します', 'けす') +
      '</div>' +
      '<div class="win win--tight" style="font-size:.76rem;color:var(--dim)">' +
        '<p style="margin:0 0 6px">■ そうさ</p>' +
        '<p style="margin:0">↑↓ カーソル移動／Enter 決定／Esc・→スワイプ もどる</p>' +
      '</div>' +
    '</section>';
  }

  /* 閲覧の記録（小松の記憶） */
  function logGroup(title, rows) {
    return '<div class="pickup-head">' + title + '</div>' +
      '<div class="wlist">' + rows.map((r) =>
        '<button class="wlist__item js-nav" type="button" data-to="' + r.to + '">' +
          '<span class="cur' + (isSeen(r.id) ? ' is-read' : '') + '">' + (isSeen(r.id) ? '✔' : '▶') + '</span>' +
          '<span class="wlist__t">' +
            '<span class="wlist__name">' + r.name + '</span><br>' +
            '<span class="wlist__sub">' + r.sub + '</span>' +
          '</span>' +
          '<span class="wlist__chk">' + (isSeen(r.id) ? 'よみおわり' : '未読') + '</span>' +
        '</button>'
      ).join('') + '</div>';
  }

  function screenLog() {
    const n = seenCount();
    const pct = TOTAL ? Math.round((n / TOTAL) * 100) : 0;

    return '' +
    '<section class="screen log">' +
      '<div class="win">' +
        '<h2 class="sect-title">小松の記憶</h2>' +
        '<p style="margin:0 0 12px;font-size:.84rem">' +
          'よんだ ばしょ： <b>' + n + ' / ' + TOTAL + '</b>　(' + pct + '%)　／　LV <b>' + level() + '</b>' +
        '</p>' +
        '<div class="gauge"><span style="width:' + pct + '%"></span></div>' +
        '<p style="margin:14px 0 0;font-size:.74rem;color:var(--dim)">' +
          (n >= TOTAL
            ? '★ すべて よみました。ありがとうございます！'
            : 'のこり <b>' + (TOTAL - n) + '</b> 項目。えらぶと その場所へ とびます。') +
        '</p>' +
      '</div>' +

      logGroup('じこしょうかい', DATA.introItems.map((v) => ({
        id: 'intro:' + v.id, to: '#/intro/' + v.id, name: v.label, sub: v.title
      }))) +

      logGroup('さくひん', DATA.works.map((v) => ({
        id: 'work:' + v.id, to: '#/works/' + v.id,
        name: (v.pickup ? '★ ' : '') + v.title, sub: v.sub
      }))) +

      logGroup('インターン・かつどう', DATA.history.map((v) => ({
        id: 'hist:' + v.id, to: '#/history/' + v.id, name: v.title, sub: v.role
      }))) +
    '</section>';
  }

  /* 指定IDのアコーディオンを開いてスクロール */
  function openTarget(seenId) {
    const box = view.querySelector('[data-seen-id="' + seenId + '"]');
    if (!box) return;
    const head = box.querySelector('.js-acc');
    if (head && !box.classList.contains('is-open')) head.click();
    setTimeout(() => {
      const y = box.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: settings.anim ? 'smooth' : 'auto' });
    }, 60);
  }

  /* =========================================================
     10. ルーター
     ========================================================= */
  function parentOf(hash) {
    if (hash.indexOf('#/works/') === 0) return '#/works';
    if (hash.indexOf('#/intro/') === 0) return '#/log';
    if (hash.indexOf('#/history/') === 0) return '#/log';
    if (hash === '#/log') return '#/menu';
    if (hash === '#/works' || hash === '#/history' || hash === '#/settings' || hash === '#/master') return '#/menu';
    if (hash === '#/menu') return '#/intro';
    return '#/intro';
  }

  let lastHash = '';
  function render() {
    const hash = location.hash || '#/intro';
    if (hash === '#/master') { showMaster(); location.hash = lastHash || '#/menu'; return; }
    lastHash = hash;

    let html = '';
    let openId = '';
    if (hash === '#/intro') html = screenIntro();
    else if (hash.indexOf('#/intro/') === 0) { html = screenIntro(); openId = 'intro:' + hash.slice(8); }
    else if (hash === '#/menu') html = screenMenu();
    else if (hash === '#/works') html = screenWorks();
    else if (hash.indexOf('#/works/') === 0) html = screenWorkDetail(hash.slice(8));
    else if (hash === '#/history') html = screenHistory();
    else if (hash.indexOf('#/history/') === 0) { html = screenHistory(); openId = 'hist:' + hash.slice(10); }
    else if (hash === '#/settings') html = screenSettings();
    else if (hash === '#/log') html = screenLog();
    else { location.hash = '#/intro'; return; }

    view.innerHTML = html;
    paintSprites(view);
    refreshChecks();
    updateGauge();

    const back = document.getElementById('hudBack');
    if (back) back.hidden = (hash === '#/intro');
    const logBtn = document.getElementById('hudLog');
    if (logBtn) logBtn.classList.toggle('is-full', seenCount() >= TOTAL);

    document.getElementById('foot').innerHTML =
      DATA.profile.name + '　<a href="mailto:' + DATA.profile.mail + '">' + DATA.profile.mail + '</a>　' +
      '<a href="' + DATA.profile.github + '" target="_blank" rel="noopener noreferrer">GitHub</a>' +
      (progress.master ? '<span class="badge-master">★ 小松マスター</span>' : '');

    window.scrollTo(0, 0);
    if (openId) openTarget(openId);
    Mascot.sync();

    if (hash === '#/menu') {
      const msg = document.getElementById('menuMsg');
      if (msg) typeText(msg, 'どこを みますか？', 55);
    }
    if (hash.indexOf('#/works/') === 0) {
      const w = DATA.works.find((x) => x.id === hash.slice(8));
      if (w) setTimeout(() => markSeen('work:' + w.id, w.title), 450);
    }
  }

  function goBack() {
    Sound.close();
    location.hash = parentOf(location.hash || '#/intro');
  }

  /* =========================================================
     11. イベント
     ========================================================= */
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-to]');
    if (nav && !nav.disabled) {
      const to = nav.getAttribute('data-to');
      if (to) { Sound.select(); location.hash = to; }
      return;
    }
    const enter = e.target.closest('.js-enter');
    if (enter) { Sound.open(); location.hash = '#/menu'; return; }

    const acc = e.target.closest('.js-acc');
    if (acc) {
      const box = acc.parentElement;
      const panel = box.querySelector('.acc__panel');
      const open = box.classList.toggle('is-open');
      panel.hidden = !open;
      acc.setAttribute('aria-expanded', String(open));
      acc.querySelector('.acc__mark').textContent = open ? '▼' : '▶';
      if (open) {
        Sound.open();
        const id = box.getAttribute('data-seen-id');
        const label = box.querySelector('.acc__name').textContent;
        markSeen(id, label);
      } else { Sound.close(); }
      return;
    }

    const yt = e.target.closest('.js-yt');
    if (yt) {
      const box = yt.parentElement;
      const panel = box.querySelector('.yt__panel');
      const open = box.classList.toggle('is-open');
      yt.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      if (open) {
        Sound.open();
        panel.innerHTML = '<div class="yt__frame"><iframe' +
          ' src="https://www.youtube-nocookie.com/embed/' + yt.getAttribute('data-yt') + '?rel=0"' +
          ' title="YouTube" loading="lazy" allowfullscreen' +
          ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
          ' referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
      } else {
        Sound.close();
        panel.innerHTML = '';  /* iframe を破棄して再生も止める */
      }
      return;
    }

    const set = e.target.closest('.js-set');
    if (set) { onSetting(set); return; }

    if (e.target.closest('#mascotBtn')) { Mascot.take(); return; }

    if (e.target.closest('#hudBack')) { goBack(); return; }
    if (e.target.closest('#hudLog')) { Sound.select(); location.hash = '#/log'; return; }
    if (e.target.closest('#hudSound')) {
      settings.se = !settings.se; applySettings();
      if (settings.se) Sound.toggle();
      toast('こうかおん：' + (settings.se ? 'ON' : 'OFF'));
      return;
    }
    if (e.target.closest('#masterClose')) { hideMaster(); return; }
  });

  /* 設定の切り替え */
  let resetArmed = false;
  function onSetting(btn) {
    const key = btn.getAttribute('data-key');
    const valEl = btn.querySelector('.set__val');
    if (key === 'log') { Sound.select(); location.hash = '#/log'; return; }
    if (key === 'reset') {
      if (!resetArmed) {
        resetArmed = true;
        valEl.textContent = 'ほんとうに？';
        btn.querySelector('.set__desc').textContent = 'もう一度おすと、閲覧の記録がすべて消えます';
        Sound.back();
        setTimeout(() => {
          if (!resetArmed) return;
          resetArmed = false;
          valEl.textContent = 'けす';
        }, 4000);
        return;
      }
      resetArmed = false;
      progress.seen = [];
      progress.master = false;
      progress.mascot = false;   // おとも も 小松マスター と一緒に元に戻る
      saveProgress();
      updateGauge();
      Mascot.sync();
      valEl.textContent = 'けした';
      btn.querySelector('.set__desc').textContent = '小松の記憶 は きえました';
      Sound.close();
      toast('小松の記憶 を けしました');
      return;
    }

    if (key === 'se')   { settings.se = !settings.se; valEl.textContent = settings.se ? 'ON' : 'OFF'; }
    if (key === 'anim') { settings.anim = !settings.anim; valEl.textContent = settings.anim ? 'ON' : 'OFF'; }
    if (key === 'theme') {
      settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
      valEl.textContent = settings.theme === 'dark' ? 'くろ' : 'しろ';
    }
    if (key === 'shot') {
      settings.shot = settings.shot === 'mono' ? 'color' : 'mono';
      valEl.textContent = settings.shot === 'mono' ? 'モノクロ' : 'カラー';
    }
    if (key === 'scan') {
      settings.scan = settings.scan === 'on' ? 'off' : 'on';
      valEl.textContent = settings.scan === 'on' ? 'ON' : 'OFF';
    }
    if (key === 'mascot') {
      settings.mascot = !settings.mascot;
      valEl.textContent = settings.mascot ? 'ON' : 'OFF';
    }
    applySettings();
    Mascot.sync();   // 「おとも」と「アニメーション」の切り替えを反映
    Sound.toggle();
  }

  /* キーボード */
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('master').hidden === false) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { hideMaster(); e.preventDefault(); }
      return;
    }
    if (!document.getElementById('boot').classList.contains('is-out')) return;

    if (e.key === 'Escape' || e.key === 'Backspace') {
      if (location.hash !== '#/intro') { e.preventDefault(); goBack(); }
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.prototype.slice.call(view.querySelectorAll('.js-nav:not([disabled])'));
    if (!items.length) return;
    const cur = items.indexOf(document.activeElement);
    let nextIdx = e.key === 'ArrowDown' ? cur + 1 : cur - 1;
    if (nextIdx < 0) nextIdx = items.length - 1;
    if (nextIdx >= items.length) nextIdx = 0;
    items[nextIdx].focus();
    Sound.cursor();
  });

  /* スワイプ */
  let tx = 0, ty = 0, tt = 0;
  document.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    tx = t.clientX; ty = t.clientY; tt = Date.now();
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!document.getElementById('boot').classList.contains('is-out')) return;
    if (document.getElementById('master').hidden === false) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty;
    if (Date.now() - tt > 700) return;
    if (Math.abs(dx) < 70 || Math.abs(dy) > 60) return;
    if (dx < 0) {
      if (location.hash === '#/intro' || location.hash === '') {
        Sound.open(); location.hash = '#/menu';
      }
    } else {
      if (location.hash !== '#/intro' && location.hash !== '') goBack();
    }
  }, { passive: true });

  window.addEventListener('hashchange', render);

  /* =========================================================
     12. マスター演出
     ========================================================= */
  const MASTER_MESSAGE =
    '全て読んで頂きありがとうございます！これであなたは小松マスターです。';

  let confettiRAF = 0;
  function showMaster() {
    const box = document.getElementById('master');
    if (!box.hidden) return;
    box.hidden = false;
    Mascot.sync();
    Sound.fanfare();
    flash();
    confetti();
    const p = document.getElementById('masterText');
    typeText(p, MASTER_MESSAGE, 60, () => {
      const extra = document.createElement('p');
      extra.style.marginTop = '14px';
      extra.style.fontSize = '.84rem';
      extra.innerHTML = 'ここまで見てくださって本当にありがとうございます。<br>' +
        'お気軽にご連絡ください → <a href="mailto:' + DATA.profile.mail + '">' + DATA.profile.mail + '</a>';
      p.parentElement.appendChild(extra);
    });
  }
  function hideMaster() {
    document.getElementById('master').hidden = true;
    cancelAnimationFrame(confettiRAF);
    const fx = document.getElementById('fx');
    fx.hidden = true;
    const p = document.getElementById('masterText');
    if (p && p.parentElement.children.length > 1) {
      while (p.parentElement.children.length > 1) p.parentElement.lastChild.remove();
    }
    Sound.close();
    render();
  }

  function flash() {
    if (!settings.anim) return;
    const f = document.getElementById('flash');
    f.classList.remove('is-on');
    void f.offsetWidth;
    f.classList.add('is-on');
  }

  function confetti() {
    if (!settings.anim) return;
    const cv = document.getElementById('fx');
    cv.hidden = false;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const cs = getComputedStyle(document.documentElement);
    const fg = cs.getPropertyValue('--fg').trim() || '#fff';
    const dim = cs.getPropertyValue('--dim').trim() || '#888';

    const parts = [];
    for (let i = 0; i < 90; i++) {
      parts.push({
        x: Math.random() * innerWidth,
        y: -Math.random() * innerHeight,
        s: 4 + Math.floor(Math.random() * 4) * 2,
        v: 1.2 + Math.random() * 2.6,
        sw: Math.random() * 1.6 - 0.8,
        c: Math.random() > 0.4 ? fg : dim,
        r: Math.random() * 4
      });
    }
    let frames = 0;
    (function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.y += p.v; p.x += Math.sin((p.y + p.r) / 26) * p.sw;
        if (p.y > innerHeight + 20) { p.y = -20; p.x = Math.random() * innerWidth; }
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      });
      frames++;
      if (frames < 60 * 14) confettiRAF = requestAnimationFrame(loop);
      else cv.hidden = true;
    })();
  }

  /* =========================================================
     12b. おとも（画面端のドット絵キャラ）
     ---------------------------------------------------------
     GIF は使わず、静止画5枚を JS で切り替えて動かす。
     ずっとループはせず、待機のあいだにランダムで1回だけ差し込む：
       右に ゆれる： idel → yure1        → yure2        → idel
       左に ゆれる： idel → yure1(反転)  → yure2(反転)  → idel
       まばたき　： idel → mabataki1 → mabataki2 → mabataki1 → idel

     出る場所：
       なかまにする前 … Talk AI の詳細ページ ／ 小松マスターの画面
       なかまにした後 … 全画面（設定の「おとも」で ON/OFF）
     小松マスターの画面にいる おとも をクリックすると なかまになる。
     ========================================================= */
  const MASCOT_DIR = 'Talk-AI-images/web/';
  const MASCOT_FRAMES = ['idel', 'yure1', 'yure2', 'mabataki1', 'mabataki2'];
  /* 各フレームの「足元の中心」のx座標（332×420 の画像内で実測）。
     キャラはフレーム中央（x=166）より左に立っているため、そのまま
     scaleX(-1) すると立ち位置が右へ約43px 飛ぶ。表示時に idel の
     立ち位置へ translateX で補正して、足元を固定する。
     元絵を差し替えたら計測し直すこと。 */
  const MASCOT_W = 332;
  const MASCOT_FEET_X = { idel: 144.6, yure1: 148.3, yure2: 144.5,
                          mabataki1: 144.8, mabataki2: 144.5 };
  /* [フレーム名, 表示ミリ秒] */
  const MASCOT_SWAY  = [['idel', 90], ['yure1', 150], ['yure2', 240], ['idel', 130]];
  const MASCOT_BLINK = [['idel', 60], ['mabataki1', 70], ['mabataki2', 95],
                        ['mabataki1', 70], ['idel', 60]];

  const Mascot = {
    btn: null, hint: null, imgs: {},
    built: false, timer: 0, playing: false,
    shown: false, gettable: false,

    /* フレーム画像は初回に出すときだけ作る（出さない人には読み込ませない） */
    build() {
      if (this.built) return;
      this.built = true;
      MASCOT_FRAMES.forEach((n, i) => {
        const img = document.createElement('img');
        img.className = 'mascot__f' + (i === 0 ? ' is-on' : '');
        img.src = MASCOT_DIR + n + '.webp';
        img.alt = '';
        img.decoding = 'async';
        img.draggable = false;
        this.imgs[n] = img;
        this.btn.appendChild(img);
      });
    },

    /* 1枚だけ見せる。flip = true なら左右反転。
       どのフレーム・向きでも足元が idel と同じ位置に来るよう補正する */
    show(name, flip) {
      MASCOT_FRAMES.forEach((n) => {
        this.imgs[n].classList.toggle('is-on', n === name);
      });
      const feet = flip ? (MASCOT_W - MASCOT_FEET_X[name]) : MASCOT_FEET_X[name];
      const dx = (MASCOT_FEET_X.idel - feet) / MASCOT_W * 100;
      this.imgs[name].style.transform =
        'translateX(' + dx.toFixed(2) + '%)' + (flip ? ' scaleX(-1)' : '');
    },

    /* コマ送り */
    play(seq, flip, done) {
      let i = 0;
      const step = () => {
        if (i >= seq.length) { this.playing = false; if (done) done(); return; }
        const f = seq[i++];
        this.show(f[0], flip);
        this.timer = setTimeout(step, f[1]);
      };
      this.playing = true;
      step();
    },

    /* つぎの動きを予約（1.6〜5.2秒後にランダムで1回だけ） */
    schedule() {
      clearTimeout(this.timer);
      if (!this.shown || !settings.anim) return;
      this.timer = setTimeout(() => {
        const r = Math.random();
        if (r < 0.3)      this.play(MASCOT_SWAY,  false, () => this.schedule()); // 右
        else if (r < 0.6) this.play(MASCOT_SWAY,  true,  () => this.schedule()); // 左
        else              this.play(MASCOT_BLINK, false, () => this.schedule()); // まばたき
      }, 1600 + Math.random() * 3600);
    },

    stop() { clearTimeout(this.timer); this.playing = false; },

    /* 表示するかどうかを状況から決め直す */
    sync() {
      const box = document.getElementById('mascot');
      if (!box) return;
      this.btn  = document.getElementById('mascotBtn');
      this.hint = document.getElementById('mascotHint');

      const started  = document.getElementById('boot').classList.contains('is-out');
      const onMaster = document.getElementById('master').hidden === false;
      const onTalkAI = (location.hash || '').indexOf('#/works/talkai') === 0;

      const show = started && (progress.mascot ? !!settings.mascot : (onMaster || onTalkAI));
      const gettable = show && onMaster && !progress.mascot;

      this.shown = show;
      this.gettable = gettable;

      box.hidden = !show;
      box.classList.toggle('is-master', onMaster);
      box.classList.toggle('is-get', gettable);
      this.btn.disabled = !gettable;
      this.hint.hidden = !gettable;

      if (!show) { this.stop(); return; }

      this.build();
      if (!settings.anim) { this.stop(); this.show('idel', false); return; }
      if (!this.playing) { this.show('idel', false); this.schedule(); }
    },

    /* 小松マスターの画面でクリック ＝ なかまにする */
    take() {
      if (!this.gettable) return;
      progress.mascot = true;
      settings.mascot = true;
      saveProgress();
      applySettings();
      Sound.exp();
      flash();
      toast('おとも が なかまに なった！　どこでも でるように なりました');
      this.sync();
    }
  };

  /* =========================================================
     13. サイトカウンター
     ========================================================= */
  function pad(n, len) {
    const s = String(n);
    return s.length >= len ? s : new Array(len - s.length + 1).join('0') + s;
  }

  function readRemote() {
    return new Promise((resolve, reject) => {
      if (CONFIG.counter.driver !== 'remote' || !CONFIG.counter.endpoint) return reject();
      /* APIのコールドスタートが数秒かかることがある。取得はページ読み込み直後に
         始めて起動演出と並行させるので、長めに待っても体感は悪化しにくい */
      const to = setTimeout(reject, 8000);
      fetch(CONFIG.counter.endpoint, { cache: 'no-store' })
        .then((r) => r.json())
        .then((j) => {
          clearTimeout(to);
          const v = CONFIG.counter.countPath.split('.').reduce((o, k) => (o ? o[k] : null), j);
          if (typeof v === 'number') resolve(v); else reject();
        })
        .catch(() => { clearTimeout(to); reject(); });
    });
  }

  function bumpLocal() {
    const n = (Store.get(CONFIG.storageKeys.visits, 0) | 0) + 1;
    Store.set(CONFIG.storageKeys.visits, n);
    return n;
  }

  function paintCounter(value, isRemote) {
    const digits = document.getElementById('counterDigits');
    const box = document.getElementById('counter');
    const len = CONFIG.counter.digits;
    box.hidden = false;

    /* 直前（-1）の状態を出してから +1 させる */
    const before = pad(Math.max(0, value - 1), len).split('');
    digits.innerHTML = before.map((d) => '<i>' + d + '</i>').join('');

    document.getElementById('counterYou').innerHTML = isRemote
      ? 'あなたは <b id="counterOrd">' + value + '</b> 人目の 訪れた人 です'
      : 'あなたの アクセス： <b id="counterOrd">' + value + '</b> かいめ';
    document.getElementById('counterYou').style.visibility = 'hidden';

    setTimeout(() => {
      const after = pad(value, len).split('');
      const cells = digits.querySelectorAll('i');
      after.forEach((d, i) => {
        if (cells[i].textContent !== d) {
          cells[i].textContent = d;
          cells[i].classList.add('is-roll');
        }
      });
      document.getElementById('counterPlus').classList.add('is-on');
      document.getElementById('counterYou').style.visibility = 'visible';
      Sound.exp();
    }, settings.anim ? 800 : 100);
  }

  /* =========================================================
     14. 起動シーケンス
     ========================================================= */
  const BOOT_LINES = [
    'KOMATSU SYSTEM  ver 2026.08',
    '小松の記憶 を よみこんでいます …',
    'LOADING  プロフィール ………… <b>OK</b>',
    'LOADING  さくひん (' + DATA.works.length + ') …………… <b>OK</b>',
    'LOADING  かつどうりれき (' + DATA.history.length + ') …… <b>OK</b>',
    'LOADING  こうかおん ……………… <b>OK</b>',
    'ALL SYSTEMS <b>OK</b>'
  ];

  let bootDone = false;
  function boot() {
    const log = document.getElementById('bootLog');
    const bar = document.getElementById('bootBar');
    const pct = document.getElementById('bootPct');
    const step = settings.anim ? 340 : 40;
    let i = 0;

    function next() {
      if (i >= BOOT_LINES.length) { finish(); return; }
      const line = document.createElement('div');
      line.innerHTML = BOOT_LINES[i];
      log.appendChild(line);
      Sound.tone(1200 - i * 60, 0.03, 0, 0.02);
      i++;
      const p = Math.round((i / BOOT_LINES.length) * 100);
      bar.style.width = p + '%';
      pct.textContent = p + '%';
      bootTimer = setTimeout(next, step);
    }

    function finish() {
      if (bootDone) return;
      bootDone = true;
      bar.style.width = '100%';
      pct.textContent = '100%';
      counterPromise.then((r) => {
        paintCounter(r.v, r.remote);
        setTimeout(() => {
          const btn = document.getElementById('bootPress');
          btn.hidden = false;
        }, settings.anim ? 1500 : 200);
      });
    }

    let bootTimer = setTimeout(next, step);

    /* 途中でタップ／キーを押したら早送り */
    function skip() {
      if (bootDone) return;
      clearTimeout(bootTimer);
      log.innerHTML = BOOT_LINES.map((l) => '<div>' + l + '</div>').join('');
      finish();
    }
    document.getElementById('boot').addEventListener('click', (e) => {
      if (e.target.closest('#bootPress')) return;
      Sound.resume(); skip();
    });
    window.addEventListener('keydown', function onKey(e) {
      Sound.resume();
      if (!bootDone) { skip(); return; }
      if (!document.getElementById('bootPress').hidden) {
        e.preventDefault();
        enter();
        window.removeEventListener('keydown', onKey);
      }
    });
  }

  function enter() {
    const boot = document.getElementById('boot');
    if (boot.classList.contains('is-out')) return;
    Sound.resume();
    Sound.open();
    boot.classList.add('is-out');
    setTimeout(() => { boot.style.display = 'none'; }, settings.anim ? 500 : 20);
    document.getElementById('app').hidden = false;
    if (!location.hash || location.hash === '#') location.hash = '#/intro';
    else render();
    updateGauge();
    Mascot.sync();
  }

  /* =========================================================
     15. 初期化
     ========================================================= */
  applySettings();
  Sound.boot();
  updateGauge();

  /* カウンター取得は起動演出と並行して先に始めておく（boot の finish が待ち受ける） */
  const counterPromise = CONFIG.counter.driver === 'remote'
    ? readRemote().then((v) => ({ v: v, remote: true })).catch(() => ({ v: bumpLocal(), remote: false }))
    : Promise.resolve({ v: bumpLocal(), remote: false });

  document.getElementById('bootPress').addEventListener('click', () => {
    Sound.resume();
    enter();
  });

  /* ハッシュ付きで開かれた場合も、まずはローディングから */
  boot();

  window.addEventListener('resize', () => {
    document.querySelectorAll('canvas.js-sprite').forEach((c) => { c.dataset.painted = ''; });
    paintSprites(document);
  });

})();

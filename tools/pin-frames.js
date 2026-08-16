/* =========================================================
   おとも（Talk-AI-images/web/*.png）の立ち位置をそろえるツール

   何をするか
     5枚のフレームは Live2D から書き出したときに 立ち位置と下端が
     数px ずつズレていて、コマを切り替えるたびにキャラが横滑りする。
     このツールは「足元（下端から12px）の左右中心」と「下端の y」を
     全フレームで idel に合わせ、画像そのものに焼き込む。
     ※ 拡大率は実測で 0.4% 以内しか違わなかったので触らない。
        （大きさを変えると顔の描き込みが甘くなるため）

   使い方
     1) プロジェクトのルートでローカルサーバーを立てる
          python -m http.server 8123
     2) node tools/pin-frames.js          … 計測だけ（書き出さない）
        node tools/pin-frames.js --apply  … 書き出す
     元の画像は Talk-AI-images/web/_before/ に退避される（初回のみ）。

   出力後は app.js の MASCOT_FEET_X（=144.5）が全フレーム共通で使える。
   元絵を差し替えたら、このツールを流し直してから値を確認すること。
   ========================================================= */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ORIGIN = process.env.ORIGIN || 'http://127.0.0.1:8123';
const APPLY = process.argv.includes('--apply');
const PROJ = path.resolve(__dirname, '..');
const WEB_DIR = path.join(PROJ, 'Talk-AI-images', 'web');
const NAMES = ['idel', 'yure1', 'yure2', 'mabataki1', 'mabataki2'];
const REF = 'idel';
const W = 332, H = 420;
const WEBP_QUALITY = 0.95;

const CHROME_CANDIDATES = [
  process.env.CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome'
].filter(Boolean);
const CHROME = CHROME_CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
if (!CHROME) { console.error('Chrome が見つかりません。環境変数 CHROME で指定してください。'); process.exit(1); }

const PORT = 9366;
const TMP = path.join(require('os').tmpdir(), 'pin-frames-profile');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + TMP, 'about:blank'
], { stdio: 'ignore' });

(async () => {
  let target = null;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      target = (await r.json()).find((x) => x.type === 'page');
      if (target) break;
    } catch (e) { /* まだ起動中 */ }
    await sleep(300);
  }
  if (!target) { console.error('Chrome の起動に失敗しました'); proc.kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  await new Promise((r) => { ws.onopen = r; });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  };
  const send = (method, params) => new Promise((res) => {
    const mid = ++id; pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
  });
  const js = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: 600000 });
    if (r.exceptionDetails) {
      console.error('実行エラー:', r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      ws.close(); proc.kill(); process.exit(1);
    }
    return r.result && r.result.value;
  };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: ORIGIN + '/index.html' });
  await sleep(1500);

  const raw = await js(`(async () => {
    const NAMES = ${JSON.stringify(NAMES)}, REF = ${JSON.stringify(REF)};
    const W = ${W}, H = ${H};
    async function load(n){ const i = new Image(); i.src = 'Talk-AI-images/web/' + n + '.png'; await i.decode(); return i; }
    function measure(src){
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(src, 0, 0);
      const d = x.getImageData(0, 0, W, H).data;
      const rows = []; let top = -1, bot = -1;
      for (let y = 0; y < H; y++) {
        let l = -1, r = -1;
        for (let px = 0; px < W; px++) if (d[(y*W+px)*4+3] > 60) { if (l < 0) l = px; r = px; }
        rows.push(l < 0 ? null : { l, r });
        if (l >= 0) { if (top < 0) top = y; bot = y; }
      }
      let fl = 1e9, fr = -1;
      for (let y = Math.max(0, bot-12); y <= bot; y++) { const rr = rows[y]; if (rr) { if (rr.l < fl) fl = rr.l; if (rr.r > fr) fr = rr.r; } }
      return { top, bot, feetC: (fl + fr) / 2 };
    }
    const imgs = {}, before = {};
    for (const n of NAMES) { imgs[n] = await load(n); before[n] = measure(imgs[n]); }
    const ref = before[REF];
    const shift = {}, png = {}, webp = {}, after = {};
    for (const n of NAMES) {
      const dx = Math.round((ref.feetC - before[n].feetC) * 2) / 2;
      const dy = ref.bot - before[n].bot;
      shift[n] = { dx, dy };
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(imgs[n], dx, dy);
      png[n] = c.toDataURL('image/png');
      webp[n] = c.toDataURL('image/webp', ${WEBP_QUALITY});
      after[n] = measure(c);
    }
    return JSON.stringify({ before, shift, after, png, webp });
  })()`);

  const o = JSON.parse(raw);
  const line = (n, m) => ` ${n.padEnd(11)} 足元中心 ${String(m.feetC).padStart(6)}   下端 ${String(m.bot).padStart(3)}   上端 ${String(m.top).padStart(3)}`;
  console.log('--- いまの状態 ---');
  NAMES.forEach((n) => console.log(line(n, o.before[n])));
  console.log('\n--- 焼き込む平行移動 ---');
  NAMES.forEach((n) => console.log(` ${n.padEnd(11)} dx=${String(o.shift[n].dx).padStart(5)}  dy=${String(o.shift[n].dy).padStart(3)}`));
  console.log('\n--- 焼き込んだ後 ---');
  NAMES.forEach((n) => console.log(line(n, o.after[n])));

  const spread = (obj, k) => {
    const v = NAMES.map((n) => obj[n][k]);
    return +(Math.max(...v) - Math.min(...v)).toFixed(2);
  };
  console.log('\nばらつき  足元中心:', spread(o.before, 'feetC'), '→', spread(o.after, 'feetC'),
    ' / 下端:', spread(o.before, 'bot'), '→', spread(o.after, 'bot'));
  console.log('\napp.js の MASCOT_FEET_X に使う値:', o.after[REF].feetC);

  if (APPLY) {
    const bak = path.join(WEB_DIR, '_before');
    fs.mkdirSync(bak, { recursive: true });
    NAMES.forEach((n) => {
      ['png', 'webp'].forEach((ext) => {
        const s = path.join(WEB_DIR, n + '.' + ext);
        const d = path.join(bak, n + '.' + ext);
        if (fs.existsSync(s) && !fs.existsSync(d)) fs.copyFileSync(s, d);
      });
      const p = Buffer.from(o.png[n].split(',')[1], 'base64');
      const w = Buffer.from(o.webp[n].split(',')[1], 'base64');
      fs.writeFileSync(path.join(WEB_DIR, n + '.png'), p);
      fs.writeFileSync(path.join(WEB_DIR, n + '.webp'), w);
      console.log('書き出し', n.padEnd(11), Math.round(p.length / 1024) + 'KB(png)', Math.round(w.length / 1024) + 'KB(webp)');
    });
  } else {
    console.log('\n※ 計測のみ。書き出すには --apply を付けて実行');
  }
  ws.close(); proc.kill(); process.exit(0);
})();

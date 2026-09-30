/* WEB TABUNGAN — LAYER 3 (JavaScript). Satu file, tanpa library, tanpa data bawaan.
   Semua data dinamis berasal dari Google Apps Script. */
(() => {
'use strict';

// ==================================================
// # /api
// ==================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwt8HGwnDW5ZolvkzAtzLuyNGbJClTUQLWivSyANcs4vxWBIsZsFVp8n8DOKQVN-auV/exec';
const TOKEN_KEY = 'wt_token';
const ACTIONS = new Set(['login', 'validateToken', 'changePassword', 'getDashboard', 'addTransaction',
  'getTransactions', 'editTransaction', 'deleteTransaction', 'getTarget', 'createTarget', 'updateTarget',
  'completeTarget', 'getHallOfFame', 'getAchievements', 'getQuote', 'getMonthlyStat', 'getMonthlyTrend',
  'simulateTarget', 'backup', 'restore']);

class ApiError extends Error {
  constructor(message, code, session) { super(message); this.code = code || 0; this.session = !!session; }
}
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage tidak tersedia */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* abaikan */ } },
};

// Satu-satunya pintu komunikasi ke backend.
async function apiRequest(action, data) {
  if (!ACTIONS.has(action)) throw new ApiError('Aksi tidak dikenali.');
  const body = new URLSearchParams({ payload: JSON.stringify({ action, token: store.get(TOKEN_KEY), data: data || {} }) });
  let res;
  try {
    res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  } catch (e) {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
  }
  let json;
  try { json = await res.json(); } catch (e) { throw new ApiError('Respons server tidak valid.'); }
  if (!json || typeof json.success !== 'boolean') throw new ApiError('Respons server tidak valid.');
  if (!json.success) {
    const expired = json.code === 401 && /^(Unauthorized|Token)/i.test(String(json.error));
    if (expired) handleSessionExpired();
    throw new ApiError(String(json.error || 'Terjadi kesalahan.'), json.code, expired);
  }
  return json.data;
}

// ==================================================
// # /shared
// ==================================================
const state = { user: null, page: null, target: null, dash: null, tx: [], txPage: 0, stat: null,
  achievements: null, hof: null, cal: null };
const PAGES = ['dashboard', 'finance', 'wishlist', 'statistics', 'settings'];
const TIPE = { INCOME: 'Pemasukan', EXPENSE: 'Pengeluaran', SAVING: 'Saving', WITHDRAWAL: 'Withdrawal' };
const PAGE_SIZE = 10;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const pad = n => String(n).padStart(2, '0');

// Buat elemen tanpa innerHTML (data selalu masuk sebagai teks).
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c != null) e.append(c); });
  return e;
}
const badge = tipe => h('span', { class: 'badge badge--' + String(tipe).toLowerCase(), text: TIPE[tipe] || tipe });
const isNum = v => v !== null && v !== undefined && v !== '' && isFinite(Number(v));
const fmtRp = v => isNum(v) ? 'Rp' + Number(v).toLocaleString('id-ID') : '—';
const fmtPct = v => isNum(v) ? Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + '%' : '—';
function fmtDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
  if (!m) return '—';
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
const todayStr = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
const compact = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'jt' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'rb' : String(Math.round(n));
const setText = (sel, v, root) => { const e = $(sel, root); if (e) e.textContent = v; };
const fillList = (sel, items, build) => { const ul = $(sel); ul.replaceChildren(...items.map(build)); return items.length; };
function errMsg(e) {
  if (e instanceof ApiError) return e.code >= 500 ? 'Server sedang bermasalah. Coba lagi nanti.' : e.message;
  return 'Terjadi kesalahan tak terduga.';
}
async function settle(promises) {
  const r = await Promise.allSettled(promises);
  return r.map(x => x.status === 'fulfilled' ? { ok: true, v: x.value } : { ok: false, e: x.reason });
}
const softFail = list => { const seen = new Set(); list.forEach(x => { if (!x.ok && !x.e.session && !seen.has(x.e.message)) { seen.add(x.e.message); toast(errMsg(x.e), 'error'); } }); };

function toast(msg, type = 'info') {
  const t = h('div', { class: 'toast toast--' + type, text: msg });
  $('#toast-region').append(t);
  setTimeout(() => t.remove(), type === 'error' ? 6000 : 4000);
}
let busyCount = 0;
function overlay(on) { busyCount = Math.max(0, busyCount + (on ? 1 : -1)); $('#global-loading').hidden = busyCount === 0; }
async function withBusy(btn, fn) {
  btn.disabled = true; btn.classList.add('is-loading');
  try { return await fn(); } finally { btn.disabled = false; btn.classList.remove('is-loading'); }
}
function formError(sel, msg) { const p = $(sel); p.textContent = msg || ''; p.hidden = !msg; }
function setEmpty(sec, isEmpty, ...content) {
  const s = $(sec);
  $(':scope > .state-empty', s).hidden = !isEmpty;
  content.forEach(c => { const e = $(c, s); if (e) e.hidden = isEmpty; });
}
function confirmDialog(title, message) {
  return new Promise(resolve => {
    const d = $('#confirm-dialog');
    setText('#confirm-title', title); setText('#confirm-message', message);
    let result = false;
    $('#confirm-ok').onclick = () => { result = true; d.close(); };
    $('#confirm-cancel').onclick = () => d.close();
    d.onclose = () => resolve(result);
    d.showModal();
  });
}
function showAchievements(list) {
  if (!Array.isArray(list) || !list.length) return;
  fillList('#ach-dialog-list', list, a => h('li', { class: 'rarity--' + String(a.rarity).toLowerCase() },
    h('strong', { text: `${a.icon} ${a.nama}` }), h('p', { text: a.deskripsi }),
    h('small', { text: `${a.rarity} · +${a.xp_reward} XP` })));
  $('#achievement-dialog').showModal();
}

// Status view: loading | error | ready
function setViewState(view, s, msg) {
  const load = $(':scope > [data-state="loading"]', view), err = $(':scope > [data-state="error"]', view);
  if (load) load.hidden = s !== 'loading'; // #view-settings tidak punya elemen state
  if (err) { err.hidden = s !== 'error'; if (s === 'error') setText('[data-slot="message"]', msg, err); }
  else if (s === 'error') toast(msg, 'error');
  Array.from(view.children).forEach(c => { if (!c.matches('h2,[data-state],dialog')) c.hidden = s !== 'ready'; });
}
const LOADERS = { dashboard: loadDashboard, finance: loadFinance, wishlist: loadWishlist, statistics: loadStatistics, settings: loadSettings };
async function showPage(name) {
  if (!PAGES.includes(name)) name = 'dashboard';
  state.page = name;
  PAGES.forEach(p => { $('#view-' + p).hidden = p !== name; });
  $$('#app-nav a').forEach(a => { if (a.dataset.nav === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const view = $('#view-' + name);
  setViewState(view, 'loading');
  try {
    await LOADERS[name]();
    if (state.page === name) setViewState(view, 'ready');
  } catch (e) {
    if (state.page === name && !e.session) setViewState(view, 'error', errMsg(e));
  }
  window.scrollTo(0, 0);
}
const softReload = async fn => { try { await fn(); } catch (e) { if (!e.session) toast(errMsg(e), 'error'); } };
const route = () => { if (state.user) showPage(location.hash.slice(1)); };

function fillTargetSelects(extraId) {
  const t = state.target && state.target.status === 'ACTIVE' ? state.target : null;
  ['#quick-target', '#fin-form-target'].forEach(sel => {
    const s = $(sel);
    while (s.options.length > 1) s.remove(1);
    if (t) s.add(new Option(t.nama_target, t.id));
    if (extraId && sel === '#fin-form-target' && !(t && String(t.id) === String(extraId))) s.add(new Option('Target sebelumnya', extraId));
  });
}
async function fetchTarget() {
  try { return await apiRequest('getTarget'); }
  catch (e) { if (e.code === 404) return null; throw e; }
}

// ---- Canvas chart (native) ----
const charts = new Map();
function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function drawChart(canvas, labels, series) {
  const draw = () => {
    const w = canvas.clientWidth; if (!w) return;
    const H = 260, dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr); canvas.height = H * dpr;
    const c = canvas.getContext('2d'); c.scale(dpr, dpr);
    const muted = cssVar('--muted'), grid = cssVar('--border');
    const max = Math.max(0, ...series.flatMap(s => s.values));
    const P = { l: 52, r: 10, t: 28, b: 26 }, pw = w - P.l - P.r, ph = H - P.t - P.b;
    c.font = '11px sans-serif'; c.strokeStyle = grid; c.fillStyle = muted; c.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = P.t + ph - ph * i / 4;
      c.beginPath(); c.moveTo(P.l, y); c.lineTo(w - P.r, y); c.stroke();
      c.fillText(compact(max * i / 4), P.l - 6, y + 4);
    }
    const n = labels.length, gw = pw / n, bw = Math.max(1, Math.min(18, gw * 0.8 / series.length));
    series.forEach((s, si) => {
      c.fillStyle = s.color;
      s.values.forEach((v, i) => {
        const bh = max ? ph * v / max : 0;
        c.fillRect(P.l + gw * i + (gw - bw * series.length) / 2 + bw * si, P.t + ph - bh, bw, bh);
      });
    });
    c.fillStyle = muted; c.textAlign = 'center';
    const step = Math.ceil(n / Math.max(1, Math.floor(pw / 48)));
    labels.forEach((l, i) => { if (i % step === 0) c.fillText(l, P.l + gw * i + gw / 2, H - 8); });
    let x = P.l; c.textAlign = 'left';
    series.forEach(s => { c.fillStyle = s.color; c.fillRect(x, 9, 10, 10); c.fillStyle = muted; c.fillText(s.name, x + 14, 18); x += c.measureText(s.name).width + 34; });
  };
  charts.set(canvas, draw); draw();
}
// Tampilkan chart hanya bila ada nilai; kembalikan true jika digambar.
function renderChart(sec, canvasSel, labels, series) {
  const canvas = $(canvasSel), has = series.some(s => s.values.some(v => v > 0));
  setEmpty(sec, !has, canvasSel);
  if (!has) { charts.delete(canvas); return false; }
  drawChart(canvas, labels, series); return true;
}
const seriesOf = (rows, defs) => defs.map(d => ({ name: d.name, color: cssVar(d.color), values: rows.map(r => Number(r[d.key]) || 0) }));
const SERIES = [{ name: 'Pemasukan', key: 'income', color: '--success' }, { name: 'Pengeluaran', key: 'expense', color: '--danger' },
  { name: 'Saving', key: 'saving', color: '--primary-text' }, { name: 'Withdrawal', key: 'withdrawal', color: '--warning' }];

// ==================================================
// # /login
// ==================================================
async function sha256Hex(text) {
  if (!(window.crypto && crypto.subtle)) throw new ApiError('Browser ini tidak mendukung hashing yang aman. Gunakan HTTPS.');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function showLogin(message) {
  $('#app-shell').hidden = true; $('#view-login').hidden = false;
  $('#login-loading').hidden = true; $('#login-submit').disabled = false;
  formError('#login-error', message);
}
function enterApp(username) {
  state.user = { username };
  $('#view-login').hidden = true; $('#app-shell').hidden = false;
  setText('#set-username', username);
  route();
}
function handleSessionExpired() {
  store.del(TOKEN_KEY); state.user = null; state.page = null;
  showLogin('Sesi berakhir. Silakan login kembali.');
}
async function onLoginSubmit(ev) {
  ev.preventDefault();
  const username = $('#login-username').value.trim(), password = $('#login-password').value;
  if (!username || !password) return formError('#login-error', 'Username dan password wajib diisi.');
  formError('#login-error', ''); $('#login-loading').hidden = false; $('#login-submit').disabled = true;
  try {
    const password_hash = await sha256Hex(password);
    const res = await apiRequest('login', { username, password_hash });
    store.set(TOKEN_KEY, res.token);
    $('#login-password').value = '';
    enterApp(username);
  } catch (e) {
    formError('#login-error', errMsg(e));
  } finally {
    $('#login-loading').hidden = true; $('#login-submit').disabled = false;
  }
}
function logout() {
  store.del(TOKEN_KEY); state.user = null; state.page = null; // logout hanya lokal (backend tidak punya revoke)
  history.replaceState(null, '', location.pathname);
  showLogin('');
}
async function bootstrap() {
  if (!store.get(TOKEN_KEY)) return showLogin('');
  try {
    const res = await apiRequest('validateToken');
    enterApp(res.username);
  } catch (e) {
    if (!e.session) showLogin(errMsg(e)); // 401 sudah ditangani handleSessionExpired
  }
}

// ==================================================
// # /dashboard
// ==================================================
const TX_FIELDS_QUICK = { tipe: '#quick-tipe', tanggal: '#quick-tanggal', kategori: '#quick-kategori', nominal: '#quick-nominal', target: '#quick-target', ket: '#quick-keterangan' };
const TX_FIELDS_FORM = { tipe: '#fin-form-tipe', tanggal: '#fin-form-tanggal', kategori: '#fin-form-kategori', nominal: '#fin-form-nominal', target: '#fin-form-target', ket: '#fin-form-keterangan' };

// Validasi UX saja; backend tetap authority.
function readTx(f) {
  const d = { tipe: $(f.tipe).value, tanggal: $(f.tanggal).value, kategori: $(f.kategori).value.trim(),
    nominal: $(f.nominal).value, keterangan: $(f.ket).value.trim(), target_id: $(f.target).value };
  let err = '';
  if (!d.tipe || !d.tanggal || !d.kategori || d.nominal === '') err = 'Tipe, tanggal, kategori, dan nominal wajib diisi.';
  else if (!(Number(d.nominal) > 0)) err = 'Nominal harus lebih dari 0.';
  else if ((d.tipe === 'SAVING' || d.tipe === 'WITHDRAWAL') && !d.target_id) err = 'Target wajib dipilih untuk Saving dan Withdrawal. Buat wishlist terlebih dahulu jika belum ada.';
  d.nominal = Number(d.nominal);
  return { d, err };
}
async function loadDashboard() {
  const [dash, month, recent] = await settle([apiRequest('getDashboard'), apiRequest('getMonthlyStat', {}), apiRequest('getTransactions', { limit: 5 })]);
  if (!dash.ok) throw dash.e;
  if (state.page !== 'dashboard') return;
  softFail([month, recent]);
  const d = state.dash = dash.v;
  state.target = d.target; fillTargetSelects();
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Jakarta' }));
  setText('#dash-greeting-text', hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam');
  setText('#dash-username', state.user ? state.user.username : '');
  if (d.level) {
    setText('#dash-level', `${d.level.icon} Level ${d.level.level} · ${d.level.nama}`);
    setText('#dash-user-info', `Total XP: ${Number(d.level.total_xp || 0).toLocaleString('id-ID')}`);
  }
  setText('#dash-streak', `Streak: ${d.streak || 0} hari`);
  // Quote
  const q = d.quote;
  setEmpty('#dash-quote', !q || !q.quote, 'blockquote');
  if (q) { setText('[data-slot="quote"]', q.quote, $('#dash-quote')); setText('[data-slot="author"]', q.author || '', $('#dash-quote')); }
  // Ringkasan (saldo total tidak tersedia dari backend)
  setText('#sum-total', 'Belum tersedia dari backend');
  setText('#sum-income-today', fmtRp(d.summary_today && d.summary_today.income));
  setText('#sum-expense-today', fmtRp(d.summary_today && d.summary_today.expense));
  setText('#sum-income-month', month.ok ? fmtRp(month.v.summary.total_income) : '—');
  setText('#sum-expense-month', month.ok ? fmtRp(month.v.summary.total_expense) : '—');
  renderTargetCard('#dash-wishlist', '#dash-wishlist-data', '#dash-wishlist-progress', d.target);
  renderDashChart();
  const dates = Array.isArray(d.saving_dates) ? d.saving_dates : [];
  if (!state.cal) { const [y, m] = todayStr().split('-'); state.cal = { y: +y, m: +m - 1 }; }
  setEmpty('#dash-calendar', dates.length === 0, '#dash-calendar-grid');
  $('#dash-calendar-grid').hidden = false; // kalender tetap tampil; empty state hanya informasi
  renderCalendar();
  const txs = recent.ok ? recent.v.transactions : [];
  setEmpty('#dash-recent', txs.length === 0, '#dash-recent-list');
  fillList('#dash-recent-list', txs, t => h('li', {}, badge(t.tipe), ' ', h('strong', { text: String(t.kategori) }), ' ', fmtRp(t.nominal), ' · ', fmtDate(t.tanggal)));
  const ach = d.recent_achievements || [];
  setText('#dash-ach-count', `${d.unlocked_achievements || 0} dari ${d.total_achievements || 0} achievement terbuka`);
  setEmpty('#dash-achievements', ach.length === 0, '#dash-ach-list');
  fillList('#dash-ach-list', ach, a => h('li', { class: 'rarity--' + String(a.rarity).toLowerCase() },
    h('strong', { text: `${a.icon} ${a.nama}` }), h('small', { text: ` ${a.rarity} · +${a.xp_reward} XP · ${fmtDate(a.tanggal_unlock)}` })));
}
// Kartu target (dipakai dashboard dan wishlist)
function renderTargetCard(sec, dataSel, progSel, t) {
  setEmpty(sec, !t, dataSel);
  if (!t) return;
  const box = $(dataSel), slot = n => $(`[data-slot="${n}"]`, box);
  slot('nama').textContent = t.nama_target;
  slot('target-nominal').textContent = 'Target: ' + fmtRp(t.target_nominal);
  slot('persen').textContent = `Progress: ${fmtPct(t.persen)} (${fmtRp(t.total_saving)})`;
  slot('status').textContent = 'Status: ' + ({ ACTIVE: 'Aktif', COMPLETED: 'Tercapai', CANCELLED: 'Dibatalkan' }[t.status] || t.status);
  slot('prediksi').textContent = t.prediksi_selesai ? 'Estimasi selesai: ' + fmtDate(t.prediksi_selesai) : 'Prediksi belum tersedia';
  $(progSel).value = Number(t.persen) || 0;
}
function renderDashChart() {
  const d = state.dash; if (!d) return;
  const range = ($('input[name="dash-range"]:checked') || {}).value === '30' ? d.chart_30days : d.chart_7days;
  const rows = Array.isArray(range) ? range : [];
  renderChart('#dash-chart', '#dash-chart-canvas', rows.map(r => String(r.tanggal).slice(8)), seriesOf(rows, SERIES.slice(0, 3)));
}
function renderCalendar() {
  const { y, m } = state.cal, g = $('#dash-calendar-grid');
  const active = new Set((state.dash && state.dash.saving_dates) || []), today = todayStr();
  setText('#dash-calendar-label', new Date(y, m, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
  const cells = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(n => h('span', { text: n }));
  for (let i = 0; i < new Date(y, m, 1).getDay(); i++) cells.push(h('span'));
  for (let day = 1; day <= new Date(y, m + 1, 0).getDate(); day++) {
    const key = `${y}-${pad(m + 1)}-${pad(day)}`;
    cells.push(h('span', { class: [active.has(key) ? 'has-activity' : '', key === today ? 'is-today' : ''].join(' ').trim(),
      text: String(day), 'aria-label': active.has(key) ? `${day}: ada tabungan` : null }));
  }
  g.replaceChildren(...cells);
}
function moveCalendar(delta) {
  const c = state.cal; if (!c) return;
  const d = new Date(c.y, c.m + delta, 1); state.cal = { y: d.getFullYear(), m: d.getMonth() };
  renderCalendar();
}
async function onQuickAdd(ev) {
  ev.preventDefault();
  const { d, err } = readTx(TX_FIELDS_QUICK);
  if (err) return formError('#quick-error', err);
  formError('#quick-error', '');
  await withBusy($('#quick-add-form [type="submit"]'), async () => {
    try {
      const res = await apiRequest('addTransaction', d);
      toast(res.message || 'Transaksi berhasil ditambahkan.', 'success');
      $('#quick-add-form').reset();
      showAchievements(res.new_achievements);
      await softReload(loadDashboard);
    } catch (e) { formError('#quick-error', errMsg(e)); }
  });
}

// ==================================================
// # /finance
// ==================================================
async function fetchAllTx(filter) {
  let all = [], offset = 0, total = 0;
  do {
    const r = await apiRequest('getTransactions', { ...filter, limit: 500, offset });
    all = all.concat(r.transactions || []); total = r.total || 0; offset += 500;
    if (!(r.transactions || []).length) break;
  } while (all.length < total);
  return all;
}
async function loadFinance() {
  const f = {}, tipe = $('#fin-filter-tipe').value, a = $('#fin-filter-from').value, b = $('#fin-filter-to').value;
  if (a && b && a > b) { toast('Tanggal awal tidak boleh setelah tanggal akhir.', 'warning'); return; }
  if (tipe) f.tipe = tipe; if (a) f.tanggal_mulai = a; if (b) f.tanggal_selesai = b;
  const [target, rows] = await Promise.all([fetchTarget(), fetchAllTx(f)]);
  if (state.page !== 'finance') return;
  state.target = target; state.tx = rows; state.txPage = 0;
  fillTargetSelects(); renderFinance();
}
function renderFinance() {
  const sum = { INCOME: 0, EXPENSE: 0, SAVING: 0, WITHDRAWAL: 0 };
  state.tx.forEach(t => { if (t.tipe in sum) sum[t.tipe] += Number(t.nominal) || 0; });
  setText('#fin-sum-income', fmtRp(sum.INCOME)); setText('#fin-sum-expense', fmtRp(sum.EXPENSE));
  setText('#fin-sum-saving', fmtRp(sum.SAVING)); setText('#fin-sum-withdrawal', fmtRp(sum.WITHDRAWAL));
  setText('#fin-sum-net', fmtRp(sum.INCOME - sum.EXPENSE)); // definisi sama dengan saldo_bersih backend (income − expense)
  const q = $('#fin-search').value.trim().toLowerCase();
  const rows = q ? state.tx.filter(t => [t.kategori, t.keterangan, TIPE[t.tipe], t.nominal].join(' ').toLowerCase().includes(q)) : state.tx;
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  state.txPage = Math.min(state.txPage, pages - 1);
  const slice = rows.slice(state.txPage * PAGE_SIZE, (state.txPage + 1) * PAGE_SIZE);
  setEmpty('#fin-list', rows.length === 0, 'table', '#fin-pagination');
  const tg = state.target;
  fillList('#fin-tbody', slice, t => h('tr', {},
    h('td', { text: fmtDate(t.tanggal) }), h('td', {}, badge(t.tipe)), h('td', { text: String(t.kategori) }),
    h('td', { text: fmtRp(t.nominal) }), h('td', { text: t.keterangan || '—' }),
    h('td', { text: t.target_id ? (tg && String(tg.id) === String(t.target_id) ? tg.nama_target : String(t.target_id)) : '—' }),
    h('td', {}, h('button', { type: 'button', 'data-action': 'edit-tx', 'data-id': t.id, text: 'Edit' }), ' ',
      h('button', { type: 'button', 'data-action': 'del-tx', 'data-id': t.id, text: 'Hapus' }))));
  setText('#fin-page-info', `Halaman ${state.txPage + 1} dari ${pages}`);
  $('[data-action="page-prev"]').disabled = state.txPage === 0;
  $('[data-action="page-next"]').disabled = state.txPage >= pages - 1;
}
function openTxForm(tx) {
  const form = $('#fin-form'); form.reset(); formError('#fin-form-error', '');
  setText('#fin-form-title', tx ? 'Edit transaksi' : 'Tambah transaksi');
  $('#fin-form-id').value = tx ? tx.id : '';
  fillTargetSelects(tx && tx.target_id);
  if (tx) {
    $(TX_FIELDS_FORM.tipe).value = tx.tipe; $(TX_FIELDS_FORM.tanggal).value = tx.tanggal;
    $(TX_FIELDS_FORM.kategori).value = tx.kategori; $(TX_FIELDS_FORM.nominal).value = tx.nominal;
    $(TX_FIELDS_FORM.ket).value = tx.keterangan || ''; $(TX_FIELDS_FORM.target).value = tx.target_id || '';
  }
  $('#fin-modal-form').showModal();
}
async function onTxSubmit(ev) {
  ev.preventDefault();
  const { d, err } = readTx(TX_FIELDS_FORM);
  if (err) return formError('#fin-form-error', err);
  const id = $('#fin-form-id').value;
  await withBusy($('#fin-form-submit'), async () => {
    try {
      const res = id ? await apiRequest('editTransaction', { id, ...d }) : await apiRequest('addTransaction', d);
      $('#fin-modal-form').close();
      toast(res.message || 'Transaksi tersimpan.', 'success');
      showAchievements(res.new_achievements);
      await softReload(loadFinance);
    } catch (e) { formError('#fin-form-error', errMsg(e)); }
  });
}
async function onDeleteTx(id) {
  if (!(await confirmDialog('Hapus transaksi', 'Transaksi yang dihapus tidak bisa dikembalikan. Lanjutkan?'))) return;
  overlay(true);
  try {
    const res = await apiRequest('deleteTransaction', { id });
    toast(res.message || 'Transaksi dihapus.', 'success');
    await loadFinance();
  } catch (e) { if (!e.session) toast(errMsg(e), 'error'); } finally { overlay(false); }
}
function resetFinanceFilters() {
  ['#fin-search', '#fin-filter-tipe', '#fin-filter-from', '#fin-filter-to'].forEach(s => { $(s).value = ''; });
  softReload(loadFinance);
}

// ==================================================
// # /wishlist
// ==================================================
let wlEditing = false;
async function loadWishlist() {
  const t = await fetchTarget();
  if (state.page !== 'wishlist') return;
  state.target = t; wlEditing = false;
  renderTargetCard('#wl-main', '#wl-main-data', '#wl-progress', t);
  if (t) {
    const box = $('#wl-main-data');
    setText('[data-slot="total-saving"]', 'Terkumpul: ' + fmtRp(t.total_saving), box);
    setText('[data-slot="kurang"]', 'Kurang: ' + fmtRp(t.kurang), box);
    setText('[data-slot="tanggal-mulai"]', 'Mulai: ' + fmtDate(t.tanggal_mulai), box);
    // Milestone: ambang 25/50/75/100% dari target_nominal, dibandingkan dengan persen dari backend.
    fillList('#wl-milestones', [25, 50, 75, 100], p => h('li', { class: Number(t.persen) >= p ? 'is-active' : '' },
      `${p}% · ${fmtRp(Number(t.target_nominal) * p / 100)} · ${Number(t.persen) >= p ? 'Tercapai' : 'Belum tercapai'}`));
  }
  const lim = $('#wl-all [data-limitation]'); lim.textContent = lim.dataset.limitation; lim.hidden = false;
  setEmpty('#wl-all', !t, '#wl-all-list');
  fillList('#wl-all-list', t ? [t] : [], x => h('li', {}, h('strong', { text: x.nama_target }), ` · ${fmtRp(x.target_nominal)} · ${fmtPct(x.persen)}`));
  const done = $('#wl-done > .state-empty'); // backend tidak mengembalikan daftar wishlist tercapai
  done.textContent = 'Daftar wishlist tercapai belum tersedia dari backend. Lihat Hall of Fame di Statistics.';
  done.hidden = false; $('#wl-done-list').hidden = true;
  setWishlistForm(t ? 'locked' : 'create');
}
function setWishlistForm(mode) {
  const locked = mode === 'locked';
  $$('#wl-form input, #wl-form button').forEach(e => { e.disabled = locked; });
  setText('#wl-form-submit', mode === 'edit' ? 'Simpan perubahan' : 'Simpan wishlist');
  formError('#wl-form-error', locked ? 'Masih ada target aktif. Selesaikan dulu sebelum membuat target baru.' : '');
}
function startEditTarget() {
  const t = state.target; if (!t) return;
  wlEditing = true; setWishlistForm('edit');
  $('#wl-nama').value = t.nama_target; $('#wl-nominal').value = t.target_nominal;
  $('#wl-nama').focus();
}
async function onWishlistSubmit(ev) {
  ev.preventDefault();
  const nama = $('#wl-nama').value.trim(), nominal = $('#wl-nominal').value;
  if (!nama || nominal === '') return formError('#wl-form-error', 'Nama target dan nominal wajib diisi.');
  if (!(Number(nominal) > 0)) return formError('#wl-form-error', 'Nominal target harus lebih dari 0.');
  formError('#wl-form-error', '');
  await withBusy($('#wl-form-submit'), async () => {
    try {
      const payload = { nama_target: nama, target_nominal: Number(nominal) };
      const res = await apiRequest(wlEditing ? 'updateTarget' : 'createTarget', payload);
      toast(res.message || 'Wishlist tersimpan.', 'success');
      $('#wl-form').reset();
      showAchievements(res.new_achievements);
      await softReload(loadWishlist);
    } catch (e) { formError('#wl-form-error', errMsg(e)); }
  });
}
async function onCompleteTarget() {
  if (!(await confirmDialog('Tandai tercapai', 'Target akan diselesaikan dan dicatat ke Hall of Fame. Lanjutkan?'))) return;
  overlay(true);
  try {
    const res = await apiRequest('completeTarget');
    toast(res.message || 'Target tercapai.', 'success');
    showAchievements(res.new_achievements);
    await loadWishlist();
  } catch (e) { if (!e.session) toast(errMsg(e), 'error'); } finally { overlay(false); }
}

// ==================================================
// # /statistics
// ==================================================
const monthShort = p => { const [y, m] = p.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }); };
async function loadStatistics() {
  const bulan = $('#stat-bulan').value, tahun = $('#stat-tahun').value, months = Number($('#stat-months').value) || 6;
  const args = {}; if (bulan) args.bulan = Number(bulan); if (tahun) args.tahun = Number(tahun);
  const [stat, trend, ach, hof] = await settle([apiRequest('getMonthlyStat', args), apiRequest('getMonthlyTrend', { months }),
    apiRequest('getAchievements'), apiRequest('getHallOfFame')]);
  if (![stat, trend, ach, hof].some(r => r.ok)) throw stat.e;
  if (state.page !== 'statistics') return;
  softFail([stat, trend, ach, hof]);
  renderMonthly(stat.ok ? stat.v : null);
  renderTrend(trend.ok ? trend.v.trend : []);
  state.achievements = ach.ok ? ach.v : null; renderAchievements();
  const list = hof.ok ? (hof.v.hall_of_fame || []) : [];
  setEmpty('#stat-hof', list.length === 0, '#stat-hof-list');
  fillList('#stat-hof-list', list, x => h('li', {}, h('strong', { text: x.nama_target }),
    ` · ${fmtRp(x.target_nominal)} · ${x.total_hari} hari · ${fmtDate(x.tanggal_mulai)} – ${fmtDate(x.tanggal_selesai)} · ${x.total_saving_tx}× saving`));
}
function renderMonthly(v) {
  const s = v && v.summary, has = !!s && s.jumlah_tx > 0;
  setEmpty('#stat-summary', !has, 'dl');
  if (s) {
    [['income', 'total_income'], ['expense', 'total_expense'], ['saving', 'total_saving'], ['withdrawal', 'total_withdrawal'],
      ['net-saving', 'net_saving'], ['saldo', 'saldo_bersih']].forEach(([id, k]) => setText('#stat-' + id, fmtRp(s[k])));
    setText('#stat-count', String(s.jumlah_tx));
  }
  const daily = has ? v.daily_data : [];
  renderChart('#stat-chart', '#stat-chart-canvas', daily.map(r => r.tanggal.slice(8)), seriesOf(daily, SERIES));
  const cat = (v && v.by_category) || {};
  const catLi = x => h('li', {}, h('strong', { text: String(x.kategori) }), ` · ${fmtRp(x.total)} · ${fmtPct(x.persentase)} · ${x.jumlah_tx} tx`);
  [['INCOME', '#stat-income-section', '#stat-income-list'], ['EXPENSE', '#stat-expense-section', '#stat-expense-list'],
    ['SAVING', '#stat-saving-section', '#stat-saving-list']].forEach(([tipe, sec, ul]) => {
    const items = cat[tipe] || [];
    setEmpty(sec, items.length === 0, 'ul'); fillList(ul, items, catLi);
  });
  const rows = Object.keys(TIPE).flatMap(t => (cat[t] || []).map(x => ({ t, ...x })));
  setEmpty('#stat-category', rows.length === 0, 'table');
  fillList('#stat-category-tbody', rows, x => h('tr', {}, h('td', {}, badge(x.t)), h('td', { text: String(x.kategori) }),
    h('td', { text: fmtRp(x.total) }), h('td', { text: fmtPct(x.persentase) }), h('td', { text: String(x.jumlah_tx) })));
}
function renderTrend(trend) {
  const has = trend.some(r => r.jumlah_tx > 0);
  renderChart('#stat-trend', '#stat-trend-canvas', trend.map(r => monthShort(r.period)), seriesOf(trend, SERIES.slice(0, 3)));
  setEmpty('#stat-trend', !has, 'table');
  fillList('#stat-trend-tbody', has ? trend : [], r => h('tr', {}, h('td', { text: monthShort(r.period) }), h('td', { text: fmtRp(r.income) }),
    h('td', { text: fmtRp(r.expense) }), h('td', { text: fmtRp(r.saving) }), h('td', { text: fmtRp(r.withdrawal) }), h('td', { text: fmtRp(r.net_saving) })));
}
function renderAchievements() {
  const a = state.achievements, sec = $('#stat-achievements');
  const list = a ? a.achievements : [], filter = $('#stat-ach-filter').value;
  if (a) {
    setText('[data-slot="opened"]', String(a.summary.opened_count), sec); setText('[data-slot="locked"]', String(a.summary.locked_count), sec);
    setText('[data-slot="xp"]', Number(a.summary.total_xp).toLocaleString('id-ID'), sec);
  }
  const shown = list.filter(x => filter === 'all' || (filter === 'unlocked') === x.is_unlocked);
  setEmpty('#stat-achievements', shown.length === 0, '#stat-ach-list');
  fillList('#stat-ach-list', shown, x => {
    const hidden = x.is_secret && !x.is_unlocked;
    const cls = ['rarity--' + String(x.rarity).toLowerCase(), x.is_unlocked ? '' : 'is-locked', x.is_secret ? 'is-secret' : ''].join(' ').trim();
    return h('li', { class: cls },
      h('strong', { text: hidden ? '🔒 Achievement rahasia' : `${x.icon} ${x.nama}` }),
      h('p', { text: x.is_unlocked ? x.deskripsi : x.clue }),
      h('small', { text: hidden ? x.rarity : `${x.rarity} · ${x.category} · +${x.xp_reward} XP` + (x.is_unlocked ? ` · dibuka ${fmtDate(x.tanggal_unlock)}` : '') }),
      !x.is_unlocked && x.progress !== null ? h('progress', { max: '100', value: String(x.progress_percent || 0) }) : null);
  });
}

// ==================================================
// # /settings
// ==================================================
function loadSettings() {
  setText('#set-username', state.user ? state.user.username : '');
  setText('#set-version', 'Belum ditentukan');
  return Promise.resolve();
}
async function onPasswordSubmit(ev) {
  ev.preventDefault();
  const oldP = $('#pw-old').value, newP = $('#pw-new').value, conf = $('#pw-confirm').value;
  if (!oldP || !newP || !conf) return formError('#pw-error', 'Semua field password wajib diisi.');
  if (newP !== conf) return formError('#pw-error', 'Konfirmasi password baru tidak sama.');
  formError('#pw-error', '');
  await withBusy($('#password-form [type="submit"]'), async () => {
    try {
      const res = await apiRequest('changePassword', { old_password_hash: await sha256Hex(oldP), new_password_hash: await sha256Hex(newP) });
      toast(res.message || 'Password berhasil diubah.', 'success');
      $('#password-form').reset();
    } catch (e) { formError('#pw-error', errMsg(e)); }
  });
}
async function onBackup() {
  await withBusy($('#btn-backup'), async () => {
    try {
      const res = await apiRequest('backup');
      const blob = new Blob([JSON.stringify(res.backup_data, null, 2)], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: `web-tabungan-backup-${String(res.timestamp).replace(/[^0-9T]/g, '')}.json` });
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      setText('#set-backup-info', 'Backup terakhir: ' + res.timestamp);
      toast('Backup berhasil diunduh.', 'success');
      showAchievements(res.new_achievements);
    } catch (e) { if (!e.session) toast(errMsg(e), 'error'); }
  });
}
async function onRestore() {
  const file = $('#restore-file').files[0]; if (!file) return;
  let parsed;
  try { parsed = JSON.parse(await file.text()); } catch (e) { return toast('File backup bukan JSON yang valid.', 'error'); }
  const backup_data = parsed && parsed.backup_data ? parsed.backup_data : parsed;
  if (!backup_data || !Array.isArray(backup_data.transactions) || !Array.isArray(backup_data.targets) || !Array.isArray(backup_data.achievements)) {
    return toast('Format file backup tidak dikenali.', 'error');
  }
  if (!(await confirmDialog('Restore data', 'Restore menimpa seluruh data yang ada dan tidak bisa dibatalkan. Lanjutkan?'))) return;
  overlay(true);
  try {
    const res = await apiRequest('restore', { backup_data });
    toast(res.message || 'Data berhasil direstore.', 'success');
    $('#restore-file').value = ''; $('#btn-restore').disabled = true;
    showAchievements(res.new_achievements);
  } catch (e) { if (!e.session) toast(errMsg(e), 'error'); } finally { overlay(false); }
}

// ==================================================
// # /shared — event binding & init
// ==================================================
function onClick(ev) {
  const el = ev.target.closest('[data-action]'); if (!el) return;
  const a = el.dataset.action;
  if (a === 'retry') showPage(state.page);
  else if (a === 'close-modal') el.closest('dialog').close();
  else if (a === 'page-prev') { state.txPage--; renderFinance(); }
  else if (a === 'page-next') { state.txPage++; renderFinance(); }
  else if (a === 'cal-prev') moveCalendar(-1);
  else if (a === 'cal-next') moveCalendar(1);
  else if (a === 'edit-tx') { const t = state.tx.find(x => String(x.id) === el.dataset.id); if (t) openTxForm(t); }
  else if (a === 'del-tx') onDeleteTx(el.dataset.id);
}
function init() {
  $('#login-form').addEventListener('submit', onLoginSubmit);
  $('#btn-logout').addEventListener('click', logout);
  window.addEventListener('hashchange', route);
  document.addEventListener('click', onClick);
  $('#quick-add-form').addEventListener('submit', onQuickAdd);
  $$('input[name="dash-range"]').forEach(r => r.addEventListener('change', renderDashChart));
  $('#fin-btn-add').addEventListener('click', () => openTxForm(null));
  $('#fin-form').addEventListener('submit', onTxSubmit);
  $('#fin-search').addEventListener('input', () => { state.txPage = 0; renderFinance(); });
  ['#fin-filter-tipe', '#fin-filter-from', '#fin-filter-to'].forEach(s => $(s).addEventListener('change', () => softReload(loadFinance)));
  $('#fin-filter-reset').addEventListener('click', resetFinanceFilters);
  $('#wl-form').addEventListener('submit', onWishlistSubmit);
  $('#wl-btn-edit').addEventListener('click', startEditTarget);
  $('#wl-btn-complete').addEventListener('click', onCompleteTarget);
  $('#stat-apply').addEventListener('click', () => softReload(loadStatistics));
  $('#stat-ach-filter').addEventListener('change', renderAchievements);
  $('#password-form').addEventListener('submit', onPasswordSubmit);
  $('#btn-backup').addEventListener('click', onBackup);
  $('#restore-file').addEventListener('change', e => { $('#btn-restore').disabled = !e.target.files.length; });
  $('#btn-restore').addEventListener('click', onRestore);
  $('#ach-dialog-close').addEventListener('click', () => $('#achievement-dialog').close());
  const ro = 'ResizeObserver' in window ? new ResizeObserver(es => es.forEach(e => { const f = charts.get(e.target); if (f) f(); })) : null;
  $$('canvas').forEach(c => ro ? ro.observe(c) : null);
  if (!ro) window.addEventListener('resize', () => charts.forEach(f => f()));
  bootstrap();
}
init();
})();

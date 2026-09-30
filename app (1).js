/* App Shell: state, login, validasi token, navigasi (hash router + iframe), logout, toast.
 * Feature Project 01–05 dimuat apa adanya di iframe (same-origin) sehingga tidak ada file feature yang diubah. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  // Path RELATIF terhadap index.html (aman untuk GitHub Pages berbentuk user.github.io/repo/)
  const PAGES = {
    dashboard:  { title: 'Dashboard',  src: 'pages/dashboard/dashboard.html' },
    finance:    { title: 'Keuangan',   src: 'pages/finance/transactions.html' },
    wishlist:   { title: 'Wishlist',   src: 'pages/wishlist/wishlist.html' },
    statistics: { title: 'Statistik',  src: 'pages/statistics/statistics.html' },
    settings:   { title: 'Pengaturan', src: 'pages/settings/settings.html' },
  };
  const RECHECK_MS = 60000;

  const State = { token: '', user: null, page: null, loading: false, error: '', lastCheck: 0 };

  /* ---------- UI helper ---------- */
  function view(name) { document.querySelectorAll('[data-view]').forEach((v) => { v.hidden = v.dataset.view !== name; }); }
  let tt;
  function toast(msg, kind) { const t = $('toast'); t.textContent = msg; t.className = 'toast show ' + (kind || ''); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3200); }
  async function sha256(text) {
    if (!(window.crypto && crypto.subtle)) throw new Error('Browser tidak mendukung enkripsi (butuh HTTPS).');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /* ---------- Sesi ---------- */
  function endSession(message) {
    Api.clearToken(); State.token = ''; State.user = null; State.page = null;
    $('frame').src = 'about:blank'; // buang konten halaman dari memori
    history.replaceState(null, '', location.pathname + location.search);
    $('loginError').textContent = ''; view('login'); closeMenu();
    if (message) toast(message, 'err');
  }
  Api.onUnauthorized = () => { if (State.token) endSession('Sesi berakhir. Silakan masuk kembali.'); };
  Api.onLoading = (on) => { State.loading = on; $('progress').classList.toggle('on', on); };

  async function validate() {
    const d = await Api.call('validateToken');
    State.user = d.username || null; State.lastCheck = Date.now();
    $('userName').textContent = State.user || '-';
  }

  async function boot() {
    State.token = Api.getToken();
    if (!State.token) { view('login'); return; }
    view('boot');
    try { await validate(); enter(); }
    catch (e) {
      if (e.session || e.code === 401) { endSession(); return; }
      State.error = e.message; $('bootError').textContent = e.message; view('error'); // gagal jaringan: jangan logout
    }
  }
  function enter() { view('shell'); route(); }

  /* ---------- Login ---------- */
  async function login(ev) {
    ev.preventDefault();
    const u = $('loginUser').value.trim(), p = $('loginPass').value, err = $('loginError'), btn = $('loginBtn');
    err.textContent = '';
    if (!u || !p) { err.textContent = 'Username dan password wajib diisi.'; return; }
    btn.disabled = true; btn.textContent = 'Memeriksa…';
    try {
      const d = await Api.call('login', { username: u, password_hash: await sha256(p) }, { auth: false });
      if (!d.token) throw new Error('Respons login tidak berisi token.');
      Api.setToken(d.token); State.token = d.token; $('loginPass').value = '';
      await validate(); enter();
    } catch (e) { err.textContent = e.message; }
    finally { btn.disabled = false; btn.textContent = 'Masuk'; }
  }

  /* ---------- Navigasi ---------- */
  function currentName() { const n = location.hash.replace(/^#\/?/, ''); return PAGES[n] ? n : 'dashboard'; }
  async function route() {
    if (!State.token) return;
    const name = currentName(), p = PAGES[name];
    // Cek token berkala agar sesi kedaluwarsa terdeteksi saat pindah halaman.
    if (Date.now() - State.lastCheck > RECHECK_MS) { try { await validate(); } catch (e) { if (e.session) return; } }
    State.page = name;
    document.querySelectorAll('.nav a').forEach((a) => { const on = a.dataset.page === name; a.classList.toggle('is-active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('pageTitle').textContent = p.title; document.title = p.title + ' · Tabungan';
    loadFrame(p.src); closeMenu();
  }
  function loadFrame(src) {
    $('frameLoading').hidden = false; $('frameError').hidden = true;
    const f = $('frame'); f.onload = () => { $('frameLoading').hidden = true; };
    f.src = src;
  }
  function reloadPage() { const p = PAGES[State.page]; if (p) loadFrame(p.src); }

  /* ---------- Menu mobile ---------- */
  function openMenu() { document.body.classList.add('menu-open'); $('menuBtn').setAttribute('aria-expanded', 'true'); }
  function closeMenu() { document.body.classList.remove('menu-open'); $('menuBtn').setAttribute('aria-expanded', 'false'); }

  function init() {
    $('loginForm').addEventListener('submit', login);
    $('logoutBtn').addEventListener('click', () => endSession('Anda telah keluar.'));
    $('reloadBtn').addEventListener('click', reloadPage);
    $('retryBoot').addEventListener('click', boot);
    $('menuBtn').addEventListener('click', () => document.body.classList.contains('menu-open') ? closeMenu() : openMenu());
    $('backdrop').addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('hashchange', route);
    boot();
  }
  document.addEventListener('DOMContentLoaded', init);
})();

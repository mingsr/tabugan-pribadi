/* Statistik & Achievement — PROJECT 04
 * Memakai API live: getMonthlyStat, getMonthlyTrend, getAchievements, getHallOfFame.
 * Setiap section dimuat mandiri (loading / error / empty sendiri) sehingga satu kegagalan tidak merusak halaman.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  const API_URL = 'https://script.google.com/macros/s/AKfycbwt8HGwnDW5ZolvkzAtzLuyNGbJClTUQLWivSyANcs4vxWBIsZsFVp8n8DOKQVN-auV/exec';
  const TOKEN_KEY = 'token'; // ASUMSI: sesuaikan dengan key yang dipakai halaman login
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const RARITY = { COMMON: 'Common', UNCOMMON: 'Uncommon', RARE: 'Rare', EPIC: 'Epic', MYTHIC: 'Mythic', ARTIFACT: 'Artifact' };

  const num = (v) => Number(v) || 0;
  const rp = (v) => 'Rp' + Math.round(num(v)).toLocaleString('id-ID');
  const pad = (n) => String(n).padStart(2, '0');
  const dateLong = (s) => { if (!s) return '-'; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return m ? d + ' ' + MONTHS[m - 1].slice(0, 3) + ' ' + y : '-'; };
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

  /* ---------- API ----------
   * Format request sesuai doPost: form-urlencoded dengan field `payload` = JSON {action, token, data}
   * (tanpa preflight CORS). Respons: {success:true,data} | {success:false,error,code}. HTTP status selalu 200. */
  const Api = {
    token: () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '',
    async call(action, data) {
      const token = this.token();
      if (!token) { const e = new Error('Belum login. Masuk terlebih dahulu.'); e.code = 401; throw e; }
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 30000);
      try {
        const res = await fetch(API_URL, { method: 'POST', body: new URLSearchParams({ payload: JSON.stringify({ action, token, data: data || {} }) }), signal: ctl.signal });
        let json;
        try { json = await res.json(); } catch (_) { throw new Error('Respons server tidak dapat dibaca.'); }
        if (!json || json.success !== true) { const e = new Error((json && json.error) || 'Permintaan gagal.'); e.code = json && json.code; throw e; }
        return json.data || {};
      } catch (err) {
        if (err.name === 'AbortError') throw new Error('Server tidak merespons. Coba lagi.');
        if (err instanceof TypeError) throw new Error('Tidak dapat terhubung ke server (jaringan atau CORS).');
        throw err;
      } finally { clearTimeout(timer); }
    },
  };

  /* ---------- State tampilan ---------- */
  function setState(id, kind, msg, retry) {
    const s = $(id); s.textContent = ''; s.className = 'state' + (kind === 'error' ? ' state--error' : '');
    if (!kind) return;
    if (kind === 'loading') { s.appendChild(el('span', 'spin')); s.appendChild(document.createTextNode('Memuat…')); return; }
    s.appendChild(el('p', '', msg));
    if (retry) { const b = el('button', 'btn', 'Coba lagi'); b.type = 'button'; b.addEventListener('click', retry); s.appendChild(b); }
  }
  const errMsg = (e) => e.code === 401 ? (e.message.startsWith('Belum') ? e.message : 'Sesi berakhir. Masuk kembali.') : e.message;

  const S = { stat: null, trend: null, ach: null, chartMode: 'daily', catType: 'EXPENSE', achFilter: 'all' };

  /* ---------- Ringkasan ---------- */
  function renderSummary() {
    const sm = (S.stat && S.stat.summary) || {};
    $('sIncome').textContent = rp(sm.total_income);
    $('sExpense').textContent = rp(sm.total_expense);
    $('sSaving').textContent = rp(sm.total_saving);
    $('sNet').textContent = 'Bersih ' + rp(sm.net_saving) + ' (setelah penarikan)';
    $('sCount').textContent = num(sm.jumlah_tx).toLocaleString('id-ID');
    $('sumGrid').hidden = false;
  }

  /* ---------- Grafik ---------- */
  function dailyPoints() {
    const st = S.stat; if (!st) return [];
    const y = num(st.tahun), m = num(st.bulan), days = new Date(y, m, 0).getDate();
    const map = {}; (st.daily_data || []).forEach((d) => { map[String(d.tanggal).slice(0, 10)] = d; });
    return Array.from({ length: days }, (_, i) => {
      const d = map[y + '-' + pad(m) + '-' + pad(i + 1)] || {};
      return { label: String(i + 1), income: num(d.income), expense: num(d.expense), saving: num(d.saving) };
    });
  }
  function trendPoints() {
    return ((S.trend && S.trend.trend) || []).map((t) => ({ label: MONTHS[num(t.bulan) - 1] ? MONTHS[num(t.bulan) - 1].slice(0, 3) : '?', income: num(t.income), expense: num(t.expense), saving: num(t.saving) }));
  }
  function renderChart() {
    const area = $('chartArea'); area.textContent = '';
    const src = S.chartMode === 'daily' ? S.stat : S.trend;
    if (!src) return; // state sudah ditangani oleh loader
    const pts = S.chartMode === 'daily' ? dailyPoints() : trendPoints();
    const max = Math.max(0, ...pts.map((p) => Math.max(p.income, p.expense, p.saving)));
    if (!pts.length || max === 0) { setState('chartState', 'empty', 'Belum ada aktivitas pada periode ini.'); return; }
    setState('chartState', null);
    const W = 640, H = 240, L = 46, R = 10, T = 10, B = 24, iw = W - L - R, ih = H - T - B;
    const x = (i) => L + (pts.length === 1 ? iw / 2 : (iw * i) / (pts.length - 1));
    const y = (v) => T + ih - (v / max) * ih;
    const short = (v) => v >= 1e6 ? (v / 1e6).toFixed(1).replace('.0', '') + ' jt' : v >= 1e3 ? Math.round(v / 1e3) + ' rb' : String(Math.round(v));
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik pemasukan, pengeluaran, dan tabungan">';
    for (let i = 0; i <= 4; i++) { const v = (max / 4) * i; s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="axis" x="' + (L - 6) + '" y="' + (y(v) + 3) + '" text-anchor="end">' + short(v) + '</text>'; }
    const every = pts.length > 12 ? Math.ceil(pts.length / 10) : 1;
    pts.forEach((p, i) => { if (i % every === 0) s += '<text class="axis" x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + p.label + '</text>'; });
    [['income', '#22d3a0', 'Pemasukan'], ['expense', '#ff5d73', 'Pengeluaran'], ['saving', '#a855f7', 'Tabungan']].forEach(([k, c]) => {
      s += '<path class="line" stroke="' + c + '" d="' + pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p[k]).toFixed(1)).join(' ') + '"/>';
    });
    [['income', '#22d3a0', 'Pemasukan'], ['expense', '#ff5d73', 'Pengeluaran'], ['saving', '#a855f7', 'Tabungan']].forEach(([k, c, n]) => {
      if (pts.length > 16) return;
      pts.forEach((p, i) => { s += '<circle cx="' + x(i) + '" cy="' + y(p[k]) + '" r="3" fill="' + c + '"><title>' + n + ' ' + p.label + ': ' + rp(p[k]) + '</title></circle>'; });
    });
    area.innerHTML = s + '</svg>';
    area.querySelectorAll('.line').forEach((p) => p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 2));
  }

  /* ---------- Kategori ---------- */
  function renderCategories() {
    const ul = $('catList'); ul.textContent = '';
    const list = (S.stat && S.stat.by_category && S.stat.by_category[S.catType]) || [];
    if (!list.length) { setState('catState', 'empty', 'Belum ada transaksi pada kategori ini di bulan terpilih.'); return; }
    setState('catState', null);
    const color = { EXPENSE: 'var(--red)', INCOME: 'var(--green)', SAVING: 'var(--purple)' }[S.catType];
    list.forEach((c) => {
      const li = el('li'), top = el('div', 'cat__top'), bar = el('div', 'bar'), fill = el('span', 'bar__fill');
      top.appendChild(el('span', '', String(c.kategori || 'Lainnya'))); top.appendChild(el('b', '', rp(c.total)));
      fill.style.setProperty('--c', color); bar.appendChild(fill);
      li.appendChild(top); li.appendChild(bar);
      li.appendChild(el('div', 'cat__sub', num(c.persentase).toString().replace('.', ',') + '% · ' + num(c.jumlah_tx) + ' transaksi'));
      ul.appendChild(li);
      requestAnimationFrame(() => { fill.style.width = Math.min(100, num(c.persentase)) + '%'; });
    });
  }

  /* ---------- Achievement ---------- */
  function renderAchievements() {
    const data = S.ach; if (!data) return;
    const all = Array.isArray(data.achievements) ? data.achievements : [];
    const sm = data.summary || {};
    const box = $('achSum'); box.textContent = '';
    [['Terbuka', num(sm.opened_count) + ' / ' + all.length], ['Total XP', num(sm.total_xp).toLocaleString('id-ID')]].forEach(([k, v]) => {
      const p = el('span', 'pill', k + ' '); p.appendChild(el('b', '', v)); box.appendChild(p);
    });
    box.hidden = false;

    const grid = $('achGrid'); grid.textContent = '';
    const rows = all.filter((a) => S.achFilter === 'all' || (S.achFilter === 'open') === !!a.is_unlocked);
    if (!rows.length) { setState('achState', 'empty', all.length ? 'Tidak ada achievement pada filter ini.' : 'Belum ada achievement.'); return; }
    setState('achState', null);

    rows.forEach((a) => {
      const open = !!a.is_unlocked, hide = !!a.is_secret && !open; // secret terkunci: sembunyikan info
      const rar = String(a.rarity || 'COMMON').toUpperCase();
      const c = el('article', 'ach ach--' + rar + (open ? ' is-open' : ' is-locked'));
      const head = el('div', 'ach__head');
      head.appendChild(el('span', 'ach__icon', hide ? '🔒' : (a.icon || '🏆')));
      const t = el('div'); t.appendChild(el('div', 'ach__name', hide ? '???' : (a.nama || a.achievement_key || '-')));
      t.appendChild(el('div', 'ach__rar', RARITY[rar] || rar)); head.appendChild(t); c.appendChild(head);
      if (hide) c.appendChild(el('p', 'ach__desc', 'Achievement rahasia. Detailnya terbuka setelah kamu mendapatkannya.'));
      else c.appendChild(el('p', 'ach__desc', open ? (a.deskripsi || '') : (a.clue || a.deskripsi || '')));
      if (!open && !hide && a.progress_percent !== null && a.progress_percent !== undefined) {
        const bar = el('div', 'bar'), fill = el('span', 'bar__fill'); bar.appendChild(fill); c.appendChild(bar);
        c.appendChild(el('div', 'cat__sub', num(a.progress).toLocaleString('id-ID') + ' / ' + num(a.target).toLocaleString('id-ID') + ' (' + num(a.progress_percent) + '%)'));
        requestAnimationFrame(() => { fill.style.width = Math.min(100, num(a.progress_percent)) + '%'; });
      }
      const foot = el('div', 'ach__foot');
      foot.appendChild(el('span', '', open ? 'Terbuka ' + dateLong(a.tanggal_unlock) : 'Terkunci'));
      if (!hide) { const xp = el('b', '', '+' + num(a.xp_reward) + ' XP'); foot.appendChild(xp); }
      c.appendChild(foot); grid.appendChild(c);
    });
  }

  /* ---------- Hall of Fame ---------- */
  function renderHof(list) {
    const box = $('hofList'); box.textContent = '';
    if (!list.length) { setState('hofState', 'empty', 'Belum ada target yang dicapai. Selesaikan target pertamamu!'); return; }
    setState('hofState', null);
    list.forEach((h) => {
      const it = el('article', 'hof__item'); it.appendChild(el('h3', '', String(h.nama_target || '-')));
      const m = el('div', 'hof__meta');
      [['Target', rp(h.target_nominal)], ['Durasi', num(h.total_hari) + ' hari'], ['Selesai', dateLong(h.tanggal_selesai)], ['Transaksi menabung', num(h.total_saving_tx) + 'x']].forEach(([k, v]) => {
        const d = el('div', '', k); d.appendChild(el('b', '', v)); m.appendChild(d);
      });
      it.appendChild(m); box.appendChild(it);
    });
  }

  /* ---------- Loader per section ---------- */
  async function loadStat() {
    S.stat = null; $('sumGrid').hidden = true; $('catList').textContent = ''; $('chartArea').textContent = '';
    setState('sumState', 'loading'); setState('catState', 'loading');
    if (S.chartMode === 'daily') setState('chartState', 'loading');
    const bulan = Number($('selMonth').value), tahun = Number($('selYear').value);
    $('periodLabel').textContent = MONTHS[bulan - 1] + ' ' + tahun;
    try {
      S.stat = await Api.call('getMonthlyStat', { bulan, tahun });
      setState('sumState', null); renderSummary(); renderCategories();
      if (S.chartMode === 'daily') renderChart();
    } catch (e) {
      const m = errMsg(e);
      setState('sumState', 'error', m, loadStat); setState('catState', 'error', m, loadStat);
      if (S.chartMode === 'daily') setState('chartState', 'error', m, loadStat);
    }
  }
  async function loadTrend() {
    S.trend = null;
    if (S.chartMode === 'trend') setState('chartState', 'loading');
    try { S.trend = await Api.call('getMonthlyTrend', { months: 6 }); if (S.chartMode === 'trend') renderChart(); }
    catch (e) { if (S.chartMode === 'trend') setState('chartState', 'error', errMsg(e), loadTrend); }
  }
  async function loadAch() {
    S.ach = null; $('achSum').hidden = true; $('achGrid').textContent = ''; setState('achState', 'loading');
    try { S.ach = await Api.call('getAchievements'); setState('achState', null); renderAchievements(); }
    catch (e) { setState('achState', 'error', errMsg(e), loadAch); }
  }
  async function loadHof() {
    $('hofList').textContent = ''; setState('hofState', 'loading');
    try { const d = await Api.call('getHallOfFame'); renderHof(Array.isArray(d.hall_of_fame) ? d.hall_of_fame : []); }
    catch (e) { setState('hofState', 'error', errMsg(e), loadHof); }
  }
  async function loadAll() {
    const b = $('refreshBtn'); b.disabled = true;
    await Promise.allSettled([loadStat(), loadTrend(), loadAch(), loadHof()]);
    b.disabled = false;
  }

  /* ---------- Init ---------- */
  function init() {
    const now = new Date();
    $('selMonth').innerHTML = MONTHS.map((m, i) => '<option value="' + (i + 1) + '">' + m + '</option>').join('');
    $('selYear').innerHTML = [0, 1, 2].map((k) => '<option>' + (now.getFullYear() - k) + '</option>').join('');
    $('selMonth').value = now.getMonth() + 1; $('selYear').value = now.getFullYear();
    $('selMonth').addEventListener('change', loadStat);
    $('selYear').addEventListener('change', loadStat);
    $('refreshBtn').addEventListener('click', loadAll);

    const seg = (id, attr, fn) => $(id).addEventListener('click', (e) => {
      const b = e.target.closest('.seg__btn'); if (!b) return;
      $(id).querySelectorAll('.seg__btn').forEach((x) => x.classList.toggle('is-active', x === b)); fn(b.dataset[attr]);
    });
    seg('catTabs', 'type', (v) => { S.catType = v; renderCategories(); });
    seg('achTabs', 'f', (v) => { S.achFilter = v; renderAchievements(); });
    document.querySelector('[aria-label="Jenis grafik"]').addEventListener('click', (e) => {
      const b = e.target.closest('.seg__btn'); if (!b) return;
      document.querySelectorAll('[aria-label="Jenis grafik"] .seg__btn').forEach((x) => x.classList.toggle('is-active', x === b));
      S.chartMode = b.dataset.mode;
      if (S.chartMode === 'daily') { S.stat ? renderChart() : loadStat(); } else { S.trend ? renderChart() : loadTrend(); }
    });
    loadAll();
  }
  document.addEventListener('DOMContentLoaded', init);
})();

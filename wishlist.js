/* Wishlist / Savings Target — PROJECT 03
 * Alur: WishService (data) -> State -> render kartu. Form/Confirm = UI.
 * Menghubungkan API nanti: ubah HANYA WishService (dan isi CONFIG).
 * Wishlist TIDAK punya saldo: `terkumpul` adalah turunan dari transaksi SAVING/WITHDRAWAL, bukan dompet.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const CONFIG = { API_URL: '', USE_MOCK: true };

  const COLORS = [
    { id: 'purple', hex: '#a855f7', name: 'Ungu' }, { id: 'blue', hex: '#2f7bff', name: 'Biru' },
    { id: 'cyan', hex: '#22c7e8', name: 'Cyan' }, { id: 'pink', hex: '#f472b6', name: 'Pink' },
    { id: 'orange', hex: '#fb923c', name: 'Oranye' }, { id: 'lime', hex: '#a3e635', name: 'Lime' },
  ];
  const STATUS = [
    { key: 'belum', label: 'Belum Dimulai' }, { key: 'proses', label: 'Sedang Ditabung' },
    { key: 'hampir', label: 'Hampir Tercapai' }, { key: 'tercapai', label: 'Tercapai' },
  ];
  const NEAR_PCT = 80; // batas "Hampir Tercapai" (keputusan frontend, bukan dari API)
  const DAY = 86400000;

  const Fmt = {
    rp: (n) => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID'),
    key: (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
    date: (s) => { if (!s) return '-'; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); },
    parse: (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); },
  };

  /* ---------- API helper (belum dipakai selama USE_MOCK) ----------
   * Format sesuai source .gs: form-urlencoded, field `payload` = JSON {action, token, data}. */
  const Api = {
    async call(action, data) {
      const body = new URLSearchParams({ payload: JSON.stringify({ action, token: sessionStorage.getItem('token') || '', data: data || {} }) });
      const json = await (await fetch(CONFIG.API_URL, { method: 'POST', body })).json();
      if (!json.success) throw new Error(json.error || 'Permintaan gagal');
      return json.data;
    },
  };

  /* ---------- Data service ----------
   * Model UI: {id, nama, target_nominal, target_tanggal, warna, is_main, status:'ACTIVE'|'COMPLETED',
   *            terkumpul, saving_log:[{tanggal,nominal}], prediksi_selesai?, tanggal_mulai, tanggal_selesai}
   * Ada di backend: id, nama_target, target_nominal, tanggal_mulai, tanggal_selesai, status,
   *   total_saving, persen (getTarget), prediksi_selesai (hanya getDashboard).
   * BELUM ADA di backend: target_tanggal, warna, is_main, lebih dari satu target aktif,
   *   daftar semua target, hapus target. Action terkait: getTarget / createTarget / updateTarget / completeTarget.
   */
  const WishService = (() => {
    let seq = 0;
    const today = new Date();
    const dAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return Fmt.key(d); };
    const dAhead = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return Fmt.key(d); };
    const log = (days, amt) => days.map((n) => ({ tanggal: dAgo(n), nominal: amt }));
    const mk = (o) => ({ id: 'w' + (++seq), status: 'ACTIVE', is_main: false, tanggal_mulai: dAgo(60), tanggal_selesai: '', saving_log: [], ...o });
    let store = [
      mk({ nama: 'ASUS TUF Gaming A15', target_nominal: 20000000, target_tanggal: dAhead(240), warna: 'purple', is_main: true, terkumpul: 6400000, saving_log: log([1, 3, 5, 8, 11, 15, 20, 26], 250000) }),
      mk({ nama: 'Keyboard Mekanik', target_nominal: 600000, target_tanggal: dAhead(20), warna: 'cyan', terkumpul: 520000, saving_log: log([2, 6, 10, 14], 40000) }),
      mk({ nama: 'Headset', target_nominal: 1000000, target_tanggal: dAhead(30), warna: 'lime', terkumpul: 1000000, saving_log: log([4, 9], 100000) }),
      mk({ nama: 'Sepatu Lari', target_nominal: 1500000, target_tanggal: dAhead(150), warna: 'orange', terkumpul: 0 }),
    ];
    const wait = (v) => new Promise((r) => setTimeout(() => r(v), 100));
    const clone = () => store.map((x) => ({ ...x }));
    const clearMain = () => store.forEach((x) => { x.is_main = false; });
    return {
      list: () => wait(clone()),
      create(d) { if (d.is_main) clearMain(); store.push(mk({ ...d, terkumpul: 0 })); return wait(true); },
      update(id, d) { if (d.is_main) clearMain(); store = store.map((x) => x.id === id ? { ...x, ...d } : x); return wait(true); },
      setMain(id) { clearMain(); store.forEach((x) => { if (x.id === id) x.is_main = true; }); return wait(true); },
      unsetMain() { clearMain(); return wait(true); },
      complete(id) { store = store.map((x) => x.id === id ? { ...x, status: 'COMPLETED', is_main: false, tanggal_selesai: Fmt.key(new Date()) } : x); return wait(true); },
      remove(id) { store = store.filter((x) => x.id !== id); return wait(true); },
    };
  })();

  /* ---------- Hitung ---------- */
  const Calc = {
    pct: (w) => w.target_nominal > 0 ? Math.max(0, Math.min(100, (w.terkumpul / w.target_nominal) * 100)) : 0,
    status(w) {
      const p = this.pct(w);
      if (w.status === 'COMPLETED' || p >= 100) return 3;
      if (p <= 0) return 0;
      return p >= NEAR_PCT ? 2 : 1;
    },
    isDone: (w) => Calc.status(w) === 3,
    // Prediksi dinamis: pakai `prediksi_selesai` dari API bila ada; jika tidak, hitung dari saving_log 30 hari terakhir
    // (rata-rata per hari, sama dengan pola backend: total 30 hari / 30).
    predict(w) {
      if (w.prediksi_selesai) return w.prediksi_selesai;
      const kurang = w.target_nominal - w.terkumpul;
      if (kurang <= 0) return Fmt.key(new Date());
      const since = Fmt.key(new Date(Date.now() - 29 * DAY));
      const sum = (w.saving_log || []).filter((l) => l.tanggal >= since).reduce((s, l) => s + Number(l.nominal), 0);
      if (sum <= 0) return null;
      return Fmt.key(new Date(Date.now() + Math.ceil(kurang / (sum / 30)) * DAY));
    },
    daysLeft: (s) => s ? Math.ceil((Fmt.parse(s) - new Date(new Date().toDateString())) / DAY) : null,
  };

  /* ---------- Render ---------- */
  const State = { items: [] };

  function card(w) {
    const done = Calc.isDone(w), st = Calc.status(w), pct = Calc.pct(w);
    const color = (COLORS.find((c) => c.id === w.warna) || COLORS[0]).hex;
    const el = document.createElement('article');
    el.className = 'wish' + (w.is_main ? ' wish--main' : '') + (done ? ' wish--done' : '');
    el.style.setProperty('--c', done ? '' : color);
    if (done) el.style.removeProperty('--c');
    el.dataset.id = w.id;
    el.innerHTML = '<div class="wish__top"><h3 class="wish__name"></h3><div class="tags"></div></div>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span class="progress__fill"></span></div>' +
      '<div class="wish__nums"><span><strong class="n-saved"></strong> terkumpul</span><strong class="n-pct"></strong></div>' +
      '<div class="wish__meta"><div>Target<b class="m-target"></b></div><div>Target tanggal<b class="m-date"></b></div>' +
      '<div class="m-pred-wrap">Prediksi tercapai<b class="m-pred"></b><span class="hint"></span></div><div>Sisa<b class="m-left"></b></div></div>' +
      '<div class="ready" hidden></div><div class="wish__act"></div>';
    const q = (s) => el.querySelector(s);
    q('.wish__name').textContent = w.nama;
    const tags = q('.tags');
    const addTag = (text, cls) => { const t = document.createElement('span'); t.className = 'tag ' + cls; t.textContent = text; tags.appendChild(t); };
    if (w.is_main) addTag('★ Utama', 'tag--main');
    addTag(STATUS[st].label, 'tag--' + st);
    q('.progress').setAttribute('aria-valuenow', Math.round(pct));
    requestAnimationFrame(() => { q('.progress__fill').style.width = pct + '%'; });
    q('.n-saved').textContent = Fmt.rp(w.terkumpul);
    q('.n-pct').textContent = pct.toFixed(1).replace('.', ',') + '%';
    q('.m-target').textContent = Fmt.rp(w.target_nominal);
    q('.m-date').textContent = Fmt.date(w.target_tanggal);
    q('.m-left').textContent = Fmt.rp(Math.max(0, w.target_nominal - w.terkumpul));

    const pred = done ? null : Calc.predict(w), hint = q('.hint');
    if (done) { q('.m-pred-wrap').hidden = true; }
    else if (!pred) { q('.m-pred').textContent = 'Belum cukup data'; hint.textContent = 'Mulai menabung untuk melihat prediksi.'; }
    else {
      q('.m-pred').textContent = Fmt.date(pred);
      if (w.target_tanggal) { const ok = pred <= w.target_tanggal; hint.textContent = ok ? 'Sesuai target tanggal' : 'Melewati target tanggal'; hint.classList.add(ok ? 'hint--ok' : 'hint--late'); }
    }
    const left = Calc.daysLeft(w.target_tanggal);
    if (left !== null && !done) q('.m-date').textContent += left >= 0 ? ' (' + left + ' hari lagi)' : ' (lewat ' + Math.abs(left) + ' hari)';

    const act = q('.wish__act');
    const btn = (label, a, cls) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'link ' + (cls || ''); b.dataset.a = a; b.textContent = label; act.appendChild(b); };
    if (w.status === 'COMPLETED') {
      const r = q('.ready'); r.hidden = false; r.textContent = 'Selesai ' + Fmt.date(w.tanggal_selesai) + ' · Siap masuk Hall of Fame';
    } else if (done) {
      const r = q('.ready'); r.hidden = false; r.textContent = 'Target tercapai. Selesaikan agar siap masuk Hall of Fame.';
      btn('Selesaikan target', 'complete', 'link--go');
    } else {
      btn(w.is_main ? 'Lepas utama' : 'Jadikan utama', w.is_main ? 'unmain' : 'main');
    }
    if (w.status !== 'COMPLETED') btn('Edit', 'edit');
    btn('Hapus', 'del', 'link--del');
    return el;
  }

  function render() {
    const active = State.items.filter((w) => !Calc.isDone(w)).sort((a, b) => (b.is_main - a.is_main) || (Calc.pct(b) - Calc.pct(a)));
    const done = State.items.filter(Calc.isDone).sort((a, b) => a.nama.localeCompare(b.nama));
    const ag = $('activeGrid'), dg = $('doneGrid');
    ag.textContent = ''; dg.textContent = '';
    if (!active.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Belum ada wishlist berjalan. Tekan Tambah untuk membuat.'; ag.appendChild(p); }
    active.forEach((w) => ag.appendChild(card(w)));
    done.forEach((w) => dg.appendChild(card(w)));
    $('doneSection').hidden = !done.length;
  }
  const reload = async () => { State.items = await WishService.list(); render(); };

  let tt;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

  /* ---------- Form tambah / edit ---------- */
  const Form = {
    editing: null,
    init() {
      $('swatches').innerHTML = COLORS.map((c, i) => '<label class="swatch" title="' + c.name + '"><input type="radio" name="warna" value="' + c.id + '"' + (i === 0 ? ' checked' : '') + ' aria-label="' + c.name + '"><span style="--sw:' + c.hex + '"></span></label>').join('');
    },
    open(w) {
      this.editing = w || null;
      $('formTitle').textContent = w ? 'Edit wishlist' : 'Tambah wishlist';
      $('formError').textContent = '';
      $('fNama').value = w ? w.nama : '';
      $('fNominal').value = w ? Number(w.target_nominal).toLocaleString('id-ID') : '';
      $('fTanggal').value = w ? (w.target_tanggal || '') : '';
      $('fMain').checked = w ? w.is_main : !State.items.some((x) => x.is_main && !Calc.isDone(x));
      const col = w ? w.warna : 'purple';
      document.querySelectorAll('#swatches input').forEach((r) => { r.checked = r.value === col; });
      $('formDialog').showModal();
    },
    read() {
      return {
        nama: $('fNama').value.trim(),
        target_nominal: Number($('fNominal').value.replace(/\D/g, '')),
        target_tanggal: $('fTanggal').value,
        warna: (document.querySelector('#swatches input:checked') || {}).value || 'purple',
        is_main: $('fMain').checked,
      };
    },
    validate(d) {
      if (!d.nama) return 'Nama barang wajib diisi.';
      if (!d.target_nominal || d.target_nominal <= 0) return 'Target nominal harus lebih dari 0.';
      if (!d.target_tanggal) return 'Target tanggal wajib diisi.';
      if (!this.editing && d.target_tanggal < Fmt.key(new Date())) return 'Target tanggal tidak boleh di masa lalu.';
      return '';
    },
    async submit(e) {
      e.preventDefault();
      const d = this.read(), err = this.validate(d);
      $('formError').textContent = err;
      if (err) return;
      $('saveBtn').disabled = true;
      try {
        const swapped = d.is_main && State.items.some((x) => x.is_main && (!this.editing || x.id !== this.editing.id));
        if (this.editing) await WishService.update(this.editing.id, d); else await WishService.create(d);
        await reload();
        $('formDialog').close();
        toast((this.editing ? 'Wishlist diperbarui' : 'Wishlist ditambahkan') + (swapped ? '. Wishlist utama diganti.' : ''));
      } catch (ex) { $('formError').textContent = ex.message || 'Gagal menyimpan.'; }
      finally { $('saveBtn').disabled = false; }
    },
  };

  const Confirm = {
    id: null,
    open(w) { this.id = w.id; $('confirmText').textContent = '"' + w.nama + '" akan dihapus dan tidak bisa dikembalikan.'; $('confirmDialog').showModal(); },
    async yes() {
      try { await WishService.remove(this.id); await reload(); toast('Wishlist dihapus'); } catch (ex) { toast(ex.message || 'Gagal menghapus.'); }
      $('confirmDialog').close();
    },
  };

  /* ---------- Event ---------- */
  function bind() {
    $('addBtn').addEventListener('click', () => Form.open());
    $('wForm').addEventListener('submit', (e) => Form.submit(e));
    $('fNominal').addEventListener('input', (e) => { const d = e.target.value.replace(/\D/g, ''); e.target.value = d ? Number(d).toLocaleString('id-ID') : ''; });
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    $('confirmYes').addEventListener('click', () => Confirm.yes());
    document.querySelector('.page').addEventListener('click', async (e) => {
      const b = e.target.closest('button[data-a]'); if (!b) return;
      const w = State.items.find((x) => x.id === b.closest('.wish').dataset.id); if (!w) return;
      try {
        if (b.dataset.a === 'edit') return Form.open(w);
        if (b.dataset.a === 'del') return Confirm.open(w);
        if (b.dataset.a === 'main') { await WishService.setMain(w.id); toast('"' + w.nama + '" menjadi wishlist utama'); }
        if (b.dataset.a === 'unmain') { await WishService.unsetMain(); toast('Status utama dinonaktifkan'); }
        if (b.dataset.a === 'complete') { await WishService.complete(w.id); toast('Target diselesaikan'); }
        await reload();
      } catch (ex) { toast(ex.message || 'Terjadi kesalahan.'); }
    });
  }

  async function init() {
    Form.init(); bind();
    try { await reload(); } catch (ex) { $('activeGrid').innerHTML = '<p class="empty">Gagal memuat wishlist. Muat ulang halaman.</p>'; }
  }
  document.addEventListener('DOMContentLoaded', init);
})();

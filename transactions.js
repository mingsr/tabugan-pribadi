/* Keuangan / Transactions — PROJECT 02
 * Alur: TxService (data) -> State -> render (Summary, List) ; Form/Confirm/Export = UI.
 * Untuk menghubungkan API nanti, ubah HANYA TxService (dan isi CONFIG).
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  const CONFIG = { API_URL: '', USE_MOCK: true };

  const CATEGORIES = {
    INCOME:  ['Gaji', 'Uang Saku', 'Bonus', 'Lainnya'],
    EXPENSE: ['Makan', 'Transport', 'Top Up', 'Belanja', 'Hiburan', 'Lainnya'],
  };
  const TYPE_LABEL = { INCOME: 'Pemasukan', EXPENSE: 'Pengeluaran', TRANSFER: 'Transfer', WISHLIST: 'Wishlist' };
  const WALLET = { CASH: 'Tunai', EWALLET: 'E-Wallet' };
  const TYPE_COLOR = { INCOME: 'var(--green)', EXPENSE: 'var(--red)', TRANSFER: 'var(--blue)' };
  // Tipe backend SAVING/WITHDRAWAL ditampilkan sebagai aktivitas Wishlist (bukan wallet).
  const groupOf = (t) => (t === 'SAVING' || t === 'WITHDRAWAL') ? 'WISHLIST' : t;

  const Fmt = {
    rp: (n) => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID'),
    key: (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
    time: (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'),
    date: (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); },
  };

  /* ---------- API helper ----------
   * Format request sesuai source .gs: form-urlencoded, field `payload` = JSON {action, token, data}.
   * Respons: {success, data} atau {success:false, error, code}. Belum dipakai selama USE_MOCK.
   */
  const Api = {
    async call(action, data) {
      const body = new URLSearchParams({ payload: JSON.stringify({ action, token: sessionStorage.getItem('token') || '', data: data || {} }) });
      const res = await fetch(CONFIG.API_URL, { method: 'POST', body });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Permintaan gagal');
      return json.data;
    },
  };

  /* ---------- Data service ----------
   * Model UI: {id, tanggal, waktu, tipe: INCOME|EXPENSE|TRANSFER|SAVING|WITHDRAWAL,
   *            kategori, nominal, sumber, tujuan?, keterangan}
   * BELUM ADA di backend: sumber uang, waktu, dan tipe TRANSFER. Field backend yang ada:
   * id, tanggal, tipe, kategori, nominal, keterangan, target_id.
   * Sampai keputusan mapping dibuat, service ini memakai data mock di memori.
   * Action yang akan dipakai: getTransactions / addTransaction / editTransaction / deleteTransaction.
   */
  const TxService = (() => {
    let seq = 0;
    const now = new Date();
    const ago = (n, t) => { const d = new Date(now); d.setDate(d.getDate() - n); return { tanggal: Fmt.key(d), waktu: t }; };
    let store = [
      { ...ago(0, '08:15'), tipe: 'EXPENSE', kategori: 'Makan', nominal: 30000, sumber: 'CASH', keterangan: 'Makan siang' },
      { ...ago(1, '19:40'), tipe: 'TRANSFER', kategori: 'Transfer', nominal: 100000, sumber: 'CASH', tujuan: 'EWALLET', keterangan: '' },
      { ...ago(1, '19:42'), tipe: 'EXPENSE', kategori: 'Top Up', nominal: 20000, sumber: 'EWALLET', keterangan: 'Top up game' },
      { ...ago(3, '10:05'), tipe: 'INCOME', kategori: 'Uang Saku', nominal: 500000, sumber: 'CASH', keterangan: '' },
      { ...ago(4, '13:20'), tipe: 'SAVING', kategori: 'Wishlist', nominal: 50000, sumber: 'CASH', keterangan: 'Nabung laptop' },
      { ...ago(6, '20:00'), tipe: 'INCOME', kategori: 'Bonus', nominal: 300000, sumber: 'EWALLET', keterangan: '' },
      { ...ago(8, '12:30'), tipe: 'EXPENSE', kategori: 'Transport', nominal: 15000, sumber: 'EWALLET', keterangan: '' },
    ].map((t) => ({ id: 'm' + (++seq), ...t }));
    const wait = (v) => new Promise((r) => setTimeout(() => r(v), 120));
    return {
      list: () => wait(store.map((t) => ({ ...t }))),
      add: (t) => { const n = { ...t, id: 'm' + (++seq) }; store.push(n); return wait(n); },
      edit: (t) => { store = store.map((x) => x.id === t.id ? { ...t } : x); return wait(t); },
      remove: (id) => { store = store.filter((x) => x.id !== id); return wait(true); },
    };
  })();

  /* ---------- State & hitung ---------- */
  const State = { txs: [], search: '', type: '', cat: '' };

  function wallets(txs) {
    const w = { CASH: 0, EWALLET: 0 }; let income = 0, expense = 0;
    txs.forEach((t) => {
      const n = Number(t.nominal) || 0;
      if (t.tipe === 'INCOME') { w[t.sumber] += n; income += n; }
      else if (t.tipe === 'EXPENSE') { w[t.sumber] -= n; expense += n; }
      else if (t.tipe === 'TRANSFER') { w[t.sumber] -= n; w[t.tujuan] += n; } // total tidak berubah
    });
    return { ...w, income, expense, total: w.CASH + w.EWALLET };
  }
  const sorted = (txs) => [...txs].sort((a, b) => (b.tanggal + b.waktu).localeCompare(a.tanggal + a.waktu));

  /* ---------- Render ---------- */
  function renderSummary() {
    const w = wallets(State.txs);
    $('sumTotal').textContent = Fmt.rp(w.total);
    $('sumCash').textContent = Fmt.rp(w.CASH);
    $('sumEwallet').textContent = Fmt.rp(w.EWALLET);
    $('sumIncome').textContent = Fmt.rp(w.income);
    $('sumExpense').textContent = Fmt.rp(w.expense);
  }

  function matches(t) {
    if (State.type && groupOf(t.tipe) !== State.type) return false;
    if (State.cat && t.kategori !== State.cat) return false;
    const q = State.search.trim().toLowerCase();
    if (!q) return true;
    const hay = [t.kategori, t.keterangan, TYPE_LABEL[groupOf(t.tipe)], WALLET[t.sumber], t.tujuan ? WALLET[t.tujuan] : '', String(t.nominal), Fmt.rp(t.nominal), t.tanggal, t.waktu].join(' ').toLowerCase();
    return hay.includes(q) || hay.replace(/\./g, '').includes(q.replace(/\./g, ''));
  }

  function renderList() {
    const rows = sorted(State.txs).filter(matches);
    $('count').textContent = rows.length + ' transaksi';
    const ul = $('list');
    ul.textContent = '';
    if (!rows.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = State.txs.length ? 'Tidak ada transaksi yang cocok. Ubah kata kunci atau filter.' : 'Belum ada transaksi. Tekan Tambah untuk mencatat.'; ul.appendChild(li); return; }
    rows.forEach((t) => {
      const g = groupOf(t.tipe), sign = g === 'INCOME' ? '+' : g === 'EXPENSE' ? '-' : '';
      const li = document.createElement('li');
      li.className = 'tx tx--' + g;
      const src = t.tipe === 'TRANSFER' ? WALLET[t.sumber] + ' → ' + WALLET[t.tujuan] : (WALLET[t.sumber] || '-');
      li.innerHTML = '<span class="tx__tag"></span><span class="tx__cat"></span><span class="tx__amt"></span>' +
        '<span class="tx__meta"><span class="m-src"></span><span class="m-date"></span><span class="m-note"></span></span>' +
        '<span class="tx__act"><button type="button" class="link" data-a="edit">Edit</button><button type="button" class="link link--del" data-a="del">Hapus</button></span>';
      li.querySelector('.tx__tag').textContent = TYPE_LABEL[g];
      li.querySelector('.tx__cat').textContent = t.kategori;
      li.querySelector('.tx__amt').textContent = sign + Fmt.rp(t.nominal);
      li.querySelector('.m-src').textContent = src;
      li.querySelector('.m-date').textContent = Fmt.date(t.tanggal) + ' · ' + t.waktu;
      li.querySelector('.m-note').textContent = t.keterangan || '';
      li.dataset.id = t.id;
      ul.appendChild(li);
    });
  }

  function renderCategoryFilter() {
    const cats = [...new Set(State.txs.map((t) => t.kategori))].sort();
    const sel = $('filterCat'), cur = State.cat;
    sel.innerHTML = '<option value="">Semua kategori</option>';
    cats.forEach((c) => { const o = document.createElement('option'); o.value = o.textContent = c; sel.appendChild(o); });
    sel.value = cats.includes(cur) ? cur : '';
    State.cat = sel.value;
  }
  const refresh = () => { renderSummary(); renderCategoryFilter(); renderList(); };

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

  /* ---------- Form tambah / edit ---------- */
  const Form = {
    type: 'INCOME', editing: null,
    open(tx) {
      this.editing = tx || null;
      $('formTitle').textContent = tx ? 'Edit transaksi' : 'Tambah transaksi';
      $('formError').textContent = '';
      const now = new Date();
      this.setType(tx ? tx.tipe : 'INCOME');
      // Jenis dikunci saat edit agar transaksi tidak berubah kelompok.
      document.querySelectorAll('#typeTabs button').forEach((b) => { b.disabled = !!tx && b.dataset.type !== this.type; });
      $('fKategori').value = tx && tx.tipe !== 'TRANSFER' ? tx.kategori : $('fKategori').options[0]?.value;
      $('fSumber').value = tx ? tx.sumber : 'CASH';
      $('fArah').value = tx && tx.tipe === 'TRANSFER' ? tx.sumber + '>' + tx.tujuan : 'CASH>EWALLET';
      $('fNominal').value = tx ? String(tx.nominal) : '';
      $('fTanggal').value = tx ? tx.tanggal : Fmt.key(now);
      $('fWaktu').value = tx ? tx.waktu : Fmt.time(now);
      $('fKet').value = tx ? tx.keterangan : '';
      $('formDialog').showModal();
    },
    setType(type) {
      this.type = type;
      document.querySelectorAll('#typeTabs button').forEach((b) => {
        const on = b.dataset.type === type;
        b.classList.toggle('is-active', on);
        if (on) b.style.setProperty('--tc', TYPE_COLOR[type]);
      });
      const isT = type === 'TRANSFER';
      $('rowKategori').hidden = isT; $('rowSumber').hidden = isT; $('rowArah').hidden = !isT;
      const sel = $('fKategori'); sel.innerHTML = '';
      (CATEGORIES[type] || []).forEach((c) => { const o = document.createElement('option'); o.value = o.textContent = c; sel.appendChild(o); });
    },
    read() {
      const isT = this.type === 'TRANSFER';
      const [from, to] = $('fArah').value.split('>');
      return {
        id: this.editing ? this.editing.id : null,
        tipe: this.type,
        kategori: isT ? 'Transfer' : $('fKategori').value,
        nominal: Number($('fNominal').value.replace(/\D/g, '')),
        sumber: isT ? from : $('fSumber').value,
        tujuan: isT ? to : undefined,
        tanggal: $('fTanggal').value,
        waktu: $('fWaktu').value,
        keterangan: $('fKet').value.trim(),
      };
    },
    validate(t) {
      if (!t.nominal || t.nominal <= 0) return 'Nominal harus lebih dari 0.';
      if (!t.tanggal) return 'Tanggal wajib diisi.';
      if (!t.waktu) return 'Waktu wajib diisi.';
      if (t.tipe !== 'TRANSFER' && !t.kategori) return 'Pilih kategori.';
      // Saldo tidak boleh minus setelah transaksi ini.
      const w = wallets([...State.txs.filter((x) => x.id !== t.id), t]);
      if (w.CASH < 0 || w.EWALLET < 0) return 'Saldo ' + (w.CASH < 0 ? 'Tunai' : 'E-Wallet') + ' tidak cukup untuk transaksi ini.';
      return '';
    },
    async submit(e) {
      e.preventDefault();
      const t = this.read(), err = this.validate(t);
      $('formError').textContent = err;
      if (err) return;
      $('saveBtn').disabled = true;
      try {
        const saved = t.id ? await TxService.edit(t) : await TxService.add(t);
        State.txs = await TxService.list();
        refresh();
        $('formDialog').close();
        toast(t.id ? 'Transaksi diperbarui' : 'Transaksi ditambahkan');
        void saved;
      } catch (ex) { $('formError').textContent = ex.message || 'Gagal menyimpan.'; }
      finally { $('saveBtn').disabled = false; }
    },
  };

  /* ---------- Hapus ---------- */
  const Confirm = {
    id: null,
    open(tx) { this.id = tx.id; $('confirmText').textContent = tx.kategori + ' · ' + Fmt.rp(tx.nominal) + ' · ' + Fmt.date(tx.tanggal) + '. Tindakan ini tidak bisa dibatalkan.'; $('confirmDialog').showModal(); },
    async yes() {
      // Cegah saldo minus akibat menghapus pemasukan.
      const w = wallets(State.txs.filter((x) => x.id !== this.id));
      if (w.CASH < 0 || w.EWALLET < 0) { $('confirmDialog').close(); toast('Tidak bisa dihapus: saldo akan menjadi minus.'); return; }
      try { await TxService.remove(this.id); State.txs = await TxService.list(); refresh(); toast('Transaksi dihapus'); }
      catch (ex) { toast(ex.message || 'Gagal menghapus.'); }
      $('confirmDialog').close();
    },
  };

  /* ---------- Export PDF ---------- */
  const Export = {
    range(kind) {
      const now = new Date(), end = Fmt.key(now);
      if (kind === 'month') return { from: end.slice(0, 8) + '01', to: end, label: 'Bulan ini' };
      if (kind === '30d') { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: Fmt.key(d), to: end, label: '30 hari terakhir' }; }
      if (kind === 'custom') return { from: $('xFrom').value, to: $('xTo').value, label: 'Rentang tanggal' };
      return { from: '0000-01-01', to: '9999-12-31', label: 'Semua' };
    },
    buildReport(kind) {
      const r = this.range(kind);
      const rows = sorted(State.txs).filter((t) => t.tanggal >= r.from && t.tanggal <= r.to);
      const inPeriod = wallets(rows);
      return { period: r, rows, income: inPeriod.income, expense: inPeriod.expense, totalAll: wallets(State.txs).total };
    },
    // Ganti fungsi ini bila nanti memakai library PDF; struktur report tetap sama.
    toPdf(report) {
      const p = $('printArea'); p.textContent = '';
      const h = document.createElement('h1'); h.textContent = 'Laporan Keuangan'; p.appendChild(h);
      const per = report.period.from.startsWith('0000') ? 'Semua waktu' : Fmt.date(report.period.from) + ' – ' + Fmt.date(report.period.to);
      [['Periode', per], ['Total pemasukan', Fmt.rp(report.income)], ['Total pengeluaran', Fmt.rp(report.expense)], ['Total keuangan saat ini', Fmt.rp(report.totalAll)]]
        .forEach(([k, v]) => { const el = document.createElement('p'); el.textContent = k + ': ' + v; p.appendChild(el); });
      const tb = document.createElement('table');
      tb.innerHTML = '<thead><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Sumber</th><th class="n">Nominal</th></tr></thead><tbody></tbody>';
      report.rows.forEach((t) => {
        const tr = document.createElement('tr');
        const src = t.tipe === 'TRANSFER' ? WALLET[t.sumber] + ' → ' + WALLET[t.tujuan] : WALLET[t.sumber];
        [Fmt.date(t.tanggal) + ' ' + t.waktu, TYPE_LABEL[groupOf(t.tipe)], t.kategori, src, Fmt.rp(t.nominal)].forEach((v, i) => { const td = document.createElement('td'); if (i === 4) td.className = 'n'; td.textContent = v; tr.appendChild(td); });
        tb.tBodies[0].appendChild(tr);
      });
      p.appendChild(tb);
      window.print();
    },
    go() {
      const kind = $('xPeriod').value;
      if (kind === 'custom' && (!$('xFrom').value || !$('xTo').value || $('xFrom').value > $('xTo').value)) { toast('Isi rentang tanggal dengan benar.'); return; }
      const report = this.buildReport(kind);
      if (!report.rows.length) { toast('Tidak ada transaksi pada periode ini.'); return; }
      $('exportDialog').close();
      this.toPdf(report);
    },
  };

  /* ---------- Event ---------- */
  function bind() {
    $('addBtn').addEventListener('click', () => Form.open());
    $('typeTabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && !b.disabled) Form.setType(b.dataset.type); });
    $('quick').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) $('fNominal').value = b.dataset.v; });
    $('fNominal').addEventListener('input', (e) => { const d = e.target.value.replace(/\D/g, ''); e.target.value = d ? Number(d).toLocaleString('id-ID') : ''; });
    $('txForm').addEventListener('submit', (e) => Form.submit(e));
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
    $('confirmYes').addEventListener('click', () => Confirm.yes());

    $('list').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-a]'); if (!b) return;
      const tx = State.txs.find((t) => t.id === b.closest('.tx').dataset.id); if (!tx) return;
      if (b.dataset.a === 'edit') {
        if (groupOf(tx.tipe) === 'WISHLIST') { toast('Aktivitas wishlist dikelola di halaman Wishlist.'); return; }
        Form.open(tx);
      } else Confirm.open(tx);
    });

    $('search').addEventListener('input', (e) => { State.search = e.target.value; renderList(); });
    $('filterCat').addEventListener('change', (e) => { State.cat = e.target.value; renderList(); });
    $('chips').addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      State.type = b.dataset.type;
      document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === b));
      renderList();
    });

    $('exportBtn').addEventListener('click', () => $('exportDialog').showModal());
    $('xPeriod').addEventListener('change', (e) => { $('xCustom').hidden = e.target.value !== 'custom'; });
    $('xGo').addEventListener('click', () => Export.go());
  }

  async function init() {
    bind();
    try { State.txs = await TxService.list(); refresh(); }
    catch (ex) { $('list').innerHTML = '<li class="empty">Gagal memuat transaksi. Muat ulang halaman.</li>'; }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
